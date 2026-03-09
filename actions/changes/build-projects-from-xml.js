import * as core from '@actions/core'
import * as xml2js from 'xml2js'
import * as yaml from 'yaml'
import * as fs from 'fs'

function parseXmlAsync(xmlContent) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser()
    parser.parseString(xmlContent, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

export default async function (github, context) {
  const filename = process.env.filename
  const variablesEnv = process.env.variables

  let variables = {}
  if (variablesEnv) {
    try {
      variables = yaml.parse(variablesEnv) || {}
    } catch (e) {
      core.warning(`Failed to parse variables: ${e}`)
    }
  }

  if (!filename) {
    core.setFailed('No filename provided')
    return { projects: {} }
  }

  let xmlContent
  try {
    xmlContent = fs.readFileSync(filename, 'utf8')
  } catch (e) {
    core.warning(`Could not read XML file: ${e}`)
    return { projects: {} }
  }

  for (const [key, value] of Object.entries(variables)) {
    xmlContent = xmlContent.replace(new RegExp(`\\$\\{\\{${key}\\}\\}`, 'g'), value)
  }

  try {
    const result = await parseXmlAsync(xmlContent)
    const projects = {}
    const projectList = result.projects?.project || []

    for (const project of projectList) {
      const lang = project.$?.language || ''
      const name = project.$?.name || ''
      const paths = project.paths?.map(p => p._ || p) || []
      const buildMode = project.$?.['build-mode'] || 'none'
      const queries = project.$?.queries || ''

      if (!lang || !name) {
        core.warning(`Skipping project without language or name`)
        continue
      }

      if (!projects[lang]) {
        projects[lang] = { projects: {} }
      }

      projects[lang].projects[name] = {
        paths,
        'build-mode': buildMode,
        queries,
        'config-file': project.$?.['config-file'],
        config: project.$?.config
      }

      core.debug(`Added project: ${lang}/${name} with build-mode: ${buildMode}`)
    }

    core.setOutput('projects', JSON.stringify(projects))
    return { projects }
  } catch (err) {
    core.setFailed(`Failed to parse XML: ${err}`)
    return { projects: {} }
  }
}
