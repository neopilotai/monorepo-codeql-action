/**
 * SAP JavaScript Frameworks - Combined QLL
 * 
 * This file imports all SAP framework models and provides
 * comprehensive security queries for CAP, UI5, and XSJS.
 */

import javascript
import semmle.javascript.security.dataflow.XSS
import CAP
import UI5
import XSJS

/**
 * Get all SAP framework controllers/components
 */
DataFlow::Node getSAPFrameworkComponent() {
  result instanceof UI5Controller or
  result instanceof UI5Component or
  result instanceof XSJSService or
  result instanceof CAPEventHandler
}

/**
 * Security: Find potential XSS in UI5
 */
from UI5XSSSource source, UI5XSSSink sink
where UI5XSSFlow::xssFlow(source, sink)
select source, "Potential XSS: User input flows to HTML rendering"

 /**
 * Security: Find potential SQL injection in XSJS
 */
from XSJSSQLInjectionSource source, XSJSSQLInjectionSink sink
where XSJSSQLInjectionFlow::sqlInjectionFlow(source, sink)
select source, "Potential SQL injection: User input in SQL query"

/**
 * Security: Find missing authentication in CAP handlers
 */
from CAPEventHandler handler
where not exists(CAPAuthenticationCheck auth | handler = auth.getEnclosingFunction())
select handler, "CAP event handler may be missing authentication check"

/**
 * Security: Find missing authorization in CAP handlers
 */
from CAPEventHandler handler
where not exists(CAPAuthorizationCheck auth | handler = auth.getEnclosingFunction())
select handler, "CAP event handler may be missing authorization check"

/**
 * Security: Find hardcoded credentials in XSJS
 */
from StringLiteral sl
where sl.getValue().regexpMatch(".*(password|secret|token|key)\\s*[:=]\\s*['\"][^'\"]+['\"]")
select sl, "Potential hardcoded credential found"

/**
 * Security: Find missing authentication in UI5
 */
from UI5Controller controller
where not exists(UI5AuthenticationCheck auth | controller = auth.getEnclosingFunction())
select controller, "UI5 controller may be missing authentication check"

/**
 * Security: Find missing authorization in UI5
 */
from UI5Controller controller
where not exists(UI5AuthorizationCheck auth | controller = auth.getEnclosingFunction())
select controller, "UI5 controller may be missing authorization check"

/**
 * Performance: Find N+1 query patterns in CAP
 */
from CAPEventHandler handler, DataFlow::Node param
where 
  param = handler.getParameter(0) and
  exists(DataFlow::PathNode src, DataFlow::PathNode snk |
    src.getNode() = param and
    snk.getNode() = param
  )
select handler, "Potential N+1 query pattern: loop with database queries"

/**
 * Best Practice: Find trace statements in XSJS production code
 */
from XSJSTrace trace
where trace.getFile().getAbsolutePath().regexpMatch(".*\\/prod\\/.*")
select trace, "Trace statement found in production code"

 /**
 * Best Practice: Find unused parameters in CAP handlers
 */
from CAPEventHandler handler
where exists(Parameter p | 
  p.getFunction() = handler and
  not exists(p.getAnUse())
)
select handler, "Unused parameter in CAP handler"
