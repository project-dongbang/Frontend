import { useEffect, useState, type FormEvent } from 'react'
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

export function ClubJoinPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user, loading, refresh, setActiveOrganizationId } = useSession()
  const [token, setToken] = useState(params.get('invite') ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const close = () => { clearAuthReturnPath(); navigate(PATHS.clubs) }
  const { dialogRef, handleBackdropMouseDown } =
    useClubDialog<HTMLFormElement>({ onClose: close })

  useEffect(() => {
    if (loading) return
    if (!user || user.onboardingRequired) {
      if (token.trim()) saveAuthReturnPath(`${PATHS.joinClub}?invite=${encodeURIComponent(token.trim())}`)
      navigate(user ? PATHS.signup : PATHS.login, { replace: true })
    }
  }, [loading, navigate, token, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || user.onboardingRequired) return
    setSubmitting(true)
    setError('')
    try {
      const joined = await organizationApi.join(token.trim())
      clearAuthReturnPath()
      setActiveOrganizationId(joined.organizationId)
      await refresh()
      navigate('/dashboard?role=member')
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        saveAuthReturnPath(`${PATHS.joinClub}?invite=${encodeURIComponent(token.trim())}`)
        navigate(PATHS.login, { replace: true })
        return
      }
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !user || user.onboardingRequired) {
    return <main className="login-page"><p role="status">로그인 정보를 확인하고 있어요…</p></main>
  }

  return (
    <ClubBackdrop member>
      <div className="club-overlay" onMouseDown={handleBackdropMouseDown}>
        <form ref={dialogRef} className="club-small-modal" role="dialog" aria-modal="true" aria-labelledby="club-join-title" onSubmit={handleSubmit}>
          <header>
            <div><span className="modal-kicker">DONG BANG</span><h2 id="club-join-title">동아리 참여</h2></div>
            <button type="button" aria-label="닫기" onClick={close}>×</button>
          </header>
          <div className="club-small-modal-body"><Input label="초대 코드" required placeholder="전달받은 초대 코드" value={token} onChange={(event) => setToken(event.target.value)} autoFocus />{error && <p role="alert">{error}</p>}</div>
          <footer>
            <Button variant="secondary" type="button" onClick={close}>취소</Button>
            <Button type="submit" disabled={submitting || !token.trim()}>{submitting ? '확인 중…' : '동아리 확인'}</Button>
          </footer>
        </form>
      </div>
    </ClubBackdrop>
  )
}
