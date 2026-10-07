import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server
let FeeItemModal
let feeCollections

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
  })
  FeeItemModal = (
    await server.ssrLoadModule(
      '/src/pages/fees/components/FeeItemModal.tsx',
    )
  ).FeeItemModal
  feeCollections = (
    await server.ssrLoadModule(
      '/src/pages/fees/feesMock.ts',
    )
  ).feeCollections
})

after(async () => {
  await server?.close()
})

const modalProps = {
  onClose() {},
  onSave() {},
}

test('the edit modal renders the FEE010 values and actions', () => {
  const html = renderToStaticMarkup(
    createElement(FeeItemModal, {
      ...modalProps,
      collection: feeCollections[0],
      onDelete() {},
    }),
  )

  assert.match(html, /납부 항목 수정/)
  assert.match(html, /value="2026년 2학기 정기 납부"/)
  assert.match(html, /value="2026-09-20"/)
  assert.match(html, /value="3333-12-3456789"/)
  assert.match(html, /일반 납부/)
  assert.match(html, /선택 인원<strong>64명/)
  assert.match(html, /₩ 2,560,000/)
  assert.match(html, /항목 삭제/)
  assert.match(html, /변경 사항 저장/)
})

test('the create modal keeps registration copy without deletion', () => {
  const html = renderToStaticMarkup(
    createElement(FeeItemModal, modalProps),
  )

  assert.match(html, /납부 항목 등록/)
  assert.match(html, /회비 등록하기/)
  assert.doesNotMatch(html, /항목 삭제/)
})
