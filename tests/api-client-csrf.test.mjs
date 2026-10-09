import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

let server
let apiRequest

before(async () => {
  server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom' })
  apiRequest = (await server.ssrLoadModule('/src/api/client.ts')).apiRequest
})

after(async () => { await server?.close() })

test('a rejected mutation refreshes a stale CSRF token and retries once', async () => {
  const originalFetch = globalThis.fetch
  const mutationTokens = []
  let csrfReads = 0
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).endsWith('/api/v1/auth/csrf')) {
      csrfReads += 1
      return Response.json({ isSuccess: true, result: { token: `token-${csrfReads}`, headerName: 'X-XSRF-TOKEN' } })
    }
    mutationTokens.push(options.headers.get('X-XSRF-TOKEN'))
    return mutationTokens.length === 1
      ? Response.json({ isSuccess: false, code: 'AUTH_403_001', message: '요청이 거부되었습니다.' }, { status: 403 })
      : Response.json({ isSuccess: true, result: { organizationId: 1 } })
  }
  try {
    const result = await apiRequest('/api/v1/organizations/1', { method: 'PATCH', body: { name: '동아리' } })
    assert.deepEqual(result, { organizationId: 1 })
    assert.deepEqual(mutationTokens, ['token-1', 'token-2'])
    assert.equal(csrfReads, 2)
  } finally { globalThis.fetch = originalFetch }
})

test('an authorization error is not retried as a CSRF failure', async () => {
  const originalFetch = globalThis.fetch
  let requests = 0
  globalThis.fetch = async () => {
    requests += 1
    return Response.json({ isSuccess: false, code: 'AUTH_403_001', message: '운영진 이상의 권한이 필요합니다.' }, { status: 403 })
  }
  try {
    await assert.rejects(apiRequest('/api/v1/organizations/1', { method: 'PATCH', body: { name: '동아리' } }), /운영진 이상의 권한이 필요합니다/)
    assert.equal(requests, 1)
  } finally { globalThis.fetch = originalFetch }
})
