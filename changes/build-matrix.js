import * as core from '@actions/core'

export default function (github, context, core) {
  const filters = JSON.parse(process.env.filters || '{}')
  const projectsJson = process.env.projects || '{}'
  const projectsData = JSON.parse(projectsJson)

  const include = []
  for (const [language, langData] of Object.entries(projectsData)) {
    const projects = langData.projects || {}
    for (const [projectName, projectData] of Object.entries(projects)) {
      include.push({
        language,
        project: projectName,
        paths: projectData.paths || []
      })
    }
  }

  const matrix = { include }
  return matrix
}
