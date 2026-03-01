import { Octokit } from '@octokit/rest'
import core from '@actions/core'

const github = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

const context = {
  repo: {
    owner: 'khulnasoft',
    repo: 'monorepo-codeql-action'
  },
  payload: {
    pull_request: {
      base: {
        ref: 'main'
      }
    }
  }
}

import script from '../sarif/republish-sarif/republish-sarif.js'
const result = script(github, context, core)
