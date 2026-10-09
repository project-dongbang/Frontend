import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Modal, Textarea } from '../../components/common'
import { ClubShell } from './ClubShell'
import './ClubPage.css'
import { organizationApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'

export function ClubSettingsPage() {
  const navigate = useNavigate()
  const { activeOrganization, refresh } = useSession()
  const isOwner = activeOrganization?.myRole === 'OWNER'
  const canManage = isOwner || activeOrganization?.myRole === 'ADMIN'
  const [dangerAction, setDangerAction] = useState<'leave' | 'delete' | null>(null)
  const [dangerPending, setDangerPending] = useState(false)
  const [dangerError, setDangerError] = useState('')
  const [name, setName] = useState(activeOrganization?.name ?? '')
  const [description, setDescription] = useState('')
  const [operatingSemester, setOperatingSemester] = useState('')
  const [defaultFeeAmount, setDefaultFeeAmount] = useState('0')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [hasSavedAccount, setHasSavedAccount] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [loadedOrganizationId, setLoadedOrganizationId] = useState<number | null>(null)
  const [loadRevision, setLoadRevision] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!activeOrganization || !canManage) return
    let cancelled = false
    organizationApi.detail(activeOrganization.organizationId).then((detail) => {
      if (cancelled) return
      setName(String(detail.name ?? activeOrganization.name)); setDescription(String(detail.description ?? ''))
      const settings = detail.settings as { operatingSemester?: string; defaultFeeAmount?: number; paymentAccount?: { bankName?: string; accountNumber?: string; accountHolder?: string } } | undefined
      setOperatingSemester(settings?.operatingSemester ?? '')
      setDefaultFeeAmount(String(settings?.defaultFeeAmount ?? 0))
      setBankName(settings?.paymentAccount?.bankName ?? '')
      setAccountNumber(settings?.paymentAccount?.accountNumber ?? '')
      setAccountHolder(settings?.paymentAccount?.accountHolder ?? '')
      setHasSavedAccount(Boolean(settings?.paymentAccount))
      setLoadedOrganizationId(activeOrganization.organizationId)
      setRequestError('')
    }).catch((error) => { if (!cancelled) setRequestError(errorMessage(error)) })
    return () => { cancelled = true }
  }, [activeOrganization, canManage, loadRevision])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeOrganization || !canManage || loadedOrganizationId !== activeOrganization.organizationId || saving) return
    const hasAnyAccountField = [bankName, accountNumber, accountHolder].some((field) => field.trim())
    const hasCompleteAccount = [bankName, accountNumber, accountHolder].every((field) => field.trim())
    if (hasAnyAccountField && !hasCompleteAccount) {
      setRequestError('입금 계좌를 설정하려면 은행, 계좌번호, 예금주를 모두 입력해 주세요.')
      return
    }
    if (hasSavedAccount && !hasAnyAccountField) {
      setRequestError('등록된 계좌를 비우는 기능은 아직 지원되지 않습니다. 변경할 계좌를 입력해 주세요.')
      return
    }
    if (!/^\d{1,12}$/.test(defaultFeeAmount.trim())) {
      setRequestError('기본 회비는 0원 이상의 정수로 입력해 주세요.')
      return
    }
    setRequestError('')
    setSaving(true)
    try {
      await organizationApi.update(activeOrganization.organizationId, {
        name: name.trim(), description: description.trim(),
        settings: {
          operatingSemester,
          defaultFeeAmount: Number(defaultFeeAmount.trim()),
          ...(hasCompleteAccount ? { paymentAccount: { bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountHolder: accountHolder.trim() } } : {}),
        },
      })
      await refresh(); navigate('/dashboard')
    }
    catch (error) { setRequestError(errorMessage(error)) }
    finally { setSaving(false) }
  }

  async function handleDangerConfirm() {
    if (!activeOrganization || !dangerAction || dangerPending || (dangerAction === 'delete' && !isOwner)) return
    setDangerPending(true)
    setDangerError('')
    try {
      if (dangerAction === 'delete') await organizationApi.remove(activeOrganization.organizationId)
      else await organizationApi.leave(activeOrganization.organizationId)
      await refresh()
      setDangerAction(null)
      navigate('/clubs')
    } catch (error) { setDangerError(errorMessage(error)) }
    finally { setDangerPending(false) }
  }

  if (!canManage) return <ClubShell>
    <header className="club-settings-header">
      <div><span className="eyebrow">CLUB SETTINGS</span><h1>동아리 설정</h1><p>우리 동아리의 기본 정보와 운영 기준을 관리해요.</p></div>
    </header>
    <Card><p>동아리 설정은 대표와 운영진만 수정할 수 있습니다.</p></Card>
  </ClubShell>

  if (loadedOrganizationId !== activeOrganization?.organizationId) return <ClubShell>
    <header className="club-settings-header">
      <div><span className="eyebrow">CLUB SETTINGS</span><h1>동아리 설정</h1><p>우리 동아리의 기본 정보와 운영 기준을 관리해요.</p></div>
    </header>
    <Card>
      {requestError ? <>
        <p role="alert">{requestError}</p>
        <Button type="button" onClick={() => { setRequestError(''); setLoadRevision((current) => current + 1) }}>다시 시도</Button>
      </> : <p>동아리 설정을 불러오는 중이에요.</p>}
    </Card>
  </ClubShell>

  return (
    <ClubShell>
      <header className="club-settings-header">
        <div><span className="eyebrow">CLUB SETTINGS</span><h1>동아리 설정</h1><p>우리 동아리의 기본 정보와 운영 기준을 관리해요.</p></div>
      </header>
      <form className="club-settings-form" onSubmit={handleSubmit}>
        <div className="club-settings-layout">
          <Card className="club-settings-primary">
            <div className="club-settings-content">
              <h2>기본 정보</h2>
              <Input label="동아리 이름" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} />
              <Textarea label="동아리 소개" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={1000} />
              <Input label="운영 학기" value={operatingSemester} onChange={(event) => setOperatingSemester(event.target.value)} placeholder="예: 2026-2" pattern="[0-9]{4}-[12]" required />
              <h2 className="club-settings-section-title">회비 안내</h2>
              <div className="club-settings-grid">
                <Input label="이번 학기 회비 (원)" value={defaultFeeAmount} onChange={(event) => setDefaultFeeAmount(event.target.value)} inputMode="numeric" />
                <Input label="은행" value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="은행명" maxLength={50} />
                <Input label="입금 계좌" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="입금 계좌번호" maxLength={50} pattern="[0-9-]+" />
                <Input label="예금주" value={accountHolder} onChange={(event) => setAccountHolder(event.target.value)} placeholder="예금주" maxLength={100} />
              </div>
              <p className="club-setting-hint">회비 설정 변경은 이미 등록된 납부 내역의 금액을 바꾸지 않습니다.</p>
              <Button className="club-save-button" type="submit" disabled={saving}>{saving ? '저장 중…' : '변경사항 저장'}</Button>
              {requestError && <p role="alert">{requestError}</p>}
            </div>
          </Card>
          <div className="club-settings-side">
            <Card title="역할과 권한" description="운영진은 동아리 운영 정보를 관리하고, 회원은 일정과 공개된 회비 내역을 확인해요.">
              <ul className="club-role-list">
                <li><b>회장</b><span>동아리 설정 · 전체 운영 관리</span></li>
                <li><b>총무·운영진</b><span>동아리 설정 · 멤버 · 일정 · 출석 · 회비 관리</span></li>
                <li><b>일반 회원</b><span>행사 신청 · 출석 · 회비 조회</span></li>
              </ul>
              <div className="club-settings-card-action"><Button variant="secondary" type="button" onClick={() => navigate('/members')}>멤버별 역할 관리</Button></div>
            </Card>
            <Card title="함께할 멤버 초대" description="초대 링크로 우리 동아리의 멤버를 모아보세요.">
              <div className="club-invite-action"><Button type="button" onClick={() => navigate('/members?dialog=invite')}>초대 링크 만들기</Button></div>
            </Card>
            <Card className="club-danger-card" title="위험 영역" description={isOwner ? '동아리 삭제는 대표만 할 수 있습니다.' : '운영진은 동아리에서 탈퇴할 수 있습니다.'}>
              <div className="club-danger-actions">
                {isOwner
                  ? <Button variant="danger" type="button" onClick={() => setDangerAction('delete')}>동아리 삭제</Button>
                  : <Button variant="secondary" type="button" onClick={() => setDangerAction('leave')}>동아리 탈퇴</Button>}
              </div>
            </Card>
          </div>
        </div>
      </form>
      <Modal
        open={dangerAction !== null}
        title={dangerAction === 'delete' ? '동아리를 삭제할까요?' : '동아리에서 나갈까요?'}
        description={dangerAction === 'delete' ? '삭제된 동아리 정보와 활동 기록은 복구할 수 없습니다.' : '동아리에서 나가면 멤버 자격과 동아리별 활동 정보를 더 이상 확인할 수 없습니다.'}
        tone="danger"
        onClose={() => { if (!dangerPending) { setDangerAction(null); setDangerError('') } }}
        footer={<footer>
          <Button variant="secondary" disabled={dangerPending} onClick={() => { setDangerAction(null); setDangerError('') }}>취소</Button>
          <Button variant="danger" disabled={dangerPending} onClick={() => void handleDangerConfirm()}>
            {dangerPending ? '처리 중…' : dangerAction === 'delete' ? '동아리 삭제' : '동아리 나가기'}
          </Button>
        </footer>}
      >
        {dangerError && <p role="alert">{dangerError}</p>}
      </Modal>
    </ClubShell>
  )
}
