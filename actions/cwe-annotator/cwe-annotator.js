#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getCWEForRule, getCWEDetails, getCWEByCategory } = require('./cwe-database.js');

const DEFAULT_OPTIONS = {
  inputSarif: null,
  outputSarif: null,
  addCategoryTag: true,
  addSeverityTag: true,
  addCweIdTag: true,
  addCweNameTag: true,
  verbose: false,
  dryRun: false,
  summary: false,
  format: 'json'
};

function parseArgs(args) {
  const options = { ...DEFAULT_OPTIONS };
  const remaining = [];
  
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '-i' || arg === '--input') {
      options.inputSarif = args[++i];
    } else if (arg === '-o' || arg === '--output') {
      options.outputSarif = args[++i];
    } else if (arg === '-v' || arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '-d' || arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '-s' || arg === '--summary') {
      options.summary = true;
    } else if (arg === '--no-category') {
      options.addCategoryTag = false;
    } else if (arg === '--no-severity') {
      options.addSeverityTag = false;
    } else if (arg === '--no-cwe-id') {
      options.addCweIdTag = false;
    } else if (arg === '--no-cwe-name') {
      options.addCweNameTag = false;
    } else if (arg === '-f' || arg === '--format') {
      options.format = args[++i];
    } else if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    } else if (arg === '-l' || arg === '--list-cwe') {
      listCWECategories();
      process.exit(0);
    } else if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`);
      printHelp();
      process.exit(1);
    } else {
      remaining.push(arg);
    }
  }
  
  // Auto-detect input file from remaining args
  if (!options.inputSarif && remaining.length > 0) {
    options.inputSarif = remaining[0];
  }
  if (!options.outputSarif && remaining.length > 1) {
    options.outputSarif = remaining[1];
  }
  
  return options;
}

function printHelp() {
  console.log(`
CWE Annotator - Annotate SARIF results with CWE tags

Usage: node cwe-annotator.js [options] <input.sarif> [output.sarif]

Options:
  -i, --input <file>       Input SARIF file (optional if passed as arg)
  -o, --output <file>     Output SARIF file (optional, defaults to input-annotated.sarif)
  -v, --verbose           Verbose output
  -d, --dry-run           Don't write output, just show what would be done
  -s, --summary           Show summary of annotations
  -f, --format <format>   Output format: json, csv (default: json)
  --no-category           Don't add category tags
  --no-severity           Don't add severity tags
  --no-cwe-id             Don't add CWE ID tags
  --no-cwe-name           Don't add CWE name tags
  -l, --list-cwe          List all CWE mappings
  -h, --help              Show this help

Examples:
  node cwe-annotator.js results.sarif
  node cwe-annotator.js -i results.sarif -o annotated.sarif
  node cwe-annotator.js -i results.sarif --verbose --summary
`);
}

function listCWECategories() {
  const categories = getCWEByCategory();
  
  console.log('\nCWE Categories:\n');
  
  for (const [category, cwes] of Object.entries(categories)) {
    console.log(`## ${category}`);
    for (const cwe of cwes) {
      console.log(`  ${cwe.id}: ${cwe.name} (${cwe.severity})`);
    }
    console.log('');
  }
}

function annotateSarif(sarifData, options) {
  let resultsAnnotated = 0;
  let rulesAnnotated = 0;
  const annotationLog = [];
  
  // Track unique CWE tags
  const uniqueCWEIds = new Set();
  const uniqueCategories = new Set();
  const uniqueSeverities = new Set();
  const uniqueRules = new Set();
  
  // Get or create rules dictionary - rules can be in different locations
  let rules = [];
  if (sarifData.runs?.[0]?.tool?.driver?.rules) {
    rules = sarifData.runs[0].tool.driver.rules;
  } else if (sarifData.runs?.[0]?.rules) {
    rules = sarifData.runs[0].rules;
  }
  
  const rulesMap = new Map();
  
  for (const rule of rules) {
    if (rule.id) {
      rulesMap.set(rule.id, rule);
    }
  }
  
  // Annotate rules first
  for (const rule of rules) {
    const ruleId = rule.id;
    const cweIds = getCWEForRule(ruleId);
    
    if (cweIds.length > 0) {
      rulesAnnotated++;
      uniqueRules.add(ruleId);
      
      // Ensure properties exist
      if (!rule.properties) {
        rule.properties = {};
      }
      if (!rule.properties.tags) {
        rule.properties.tags = [];
      }
      if (!rule.properties.cwe) {
        rule.properties.cwe = [];
      }
      
      const tags = rule.properties.tags;
      const cweProps = rule.properties.cwe;
      
      for (const cweId of cweIds) {
        const details = getCWEDetails(cweId);
        
        uniqueCWEIds.add(cweId);
        uniqueCategories.add(details.category);
        uniqueSeverities.add(details.severity);
        
        // Add CWE ID tag
        if (options.addCweIdTag && !tags.includes(`cwe:${cweId}`)) {
          tags.push(`cwe:${cweId}`);
        }
        
        // Add CWE name tag
        if (options.addCweNameTag) {
          const nameTag = `cwe-name:${details.name.toLowerCase().replace(/\s+/g, '-')}`;
          if (!tags.includes(nameTag)) {
            tags.push(nameTag);
          }
        }
        
        // Add category tag
        if (options.addCategoryTag) {
          const catTag = `cwe-category:${details.category.toLowerCase().replace(/\s+/g, '-')}`;
          if (!tags.includes(catTag)) {
            tags.push(catTag);
          }
        }
        
        // Add severity tag
        if (options.addSeverityTag) {
          const sevTag = `cwe-severity:${details.severity}`;
          if (!tags.includes(sevTag)) {
            tags.push(sevTag);
          }
        }
        
        // Add to cwe property
        if (!cweProps.includes(cweId)) {
          cweProps.push({
            id: cweId,
            name: details.name,
            category: details.category,
            severity: details.severity
          });
        }
      }
      
      annotationLog.push({
        ruleId,
        cweIds,
        tagsAdded: tags.length
      });
      
      if (options.verbose) {
        console.log(`Annotated rule ${ruleId} with CWEs: ${cweIds.join(', ')}`);
      }
    }
  }
  
  // Now annotate results
  const results = sarifData.runs?.[0]?.results || [];
  
  for (const result of results) {
    const ruleId = result.ruleId;
    const cweIds = getCWEForRule(ruleId);
    
    if (cweIds.length > 0) {
      resultsAnnotated++;
      
      // Ensure properties exist
      if (!result.properties) {
        result.properties = {};
      }
      if (!result.properties.tags) {
        result.properties.tags = [];
      }
      
      const tags = result.properties.tags;
      
      for (const cweId of cweIds) {
        const details = getCWEDetails(cweId);
        
        if (options.addCweIdTag && !tags.includes(`cwe:${cweId}`)) {
          tags.push(`cwe:${cweId}`);
        }
        
        if (options.addCweNameTag) {
          const nameTag = `cwe-name:${details.name.toLowerCase().replace(/\s+/g, '-')}`;
          if (!tags.includes(nameTag)) {
            tags.push(nameTag);
          }
        }
        
        if (options.addCategoryTag) {
          const catTag = `cwe-category:${details.category.toLowerCase().replace(/\s+/g, '-')}`;
          if (!tags.includes(catTag)) {
            tags.push(catTag);
          }
        }
        
        if (options.addSeverityTag) {
          const sevTag = `cwe-severity:${details.severity}`;
          if (!tags.includes(sevTag)) {
            tags.push(sevTag);
          }
        }
      }
    }
  }
  
  return {
    resultsAnnotated,
    rulesAnnotated,
    uniqueCWEIds: Array.from(uniqueCWEIds),
    uniqueCategories: Array.from(uniqueCategories),
    uniqueSeverities: Array.from(uniqueSeverities),
    uniqueRules: Array.from(uniqueRules),
    annotationLog: options.verbose ? annotationLog : []
  };
}

function printSummary(stats, options) {
  console.log('\n' + '='.repeat(60));
  console.log('CWE Annotation Summary');
  console.log('='.repeat(60));
  
  console.log(`\nRules annotated: ${stats.rulesAnnotated}`);
  console.log(`Results annotated: ${stats.resultsAnnotated}`);
  
  if (stats.uniqueCWEIds.length > 0) {
    console.log(`\nUnique CWEs found: ${stats.uniqueCWEIds.length}`);
    console.log(`  CWEs: ${stats.uniqueCWEIds.sort().join(', ')}`);
  }
  
  if (stats.uniqueCategories.length > 0) {
    console.log(`\nCategories: ${stats.uniqueCategories.sort().join(', ')}`);
  }
  
  if (stats.uniqueSeverities.length > 0) {
    console.log(`\nSeverities: ${stats.uniqueSeverities.sort().join(', ')}`);
  }
  
  if (options.format === 'csv') {
    console.log('\n--- CSV Output ---');
    console.log('RuleID,CWE_ID,CWE_Name,Category,Severity');
    
    for (const ruleId of stats.uniqueRules) {
      const cweIds = getCWEForRule(ruleId);
      for (const cweId of cweIds) {
        const details = getCWEDetails(cweId);
        console.log(`${ruleId},${cweId},${details.name},${details.category},${details.severity}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
}

async function main() {
  const options = parseArgs(process.argv);
  
  if (!options.inputSarif) {
    console.error('Error: Input SARIF file required');
    printHelp();
    process.exit(1);
  }
  
  // Read input SARIF
  let sarifData;
  try {
    const sarifContent = fs.readFileSync(options.inputSarif, 'utf8');
    sarifData = JSON.parse(sarifContent);
  } catch (error) {
    console.error(`Error reading SARIF file: ${error.message}`);
    process.exit(1);
  }
  
  // Annotate
  const stats = annotateSarif(sarifData, options);
  
  // Determine output path
  const outputPath = options.outputSarif || 
    options.inputSarif.replace('.sarif', '-annotated.sarif');
  
  // Write output
  if (!options.dryRun) {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(sarifData, null, 2), 'utf8');
      console.log(`\nAnnotated SARIF written to: ${outputPath}`);
    } catch (error) {
      console.error(`Error writing output: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log('\n[Dry run - no file written]');
  }
  
  // Print summary
  if (options.summary || options.verbose) {
    printSummary(stats, options);
  }
  
  // Exit with appropriate code
  process.exit(stats.rulesAnnotated > 0 ? 0 : 1);
}

main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
