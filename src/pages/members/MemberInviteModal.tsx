import { useState } from 'react'
import { Button, Input, Modal } from '../../components/common'
import { PATHS } from '../../routes/paths'
import { memberClubMock } from './membersMock'

export function MemberInviteModal({ onClose, onRegister }: { onClose: () => void; onRegister: () => void }) {
  const [notice, setNotice] = useState('')
  const [copying, setCopying] = useState(false)
  const inviteUrl = new URL(PATHS.joinClub, window.location.origin)
  inviteUrl.searchParams.set('invite', memberClubMock.inviteCode)

  async function copyLink() {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(inviteUrl.href)
      setNotice('초대 링크를 복사했어요.')
    } catch {
      setNotice('복사하지 못했어요. 초대 링크를 선택해 직접 복사해 주세요.')
    } finally {
      setCopying(false)
    }
  }

  return <Modal open title="멤버 초대" className="member-modal member-invite-modal" onClose={onClose}>
    <p className="member-invite-description">{memberClubMock.name}에 함께할 멤버에게 초대 정보를 전달하세요.</p>
    <div className="member-invite-fields">
      <Input label="초대 코드" value={memberClubMock.inviteCode} readOnly onFocus={(event) => event.currentTarget.select()} />
      <Input label="초대 링크" type="url" value={inviteUrl.href} readOnly onFocus={(event) => event.currentTarget.select()} />
    </div>
    <p className="member-form-hint">초대된 회원은 일반 회원으로 참여합니다. 역할은 멤버 관리에서 변경할 수 있어요.</p>
    <div className="member-invite-actions">
      <Button onClick={copyLink} disabled={copying}>{copying ? '복사 중…' : '초대 링크 복사'}</Button>
      <Button variant="secondary" onClick={onRegister}>멤버 직접 등록</Button>
    </div>
    <p className="member-copy-status" role="status">{notice}</p>
  </Modal>
}
