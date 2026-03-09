# CodeQL Development MCP Server

An MCP (Model Context Protocol) server enabling AI-assisted CodeQL query development. This server provides tools for creating databases, running queries, and analyzing code using CodeQL.

## Features

- **Create CodeQL databases** from source code
- **Run CodeQL queries** against databases
- **Analyze code** with security and quality queries
- **List available queries** by category
- **Validate queries** for syntax errors
- **Resolve languages** from source code
- **Build projects** for analysis

## Installation

```bash
cd mcp-server
npm install
```

## Usage

### Start the MCP Server

```bash
npm start
```

### Available Tools

| Tool | Description |
|------|-------------|
| `codeql_create_database` | Create a CodeQL database from source code |
| `codeql_run_query` | Run a CodeQL query against a database |
| `codeql_analyze` | Analyze a database with CodeQL queries |
| `codeql_database_info` | Get information about a CodeQL database |
| `codeql_list_queries` | List available CodeQL query suites |
| `codeql_get_query_help` | Get help text for a CodeQL query |
| `codeql_validate_query` | Validate a CodeQL query for syntax errors |
| `codeql_resolve_language` | Resolve the language of source code |
| `codeql_build_project` | Build a project for CodeQL analysis |

## Example Usage

### Create a Database

```json
{
  "name": "codeql_create_database",
  "arguments": {
    "language": "javascript",
    "sourceRoot": "./src",
    "outputPath": "./codeql-db"
  }
}
```

### Run a Query

```json
{
  "name": "codeql_run_query",
  "arguments": {
    "query": "import javascript\nselect 1",
    "database": "./codeql-db",
    "outputFormat": "json"
  }
}
```

### Analyze Code

```json
{
  "name": "codeql_analyze",
  "arguments": {
    "database": "./codeql-db",
    "queries": "security",
    "outputFormat": "sarif",
    "outputPath": "results.sarif"
  }
}
```

### List Available Queries

```json
{
  "name": "codeql_list_queries",
  "arguments": {
    "category": "security",
    "language": "javascript"
  }
}
```

## Query Categories

- `security` - Security queries
- `security-extended` - Extended security queries
- `security-and-quality` - Security and quality queries
- `quality` - Quality queries

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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CODEQL_PATH` | Path to CodeQL CLI | `codeql` |

## GitHub Action

Use the MCP server as a GitHub Action:

```yaml
jobs:
  codeql:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: CodeQL Analysis
        uses: khulnasoft/monorepo-codeql-action/mcp-server@main
        with:
          database-path: ./codeql-db
          queries: security
          output-format: sarif
```
