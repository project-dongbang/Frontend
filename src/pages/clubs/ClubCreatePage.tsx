import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components/common'
import { ClubBackdrop } from './ClubBackdrop'
import './ClubPage.css'

export function ClubCreatePage() {
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/clubs/dlog/settings')
  }

  return (
    <ClubBackdrop>
      <div className="club-overlay">
        <form className="club-small-modal" onSubmit={handleSubmit}>
          <header>
            <div><span className="modal-kicker">DONG BANG</span><h2>새 동아리 만들기</h2></div>
            <button type="button" aria-label="닫기" onClick={() => navigate('/clubs')}>×</button>
          </header>
          <div className="club-small-modal-body"><Input label="동아리 이름" required placeholder="예: DongBang 개발동아리" autoFocus /></div>
          <footer>
            <Button variant="secondary" type="button" onClick={() => navigate('/clubs')}>취소</Button>
            <Button type="submit">동아리 만들기</Button>
          </footer>
        </form>
      </div>
    </ClubBackdrop>
  )
}
