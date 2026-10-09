import { before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { loadSsrModules } from './loadSsrModules.mjs'

let App

before(async () => {
  App = (await loadSsrModules('dashboard', { App: 'src/App.tsx' })).App.default
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

test('the admin dashboard renders action labels without the placeholder glyph', () => {
  const html = renderPath('/dashboard')

  assert.match(html, /납부 항목 등록/)
  assert.match(html, /행사 만들기/)
  assert.doesNotMatch(html, /▣/)
  assert.equal((html.match(/전체 보기 →/g) ?? []).length, 2)
})

test('club settings is the only selected sidebar item on the settings route', () => {
  const html = renderPath('/clubs/1/settings')
  const navigation = html.match(/<nav aria-label="서비스 메뉴">([\s\S]*?)<\/nav>/)?.[1]

  assert.ok(navigation)
  assert.doesNotMatch(navigation, /class="active"|aria-current="page"/)
  assert.match(html, /class="sidebar-settings"><button[^>]*class="active"[^>]*aria-label="동아리 설정"/)
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

test('the club chooser preserves the member dashboard context', () => {
  const html = renderPath('/clubs?role=member')

  assert.match(html, /안녕하세요, 남은우님/)
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
