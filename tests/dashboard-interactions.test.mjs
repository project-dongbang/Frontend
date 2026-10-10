import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createRenderLoader } from './render-loader.mjs'

let server
let App
let CalendarGrid
let ScheduleDetailModal
let calendarLocalDateTime

before(async () => {
  server = createRenderLoader()
  App = (await server.ssrLoadModule('/src/App.tsx')).default
  CalendarGrid = (await server.ssrLoadModule('/src/pages/schedule/CalendarGrid.tsx')).CalendarGrid
  ScheduleDetailModal = (await server.ssrLoadModule('/src/pages/schedule/ScheduleDetailModal.tsx')).ScheduleDetailModal
  calendarLocalDateTime = (await server.ssrLoadModule('/src/pages/schedule/calendarDate.ts')).calendarLocalDateTime
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

test('the admin dashboard renders action labels without a placeholder glyph', () => {
  const html = renderPath('/dashboard')

  assert.match(html, /납부 항목 등록/)
  assert.match(html, /행사 만들기/)
  assert.doesNotMatch(html, /▣/)
  assert.equal((html.match(/전체 보기 →/g) ?? []).length, 2)
})

test('the settings route does not select another sidebar menu', () => {
  const html = renderPath('/clubs/1/settings')
  const navigation = html.match(/<nav aria-label="서비스 메뉴">([\s\S]*?)<\/nav>/)?.[1]

  assert.ok(navigation)
  assert.doesNotMatch(navigation, /class="active"|aria-current="page"/)
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
  const event = renderPath('/calendar?dialog=event-create')
  assert.match(event, /role="dialog"/)
  assert.match(event, /행사 만들기/)
})

test('the calendar shows a multiday item only on its start and end dates', () => {
  const html = renderToStaticMarkup(createElement(CalendarGrid, {
    year: 2026, month: 9,
    items: [{ id: '1', title: '장기 행사', type: 'event', start: '2026-10-09T14:54', end: '2026-10-17T17:00' }],
    onItemClick() {},
  }))
  assert.equal((html.match(/장기 행사/g) ?? []).length, 2)
  assert.match(html, /시작 14:54 장기 행사/)
  assert.match(html, /종료 17:00 장기 행사/)
  assert.equal(calendarLocalDateTime('2026-10-09T05:54:00Z'), '2026-10-09T14:54')
})

test('an existing event application is shown as cancellable when detail is reopened', () => {
  const html = renderToStaticMarkup(createElement(ScheduleDetailModal, {
    open: true,
    item: { id: '42', title: '참가 중인 행사', type: 'event', start: '2099-10-09T14:00', end: '2099-10-09T16:00', participating: true, canApply: false, canCancel: true, registered: 3 },
    isMember: true,
    onClose() {}, onEditRequest() {}, onDeleteRequest() {}, onEarlyCloseRequest() {}, onParticipantEditRequest() {}, onAttendanceRequest() {},
  }))
  assert.match(html, /3명/)
  assert.match(html, /참가 신청 취소/)
  assert.match(html, /<button[^>]*>참가 신청 취소<\/button>/)
})

test('the club chooser renders without a fictitious member identity', () => {
  const html = renderPath('/clubs?role=member')

  assert.match(html, /안녕하세요, 회원님/)
  assert.doesNotMatch(html, /남은우/)
  assert.match(html, /role="dialog"/)
  assert.match(html, /aria-label="닫기"/)
})

test('club creation opens a dialog while invitation acceptance waits for authentication', () => {
  const create = renderPath('/clubs/new')
  const join = renderPath('/clubs/join')

  assert.match(create, /role="dialog"/)
  assert.match(create, /aria-labelledby="club-create-title"/)
  assert.match(join, /로그인 정보를 확인하고 있어요/)
  assert.doesNotMatch(join, /role="dialog"/)
})
