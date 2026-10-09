import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { useSession } from '../../context/SessionContext'
import { PATHS } from '../../routes/paths'

const navItems = [
  { label: '대시보드', icon: 'home' },
  { label: '동아리 관리', icon: 'users' },
  { label: '일정 · 행사', icon: 'calendar' },
  { label: '출석 관리', icon: 'check' },
  { label: '회비 관리', icon: 'wallet' },
]

export function ClubShell({ children, member = false }: { children: ReactNode; member?: boolean }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { activeOrganization, user } = useSession()
  const navPaths: Record<string, string> = {
    '대시보드': PATHS.dashboard,
    '동아리 관리': PATHS.members,
    '일정 · 행사': PATHS.calendar,
    '출석 관리': PATHS.attendance,
    '회비 관리': PATHS.fees,
  }
  const activeNav = navItems.find((item) => navPaths[item.label] === pathname)?.label ?? ''

  return (
    <div className="club-app-shell">
      <AppLayout
        activeNav={activeNav}
        onNavChange={(label) => {
          const path = navPaths[label]
          if (path) navigate(path)
        }}
        settingsActive={pathname.endsWith('/settings')}
        navItems={navItems}
        organizationName={activeOrganization?.name ?? '동아리를 선택해 주세요'}
        userName={user?.name ?? '사용자'}
        showSettings={Boolean(activeOrganization && !member && activeOrganization.myRole !== 'MEMBER')}
      >
        {children}
      </AppLayout>
    </div>
  )
}
