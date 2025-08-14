import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

interface DomainStackProps extends cdk.StackProps {
  loadBalancer: elbv2.IApplicationLoadBalancer;
  httpsListener: elbv2.IApplicationListener;
  domainName: string;
  subDomain: string;
}

export class DomainStack extends cdk.Stack {
  public readonly certificate: acm.ICertificate;
  public readonly apiDomainName: string;

  constructor(scope: Construct, id: string, props: DomainStackProps) {
    super(scope, id, props);

    // Construct the full domain name for the API
    this.apiDomainName = `${props.subDomain}.${props.domainName}`;

    // Look up the hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, 'TapsHostedZone', {
      domainName: props.domainName,
    });

    // Create a certificate for the domain
    this.certificate = new acm.Certificate(this, 'TapsCertificate', {
      domainName: this.apiDomainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // Add the certificate to the HTTPS listener
    props.httpsListener.addCertificates('TapsCertificates', [this.certificate]);

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

    // Output the certificate ARN
    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'The ARN of the certificate',
      exportName: 'TapsCertificateArn',
    });
  }
}
