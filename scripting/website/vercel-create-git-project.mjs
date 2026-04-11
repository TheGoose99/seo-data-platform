/**
 * Create a Vercel project linked to a GitHub repo (REST API v11).
 */

/**
 * @param {{ vercelToken: string; teamScope: string; projectName: string; githubRepoFullName: string }} opts
 * @returns {Promise<{ ok: true; project: unknown; deployUrl: string | null } | { ok: false; error: string; status?: number }>}
 */
export async function createVercelGitLinkedProject(opts) {
  const { vercelToken, teamScope, projectName, githubRepoFullName } = opts

  const params = new URLSearchParams()
  if (teamScope.startsWith('team_')) {
    params.set('teamId', teamScope)
  } else if (teamScope) {
    params.set('slug', teamScope)
  }

  const url = `https://api.vercel.com/v11/projects?${params.toString()}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName.slice(0, 100),
      framework: 'nextjs',
      gitRepository: {
        type: 'github',
        repo: githubRepoFullName,
      },
    }),
  })

  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: `Vercel API invalid JSON (${res.status}): ${text.slice(0, 500)}`, status: res.status }
  }

  if (!res.ok) {
    const msg = data.error?.message || data.message || text
    return {
      ok: false,
      error: `Vercel create project ${res.status}: ${msg}`,
      status: res.status,
    }
  }

  /** @type {string | null} */
  let deployUrl = null
  const latest = data.latestDeployments
  if (Array.isArray(latest) && latest.length > 0 && latest[0].url) {
    const u = latest[0].url
    deployUrl = u.startsWith('http') ? u : `https://${u}`
  }

  if (!deployUrl && data.id) {
    deployUrl = await fetchLatestDeploymentUrl({
      vercelToken,
      teamScope,
      projectId: data.id,
    })
  }

  return { ok: true, project: data, deployUrl }
}

/**
 * @param {{ vercelToken: string; teamScope: string; projectId: string }} opts
 */
async function fetchLatestDeploymentUrl(opts) {
  const { vercelToken, teamScope, projectId } = opts
  const params = new URLSearchParams({ projectId, limit: '1' })
  if (teamScope.startsWith('team_')) {
    params.set('teamId', teamScope)
  } else if (teamScope) {
    params.set('slug', teamScope)
  }

  const res = await fetch(`https://api.vercel.com/v6/deployments?${params}`, {
    headers: { Authorization: `Bearer ${vercelToken}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  const dep = data.deployments?.[0]
  if (!dep?.url) return null
  return dep.url.startsWith('http') ? dep.url : `https://${dep.url}`
}
