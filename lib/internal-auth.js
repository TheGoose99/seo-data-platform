export function isAuthorizedInternalRequest(request, options = {}) {
  const expected = (options.expectedToken ?? '').trim()
  const strict =
    options.strict === true ||
    process.env.NODE_ENV === 'production' ||
    process.env.INTERNAL_LOCK_API_TOKEN_REQUIRED === '1' ||
    process.env.INTERNAL_LOCK_API_STRICT === '1'

  if (strict && !expected) return false
  if (!expected) return true
  const given = request.headers.get('x-internal-token')?.trim() ?? ''
  return given === expected
}

