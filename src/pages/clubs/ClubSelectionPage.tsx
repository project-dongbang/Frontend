import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/common'
import { ClubBackdrop } from './ClubBackdrop'
import './ClubPage.css'

export function ClubSelectionPage() {
  const navigate = useNavigate()

  return (
    <ClubBackdrop>
      <div className="club-overlay">
        <section className="club-choice-modal" role="dialog" aria-modal="true" aria-labelledby="club-choice-title">
          <header>
            <div>
              <span className="modal-kicker">DONG BANG</span>
              <h2 id="club-choice-title">내 동아리</h2>
            </div>
            <button type="button" aria-label="닫기" onClick={() => navigate('/dashboard')}>×</button>
          </header>
          <div className="club-choice-body">
            <p>함께하는 동아리를 선택해 주세요.</p>
            <button type="button" className="club-choice active" onClick={() => navigate('/dashboard')}>
              <b>D</b>
              <span><strong>D.Log 개발동아리</strong><small>현재 동아리</small></span>
              <em>✓</em>
            </button>
            <button type="button" className="club-choice" onClick={() => navigate('/dashboard?role=member')}>
              <b>북</b>
              <span><strong>북적북적 독서동아리</strong><small>동아리 열기</small></span>
              <em>→</em>
            </button>
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
