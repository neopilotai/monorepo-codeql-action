const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'kotlin',
  'csharp',
  'go',
  'ruby',
  'php',
  'cpp',
  'c',
  'swift',
  'rust'
]

const LANGUAGE_TRIGGERS = {
  javascript: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
  typescript: ['tsconfig.json', 'package.json'],
  python: ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile'],
  java: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
  kotlin: ['build.gradle.kts', 'pom.xml', 'settings.gradle.kts'],
  csharp: ['*.csproj', '*.sln'],
  go: ['go.mod', 'go.sum'],
  ruby: ['Gemfile', '*.gemspec'],
  php: ['composer.json'],
  cpp: ['CMakeLists.txt', 'Makefile', '*.make'],
  c: ['CMakeLists.txt', 'Makefile'],
  swift: ['Package.swift', 'Podfile'],
  rust: ['Cargo.toml', 'Cargo.lock']
}

function detectLanguage(sourceRoot) {
  if (!fs.existsSync(sourceRoot)) {
    return null
  }

  const files = fs.readdirSync(sourceRoot)

  for (const [lang, triggerFiles] of Object.entries(LANGUAGE_TRIGGERS)) {
    const match = triggerFiles.some(trigger => {
      if (trigger.includes('*')) {
        const pattern = new RegExp('^' + trigger.replace(/\*/g, '.*') + '$')
        return files.some(f => pattern.test(f))
      }
      return files.includes(trigger)
    })

    if (match) {
      return lang
    }
  }

  return null
}

function getInstallCommand(language) {
  const commands = {
    javascript: 'npm install',
    typescript: 'npm install',
    python: 'pip install -r requirements.txt',
    java: 'mvn dependency:go-offline',
    kotlin: 'gradle dependencies',
    go: 'go mod download',
    ruby: 'bundle install',
    php: 'composer install',
    rust: 'cargo fetch'
  }
  return commands[language]
}

function getBuildCommand(language) {
  const commands = {
    javascript: 'npm run build',
    typescript: 'npm run build',
    python: 'python setup.py build',
    java: 'mvn compile',
    kotlin: 'gradle build',
    go: 'go build ./...',
    ruby: 'rake build',
    rust: 'cargo build'
  }
  return commands[language]
}

async function run(github, context, core) {
  const language = process.env.language
  const sourceRoot = process.env.source_root || '.'
  const outputDir = process.env.output_dir || 'codeql-db'
  const buildMode = process.env.build_mode || 'none'
  const installDeps = process.env.install_dependencies !== 'false'
  const queries = process.env.queries
  const config = process.env.config

  if (!language) {
    core.setFailed('Missing required input: language')
    return
  }

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    core.setFailed(`Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`)
    return
  }

  const resolvedSourceRoot = path.resolve(sourceRoot)
  
  if (!fs.existsSync(resolvedSourceRoot)) {
    core.setFailed(`Source root does not exist: ${resolvedSourceRoot}`)
    return
  }

  core.info(`Detected language: ${language}`)
  core.info(`Source root: ${resolvedSourceRoot}`)
  core.info(`Output directory: ${outputDir}`)
  core.info(`Build mode: ${buildMode}`)

  const detectedLang = detectLanguage(resolvedSourceRoot)
  if (detectedLang && detectedLang !== language) {
    core.warning(`Detected language ${detectedLang} differs from specified ${language}`)
  }

  if (installDeps) {
    const installCmd = getInstallCommand(language)
    if (installCmd) {
      core.info(`Installing dependencies: ${installCmd}`)
      try {
        execSync(installCmd, { cwd: resolvedSourceRoot, stdio: 'inherit' })
      } catch (error) {
        core.warning(`Failed to install dependencies: ${error.message}`)
      }
    }
  }

  if (buildMode === 'autobuild') {
    const buildCmd = getBuildCommand(language)
    if (buildCmd) {
      core.info(`Building project: ${buildCmd}`)
      try {
        execSync(buildCmd, { cwd: resolvedSourceRoot, stdio: 'inherit' })
      } catch (error) {
        core.warning(`Build failed: ${error.message}`)
      }
    }
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  core.setOutput('language', language)
  core.setOutput('source_root', resolvedSourceRoot)
  core.setOutput('output_dir', outputDir)
  core.setOutput('detected_language', detectedLang || language)

  core.info(`Extraction setup complete for ${language}`)
  core.info(`Output directory: ${outputDir}`)
}

module.exports = async (github, context, core) => {
  try {
    await run(github, context, core)
  } catch (error) {
    core.setFailed(`Extractor failed: ${error.message}`)
  }
}
