import { before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { loadSsrModules } from './loadSsrModules.mjs'

let App

before(async () => {
  App = (await loadSsrModules('auth', { App: 'src/App.tsx' })).App.default
})

function renderPath(path) {
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)))
}

test('the signup route renders the SGN001 additional information form', () => {
  const html = renderPath('/signup')
  assert.match(html, /가입 정보 입력/)
  assert.match(html, /name="name"[^>]*value="김동방"/)
  assert.match(html, /name="studentId"[^>]*value="20260004"/)
  assert.match(html, /name="department"[^>]*value="컴퓨터정보공학부"/)
  assert.match(html, /name="email"[^>]*value="dongbang@example.com"/)
  assert.match(html, /가입 완료/)
})

test('the login route links both social login buttons to the signup flow', () => {
  const html = renderPath('/login')
  assert.equal((html.match(/Google로 계속하기/g) ?? []).length, 1)
  assert.equal((html.match(/카카오로 계속하기/g) ?? []).length, 1)
})
