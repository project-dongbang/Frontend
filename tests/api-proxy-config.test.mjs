import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRenderLoader } from './render-loader.mjs'

let server
let resolveApiBaseUrl

before(async () => {
  server = createRenderLoader()
  resolveApiBaseUrl = (await server.ssrLoadModule('/src/api/client.ts')).resolveApiBaseUrl
})

after(async () => { await server?.close() })

test('the API rewrite precedes the SPA fallback and preserves the API path', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'))
  assert.deepEqual(config.rewrites[0], {
    source: '/api/(.*)',
    destination: 'https://api.3.36.171.188.nip.io/api/$1',
  })
  assert.deepEqual(config.rewrites[1], { source: '/(.*)', destination: '/index.html' })
  assert.equal(config.headers[0].source, '/api/(.*)')
  assert.ok(config.headers[0].headers.some((header) => header.key === 'Cache-Control' && header.value === 'no-store'))
  assert.ok(config.headers[0].headers.some((header) => header.key === 'x-vercel-enable-rewrite-caching' && header.value === '0'))
})

test('production uses the same-origin API unless explicitly configured otherwise', () => {
  assert.equal(resolveApiBaseUrl(undefined, true), '')
  assert.equal(resolveApiBaseUrl('https://dongbang-frontend.vercel.app/', true), 'https://dongbang-frontend.vercel.app')
  assert.equal(resolveApiBaseUrl(undefined, false), 'http://localhost:8080')
})
