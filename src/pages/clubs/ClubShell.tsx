import { useState, type ReactNode } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'

const navItems = [
  { label: '대시보드', icon: 'home' },
  { label: '동아리 관리', icon: 'users' },
  { label: '일정 · 행사', icon: 'calendar' },
  { label: '출석 관리', icon: 'check' },
  { label: '회비 관리', icon: 'wallet' },
]

export function ClubShell({ children, member = false }: { children: ReactNode; member?: boolean }) {
  const [activeNav, setActiveNav] = useState('동아리 관리')

  return (
    <AppLayout
      activeNav={activeNav}
      onNavChange={setActiveNav}
      settingsActive
      navItems={navItems}
      organizationName="D.Log 개발동아리"
      userName={member ? '남은우' : '김동방'}
    >
      {children}
    </AppLayout>
  )
}
