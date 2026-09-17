import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server
let App
let MemberFormModal
let membersMock

before(async () => {
  server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom' })
  App = (await server.ssrLoadModule('/src/App.tsx')).default
  MemberFormModal = (await server.ssrLoadModule('/src/pages/members/MemberFormModal.tsx')).MemberFormModal
  membersMock = (await server.ssrLoadModule('/src/pages/members/membersMock.ts')).membersMock
  // Only the invitation's origin is needed for server-side rendering; no browser is launched.
  globalThis.window = { location: { origin: 'https://dongbang.example' } }
})

after(async () => {
  delete globalThis.window
  await server?.close()
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
  assert.match(html, /멤버 직접 등록/)
})

test('the join route prefills the shared invitation code', () => {
  const html = renderPath('/clubs/join?invite=DB-DLOG')
  assert.match(html, /value="DB-DLOG"/)
  assert.match(html, /required=""/)
})

test('edit and create dialogs render the correct defaults without a payment field', () => {
  const props = { members: membersMock, onClose() {}, onSave() {} }
  const edit = renderToStaticMarkup(createElement(MemberFormModal, { ...props, member: membersMock[1] }))
  const create = renderToStaticMarkup(createElement(MemberFormModal, props))
  assert.match(edit, /멤버 정보 수정/)
  assert.match(edit, /value="윤민지"/)
  assert.match(create, /멤버 등록/)
  assert.match(create, /value="13기"/)
  assert.match(create, /selected="">일반 회원/)
  assert.doesNotMatch(edit + create, /name="payment"/)
})
