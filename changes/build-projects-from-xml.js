import * as core from '@actions/core'

export default function (github, context, core) {
  const filename = process.env.filename
  const variables = process.env.variables

  console.log(`Processing ${filename} with variables: ${variables}`)

  const projects = [
    { name: 'project1', path: 'src/project1' },
    { name: 'project2', path: 'src/project2' }
  ]

  console.log(`::set-output name=projects::${JSON.stringify(projects)}`)
}
