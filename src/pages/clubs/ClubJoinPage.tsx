import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components/common'
import { ClubBackdrop } from './ClubBackdrop'
import './ClubPage.css'

export function ClubJoinPage() {
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/dashboard?role=member')
  }

  return (
    <ClubBackdrop member>
      <div className="club-overlay">
        <form className="club-small-modal" onSubmit={handleSubmit}>
          <header>
            <div><span className="modal-kicker">DONG BANG</span><h2>동아리 참여</h2></div>
            <button type="button" aria-label="닫기" onClick={() => navigate('/clubs')}>×</button>
          </header>
          <div className="club-small-modal-body"><Input label="초대 코드" required placeholder="전달받은 초대 코드" autoFocus /></div>
          <footer>
            <Button variant="secondary" type="button" onClick={() => navigate('/clubs')}>취소</Button>
            <Button type="submit">동아리 확인</Button>
          </footer>
        </form>
      </div>
    </ClubBackdrop>
  )
}
