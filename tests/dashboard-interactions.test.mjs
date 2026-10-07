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

test('the admin dashboard renders all four navigation actions', () => {
  const html = renderPath('/dashboard')

  assert.match(html, /납부 항목 등록/)
  assert.match(html, /행사 만들기/)
  assert.equal((html.match(/전체 보기 →/g) ?? []).length, 2)
})

test('dashboard creation deep links open their target dialogs', () => {
  const fees = renderPath('/fees?dialog=fee-item-create')
  const schedule = renderPath('/calendar?dialog=schedule-create')

  assert.match(fees, /role="dialog"/)
  assert.match(fees, /납부 항목 등록/)
  assert.match(schedule, /role="dialog"/)
  assert.match(schedule, /일정 등록/)
})

test('the club chooser preserves the member dashboard context', () => {
  const html = renderPath('/clubs?role=member')

  assert.match(html, /안녕하세요, 남은우님/)
  assert.match(html, /role="dialog"/)
  assert.match(html, /aria-label="닫기"/)
})
