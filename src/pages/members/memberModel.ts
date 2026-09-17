export const memberRoles = ['회장', '총무', '운영진', '일반 회원'] as const
export const memberStatuses = ['활동', '휴면', '탈퇴'] as const

export type MemberRole = typeof memberRoles[number]
export type MemberStatus = typeof memberStatuses[number]
export type MemberPayment = '납부 완료' | '미납' | '확인 필요'

export type Member = {
  id: string
  name: string
  studentId: string
  generation: string
  role: MemberRole
  status: MemberStatus
  payment: MemberPayment
}

export type MemberForm = Pick<Member, 'name' | 'studentId' | 'generation' | 'role' | 'status'>
export type MemberFormErrors = Partial<Record<keyof MemberForm, string>>

export function normalizeMemberForm(form: MemberForm): MemberForm {
  const generation = form.generation.trim().replace(/\s*기$/, '')
  return {
    ...form,
    name: form.name.trim(),
    studentId: form.studentId.trim(),
    generation: /^\d+$/.test(generation) ? `${Number(generation)}기` : generation,
  }
}

export function validateMemberForm(form: MemberForm, members: Member[], editingId?: string): MemberFormErrors {
  const value = normalizeMemberForm(form)
  const errors: MemberFormErrors = {}

  if (!value.name) errors.name = '이름을 입력해 주세요.'
  if (!value.studentId) errors.studentId = '학번을 입력해 주세요.'
  else if (!/^\d+$/.test(value.studentId)) errors.studentId = '학번은 숫자로 입력해 주세요.'
  else if (members.some((member) => member.id !== editingId && member.studentId === value.studentId)) {
    errors.studentId = '이미 등록된 학번이에요.'
  }
  if (!/^[1-9]\d*기$/.test(value.generation)) errors.generation = '기수를 양의 정수로 입력해 주세요. (예: 13기)'
  if (!memberRoles.includes(value.role)) errors.role = '역할을 선택해 주세요.'
  if (!memberStatuses.includes(value.status)) errors.status = '활동 상태를 선택해 주세요.'

  const current = members.find((member) => member.id === editingId)
  const anotherPresident = members.some((member) => member.id !== editingId && member.role === '회장' && member.status === '활동')
  if (current?.role === '회장' && current.status === '활동' && !anotherPresident) {
    if (value.role !== '회장') errors.role = '마지막 회장의 역할은 해제할 수 없어요. 먼저 다른 멤버를 회장으로 지정해 주세요.'
    if (value.status !== '활동') errors.status = '마지막 회장은 활동 상태를 유지해야 해요.'
  }
  return errors
}

export function filterMembers(members: Member[], query: string, generation: string): Member[] {
  const keyword = query.trim().toLocaleLowerCase()
  return members.filter((member) =>
    (!generation || member.generation === generation) &&
    (!keyword || member.name.toLocaleLowerCase().includes(keyword) || member.studentId.includes(keyword)),
  )
}

export function membersToCsv(members: Member[]): string {
  // Quote every cell and neutralize spreadsheet formulas in user-entered values.
  const cell = (value: string) => `"${(/^[=+\-@\t\r\n]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`
  const rows = [
    ['이름', '학번', '기수', '역할', '납부', '상태'],
    ...members.map(({ name, studentId, generation, role, payment, status }) => [name, studentId, generation, role, payment, status]),
  ]
  return '\uFEFF' + rows.map((row) => row.map(cell).join(',')).join('\r\n')
}
