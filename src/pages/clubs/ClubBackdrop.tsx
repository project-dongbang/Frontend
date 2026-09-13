import type { ReactNode } from 'react'
import { DashboardOverview } from '../dashboard/DashboardWidgets'
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
        <DashboardOverview />
      </div>
      {children}
    </ClubShell>
  )
}
