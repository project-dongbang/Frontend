import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components/common'
import { ClubBackdrop } from './ClubBackdrop'
import { useClubDialog } from './useClubDialog'
import './ClubPage.css'
import { organizationApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'

export function ClubCreatePage() {
  const navigate = useNavigate()
  const { refresh, setActiveOrganizationId } = useSession()
  const [name, setName] = useState('')
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
      const created = await organizationApi.create({ name: name.trim() })
      setActiveOrganizationId(created.organizationId)
      await refresh()
      navigate(`/clubs/${created.organizationId}/settings`)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ClubBackdrop>
      <div className="club-overlay" onMouseDown={handleBackdropMouseDown}>
        <form ref={dialogRef} className="club-small-modal" role="dialog" aria-modal="true" aria-labelledby="club-create-title" onSubmit={handleSubmit}>
          <header>
            <div><span className="modal-kicker">DONG BANG</span><h2 id="club-create-title">새 동아리 만들기</h2></div>
            <button type="button" aria-label="닫기" onClick={close}>×</button>
          </header>
          <div className="club-small-modal-body"><Input label="동아리 이름" required placeholder="예: DongBang 개발동아리" value={name} onChange={(event) => setName(event.target.value)} autoFocus />{error && <p role="alert">{error}</p>}</div>
          <footer>
            <Button variant="secondary" type="button" onClick={close}>취소</Button>
            <Button type="submit" disabled={submitting || !name.trim()}>{submitting ? '만드는 중…' : '동아리 만들기'}</Button>
          </footer>
        </form>
      </div>
    </ClubBackdrop>
  )
}
