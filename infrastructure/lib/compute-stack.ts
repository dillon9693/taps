import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export enum Environment {
  STAGING = 'Staging',
  PRODUCTION = 'Production'
}

interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  ecsSecurityGroup: ec2.SecurityGroup;
  albSecurityGroup: ec2.SecurityGroup;
  databaseSecret: secretsmanager.Secret;
  djangoSecret: secretsmanager.Secret;
  databaseEndpoint: string;
  databasePort: string;
  databaseName: string;
  domainName: string;
  apiSubDomain: string;
  environment: Environment;
}

export class ComputeStack extends cdk.Stack {
  public readonly loadBalancerDnsName: string;
  public readonly ecrRepository: ecr.Repository;
  public readonly loadBalancer: elbv2.IApplicationLoadBalancer;
  public readonly httpsListener: elbv2.IApplicationListener;
  public readonly certificate: acm.ICertificate;
  public readonly apiDomainName: string;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    // Create ECR Repository for Docker images
    this.ecrRepository = new ecr.Repository(this, 'TapsRepository', {
      repositoryName: 'taps-backend',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          maxImageCount: 5,
          description: 'Only keep the 5 most recent images',
        },
      ],
    });

    // Construct the full domain name for the API
    this.apiDomainName = `${props.apiSubDomain}.${props.domainName}`;

    // Look up the hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, 'TapsHostedZone', {
      domainName: props.domainName,
    });

    // Create a certificate for the domain
    this.certificate = new acm.Certificate(this, 'TapsCertificate', {
      domainName: this.apiDomainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // Create ECS Cluster with predictable name
    const clusterName = props.environment === Environment.STAGING ? 'taps-staging-cluster' : 'taps-production-cluster';
    const cluster = new ecs.Cluster(this, 'TapsCluster', {
      clusterName: clusterName,
      vpc: props.vpc,
      containerInsights: true,
    });

    // Create Task Execution Role
    const executionRole = new iam.Role(this, 'TapsTaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Grant access to the database secret
    props.databaseSecret.grantRead(executionRole);
    
    // Grant access to the Django secret
    props.djangoSecret.grantRead(executionRole);

    // Create Task Role
    const taskRole = new iam.Role(this, 'TapsTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Create CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'TapsLogGroup', {
      logGroupName: '/ecs/taps-backend',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TapsTaskDefinition', {
      memoryLimitMiB: 1024,
      cpu: 512,
      executionRole: executionRole,
      taskRole: taskRole,
    });

    // Determine image tag based on environment
    const imageTag = props.environment === Environment.STAGING ? 'staging-latest' : 'latest';
    
    // Add Container to Task Definition
    const container = taskDefinition.addContainer('TapsContainer', {
      image: ecs.ContainerImage.fromEcrRepository(this.ecrRepository, imageTag),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'taps',
        logGroup: logGroup,
      }),
      environment: {
        'DJANGO_SETTINGS_MODULE': 'taps_backend.production_settings',
      },
      secrets: {
        'DATABASE_URL': ecs.Secret.fromSecretsManager(
          props.databaseSecret,
          'password'
        ),
        'SECRET_KEY': ecs.Secret.fromSecretsManager(
          props.djangoSecret,
          'SECRET_KEY'
        ),
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:8000/health/ || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    // Add port mapping
    container.addPortMappings({
      containerPort: 8000,
      hostPort: 8000,
      protocol: ecs.Protocol.TCP,
    });

    // Create Application Load Balancer
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'TapsALB', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: props.albSecurityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // Create Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TapsTargetGroup', {
      vpc: props.vpc,
      port: 8000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/health/',
        interval: cdk.Duration.seconds(60),
        timeout: cdk.Duration.seconds(5),
        healthyHttpCodes: '200',
      },
    });

    // Create HTTP Listener
    const httpListener = this.loadBalancer.addListener('TapsHttpListener', {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.redirect({
        port: '443',
        protocol: 'HTTPS',
        permanent: true,
      }),
    });

    // Create HTTPS Listener with SSL certificate
    this.httpsListener = this.loadBalancer.addListener('TapsHttpsListener', {
      port: 443,
      open: true,
      defaultTargetGroups: [targetGroup],
      certificates: [this.certificate],
    });

    // Create ECS Service - start with 0 tasks until Docker image is available
    const serviceName = props.environment === Environment.STAGING ? 'taps-staging-service' : 'taps-production-service';
    const service = new ecs.FargateService(this, 'TapsService', {
      serviceName: serviceName,
      cluster: cluster,
      taskDefinition: taskDefinition,
      desiredCount: 0,
      securityGroups: [props.ecsSecurityGroup],
      assignPublicIp: false,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    // Add Auto Scaling
    const scaling = service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 10,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Add service as target to target group
    targetGroup.addTarget(service);

    // Store the load balancer DNS name
    this.loadBalancerDnsName = this.loadBalancer.loadBalancerDnsName;

    // Output the load balancer DNS name
    new cdk.CfnOutput(this, 'LoadBalancerDnsName', {
      value: this.loadBalancer.loadBalancerDnsName,
      description: 'The DNS name of the load balancer',
      exportName: 'TapsLoadBalancerDnsName',
    });

    // Output the ECR repository URI
    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: this.ecrRepository.repositoryUri,
      description: 'The URI of the ECR repository',
      exportName: 'TapsEcrRepositoryUri',
    });

    // Output the API domain name
    new cdk.CfnOutput(this, 'ApiDomainName', {
      value: this.apiDomainName,
      description: 'The domain name of the API',
      exportName: 'TapsApiDomainName',
    });

    // Output the certificate ARN
    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'The ARN of the certificate',
      exportName: 'TapsCertificateArn',
    });
  }
}
