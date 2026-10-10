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
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)))
}

test('the signup route renders the SGN001 additional information form', () => {
  const html = renderPath('/signup')
  assert.match(html, /가입 정보 입력/)
  for (const field of ['name', 'studentId', 'department', 'email']) {
    assert.match(html, new RegExp(`name="${field}"[^>]*value=""`))
  }
  assert.match(html, /가입 완료/)
})

test('the login route offers both OAuth providers', () => {
  const html = renderPath('/login')
  assert.equal((html.match(/Google로 계속하기/g) ?? []).length, 1)
  assert.equal((html.match(/카카오로 계속하기/g) ?? []).length, 1)
})

test('a cancelled OAuth attempt returns to login with a clear retry message', () => {
  assert.match(renderPath('/login?error=cancelled'), /로그인이 취소됐어요/)
  assert.match(renderPath('/login?error=failed'), /로그인을 완료하지 못했어요/)
})
