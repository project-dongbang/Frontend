import type { FeeCategory } from './feesMock'

export function createInitialFeeCategories(): FeeCategory[] {
  return [{ id: 'category-initial', name: '', amount: 0, memberIds: [] }]
}

export function summarizeFeeCategories(categories: FeeCategory[]) {
  return {
    selectedMemberCount: new Set(categories.flatMap((category) => category.memberIds)).size,
    expectedAmount: categories.reduce((total, category) => total + category.amount * category.memberIds.length, 0),
  }
}
