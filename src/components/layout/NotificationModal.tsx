import { Button, Modal } from '../common'
import './notificationModal.css'
import { FeedbackState } from '../common/FeedbackState'

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
  error?: string
  onRetry?: () => void
  onClose: () => void
  onMarkAllRead: () => void
  onNotificationClick: (id: string, path: string) => void
}

export function NotificationModal({ open, notifications, error, onRetry, onClose, onMarkAllRead, onNotificationClick }: NotificationModalProps) {
  return <Modal open={open} title="알림" className="notification-modal" onClose={onClose}>
    <div className="notification-intro"><p>동아리의 새로운 소식을 확인해요.</p><Button variant="ghost" className="mark-all-read" onClick={onMarkAllRead} disabled={!notifications.some((notification) => notification.unread)}>모두 읽음</Button></div>
    <div className="notification-list" aria-label="알림 목록">
      {error && <FeedbackState kind="error" title="알림을 불러오지 못했어요" description={error} action={onRetry && <Button variant="secondary" onClick={onRetry}>다시 시도</Button>} />}
      {!error && notifications.length === 0 && <FeedbackState title="아직 새로운 알림이 없어요" description="동아리에 새로운 소식이 생기면 여기에서 알려드릴게요." />}
      {notifications.map((notification) => <button key={notification.id} type="button" className={notification.unread ? 'is-unread' : ''} onClick={() => onNotificationClick(notification.id, notification.path)}>
        <span><strong>{notification.title}</strong><small>{notification.unread ? notification.date : notification.date.replace(' · 새 알림', ' · 읽음')}</small></span><em aria-hidden="true">→</em>
      </button>)}
    </div>
  </Modal>
}
