import type { CalendarItem } from './scheduleMock'

type ScheduleDeleteModalProps = {
  open: boolean
  item: CalendarItem | null
  onClose: () => void
}

export function ScheduleDeleteModal({
  open,
  item,
  onClose,
}: ScheduleDeleteModalProps) {
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
        aria-labelledby="schedule-delete-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="schedule-delete-content">
          <span className="schedule-delete-label">
            일정 삭제
          </span>

          <h2 id="schedule-delete-title">
            일정을 삭제할까요?
          </h2>

          <p className="schedule-delete-subtitle">
            삭제한 일정은 다시 복구할 수 없습니다.
          </p>

          <div className="schedule-delete-warning">
            <strong>{item.title}</strong>

            <p>
              해당 일정을 삭제하면 참가 신청 정보도
              함께 삭제됩니다.
            </p>
          </div>

          <p className="schedule-delete-notice">
            정말 삭제하시겠습니까?
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
            className="schedule-delete-confirm"
            onClick={() => {
              // TODO: 일정 삭제 API 연결
              onClose()
            }}
          >
            일정 삭제
          </button>
        </div>
      </div>
    </div>
  )
}