const fs = require('fs')
const path = require('path')

const SUPPORTED_LANGUAGES = [
  'csharp',
  'cpp',
  'go',
  'java',
  'javascript',
  'python',
  'ruby',
  'swift',
  'typescript'
]

const QUERY_SUITES = ['default', 'security-extended', 'security-and-quality']

function validateLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(
      `Unsupported language: ${language}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`
    )
  }
  return true
}

function validateQuerySuite(querySuite) {
  if (!QUERY_SUITES.includes(querySuite)) {
    throw new Error(
      `Unsupported query suite: ${querySuite}. Supported suites: ${QUERY_SUITES.join(', ')}`
    )
  }
  return true
}

function getLanguageQueries(language, querySuite) {
  validateLanguage(language)
  validateQuerySuite(querySuite)

  const languageQueries = {
    csharp: {
      default: ['security-extended', 'security'],
      'security-extended': ['csharp/security-extended', 'csharp/performance'],
      'security-and-quality': ['csharp/security-and-quality', 'csharp/quality']
    },
    cpp: {
      default: ['cpp/security', 'cpp/security-extended'],
      'security-extended': ['cpp/security-extended'],
      'security-and-quality': ['cpp/security-and-quality']
    },
    go: {
      default: ['go/security'],
      'security-extended': ['go/security-extended'],
      'security-and-quality': ['go/security-and-quality']
    },
    java: {
      default: ['java/security', 'java/security-extended'],
      'security-extended': ['java/security-extended'],
      'security-and-quality': ['java/security-and-quality']
    },
    javascript: {
      default: ['javascript/security'],
      'security-extended': ['javascript/security-extended'],
      'security-and-quality': ['javascript/security-and-quality']
    },
    python: {
      default: ['python/security'],
      'security-extended': ['python/security-extended'],
      'security-and-quality': ['python/security-and-quality']
    },
    ruby: {
      default: ['ruby/security'],
      'security-extended': ['ruby/security-extended'],
      'security-and-quality': ['ruby/security-and-quality']
    },
    swift: {
      default: ['swift/security'],
      'security-extended': ['swift/security-extended'],
      'security-and-quality': ['swift/security-and-quality']
    },
    typescript: {
      default: ['typescript/security'],
      'security-extended': ['typescript/security-extended'],
      'security-and-quality': ['typescript/security-and-quality']
    }
  }

  return languageQueries[language][querySuite] || []
}

function generateQueryConfig(language, querySuite, customQueries = []) {
  validateLanguage(language)
  validateQuerySuite(querySuite)

  const queries = getLanguageQueries(language, querySuite)

  const config = {
    name: `${language}-${querySuite}-queries`,
    paths: ['.'],
    queries: {
      suites: queries
    }
  }

  if (customQueries && customQueries.length > 0) {
    config.queries.suites = [...config.queries.suites, ...customQueries]
  }

  return config
}

function writeQueryConfig(config, outputPath) {
  const configContent = `name: ${config.name}
paths:
${config.paths.map((p) => `  - ${p}`).join('\n')}
queries:
  suites:
${config.queries.suites.map((q) => `    - ${q}`).join('\n')}
`

  fs.writeFileSync(outputPath, configContent, 'utf8')
  console.log(`Query configuration written to: ${outputPath}`)
  return configContent
}

function testAllLanguages() {
  console.log('Testing all languages and query suites...\n')

  const results = []

  for (const language of SUPPORTED_LANGUAGES) {
    for (const querySuite of QUERY_SUITES) {
      try {
        const queries = getLanguageQueries(language, querySuite)
        results.push({
          language,
          querySuite,
          queries,
          success: true
        })
        console.log(`✓ ${language} + ${querySuite}: ${queries.length} queries`)
      } catch (error) {
        results.push({
          language,
          querySuite,
          error: error.message,
          success: false
        })
        console.log(`✗ ${language} + ${querySuite}: ${error.message}`)
      }
    }
  }

  console.log('\n--- Summary ---')
  const passed = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length
  console.log(`Passed: ${passed}/${results.length}`)
  console.log(`Failed: ${failed}/${results.length}`)

  return results
}

function testGenerateConfig() {
  console.log('\nTesting configuration generation...\n')

  const testCases = [
    { language: 'csharp', querySuite: 'default' },
    { language: 'java', querySuite: 'security-extended' },
    {
      language: 'javascript',
      querySuite: 'security-and-quality',
      customQueries: ['custom-query-1', 'custom-query-2']
    },
    { language: 'python', querySuite: 'default' }
  ]

  for (const testCase of testCases) {
    try {
      const config = generateQueryConfig(
        testCase.language,
        testCase.querySuite,
        testCase.customQueries
      )
      console.log(
        `✓ Generated config for ${testCase.language} + ${testCase.querySuite}`
      )
      console.log(JSON.stringify(config, null, 2))
      console.log('')
    } catch (error) {
      console.log(`✗ Failed to generate config: ${error.message}`)
    }
  }
}

function main() {
  console.log('=== Comprehensive Language Queries Test ===\n')

  testAllLanguages()
  testGenerateConfig()

  console.log('\n=== Tests Complete ===')
}

if (require.main === module) {
  main()
}

module.exports = {
  SUPPORTED_LANGUAGES,
  QUERY_SUITES,
  validateLanguage,
  validateQuerySuite,
  getLanguageQueries,
  generateQueryConfig,
  writeQueryConfig,
  testAllLanguages,
  testGenerateConfig
}
