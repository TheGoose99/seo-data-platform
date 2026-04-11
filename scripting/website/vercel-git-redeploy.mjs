/**
 * Trigger a new GitHub-backed deployment so the project picks up env vars set after the first build.
 * POST /v13/deployments with gitSource { type, org, repo, ref }.
 */

/**
 * @param {{ vercelToken: string; teamScope: string; projectId: string; projectName: string; githubOrg: string; githubRepo: string; ref: string }} opts
 * @returns {Promise<{ ok: true; url: string | null } | { ok: false; error: string; status?: number }>}
 */
export async function triggerGithubRedeploy(opts) {
  const {
    vercelToken,
    teamScope,
    projectId,
    projectName,
    githubOrg,
    githubRepo,
    ref,
  } = opts

  const params = new URLSearchParams()
  if (teamScope.startsWith('team_')) {
    params.set('teamId', teamScope)
  } else if (teamScope) {
    params.set('slug', teamScope)
  }
  params.set('forceNew', '1')

  const url = `https://api.vercel.com/v13/deployments?${params.toString()}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      project: projectId,
      gitSource: {
        type: 'github',
        org: githubOrg,
        repo: githubRepo,
        ref,
      },
    }),
  })

  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: `Vercel redeploy invalid JSON (${res.status}): ${text.slice(0, 400)}`, status: res.status }
  }

  if (!res.ok) {
    const msg = data.error?.message || data.message || text
    return { ok: false, error: `Vercel redeploy ${res.status}: ${msg}`, status: res.status }
  }

  const u = data.url
  const deployUrl = u ? (u.startsWith('http') ? u : `https://${u}`) : null
  return { ok: true, url: deployUrl }
}
