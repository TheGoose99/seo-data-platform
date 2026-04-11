#!/usr/bin/env node
/**
 * Copy to post-unzip.mjs to run after template unzip and before npm ci.
 * Args: [appRoot, runId]
 *
 * Example: write client config into appRoot/config/clients/*.ts
 */

import process from 'node:process'

const [appRoot, runId] = process.argv.slice(2)
console.log(`[post-unzip example] appRoot=${appRoot} runId=${runId}`)
// Add generator logic here.
