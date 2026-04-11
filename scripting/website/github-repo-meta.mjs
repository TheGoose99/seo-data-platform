/**
 * GitHub REST: default branch for a repo (for Vercel git redeploy ref).
 */

const GH_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

/**
 * @param {{ token: string; owner: string; repo: string }} opts
 * @returns {Promise<string | null>}
 */
export async function getGitHubDefaultBranch(opts) {
  const { token, owner, repo } = opts
  const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
    headers: { ...GH_HEADERS, Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return typeof data.default_branch === 'string' ? data.default_branch : null
}
