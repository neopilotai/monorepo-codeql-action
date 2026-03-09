/**
 * SAP CAP Security Queries
 * 
 * CodeQL queries for detecting security vulnerabilities in SAP CAP applications
 */

import javascript
import CAP

/**
 * SQL Injection in CAP Entity Operations
 * Detects potential SQL injection in CAP query operations
 */
class CAPSQLInjection extends TaintTracking::Configuration {
  CAPSQLInjection() { this = "CAPSQLInjection" }

  override predicate isSource(DataFlow::Node src) {
    exists(CAPEventHandler handler |
      src = handler.getParameter(0) or
      src = handler.getParameter(1) // req, res parameters
    )
  }

  override predicate isSink(DataFlow::Node snk) {
    exists(MethodCallExpr call |
      call.getMethodName() = "run" or
      call.getMethodName() = "execute" or
      call.getCallee().(PropertyLookup).getPropertyName() = "SELECT"
    )
  }
}

/**
 * Path Traversal in CAP File Operations
 * Detects potential path traversal in CAP file handling
 */
class CAPPathTraversal extends TaintTracking::Configuration {
  CAPPathTraversal() { this = "CAPPathTraversal" }

  override predicate isSource(DataFlow::Node src) {
    exists(CAPEventHandler handler |
      src = handler.getParameter(0) // Request parameter
    )
  }

  override predicate isSink(DataFlow::Node snk) {
    exists(MethodCallExpr call |
      call.getMethodName().regexpMatch("(readFile|writeFile|copy|move).*")
    )
  }
}

/**
 * Command Injection in CAP
 * Detects potential command injection in CAP
 */
class CAPCommandInjection extends TaintTracking::Configuration {
  CAPCommandInjection() { this = "CAPCommandInjection" }

  override predicate isSource(DataFlow::Node src) {
    exists(CAPEventHandler handler |
      src = handler.getParameter(0)
    )
  }

  override predicate isSink(DataFlow::Node snk) {
    exists(CallExpr call |
      call.getCallee().(Identifier).getName().regexpMatch("exec|spawn|execSync|execFile")
    )
  }
}

/**
 * Missing Authentication in CAP
 * Detects CAP handlers without authentication
 */
class CAPMissingAuthentication extends Security::MissingAuthentication::Range {
  CAPMissingAuthentication() { this = "CAPMissingAuthentication" }

  override DataFlow::Node getAuthenticatedNode() {
    exists(CAPAuthenticationCheck auth |
      result = auth
    )
  }

  override DataFlow::Node getAction() {
    exists(CAPEventHandler handler |
      result = DataFlow::exprNode(handler)
    )
  }
}

/**
 * Missing Authorization in CAP
 * Detects CAP handlers without authorization
 */
class CAPMissingAuthorization extends Security::MissingAccessControl::Range {
  CAPMissingAuthorization() { this = "CAPMissingAuthorization" }

  override DataFlow::Node getAuthorizerNode() {
    exists(CAPAuthorizationCheck auth |
      result = auth
    )
  }

  override DataFlow::Node getProtectedNode() {
    exists(CAPEventHandler handler |
      result = DataFlow::exprNode(handler)
    )
  }
}

/**
 * Cross-Site Scripting in CAP
 * Detects XSS in CAP responses
 */
class CAPXSS extends XSS::Configuration {
  CAPXSS() { this = "CAPXSS" }

  override predicate isSource(DataFlow::Node src) {
    exists(CAPEventHandler handler |
      src = handler.getParameter(0)
    )
  }

  override predicate isSink(DataFlow::Node snk) {
    exists(MethodCallExpr call |
      call.getMethodName() = "send" or
      call.getMethodName() = "setBody"
    )
  }
}

/**
 * Hardcoded Secrets in CAP
 * Detects hardcoded credentials in CAP
 */
from StringLiteral sl
where 
  sl.getValue().regexpMatch(".*(?i)(password|secret|token|api[_-]?key|access[_-]?key)\\s*[:=]\\s*['\"][^'\"]{8,}['\"]")
select sl, "Potential hardcoded secret in CAP application"
