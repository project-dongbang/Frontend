import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input } from '../../components/common'
import { ClubBackdrop } from './ClubBackdrop'
import { useClubDialog } from './useClubDialog'
import './ClubPage.css'
import { organizationApi } from '../../api/services'
import { ApiError, errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'
import { PATHS } from '../../routes/paths'
import { clearAuthReturnPath, saveAuthReturnPath } from '../../routes/authReturn'
import { invitationTokenFromInput } from './invitationToken'

export function ClubJoinPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const autoJoin = params.get('autoJoin') === '1'
  const { user, loading, refresh, setActiveOrganizationId } = useSession()
  const [token, setToken] = useState(() => invitationTokenFromInput(params.get('invite') ?? ''))
  const inviteToken = invitationTokenFromInput(token)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const autoJoinAttempted = useRef(false)
  const close = () => { clearAuthReturnPath(); navigate(PATHS.clubs) }
  const { dialogRef, handleBackdropMouseDown } =
    useClubDialog<HTMLFormElement>({ onClose: close })

  useEffect(() => {
    if (loading) return
    if (!user || user.onboardingRequired) {
      if (inviteToken) saveAuthReturnPath(`${PATHS.joinClub}?invite=${encodeURIComponent(inviteToken)}`)
      navigate(user ? PATHS.signup : PATHS.login, { replace: true })
    }
  }, [inviteToken, loading, navigate, user])

  const joinInvitation = useCallback(async () => {
    if (!user || user.onboardingRequired || !inviteToken) return
    setSubmitting(true)
    setError('')
    try {
      const joined = await organizationApi.join(inviteToken)
      clearAuthReturnPath()
      setActiveOrganizationId(joined.organizationId)
      await refresh()
      navigate('/dashboard?role=member')
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        saveAuthReturnPath(`${PATHS.joinClub}?invite=${encodeURIComponent(inviteToken)}`)
        navigate(PATHS.login, { replace: true })
        return
      }
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }, [inviteToken, navigate, refresh, setActiveOrganizationId, user])

  useEffect(() => {
    if (!autoJoin || loading || !user || user.onboardingRequired || !inviteToken || autoJoinAttempted.current) return
    autoJoinAttempted.current = true
    navigate(`${PATHS.joinClub}?invite=${encodeURIComponent(inviteToken)}`, { replace: true })
    void joinInvitation()
  }, [autoJoin, inviteToken, joinInvitation, loading, navigate, user])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void joinInvitation()
  }

  if (loading || !user || user.onboardingRequired || (autoJoin && inviteToken)) {
    return <main className="login-page"><p role="status">{autoJoin && user && !user.onboardingRequired ? '동아리 참여를 처리하고 있어요…' : '로그인 정보를 확인하고 있어요…'}</p></main>
  }

  return (
    <ClubBackdrop member>
      <div className="club-overlay" onMouseDown={handleBackdropMouseDown}>
        <form ref={dialogRef} className="club-small-modal" role="dialog" aria-modal="true" aria-labelledby="club-join-title" onSubmit={handleSubmit}>
          <header>
            <div><span className="modal-kicker">DONG BANG</span><h2 id="club-join-title">동아리 참여</h2></div>
            <button type="button" aria-label="닫기" onClick={close}>×</button>
          </header>
          <div className="club-small-modal-body"><Input label="초대 코드" required placeholder="초대 코드 또는 링크를 붙여넣으세요" value={token} onChange={(event) => { const value = event.target.value; setToken(invitationTokenFromInput(value) || value) }} autoFocus />{error && <p role="alert">{error}</p>}</div>
          <footer>
            <Button variant="secondary" type="button" onClick={close}>취소</Button>
            <Button type="submit" disabled={submitting || !inviteToken}>{submitting ? '확인 중…' : '동아리 확인'}</Button>
          </footer>
        </form>
      </div>
    </ClubBackdrop>
  )
}
