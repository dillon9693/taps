import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

interface DomainStackProps extends cdk.StackProps {
  loadBalancer: elbv2.IApplicationLoadBalancer;
  domainName: string;
  subDomain: string;
}

export class DomainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DomainStackProps) {
    super(scope, id, props);

    // Look up the hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, "TapsHostedZone", {
      domainName: props.domainName,
    });

    // Create a DNS record for the API
    new route53.ARecord(this, "TapsApiRecord", {
      zone: hostedZone,
      recordName: props.subDomain,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.LoadBalancerTarget(props.loadBalancer),
      ),
    });
  }
}
