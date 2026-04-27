import test from 'node:test'
import assert from 'node:assert/strict'
import { isAuthorizedInternalRequest } from '../lib/internal-auth.js'

function makeRequest(token) {
  const headers = new Headers()
  if (token) headers.set('x-internal-token', token)
  return new Request('https://example.test', { headers })
}

test('internal auth allows when no expected token and non-strict', () => {
  const ok = isAuthorizedInternalRequest(makeRequest(), { expectedToken: '', strict: false })
  assert.equal(ok, true)
})

test('internal auth denies when strict and missing expected token', () => {
  const ok = isAuthorizedInternalRequest(makeRequest(), { expectedToken: '', strict: true })
  assert.equal(ok, false)
})

test('internal auth validates x-internal-token equality', () => {
  assert.equal(isAuthorizedInternalRequest(makeRequest('abc'), { expectedToken: 'abc', strict: true }), true)
  assert.equal(isAuthorizedInternalRequest(makeRequest('nope'), { expectedToken: 'abc', strict: true }), false)
})

