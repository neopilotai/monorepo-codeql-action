export default function (github, context) {
  const filtersJson = process.env.filters || '{}'
  const filters = JSON.parse(filtersJson)
  const changedFiles = process.env.changed_files || ''

  const results = {}
  for (const [filterName, filterConfig] of Object.entries(filters)) {
    const changedFilesGlob = filterConfig.changed_files || ''
    results[filterName] = true
  }

  return results
}
