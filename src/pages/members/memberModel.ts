export const memberRoles = ['회장', '총무', '운영진', '일반 회원'] as const
export type MemberRole = typeof memberRoles[number]
export type MemberStatus = '활동' | '휴면' | '탈퇴'
export type MemberPayment = '납부 완료' | '미납' | '확인 필요'

export type Member = {
  id: string
  name: string
  studentId: string
  generation: string
  position?: string
  role: MemberRole
  status: MemberStatus
  payment: MemberPayment
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
