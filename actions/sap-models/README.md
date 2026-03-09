# SAP JavaScript Frameworks - CodeQL Models

CodeQL models for SAP JavaScript frameworks including CAP, UI5, and XSJS. These models enable security analysis and vulnerability detection in SAP applications.

## Supported Frameworks

### SAP CAP (Cloud Application Programming Model)

Models for CAP entities, services, handlers, and security patterns.

**Files:**
- `cap.js` - Core data flow models
- `queries/cap-security.ql` - Security queries

**Detected Patterns:**
- SQL Injection
- Path Traversal
- Command Injection
- Missing Authentication
- Missing Authorization
- Cross-Site Scripting (XSS)
- Hardcoded Secrets

### SAP UI5 (SAPUI5/OpenUI5)

Models for UI5 controllers, components, models, and views.

**Files:**
- `ui5.js` - UI5 framework models
- `queries/ui5-security.ql` - Security queries

**Detected Patterns:**
- Cross-Site Scripting (XSS)
- Missing Authentication
- Missing Authorization
- Insecure OData Calls
- Sensitive Data Exposure
- Unvalidated Redirects
- CSRF Protection Missing
- Insecure Resource Loading

### SAP XSJS (Extended Services for JavaScript)

Models for XSJS services, database operations, and security.

**Files:**
- `xsjs.js` - XSJS framework models
- `queries/xsjs-security.ql` - Security queries

**Detected Patterns:**
- SQL Injection
- Command Injection
- Path Traversal
- Cross-Site Scripting (XSS)
- Missing Authentication
- Missing Authorization
- CSRF Protection Missing
- Weak Cryptography
- Information Disclosure

## Usage

### GitHub Action

```yaml
name: SAP Security Analysis

on:
  push:
    paths:
      - '**.js'
      - '**.cds'

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: SAP Security Analysis
        uses: khulnasoft/monorepo-codeql-action/sap-models@main
        with:
          framework: all
          query-suite: security
```

### Command Line

```bash
# Create database
codeql database create sap-db --language=javascript --source-root=.

# Run CAP security queries
codeql database analyze sap-db sap-models/javascript/queries/cap-security.ql \
  --format=sarif --output=cap-results.sarif

# Run UI5 security queries  
codeql database analyze sap-db sap-models/javascript/queries/ui5-security.ql \
  --format=sarif --output=ui5-results.sarif

# Run XSJS security queries
codeql database analyze sap-db sap-models/javascript/queries/xsjs-security.ql \
  --format=sarif --output=xsjs-results.sarif
```

### Using Custom Query Suite

```yaml
- name: SAP Security Analysis
  uses: khulnasoft/monorepo-codeql-action/sap-models@main
  with:
    framework: cap
    query-suite: security-extended
```

## Framework-Specific Detection

### CAP Entity Handler

```javascript
// This handler is analyzed for security issues
module.exports = (srv) => {
  srv.on('read', 'Orders', async (req) => {
    // Analyzed for SQL injection
    const query = SELECT.from('Orders').where({ id: req.params.id })
    return await cds.run(query)
  })
}
```

### UI5 Controller

```javascript
// This controller is analyzed for XSS
sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  return Controller.extend("my.app.Controller", {
    onInit: function () {
      // Analyzed for security issues
      this.getView().byId("input").setHtml(this.getModel().getData())
    }
  })
})
```

### XSJS Service

```javascript
// This service is analyzed for SQL injection
$.db.prepareStatement("SELECT * FROM users WHERE id = ?");
```

## Query Results

After running the analysis, you'll receive results organized by:

- **Severity**: Error, Warning, Note
- **Category**: Security, Best Practice, Performance
- **Framework**: CAP, UI5, XSJS
- **CWE**: Common Weakness Enumeration IDs

## Integration with SAP IDE

These models can be used with:

- SAP Business Application Studio
- Visual Studio Code with CodeQL extension
- SAP CDS Compiler

## License

MIT
