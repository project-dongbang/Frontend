import { useEffect, useRef } from 'react'
import { Button } from '../../components/common'
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
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    }

    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  if (!item) return null

  return (
    <dialog
      ref={dialogRef}
      className="schedule-workflow-dialog schedule-delete-dialog"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <header className="schedule-modal-head">
        <div>
          <h2>일정 삭제</h2>
        </div>

        <button
          type="button"
          className="schedule-modal-close"
          aria-label="일정 삭제 닫기"
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <div className="schedule-workflow-body">
        <p className="schedule-delete-message">
          {item.title} 일정을 삭제할까요?
          <br />
          참가 신청 화면에서도 사라집니다.
        </p>

        <div className="schedule-delete-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            취소
          </Button>

          <Button
            type="button"
            onClick={() => {
              // TODO: 일정 삭제 API 연결
              onClose()
            }}
          >
            확인
          </Button>
        </div>
      </div>
    </dialog>
  )
}