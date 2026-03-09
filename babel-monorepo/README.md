# @babel/monorepo

> Babel monorepo - 280+ packages for JavaScript compilation

## Overview

This is a sample TypeScript/JavaScript monorepo with 280+ packages, simulating the Babel monorepo structure. It's designed for testing and demonstrating CodeQL analysis in large-scale monorepos.

## Packages

The monorepo contains packages in the following categories:

- **babel-core**: Core transformation packages (parser, generator, traverse, types, etc.)
- **babel-preset**: Preset configurations (env, react, typescript, flow, etc.)
- **babel-plugin**: Transformation plugins (transform-runtime, transform-classes, etc.)
- **babel-cli**: Command line interface packages
- **babel-types**: Type system packages
- **babel-helper**: Helper packages for transformations
- **babel-parser**: Parser implementations
- **babel-generator**: Code generator packages
- **babel-runtime**: Runtime packages
- **babel-module**: Module transformation packages
- **babel-plugin-syntax**: Syntax plugin packages
- **babel-plugin-transform**: Transform plugin packages
- **babel-plugin-proposal**: Proposal plugin packages
- **babel-preset-stage**: Stage presets
- **babel-tools**: Build and utility tools

## Structure

```
babel-monorepo/
├── packages/
│   ├── babel-core/
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── transform.js
│   │   │   └── validation.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.js
│   ├── babel-parser/
│   ├── babel-generator/
│   └── ... (280+ more packages)
├── package.json
├── scripts/
│   └── generate-packages.js
├── jest.config.js
├── tsconfig.json
└── README.md
```

## Usage

### Install Dependencies

```bash
cd babel-monorepo
yarn install
```

### Build All Packages

```bash
yarn build
```

### Run Tests

```bash
yarn test
```

### Run CodeQL Analysis

```bash
# Create CodeQL database
codeql database create babel-db --language=javascript --source-root=.

# Run security analysis
codeql database analyze babel-db --format=sarif-output=babel-security.sarif
```

## CodeQL Analysis Configuration

### Query Suites

- `security` - Security queries
- `security-extended` - Extended security queries
- `quality` - Code quality queries

### Example GitHub Action

```yaml
name: CodeQL Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript
          queries: security-extended
          
      - name: Build
        run: |
          yarn install
          yarn build
          
      - name: Perform Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:javascript"
```

## Package Structure

Each package follows this structure:

- `src/index.js` - Main entry point
- `src/transform.js` - Transformation logic
- `src/validation.js` - Options validation
- `__tests__/` - Test files
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest configuration

## License

MIT
