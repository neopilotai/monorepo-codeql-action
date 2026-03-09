/**
 * SAP XSJS Security Queries
 * 
 * CodeQL queries for detecting security vulnerabilities in SAP XSJS applications
 */

import javascript
import XSJS

/**
 * SQL Injection in XSJS
 * Detects potential SQL injection vulnerabilities
 */
class XSJSSQLInjection extends TaintTracking::Configuration {
  XSJSSQLInjection() { this = "XSJSSQLInjection" }

  override predicate isSource(DataFlow::Node src) {
    exists(XSJSRequest req |
      src = req.getBody() or
      src = req.getParameter(_) or
      exists(string p | src = req.getParameter(p))
    )
  }

  override predicate isSink(DataFlow::Node snk) {
    snk instanceof XSJSSQLInjectionSink
  }
}

/**
 * Command Injection in XSJS
 * Detects potential command injection
 */
class XSJSCommandInjection extends TaintTracking::Configuration {
  XSJSCommandInjection() { this = "XSJSCommandInjection" }

  override predicate isSource(DataFlow::Node src) {
    exists(XSJSRequest req |
      src = req.getBody() or
      src = req.getParameter(_)
    )
  }

  override predicate isSink(DataFlow::Node snk) {
    exists(CallExpr call |
      call.getCallee().(Identifier).getName().regexpMatch("exec|execSync|spawn|spawnSync|execFile|execFileSync")
    )
  }
}

/**
 * Path Traversal in XSJS
 * Detects potential path traversal
 */
class XSJSPathTraversal extends TaintTracking::Configuration {
  XSJSPathTraversal() { this = "XSJSPathTraversal" }

  override predicate isSource(DataFlow::Node src) {
    exists(XSJSRequest req |
      src = req.getBody() or
      src = req.getParameter("path") or
      src = req.getParameter("file")
    )
  }

  override predicate isSink(DataFlow::Node snk) {
    exists(MethodCallExpr call |
      call.getMethodName().regexpMatch("(readFile|writeFile|createFile|deleteFile|readDir).*")
    )
  }
}

/**
 * Cross-Site Scripting in XSJS
 * Detects potential XSS in XSJS responses
 */
class XSJSXSS extends XSS::Configuration {
  XSJSXSS() { this = "XSJSXSS" }

  override predicate isSource(DataFlow::Node src) {
    exists(XSJSRequest req |
      src = req.getBody() or
      src = req.getParameter(_)
    )
  }

  override predicate isSink(DataFlow::Node snk) {
    exists(XSJSResponse resp |
      snk = resp.setBody()
    )
  }
}

/**
 * Missing Authentication in XSJS
 * Detects XSJS services without authentication
 */
class XSJSMissingAuthentication extends Security::MissingAuthentication::Range {
  XSJSMissingAuthentication() { this = "XSJSMissingAuthentication" }

  override DataFlow::Node getAuthenticatedNode() {
    exists(XSJSAuthenticationCheck auth |
      result = auth
    )
  }

  override DataFlow::Node getAction() {
    exists(XSJSService service |
      result = DataFlow::exprNode(service)
    )
  }
}

/**
 * Missing Authorization in XSJS
 * Detects XSJS services without authorization
 */
class XSJSMissingAuthorization extends Security::MissingAccessControl::Range {
  XSJSMissingAuthorization() { this = "XSJSMissingAuthorization" }

  override DataFlow::Node getAuthorizerNode() {
    exists(XSJSAuthorizationCheck auth |
      result = auth
    )
  }

  override DataFlow::Node getProtectedNode() {
    exists(XSJSService service |
      result = DataFlow::exprNode(service)
    )
  }
}

/**
 * Missing CSRF Protection in XSJS
 * Detects XSJS endpoints without CSRF protection
 */
class XSJSCSRFProtection extends TaintTracking::Configuration {
  XSJSCSRFProtection() { this = "XSJSCSRFProtection" }

  override predicate isSource(DataFlow::Node src) {
    exists(XSJSService service, XSJSRequest req |
      src = req.getBody() or
      src = req.getMethod() = "POST"
    )
  }

  override predicate isSink(DataFlow::Node snk) {
    exists(XSJSResponse resp |
      snk = resp.setBody()
    )
  }
}

/**
 * Insecure Headers in XSJS
 * Detects missing security headers
 */
from XSJSResponseHeader header
where 
  header.getHeaderName().regexpMatch("(?i)(X-Frame-Options|X-Content-Type-Options|Content-Security-Policy)")
select header, "Missing security header configuration"

/**
 * Hardcoded Secrets in XSJS
 * Detects hardcoded credentials
 */
from StringLiteral sl
where 
  sl.getValue().regexpMatch(".*(?i)(password|secret|token|key|credential)\\s*[:=]\\s*['\"][^'\"]{6,}['\"]")
select sl, "Potential hardcoded secret in XSJS"

/**
 * Weak Cryptography in XSJS
 * Detects use of weak cryptographic algorithms
 */
from CallExpr call
where 
  call.getCallee().(Identifier).getName().regexpMatch("(md5|sha1|des|rc4)")
select call, "Weak cryptographic algorithm used"

/**
 * Information Disclosure in XSJS
 * Detects potential information disclosure through error messages
 */
from XSJSTrace trace, XSJSRequest req
where 
  exists(MethodCallExpr errorCall |
    errorCall.getMethodName().regexpMatch("(send|printStackTrace|getStackTrace).*")
  )
select trace, "Potential information disclosure in error handling"

/**
 * Unvalidated Redirect in XSJS
 * Detects unvalidated redirects
 */
from XSJSResponse resp
where 
  exists(MethodCallExpr call |
    call.getMethodName() = "setHeader" and
    call.getArgument(0).(StringLiteral).getValue().toLowerCase() = "location"
  )
select resp, "Potential unvalidated redirect"
