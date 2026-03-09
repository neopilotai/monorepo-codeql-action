const github = undefined
const context = undefined
import * as core from '@actions/core'

const mockCore = { ...core, debug: () => {} }

import script from '../changes/build-matrix.js'
const result = script(github, context, mockCore)
console.log(JSON.stringify(result))
