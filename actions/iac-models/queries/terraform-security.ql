/**
 * Terraform Security Queries
 * 
 * Detects security vulnerabilities in Terraform configurations
 */

import codeql.terraform as tf
import IaCModels

/**
 * Terraform: Hardcoded AWS Access Key
 * Detect hardcoded AWS access keys
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_access_key" and
  exists(TfAstNode node |
    node.getParent() = resource and
    node.(TfStringLiteral).getValue().regexpMatch("(?i).*AKIA[0-9A-Z]{16}.*")
  )
select resource, "Hardcoded AWS access key detected"

/**
 * Terraform: Hardcoded Secret
 * Detect hardcoded secrets in Terraform
 */
from TerraformResource resource, TfAstNode value
where 
  exists(string attr |
    attr = "password" or attr = "secret" or attr = "token" or 
    attr = "private_key" or attr = "api_key"
  |
    value.getParent().(TfObjectLiteral).getAttributeName() = attr
  ) and
  value.(TfStringLiteral).getValue().regexpMatch("(?i).*[a-z0-9+/=]{20,}.*")
select value, "Hardcoded secret detected in " + value.getParent().(TfObjectLiteral).getAttributeName()

/**
 * Terraform: S3 Bucket Public Access
 * Detect S3 buckets with public access
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_s3_bucket" and
  exists(TfAstNode acl |
    acl.getParent() = resource and
    acl.(TfStringLiteral).getValue() = "public-read"
  )
select resource, "S3 bucket has public-read ACL, may expose data publicly"

/**
 * Terraform: Unencrypted S3 Bucket
 * Detect S3 buckets without encryption
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_s3_bucket" and
  not exists(TfAstNode serverSideEncryptionConfiguration |
    serverSideEncryptionConfiguration.getParent() = resource
  )
select resource, "S3 bucket does not have encryption enabled"

/**
 * Terraform: Security Group Open to Internet
 * Detect security groups with overly permissive rules
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_security_group_rule" and
  exists(TfAstNode cidrBlocks |
    cidrBlocks.getParent() = resource and
    cidrBlocks.(TfStringLiteral).getValue() = "0.0.0.0/0"
  )
select resource, "Security group rule allows traffic from 0.0.0.0/0 (Internet)"

/**
 * Terraform: DB Instance Publicly Accessible
 * Detect RDS instances that are publicly accessible
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_db_instance" and
  exists(TfAstNode publiclyAccessible |
    publiclyAccessible.getParent() = resource and
    publiclyAccessible.(TfBooleanLiteral).getValue() = true
  )
select resource, "RDS instance is publicly accessible"

/**
 * Terraform: Unencrypted RDS Instance
 * Detect RDS instances without encryption
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_db_instance" and
  not exists(TfAstNode storageEncrypted |
    storageEncrypted.getParent() = resource and
    storageEncrypted.(TfBooleanLiteral).getValue() = true
  )
select resource, "RDS instance does not have encryption enabled"

/**
 * Terraform: IAM Policy with Full Admin
 * Detect overly permissive IAM policies
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_iam_policy" and
  exists(TfAstNode policy |
    policy.getParent() = resource and
    policy.(TfStringLiteral).getValue().regexpMatch("(?s).*\"Effect\":\\s*\"Allow\".*\"Action\":\\s*\"\\*\".*")
  )
select resource, "IAM policy allows all actions (*) - Principle of Least Privilege violation"

/**
 * Terraform: Lambda Without VPC
 * Detect Lambda functions not in a VPC
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_lambda_function" and
  not exists(TfAstNode vpcConfig |
    vpcConfig.getParent() = resource and
    vpcConfig.getType() = "vpc_config"
  )
select resource, "Lambda function is not configured with VPC - may have excessive network access"

/**
 * Terraform: CloudTrail Disabled
 * Detect disabled CloudTrail
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_cloudtrail" and
  exists(TfAstNode enableLogging |
    enableLogging.getParent() = resource and
    enableLogging.(TfBooleanLiteral).getValue() = false
  )
select resource, "CloudTrail logging is disabled"

/**
 * Terraform: EBS Volume Unencrypted
 * Detect unencrypted EBS volumes
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_ebs_volume" and
  not exists(TfAstNode encrypted |
    encrypted.getParent() = resource and
    encrypted.(TfBooleanLiteral).getValue() = true
  )
select resource, "EBS volume is not encrypted"

/**
 * Terraform: Missing MFA for IAM User
 * Detect IAM users without MFA
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_iam_user" and
  not exists(TfAstNode mfa |
    mfa.getParent() = resource and
    mfa.getType() = "mfa_serial"
  )
select resource, "IAM user does not have MFA enabled"

/**
 * Terraform: ELB Without SSL
 * Detect Classic Load Balancers without SSL
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_lb" and
  not exists(TfAstNode sslPolicy |
    sslPolicy.getParent() = resource
  )
select resource, "Load Balancer may be missing SSL/TLS configuration"

 /**
 * Terraform: Weak TLS Policy
 * Detect weak TLS policies
 */
from TerraformResource resource
where 
  resource.getResourceType() = "aws_lb" and
  exists(TfAstNode sslPolicy |
    sslPolicy.getParent() = resource and
    sslPolicy.(TfStringLiteral).getValue().regexpMatch(".*ELBSecurityPolicy-2016-08|.*TLS.*-1-0.*")
  )
select resource, "Load Balancer uses weak TLS policy (TLS 1.0 or older)"
