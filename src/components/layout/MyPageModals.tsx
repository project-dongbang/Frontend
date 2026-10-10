import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Input, Modal } from '../common'
import './myPageModals.css'
import { authApi, profileApi } from '../../api/services'
import { ApiError, errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'
import { clearAuthReturnPath } from '../../routes/authReturn'
import { PATHS } from '../../routes/paths'

type ModalMode = 'profile' | 'activity' | null

type MyPageModalsProps = {
  mode: ModalMode
  userName: string
  onClose: () => void
  onOpenActivity: () => void
  onSavedName: (name: string) => void
}

const initialProfile = {
  name: '',
  studentId: '',
  department: '',
  email: '',
}

export function MyPageModals({ mode, userName, onClose, onOpenActivity, onSavedName }: MyPageModalsProps) {
  const navigate = useNavigate()
  const { activeOrganization, organizations, selectOrganization, clearSession, refresh, user } = useSession()
  const [profile, setProfile] = useState(initialProfile)
  const [draft, setDraft] = useState(initialProfile)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [activitySummary, setActivitySummary] = useState({ eventRegistrationCount: 0, feeStatus: 'NOT_APPLICABLE' })
  const [activities, setActivities] = useState<Array<{ title: string; date: string; status: string; tone: 'info' }>>([])
  const [activityOrganizationId, setActivityOrganizationId] = useState<number | null>(null)
  const visibleActivitySummary = activityOrganizationId === activeOrganization?.organizationId ? activitySummary : { eventRegistrationCount: 0, feeStatus: 'NOT_APPLICABLE' }
  const visibleActivities = activityOrganizationId === activeOrganization?.organizationId ? activities : []
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [requestError, setRequestError] = useState('')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawBusy, setWithdrawBusy] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')
  const [mustDelegate, setMustDelegate] = useState(false)
  useEffect(() => {
    if (mode !== 'profile') return
    profileApi.get().then((value) => {
      const next = { name: value.name, studentId: value.studentNumber, department: value.department, email: value.email }
      setProfile(next); setDraft(next); setProfileImageUrl(value.profileImageUrl ?? ''); setProfileLoaded(true); setRequestError('')
    }).catch((error) => setRequestError(errorMessage(error)))
  }, [mode])
  useEffect(() => {
    if (mode !== 'activity') return
    if (!activeOrganization) return
    profileApi.activities(activeOrganization.organizationId).then((raw) => {
      const value = raw as { summary?: { eventRegistrationCount?: number; feeStatus?: string }; registeredEvents?: Array<Record<string, unknown>> }
      setActivitySummary({ eventRegistrationCount: Number(value.summary?.eventRegistrationCount ?? 0), feeStatus: String(value.summary?.feeStatus ?? 'NOT_APPLICABLE') })
      setActivities((value.registeredEvents ?? []).map((activity) => ({
        title: String(activity.title ?? ''),
        date: new Date(String(activity.startsAt ?? '')).toLocaleDateString('ko-KR'),
        status: String(activity.registrationStatus ?? '신청'),
        tone: 'info' as const,
      })))
      setActivityOrganizationId(activeOrganization.organizationId)
      setRequestError('')
    }).catch((error) => setRequestError(errorMessage(error)))
  }, [activeOrganization, mode])
  const update = (key: keyof typeof initialProfile, value: string) => setDraft((current) => ({ ...current, [key]: value }))
  const save = async () => {
    if (!profileLoaded) return
    try {
      await profileApi.update({ name: draft.name, studentNumber: draft.studentId, department: draft.department, email: draft.email })
      setProfile(draft); onSavedName(draft.name); await refresh(); onClose()
    } catch (error) { setRequestError(errorMessage(error)) }
  }
  const changeImage = async (file: File | null) => {
    if (!file) return
    try {
      const result = await profileApi.uploadImage(file) as { profileImageUrl?: string }
      setProfileImageUrl(result.profileImageUrl ?? URL.createObjectURL(file))
      setRequestError('')
    } catch (error) { setRequestError(errorMessage(error)) }
  }
  const resetImage = async () => {
    try {
      const result = await profileApi.resetImage() as { profileImageUrl?: string }
      setProfileImageUrl(result.profileImageUrl ?? '')
      setRequestError('')
    } catch (error) { setRequestError(errorMessage(error)) }
  }

  const logout = async () => {
    try {
      await authApi.logout()
      clearSession()
      clearAuthReturnPath()
      navigate(PATHS.login, { replace: true })
    } catch (error) { setRequestError(errorMessage(error)) }
  }
  const withdraw = async () => {
    if (withdrawBusy) return
    setWithdrawBusy(true)
    setWithdrawError('')
    setMustDelegate(false)
    try {
      await profileApi.withdraw()
      clearSession()
      clearAuthReturnPath()
      setWithdrawOpen(false)
      onClose()
      navigate(PATHS.login, { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.code === 'ORG_400_002') {
        setMustDelegate(true)
        setWithdrawError('회장은 대표 권한을 위임한 뒤 탈퇴할 수 있어요.')
      } else {
        setWithdrawError(errorMessage(error))
      }
    } finally { setWithdrawBusy(false) }
  }
  const goToDelegation = () => {
    const ownedOrganization = organizations.find((organization) => organization.myRole === 'OWNER')
    if (ownedOrganization) selectOrganization(ownedOrganization)
    setWithdrawOpen(false)
    onClose()
    navigate(PATHS.members)
  }

  return <>
    <Modal open={mode === 'profile' && !withdrawOpen} title="내 정보" className="my-page-modal" onClose={onClose} footer={<footer className="my-page-modal-actions"><Button onClick={() => void save()} disabled={!profileLoaded}>변경사항 저장</Button><Button variant="secondary" onClick={onOpenActivity}>내 활동 내역</Button><div className="my-page-account-actions"><button type="button" className="logout-button" onClick={() => void logout()}>로그아웃</button><button type="button" className="withdraw-link" onClick={() => { setWithdrawError(''); setMustDelegate(false); setWithdrawOpen(true) }}>회원 탈퇴</button></div></footer>}>
      <div className="profile-summary">
        <span className="profile-avatar">{profileImageUrl ? <img src={profileImageUrl} alt="" /> : userName.slice(0, 1)}</span>
        <div><strong>{profile.name || userName}</strong><p>{user?.oauthProviders?.join(', ') || '로그인'} 계정으로 연결됨</p><div className="profile-image-actions"><button type="button" onClick={() => imageInputRef.current?.click()}>사진 변경</button><span>·</span><button type="button" onClick={() => void resetImage()}>기본 이미지</button></div></div>
        <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => void changeImage(event.target.files?.[0] ?? null)} />
      </div>
      <div className="profile-form-grid">
        <Input label="이름" value={draft.name} onChange={(event) => update('name', event.target.value)} />
        <Input label="학번" value={draft.studentId} onChange={(event) => update('studentId', event.target.value)} />
        <Input label="학과" value={draft.department} onChange={(event) => update('department', event.target.value)} />
        <Input label="이메일" type="email" value={draft.email} onChange={(event) => update('email', event.target.value)} />
      </div>
      {requestError && <p role="alert">{requestError}</p>}
    </Modal>

    <Modal open={withdrawOpen} title="회원 탈퇴" className="my-page-modal withdraw-modal" tone="danger" onClose={() => { if (!withdrawBusy) setWithdrawOpen(false) }} footer={<footer className="withdraw-modal-actions"><Button variant="secondary" onClick={() => setWithdrawOpen(false)} disabled={withdrawBusy}>계속 이용하기</Button><Button variant="danger" onClick={() => void withdraw()} disabled={withdrawBusy}>{withdrawBusy ? '탈퇴 처리 중…' : '회원 탈퇴'}</Button></footer>}>
      <p>서비스에서 탈퇴하면 모든 동아리에서 나가고 로그인 연결과 프로필 정보가 삭제돼요. 예정된 행사 신청도 취소되며, 지난 출석·회비 기록은 보관돼요.</p>
      <p>탈퇴 후에는 이 계정으로 서비스를 이용할 수 없어요.</p>
      {withdrawError && <p className="withdraw-error" role="alert">{withdrawError}</p>}
      {mustDelegate && <Button variant="secondary" onClick={goToDelegation}>멤버 관리에서 대표 위임하기</Button>}
    </Modal>

    <Modal open={mode === 'activity'} title="내 활동 내역" className="my-page-modal activity-modal" onClose={onClose}>
      <div className="activity-summary">
        <div><span>참가 신청</span><strong>{visibleActivitySummary.eventRegistrationCount}</strong></div>
        <div><span>납부 상태</span><strong>{visibleActivitySummary.feeStatus === 'PAID' ? '납부 완료' : visibleActivitySummary.feeStatus === 'UNPAID' ? '미납' : '해당 없음'}</strong></div>
      </div>
      <section className="activity-list" aria-label="신청한 행사"><h3>신청한 행사</h3>{visibleActivities.map((activity) => <article key={activity.title}><div><strong>{activity.title}</strong><span>{activity.date}</span></div><Badge tone={activity.tone}>{activity.status}</Badge></article>)}</section>
    </Modal>
  </>
}
