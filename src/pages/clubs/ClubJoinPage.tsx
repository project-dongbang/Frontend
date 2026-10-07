import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input } from '../../components/common'
import { ClubBackdrop } from './ClubBackdrop'
import { useClubDialog } from './useClubDialog'
import './ClubPage.css'

export function ClubJoinPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const close = () => navigate('/clubs')
  const { dialogRef, handleBackdropMouseDown } =
    useClubDialog<HTMLFormElement>({ onClose: close })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/dashboard?role=member')
  }

  return (
    <ClubBackdrop member>
      <div className="club-overlay" onMouseDown={handleBackdropMouseDown}>
        <form ref={dialogRef} className="club-small-modal" role="dialog" aria-modal="true" aria-labelledby="club-join-title" onSubmit={handleSubmit}>
          <header>
            <div><span className="modal-kicker">DONG BANG</span><h2 id="club-join-title">동아리 참여</h2></div>
            <button type="button" aria-label="닫기" onClick={close}>×</button>
          </header>
          <div className="club-small-modal-body"><Input label="초대 코드" required placeholder="전달받은 초대 코드" defaultValue={params.get('invite') ?? ''} autoFocus /></div>
          <footer>
            <Button variant="secondary" type="button" onClick={close}>취소</Button>
            <Button type="submit">동아리 확인</Button>
          </footer>
        </form>
      </div>
    </ClubBackdrop>
  )
}
