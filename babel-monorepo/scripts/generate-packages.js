#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CATEGORIES = {
  'babel-core': ['parser', 'generator', 'traverse', 'types', 'template', 'code-frame', 'highlight', 'populator'],
  'babel-preset': ['env', 'react', 'typescript', 'flow', 'vue', 'minify', 'preset-env', 'preset-react', 'preset-typescript'],
  'babel-plugin': ['transform-runtime', 'transform-arrow-functions', 'transform-classes', 'transform-modules', 'transform-spread', 'transform-destructuring', 'proposal-decorators', 'proposal-pipeline-operator'],
  'babel-cli': ['cli', 'node', 'babel-external-helpers'],
  'babel-types': ['generated/validators', 'generated/builders', 'generated/asserters', 'generated/regexps', 'generated/constants'],
  'babel-helper': ['helper-validator', 'helper-wrap-function', 'helper-optimise-call-expression', 'helper-bind', 'helper-compilation-targets', 'helper-create-class-features-plugin', 'helper-create-regexp-features-plugin', 'helper-environment-visitor', 'helper-explode-assignable-expression', 'helper-function-name', 'helper-get-function-arity', 'helper-hoist-variables', 'helper-member-expression-to-functions', 'helper-module-imports', 'helper-named-capturing-groups-regex', 'helper-plugin-utils', 'helper-regex', 'helper-remap-async-to-generator', 'helper-replace-supers', 'helper-skip-on-expression', 'helper-split-export-expression', 'helper-validate-identifier', 'helper-wrap-identifier'],
  'babel-parser': ['babylon', 'plugins/async-generators', 'plugins/decorators-legacy', 'plugins/flow', 'plugins/jsx', 'plugins/typescript', 'plugins/placeholders', 'plugins/v8intrinsic'],
  'babel-generator': ['generators/flow', 'generators/jsx', 'generators/typescript', 'generators/async', 'generators/methods'],
  'babel-preset-env': ['preset-options', 'preset-data', 'preset-modules', 'preset-plugin-cc', 'preset-plugin-corejs', 'preset-plugin-regexp'],
  'babel-runtime': ['core-js', 'regenerator', 'helpers/asyncToGenerator', 'helpers/classCallCheck', 'helpers/createClass', 'helpers/defineEnumerableProperties', 'helpers/defaults', 'helpers/defineProperty', 'helpers/extends', 'helpers/exportFromStar', 'helpers/get', 'helpers/inherits', 'helpers/initializerDefineProperty', 'helpers/initializerWarningHelper', 'helpers/interopRequireDefault', 'helpers/interopRequireWildcard', 'helpers/jsx', 'helpers/newArrowCheck', 'helpers/objectDestructuringEmpty', 'helpers/possibleConstructorReturn', 'helpers/selfGlobal', 'helpers/set', 'helpers/setPrototypeOf', 'helpers/slicedToArray', 'helpers/slicedToArrayLoose', 'helpers/taggedTemplateLiteral', 'helpers/taggedTemplateLiteralLoose', 'helpers/temporalRef', 'helpers/temporalUndefined', 'helpers/toArray', 'helpers/toConsumableArray', 'helpers/typeof', 'helpers/typeof', 'helpers/wrapAsyncGenerator', 'helpers/wrapNativeSuper', 'helpers/wrapRegExp'],
  'babel-template': ['builders', 'validators'],
  'babel-traverse': ['path', 'path/introspection', 'path/replacement', 'visitors', 'scope'],
  'babel-types': ['validators', 'builders', 'clone', 'converters', 'definitions'],
  'babel-statements': ['break', 'continue', 'return', 'throw', 'try'],
  'babel-expressions': ['array', 'assignment', 'binary', 'call', 'chain', 'class', 'comparison', 'conditional', 'function', 'identifier', 'logical', 'member', 'meta', 'new', 'optional', 'sequence', 'spread', 'super', 'tagged', 'template', 'unary', 'update', 'yield'],
  'babel-statements': ['block', 'break', 'continue', 'debugger', 'do', 'empty', 'expression', 'for', 'if', 'label', 'return', 'switch', 'throw', 'try', 'var', 'while', 'with'],
  'babel-module': ['import-meta', 'commonjs', 'amd', 'esmodule', 'systemjs', 'umd', 'cjs'],
  'babel-messages': ['extract', 'build', 'validate', 'locations'],
  'babel-code-frame': ['highlight', 'lines', 'markers', 'types'],
  'babel-plugin-syntax': ['async-generators', 'bigint', 'class-properties', 'class-private-properties', 'decorators', 'do-expressions', 'dynamic-import', 'export-default-from', 'export-namespace-from', 'flow', 'function-bind', 'function-sent', 'import-meta', 'jsx', 'logical-assignment-operators', 'nullish-coalescing-operator', 'numeric-separator', 'object-rest-spread', 'optional-catch-binding', 'optional-chaining', 'partial-application', 'pipeline-operator', 'private-methods', 'throw-expressions', 'top-level-await', 'typescript', 'v8intrinsic'],
  'babel-plugin-transform': ['arrow-functions', 'async-functions', 'async-generator-functions', 'block-scoped-functions', 'block-scoping', 'classes', 'computed-properties', 'concise-method-property', 'constructor-properties', 'destructuring', 'do-expressions', 'explicit-resource-management', 'export-default-from', 'export-namespace-from', 'function-bind', 'function-name', 'function-sent', 'literals', 'logical-assignment-operators', 'member-expression', 'modules-amd', 'modules-commonjs', 'modules-systemjs', 'modules-umd', 'new-target', 'nullish-coalescing-operator', 'numeric-separator', 'object-rest-spread', 'optional-catch-binding', 'optional-chaining', 'parameters', 'pipeline-operator', 'private-methods', 'property-mutators', 'property-semantics', 'react-jsx', 'react-display-name', 'react-hot-loader', 'regenerator', 'runtime', 'shorthand-properties', 'spread', 'stickyregex', 'template-literals', 'typeof-symbol', 'undefined-to-void', 'unicode-abrev', 'unicode-flags', 'unicode-property-regex', 'unicode-sets-regex', 'uppercase-escapes'],
  'babel-plugin-proposal': ['async-generator-functions', 'class-properties', 'class-static-block', 'decorators', 'do-expressions', 'dynamic-import', 'export-default-from', 'export-namespace-from', 'function-bind', 'function-sent', 'logical-assignment-operators', 'nullish-coalescing-operator', 'numeric-separator', 'object-rest-spread', 'optional-catch-binding', 'optional-chaining', 'partial-application', 'pipeline-operator', 'private-methods', 'throw-expressions', 'top-level-await'],
  'babel-preset-stage': ['preset-stage-0', 'preset-stage-1', 'preset-stage-2', 'preset-stage-3', 'preset-stage-4'],
  'babel-tools': ['util', 'build', 'config', 'cache', 'version'],
  'babel-doc': ['generate', 'utils', 'templates'],
  'babel-eslint': ['parser', 'rules', 'utils'],
  'babylon': ['parser', 'tokenizer', 'index']
};

const PACKAGE_CATEGORIES = Object.keys(CATEGORIES);

const packageTemplate = (name, category, deps) => ({
  name,
  version: "1.0.0",
  description: `${name} - Babel ${category} package`,
  main: "lib/index.js",
  "jsnext:main": "src/index.js",
  "module": "src/index.js",
  "types": "lib/index.d.ts",
  "files": [
    "lib",
    "src"
  ],
  "scripts": {
    "build": "babel src --out-dir lib --extensions \".ts,.tsx,.js,.jsx\"",
    "clean": "rm -rf lib",
    "prepublishOnly": "yarn build",
    "test": "jest"
  },
  dependencies: {
    "@babel/types": "^8.0.0",
    "@babel/parser": "^8.0.0",
    "@babel/helper-plugin-utils": "^8.0.0",
    ...deps
  },
  devDependencies: {
    "@babel/cli": "^8.0.0",
    "@babel/core": "^8.0.0",
    "jest": "^29.0.0",
    "typescript": "^5.0.0"
  },
  keywords: ["babel", category],
  license: "MIT"
});

const tsConfigTemplate = {
  compilerOptions: {
    target: "ES2020",
    module: "commonjs",
    lib: ["ES2020"],
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    outDir: "./lib",
    rootDir: "./src",
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    moduleResolution: "node",
    resolveJsonModule: true,
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@babel/core": ["../babel-core/lib"],
      "@babel/types": ["../babel-types/lib"]
    }
  },
  include: ["src/**/*"],
  exclude: ["node_modules", "lib", "*.test.js"]
};

const jestConfigTemplate = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.js"],
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleNameMapper: {
    "^@babel/(.*)$": "<rootDir>/../babel-$1/src"
  }
};

const gitignoreTemplate = `node_modules/
lib/
dist/
*.log
.env
.env.local
coverage/
.DS_Store
*.tsbuildinfo
`;

const README = (name, category) => `# @babel/${name}

> Babel ${category} package for transforming JavaScript

## Install

\`\`\`bash
npm install @babel/${name}
\`\`\`

## Usage

\`\`\`javascript
import * as transformer from "@babel/${name}";

transformer.transform(code, options);
\`\`\`

## License

MIT
`;

const indexTemplate = (name) => `/**
 * ${name} - Babel transformation package
 */

export * from "./transform";
export * from "./validation";
`;

function generatePackages() {
  const rootDir = path.join(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');
  
  if (!fs.existsSync(packagesDir)) {
    fs.mkdirSync(packagesDir, { recursive: true });
  }

  let packageCount = 0;
  let totalPackages = 0;

  // First, count total packages
  for (const [category, subPackages] of Object.entries(CATEGORIES)) {
    totalPackages += subPackages.length;
  }

  console.log(`Generating ${totalPackages} packages...`);

  for (const [category, subPackages] of Object.entries(CATEGORIES)) {
    for (const subPackage of subPackages) {
      const packageName = subPackage.includes('/') 
        ? `${category}-${subPackage.replace('/', '-')}` 
        : category === subPackage ? subPackage : `${category}-${subPackage}`;
      
      const fullName = `@babel/${packageName}`;
      const packageDir = path.join(packagesDir, packageName);

      if (!fs.existsSync(packageDir)) {
        fs.mkdirSync(packageDir, { recursive: true });
      }

      const deps = {};
      if (packageName.includes('parser')) {
        deps["@babel/types"] = "^8.0.0";
      }
      if (packageName.includes('generator')) {
        deps["@babel/types"] = "^8.0.0";
        deps["@babel/generator"] = "^8.0.0";
      }

      // package.json
      fs.writeFileSync(
        path.join(packageDir, 'package.json'),
        JSON.stringify(packageTemplate(packageName, category, deps), null, 2)
      );

      // tsconfig.json
      fs.writeFileSync(
        path.join(packageDir, 'tsconfig.json'),
        JSON.stringify(tsConfigTemplate, null, 2)
      );

      // jest.config.js
      fs.writeFileSync(
        path.join(packageDir, 'jest.config.js'),
        `module.exports = ${JSON.stringify(jestConfigTemplate, null, 2)}`
      );

      // .gitignore
      fs.writeFileSync(path.join(packageDir, '.gitignore'), gitignoreTemplate);

      // README.md
      fs.writeFileSync(path.join(packageDir, 'README.md'), README(packageName, category));

      // src/index.js
      const srcDir = path.join(packageDir, 'src');
      if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
      }
      fs.writeFileSync(path.join(srcDir, 'index.js'), indexTemplate(packageName));

      // src/transform.js
      const transformCode = `/**
 * Transform implementation for ${packageName}
 */

export function transform(code, options = {}) {
  return {
    code,
    map: null,
    ast: null
  };
}

export function transformFromAst(ast, code, options = {}) {
  return transform(code, options);
}
`;
      fs.writeFileSync(path.join(srcDir, 'transform.js'), transformCode);

      // src/validation.js
      const validationCode = `/**
 * Validation for ${packageName}
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
`;
      fs.writeFileSync(path.join(srcDir, 'validation.js'), validationCode);

      // __tests__/index.test.js
      const testsDir = path.join(srcDir, '..', '__tests__');
      if (!fs.existsSync(testsDir)) {
        fs.mkdirSync(testsDir, { recursive: true });
      }
      const testCode = `/**
 * Tests for ${packageName}
 */

import { transform, validateOptions } from '../src';

describe('${packageName}', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
`;
      fs.writeFileSync(path.join(testsDir, 'index.test.js'), testCode);

      packageCount++;
      if (packageCount % 10 === 0) {
        console.log(`Generated ${packageCount}/${totalPackages} packages...`);
      }
    }
  }

  console.log(`✓ Successfully generated ${packageCount} packages in ${packagesDir}`);
}

generatePackages();
