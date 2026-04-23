/**
 * git init, ensure .gitignore, initial commit, push to GitHub (HTTPS + token).
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const DEFAULT_IGNORE = [
  'node_modules/',
  '.next/',
  '.vercel/',
  '.env',
  '.env.local',
  '.env.*',
  '!.env.local.example',
  '*.log',
  '.DS_Store',
]

function ensureGitignore(appRoot) {
  const p = path.join(appRoot, '.gitignore')
  let existing = ''
  if (fs.existsSync(p)) {
    existing = fs.readFileSync(p, 'utf8')
  }
  const missing = DEFAULT_IGNORE.filter((line) => !existing.includes(line.split('!')[0].trim()))
  if (missing.length === 0) return
  const append = '\n# CloseBy onboarding\n' + missing.join('\n') + '\n'
  fs.writeFileSync(p, existing + append, 'utf8')
}

/**
 * @param {{ appRoot: string; owner: string; repoName: string; token: string; branch?: string; pushExisting?: boolean }} opts
 */
export function gitInitCommitPush(opts) {
  const { appRoot, owner, repoName, token, branch = 'main', pushExisting = false } = opts

  if (fs.existsSync(path.join(appRoot, '.git'))) {
    throw new Error(`Refusing to git init: ${appRoot} already has .git`)
  }

  ensureGitignore(appRoot)

  const gitEnv = {
    ...process.env,
    GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME || 'CloseBy Onboarding',
    GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL || 'onboarding@users.noreply.github.com',
    GIT_COMMITTER_NAME: process.env.GIT_AUTHOR_NAME || 'CloseBy Onboarding',
    GIT_COMMITTER_EMAIL: process.env.GIT_AUTHOR_EMAIL || 'onboarding@users.noreply.github.com',
  }

  const remoteUrl = `https://x-access-token:${token}@github.com/${owner}/${repoName}.git`
  // `-b` avoids the host default (often `master`) so Vercel/GitHub match `main` unless GITHUB_DEFAULT_BRANCH overrides
  execFileSync('git', ['init', '-b', branch], { cwd: appRoot, stdio: 'inherit' })
  execFileSync('git', ['remote', 'add', 'origin', remoteUrl], { cwd: appRoot, stdio: 'inherit' })

  if (pushExisting) {
    // If the remote branch exists, base our commit on it (no force push, preserves history).
    try {
      execFileSync('git', ['fetch', 'origin', branch], { cwd: appRoot, stdio: 'inherit' })
      execFileSync('git', ['checkout', '-B', branch, `origin/${branch}`], { cwd: appRoot, stdio: 'inherit' })
    } catch {
      // Remote branch missing/empty repo; continue with local branch.
      execFileSync('git', ['checkout', '-B', branch], { cwd: appRoot, stdio: 'inherit' })
    }
  } else {
    execFileSync('git', ['checkout', '-B', branch], { cwd: appRoot, stdio: 'inherit' })
  }

  execFileSync('git', ['add', '-A'], { cwd: appRoot, stdio: 'inherit' })
  execFileSync('git', ['commit', '-m', 'Initial client site'], { cwd: appRoot, stdio: 'inherit', env: gitEnv })
  execFileSync('git', ['push', '-u', 'origin', branch], { cwd: appRoot, stdio: 'inherit' })
}
