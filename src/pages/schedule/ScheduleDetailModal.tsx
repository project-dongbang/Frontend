import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/common'
import type { CalendarItem } from './scheduleMock'

type ScheduleDetailModalProps = {
  open: boolean
  item: CalendarItem | null
  onClose: () => void
  onEditRequest: (item: CalendarItem) => void
  onDeleteRequest: (item: CalendarItem) => void
}

function formatDateTime(value: string) {
  return value.replace('T', ' ')
}

export function ScheduleDetailModal({
  open,
  item,
  onClose,
  onEditRequest,
  onDeleteRequest,
}: ScheduleDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
    const [joined, setJoined] = useState(false)

    useEffect(() => {
    setJoined(false)
    }, [item?.id])

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

  const handleClose = () => {
    onClose()
  }

  if (!item) return null

  const isEvent = item.type === 'event'

  const deadline = item.deadline || item.start
  const isClosed = new Date(deadline) <= new Date()
  const isFull = item.capacity !== undefined && (item.registered ?? 0) >= item.capacity

  return (
    <>
    <dialog
      ref={dialogRef}
      className="schedule-workflow-dialog"
      onCancel={(event) => {
        event.preventDefault()
        handleClose()
      }}
    >
      <div className="schedule-detail-modal">
        <header className="schedule-modal-head">
          <div>
            <h2>{item.title}</h2>

            <p>
              {isEvent
                ? '참가 신청 행사'
                : '동아리 일정'}
            </p>
          </div>

          <button
            type="button"
            className="schedule-modal-close"
            aria-label="일정 상세 닫기"
            onClick={handleClose}
          >
            ×
          </button>
        </header>

        <div className="schedule-workflow-body">
          <div className="schedule-detail-grid">
            <span>시작</span>
            <strong>
              {formatDateTime(item.start)}
            </strong>

            <span>종료</span>
            <strong>
              {formatDateTime(item.end)}
            </strong>

            <span>장소</span>
            <strong>
              {item.location || '장소 미정'}
            </strong>

            {isEvent && (
              <>
                <span>신청</span>
                <strong>
                  {item.registered ?? 0}명 /{' '}
                  {item.capacity
                    ? `${item.capacity}명`
                    : '정원 제한 없음'}
                </strong>

                <span>신청 마감</span>
                <strong>
                  {formatDateTime(
                    item.deadline || item.start,
                  )}
                </strong>
              </>
            )}
          </div>

          <div className="schedule-detail-description">
            {item.description ||
              '추가 안내가 없습니다.'}
          </div>

          <div className="schedule-detail-admin-actions">
            <Button
                type="button"
                variant="secondary"
                onClick={() => onEditRequest(item)}
            >
                일정 수정
            </Button>

            <Button
                type="button"
                variant="secondary"
                style={{ color: '#214A6B' }}
                onClick={() => onDeleteRequest(item)}
            >
                일정 삭제
            </Button>
          </div>
        </div>

        <footer className="schedule-workflow-footer">
          <small>
            {isEvent
              ? '신청 후 내 활동 내역에서 확인할 수 있어요.'
              : '동아리 일정 상세 정보입니다.'}
          </small>

          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
            >
              확인
            </Button>

            {isEvent && (
                <Button
                    type="button"
                    disabled={!joined && (isClosed || isFull)}
                    onClick={() => {
                        if (!joined && (isClosed || isFull)) {
                            return
                        }

                        setJoined((prev) => !prev)
                    }}
                >
                    {joined
                        ? '참가 신청 취소'
                        : isClosed
                            ? '신청 마감'
                            : isFull
                                ? '정원 마감'
                                : '참가 신청'}
                </Button>
            )}
          </div>
        </footer>
      </div>
    </dialog>
    </>
  )
}