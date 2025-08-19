#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { DatabaseStack } from '../lib/database-stack';
import { ComputeStack, Environment } from '../lib/compute-stack';
import { DomainStack } from '../lib/domain-stack';

/**
 * Interface for environment configuration
 */
interface EnvironmentConfig {
  // name: string;
  environmentName: Environment;
  account: string;
  region: string;
  domainName: string;
  apiSubDomain: string;
}

/**
 * Create infrastructure stacks for a specific environment
 */
function createEnvironment(app: cdk.App, config: EnvironmentConfig) {
  const env = { account: config.account, region: config.region };
  const envName = config.environmentName.toLowerCase();
  const prefix = `taps-${envName}`;

  // Common tags for all stacks
  const tags = {
    Project: "Taps",
    Environment: config.environmentName,
    ManagedBy: "CDK",
  };

  // Create the network stack
  const networkStack = new NetworkStack(app, `${prefix}-network`, {
    stackName: `${prefix}-network`,
    description: `Network infrastructure for Taps ${config.environmentName} environment`,
    env,
    tags,
  });

  // Create the database stack
  const databaseStack = new DatabaseStack(app, `${prefix}-database`, {
    stackName: `${prefix}-database`,
    description: `Database infrastructure for Taps ${config.environmentName} environment`,
    vpc: networkStack.vpc,
    securityGroup: networkStack.rdsSecurityGroup,
    env,
    tags,
  });

  // Create the compute stack
  const computeStack = new ComputeStack(app, `${prefix}-compute`, {
    stackName: `${prefix}-compute`,
    description: `Compute infrastructure for Taps ${config.environmentName} environment`,
    vpc: networkStack.vpc,
    ecsSecurityGroup: networkStack.ecsSecurityGroup,
    albSecurityGroup: networkStack.albSecurityGroup,
    databaseSecret: databaseStack.databaseSecret,
    djangoSecret: databaseStack.djangoSecret,
    databaseEndpoint: databaseStack.postgresInstance.dbInstanceEndpointAddress,
    databasePort: databaseStack.postgresInstance.dbInstanceEndpointPort,
    databaseName: databaseStack.databaseName,
    databaseUser: databaseStack.databaseUser,
    domainName: config.domainName,
    apiSubDomain: config.apiSubDomain,
    environment: config.environmentName,
    env,
    tags,
  });

  // Create the domain stack
  const domainStack = new DomainStack(app, `${prefix}-domain`, {
    stackName: `${prefix}-domain`,
    description: `Domain infrastructure for Taps ${config.environmentName} environment`,
    loadBalancer: computeStack.loadBalancer,
    domainName: config.domainName,
    subDomain: config.apiSubDomain,
    env,
    tags,
  });

  // Add dependencies
  databaseStack.addDependency(networkStack);
  computeStack.addDependency(databaseStack);
  domainStack.addDependency(computeStack);

  return {
    networkStack,
    databaseStack,
    computeStack,
    domainStack,
  };
}

// Initialize the CDK app
const app = new cdk.App();

// Get environment variables - CDK sets these automatically when AWS credentials are configured
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || 'us-east-1';

if (!account) {
  throw new Error('CDK_DEFAULT_ACCOUNT not set. Ensure AWS credentials are properly configured.');
}

// Create the staging environment
createEnvironment(app, {
  environmentName: Environment.STAGING,
  account,
  region,
  domainName: "dillonkerr.com",
  apiSubDomain: "api.staging.taps",
});

// Create the production environment
createEnvironment(app, {
  environmentName: Environment.PRODUCTION,
  account,
  region,
  domainName: "dillonkerr.com",
  apiSubDomain: "api.taps",
});

// Synthesize the CloudFormation template
app.synth();
