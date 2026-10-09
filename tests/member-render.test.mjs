import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createRenderLoader } from './render-loader.mjs'

let server
let App
let MemberFormModal
let MemberRoleModal
let membersMock
let authReturn
let checkInLink

before(async () => {
  server = createRenderLoader()
  App = (await server.ssrLoadModule('/src/App.tsx')).default
  MemberFormModal = (await server.ssrLoadModule('/src/pages/members/MemberFormModal.tsx')).MemberFormModal
  MemberRoleModal = (await server.ssrLoadModule('/src/pages/members/MemberRoleModal.tsx')).MemberRoleModal
  membersMock = (await server.ssrLoadModule('/src/pages/members/membersMock.ts')).membersMock
  authReturn = await server.ssrLoadModule('/src/routes/authReturn.ts')
  checkInLink = await server.ssrLoadModule('/src/pages/attendance/checkInLink.ts')
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

test('the members route starts with an empty roster until the API responds', () => {
  const html = renderPath('/members')
  assert.match(html, /전체 멤버 0명/)
  assert.match(html, /운영진 0명 · 검색 결과 0명/)
  assert.doesNotMatch(html, /20260004|<tbody>/)
})

test('a role query parameter cannot grant or revoke member permissions', () => {
  const html = renderPath('/members?role=member&dialog=invite')
  assert.match(html, /전체 멤버 0명/)
  assert.match(html, /멤버 초대/)
  assert.doesNotMatch(html, /운영진만 이용할 수 있어요|20260004/)
})

test('the invitation dialog does not invent a code before the API responds', () => {
  const html = renderPath('/members?dialog=invite')
  assert.match(html, /role="dialog"/)
  assert.match(html, /초대 링크 복사<\/button>/)
  assert.doesNotMatch(html, /DB-DLOG/)
  assert.doesNotMatch(html, /멤버 직접 등록/)
})

test('the join route waits for authentication before offering invitation acceptance', () => {
  const html = renderPath('/clubs/join?invite=DB-DLOG')
  assert.match(html, /로그인 정보를 확인하고 있어요/)
  assert.doesNotMatch(html, /동아리 확인/)
})

test('an invitation remains available after the OAuth redirect', () => {
  const values = new Map()
  window.sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
  authReturn.saveAuthReturnPath('/clubs/join?invite=code%2Fwith%20space')
  assert.equal(authReturn.getAuthReturnPath(), '/clubs/join?invite=code%2Fwith%20space')
  authReturn.clearAuthReturnPath()
  assert.equal(authReturn.getAuthReturnPath(), '/clubs')
})

test('a QR check-in destination survives login with its token intact', () => {
  const path = checkInLink.checkInPath(4, 9, 'token/+ space')
  authReturn.saveAuthReturnPath(path)
  assert.equal(authReturn.getAuthReturnPath(), path)
  assert.deepEqual(checkInLink.parseCheckInParams(new URLSearchParams(path.split('?')[1])), {
    organizationId: 4, eventId: 9, qrToken: 'token/+ space',
  })
  assert.match(renderPath(path), /출석 정보를 확인하고 있어요/)
  authReturn.clearAuthReturnPath()
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
