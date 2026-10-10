import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/common'
import { ClubBackdrop } from './ClubBackdrop'
import { useClubDialog } from './useClubDialog'
import './ClubPage.css'
import { useSession } from '../../context/SessionContext'
import { OrganizationAvatar } from '../../components/common/OrganizationAvatar'

export function ClubSelectionPage() {
  const navigate = useNavigate()
  const { organizations, organizationsError, activeOrganization, selectOrganization, loading, refresh } = useSession()
  const isMember = activeOrganization?.myRole === 'MEMBER'
  const dashboardPath = '/dashboard'
  const close = () => navigate(dashboardPath)
  const { dialogRef, handleBackdropMouseDown } =
    useClubDialog<HTMLElement>({
      onClose: close,
      closeOnDesktop: true,
      escapeOnDesktop: true,
    })

  return (
    <ClubBackdrop member={isMember}>
      <div className="club-overlay" onMouseDown={handleBackdropMouseDown}>
        <section ref={dialogRef} tabIndex={-1} className="club-choice-modal" role="dialog" aria-modal="true" aria-labelledby="club-choice-title">
          <header>
            <div>
              <span className="modal-kicker">DONG BANG</span>
              <h2 id="club-choice-title">내 동아리</h2>
            </div>
            <button type="button" aria-label="닫기" onClick={close}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg></button>
          </header>
          <div className="club-choice-body">
            <p>{loading ? '동아리 목록을 불러오고 있어요…' : '함께하는 동아리를 선택해 주세요.'}</p>
            {!loading && organizationsError && <div role="alert"><p>동아리 목록을 불러오지 못했어요. {organizationsError}</p><Button variant="secondary" onClick={() => void refresh()}>다시 시도</Button></div>}
            {organizations.map((organization) => {
              const active = organization.organizationId === activeOrganization?.organizationId
              const path = organization.myRole === 'MEMBER' ? '/dashboard?role=member' : '/dashboard'
              return <button type="button" key={organization.organizationId} className={`club-choice ${active ? 'active' : ''}`} onClick={() => { selectOrganization(organization); navigate(path) }}>
                <OrganizationAvatar organization={organization} />
                <span><strong>{organization.name}</strong><small>{active ? '현재 동아리' : '동아리 열기'}</small></span>
                <em>{active ? '✓' : '→'}</em>
              </button>
            })}
            {!loading && !organizationsError && organizations.length === 0 && <p>참여 중인 동아리가 없습니다. 새 동아리를 만들거나 초대 코드로 참여해 주세요.</p>}
          </div>
          <footer>
            <Button onClick={() => navigate('/clubs/new')}>+ 동아리 만들기</Button>
            <Button variant="secondary" onClick={() => navigate('/clubs/join')}>초대 코드로 참여</Button>
          </footer>
        </section>
      </div>
    </ClubBackdrop>
  )
}
