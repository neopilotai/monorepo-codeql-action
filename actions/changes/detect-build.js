const fs = require('fs')
const path = require('path')

const BUILD_FILES = {
  javascript: [
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml'
  ],
  typescript: [
    'tsconfig.json',
    'package.json'
  ],
  python: [
    'requirements.txt',
    'setup.py',
    'pyproject.toml',
    'Pipfile',
    'poetry.lock'
  ],
  java: [
    'pom.xml',
    'build.gradle',
    'build.gradle.kts',
    'gradle.properties',
    'pom.xml'
  ],
  kotlin: [
    'build.gradle.kts',
    'pom.xml',
    'settings.gradle.kts'
  ],
  swift: [
    'Package.swift',
    '*.xcodeproj/project.pbxproj',
    'Podfile',
    'Cartfile'
  ],
  cpp: [
    'CMakeLists.txt',
    'Makefile',
    '*.make',
    'configure',
    'CMakeCache.txt'
  ],
  csharp: [
    '*.csproj',
    '*.sln',
    '*.props',
    '*.targets',
    'project.json'
  ],
  go: [
    'go.mod',
    'go.sum'
  ],
  ruby: [
    'Gemfile',
    'Gemfile.lock',
    '*.gemspec'
  ],
  php: [
    'composer.json',
    'composer.lock',
    '*.php'
  ],
  rust: [
    'Cargo.toml',
    'Cargo.lock'
  ]
}

const BUILD_COMMANDS = {
  javascript: {
    build: ['npm run build', 'yarn build', 'pnpm build'],
    install: ['npm install', 'yarn install', 'pnpm install']
  },
  typescript: {
    build: ['npm run build', 'npx tsc'],
    install: ['npm install']
  },
  python: {
    build: ['python setup.py build', 'pip install -e .'],
    install: ['pip install -r requirements.txt', 'pip install .']
  },
  java: {
    build: ['mvn compile', 'mvn build', 'gradle build', 'gradlew build'],
    install: ['mvn install', 'gradle build', 'gradlew build']
  },
  kotlin: {
    build: ['mvn compile', 'gradle build', 'gradlew build'],
    install: ['mvn install', 'gradle build', 'gradlew build']
  },
  swift: {
    build: ['swift build', 'xcodebuild', 'carthage build'],
    install: ['swift package resolve', 'carthage update']
  },
  cpp: {
    build: ['cmake .', 'make', 'make all'],
    install: ['cmake .', 'make']
  },
  csharp: {
    build: ['dotnet build', 'msbuild'],
    install: ['dotnet restore', 'nuget restore']
  },
  go: {
    build: ['go build ./...', 'go build'],
    install: ['go mod download']
  },
  ruby: {
    build: ['bundle install', 'gem build'],
    install: ['bundle install']
  },
  php: {
    build: ['composer install', 'composer dump-autoload'],
    install: ['composer install']
  },
  rust: {
    build: ['cargo build'],
    install: ['cargo fetch']
  }
}

function detectLanguage(projectPath) {
  if (!projectPath || !fs.existsSync(projectPath)) {
    return null
  }

  const files = fs.readdirSync(projectPath)

  for (const [lang, langFiles] of Object.entries(BUILD_FILES)) {
    const matchCount = langFiles.filter(f => {
      if (f.includes('*')) {
        const pattern = new RegExp(f.replace(/\*/g, '.*'))
        return files.some(file => pattern.test(file))
      }
      return files.includes(f)
    }).length

    if (matchCount > 0) {
      return lang
    }
  }

  return null
}

function detectBuildSystem(projectPath, language) {
  if (!projectPath || !fs.existsSync(projectPath)) {
    return 'none'
  }

  const files = fs.readdirSync(projectPath)

  if (language === 'javascript' || language === 'typescript') {
    if (files.includes('package.json')) {
      const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'))
      if (pkg.scripts?.build || pkg.scripts?.compile) {
        return 'autobuild'
      }
      return 'none'
    }
  }

  if (language === 'python') {
    if (files.includes('setup.py') || files.includes('pyproject.toml')) {
      return 'autobuild'
    }
    if (files.includes('requirements.txt')) {
      return 'none'
    }
  }

  if (language === 'java' || language === 'kotlin') {
    if (files.includes('pom.xml')) {
      return 'autobuild'
    }
    if (files.includes('build.gradle') || files.includes('build.gradle.kts')) {
      return 'autobuild'
    }
  }

  if (language === 'swift') {
    if (files.includes('Package.swift')) {
      return 'autobuild'
    }
    if (files.includes('Podfile')) {
      return 'manual'
    }
  }

  if (language === 'cpp') {
    if (files.includes('CMakeLists.txt')) {
      return 'manual'
    }
    if (files.includes('Makefile')) {
      return 'manual'
    }
  }

  if (language === 'csharp') {
    if (files.some(f => f.endsWith('.csproj')) || files.some(f => f.endsWith('.sln'))) {
      return 'autobuild'
    }
  }

  if (language === 'go') {
    if (files.includes('go.mod')) {
      return 'none'
    }
  }

  if (language === 'ruby') {
    if (files.includes('Gemfile')) {
      return 'none'
    }
  }

  if (language === 'php') {
    if (files.includes('composer.json')) {
      return 'none'
    }
  }

  if (language === 'rust') {
    if (files.includes('Cargo.toml')) {
      return 'autobuild'
    }
  }

  return 'none'
}

function getBuildCommand(language, commandType = 'install') {
  const commands = BUILD_COMMANDS[language]
  if (!commands) {
    return null
  }
  return commands[commandType]?.[0] || null
}

function detectSparseCheckout(projectsJson, projectPaths) {
  const sparseCheckout = []

  for (const projectPath of projectPaths) {
    if (fs.existsSync(projectPath)) {
      sparseCheckout.push(projectPath)
    }
  }

  return sparseCheckout.join('\n')
}

module.exports = {
  detectLanguage,
  detectBuildSystem,
  getBuildCommand,
  detectSparseCheckout,
  BUILD_FILES,
  BUILD_COMMANDS
}
