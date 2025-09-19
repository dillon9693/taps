import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { Environment } from "./environment";

interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
  environment: Environment;
}

export class DatabaseStack extends cdk.Stack {
  public readonly postgresInstance: rds.DatabaseInstance;
  public readonly databaseSecret: secretsmanager.Secret;
  public readonly djangoSecret: secretsmanager.Secret;
  public readonly databaseName;
  public readonly databaseUser: string = "tapsadmin";

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const envLowercase = props.environment.toLowerCase();

    const nameWithEnv = `taps-${envLowercase}`;
    const envDescriptionSuffix = `for ${props.environment} environment`;

    this.databaseName = `tabsdb${envLowercase}`;

    // Create a secret for the database credentials
    this.databaseSecret = new secretsmanager.Secret(
      this,
      "TapsDatabaseSecret",
      {
        secretName: `${nameWithEnv}/database/credentials`,
        description: `Credentials for Taps PostgreSQL database ${envDescriptionSuffix}`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ username: this.databaseUser }),
          generateStringKey: "password",
          excludePunctuation: true,
          includeSpace: false,
          passwordLength: 16,
          requireEachIncludedType: true,
        },
      },
    );

    // Create Django secret key
    this.djangoSecret = new secretsmanager.Secret(this, "DjangoSecretKey", {
      secretName: `${nameWithEnv}/django/secret-key`,
      description: `Django secret key for Taps application ${envDescriptionSuffix}`,
      generateSecretString: {
        secretStringTemplate: "{}",
        generateStringKey: "SECRET_KEY",
        excludeCharacters: "\"@/\\'",
        passwordLength: 50,
      },
    });

    // Create a parameter group for PostgreSQL
    const parameterGroup = new rds.ParameterGroup(this, "TapsParameterGroup", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      description: `Parameter group for Taps PostgreSQL database ${envDescriptionSuffix}`,
      parameters: {
        max_connections: "100",
        shared_buffers: "2048", // In 8KB pages, so 2048 * 8KB = 16MB
      },
    });

    // Create a subnet group for RDS
    const subnetGroup = new rds.SubnetGroup(this, "TapsSubnetGroup", {
      description: `Subnet group for Taps PostgreSQL database  ${envDescriptionSuffix}`,
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    // Create the RDS PostgreSQL instance
    this.postgresInstance = new rds.DatabaseInstance(this, "TapsDatabase", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO,
      ),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [props.securityGroup],
      subnetGroup: subnetGroup,
      parameterGroup: parameterGroup,
      allocatedStorage: 10, // Reduced from 20GB to minimize costs
      storageType: rds.StorageType.GP3, // GP3 is more cost-effective than GP2
      backupRetention: cdk.Duration.days(1),
      deleteAutomatedBackups: true,
      deletionProtection: true, // Enable for production data safety
      databaseName: this.databaseName,
      credentials: rds.Credentials.fromSecret(this.databaseSecret),
      multiAz: false,
      autoMinorVersionUpgrade: true,
      publiclyAccessible: false,
    });
  }
}
