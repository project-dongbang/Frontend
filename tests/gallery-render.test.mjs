import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server
let App

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
  })
  App = (await server.ssrLoadModule('/src/App.tsx')).default
})

after(async () => {
  await server?.close()
})

function renderPath(path) {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(App),
    ),
  )
}

test('GAL001 renders three photos and the admin add action', () => {
  const html = renderPath('/gallery')

  assert.match(html, /CLUB GALLERY/)
  assert.match(html, /사진 추가/)
  assert.equal(
    (html.match(/사진 상세 보기/g) ?? []).length,
    3,
  )
  assert.match(html, /2026년 2학기 개강 총회/)
  assert.match(html, /신입 부원 환영 네트워킹/)
  assert.match(html, /정기 백엔드 세미나/)
})

test('GAL002 keeps the photo list but hides admin controls', () => {
  const html = renderPath('/gallery?role=member')

  assert.equal(
    (html.match(/사진 상세 보기/g) ?? []).length,
    3,
  )
  assert.doesNotMatch(html, /사진 추가/)
  assert.match(html, /읽지 않은 알림 1개/)
})
