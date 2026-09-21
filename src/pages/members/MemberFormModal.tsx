import { useState, type FormEvent } from 'react'
import { Button, Input, Modal, Select } from '../../components/common'
import { memberRoles, memberStatuses, normalizeMemberForm, validateMemberForm } from './memberModel'
import type { Member, MemberForm, MemberFormErrors, MemberRole, MemberStatus } from './memberModel'
import { memberClubMock } from './membersMock'

type Props = {
  member?: Member
  members: Member[]
  onClose: () => void
  onSave: (form: MemberForm, editingId?: string) => void
}

export function MemberFormModal({ member, members, onClose, onSave }: Props) {
  const [form, setForm] = useState<MemberForm>(() => member ? { ...member } : {
    name: '', studentId: '', generation: memberClubMock.currentGeneration, role: '일반 회원', status: '활동',
  })
  const [errors, setErrors] = useState<MemberFormErrors>({})

  function change<K extends keyof MemberForm>(key: K, value: MemberForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateMemberForm(form, members, member?.id)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const firstField = Object.keys(nextErrors)[0]
      event.currentTarget.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus()
      return
    }
    onSave(normalizeMemberForm(form), member?.id)
  }

  return <Modal open title={member ? '멤버 정보 수정' : '멤버 등록'} className="member-modal" onClose={onClose}>
    <form className="member-form" onSubmit={submit} noValidate>
      <div className="member-form-grid">
        <Input label="이름" name="name" value={form.name} onChange={(event) => change('name', event.target.value)} aria-required="true" aria-invalid={Boolean(errors.name)} error={errors.name} maxLength={50} />
        <Input label="학번" name="studentId" value={form.studentId} onChange={(event) => change('studentId', event.target.value)} aria-required="true" aria-invalid={Boolean(errors.studentId)} error={errors.studentId} inputMode="numeric" maxLength={20} />
        <Input label="기수" name="generation" value={form.generation} onChange={(event) => change('generation', event.target.value)} aria-required="true" aria-invalid={Boolean(errors.generation)} error={errors.generation} maxLength={10} />
        <Select label="역할" name="role" value={form.role} onChange={(event) => change('role', event.target.value as MemberRole)} aria-invalid={Boolean(errors.role)} error={errors.role}>
          {memberRoles.map((role) => <option key={role}>{role}</option>)}
        </Select>
        <Select label="활동 상태" name="status" value={form.status} onChange={(event) => change('status', event.target.value as MemberStatus)} aria-invalid={Boolean(errors.status)} error={errors.status}>
          {memberStatuses.map((status) => <option key={status}>{status}</option>)}
        </Select>
      </div>
      <p className="member-form-hint">납부 상태는 납부 항목 관리에서 변경할 수 있어요.</p>
      <Button type="submit" className="member-save-button">저장하기</Button>
    </form>
  </Modal>
}
