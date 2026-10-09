import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createInitialFeeCategories, summarizeFeeCategories } from '../src/pages/fees/feeItemDraft.ts'

test('new fee item starts without sample members or amounts', () => {
  const categories = createInitialFeeCategories()
  assert.equal(categories.length, 1)
  assert.deepEqual(categories[0].memberIds, [])
  assert.deepEqual(summarizeFeeCategories(categories), { selectedMemberCount: 0, expectedAmount: 0 })
})

test('selecting one real member counts once and uses the entered amount', () => {
  const categories = [{ ...createInitialFeeCategories()[0], name: '일반 납부', amount: 40000, memberIds: ['17'] }]
  assert.deepEqual(summarizeFeeCategories(categories), { selectedMemberCount: 1, expectedAmount: 40000 })
})
