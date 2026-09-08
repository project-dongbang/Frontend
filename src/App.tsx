import { useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { Badge, Button, Card, Checkbox, EmptyState, FileUpload, Input, Modal, PageHeader, SearchField, StatCard, TabList } from './components/common'
import { CalendarIcon, CheckIcon, UsersIcon, WalletIcon } from './components/icons'

const navItems = [
  { label: '대시보드', icon: 'home' },
  { label: '멤버 관리', icon: 'users' },
  { label: '일정 · 행사', icon: 'calendar' },
  { label: '출석 관리', icon: 'check' },
  { label: '회비 관리', icon: 'wallet' },
]

function App() {
  const [activeNav, setActiveNav] = useState('대시보드')
  const [activeTab, setActiveTab] = useState('components')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <AppLayout
      activeNav={activeNav}
      onNavChange={setActiveNav}
      navItems={navItems}
      organizationName="D.Log 개발동아리"
      userName="김동방"
    >
      <PageHeader
        eyebrow="오늘의 동아리방"
        title={activeNav === '대시보드' ? '안녕하세요, 김동방 운영진님' : activeNav}
        description="지금 확인해야 할 동아리 운영 현황을 모았어요."
        action={<><Button variant="secondary">회비 걷기</Button><Button>＋ 행사 만들기</Button></>}
      />

      <section className="welcome-banner">
        <div>
          <span>2026 · 2학기 · D.Log 개발동아리</span>
          <h2>함께하는 동아리, 한눈에 관리해요.</h2>
          <p>이번 달 일정 7개 · 회비 납부 확인 필요 6명</p>
        </div>
        <div className="welcome-art" aria-hidden="true"><i /><b /></div>
      </section>

      <div className="stat-grid">
        <StatCard label="활동 회원" value="64명" description="전체 멤버 64명" icon={<UsersIcon />} />
        <StatCard label="이번 달 일정" value="5개" description="다가오는 행사 2개" tone="coral" icon={<CalendarIcon />} />
        <StatCard label="행사 출석률" value="81.6%" description="선택 행사 기준" tone="green" icon={<CheckIcon />} />
        <StatCard label="회비 납부율" value="90.6%" description="58 / 64명 납부" tone="amber" icon={<WalletIcon />} />
      </div>

      <div className="dashboard-grid">
        <Card title="다가오는 일정" description="이번 주에 예정된 행사예요." action={<Button variant="ghost">전체 보기</Button>}>
          <ul className="schedule-list">
            <ScheduleItem day="05" month="9월" title="신입 부원 환영 네트워킹" detail="18:00 · 세미나실" status="행사" />
            <ScheduleItem day="09" month="9월" title="운영진 회의" detail="18:30 · 온라인 미팅" status="회의" />
            <ScheduleItem day="12" month="9월" title="정기 부원 세미나" detail="14:00 · 강의실" status="행사" />
          </ul>
        </Card>
        <Card title="회비 현황" description="이번 학기 회비 기준이에요.">
          <div className="fee-summary">
            <strong>₩ 2,360,000</strong>
            <span>현재 회비 잔액</span>
            <div className="progress-track"><i style={{ width: '90.6%' }} /></div>
            <p><Badge tone="success">58명 납부</Badge> <Badge tone="warning">6명 미납</Badge></p>
          </div>
        </Card>
      </div>

      <Card className="component-preview" title="공통 컴포넌트" description="화면별 기능 구현에서 그대로 재사용하는 기본 UI예요.">
        <div className="component-tabs"><TabList tabs={[{ id: 'components', label: '입력 · 상태' }, { id: 'empty', label: '빈 상태' }]} activeId={activeTab} onChange={setActiveTab} /></div>
        {activeTab === 'components' ? <div className="component-grid"><Input label="동아리 이름" placeholder="예: DongBang 개발동아리" required /><SearchField placeholder="이름 또는 학번 검색" /><div className="checkbox-sample"><Checkbox defaultChecked>전체 선택</Checkbox><Checkbox>일반 회원</Checkbox></div><FileUpload /><Button onClick={() => setModalOpen(true)}>모달 확인</Button></div> : <EmptyState title="등록된 행사가 없어요" description="새 행사를 만들면 멤버들이 일정과 신청 정보를 확인할 수 있어요." action={<Button>행사 만들기</Button>} />}
      </Card>
      <Modal open={modalOpen} title="회비 걷기" description="회비 정보를 입력하고 대상 회원을 선택해 주세요." confirmLabel="회비 등록" onClose={() => setModalOpen(false)} onConfirm={() => setModalOpen(false)}><Input label="회비명" defaultValue="2학기 회비" /><Input label="회원당 금액 (원)" defaultValue="40000" /></Modal>
    </AppLayout>
  )
}

function ScheduleItem({ day, month, title, detail, status }: { day: string; month: string; title: string; detail: string; status: string }) {
  return <li className="schedule-item"><div className="date-box"><strong>{day}</strong><span>{month}</span></div><i /><div><strong>{title}</strong><span>{detail}</span></div><Badge tone="neutral">{status}</Badge></li>
}

export default App
