# Monorepo CodeQL Action

A comprehensive GitHub Action for running CodeQL analysis on monorepos with support for detecting changes, building matrices, scanning, and security analysis.

## Overview

This monorepo contains multiple reusable GitHub Actions for CodeQL security scanning in monorepo environments:

- **Detect Changes** - Identify which projects changed in a PR
- **Build Matrix** - Create scan matrix from project definitions  
- **Scan** - Run CodeQL analysis on projects
- **Republish SARIF** - Republish results for unchanged projects
- **Annotate SARIF** - Add project tags to SARIF files
- **Extractor** - Extract code for CodeQL analysis
- **CWE Annotator** - Map results to CWE taxonomy
- **IaC Models** - Infrastructure as Code security queries
- **SAP Models** - SAP framework (CAP, UI5, XSJS) models
- **MCP Server** - Model Context Protocol server for CodeQL

## Actions

| Action | Path | Description |
|--------|------|-------------|
| Changes | `actions/changes/` | Detect modified projects in PR |
| Scan | `actions/scan/` | Run CodeQL analysis |
| Republish SARIF | `actions/republish-sarif/` | Republish results for missing projects |
| Annotate SARIF | `actions/annotate-sarif/` | Add project tags to SARIF |
| Extractor | `actions/extractor/` | Extract code for CodeQL |
| CWE Annotator | `actions/cwe-annotator/` | Map to CWE taxonomy |
| IaC Models | `actions/iac-models/` | IaC security queries |
| SAP Models | `actions/sap-models/` | SAP framework models |
| MCP Server | `actions/mcp-server/` | CodeQL MCP server |
| Repo Scan | `actions/repo-scan/` | Full repo scanning |

## Quick Start

```yaml
name: 'CodeQL Monorepo'

on:
  pull_request:
    branches: ['main']

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      projects: ${{ steps.changes.outputs.projects }}
      scan-required: ${{ steps.changes.outputs.scan-required }}
    steps:
      - uses: actions/checkout@v4
      - uses: khulnasoft/monorepo-codeql-action/actions/changes@main
        id: changes
        with:
          projects-json: projects.json

  scan:
    if: needs.changes.outputs.scan-required == 'true'
    needs: changes
    runs-on: ubuntu-latest
    strategy:
      matrix:
        project: ${{ fromJson(needs.changes.outputs.projects).projects }}
    steps:
      - uses: khulnasoft/monorepo-codeql-action/actions/scan@main

  republish:
    needs: changes
    runs-on: ubuntu-latest
    steps:
      - uses: khulnasoft/monorepo-codeql-action/actions/republish-sarif@main
```

## Project Configuration

### JSON Format

```json
{
  "javascript": {
    "projects": {
      "Frontend": {
        "paths": ["src/frontend"],
        "build-mode": "autobuild"
      }
    }
  }
}
```

### XML Format

```xml
<projects>
  <project language="javascript" name="Frontend">
    <paths>src/frontend</paths>
  </project>
</projects>
```

## Supported Languages

- JavaScript / TypeScript
- Python
- Java / Kotlin
- C#
- Go
- Ruby
- PHP
- C / C++
- Swift
- Rust

## Additional Features

### Infrastructure as Code Security

```yaml
- uses: khulnasoft/monorepo-codeql-action/actions/iac-models@main
  with:
    language: all
```

### CWE Annotation

```yaml
- uses: khulnasoft/monorepo-codeql-action/actions/cwe-annotator@main
  with:
    sarif-file: results.sarif
```

### SAP Framework Security

```yaml
- uses: khulnasoft/monorepo-codeql-action/actions/sap-models@main
  with:
    framework: all
```

## Directory Structure

```
├── actions/
│   ├── changes/          # Detect changes in PR
│   ├── scan/            # Run CodeQL scan
│   ├── republish-sarif/ # Republish SARIF results
│   ├── annotate-sarif/  # Annotate SARIF with tags
│   ├── extractor/       # CodeQL extractor
│   ├── cwe-annotator/  # CWE mapping
│   ├── iac-models/     # IaC security queries
│   ├── sap-models/     # SAP framework models
│   ├── mcp-server/    # MCP server
│   ├── repo-scan/      # Full repo scanning
│   └── shared/         # Shared utilities
├── examples/            # Example workflows
├── tests/               # Test files
└── babel-monorepo/      # Sample monorepo
```

## License

MIT
