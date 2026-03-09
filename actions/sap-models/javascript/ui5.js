/**
 * SAP UI5 (SAPUI5/OpenUI5) - Data Model Definitions
 * 
 * This file provides CodeQL modeling for SAP UI5 framework components
 * including controllers, models, views, and security patterns.
 */

import javascript

/**
 * SAP UI5 Controller
 * UI5 controllers contain the application logic
 */
class UI5Controller extends Function {
  UI5Controller() {
    // Controller files typically named *.controller.js
    this.getFile().getAbsolutePath().regexpMatch(".*\\.controller\\.js$") or
    // extend() calls creating controllers
    exists(CallExpr call |
      call.getCallee().(PropertyLookup).getPropertyName() = "extend" and
      call.getArgument(0).(StringLiteral).getValue().regexpMatch(".*\\.controller$")
    )
  }

  string getControllerName() {
    // Get controller name from extend or filename
    exists(CallExpr call |
      call.getCallee().(PropertyLookup).getPropertyName() = "extend" |
      result = call.getArgument(0).(StringLiteral).getValue()
    ) or
    result = this.getFile().getStem()
  }

  string getViewName() {
    // Derive view name from controller name
    result = this.getControllerName().replace(".controller", "")
  }
}

/**
 * UI5 Event Handler
 * Methods that handle UI5 events
 */
class UI5EventHandler extends Function {
  UI5EventHandler() {
    // Methods in UI5 controllers that handle events
    this.getParent() instanceof UI5Controller or
    this.getName().regexpMatch("on[A-Z].*")
  }

  string getEventName() {
    // Extract event name from handler name (onEventName -> EventName)
    this.getName().regexpCapture("on([A-Z].*)", 1)
  }
}

/**
 * UI5 Model
 * Data models in UI5 (JSON, OData, XML models)
 */
class UI5Model extends DataFlow::Node {
  UI5Model() {
    // Model creation via getModel(), setModel(), or model constructors
    exists(CallExpr call |
      call.getCallee().(PropertyLookup).getPropertyName() = "getModel" or
      call.getCallee().(PropertyLookup).getPropertyName() = "setModel" or
      call.getCallee().(PropertyLookup).getPropertyName().regexpMatch("(JSONModel|ODataModel|XMLModel|ResourceModel)")
    )
  }

  string getModelType() {
    // Determine model type
    exists(CallExpr call |
      call.getCallee().(PropertyLookup).getPropertyName() = "JSONModel" |
      result = "JSON"
    ) or
    exists(CallExpr call |
      call.getCallee().(PropertyLookup).getPropertyName().regexpMatch("OData.*Model") |
      result = "OData"
    ) or
    result = "Unknown"
  }
}

/**
 * UI5 XML View
 * XML-based UI5 views
 */
class UI5XMLView extends XML::Element {
  UI5XMLView() {
    // View files in XML format
    this.getFile().getAbsolutePath().regexpMatch(".*\\.view\\.xml$")
  }

  string getViewName() {
    // Extract view name from ID or filename
    this.getAttribute("id").getValue().regexpCapture(".*\\.(\\w+)$", 1)
  }

  string getControllerName() {
    // Get associated controller
    this.getAttribute("controllerName").getValue()
  }
}

/**
 * UI5 Component
 * UI5 components encapsulate application parts
 */
class UI5Component extends DataFlow::Node {
  UI5Component() {
    // Component definition files
    exists(File f |
      f.getAbsolutePath().regexpMatch(".*Component\\.js$") or
      f.getAbsolutePath().regexpMatch(".*\\/Component\\.js$")
    )
  }

  string getComponentName() {
    // Extract component name
    exists(CallExpr call |
      call.getCallee().(PropertyLookup).getPropertyName() = "extend" |
      result = call.getArgument(0).(StringLiteral).getValue()
    )
  }
}

/**
 * UI5 Resource Bundle
 * Localization strings in UI5
 */
class UI5ResourceBundle extends DataFlow::Node {
  UI5ResourceBundle() {
    // Resource bundle loading
    exists(CallExpr call |
      call.getCallee().(PropertyLookup).getPropertyName() = "getResourceBundle"
    )
  }

  string getBundleName() {
    // Get resource bundle name
    exists(CallExpr call |
      call.getCallee().(PropertyLookup).getPropertyName() = "getResourceBundle" |
      result = call.getArgument(0).(StringLiteral).getValue()
    )
  }
}

/**
 * UI5 Security - XSS Sink
 * Potential XSS vulnerabilities in UI5
 */
class UI5XSSSink extends DataFlow::Node {
  UI5XSSSink() {
    // Methods that render HTML without escaping
    exists(MethodCallExpr mce |
      mce.getMethodName() = "setHTML" or
      mce.getMethodName() = "setInnerHTML" or
      mce.getMethodName().regexpMatch("insertHTML.*") or
      mce.getMethodName().regexpMatch("unsafe.*")
    )
  }
}

/**
 * UI5 Security - XSS Source
 * User input sources in UI5
 */
class UI5XSSSource extends DataFlow::Node {
  UI5XSSSource() {
    // Getter methods that retrieve user data
    exists(MethodCallExpr mce |
      mce.getMethodName() = "getValue" or
      mce.getMethodName() = "getText" or
      mce.getMethodName() = "getParameter" or
      mce.getMethodName().regexpMatch("get.*Input")
    )
  }
}

/**
 * UI5 OData Call
 * OData service calls in UI5
 */
class UI5ODataCall extends DataFlow::Node {
  UI5ODataCall() {
    // OData model operations
    exists(MethodCallExpr mce |
      mce.getMethodName().regexpMatch("(read|create|update|remove).*") or
      mce.getMethodName().regexpMatch("/.*")
    )
  }

  string getOperation() {
    // Get OData operation type
    this.(MethodCallExpr).getMethodName().regexpCapture("(read|create|update|remove)", 1)
  }

  string getEntitySet() {
    // Get entity set being accessed
    this.(MethodCallExpr).getMethodName().regexpCapture("/(\\w+)", 1)
  }
}

/**
 * UI5 Bindings
 * Property and context bindings
 */
class UI5Binding extends DataFlow::Node {
  UI5Binding() {
    // Binding expressions
    exists(StringLiteral sl |
      sl.getValue().regexpMatch("\\{.*\\}")
    )
  }

  string getBindingPath() {
    // Extract binding path
    this.(StringLiteral).getValue().regexpCapture("\\{(.+)\\}", 1)
  }
}

/**
 * UI5 Formatter Function
 * Functions that format data for display
 */
class UI5Formatter extends Function {
  UI5Formatter() {
    // Formatter files or methods
    this.getFile().getAbsolutePath().regexpMatch(".*formatter.*\\.js$") or
    exists(Decorator dec |
      dec.getDecorator().getText().regexpMatch("@formatter")
    )
  }
}

/**
 * UI5 Security - Authentication
 * Check for authentication in UI5 apps
 */
class UI5AuthenticationCheck extends DataFlow::Node {
  UI5AuthenticationCheck() {
    // Authentication checks in UI5
    exists(MethodCallExpr mce |
      mce.getMethodName().regexpMatch("(isLoggedIn|checkToken|validateSession)")
    )
  }
}

/**
 * UI5 Security - Authorization
 * Check for authorization in UI5 apps
 */
class UI5AuthorizationCheck extends DataFlow::Node {
  UI5AuthorizationCheck() {
    // Authorization checks in UI5
    exists(MethodCallExpr mce |
      mce.getMethodName().regexpMatch("(hasRole|hasPermission|check.*Access)")
    )
  }
}

/**
 * UI5 Cross-Site Scripting Flow
 * Track potential XSS from source to sink
 */
module UI5XSSFlow {
  predicate xssFlow(DataFlow::SourceNode source, DataFlow::SinkNode sink) {
    // User input flows to HTML rendering without escaping
    source instanceof UI5XSSSource and
    sink instanceof UI5XSSSink
  }
}
