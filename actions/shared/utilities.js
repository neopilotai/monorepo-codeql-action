import * as xml2js from 'xml2js'
import * as yaml from 'yaml'
import * as fs from 'fs'
import * as path from 'path'

export function parseXml(xmlContent) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser()
    parser.parseString(xmlContent, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

export function parseYaml(yamlContent) {
  return yaml.parse(yamlContent)
}

export function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (e) {
    throw new Error(`Failed to read JSON file ${filePath}: ${e.message}`)
  }
}

export function readYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return yaml.parse(content)
  } catch (e) {
    throw new Error(`Failed to read YAML file ${filePath}: ${e.message}`)
  }
}

export function readXmlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return parseXml(content)
  } catch (e) {
    throw new Error(`Failed to read XML file ${filePath}: ${e.message}`)
  }
}

export function substituteVariables(content, variables) {
  let result = content
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(pattern, value)
  }
  return result
}

export function getLanguageFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const langMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.kt': 'kotlin',
    '.cs': 'csharp',
    '.go': 'go',
    '.rb': 'ruby',
    '.php': 'php',
    '.cpp': 'cpp',
    '.c': 'c',
    '.swift': 'swift',
    '.rs': 'rust'
  }
  return langMap[ext] || 'javascript'
}

export function detectBuildMode(language, projectPath) {
  if (!projectPath || !fs.existsSync(projectPath)) {
    return 'none'
  }

  const files = fs.readdirSync(projectPath)
  const buildIndicators = {
    javascript: ['package.json'],
    typescript: ['tsconfig.json'],
    python: ['setup.py', 'pyproject.toml', 'requirements.txt'],
    java: ['pom.xml', 'build.gradle'],
    kotlin: ['build.gradle.kts', 'pom.xml'],
    csharp: ['.csproj', '.sln'],
    go: ['go.mod'],
    ruby: ['Gemfile'],
    php: ['composer.json'],
    rust: ['Cargo.toml']
  }

  const indicators = buildIndicators[language] || []
  const hasBuildFile = indicators.some(f => files.includes(f))

  return hasBuildFile ? 'autobuild' : 'none'
}

export function getSarifCategory(language, projectName) {
  return `/language:${language};project:${projectName}`
}

export function escapeForFilename(str) {
  return str.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

export const BUILD_FILES = {
  javascript: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
  typescript: ['tsconfig.json'],
  python: ['requirements.txt', 'setup.py', 'pyproject.toml'],
  java: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
  kotlin: ['build.gradle.kts', 'pom.xml'],
  csharp: ['.csproj', '.sln'],
  go: ['go.mod'],
  ruby: ['Gemfile'],
  php: ['composer.json'],
  rust: ['Cargo.toml'],
  swift: ['Package.swift'],
  cpp: ['CMakeLists.txt', 'Makefile']
}

export function detectLanguage(sourceRoot) {
  if (!fs.existsSync(sourceRoot)) {
    return null
  }

  const files = fs.readdirSync(sourceRoot)

  for (const [lang, langFiles] of Object.entries(BUILD_FILES)) {
    const hasFile = langFiles.some(f => files.includes(f))
    if (hasFile) return lang
  }

  return null
}
