import { useState, type ReactNode } from 'react'
import { BellIcon, CalendarIcon, CheckIcon, HomeIcon, MenuIcon, SettingsIcon, UsersIcon, WalletIcon } from '../icons'

type NavItem = { label: string; icon: string }

type AppLayoutProps = {
  children: ReactNode
  navItems: NavItem[]
  activeNav: string
  onNavChange: (label: string) => void
  onOrganizationClick?: () => void
  onSettingsClick?: () => void
  settingsActive?: boolean
  showSettings?: boolean
  organizationName: string
  userName: string
}

const icons = {
  home: HomeIcon,
  users: UsersIcon,
  calendar: CalendarIcon,
  check: CheckIcon,
  wallet: WalletIcon,
}

export function AppLayout({ children, navItems, activeNav, onNavChange, onOrganizationClick, onSettingsClick, settingsActive = false, showSettings = navItems.length === 5, organizationName, userName }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const handleOrganizationClick = () => {
    if (onOrganizationClick) {
      onOrganizationClick()
      return
    }

    window.location.assign('/clubs')
  }
  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick()
      return
    }

    window.location.assign('/clubs/dlog/settings')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">D</span>
          <strong>Dong<span>Bang</span></strong>
        </a>
        <nav className="global-nav">
          <button type="button">동아리⌄</button>
          <button type="button">활동⌄</button>
          <button type="button">회비⌄</button>
          <button type="button">일정⌄</button>
        </nav>
        <div className="topbar-actions" onClick={(event) => { if ((event.target as HTMLElement).closest('.organization-switcher')) handleOrganizationClick() }}>
          <button type="button" className="organization-switcher"><b>D</b>{organizationName}⌄</button>
          <button type="button" className="icon-button notification-button" aria-label="알림"><BellIcon /><i>3</i></button>
          <span className="avatar">{userName.slice(0, 1)}</span>
          <button type="button" className="mobile-menu" aria-label="메뉴" onClick={() => setMenuOpen(!menuOpen)}><MenuIcon /></button>
        </div>
      </header>

      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <span className="semester">2026 · 2학기</span>
        <nav>
          {navItems.map(({ label, icon }) => {
            const NavIcon = icons[icon as keyof typeof icons]
            return (
              <button key={label} type="button" className={activeNav === label ? 'active' : ''} onClick={() => { onNavChange(label); setMenuOpen(false) }}>
                <NavIcon />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>
        <div className="sidebar-help">
          <strong>도움이 필요하신가요?</strong>
          <p>서비스 이용 중 궁금한 점을 확인해 보세요.</p>
          <button type="button">도움말 보기</button>
        </div>
        {showSettings && <div className="sidebar-settings">
          <button
            type="button"
            className={settingsActive ? 'active' : ''}
            aria-label="동아리 설정"
            onClick={handleSettingsClick}
          >
            <SettingsIcon />
            <span>동아리 설정</span>
          </button>
        </div>}
      </aside>

      <main><div className="content">{children}</div></main>
    </div>
  )
}
