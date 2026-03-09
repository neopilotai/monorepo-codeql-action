const fs = require('fs').promises

async function run(github, context, core) {
  const project = process.env.project
  const sarifInput = process.env.sarif_file
  const outputFile = process.env.output_file

  if (!project) {
    core.setFailed('Missing required input: project')
    return
  }

  if (!sarifInput) {
    core.setFailed('Missing required input: sarif_file')
    return
  }

  if (!outputFile) {
    core.setFailed('Missing required input: output_file')
    return
  }

  try {
    const sarifContent = await fs.readFile(sarifInput, 'utf8')
    const sarifData = JSON.parse(sarifContent)

    if (!sarifData.runs || !Array.isArray(sarifData.runs)) {
      core.warning('SARIF file has no runs array, skipping annotation')
      return
    }

    for (const sarifRun of sarifData.runs) {
      if (!sarifRun.tool?.extensions || sarifRun.tool.extensions.length === 0) {
        continue
      }

      for (const rule of sarifRun.tool.extensions[0].rules || []) {
        if (rule.properties?.tags) {
          const existingTagIndex = rule.properties.tags.findIndex((tag) =>
            tag.startsWith('project/')
          )

          if (existingTagIndex !== -1) {
            core.debug(
              `Removing existing project tag: ${rule.properties.tags[existingTagIndex]}`
            )
            rule.properties.tags.splice(existingTagIndex, 1)
          }

          core.debug(
            `Adding new project tag: project/${project} to rule ${rule.id}`
          )
          rule.properties.tags.push(`project/${project}`)
        }
      }

      if (sarifRun.results) {
        for (const result of sarifRun.results) {
          if (result.ruleId && !result.properties?.tags?.some(tag => tag.startsWith('project/'))) {
            if (!result.properties) {
              result.properties = { tags: [] }
            }
            if (!result.properties.tags) {
              result.properties.tags = []
            }
            result.properties.tags.push(`project/${project}`)
          }
        }
      }
    }

    await fs.writeFile(outputFile, JSON.stringify(sarifData, null, 2), 'utf8')

    console.log(
      `Updated SARIF file for project '${project}' written to ${outputFile}`
    )
  } catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`)
  }
}

module.exports = async (github, context, core) => {
  await run(github, context, core)
}
