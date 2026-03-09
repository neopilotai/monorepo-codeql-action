/**
 * SAP UI5 Security Queries
 * 
 * CodeQL queries for detecting security vulnerabilities in SAP UI5 applications
 */

import javascript
import UI5

/**
 * Cross-Site Scripting in UI5
 * Detects potential XSS vulnerabilities in UI5
 */
class UI5XSS extends XSS::Configuration {
  UI5XSS() { this = "UI5XSS" }

  override predicate isSource(DataFlow::Node src) {
    src instanceof UI5XSSSource
  }

  override predicate isSink(DataFlow::Node snk) {
    snk instanceof UI5XSSSink
  }
}

/**
 * Missing Authentication in UI5
 * Detects UI5 controllers without authentication
 */
class UI5MissingAuthentication extends Security::MissingAuthentication::Range {
  UI5MissingAuthentication() { this = "UI5MissingAuthentication" }

  override DataFlow::Node getAuthenticatedNode() {
    exists(UI5AuthenticationCheck auth |
      result = auth
    )
  }

  override DataFlow::Node getAction() {
    exists(UI5Controller controller |
      result = DataFlow::exprNode(controller)
    )
  }
}

/**
 * Missing Authorization in UI5
 * Detects UI5 controllers without authorization
 */
class UI5MissingAuthorization extends Security::MissingAccessControl::Range {
  UI5MissingAuthorization() { this = "UI5MissingAuthorization" }

  override DataFlow::Node getAuthorizerNode() {
    exists(UI5AuthorizationCheck auth |
      result = auth
    )
  }

  override DataFlow::Node getProtectedNode() {
    exists(UI5Controller controller |
      result = DataFlow::exprNode(controller)
    )
  }
}

/**
 * Insecure OData Calls in UI5
 * Detects OData calls without proper security
 */
class UI5InsecureOData extends TaintTracking::Configuration {
  UI5InsecureOData() { this = "UI5InsecureOData" }

  override predicate isSource(DataFlow::Node src) {
    exists(UI5EventHandler handler |
      src = handler.getParameter(0)
    )
  }

  override predicate isSink(DataFlow::Node snk) {
    exists(UI5ODataCall call |
      snk = call
    )
  }
}

/**
 * Sensitive Data Exposure in UI5
 * Detects exposure of sensitive data in UI5
 */
from UI5Binding binding
where 
  binding.getBindingPath().regexpMatch(".*(?i)(password|secret|token|key|credit[_-]?card|ssn).*")
select binding, "Potential sensitive data binding in UI5"

/**
 * Hardcoded Credentials in UI5
 * Detects hardcoded credentials in UI5
 */
from StringLiteral sl
where 
  sl.getValue().regexpMatch(".*(?i)(password|secret|token)\\s*[:=]\\s*['\"][^'\"]{4,}['\"]")
select sl, "Potential hardcoded credential in UI5"

/**
 * Unvalidated Redirect in UI5
 * Detects unvalidated redirects in UI5
 */
from MethodCallExpr mce
where 
  mce.getMethodName().regexpMatch("(navTo|redirect|setHash).*")
select mce, "Potential unvalidated redirect in UI5"

/**
 * Missing CSRF Protection
 * Detects OData calls without CSRF token
 */
class UI5CSRFProtection extends TaintTracking::Configuration {
  UI5CSRFProtection() { this = "UI5CSRFProtection" }

  override predicate isSource(DataFlow::Node src) {
    exists(UI5ODataCall call |
      call.getOperation() = "create" or
      call.getOperation() = "update" or
      call.getOperation() = "remove"
    )
  }

  override predicate isSink(DataFlow::Node snk) {
    // No CSRF token header check
    not exists(MethodCallExpr header |
      header.getMethodName() = "setHeader" and
      header.getArgument(0).(StringLiteral).getValue().regexpMatch("(?i)X-CSRF-Token")
    )
  }
}

/**
 * Insecure Resource Loading
 * Detects loading resources from insecure sources
 */
from MethodCallExpr mce
where 
  mce.getMethodName().regexpMatch("(load|get).*(Resource|HTML|XML).*") and
  exists(StringLiteral arg |
    arg = mce.getAnArgument() and
    arg.getValue().regexpMatch("http://(?!localhost).*")
  )
select mce, "Insecure resource loading from HTTP"
