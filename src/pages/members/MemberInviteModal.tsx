import { useEffect, useState } from 'react'
import { Button, Input, Modal } from '../../components/common'
import { PATHS } from '../../routes/paths'
import { organizationApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'

export function MemberInviteModal({ onClose }: { onClose: () => void }) {
  const [notice, setNotice] = useState('')
  const [copying, setCopying] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const { activeOrganization } = useSession()
  const inviteUrl = new URL(PATHS.joinClub, window.location.origin)
  if (inviteCode) inviteUrl.searchParams.set('invite', inviteCode)

  useEffect(() => {
    if (!activeOrganization) return
    organizationApi.invitation(activeOrganization.organizationId)
      .then((response) => setInviteCode(response.invitationToken))
      .catch((error) => setNotice(errorMessage(error)))
  }, [activeOrganization])

  async function copyLink() {
    setCopying(true)
    try {
      if (!inviteCode) throw new Error('초대 링크를 생성하고 있어요.')
      await navigator.clipboard.writeText(inviteUrl.href)
      setNotice('초대 링크를 복사했어요.')
    } catch {
      setNotice('복사하지 못했어요. 초대 링크를 선택해 직접 복사해 주세요.')
    } finally {
      setCopying(false)
    }
  }

  return <Modal open title="멤버 초대" className="member-modal member-invite-modal" onClose={onClose}>
    <p className="member-invite-description">{activeOrganization?.name ?? '동아리'}에 함께할 멤버에게 초대 정보를 전달하세요.</p>
    <div className="member-invite-fields">
      <Input label="초대 코드" value={inviteCode} placeholder="생성 중…" readOnly onFocus={(event) => event.currentTarget.select()} />
      <Input label="초대 링크" type="url" value={inviteCode ? inviteUrl.href : ''} readOnly onFocus={(event) => event.currentTarget.select()} />
    </div>
    <p className="member-form-hint">초대된 회원은 일반 회원으로 참여합니다. 역할은 멤버 관리에서 변경할 수 있어요.</p>
    <div className="member-invite-actions">
      <Button onClick={copyLink} disabled={copying || !inviteCode}>{copying ? '복사 중…' : '초대 링크 복사'}</Button>
    </div>
    <p className="member-copy-status" role="status">{notice}</p>
  </Modal>
}
