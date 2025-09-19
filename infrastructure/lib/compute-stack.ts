import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as logs from "aws-cdk-lib/aws-logs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { Environment } from "./environment";

interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  ecsSecurityGroup: ec2.SecurityGroup;
  albSecurityGroup: ec2.SecurityGroup;
  databaseSecret: secretsmanager.Secret;
  djangoSecret: secretsmanager.Secret;
  databaseEndpoint: string;
  databasePort: string;
  databaseName: string;
  databaseUser: string;
  domainName: string;
  apiSubDomain: string;
  environment: Environment;
}

export class ComputeStack extends cdk.Stack {
  public readonly loadBalancer: elbv2.IApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const envLowercase = props.environment.toLowerCase();

    // Create ECR Repository for Docker images
    const ecrRepository = new ecr.Repository(this, "TapsRepository", {
      repositoryName: `taps-backend-${envLowercase}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          maxImageCount: 5,
          description: "Only keep the 5 most recent images",
        },
      ],
    });

    // Construct the full domain name for the API
    const apiDomainName = `${props.apiSubDomain}.${props.domainName}`;

    // Look up the hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, "TapsHostedZone", {
      domainName: props.domainName,
    });

    // Create a certificate for the domain
    const domainCertificate = new acm.Certificate(this, "TapsCertificate", {
      domainName: apiDomainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // Create ECS Cluster with predictable name
    const clusterName = `taps-${envLowercase}-cluster`;
    const cluster = new ecs.Cluster(this, "TapsCluster", {
      clusterName: clusterName,
      vpc: props.vpc,
      containerInsights: false, // Disabled to reduce CloudWatch costs
    });

    // Create Task Execution Role
    const executionRole = new iam.Role(this, "TapsTaskExecutionRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonECSTaskExecutionRolePolicy",
        ),
      ],
    });

    // Grant access to the database secret
    props.databaseSecret.grantRead(executionRole);

    // Grant access to the Django secret
    props.djangoSecret.grantRead(executionRole);

    // Create Task Role
    const taskRole = new iam.Role(this, "TapsTaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // Create CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, "TapsLogGroup", {
      logGroupName: `/ecs/taps-backend-${envLowercase}`,
      retention: logs.RetentionDays.THREE_DAYS, // Reduced from ONE_WEEK to save costs
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TapsTaskDefinition",
      {
        memoryLimitMiB: 256, // Reduced from 512 to save costs
        cpu: 128, // Reduced from 256 to minimum Fargate CPU
        executionRole: executionRole,
        taskRole: taskRole,
      },
    );

    // Determine image tag based on environment
    const imageTag =
      props.environment === Environment.PRODUCTION
        ? "latest"
        : `${envLowercase}-latest`;
    // Add Container to Task Definition
    const container = taskDefinition.addContainer("TapsContainer", {
      image: ecs.ContainerImage.fromEcrRepository(ecrRepository, imageTag),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "taps",
        logGroup: logGroup,
      }),
      environment: {
        DJANGO_SETTINGS_MODULE: "taps_backend.production_settings",
        DATABASE_HOST: props.databaseEndpoint,
        DATABASE_PORT: props.databasePort,
        DATABASE_NAME: props.databaseName,
        DATABASE_USER: props.databaseUser,
        VPC_CIDR: props.vpc.vpcCidrBlock, // Used to restrict Django ALLOWED_HOSTS to our VPC only
      },
      secrets: {
        DATABASE_PASSWORD: ecs.Secret.fromSecretsManager(
          props.databaseSecret,
          "password",
        ),
        SECRET_KEY: ecs.Secret.fromSecretsManager(
          props.djangoSecret,
          "SECRET_KEY",
        ),
      },
      healthCheck: {
        command: [
          "CMD-SHELL",
          "curl -f http://localhost:8000/taps/health/ || exit 1",
        ],
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
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, "TapsALB", {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: props.albSecurityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // Create Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(
      this,
      "TapsTargetGroup",
      {
        vpc: props.vpc,
        port: 8000,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targetType: elbv2.TargetType.IP,
        healthCheck: {
          path: "/taps/health/",
          interval: cdk.Duration.seconds(60),
          timeout: cdk.Duration.seconds(5),
          healthyHttpCodes: "200",
        },
      },
    );

    // Create HTTP Listener
    this.loadBalancer.addListener("TapsHttpListener", {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.redirect({
        port: "443",
        protocol: "HTTPS",
        permanent: true,
      }),
    });

    // Create HTTPS Listener with SSL certificate
    this.loadBalancer.addListener("TapsHttpsListener", {
      port: 443,
      open: true,
      defaultTargetGroups: [targetGroup],
      certificates: [domainCertificate],
    });

    // Create ECS Service - start with 0 tasks until Docker image is available
    const serviceName = `taps-${envLowercase}-service`;
    const service = new ecs.FargateService(this, "TapsService", {
      serviceName: serviceName,
      cluster: cluster,
      taskDefinition: taskDefinition,
      desiredCount: 0,
      securityGroups: [props.ecsSecurityGroup],
      assignPublicIp: false,
      vpcSubnets: { subnetGroupName: "private" }, // Use existing private subnets (now isolated)
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    // Add Auto Scaling - reduced capacity for cost optimization
    const scaling = service.autoScaleTaskCount({
      minCapacity: 0, // Allow scaling to zero during low traffic
      maxCapacity: 1, // Reduced max capacity to control costs
    });

    scaling.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    scaling.scaleOnMemoryUtilization("MemoryScaling", {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Add service as target to target group
    targetGroup.addTarget(service);

    // Create Migration Task Definition
    const migrationTaskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TapsMigrationTaskDefinition",
      {
        memoryLimitMiB: 256, // Reduced from 512 to match main task
        cpu: 128, // Reduced from 256 to match main task
        executionRole: executionRole,
        taskRole: taskRole,
      },
    );

    // Add Migration Container to Task Definition
    migrationTaskDefinition.addContainer("TapsMigrationContainer", {
      image: ecs.ContainerImage.fromEcrRepository(ecrRepository, imageTag),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "taps-migration",
        logGroup: logGroup,
      }),
      environment: {
        DJANGO_SETTINGS_MODULE: "taps_backend.production_settings",
        DATABASE_HOST: props.databaseEndpoint,
        DATABASE_PORT: props.databasePort,
        DATABASE_NAME: props.databaseName,
        DATABASE_USER: props.databaseUser,
      },
      secrets: {
        DATABASE_PASSWORD: ecs.Secret.fromSecretsManager(
          props.databaseSecret,
          "password",
        ),
        SECRET_KEY: ecs.Secret.fromSecretsManager(
          props.djangoSecret,
          "SECRET_KEY",
        ),
      },
      // Override the default command to run migrations
      command: ["poetry", "run", "python", "manage.py", "migrate", "--noinput"],
    });

    // Output migration task definition family name for GitHub Actions
    new cdk.CfnOutput(this, "MigrationTaskFamily", {
      value: migrationTaskDefinition.family,
      description: "ECS task definition family for migrations",
    });

    // Output network configuration for migration tasks
    new cdk.CfnOutput(this, "ECSSubnets", {
      value: props.vpc.privateSubnets
        .map((subnet) => subnet.subnetId)
        .join(","),
      description: "Private subnet IDs for ECS tasks",
    });

    new cdk.CfnOutput(this, "ECSSecurityGroup", {
      value: props.ecsSecurityGroup.securityGroupId,
      description: "Security group ID for ECS tasks",
    });
  }
}
