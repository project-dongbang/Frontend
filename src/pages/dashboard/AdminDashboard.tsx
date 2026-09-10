import { Button, PageHeader, StatCard } from '../../components/common'
import { CalendarIcon, CheckIcon, UsersIcon, WalletIcon } from '../../components/icons'
import addIcon from '../../assets/dashboard-add.svg'
import { DashboardShell } from './DashboardShell'
import { DashboardBanner, FeeSummaryCard, UpcomingScheduleCard } from './DashboardWidgets'

export function AdminDashboard() {
  return (
    <DashboardShell role="admin">
      <PageHeader
        eyebrow="오늘의 동아리방"
        title="안녕하세요, 김동방 운영진님"
        description="지금 확인해야 할 동아리 운영 현황을 모았어요."
        action={
          <>
            <Button variant="secondary">회비 걷기</Button>
            <Button className="dashboard-create-button">
              <img src={addIcon} alt="" />
              행사 만들기
            </Button>
          </>
        }
      />

      <DashboardBanner
        title="함께하는 동아리, 한눈에 관리해요."
        description="이번 달 일정 7개 · 회비 납부 확인 필요 6명"
      />

      <section className="stat-grid" aria-label="동아리 현황">
        <StatCard
          label="활동 멤버"
          value="64명"
          description="전체 멤버 64명"
          icon={<UsersIcon />}
        />
        <StatCard
          label="이번 달 일정"
          value="7개"
          description="다음 일정 09/05"
          tone="coral"
          icon={<CalendarIcon />}
        />
        <StatCard
          label="행사 출석률"
          value="81.6%"
          description="선택 행사 기준"
          tone="green"
          icon={<CheckIcon />}
        />
        <StatCard
          label="회비 납부율"
          value="90.6%"
          description="납부 확인 필요 6명"
          tone="amber"
          icon={<WalletIcon />}
        />
      </section>

      <section className="dashboard-grid">
        <UpcomingScheduleCard />
        <FeeSummaryCard
          title="우리 동아리 회비"
          description="모든 회원에게 공개되는 현재 잔액이에요."
        />
      </section>
    </DashboardShell>
  )
}
