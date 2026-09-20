import type { CalendarItem } from './scheduleMock'

type ScheduleEarlyCloseModalProps = {
  open: boolean
  item: CalendarItem | null
  onClose: () => void
  onConfirm: () => void
}

export function ScheduleEarlyCloseModal({
  open,
  item,
  onClose,
  onConfirm,
}: ScheduleEarlyCloseModalProps) {
  if (!open || !item) return null

  return (
    <div
      className="schedule-modal-backdrop nested"
      onMouseDown={onClose}
    >
      <div
        className="schedule-delete-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-early-close-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="schedule-delete-content">
          <span className="schedule-delete-label">
            일정 조기 마감
          </span>

          <h2 id="schedule-early-close-title">
            일정을 조기 마감할까요?
          </h2>

          <p className="schedule-delete-subtitle">
            조기 마감 후에는 더 이상 참가 신청을 받을 수 없습니다.
          </p>

          <div className="schedule-delete-warning">
            <strong>{item.title}</strong>

            <p>
              현재 진행 중인 참가 신청을 종료하고
              일정을 조기 마감합니다.
            </p>
          </div>

          <p className="schedule-delete-notice">
            조기 마감 후에는 참가 신청을 다시 받을 수 없습니다.
          </p>
        </div>

        <div className="schedule-delete-actions">
          <button
            type="button"
            className="schedule-delete-cancel"
            onClick={onClose}
          >
            취소
          </button>

          <button
            type="button"
            className="schedule-early-close-confirm"
            onClick={onConfirm}
          >
            조기 마감
          </button>
        </div>
      </div>
    </div>
  )
}