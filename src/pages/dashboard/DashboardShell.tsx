import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { PATHS } from '../../routes/paths'
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
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isAdmin = role === 'admin'
  const navPaths: Record<string, string> = {
    '대시보드': PATHS.dashboard,
    '멤버 관리': PATHS.members,
    '일정 · 행사': PATHS.calendar,
    '출석 관리': PATHS.attendance,
    '내 출석': PATHS.attendance,
    '회비 관리': PATHS.fees,
    '회비': PATHS.fees,
  }
  const activeNav = (isAdmin ? adminNavItems : memberNavItems).find((item) => navPaths[item.label] === pathname)?.label ?? ''
  return (
    <AppLayout
      activeNav={activeNav}
      onNavChange={(label) => {
        const path = navPaths[label]
        if (path) navigate(`${path}${isAdmin ? '' : '?role=member'}`)
      }}
      navItems={isAdmin ? adminNavItems : memberNavItems}
      organizationName="D.Log 개발동아리"
      userName={isAdmin ? '김동방' : '남은우'}
      notificationCount={isAdmin ? 3 : 1}
    >
      {children}
    </AppLayout>
  )
}
