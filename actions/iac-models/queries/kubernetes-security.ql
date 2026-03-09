/**
 * Kubernetes Security Queries
 * 
 * Detects security vulnerabilities in Kubernetes configurations
 */

import YAML
import IaCModels

/**
 * Kubernetes: Privileged Container
 * Detect containers running in privileged mode
 */
from KubernetesSecurityContext sc
where sc.isPrivileged()
select sc, "Container is running in privileged mode - allows host access"

/**
 * Kubernetes: Container Running as Root
 * Detect containers running as root user
 */
from KubernetesSecurityContext sc
where sc.runAsRoot()
select sc, "Container is running as root (UID 0) - should run as non-root user"

/**
 * Kubernetes: Host Path Volume Mount
 * Detect hostPath volume mounts
 */
from YAML::YAMLMapping volume
where
  volume.getFile().getAbsolutePath().regexpMatch(".*(kube|k8s|manifest).*\\.ya?ml$") and
  volume.getChild("hostPath") instanceof YAML::YAMLMapping
select volume, "HostPath volume mount detected - may allow container escape"

/**
 * Kubernetes: Container Without Resource Limits
 * Detect containers without resource limits
 */
from YAML::YAMLMapping container
where
  container.getFile().getAbsolutePath().regexpMatch(".*(kube|k8s).*\\.ya?ml$") and
  container.getChild("name") instanceof YAML::YAMLString and
  not container.getChild("resources") instanceof YAML::YAMLMapping
select container, "Container does not have resource limits - may cause resource exhaustion"

/**
 * Kubernetes: Container Without Security Context
 * Detect pods/containers without security context
 */
from YAML::YAMLMapping pod
where
  pod.getFile().getAbsolutePath().regexpMatch(".*(kube|k8s).*\\.ya?ml$") and
  pod.getChild("kind").(YAML::YAMLString).getValue() = "Pod" and
  not pod.getChild("spec").(YAML::YAMLMapping).getChild("securityContext") instanceof YAML::YAMLMapping
select pod, "Pod does not have a security context defined"

/**
 * Kubernetes: Service Type LoadBalancer
 * Detect services exposed with LoadBalancer
 */
from YAML::YAMLMapping svc
where
  svc.getChild("kind").(YAML::YAMLString).getValue() = "Service" and
  svc.getChild("spec").(YAML::YAMLMapping).getChild("type").(YAML::YAMLString).getValue() = "LoadBalancer"
select svc, "Service type is LoadBalancer - exposes service to Internet"

/**
 * Kubernetes: NET_RAW Capability
 * Detect containers with NET_RAW capability
 */
from YAML::YAMLMapping capabilities
where
  capabilities.getParent().(YAML::YAMLMapping).getChild("securityContext") instanceof YAML::YAMLMapping and
  capabilities.getChild("add") instanceof YAML::YAMLSequence and
  capabilities.getChild("add").(YAML::YAMLSequence).getElement(_).(YAML::YAMLString).getValue() = "NET_RAW"
select capabilities, "Container has NET_RAW capability - may allow network spoofing"

/**
 * Kubernetes: Latest Tag
 * Detect containers using latest tag
 */
from YAML::YAMLMapping container
where
  container.getChild("image").(YAML::YAMLString).getValue().regexpMatch(".*:latest$")
select container, "Container image uses 'latest' tag - may cause unpredictable behavior"

/**
 * Kubernetes: Namespace Default Deny
 * Check if network policy exists
 */
from YAML::YAMLMapping np
where
  np.getChild("kind").(YAML::YAMLString).getValue() = "NetworkPolicy" and
  not np.getChild("spec").(YAML::YAMLMapping).getChild("podSelector") instanceof YAML::YAMLMapping
select np, "NetworkPolicy may not be properly configured"

/**
 * Kubernetes: Ingress Without TLS
 * Detect Ingress resources without TLS
 */
from YAML::YAMLMapping ingress
where
  ingress.getChild("kind").(YAML::YAMLString).getValue() = "Ingress" and
  not ingress.getChild("spec").(YAML::YAMLMapping).getChild("tls") instanceof YAML::YAMLSequence
select ingress, "Ingress does not have TLS configured - traffic is unencrypted"

/**
 * Kubernetes: Default ServiceAccount
 * Detect usage of default service account
 */
from YAML::YAMLMapping pod
where
  pod.getChild("kind").(YAML::YAMLString).getValue() = "Pod" and
  pod.getChild("spec").(YAML::YAMLMapping).getChild("serviceAccountName").(YAML::YAMLString).getValue() = "default"
select pod, "Pod uses default service account - should use dedicated service account"

/**
 * Kubernetes: livenessProbe Missing
 * Detect containers without liveness probe
 */
from YAML::YAMLMapping container
where
  container.getParent().(YAML::YAMLMapping).getChild("spec") instanceof YAML::YAMLMapping and
  not container.getChild("livenessProbe") instanceof YAML::YAMLMapping
select container, "Container does not have a liveness probe - may not recover from failures"

/**
 * Kubernetes: readOnlyRootFilesystem Not Set
 * Detect containers without read-only root filesystem
 */
from YAML::YAMLMapping sc
where
  sc.getParent().(YAML::YAMLMapping).getChild("securityContext") instanceof YAML::YAMLMapping and
  not sc.getChild("readOnlyRootFilesystem") instanceof YAML::YAMLBoolean
select sc, "Container does not have read-only root filesystem - may be vulnerable to writes"

/**
 * Kubernetes: allowPrivilegeEscalation
 * Detect containers with privilege escalation allowed
 */
from YAML::YAMLMapping sc
where
  sc.getChild("allowPrivilegeEscalation").(YAML::YAMLBoolean).getValue() = true
select sc, "Container allows privilege escalation - should be set to false"

/**
 * Kubernetes: Sensitive Host Path
 * Detect sensitive host path mounts
 */
from YAML::YAMLMapping volumeMount
where
  volumeMount.getChild("hostPath").(YAML::YAMLString).getValue().regexpMatch(".*(/etc/passwd|/etc/shadow|/root|/home|/var/run/docker.sock|/proc|/sys)")
select volumeMount, "Sensitive host path mounted - potential container escape"
