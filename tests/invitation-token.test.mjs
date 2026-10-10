import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createRenderLoader } from './render-loader.mjs'

let server
let invitationTokenFromInput

before(async () => {
  server = createRenderLoader()
  invitationTokenFromInput = (await server.ssrLoadModule('/src/pages/clubs/invitationToken.ts')).invitationTokenFromInput
})

after(async () => { await server?.close() })

test('accepts a raw invitation token', () => {
  assert.equal(invitationTokenFromInput('  1b13b5c0c63a43b7ab10e58de9dba726  '), '1b13b5c0c63a43b7ab10e58de9dba726')
})

test('extracts the code when an invitation link is pasted into the code field', () => {
  assert.equal(
    invitationTokenFromInput('https://dongbang-frontend.vercel.app/clubs/join?invite=1b13b5c0c63a43b7ab10e58de9dba726'),
    '1b13b5c0c63a43b7ab10e58de9dba726',
  )
})

test('rejects unrelated links without a valid invitation path', () => {
  assert.equal(invitationTokenFromInput('https://dongbang-frontend.vercel.app/login?invite=abc'), '')
})
