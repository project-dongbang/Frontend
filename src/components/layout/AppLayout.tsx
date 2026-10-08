import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { BellIcon, CalendarIcon, CheckIcon, GalleryIcon, HomeIcon, MenuIcon, SettingsIcon, UsersIcon, WalletIcon } from '../icons'
import { MyPageModals } from './MyPageModals'
import { HelpGuideModal } from './HelpGuideModal'
import { NotificationModal, type NotificationItem } from './NotificationModal'
import { notificationApi } from '../../api/services'
import { useSession } from '../../context/SessionContext'

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
  gallery: GalleryIcon,
}

const initialNotifications: NotificationItem[] = [
  { id: 'payment', title: '현재 납부 항목을 아직 납부하지 않은 멤버가 6명 있어요.', date: '9월 3일 · 새 알림', path: '/fees', unread: true },
  { id: 'event', title: '9월 5일 신입 부원 환영 네트워킹을 준비해 주세요.', date: '9월 3일 · 새 알림', path: '/calendar', unread: true },
  { id: 'attendance', title: '개강 총회 출석 명단을 확인할 수 있어요.', date: '9월 1일 · 새 알림', path: '/attendance', unread: true },
]

export function AppLayout({ children, navItems, activeNav, onNavChange, onOrganizationClick, onSettingsClick, settingsActive = false, showSettings = navItems.length === 5, organizationName, userName, notificationCount = initialNotifications.length }: AppLayoutProps) {
  const { activeOrganization } = useSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isMember = params.get('role') === 'member'
  const [menuOpen, setMenuOpen] = useState(false)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const [myPageMode, setMyPageMode] = useState<'profile' | 'activity' | null>(null)
  const [helpGuideOpen, setHelpGuideOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState(() =>
    initialNotifications.slice(0, notificationCount),
  )
  const [savedDisplayName, setSavedDisplayName] = useState<string | null>(null)
  const displayName = savedDisplayName ?? userName
  const unreadCount = notifications.filter((notification) => notification.unread).length
  const dashboardPath = isMember ? '/dashboard?role=member' : '/dashboard'
  useEffect(() => {
    if (!activeOrganization) return
    notificationApi.list(activeOrganization.organizationId).then((response) => {
      const pathByType: Record<string, string> = { EVENT: '/calendar', FEE_ITEM: '/fees', ATTENDANCE_SESSION: '/attendance' }
      setNotifications((response.content ?? []).map((item) => ({
        id: String(item.notificationId),
        title: item.message || item.title,
        date: `${new Date(item.sentAt).toLocaleDateString('ko-KR')} ${item.isRead ? '· 읽음' : '· 새 알림'}`,
        path: pathByType[item.referenceType] ?? '/dashboard',
        unread: !item.isRead,
      })))
    }).catch(() => {})
  }, [activeOrganization])
  const closeMobileMenu = (restoreFocus = false) => {
    setMenuOpen(false)
    if (restoreFocus) {
      window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus())
    }
  }

  useEffect(() => {
    if (!menuOpen) return

    const sidebar = sidebarRef.current
    const previousOverflow = document.body.style.overflow
    const mobileViewport = window.matchMedia('(max-width: 760px)')
    const focusableSelector = 'button:not(:disabled), a[href], [tabindex="0"]'
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setMenuOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMenuOpen(false)
        window.requestAnimationFrame(() => mobileMenuButtonRef.current?.focus())
        return
      }
      if (event.key !== 'Tab' || !sidebar) return

      const focusable = Array.from(
        sidebar.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.getClientRects().length > 0)
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    mobileViewport.addEventListener('change', handleViewportChange)
    window.requestAnimationFrame(() => {
      sidebar?.querySelector<HTMLElement>(focusableSelector)?.focus()
    })

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      mobileViewport.removeEventListener('change', handleViewportChange)
    }
  }, [menuOpen])

  const handleOrganizationClick = () => {
    closeMobileMenu()
    if (onOrganizationClick) {
      onOrganizationClick()
      return
    }

    navigate(isMember ? '/clubs?role=member' : '/clubs')
  }
  const handleSettingsClick = () => {
    closeMobileMenu()
    if (onSettingsClick) {
      onSettingsClick()
      return
    }

    navigate('/clubs/dlog/settings')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => navigate(dashboardPath)} aria-label="대시보드로 이동">
          <span className="brand-mark">D</span>
          <strong>Dong<span>Bang</span></strong>
        </button>
        <div className="topbar-actions">
          <button type="button" className="organization-switcher" onClick={handleOrganizationClick}><b>D</b><span>{organizationName}</span><i aria-hidden="true">⌄</i></button>
          <button type="button" className="icon-button notification-button" aria-label={`읽지 않은 알림 ${unreadCount}개`} onClick={() => setNotificationOpen(true)}><BellIcon />{unreadCount > 0 && <i>{unreadCount}</i>}</button>
          <button type="button" className="avatar" aria-label="내 정보" onClick={() => setMyPageMode('profile')}>{displayName.slice(0, 1)}</button>
          <button ref={mobileMenuButtonRef} type="button" className="mobile-menu" aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen((open) => !open)}><MenuIcon /></button>
        </div>
      </header>

      {menuOpen && <button type="button" className="mobile-nav-backdrop" aria-label="메뉴 닫기" onClick={() => closeMobileMenu(true)} />}

      <aside ref={sidebarRef} id="primary-navigation" className={`sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="주 메뉴">
        <button type="button" className="sidebar-organization" onClick={handleOrganizationClick}>
          <b>D</b>
          <span><strong>{organizationName}</strong><small>동아리 전환</small></span>
          <i aria-hidden="true">›</i>
        </button>
        <span className="semester">2026 · 2학기</span>
        <nav aria-label="서비스 메뉴">
          {navItems.map(({ label, icon }) => {
            const NavIcon = icons[icon as keyof typeof icons]
            return (
              <button key={label} type="button" className={activeNav === label ? 'active' : ''} aria-current={activeNav === label ? 'page' : undefined} onClick={() => { onNavChange(label); closeMobileMenu() }}>
                <NavIcon />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>
        <div className="sidebar-help">
          <strong>도움이 필요하신가요?</strong>
          <p>서비스 이용 중 궁금한 점을 확인해 보세요.</p>
          <button type="button" onClick={() => { closeMobileMenu(); setHelpGuideOpen(true) }}>도움말 보기</button>
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
      <MyPageModals mode={myPageMode} userName={displayName} onClose={() => setMyPageMode(null)} onOpenActivity={() => setMyPageMode('activity')} onSavedName={setSavedDisplayName} />
      <HelpGuideModal open={helpGuideOpen} onClose={() => setHelpGuideOpen(false)} />
      <NotificationModal
        open={notificationOpen}
        notifications={notifications}
        onClose={() => setNotificationOpen(false)}
        onMarkAllRead={() => {
          if (activeOrganization) void notificationApi.readAll(activeOrganization.organizationId)
          setNotifications((items) => items.map((item) => ({ ...item, unread: false })))
        }}
        onNotificationClick={(id, path) => {
          void notificationApi.read(Number(id)).catch(() => {})
          setNotifications((items) => items.map((item) => item.id === id ? { ...item, unread: false } : item))
          setNotificationOpen(false)
          navigate(`${path}${isMember ? '?role=member' : ''}`)
        }}
      />
    </div>
  )
}
