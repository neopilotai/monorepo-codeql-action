import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { execSync, spawn } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'

const CODEQL_TOOL_PATH = process.env.CODEQL_PATH || 'codeql'

class CodeQLMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'codeql-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    this.databasePath = null
    this.queriesPath = null

    this.setupHandlers()
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'codeql_create_database',
            description: 'Create a CodeQL database from source code',
            inputSchema: {
              type: 'object',
              properties: {
                language: {
                  type: 'string',
                  enum: ['javascript', 'typescript', 'python', 'java', 'kotlin', 'csharp', 'go', 'ruby', 'php', 'cpp', 'c', 'swift', 'rust'],
                  description: 'Programming language'
                },
                sourceRoot: {
                  type: 'string',
                  description: 'Root directory of source code'
                },
                outputPath: {
                  type: 'string',
                  description: 'Output path for the database'
                }
              },
              required: ['language', 'sourceRoot']
            }
          },
          {
            name: 'codeql_run_query',
            description: 'Run a CodeQL query against a database',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'CodeQL query to run'
                },
                database: {
                  type: 'string',
                  description: 'Path to CodeQL database'
                },
                outputFormat: {
                  type: 'string',
                  enum: ['csv', 'json', 'sarif'],
                  default: 'json',
                  description: 'Output format'
                }
              },
              required: ['query', 'database']
            }
          },
          {
            name: 'codeql_analyze',
            description: 'Analyze a database with CodeQL queries',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: 'Path to CodeQL database'
                },
                queries: {
                  type: 'string',
                  description: 'Query suite or path to queries'
                },
                outputFormat: {
                  type: 'string',
                  enum: ['sarif', 'csv', 'json'],
                  default: 'sarif',
                  description: 'Output format'
                },
                outputPath: {
                  type: 'string',
                  description: 'Output path for results'
                }
              },
              required: ['database', 'queries']
            }
          },
          {
            name: 'codeql_database_info',
            description: 'Get information about a CodeQL database',
            inputSchema: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                  description: 'Path to CodeQL database'
                }
              },
              required: ['database']
            }
          },
          {
            name: 'codeql_list_queries',
            description: 'List available CodeQL query suites',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['security', 'security-extended', 'security-and-quality', 'quality'],
                  default: 'security',
                  description: 'Query category'
                },
                language: {
                  type: 'string',
                  description: 'Programming language'
                }
              }
            }
          },
          {
            name: 'codeql_get_query_help',
            description: 'Get help text for a CodeQL query',
            inputSchema: {
              type: 'object',
              properties: {
                queryPath: {
                  type: 'string',
                  description: 'Path to the query file'
                }
              },
              required: ['queryPath']
            }
          },
          {
            name: 'codeql_validate_query',
            description: 'Validate a CodeQL query for syntax errors',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'CodeQL query to validate'
                }
              },
              required: ['query']
            }
          },
          {
            name: 'codeql_resolve_language',
            description: 'Resolve the language of source code',
            inputSchema: {
              type: 'object',
              properties: {
                sourceRoot: {
                  type: 'string',
                  description: 'Root directory of source code'
                }
              },
              required: ['sourceRoot']
            }
          },
          {
            name: 'codeql_build_project',
            description: 'Build a project for CodeQL analysis',
            inputSchema: {
              type: 'object',
              properties: {
                language: {
                  type: 'string',
                  description: 'Programming language'
                },
                sourceRoot: {
                  type: 'string',
                  description: 'Root directory of source code'
                },
                buildMode: {
                  type: 'string',
                  enum: ['none', 'autobuild', 'manual'],
                  default: 'none',
                  description: 'Build mode'
                }
              },
              required: ['language', 'sourceRoot']
            }
          }
        ]
      }
    })

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'codeql_create_database':
            return await this.createDatabase(args)
          case 'codeql_run_query':
            return await this.runQuery(args)
          case 'codeql_analyze':
            return await this.analyze(args)
          case 'codeql_database_info':
            return await this.databaseInfo(args)
          case 'codeql_list_queries':
            return await this.listQueries(args)
          case 'codeql_get_query_help':
            return await this.getQueryHelp(args)
          case 'codeql_validate_query':
            return await this.validateQuery(args)
          case 'codeql_resolve_language':
            return await this.resolveLanguage(args)
          case 'codeql_build_project':
            return await this.buildProject(args)
          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        }
      }
    })
  }

  async createDatabase(args) {
    const { language, sourceRoot, outputPath } = args
    const dbPath = outputPath || `codeql-db-${language}`

    console.error(`Creating CodeQL database for ${language} at ${sourceRoot}`)

    try {
      execSync(
        `${CODEQL_TOOL_PATH} database create ${dbPath} --source-root=${sourceRoot} --language=${language}`,
        { stdio: 'inherit' }
      )

      this.databasePath = dbPath

      return {
        content: [
          {
            type: 'text',
            text: `Database created successfully at: ${dbPath}`
          }
        ]
      }
    } catch (error) {
      throw new Error(`Failed to create database: ${error.message}`)
    }
  }

  async runQuery(args) {
    const { query, database, outputFormat = 'json' } = args

    console.error(`Running query on database: ${database}`)

    try {
      const output = execSync(
        `${CODEQL_TOOL_PATH} database run-query ${database} --query="${query}" --output=results.${outputFormat} --format=${outputFormat}`,
        { encoding: 'utf8' }
      )

      return {
        content: [
          {
            type: 'text',
            text: output || `Query executed successfully`
          }
        ]
      }
    } catch (error) {
      throw new Error(`Failed to run query: ${error.message}`)
    }
  }

  async analyze(args) {
    const { database, queries, outputFormat = 'sarif', outputPath } = args
    const output = outputPath || `results.${outputFormat}`

    console.error(`Analyzing database: ${database}`)

    try {
      execSync(
        `${CODEQL_TOOL_PATH} database analyze ${database} ${queries} --format=${outputFormat} --output=${output}`,
        { stdio: 'inherit' }
      )

      const results = fs.readFileSync(output, 'utf8')

      return {
        content: [
          {
            type: 'text',
            text: `Analysis complete. Results written to: ${output}\n\n${outputFormat === 'json' ? results.substring(0, 2000) : 'Results saved to file'}`
          }
        ]
      }
    } catch (error) {
      throw new Error(`Failed to analyze: ${error.message}`)
    }
  }

  async databaseInfo(args) {
    const { database } = args

    console.error(`Getting database info: ${database}`)

    try {
      const output = execSync(
        `${CODEQL_TOOL_PATH} database info ${database}`,
        { encoding: 'utf8' }
      )

      return {
        content: [
          {
            type: 'text',
            text: output
          }
        ]
      }
    } catch (error) {
      throw new Error(`Failed to get database info: ${error.message}`)
    }
  }

  async listQueries(args) {
    const { category = 'security', language } = args

    const querySuites = {
      security: 'security queries',
      'security-extended': 'security-extended queries',
      'security-and-quality': 'security-and-quality queries',
      quality: 'quality queries'
    }

    try {
      const langArg = language ? `--language=${language}` : ''
      const output = execSync(
        `${CODEQL_TOOL_PATH} resolve queries ${querySuites[category]} ${langArg}`,
        { encoding: 'utf8' }
      )

      const queries = output.split('\n').filter(q => q.trim())

      return {
        content: [
          {
            type: 'text',
            text: `Available ${category} queries${language ? ` for ${language}` : ''}:\n\n${queries.slice(0, 20).join('\n')}${queries.length > 20 ? `\n... and ${queries.length - 20} more` : ''}`
          }
        ]
      }
    } catch (error) {
      throw new Error(`Failed to list queries: ${error.message}`)
    }
  }

  async getQueryHelp(args) {
    const { queryPath } = args

    if (!fs.existsSync(queryPath)) {
      throw new Error(`Query file not found: ${queryPath}`)
    }

    try {
      const output = execSync(
        `${CODEQL_TOOL_PATH} query help ${queryPath}`,
        { encoding: 'utf8' }
      )

      return {
        content: [
          {
            type: 'text',
            text: output
          }
        ]
      }
    } catch (error) {
      const content = fs.readFileSync(queryPath, 'utf8')
      const nameMatch = content.match(/^\/\/*\s*name:\s*(.+)$/m)
      const descMatch = content.match(/^\/\/*\s*description:\s*(.+)$/m)

      return {
        content: [
          {
            type: 'text',
            text: `Query: ${nameMatch?.[1] || path.basename(queryPath)}\nDescription: ${descMatch?.[1] || 'No description'}\n\n${content.substring(0, 1000)}`
          }
        ]
      }
    }
  }

  async validateQuery(args) {
    const { query } = args

    try {
      const tempFile = '/tmp/validate-query.ql'
      fs.writeFileSync(tempFile, query)

      execSync(
        `${CODEQL_TOOL_PATH} query compile ${tempFile}`,
        { stdio: 'inherit' }
      )

      fs.removeSync(tempFile)

      return {
        content: [
          {
            type: 'text',
            text: 'Query is valid'
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Query validation failed: ${error.message}`
          }
        ],
        isError: true
      }
    }
  }

  async resolveLanguage(args) {
    const { sourceRoot } = args

    const languageIndicators = {
      javascript: ['package.json', 'package-lock.json'],
      typescript: ['tsconfig.json'],
      python: ['requirements.txt', 'setup.py', 'pyproject.toml'],
      java: ['pom.xml', 'build.gradle'],
      kotlin: ['build.gradle.kts'],
      csharp: ['.csproj', '.sln'],
      go: ['go.mod'],
      ruby: ['Gemfile'],
      php: ['composer.json'],
      cpp: ['CMakeLists.txt', 'Makefile'],
      c: ['CMakeLists.txt', 'Makefile'],
      swift: ['Package.swift'],
      rust: ['Cargo.toml']
    }

    const files = fs.readdirSync(sourceRoot)

    for (const [lang, indicators] of Object.entries(languageIndicators)) {
      if (indicators.some(ind => files.includes(ind))) {
        return {
          content: [
            {
              type: 'text',
              text: `Detected language: ${lang}`
            }
          ]
        }
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: 'Could not auto-detect language'
        }
      ]
    }
  }

  async buildProject(args) {
    const { language, sourceRoot, buildMode = 'none' } = args

    if (buildMode === 'none') {
      return {
        content: [
          {
            type: 'text',
            text: 'No build required for this language'
          }
        ]
      }
    }

    console.error(`Building project in ${sourceRoot}`)

    const buildCommands = {
      javascript: 'npm install',
      python: 'pip install -r requirements.txt',
      java: 'mvn compile',
      go: 'go mod download',
      ruby: 'bundle install'
    }

    const cmd = buildCommands[language]

    if (!cmd) {
      throw new Error(`No autobuild command for ${language}`)
    }

    try {
      execSync(cmd, { cwd: sourceRoot, stdio: 'inherit' })

      return {
        content: [
          {
            type: 'text',
            text: `Build completed successfully`
          }
        ]
      }
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`)
    }
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('CodeQL MCP Server started')
  }
}

const server = new CodeQLMCPServer()
server.start().catch(console.error)
