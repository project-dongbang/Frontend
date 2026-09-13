import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Modal, Select, Textarea } from '../../components/common'
import { ClubShell } from './ClubShell'
import './ClubPage.css'

export function ClubSettingsPage() {
  const navigate = useNavigate()
  const [dangerAction, setDangerAction] = useState<'leave' | 'delete' | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/dashboard')
  }

  return (
    <ClubShell>
      <header className="club-settings-header">
        <span className="eyebrow">CLUB SETTINGS</span>
        <h1>동아리 설정</h1>
        <p>우리 동아리의 기본 정보와 운영 기준을 관리해요.</p>
      </header>
      <form className="club-settings-form" onSubmit={handleSubmit}>
        <div className="club-settings-layout">
          <Card className="club-settings-primary">
            <div className="club-settings-content">
              <h2>기본 정보</h2>
              <Input label="동아리 이름" defaultValue="D.Log 개발동아리" required />
              <Textarea label="동아리 소개" defaultValue="함께 만들고, 함께 성장하는 개발동아리입니다." rows={4} />
              <Select label="운영 학기" defaultValue="2026 · 2학기">
                <option>2026 · 2학기</option>
                <option>2026 · 1학기</option>
              </Select>
              <h2 className="club-settings-section-title">회비 안내</h2>
              <div className="club-settings-grid">
                <Input label="이번 학기 회비 (원)" defaultValue="40000" inputMode="numeric" />
                <Select label="은행" defaultValue="">
                  <option value="">은행명</option>
                  <option>카카오뱅크</option>
                  <option>국민은행</option>
                </Select>
                <Input label="입금 계좌" placeholder="입금 계좌번호" />
                <Input label="예금주" placeholder="예금주" />
              </div>
              <p className="club-setting-hint">회비 설정 변경은 이미 등록된 납부 내역의 금액을 바꾸지 않습니다.</p>
              <Button className="club-save-button" type="submit">변경사항 저장</Button>
            </div>
          </Card>
          <div className="club-settings-side">
            <Card title="역할과 권한" description="운영진은 동아리 운영 정보를 관리하고, 회원은 일정과 공개된 회비 내역을 확인해요.">
              <ul className="club-role-list">
                <li><b>회장</b><span>동아리 설정 · 전체 운영 관리</span></li>
                <li><b>총무·운영진</b><span>멤버 · 일정 · 출석 · 회비 관리</span></li>
                <li><b>일반 회원</b><span>행사 신청 · 출석 · 회비 조회</span></li>
              </ul>
              <div className="club-settings-card-action"><Button variant="secondary" type="button">멤버별 역할 관리</Button></div>
            </Card>
            <Card title="함께할 멤버 초대" description="초대 링크로 우리 동아리의 멤버를 모아보세요.">
              <div className="club-invite-action"><Button type="button">초대 링크 만들기</Button></div>
            </Card>
            <Card className="club-danger-card" title="위험 영역" description="대표 권한 이외에는 탈퇴할 수 있어요.">
              <div className="club-danger-actions">
                <Button variant="secondary" type="button" onClick={() => setDangerAction('leave')}>동아리 탈퇴</Button>
                <Button variant="danger" type="button" onClick={() => setDangerAction('delete')}>동아리 삭제</Button>
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
        confirmLabel={dangerAction === 'delete' ? '동아리 삭제' : '동아리 나가기'}
        onClose={() => setDangerAction(null)}
        onConfirm={() => navigate('/clubs')}
      />
    </ClubShell>
  )
}
