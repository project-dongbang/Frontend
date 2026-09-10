import { PageHeader, StatCard } from '../../components/common'
import { CalendarIcon, CheckIcon, UsersIcon, WalletIcon } from '../../components/icons'
import { DashboardShell } from './DashboardShell'
import { DashboardBanner, FeeSummaryCard, UpcomingScheduleCard } from './DashboardWidgets'

export function MemberDashboard() {
  return (
    <DashboardShell role="member">
      <PageHeader
        eyebrow="오늘의 동아리방"
        title="안녕하세요, 김기용님"
        description="참여할 행사와 나의 활동, 동아리 소식을 확인해요."
      />

      <DashboardBanner
        title="우리의 다음 활동을 함께해요."
        description="신청한 행사 0개 · 내 회비 미납"
      />

      <section className="stat-grid" aria-label="나의 동아리 활동">
        <StatCard
          label="내 참가 신청"
          value="0개"
          description="행사 상세에서 신청·취소할 수 있어요"
          icon={<UsersIcon />}
        />
        <StatCard
          label="출석한 행사"
          value="0회"
          description="내 출석 기록 기준"
          tone="coral"
          icon={<CalendarIcon />}
        />
        <StatCard
          label="내 회비"
          value="미납"
          description="이번 학기 ₩ 40,000"
          tone="green"
          icon={<CheckIcon />}
        />
        <StatCard
          label="동아리 잔여금"
          value="₩ 1,842,500"
          description="회비 공개 장부"
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
