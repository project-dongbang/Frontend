import { Button, Modal } from '../common'
import './notificationModal.css'

export type NotificationItem = {
  id: string
  title: string
  date: string
  path: string
  unread: boolean
}

type NotificationModalProps = {
  open: boolean
  notifications: NotificationItem[]
  onClose: () => void
  onMarkAllRead: () => void
  onNotificationClick: (id: string, path: string) => void
}

export function NotificationModal({ open, notifications, onClose, onMarkAllRead, onNotificationClick }: NotificationModalProps) {
  return <Modal open={open} title="알림" className="notification-modal" onClose={onClose}>
    <div className="notification-intro"><p>동아리의 새로운 소식을 확인해요.</p><Button variant="ghost" className="mark-all-read" onClick={onMarkAllRead} disabled={!notifications.some((notification) => notification.unread)}>모두 읽음</Button></div>
    <div className="notification-list" aria-label="알림 목록">
      {notifications.map((notification) => <button key={notification.id} type="button" className={notification.unread ? 'is-unread' : ''} onClick={() => onNotificationClick(notification.id, notification.path)}>
        <span><strong>{notification.title}</strong><small>{notification.unread ? notification.date : notification.date.replace(' · 새 알림', ' · 읽음')}</small></span><em aria-hidden="true">→</em>
      </button>)}
    </div>
  </Modal>
}
