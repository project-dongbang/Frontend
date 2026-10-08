import { useState, type FormEvent } from 'react'
import { Button, Modal, Select } from '../../components/common'
import type { Member, MemberRole } from './memberModel'

export function MemberRoleModal({ member, onClose, onSave }: {
  member: Member
  onClose: () => void
  onSave: (role: MemberRole, memberId: string) => void
}) {
  const [role, setRole] = useState<MemberRole>(member.role === '운영진' ? '운영진' : '일반 회원')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave(role, member.id)
  }

  return <Modal open title="역할 변경" className="member-modal" onClose={onClose}>
    <form className="member-form" onSubmit={submit}>
      <p className="member-role-target"><strong>{member.name}</strong><span>{member.studentId} · {member.generation}</span></p>
      <Select label="역할" name="role" value={role} onChange={(event) => setRole(event.target.value as MemberRole)}>
        <option value="운영진">운영진</option><option value="일반 회원">일반 회원</option>
      </Select>
      <Button type="submit" className="member-save-button" disabled={role === member.role}>역할 저장</Button>
    </form>
  </Modal>
}
