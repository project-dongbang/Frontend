import { useState, type ReactNode } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import type { DashboardRole } from './DashboardPage'

const adminNavItems = [
  { label: '대시보드', icon: 'home' },
  { label: '멤버 관리', icon: 'users' },
  { label: '일정 · 행사', icon: 'calendar' },
  { label: '출석 관리', icon: 'check' },
  { label: '회비 관리', icon: 'wallet' },
]

const memberNavItems = [
  { label: '대시보드', icon: 'home' },
  { label: '일정 · 행사', icon: 'calendar' },
  { label: '내 출석', icon: 'check' },
  { label: '회비', icon: 'wallet' },
]

export function DashboardShell({
  role,
  children,
}: {
  role: DashboardRole
  children: ReactNode
}) {
  const [activeNav, setActiveNav] = useState('대시보드')
  const isAdmin = role === 'admin'

  return (
    <AppLayout
      activeNav={activeNav}
      onNavChange={setActiveNav}
      navItems={isAdmin ? adminNavItems : memberNavItems}
      organizationName="D.Log 개발동아리"
      userName={isAdmin ? '김동방' : '남은우'}
    >
      {children}
    </AppLayout>
  )
}
