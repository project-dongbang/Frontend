import test from 'node:test'
import assert from 'node:assert/strict'
import { filterMembers, membersToCsv, normalizeMemberForm, validateMemberForm } from '../src/pages/members/memberModel.ts'

const president = { id: '1', name: '김동방', studentId: '20260004', generation: '11기', role: '회장', status: '활동', payment: '납부 완료' }
const member = { id: '2', name: '윤민지', studentId: '20260002', generation: '12기', role: '일반 회원', status: '활동', payment: '미납' }
const members = [president, member]

test('search combines name/student ID and generation, ignoring surrounding whitespace', () => {
  assert.deepEqual(filterMembers(members, ' 윤민 ', '12기'), [member])
  assert.deepEqual(filterMembers(members, '20260004', ''), [president])
  assert.deepEqual(filterMembers(members, '김', '12기'), [])
  assert.deepEqual(filterMembers(members, '', ''), members)
})
test('a new member cannot reuse an existing student ID; an unchanged edit can', () => {
  assert.ok(validateMemberForm(member, members).studentId)
  assert.deepEqual(validateMemberForm(member, members, member.id), {})
  assert.ok(validateMemberForm({ ...member, studentId: president.studentId }, members, member.id).studentId)
})
test('required and numeric fields are validated and generations are normalized', () => {
  assert.deepEqual(normalizeMemberForm({ ...member, name: ' 윤민지 ', studentId: ' 20260002 ', generation: ' 013 기 ' }), { ...member, generation: '13기' })
  const errors = validateMemberForm({ ...member, name: ' ', studentId: 'abc', generation: '0기' }, members)
  assert.ok(errors.name && errors.studentId && errors.generation)
})
test('the last active president cannot lose their role or active status', () => {
  assert.ok(validateMemberForm({ ...president, role: '일반 회원' }, members, president.id).role)
  assert.ok(validateMemberForm({ ...president, status: '휴면' }, members, president.id).status)
  assert.deepEqual(validateMemberForm(president, members, president.id), {})
})
test('only another active president permits a handover', () => {
  const next = { ...president, role: '일반 회원' }
  assert.deepEqual(validateMemberForm(next, [president, { ...member, role: '회장' }], president.id), {})
  assert.ok(validateMemberForm(next, [president, { ...member, role: '회장', status: '탈퇴' }], president.id).role)
})
test('CSV contains a Korean BOM, escapes quotes, and neutralizes formula input', () => {
  const csv = membersToCsv([{ ...member, name: '=HYPERLINK("example")' }])
  assert.ok(csv.startsWith('\uFEFF"이름","학번"'))
  assert.ok(csv.includes('"\'=HYPERLINK(""example"")"'))
  assert.equal(csv.split('\r\n').length, 2)
})
