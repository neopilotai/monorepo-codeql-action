/**
 * Docker Security Queries
 * 
 * Detects security vulnerabilities in Dockerfiles
 */

import codeql.docker
import IaCModels

/**
 * Docker: Latest Base Image
 * Detect usage of :latest tag
 */
from DockerFrom f
where f.getBaseImage().regexpMatch(".*:latest$")
select f, "Base image uses 'latest' tag - should use specific version for reproducibility"

/**
 * Docker: Running as Root
 * Detect USER not set to non-root
 */
from Dockerfile d, DockerfileInstruction i
where 
  i.getInstruction().regexpMatch("(?i)^FROM.*") and
  not exists(DockerfileInstruction user | user.getInstruction().regexpMatch("(?i)^USER.*"))
select d, "Dockerfile does not set USER - container runs as root"

/**
 * Docker: No HEALTHCHECK
 * Detect missing HEALTHCHECK instruction
 */
from Dockerfile d
where 
  not exists(DockerfileInstruction h | h.getInstruction().regexpMatch("(?i)^HEALTHCHECK.*"))
select d, "Dockerfile does not have HEALTHCHECK - container health is not monitored"

/**
 * Docker: Sensitive Port Exposed
 * Detect EXPOSE of sensitive ports
 */
from DockerExpose e
where 
  e.getPort().regexpMatch("^(22|23|3389|3306|5432|6379|27017|9200|9300|11211|27017)$")
select e, "Sensitive port exposed - " + e.getPort()

/**
 * Docker: Package Cache Not Cleaned
 * Detect apt-get without clean
 */
from DockerRun r
where 
  r.getCommand().regexpMatch("(?i)apt-get.*install.*") and
  not r.getCommand().regexpMatch(".*(apt-get clean|rm -rf /var/lib/apt/lists/).*")
select r, "apt-get install without cleaning package cache - increases image size"

/**
 * Docker: Running as Root User
 * Detect USER set to root
 */
from DockerfileInstruction u
where 
  u.getInstruction().regexpMatch("(?i)^USER\\s+root$")
select u, "Container runs as root user - should run as non-root"

/**
 * Docker: ADD Instead of COPY
 * Detect ADD usage (COPY is preferred)
 */
from DockerfileInstruction a
where 
  a.getInstruction().regexpMatch("(?i)^ADD\\s+")
select a, "Use COPY instead of ADD unless extracting local archives"

/**
 * Docker: No Pin of Package Versions
 * Detect apt-get without version pinning
 */
from DockerRun r
where 
  r.getCommand().regexpMatch("(?i)apt-get install") and
  not r.getCommand().regexpMatch(".*=(?:[0-9]+:)?[0-9]+\\.[0-9]+.*")
select r, "Package installation without version pinning - may cause inconsistent builds"

/**
 * Docker: Use of --privileged Flag
 * Detect privileged container flag
 */
from DockerfileInstruction i
where 
  i.getInstruction().regexpMatch("(?i).*--privileged.*")
select i, "Container runs with --privileged flag - gives full host access"

/**
 * Docker: Sensitive Data in Environment
 * Detect sensitive env variables
 */
from DockerfileInstruction e
where 
  e.getInstruction().regexpMatch("(?i)^ENV.*(PASSWORD|SECRET|TOKEN|API_KEY|PRIVATE_KEY).*=.*")
select e, "Sensitive data in environment variable - may be exposed"

/**
 * Docker: No WORKDIR Set
 * Detect missing WORKDIR
 */
from Dockerfile d
where 
  not exists(DockerfileInstruction w | w.getInstruction().regexpMatch("(?i)^WORKDIR.*"))
select d, "No WORKDIR set - commands run from root"

/**
 * Docker: Using :root Tag
 * Detect explicit root image tag
 */
from DockerFrom f
where f.getBaseImage().regexpMatch(".*:root$")
select f, "Base image explicitly uses root tag - consider using non-root user"

/**
 * Docker: CMD/ENTRYPOINT with Shell Form
 * Detect shell form instead of exec form
 */
from DockerfileInstruction c
where 
  (c.getInstruction().regexpMatch("(?i)^CMD.*") or c.getInstruction().regexpMatch("(?i)^ENTRYPOINT.*")) and
  c.getInstruction().regexpMatch(".*/bin/sh\\s+-c.*")
select c, "Use exec form for CMD/ENTRYPOINT to avoid shell processing"

/**
 * Docker: Using apt-get upgrade
 * Detect apt-get upgrade (should use apt-get dist-upgrade)
 */
from DockerRun r
where 
  r.getCommand().regexpMatch("(?i)apt-get upgrade.*")
select r, "Use 'apt-get dist-upgrade' instead of 'apt-get upgrade'"

/**
 * Docker: Multiple CMD Instructions
 * Detect multiple CMD instructions
 */
from DockerfileInstruction c1, DockerfileInstruction c2
where 
  c1.getInstruction().regexpMatch("(?i)^CMD.*") and
  c2.getInstruction().regexpMatch("(?i)^CMD.*") and
  c1 != c2
select c1, "Multiple CMD instructions - only last one is used"

/**
 * Docker: No .dockerignore
 * Detect missing .dockerignore
 */
from Dockerfile d
where 
  not exists(File f | f.getAbsolutePath().regexpMatch(".*/\\.dockerignore$"))
select d, "No .dockerignore file - may include unnecessary files in context"
