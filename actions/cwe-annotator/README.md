# CWE Annotator

A tool to annotate CodeQL SARIF results with CWE (Common Weakness Enumeration) tags, enabling compliance with security standards and better vulnerability categorization.

## Overview

The CWE Annotator parses CodeQL SARIF results and adds CWE tags to both rules and results. This enables:

- **Standard Compliance**: Map vulnerabilities to CWE taxonomy
- **Vulnerability Categorization**: Organize findings by CWE category
- **Severity Tracking**: Add severity information from CWE
- **Reporting**: Generate CSV reports for compliance

## Installation

```bash
cd cwe-annotator
npm install
```

## Usage

### Command Line

```bash
# Basic usage
node cwe-annotator.js input.sarif

# Specify output
node cwe-annotator.js -i input.sarif -o output.sarif

# Verbose output with summary
node cwe-annotator.js -i input.sarif -o output.sarif -v -s

# CSV output format
node cwe-annotator.js -i input.sarif -f csv

# Dry run (show what would be done)
node cwe-annotator.js -i input.sarif -d

# List all CWE mappings
node cwe-annotator.js -l
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --input` | Input SARIF file | Required |
| `-o, --output` | Output SARIF file | input-annotated.sarif |
| `-v, --verbose` | Verbose output | false |
| `-s, --summary` | Show annotation summary | false |
| `-d, --dry-run` | Don't write output | false |
| `-f, --format` | Output format: json, csv | json |
| `--no-category` | Don't add category tags | - |
| `--no-severity` | Don't add severity tags | - |
| `--no-cwe-id` | Don't add CWE ID tags | - |
| `--no-cwe-name` | Don't add CWE name tags | - |
| `-l, --list-cwe` | List all CWE mappings | - |
| `-h, --help` | Show help | - |

## GitHub Action

```yaml
name: CWE Annotation

on:
  workflow_run:
    workflows: [CodeQL Analysis]
    types: [completed]

jobs:
  annotate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Download SARIF
        uses: actions/download-artifact@v4
        with:
          name: sarif-results
          path: results.sarif
          
      - name: Annotate with CWE
        uses: khulnasoft/monorepo-codeql-action/cwe-annotator@main
        with:
          sarif-file: results.sarif
          summary: true
          
      - name: Upload Annotated SARIF
        uses: actions/upload-artifact@v4
        with:
          name: cwe-annotated-sarif
          path: results-cwe-annotated.sarif
```

## Tags Added

The annotator adds the following tags to SARIF results:

| Tag | Example | Description |
|-----|---------|-------------|
| `cwe:CWE-XXX` | `cwe:CWE-89` | CWE ID |
| `cwe-name:xxx` | `cwe-name:sql-injection` | CWE name (kebab-case) |
| `cwe-category:xxx` | `cwe-category:injection` | Security category |
| `cwe-severity:xxx` | `cwe-severity:high` | Severity level |

## Supported Languages

- JavaScript / TypeScript
- Java
- Kotlin
- C#
- Python
- Go
- Ruby
- PHP
- C / C++
- Swift
- Rust

## CWE Categories

| Category | CWEs |
|----------|------|
| Injection | CWE-78, CWE-88, CWE-89, CWE-90, CWE-91, CWE-93, CWE-94, CWE-95, CWE-96, CWE-97, CWE-98, CWE-99 |
| XSS | CWE-79, CWE-80, CWE-81, CWE-82, CWE-83, CWE-84, CWE-85, CWE-86, CWE-87 |
| Path Traversal | CWE-22, CWE-23, CWE-36, CWE-73 |
| Cryptography | CWE-310, CWE-311, CWE-312, CWE-319, CWE-326, CWE-327, CWE-331, CWE-338 |
| Credentials | CWE-259, CWE-321, CWE-798 |
| Deserialization | CWE-502 |
| Authentication | CWE-287, CWE-303, CWE-304 |
| Authorization | CWE-862, CWE-863 |
| Prototype Pollution | CWE-1321, CWE-1419, CWE-1420 |
| Denial of Service | CWE-400, CWE-1059, CWE-1333 |
| Information Disclosure | CWE-200, CWE-201, CWE-209 |

## Example Output

### SARIF with CWE Tags

```json
{
  "results": [
    {
      "ruleId": "js/sql-injection",
      "message": { "text": "SQL query built from user sources" },
      "properties": {
        "tags": [
          "cwe:CWE-89",
          "cwe-name:sql-injection",
          "cwe-category:injection",
          "cwe-severity:high"
        ]
      }
    }
  ]
}
```

### CSV Report

```
RuleID,CWE_ID,CWE_Name,Category,Severity
js/injection,CWE-89,SQL Injection,Injection,high
js/injection,CWE-94,Code Injection,Injection,critical
js/xss,CWE-79,Cross-site Scripting (XSS),XSS,high
```

## Integration

### With CodeQL

```bash
# Run CodeQL analysis
codeql database create my-db --language=javascript --source-root=.
codeql database analyze my-db --format=sarif-latest --output=results.sarif

# Annotate with CWE
node cwe-annotator.js results.sarif -o results-cwe.sarif -s

# Upload to GitHub
gh api repos/:owner/:repo/code-scanning/sarifs -X POST -F sarif=@results-cwe.sarif
```

### With Security Dashboard

Upload the annotated SARIF to GitHub Advanced Security or third-party security dashboards for enhanced reporting.

## License

MIT
