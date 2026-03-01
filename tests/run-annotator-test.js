const fs = require('fs').promises
const path = require('path')

const github = {
  rest: {
    codeScanning: {}
  }
}

const context = {
  repo: {
    owner: 'test-owner',
    repo: 'test-repo'
  },
  payload: {}
}

const mockCore = {
  debug: (msg) => console.log('[DEBUG]', msg),
  info: (msg) => console.log('[INFO]', msg),
  warning: (msg) => console.log('[WARNING]', msg),
  error: (msg) => console.log('[ERROR]', msg),
  setFailed: (msg) => console.log('[FAILED]', msg)
}

async function createTestSarif() {
  const sarifData = {
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'CodeQL',
            version: '2.15.0'
          },
          extensions: [
            {
              name: 'codeql/cpp-queries',
              rules: [
                {
                  id: 'cpp/security-rule-1',
                  name: 'Security Rule 1',
                  properties: {
                    tags: ['security', 'external/cwe']
                  }
                },
                {
                  id: 'cpp/security-rule-2',
                  name: 'Security Rule 2',
                  properties: {
                    tags: ['security']
                  }
                },
                {
                  id: 'cpp/quality-rule-1',
                  name: 'Quality Rule 1',
                  properties: {
                    tags: ['maintainability']
                  }
                }
              ]
            }
          ]
        },
        results: []
      }
    ]
  }

  const testDir = path.join(__dirname, 'test-data')
  await fs.mkdir(testDir, { recursive: true })

  const sarifPath = path.join(testDir, 'input.sarif')
  await fs.writeFile(sarifPath, JSON.stringify(sarifData, null, 2), 'utf8')

  console.log(`Created test SARIF file: ${sarifPath}`)
  return sarifPath
}

async function runAnnotatorTest() {
  console.log('=== Running Annotator Test ===\n')

  try {
    const inputSarif = await createTestSarif()
    const outputSarif = inputSarif.replace('input.sarif', 'output.sarif')
    const projectName = 'Project1'

    process.env.project = projectName
    process.env.sarif_file = inputSarif
    process.env.output_file = outputSarif

    console.log(`Input: ${inputSarif}`)
    console.log(`Output: ${outputSarif}`)
    console.log(`Project: ${projectName}\n`)

    const script = require('../sarif/annotate-sarif/annotate-sarif.js')
    await script(github, context, mockCore)

    const outputContent = await fs.readFile(outputSarif, 'utf8')
    const outputData = JSON.parse(outputContent)

    console.log('\n=== Verifying Output ===')

    const rules = outputData.runs[0].tool.extensions[0].rules
    let allPassed = true

    for (const rule of rules) {
      if (rule.properties && rule.properties.tags) {
        const hasProjectTag = rule.properties.tags.some((tag) =>
          tag.startsWith('project/')
        )
        console.log(
          `Rule ${rule.id}: ${hasProjectTag ? '✓' : '✗'} has project tag`
        )

        if (hasProjectTag) {
          const projectTags = rule.properties.tags.filter((tag) =>
            tag.startsWith('project/')
          )
          console.log(`  Tags: ${JSON.stringify(projectTags)}`)
        } else {
          allPassed = false
        }
      }
    }

    console.log(`\n=== Test ${allPassed ? 'PASSED' : 'FAILED'} ===`)

    await fs.unlink(inputSarif)
    await fs.unlink(outputSarif)
    await fs.rmdir(path.join(__dirname, 'test-data'))

    return allPassed
  } catch (error) {
    console.error('Test failed with error:', error)
    return false
  }
}

async function runMultipleProjectsTest() {
  console.log('\n=== Running Multiple Projects Test ===\n')

  try {
    const testDir = path.join(__dirname, 'test-data')
    await fs.mkdir(testDir, { recursive: true })

    const baseSarif = {
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: { name: 'CodeQL', version: '2.15.0' },
            extensions: [
              {
                name: 'codeql/java-queries',
                rules: [
                  {
                    id: 'java/unsafe-deserialization',
                    properties: { tags: ['security'] }
                  },
                  {
                    id: 'java/path-injection',
                    properties: { tags: ['security'] }
                  }
                ]
              }
            ]
          },
          results: []
        }
      ]
    }

    const inputSarif = path.join(testDir, 'multi-input.sarif')
    await fs.writeFile(inputSarif, JSON.stringify(baseSarif, null, 2), 'utf8')

    const projects = ['Project1', 'Project2', 'Project3']
    const outputs = []

    for (const project of projects) {
      const outputSarif = path.join(testDir, `multi-output-${project}.sarif`)

      process.env.project = project
      process.env.sarif_file = inputSarif
      process.env.output_file = outputSarif

      const script = require('../sarif/annotate-sarif/annotate-sarif.js')
      await script(github, context, mockCore)

      outputs.push(outputSarif)
      console.log(`Processed ${project}`)
    }

    console.log('\n=== Verifying Multiple Projects ===')

    for (let i = 0; i < projects.length; i++) {
      const content = await fs.readFile(outputs[i], 'utf8')
      const data = JSON.parse(content)
      const rules = data.runs[0].tool.extensions[0].rules

      const projectTag = `project/${projects[i]}`
      const hasCorrectTag = rules.every((rule) =>
        rule.properties?.tags?.includes(projectTag)
      )

      console.log(`${projects[i]}: ${hasCorrectTag ? '✓' : '✗'}`)
    }

    await fs.unlink(inputSarif)
    for (const output of outputs) {
      await fs.unlink(output)
    }
    await fs.rmdir(testDir)

    console.log('\n=== Multiple Projects Test Complete ===')
    return true
  } catch (error) {
    console.error('Test failed with error:', error)
    return false
  }
}

async function main() {
  const test1 = await runAnnotatorTest()
  const test2 = await runMultipleProjectsTest()

  console.log('\n=== Summary ===')
  console.log(`Annotator Test: ${test1 ? 'PASSED' : 'FAILED'}`)
  console.log(`Multiple Projects Test: ${test2 ? 'PASSED' : 'FAILED'}`)

  process.exit(test1 && test2 ? 0 : 1)
}

main()
