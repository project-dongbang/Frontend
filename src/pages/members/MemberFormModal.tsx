import { useState, type FormEvent } from 'react'
import { Button, Input, Modal, Select } from '../../components/common'
import type { Member, MemberStatus } from './memberModel'

export type MemberInfoUpdate = Pick<Member, 'generation' | 'position' | 'status'>

type Props = {
  member: Member
  onClose: () => void
  onSave: (value: MemberInfoUpdate, memberId: string) => void
}

export function MemberFormModal({ member, onClose, onSave }: Props) {
  const [generation, setGeneration] = useState(member.generation === '-' ? '' : member.generation)
  const [position, setPosition] = useState(member.position ?? '')
  const [status, setStatus] = useState<MemberStatus>(member.status === '탈퇴' ? '활동' : member.status)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ generation: generation.trim(), position: position.trim(), status }, member.id)
  }

  return <Modal open title="멤버 정보 수정" className="member-modal" onClose={onClose}>
    <form className="member-form" onSubmit={submit} noValidate>
      <p className="member-role-target"><strong>{member.name}</strong><span>{member.studentId} · {member.generation}</span></p>
      <div className="member-form-grid">
        <Input label="기수" name="generation" value={generation} onChange={(event) => setGeneration(event.target.value)} maxLength={20} />
        <Input label="직책" name="position" value={position} onChange={(event) => setPosition(event.target.value)} maxLength={50} />
        <Select label="활동 상태" name="status" value={status} disabled={member.role === '회장'} onChange={(event) => setStatus(event.target.value as MemberStatus)}>
          <option value="활동">활동</option><option value="휴면">휴면</option>
        </Select>
      </div>
      <p className="member-form-hint">기수·직책·활동 상태를 수정할 수 있어요. 대표의 활동 상태는 변경할 수 없습니다.{status === '휴면' && member.status === '활동' ? ' 휴면으로 바꾸면 예정된 행사 신청이 취소돼요.' : ''}{status === '활동' && member.status === '휴면' ? ' 활동 상태로 돌려도 취소된 행사 신청은 자동 복구되지 않아요.' : ''}</p>
      <Button type="submit" className="member-save-button">정보 저장</Button>
    </form>
  </Modal>
}
