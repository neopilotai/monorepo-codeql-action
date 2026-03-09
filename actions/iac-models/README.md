# Infrastructure as Code (IaC) Security - CodeQL Models

CodeQL models and queries for analyzing Infrastructure as Code security vulnerabilities in Terraform, Kubernetes, Docker, and CloudFormation configurations.

## Supported IaC Tools

### Terraform (.tf, .tfvars)

**Resource Types Analyzed:**
- AWS S3, RDS, IAM, Lambda, EC2, CloudTrail
- Azure, GCP resources

**Detected Issues:**
| Query | Description | Severity |
|-------|-------------|----------|
| Hardcoded AWS Access Key | Hardcoded credentials | Critical |
| Hardcoded Secret | Hardcoded passwords/secrets | Critical |
| S3 Bucket Public | Public access to S3 | High |
| Unencrypted S3 | Missing encryption | High |
| Security Group Open | 0.0.0.0/0 access | High |
| RDS Publicly Accessible | Public RDS instance | High |
| Unencrypted RDS | Missing encryption | High |
| IAM Full Admin | Wildcard (*) policy | High |
| Lambda Without VPC | Not in VPC | Medium |
| CloudTrail Disabled | Logging disabled | High |
| Unencrypted EBS | Missing encryption | High |
| Missing MFA | No MFA for IAM | High |
| Weak TLS Policy | Old TLS versions | Medium |

### Kubernetes (.yaml, .yml)

**Resources Analyzed:**
- Pod, Deployment, Service, Ingress
- NetworkPolicy, SecurityContext
- ConfigMap, Secret

**Detected Issues:**
| Query | Description | Severity |
|-------|-------------|----------|
| Privileged Container | Running in privileged mode | Critical |
| Running as Root | Container as UID 0 | High |
| Host Path Volume | hostPath mount | High |
| No Resource Limits | Missing CPU/memory limits | Medium |
| No Security Context | Missing security context | Medium |
| Service LoadBalancer | Exposed to Internet | High |
| NET_RAW Capability | Network spoofing risk | Medium |
| Latest Tag | Non-deterministic image | Low |
| No TLS | Ingress without TLS | High |
| Default ServiceAccount | Using default SA | Medium |
| No livenessProbe | Missing health check | Low |
| ReadOnlyRootFilesystem | Writable root fs | Medium |
| Privilege Escalation | Allow escalation | High |
| Sensitive Host Path | /etc/passwd mount | High |

### Docker (Dockerfile)

**Instructions Analyzed:**
- FROM, RUN, CMD, ENTRYPOINT
- EXPOSE, ENV, USER, WORKDIR
- ADD, COPY, HEALTHCHECK

**Detected Issues:**
| Query | Description | Severity |
|-------|-------------|----------|
| Latest Base Image | Using :latest tag | Low |
| Running as Root | No USER instruction | High |
| No HEALTHCHECK | Missing health check | Medium |
| Sensitive Port | Exposing SSH/RDB ports | Medium |
| apt-get No Clean | Package cache not cleaned | Low |
| Sensitive Env | Passwords in ENV | Critical |
| No WORKDIR | Missing working directory | Low |
| ADD vs COPY | ADD instead of COPY | Low |
| Privileged Flag | --privileged flag | Critical |
| Shell Form | CMD/ENTRYPOINT shell form | Low |
| Multiple CMD | Multiple CMD instructions | Low |

### CloudFormation (AWS)

**Resources Analyzed:**
- AWS::S3::Bucket, AWS::RDS::DBInstance
- AWS::IAM::Policy, AWS::Lambda::Function
- AWS::EC2::SecurityGroup, AWS::CloudTrail::Trail

**Detected Issues:**
| Query | Description | Severity |
|-------|-------------|----------|
| S3 Public | Public bucket | High |
| S3 No Encryption | Missing encryption | High |
| SG Open to Internet | 0.0.0.0/0 | High |
| RDS Public | Public database | High |
| RDS No Encryption | Unencrypted storage | High |
| IAM Wildcard | Full admin policy | Critical |
| Lambda No VPC | Outside VPC | Medium |
| EBS No Encryption | Unencrypted volume | High |
| CloudTrail Disabled | Logging disabled | High |
| IAM Password Login | Console password | Medium |
| ELB No SSL | No TLS | High |
| SNS No Encryption | Unencrypted topic | Medium |
| Secret in Parameter | Plain text secrets | High |

## Usage

### GitHub Action

```yaml
name: IaC Security Analysis

on:
  push:
    branches: [main]
    paths:
      - '**.tf'
      - '**/Dockerfile*'
      - '**/*.yaml'
      - '**/cloudformation/**'

jobs:
  iac-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: IaC Security Analysis
        uses: khulnasoft/monorepo-codeql-action/iac-models@main
        with:
          language: all
          query-suite: security
```

### Run Specific IaC Type

```yaml
- name: Terraform Analysis
  uses: khulnasoft/monorepo-codeql-action/iac-models@main
  with:
    language: terraform

- name: Kubernetes Analysis
  uses: khulnasoft/monorepo-codeql-action/iac-models@main
  with:
    language: kubernetes

- name: Docker Analysis
  uses: khulnasoft/monorepo-codeql-action/iac-models@main
  with:
    language: docker

- name: CloudFormation Analysis
  uses: khulnasoft/monorepo-codeql-action/iac-models@main
  with:
    language: cloudformation
```

### Command Line

```bash
# Analyze Terraform
codeql database create tf-db --language=terraform --source-root=.
codeql database analyze tf-db --format=sarif-latest --output=tf-results.sarif

# Analyze Kubernetes
codeql database create k8s-db --language=kubernetes --source-root=.
codeql database analyze k8s-db --format=sarif-latest --output=k8s-results.sarif

# Analyze Docker
codeql database create docker-db --language=dockerfile --source-root=.
codeql database analyze docker-db --format=sarif-latest --output=docker-results.sarif
```

## Query Files

- `queries/terraform-security.ql` - Terraform queries
- `queries/kubernetes-security.ql` - Kubernetes queries
- `queries/docker-security.ql` - Docker queries
- `queries/cloudformation-security.ql` - CloudFormation queries
- `iac-models.qll` - Base IaC models

## Integration

### With Terratest

```typescript
import { TerraformCodeScanning } from './iac-models';

test('no security issues in tf') {
  const results = new TerraformCodeScanning().analyze('./infra');
  expect(results.violations).toHaveLength(0);
}
```

### With checkov

```bash
# Convert CodeQL results to checkov format
codeql database analyze tf-db --format=csv --output=results.csv
```

## Severity Levels

| Level | Description |
|-------|-------------|
| Critical | Immediate security risk |
| High | Significant security risk |
| Medium | Moderate security risk |
| Low | Minor security issue |

## Compliance Mapping

These queries help meet compliance requirements for:

- **CIS Docker Benchmark** - Container security
- **CIS Kubernetes Benchmark** - K8s security
- **AWS Well-Architected** - Cloud security
- **PCI-DSS** - Payment card security
- **SOC 2** - Security controls

## License

MIT
