import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input } from '../../components/common'
import { ClubBackdrop } from './ClubBackdrop'
import { useClubDialog } from './useClubDialog'
import './ClubPage.css'
import { organizationApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'

export function ClubJoinPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { refresh, setActiveOrganizationId } = useSession()
  const [token, setToken] = useState(params.get('invite') ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const close = () => navigate('/clubs')
  const { dialogRef, handleBackdropMouseDown } =
    useClubDialog<HTMLFormElement>({ onClose: close })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const joined = await organizationApi.join(token.trim())
      setActiveOrganizationId(joined.organizationId)
      await refresh()
      navigate('/dashboard?role=member')
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
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
