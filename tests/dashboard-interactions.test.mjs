import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createRenderLoader } from './render-loader.mjs'

let server
let App

before(async () => {
  server = createRenderLoader()
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

test('the sidebar is the only global navigation and exposes mobile controls', () => {
  const html = renderPath('/dashboard')

  assert.doesNotMatch(html, /global-nav|동아리⌄|활동⌄|회비⌄|일정⌄/)
  assert.match(html, /aria-label="주 메뉴"/)
  assert.match(html, /aria-label="서비스 메뉴"/)
  assert.match(html, /aria-controls="primary-navigation"/)
  assert.match(html, /aria-expanded="false"/)
  assert.match(html, /class="sidebar-organization"/)
})

test('dashboard creation deep links open their target dialogs', () => {
  const fees = renderPath('/fees?dialog=fee-item-create')
  const schedule = renderPath('/calendar?dialog=schedule-create')

  assert.match(fees, /role="dialog"/)
  assert.match(fees, /납부 항목 등록/)
  assert.match(schedule, /role="dialog"/)
  assert.match(schedule, /일정 등록/)
})

test('the club chooser renders without a fictitious member identity', () => {
  const html = renderPath('/clubs?role=member')

  assert.match(html, /안녕하세요, 회원님/)
  assert.doesNotMatch(html, /남은우/)
  assert.match(html, /role="dialog"/)
  assert.match(html, /aria-label="닫기"/)
})

test('club creation and join overlays expose accessible dialogs', () => {
  const create = renderPath('/clubs/new')
  const join = renderPath('/clubs/join')

  assert.match(create, /role="dialog"/)
  assert.match(create, /aria-labelledby="club-create-title"/)
  assert.match(join, /role="dialog"/)
  assert.match(join, /aria-labelledby="club-join-title"/)
})
