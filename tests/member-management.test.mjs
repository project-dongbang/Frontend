import test from 'node:test'
import assert from 'node:assert/strict'
import { filterMembers, membersToCsv } from '../src/pages/members/memberModel.ts'

const president = { id: '1', name: '김동방', studentId: '20260004', generation: '11기', role: '회장', status: '활동', payment: '납부 완료' }
const member = { id: '2', name: '윤민지', studentId: '20260002', generation: '12기', role: '일반 회원', status: '활동', payment: '미납' }
const members = [president, member]

test('search combines name/student ID and generation, ignoring surrounding whitespace', () => {
  assert.deepEqual(filterMembers(members, ' 윤민 ', '12기'), [member])
  assert.deepEqual(filterMembers(members, '20260004', ''), [president])
  assert.deepEqual(filterMembers(members, '김', '12기'), [])
  assert.deepEqual(filterMembers(members, '', ''), members)
})
test('CSV contains a Korean BOM, escapes quotes, and neutralizes formula input', () => {
  const csv = membersToCsv([{ ...member, name: '=HYPERLINK("example")' }])
  assert.ok(csv.startsWith('\uFEFF"이름","학번"'))
  assert.ok(csv.includes('"\'=HYPERLINK(""example"")"'))
  assert.equal(csv.split('\r\n').length, 2)
})
