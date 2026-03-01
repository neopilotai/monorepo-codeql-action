import * as core from '@actions/core'

export default function (github, context, core) {
  const projects = JSON.parse(process.env.projects || '[]')

  const filters = {
    src: { changed_files: 'src/**' },
    tests: { changed_files: 'tests/**' }
  }

  console.log('src: true')
  console.log('tests: false')
}
