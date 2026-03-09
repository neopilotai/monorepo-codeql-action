/**
 * CloudFormation Security Queries
 * 
 * Detects security vulnerabilities in AWS CloudFormation templates
 */

import codeql.cloudformation
import IaCModels

/**
 * CloudFormation: S3 Bucket Public
 * Detect S3 buckets with public access
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::S3::Bucket") and
  exists(CfValue acl |
    resource.getProperty("Properties").(CfObject).getProperty("AccessControl").getValue() = acl |
    acl.(CfString).getValue() = "PublicRead"
  )
select resource, "S3 bucket is publicly accessible"

/**
 * CloudFormation: S3 Bucket Without Encryption
 * Detect S3 buckets without server-side encryption
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::S3::Bucket") and
  not exists(CfValue enc |
    resource.getProperty("Properties").(CfObject).getProperty("BucketEncryption").getValue() = enc
  )
select resource, "S3 bucket does not have encryption enabled"

/**
 * CloudFormation: Security Group Open to Internet
 * Detect security groups with 0.0.0.0/0
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::EC2::SecurityGroupIngressRule") and
  exists(CfValue cidr |
    resource.getProperty("Properties").(CfObject).getProperty("CidrIpv4").getValue() = cidr |
    cidr.(CfString).getValue() = "0.0.0.0/0"
  )
select resource, "Security group allows traffic from Internet (0.0.0.0/0)"

/**
 * CloudFormation: RDS Publicly Accessible
 * Detect RDS instances publicly accessible
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::RDS::DBInstance") and
  exists(CfValue pub |
    resource.getProperty("Properties").(CfObject).getProperty("PubliclyAccessible").getValue() = pub |
    pub.(CfBoolean).getValue() = true
  )
select resource, "RDS instance is publicly accessible"

/**
 * CloudFormation: RDS Without Encryption
 * Detect unencrypted RDS instances
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::RDS::DBInstance") and
  exists(CfValue enc |
    resource.getProperty("Properties").(CfObject).getProperty("StorageEncrypted").getValue() = enc |
    enc.(CfBoolean).getValue() = false
  )
select resource, "RDS instance storage is not encrypted"

/**
 * CloudFormation: IAM Policy with Wildcard
 * Detect IAM policies with full access
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::IAM::Policy") and
  exists(CfValue policy |
    resource.getProperty("Properties").(CfObject).getProperty("PolicyDocument").getValue() = policy |
    policy.toString().regexpMatch("(?s).*\"Action\":\\s*\"\\*\".*\"Effect\":\\s*\"Allow\".*")
  )
select resource, "IAM policy grants wildcard (*) actions - Principle of Least Privilege violation"

/**
 * CloudFormation: Lambda Without VPC
 * Detect Lambda functions not in VPC
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::Lambda::Function") and
  not exists(CfValue vpc |
    resource.getProperty("Properties").(CfObject).getProperty("VpcConfig").getValue() = vpc
  )
select resource, "Lambda function is not configured in VPC - may have excessive network access"

/**
 * CloudFormation: EBS Volume Unencrypted
 * Detect unencrypted EBS volumes
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::EC2::Volume") and
  exists(CfValue enc |
    resource.getProperty("Properties").(CfObject).getProperty("Encrypted").getValue() = enc |
    enc.(CfBoolean).getValue() = false
  )
select resource, "EBS volume is not encrypted"

/**
 * CloudFormation: CloudTrail Disabled
 * Detect disabled CloudTrail
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::CloudTrail::Trail") and
  exists(CfValue enabled |
    resource.getProperty("Properties").(CfObject).getProperty("IsLogging").getValue() = enabled |
    enabled.(CfBoolean).getValue() = false
  )
select resource, "CloudTrail logging is disabled"

/**
 * CloudFormation: IAM User with Password Login
 * Detect IAM users with password login enabled
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::IAM::User") and
  exists(CfValue login |
    resource.getProperty("Properties").(CfObject).getProperty("LoginProfile").getValue() = login
  )
select resource, "IAM user has console password - should use IAM roles instead"

/**
 * CloudFormation: ELB Without SSL
 * Detect Classic Load Balancers without SSL
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::ElasticLoadBalancing::LoadBalancer") and
  not exists(CfValue ssl |
    resource.getProperty("Properties").(CfObject).getProperty("SSLCertificateId").getValue() = ssl
  )
select resource, "Classic Load Balancer does not have SSL/TLS configured"

/**
 * CloudFormation: SNS Topic Unencrypted
 * Detect SNS topics without encryption
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::SNS::Topic") and
  not exists(CfValue enc |
    resource.getProperty("Properties").(CfObject).getProperty("KmsMasterKeyId").getValue() = enc
  )
select resource, "SNS topic does not have KMS encryption configured"

/**
 * CloudFormation: Secret in Parameter
 * Detect secrets in CloudFormation parameters
 */
from CfParameter param
where 
  param.getType().regexpMatch("(?i)String") and
  param.getNoEcho() = false
select param, "Parameter may expose sensitive data - use NoEcho and SecureString type"

/**
 * CloudFormation: Kinesis Stream Without Encryption
 * Detect Kinesis streams without server-side encryption
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::Kinesis::Stream") and
  not exists(CfValue enc |
    resource.getProperty("Properties").(CfObject).getProperty("StreamEncryption").getValue() = enc
  )
select resource, "Kinesis stream does not have encryption enabled"

/**
 * CloudFormation: EFS Without Encryption
 * Detect EFS file systems without encryption
 */
from CloudFormationResource resource
where 
  resource.getResourceType().regexpMatch("AWS::EFS::FileSystem") and
  exists(CfValue enc |
    resource.getProperty("Properties").(CfObject).getProperty("Encrypted").getValue() = enc |
    enc.(CfBoolean).getValue() = false
  )
select resource, "EFS file system is not encrypted"
