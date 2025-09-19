import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly ecsSecurityGroup: ec2.SecurityGroup;
  public readonly rdsSecurityGroup: ec2.SecurityGroup;
  public readonly albSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC with public and private subnets across 2 AZs
    this.vpc = new ec2.Vpc(this, "TapsVPC", {
      maxAzs: 2,
      natGateways: 0, // Remove NAT Gateway to save ~$45-60/month
      subnetConfiguration: [
        {
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "private",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED, // Changed from PRIVATE_WITH_EGRESS to avoid NAT dependency
          cidrMask: 24,
        },
        {
          name: "isolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // Create security group for the Application Load Balancer
    this.albSecurityGroup = new ec2.SecurityGroup(this, "ALBSecurityGroup", {
      vpc: this.vpc,
      description: "Security group for the Application Load Balancer",
      allowAllOutbound: true,
    });

    // Allow HTTP and HTTPS traffic from anywhere to the ALB
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allow HTTP traffic from anywhere",
    );
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allow HTTPS traffic from anywhere",
    );

    // Create security group for ECS Fargate tasks
    this.ecsSecurityGroup = new ec2.SecurityGroup(this, "ECSSecurityGroup", {
      vpc: this.vpc,
      description: "Security group for ECS Fargate tasks",
      allowAllOutbound: true,
    });

    // Allow traffic from ALB to ECS on port 8000 (Django)
    this.ecsSecurityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcp(8000),
      "Allow traffic from ALB to ECS on port 8000",
    );

    // Create security group for RDS
    this.rdsSecurityGroup = new ec2.SecurityGroup(this, "RDSSecurityGroup", {
      vpc: this.vpc,
      description: "Security group for RDS PostgreSQL",
      allowAllOutbound: false,
    });

    // Allow traffic from ECS to RDS on port 5432 (PostgreSQL)
    this.rdsSecurityGroup.addIngressRule(
      this.ecsSecurityGroup,
      ec2.Port.tcp(5432),
      "Allow traffic from ECS to RDS on port 5432",
    );

    // Add VPC Endpoints to replace NAT Gateway functionality
    // Create a security group specifically for VPC endpoints
    const vpcEndpointSecurityGroup = new ec2.SecurityGroup(this, "VPCEndpointSecurityGroup", {
      vpc: this.vpc,
      description: "Security group for VPC endpoints",
      allowAllOutbound: false,
    });

    // Allow HTTPS traffic from ECS to VPC endpoints
    vpcEndpointSecurityGroup.addIngressRule(
      this.ecsSecurityGroup,
      ec2.Port.tcp(443),
      "Allow HTTPS traffic from ECS to VPC endpoints",
    );

    // ECR API endpoint for pulling container images
    this.vpc.addInterfaceEndpoint("ECREndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [vpcEndpointSecurityGroup],
    });

    // ECR Docker endpoint for pulling container layers
    this.vpc.addInterfaceEndpoint("ECRDockerEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [vpcEndpointSecurityGroup],
    });

    // CloudWatch Logs endpoint for logging
    this.vpc.addInterfaceEndpoint("CloudWatchLogsEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [vpcEndpointSecurityGroup],
    });

    // Secrets Manager endpoint for accessing database credentials
    this.vpc.addInterfaceEndpoint("SecretsManagerEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [vpcEndpointSecurityGroup],
    });

    // S3 Gateway endpoint for ECR image layers (more cost-effective than interface endpoint)
    this.vpc.addGatewayEndpoint("S3Endpoint", {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }],
    });
  }
}
