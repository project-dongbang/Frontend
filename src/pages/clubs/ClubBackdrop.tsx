import type { ReactNode } from 'react'
import { DashboardBanner, FeeSummaryCard, UpcomingScheduleCard } from '../dashboard/DashboardWidgets'
import { StatCard } from '../../components/common'
import { CalendarIcon, CheckIcon, UsersIcon, WalletIcon } from '../../components/icons'
import { ClubShell } from './ClubShell'

type ClubBackdropProps = { children: ReactNode; member?: boolean }

export function ClubBackdrop({ children, member = false }: ClubBackdropProps) {
  return (
    <ClubShell member={member}>
      <div className="club-backdrop" aria-hidden="true">
        <header className="club-backdrop-heading">
          <span>오늘의 동아리방</span>
          <h1>안녕하세요, {member ? '남은우' : '김동방 운영진'}님</h1>
          <p>{member ? '참여할 행사와 나의 활동, 동아리 소식을 확인해요.' : '지금 확인해야 할 동아리 운영 현황을 모았어요.'}</p>
        </header>
        <DashboardBanner
          title={member ? '우리의 다음 활동을 함께해요.' : '함께하는 동아리, 한눈에 관리해요.'}
          description={member ? '신청한 행사 0개 · 내 회비 미납' : '이번 달 일정 7개 · 회비 납부 확인 필요 6명'}
        />
        <section className="stat-grid">
          <StatCard label={member ? '내 참가 신청' : '활동 멤버'} value={member ? '0개' : '64명'} description={member ? '행사 상세에서 신청·취소할 수 있어요' : '전체 멤버 64명'} icon={<UsersIcon />} />
          <StatCard label={member ? '출석한 행사' : '이번 달 일정'} value={member ? '0회' : '7개'} description={member ? '내 출석 기록 기준' : '다음 일정 09/05'} tone="coral" icon={<CalendarIcon />} />
          <StatCard label={member ? '내 회비' : '행사 출석률'} value={member ? '미납' : '81.6%'} description={member ? '이번 학기 ₩ 40,000' : '선택 행사 기준'} tone="green" icon={<CheckIcon />} />
          <StatCard label="동아리 잔여금" value="₩1,842,500" description={member ? '회원 전체 공개' : '납부 확인 필요 6명'} tone="amber" icon={<WalletIcon />} />
        </section>
        <section className="dashboard-grid">
          <UpcomingScheduleCard />
          <FeeSummaryCard title="우리 동아리 회비" description="모든 회원에게 공개되는 현재 잔액이에요." />
        </section>
      </div>
      {children}
    </ClubShell>
  )
}
