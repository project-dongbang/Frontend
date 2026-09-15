import { useState, type ReactNode } from 'react'
import { BellIcon, CalendarIcon, CheckIcon, HomeIcon, MenuIcon, SettingsIcon, UsersIcon, WalletIcon } from '../icons'
import { MyPageModals } from './MyPageModals'
import { HelpGuideModal } from './HelpGuideModal'
import { NotificationModal, type NotificationItem } from './NotificationModal'

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
  notificationCount?: number
}

const icons = {
  home: HomeIcon,
  users: UsersIcon,
  calendar: CalendarIcon,
  check: CheckIcon,
  wallet: WalletIcon,
}

const categoryMenus = [
  { title: '동아리', items: [{ label: '내 동아리', path: '/clubs' }, { label: '멤버 관리', path: '/members' }, { label: '동아리 설정', path: '/clubs/dlog/settings' }, { label: '초대 링크', path: '/clubs/join' }] },
  { title: '활동', items: [{ label: '행사 관리', path: '/events' }, { label: '출석 관리', path: '/attendance' }] },
  { title: '회비', items: [{ label: '회비 현황', path: '/fees' }, { label: '회비 관리', path: '/fees' }] },
  { title: '일정', items: [{ label: '캘린더', path: '/calendar' }, { label: '일정 관리', path: '/calendar' }] },
]

const initialNotifications: NotificationItem[] = [
  { id: 'payment', title: '현재 납부 항목을 아직 납부하지 않은 멤버가 6명 있어요.', date: '9월 3일 · 새 알림', path: '/fees', unread: true },
  { id: 'event', title: '9월 5일 신입 부원 환영 네트워킹을 준비해 주세요.', date: '9월 3일 · 새 알림', path: '/events', unread: true },
  { id: 'attendance', title: '개강 총회 출석 명단을 확인할 수 있어요.', date: '9월 1일 · 새 알림', path: '/attendance', unread: true },
]

export function AppLayout({ children, navItems, activeNav, onNavChange, onOrganizationClick, onSettingsClick, settingsActive = false, showSettings = navItems.length === 5, organizationName, userName }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [categoryMenu, setCategoryMenu] = useState<{ index: number; left: number } | null>(null)
  const [myPageMode, setMyPageMode] = useState<'profile' | 'activity' | null>(null)
  const [helpGuideOpen, setHelpGuideOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [displayName, setDisplayName] = useState(userName)
  const unreadCount = notifications.filter((notification) => notification.unread).length
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
        <nav className="global-nav" onClick={(event) => {
          const target = event.target instanceof Element ? event.target.closest('button') : null
          const buttons = Array.from(event.currentTarget.querySelectorAll('button'))
          const index = target ? buttons.indexOf(target) : -1
          if (index >= 0 && index < categoryMenus.length && target) {
            const left = target.getBoundingClientRect().left
            setCategoryMenu((current) => current?.index === index ? null : { index, left })
          }
        }}>
          <button type="button">동아리⌄</button>
          <button type="button">활동⌄</button>
          <button type="button">회비⌄</button>
          <button type="button">일정⌄</button>
          <button type="button" onClick={() => window.location.assign('/gallery')}>사진첩</button>
        </nav>
        {categoryMenu && <div key={categoryMenu.index} className="category-nav-menu" style={{ left: categoryMenu.left }} role="menu" aria-label={`${categoryMenus[categoryMenu.index].title} 메뉴`}>
          <strong>{categoryMenus[categoryMenu.index].title}</strong>
          {categoryMenus[categoryMenu.index].items.map((item) => <button key={item.label} type="button" role="menuitem" onClick={() => window.location.assign(item.path)}>{item.label}</button>)}
        </div>}
        <div className="topbar-actions" onClick={(event) => { if ((event.target as HTMLElement).closest('.organization-switcher')) handleOrganizationClick() }}>
          <button type="button" className="organization-switcher"><b>D</b><span>{organizationName}</span><i aria-hidden="true">⌄</i></button>
          <button type="button" className="icon-button notification-button" aria-label={`읽지 않은 알림 ${unreadCount}개`} onClick={() => setNotificationOpen(true)}><BellIcon />{unreadCount > 0 && <i>{unreadCount}</i>}</button>
          <button type="button" className="avatar" aria-label="내 정보" onClick={() => setMyPageMode('profile')}>{displayName.slice(0, 1)}</button>
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
          <button type="button" onClick={() => setHelpGuideOpen(true)}>도움말 보기</button>
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
      <MyPageModals mode={myPageMode} userName={displayName} onClose={() => setMyPageMode(null)} onOpenActivity={() => setMyPageMode('activity')} onSavedName={setDisplayName} />
      <HelpGuideModal open={helpGuideOpen} onClose={() => setHelpGuideOpen(false)} />
      <NotificationModal
        open={notificationOpen}
        notifications={notifications}
        onClose={() => setNotificationOpen(false)}
        onMarkAllRead={() => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))}
        onNotificationClick={(id, path) => {
          setNotifications((items) => items.map((item) => item.id === id ? { ...item, unread: false } : item))
          setNotificationOpen(false)
          window.location.assign(path)
        }}
      />
    </div>
  )
}
