import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

interface DomainStackProps extends cdk.StackProps {
  loadBalancer: elbv2.IApplicationLoadBalancer;
  domainName: string;
  subDomain: string;
}

export class DomainStack extends cdk.Stack {
  public readonly apiDomainName: string;

  constructor(scope: Construct, id: string, props: DomainStackProps) {
    super(scope, id, props);

    // Construct the full domain name for the API
    this.apiDomainName = `${props.subDomain}.${props.domainName}`;

    // Look up the hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, 'TapsHostedZone', {
      domainName: props.domainName,
    });

    // Certificate is now created in the compute stack

    // Create a DNS record for the API
    new route53.ARecord(this, 'TapsApiRecord', {
      zone: hostedZone,
      recordName: props.subDomain,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.LoadBalancerTarget(props.loadBalancer)
      ),
    });

    // Output the API domain name
    new cdk.CfnOutput(this, 'ApiDomainName', {
      value: this.apiDomainName,
      description: 'The domain name of the API',
      exportName: 'TapsApiDomainName',
    });

    // Certificate ARN is now output from the compute stack
  }
}
