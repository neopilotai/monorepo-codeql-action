import * as core from '@actions/core'
import { detectLanguage, detectBuildSystem, getBuildCommand, detectSparseCheckout } from './detect-build.js'

export default function (github, context) {
  const projectsJson = process.env.projects || '{}'
  const projectsData = JSON.parse(projectsJson)

  const include = []
  for (const [language, langData] of Object.entries(projectsData)) {
    const projects = langData.projects || {}
    for (const [projectName, projectData] of Object.entries(projects)) {
      const paths = projectData.paths || []
      
      const buildMode = projectData['build-mode'] 
        || detectBuildSystem(paths[0], language)
        || 'none'
      
      const queries = projectData.queries
      const config = projectData.config
      const configFile = projectData['config-file']
      
      const sparseCheckout = projectData.sparse_checkout 
        || detectSparseCheckout(projectsJson, paths)

      include.push({
        language,
        project: projectName,
        paths,
        sparse_checkout: sparseCheckout,
        build_mode: buildMode,
        queries,
        codeql_config: config || configFile,
        build_command: getBuildCommand(language, 'build'),
        install_command: getBuildCommand(language, 'install')
      })
    }
  }

  core.setOutput('projects', JSON.stringify({ projects: include }))

  return { include }
}
