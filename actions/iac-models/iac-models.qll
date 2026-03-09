/**
 * Infrastructure as Code (IaC) - Data Flow Models
 * 
 * This file provides CodeQL modeling for IaC tools including:
 * - Terraform (.tf)
 * - Kubernetes (.yaml)
 * - Docker (Dockerfile)
 * - AWS CloudFormation (.yaml, .json)
 * - Azure Resource Manager (.json)
 * - Google Cloud Deployment Manager (.yaml, .json)
 * - Ansible (.yml)
 */

import codeql.swift.elements as swift
import codeql.terraform as tf
import codeql.cloudformation as cf
import yaml

/**
 * IaC Configuration File
 * Base class for all IaC files
 */
class IaCConfiguration extends File {
  IaCConfiguration() {
    exists(string ext |
      ext = this.getAbsolutePath().regexpMatch(".*\\.(tf|tfvars|yaml|yml|json|dockerfile)$") or
      ext = this.getAbsolutePath().regexpMatch(".*Dockerfile$") or
      ext = this.getAbsolutePath().regexpMatch(".*\\.tpl$")
    )
  }

  string getIaCType() {
    if this.getAbsolutePath().regexpMatch(".*\\.tf$") then result = "terraform"
    else if this.getAbsolutePath().regexpMatch(".*(kube|k8s).*\\.ya?ml$") then result = "kubernetes"
    else if this.getAbsolutePath().regexpMatch(".*Dockerfile$") then result = "docker"
    else if this.getAbsolutePath().regexpMatch(".*cloudformation.*\\.ya?ml$") or 
            this.getAbsolutePath().regexpMatch(".*cloudformation.*\\.json$") then result = "cloudformation"
    else if this.getAbsolutePath().regexpMatch(".*arm.*\\.json$") or
            this.getAbsolutePath().regexpMatch(".*azuredeploy.*") then result = "arm"
    else if this.getAbsolutePath().regexpMatch(".*ansible.*\\.ya?ml$") then result = "ansible"
    else result = "unknown"
  }
}

/**
 * Terraform Resource
 * Represents a Terraform resource block
 */
class TerraformResource extends TfAstNode {
  TerraformResource() {
    this.getType() = "resource"
  }

  string getResourceType() {
    exists(TfAstNode type | 
      type.getParent() = this and 
      type.(TfStringLiteral).getValue() = result
    )
  }

  string getResourceName() {
    exists(TfAstNode name |
      name.getParent() = this and
      name.(TfStringLiteral).getValue() = result
    )
  }
}

/**
 * Terraform Variable
 * Represents a variable definition
 */
class TerraformVariable extends TfAstNode {
  TerraformVariable() {
    this.getType() = "variable"
  }

  string getVariableName() {
    exists(TfAstNode name |
      name.getParent() = this and
      name.(TfStringLiteral).getValue() = result
    )
  }

  string getDefaultValue() {
    exists(TfAstNode default |
      default.getParent() = this |
      result = default.(TfStringLiteral).getValue()
    )
  }
}

/**
 * Terraform Provider
 * Represents a provider configuration
 */
class TerraformProvider extends TfAstNode {
  TerraformProvider() {
    this.getType() = "provider"
  }

  string getProviderName() {
    exists(TfAstNode name |
      name.getParent() = this |
      result = name.(TfStringLiteral).getValue()
    )
  }
}

/**
 * Terraform Module
 * Represents a module definition
 */
class TerraformModule extends TfAstNode {
  TerraformModule() {
    this.getType() = "module"
  }

  string getModuleSource() {
    exists(TfAstNode source |
      source.(TfStringLiteral).getValue().regexpMatch(".*")
    )
  }
}

/**
 * Kubernetes Resource
 * Represents a Kubernetes resource
 */
class KubernetesResource extends YAML::YAMLNode {
  KubernetesResource() {
    this.getFile().getAbsolutePath().regexpMatch(".*(kube|k8s|manifest).*\\.ya?ml$")
  }

  string getKind() {
    result = this.getChild("kind").(YAML::YAMLString).getValue()
  }

  string getName() {
    result = this.getChild("metadata").(YAML::YAMLMapping).getChild("name").(YAML::YAMLString).getValue()
  }

  string getApiVersion() {
    result = this.getChild("apiVersion").(YAML::YAMLString).getValue()
  }
}

/**
 * Kubernetes Security Context
 * Security context configuration
 */
class KubernetesSecurityContext extends YAML::YAMLMapping {
  KubernetesSecurityContext() {
    this.getParent().(YAML::YAMLMapping).getChild("securityContext") = this
  }

  predicate isPrivileged() {
    this.getChild("privileged").(YAML::YAMLBoolean).getValue() = true
  }

  predicate runAsRoot() {
    this.getChild("runAsUser").(YAML::YAMLNumber).getValue() = "0"
  }

  predicate hasCapabilities() {
    exists(this.getChild("capabilities"))
  }
}

/**
 * Kubernetes Network Policy
 * Network policy configuration
 */
class KubernetesNetworkPolicy extends KubernetesResource {
  KubernetesNetworkPolicy() {
    this.getKind() = "NetworkPolicy"
  }
}

/**
 * Docker Instruction
 * Base class for Docker instructions
 */
class DockerInstruction extends DockerfileLine {
  string getInstruction() {
    result = this.getComment()
  }
}

/**
 * Docker FROM Instruction
 * Base image declaration
 */
class DockerFrom extends DockerInstruction {
  DockerFrom() {
    this.getInstruction().regexpMatch("(?i)^FROM.*")
  }

  string getBaseImage() {
    result = this.getInstruction().regexpCapture("(?i)^FROM\\s+(.+?)(?:\\s+AS)?$", 1)
  }

  string getAlias() {
    result = this.getInstruction().regexpCapture("(?i)^FROM\\s+.+\\s+AS\\s+(\\w+)$", 1)
  }
}

/**
 * Docker RUN Instruction
 * Command execution
 */
class DockerRun extends DockerInstruction {
  DockerRun() {
    this.getInstruction().regexpMatch("(?i)^RUN.*")
  }

  string getCommand() {
    result = this.getInstruction().regexpCapture("(?i)^RUN\\s+(.+)$", 1)
  }
}

/**
 * Docker EXPOSE Instruction
 * Port exposure
 */
class DockerExpose extends DockerInstruction {
  DockerExpose() {
    this.getInstruction().regexpMatch("(?i)^EXPOSE.*")
  }

  string getPort() {
    result = this.getInstruction().regexpCapture("(?i)^EXPOSE\\s+(\\d+)", 1)
  }
}

/**
 * CloudFormation Resource
 * AWS CloudFormation resource
 */
class CloudFormationResource extends CfResource {
  string getResourceType() {
    result = this.getProperty("Type").(CfString).getValue()
  }

  string getResourceName() {
    result = this.getProperty("LogicalResourceId").(CfString).getValue()
  }
}

/**
 * ARM Resource
 * Azure Resource Manager resource
 */
class ARMResource extends JSON::JSONObject {
  ARMResource() {
    this.getFile().getAbsolutePath().regexpMatch(".*(arm|azuredeploy|template).*\\.json$")
  }

  string getResourceType() {
    result = this.getChild("type").(JSON::JSONString).getValue()
  }

  string getApiVersion() {
    result = this.getChild("apiVersion").(JSON::JSONString).getValue()
  }
}

/**
 * Ansible Task
 * Ansible playbook task
 */
class AnsibleTask extends YAML::YAMLMapping {
  AnsibleTask() {
    this.getFile().getAbsolutePath().regexpMatch(".*ansible.*\\.ya?ml$")
  }

  string getName() {
    result = this.getChild("name").(YAML::YAMLString).getValue()
  }

  string getModule() {
    result = this.getChild("module").(YAML::YAMLString).getValue()
  }
}

/**
 * IaC Security Sensitive Value
 * Base class for sensitive values in IaC
 */
class IaCSensitiveValue extends DataFlow::Node {
  IaCSensitiveValue() {
    exists(string val |
      val = this.(StringLiteral).getValue() and
      val.regexpMatch("(?i).*(password|secret|token|key|api[_-]?key|private[_-]?key|credential|auth).*")
    )
  }
}
