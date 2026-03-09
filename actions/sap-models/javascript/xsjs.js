/**
 * SAP XSJS (Extended Services for JavaScript) - Data Model Definitions
 * 
 * This file provides CodeQL modeling for SAP XSJS framework components
 * including services, procedures, security patterns, and database access.
 */

import javascript

/**
 * XSJS Service
 * XSJS services are exposed as REST APIs
 */
class XSJSService extends Http::Endpoint {
  XSJSService() {
    // XSJS service files
    this.getFile().getAbsolutePath().regexpMatch(".*\\.xsjs$") or
    this.getFile().getAbsolutePath().regexpMatch(".*\\.xsjslib$")
  }

  string getServiceName() {
    // Extract service name from file
    result = this.getFile().getStem()
  }

  string getPackagePath() {
    // Get package path
    this.getFile().getAbsolutePath().regexpCapture("(.*\\/)([^\\/]+)\\.xsjs$", 1)
  }
}

/**
 * XSJS Request Object
 * Represents incoming HTTP requests
 */
class XSJSRequest extends DataFlow::Node {
  XSJSRequest() {
    // $.request in XSJS
    exists(MemberExpr me |
      me.getPropertyName() = "request" and
      me.getBase().(GlobalVarAccess).getName() = "$"
    )
  }

  string getMethod() {
    // HTTP method (GET, POST, etc.)
    exists(MemberExpr me |
      me.getPropertyName() = "method" |
      this.asExpr() = me
    )
    result = "GET" // default
  }

  DataFlow::SourceNode getBody() {
    // Request body
    exists(MemberExpr me |
      me.getPropertyName() = "body" |
      result = DataFlow::exprNode(me)
    )
  }

  DataFlow::SourceNode getParameter(string name) {
    // Request parameters
    exists(MemberExpr me |
      me.getPropertyName() = "parameters" and
      result = DataFlow::exprNode(me.getProperty(name))
    )
  }
}

/**
 * XSJS Response Object
 * Represents outgoing HTTP responses
 */
class XSJSResponse extends DataFlow::Node {
  XSJSResponse() {
    // $.response in XSJS
    exists(MemberExpr me |
      me.getPropertyName() = "response" and
      me.getBase().(GlobalVarAccess).getName() = "$"
    )
  }

  DataFlow::SinkNode setBody() {
    // Set response body
    exists(MethodCallExpr mce |
      mce.getMethodName() = "setBody" |
      result = DataFlow::exprNode(mce.getArgument(0))
    )
  }

  DataFlow::SinkNode setHeader(string name) {
    // Set response header
    exists(MethodCallExpr mce |
      mce.getMethodName() = "setHeader" |
      result = DataFlow::exprNode(mce.getArgument(1))
    )
  }
}

/**
 * XSJS Database Connection
 * Database operations in XSJS
 */
class XSDatabaseConnection extends DataFlow::Node {
  XSDatabaseConnection() {
    // $.db in XSJS
    exists(MemberExpr me |
      me.getPropertyName() = "db" and
      me.getBase().(GlobalVarAccess).getName() = "$"
    )
  }

  DataFlow::SourceNode executeQuery(string sql) {
    // Execute SQL query
    exists(MethodCallExpr mce |
      mce.getMethodName() = "execute" or
      mce.getMethodName() = "executeQuery"
    )
  }
}

/**
 * XSJS Prepared Statement
 * Prepared statements for parameterized queries
 */
class XSPreparedStatement extends DataFlow::Node {
  XSPreparedStatement() {
    // Prepared statement creation
    exists(CallExpr call |
      call.getCallee().(PropertyLookup).getPropertyName() = "prepareStatement"
    )
  }

  DataFlow::SinkNode setParameter(int index) {
    // Set parameter in prepared statement
    exists(MethodCallExpr mce |
      mce.getMethodName().regexpMatch("set.*") |
      result = DataFlow::exprNode(mce.getArgument(0))
    )
  }
}

/**
 * XSJS Session
 * Session management in XSJS
 */
class XSSession extends DataFlow::Node {
  XSSession() {
    // $.session in XSJS
    exists(MemberExpr me |
      me.getPropertyName() = "session" and
      me.getBase().(GlobalVarAccess).getName() = "$"
    )
  }

  DataFlow::SourceNode getUser() {
    // Get current user
    exists(MemberExpr me |
      me.getPropertyName() = "user" |
      this.asExpr() = me
    )
  }
}

/**
 * XSJS Security - SQL Injection Sink
 * Potential SQL injection points
 */
class XSJSSQLInjectionSink extends DataFlow::Node {
  XSJSSQLInjectionSink() {
    // Direct SQL execution without prepared statements
    exists(MethodCallExpr mce |
      mce.getMethodName() = "execute" or
      mce.getMethodName() = "executeQuery" or
      mce.getMethodName() = "executeUpdate"
    )
  }
}

/**
 * XSJS Security - SQL Injection Source
 * User input sources
 */
class XSJSSQLInjectionSource extends DataFlow::Node {
  XSJSSQLInjectionSource() {
    // Request parameters, body, headers
    exists(XSJSRequest req |
      this = req.getBody() or
      this = req.getParameter(_) or
      exists(string p | this = req.getParameter(p))
    )
  }
}

/**
 * XSJS Security - Authorization Check
 * Authorization verification in XSJS
 */
class XSJSAuthorizationCheck extends DataFlow::Node {
  XSJSAuthorizationCheck() {
    // Authorization methods
    exists(MethodCallExpr mce |
      mce.getMethodName().regexpMatch("(hasAppPrivilege|hasSystemPrivilege|isAuthorized|check.*Authorization)")
    )
  }
}

/**
 * XSJS Security - Authentication Check
 * Authentication verification in XSJS
 */
class XSJSAuthenticationCheck extends DataFlow::Node {
  XSJSAuthenticationCheck() {
    // Authentication methods
    exists(MethodCallExpr mce |
      mce.getMethodName().regexpMatch("(isAuthenticated|validateToken|checkSession)")
    )
  }
}

/**
 * XSJS Library
 * Reusable XSJS libraries
 */
class XSJSLibrary extends Function {
  XSJSLibrary() {
    // Library files
    this.getFile().getAbsolutePath().regexpMatch(".*\\.xsjslib$")
  }

  string getLibraryName() {
    result = this.getFile().getStem()
  }
}

/**
 * XSJS Stored Procedure
 * Database stored procedures
 */
class XSJSStoredProcedure extends DataFlow::Node {
  XSJSStoredProcedure() {
    // Procedure calls
    exists(MethodCallExpr mce |
      mce.getMethodName().regexpMatch("call.*Procedure")
    )
  }

  string getProcedureName() {
    // Extract procedure name
    this.(MethodCallExpr).getCallee().(PropertyLookup).getPropertyName()
  }
}

/**
 * XSJS Trace/Debug Output
 * Debug logging in XSJS
 */
class XSJSTrace extends DataFlow::Node {
  XSJSTrace() {
    // Trace methods
    exists(MethodCallExpr mce |
      mce.getMethodName() = "trace" or
      mce.getMethodName() = "debug" or
      mce.getMethodName() = "log"
    )
  }
}

/**
 * XSJS HTTP Response Header
 * Setting HTTP headers
 */
class XSJSResponseHeader extends DataFlow::Node {
  XSJSResponseHeader() {
    // Setting headers
    exists(MethodCallExpr mce |
      mce.getMethodName() = "setHeader" or
      mce.getMethodName() = "addHeader"
    )
  }

  string getHeaderName() {
    // Get header name being set
    this.(MethodCallExpr).getArgument(0).(StringLiteral).getValue()
  }
}

/**
 * XSJS Input Validation
 * Input validation patterns
 */
class XSJSInputValidation extends DataFlow::Node {
  XSJSInputValidation() {
    // Validation methods
    exists(MethodCallExpr mce |
      mce.getMethodName().regexpMatch("(validate|check|sanitize).*") or
      mce.getCallee().(PropertyLookup).getPropertyName().regexpMatch(".*Validator.*")
    )
  }
}

/**
 * XSJS SQL Injection Flow
 * Track potential SQL injection vulnerabilities
 */
module XSJSSQLInjectionFlow {
  predicate sqlInjectionFlow(DataFlow::SourceNode source, DataFlow::SinkNode sink) {
    // User input flows to SQL execution without prepared statement
    source instanceof XSJSSQLInjectionSource and
    sink instanceof XSJSSQLInjectionSink and
    not exists(XSPreparedStatement ps |
      source = ps.setParameter(_)
    )
  }
}

/**
 * XSJS XSCR Component
 * XSCR (XS JavaScript Runtime) components
 */
class XSCRComponent extends DataFlow::Node {
  XSCRComponent() {
    // XSCR file imports
    exists(ImportDeclaration id |
      id.getImportedPath().getValue().regexpMatch(".*\\.xsjs$")
    )
  }

  string getComponentType() {
    // Determine component type
    this.getFile().getAbsolutePath().regexpCapture(".*\\.(\\w+)$", 1)
  }
}
