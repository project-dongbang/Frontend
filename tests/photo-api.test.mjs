import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { validatePhotoFile } from '../src/pages/gallery/validatePhotoFile.ts'

let server
let photoApi

before(async () => {
  server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom' })
  photoApi = (await server.ssrLoadModule('/src/api/services.ts')).photoApi
})

after(async () => { await server?.close() })

test('photo files accept JPEG, PNG, WebP up to 10MB', () => {
  assert.equal(validatePhotoFile(new File(['data'], 'photo.png', { type: 'image/png' })), '')
  assert.match(validatePhotoFile(new File(['data'], 'photo.gif', { type: 'image/gif' })), /JPG, PNG 또는 WebP/)
  assert.match(validatePhotoFile(new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.webp', { type: 'image/webp' })), /10MB/)
})

test('photo registration and replacement send binary file as multipart file part', async () => {
  const originalFetch = globalThis.fetch
  const requests = []
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url: String(url), options })
    const result = String(url).endsWith('/auth/csrf')
      ? { token: 'csrf-token', headerName: 'X-XSRF-TOKEN' }
      : { photoId: 7, title: '개강 총회', file: { url: 'https://example.com/photo.png' }, createdAt: '2026-10-09T00:00:00Z' }
    return new Response(JSON.stringify({ isSuccess: true, result }), {
      headers: { 'content-type': 'application/json' },
    })
  }
  try {
    const file = new File(['png-data'], 'photo.png', { type: 'image/png' })
    await photoApi.create(3, file, '개강 총회')
    await photoApi.replaceImage(3, 7, file, '개강 총회')
    const uploads = requests.filter(({ options }) => options.body instanceof FormData)
    assert.equal(uploads.length, 2)
    assert.match(uploads[0].url, /\/organizations\/3\/photos$/)
    assert.match(uploads[1].url, /\/organizations\/3\/photos\/7\/image$/)
    assert.equal(uploads[0].options.method, 'POST')
    assert.equal(uploads[1].options.method, 'PATCH')
    for (const { options } of uploads) {
      assert.equal(options.body.get('file').name, 'photo.png')
      assert.equal(options.body.get('title'), '개강 총회')
      assert.equal(options.credentials, 'include')
      assert.equal(options.headers.has('Content-Type'), false)
      assert.equal(options.headers.get('X-XSRF-TOKEN'), 'csrf-token')
    }
  } finally { globalThis.fetch = originalFetch }
})

test('photo listing uses the backend cursor without a client supplied user ID', async () => {
  const originalFetch = globalThis.fetch
  const urls = []
  globalThis.fetch = async (url) => {
    urls.push(String(url))
    return new Response(JSON.stringify({ isSuccess: true, result: { content: [], hasNext: false, nextCursor: null } }), {
      headers: { 'content-type': 'application/json' },
    })
  }
  try {
    await photoApi.list(3)
    await photoApi.list(3, 42)
    assert.match(urls[0], /\/organizations\/3\/photos\?size=100$/)
    assert.match(urls[1], /\/organizations\/3\/photos\?size=100&cursor=42$/)
    assert.ok(urls.every((url) => !url.includes('userId=')))
  } finally { globalThis.fetch = originalFetch }
})
