import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
}

export class DatabaseStack extends cdk.Stack {
  public readonly postgresInstance: rds.DatabaseInstance;
  public readonly databaseSecret: secretsmanager.Secret;
  public readonly djangoSecret: secretsmanager.Secret;
  public readonly databaseName: string = 'tapsdb';

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    // Create a secret for the database credentials
    this.databaseSecret = new secretsmanager.Secret(this, 'TapsDatabaseSecret', {
      secretName: 'taps/database/credentials',
      description: 'Credentials for Taps PostgreSQL database',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'tapsadmin' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 16,
        requireEachIncludedType: true
      },
    });

    // Create Django secret key
    this.djangoSecret = new secretsmanager.Secret(this, 'DjangoSecretKey', {
      secretName: 'taps/django/secret-key',
      description: 'Django secret key for Taps application',
      generateSecretString: {
        secretStringTemplate: '{}',
        generateStringKey: 'SECRET_KEY',
        excludeCharacters: '"@/\\\'',
        passwordLength: 50,
      },
    });

    // Create a parameter group for PostgreSQL
    const parameterGroup = new rds.ParameterGroup(this, 'TapsParameterGroup', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      description: 'Parameter group for Taps PostgreSQL database',
      parameters: {
        'max_connections': '100',
        'shared_buffers': '16MB',
      },
    });

    // Create a subnet group for RDS
    const subnetGroup = new rds.SubnetGroup(this, 'TapsSubnetGroup', {
      description: 'Subnet group for Taps PostgreSQL database',
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    // Create the RDS PostgreSQL instance
    this.postgresInstance = new rds.DatabaseInstance(this, 'TapsDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.SMALL
      ),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [props.securityGroup],
      subnetGroup: subnetGroup,
      parameterGroup: parameterGroup,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      storageType: rds.StorageType.GP2,
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: true,
      deletionProtection: true, // Enable for production data safety
      databaseName: this.databaseName,
      credentials: rds.Credentials.fromSecret(this.databaseSecret),
      multiAz: true, // Enable for production high availability
      autoMinorVersionUpgrade: true,
      publiclyAccessible: false,
    });

    // Output the database endpoint
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.postgresInstance.dbInstanceEndpointAddress,
      description: 'The endpoint of the database',
      exportName: 'TapsDatabaseEndpoint',
    });

    // Output the database port
    new cdk.CfnOutput(this, 'DatabasePort', {
      value: this.postgresInstance.dbInstanceEndpointPort,
      description: 'The port of the database',
      exportName: 'TapsDatabasePort',
    });

    // Output the database secret ARN
    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.databaseSecret.secretArn,
      description: 'The ARN of the database secret',
      exportName: 'TapsDatabaseSecretArn',
    });
  }
}
