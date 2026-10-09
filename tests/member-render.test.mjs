import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { loadSsrModules } from './loadSsrModules.mjs'

let App
let MemberFormModal
let MemberRoleModal
let membersMock

before(async () => {
  const modules = await loadSsrModules('members', {
    App: 'src/App.tsx',
    MemberFormModal: 'src/pages/members/MemberFormModal.tsx',
    MemberRoleModal: 'src/pages/members/MemberRoleModal.tsx',
    membersMock: 'src/pages/members/membersMock.ts',
  })
  App = modules.App.default
  MemberFormModal = modules.MemberFormModal.MemberFormModal
  MemberRoleModal = modules.MemberRoleModal.MemberRoleModal
  membersMock = modules.membersMock.membersMock
  // Only the invitation's origin is needed for server-side rendering; no browser is launched.
  globalThis.window = { location: { origin: 'https://dongbang.example' } }
})

after(async () => {
  delete globalThis.window
})

function renderPath(path) {
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)))
}

test('the members route renders the full fixture roster and calculated counts', () => {
  const html = renderPath('/members')
  assert.match(html, /전체 멤버 64명/)
  assert.match(html, /운영진 5명 · 검색 결과 64명/)
  assert.equal(html.split('<tbody>')[1].split('</tbody>')[0].match(/<tr>/g).length, 64)
  assert.match(html, /class="active"[^>]*><svg[^]*?멤버 관리/)
})

test('the member preview cannot render the roster or invitation dialog', () => {
  const html = renderPath('/members?role=member&dialog=invite')
  assert.match(html, /운영진만 이용할 수 있어요/)
  assert.doesNotMatch(html, /<table|role="dialog"|20260004/)
})

test('the invitation deep link renders the modal with the current origin and join route', () => {
  const html = renderPath('/members?dialog=invite')
  assert.match(html, /role="dialog"/)
  assert.match(html, /https:\/\/dongbang.example\/clubs\/join\?invite=DB-DLOG/)
  assert.doesNotMatch(html, /멤버 직접 등록/)
})

test('the join route prefills the shared invitation code', () => {
  const html = renderPath('/clubs/join?invite=DB-DLOG')
  assert.match(html, /value="DB-DLOG"/)
  assert.match(html, /required=""/)
})

test('member information editing exposes only fields supported by the deployed API', () => {
  const html = renderToStaticMarkup(createElement(MemberFormModal, { member: membersMock[1], onClose() {}, onSave() {} }))
  assert.match(html, /멤버 정보 수정/)
  assert.match(html, /윤민지/)
  assert.match(html, /name="generation"/)
  assert.match(html, /name="position"/)
  assert.match(html, /name="status"/)
  assert.doesNotMatch(html, /name="name"|name="studentId"|name="role"|멤버 등록/)
})

test('role changes use the separate role endpoint fields', () => {
  const html = renderToStaticMarkup(createElement(MemberRoleModal, { member: membersMock[1], onClose() {}, onSave() {} }))
  assert.match(html, /역할 변경/)
  assert.match(html, /name="role"/)
  assert.doesNotMatch(html, /name="generation"|name="position"|name="status"/)
})
