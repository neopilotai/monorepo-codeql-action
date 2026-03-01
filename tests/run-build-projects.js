const github = undefined
const context = undefined
import * as core from '@actions/core'

import script from '../changes/build-projects-from-xml.js'
const _ = script(github, context, core)
