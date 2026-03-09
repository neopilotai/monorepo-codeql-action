/**
 * SAP CAP (Cloud Application Programming Model) - Data Model Definitions
 * 
 * This file provides CodeQL modeling for SAP CAP framework components
 * including entities, services, handlers, and common security patterns.
 */

import javascript

/**
 * SAP CAP Entity Definition
 * Entities are defined in the schema using CDS (Core Data Services)
 */
class CAPEntity extends DataFlow::Node {
  CAPEntity() {
    // Entity definitions in *.cds files
    exists(File f | 
      f.getAbsolutePath().regexpMatch(".*\\.cds$") |
      f.getContents().regexpMatch("(?s).*entity\\s+\\w+.*")
    )
  }

  string getEntityName() {
    // Extract entity name from CDS definition
    this.(Expr).getUnderlyingValue().(StringLiteral).getValue().regexpCapture("entity\\s+(\\w+)", 1)
  }
}

/**
 * CAP Service Definition
 * Services expose entities and define OData endpoints
 */
class CAPService extends DataFlow::Node {
  CAPService() {
    exists(File f | 
      f.getContents().regexpMatch("(?s).*service\\s+\\w+.*")
    )
  }

  string getServiceName() {
    // Extract service name
    this.(Expr).getUnderlyingValue().(StringLiteral).getValue().regexpCapture("service\\s+(\\w+)", 1)
  }
}

/**
 * CAP Event Handler
 * Event handlers process business logic for CRUD operations
 */
class CAPEventHandler extends Function {
  CAPEventHandler() {
    // Event handlers in handler files
    this.getFile().getAbsolutePath().regexpMatch(".*handler\\.js$") or
    this.getFile().getAbsolutePath().regexpMatch(".*handlers\\/.*\\.js$")
  }

  string getEventType() {
    // Determine event type (before, after, on)
    this.getName().regexpCapture("(before|after|on)([A-Z]\\w+)", 1)
  }

  string getEntityName() {
    // Extract entity name from handler name
    this.getName().regexpCapture("(before|after|on)([A-Z]\\w+)", 2)
  }
}

/**
 * CAP Parameter Binding
 * Parameter bindings for parameterized queries
 */
class CAPParameterBinding extends DataFlow::Node {
  CAPParameterBinding() {
    // $PARAMETER in CDS queries
    exists(Identifier id | 
      id.getName() = "$PARAMETER" and
      this.asExpr() = id
    )
  }
}

/**
 * CAP Navigation Property Access
 * Navigation properties for related entities
 */
class CAPNavigationProperty extends DataFlow::Node {
  CAPNavigationProperty() {
    // Accessing navigation properties like Orders, Items, etc.
    exists(PropertyAccess pa |
      pa.getPropertyName().regexpMatch("[A-Z][a-zA-Z]*")
    )
  }
}

/**
 * CAP Projection Definition
 * Projections on entities
 */
class CAPProjection extends DataFlow::Node {
  CAPProjection() {
    exists(File f |
      f.getContents().regexpMatch("(?s).*projection\\s+on\\s+\\w+.*")
    )
  }
}

/**
 * SAP CAP Security - Authentication Check
 * Models where authentication is checked
 */
class CAPAuthenticationCheck extends DataFlow::Node {
  CAPAuthenticationCheck() {
    // @requires: 'authenticated-user' annotation
    exists(Decorator dec |
      dec.getDecorator().getText().regexpMatch("@requires.*authenticated")
    )
  }
}

/**
 * SAP CAP Security - Authorization Check
 * Models where authorization is checked
 */
class CAPAuthorizationCheck extends DataFlow::Node {
  CAPAuthorizationCheck() {
    // check() calls in handlers
    exists(CallExpr call |
      call.getCallee().(Identifier).getName() = "check" and
      this.asExpr() = call
    )
  }
}

/**
 * CAP CDS to SQL Taint Tracking
 * Tracks flow from user input through CDS queries
 */
module CAPTaintTracking {
  DataFlow::SourceNode capInput() {
    // Parameters from request handlers
    result.(FunctionParameter).getName().regexpMatch("req|request|params|.*")
  }

  DataFlow::SourceNode capQuery() {
    // SELECT statements in CAP handlers
    exists(CallExpr call |
      call.getCallee().(PropertyLookup).getPropertyName() = "run" or
      call.getCallee().(PropertyLookup).getPropertyName() = "execute"
    )
  }

  predicate capFlow(DataFlow::SourceNode source, DataFlow::SinkNode sink) {
    // Track potential SQL injection in CAP queries
    exists(DataFlow::PathNode src, DataFlow::PathNode snk |
      src.getNode() = source and
      snk.getNode() = sink
    )
  }
}
