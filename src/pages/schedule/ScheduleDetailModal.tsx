import { useState } from 'react'
import { Button } from '../../components/common'
import type { CalendarItem } from './scheduleMock'

type ScheduleDetailModalProps = {
  open: boolean
  item: CalendarItem | null
  isMember: boolean
  onClose: () => void
  onEditRequest: (item: CalendarItem) => void
  onDeleteRequest: (item: CalendarItem) => void
  onEarlyCloseRequest: (item: CalendarItem) => void
  onParticipantEditRequest: (
    item: CalendarItem,
  ) => void
}

function formatDateTime(value: string) {
  return value.replace('T', ' ')
}

export function ScheduleDetailModal({
  open,
  item,
  isMember,
  onClose,
  onEditRequest,
  onDeleteRequest,
  onEarlyCloseRequest,
  onParticipantEditRequest,
}: ScheduleDetailModalProps) {
  const [joined, setJoined] = useState(false)

  if (!open || !item) return null

  const isEvent = item.type === 'event'

  const deadline = item.deadline || item.start
  const isClosed =
    new Date(deadline) <= new Date()

  const isFull =
    item.capacity !== undefined &&
    (item.registered ?? 0) >= item.capacity

  return (
    <div
      className="schedule-modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="schedule-workflow-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-detail-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="schedule-detail-modal">
          <header className="schedule-modal-head">
            <div>
              <h2 id="schedule-detail-title">
                {item.title}
              </h2>

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
              onClick={onClose}
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
{!isMember && (
            <div className="schedule-detail-admin-actions">
  <Button
    type="button"
    variant="secondary"
    onClick={() =>
      onEditRequest(item)
    }
  >
    일정 수정
  </Button>

  <Button
    type="button"
    variant="secondary"
    style={{ color: '#214A6B' }}
    onClick={() =>
      onDeleteRequest(item)
    }
  >
    일정 삭제
  </Button>

  {isEvent && !isClosed && (
  <Button
    type="button"
    className="schedule-early-close-button"
    onClick={() =>
      onEarlyCloseRequest(item)
    }
  >
    일정 조기 마감
  </Button>
)}

  {isEvent && isClosed && (
  <Button
    type="button"
    className="schedule-participant-edit-button"
    onClick={() =>
      onParticipantEditRequest(item)
    }
  >
    참가자 직접 수정
  </Button>
)}

</div>
)}
          </div>

          <footer className="schedule-workflow-footer">
  <small>
    {isEvent
      ? '신청 후 내 활동 내역에서 확인할 수 있어요.'
      : '동아리 일정 상세 정보입니다.'}
  </small>

  <div>
    {/* 운영진 */}
    {!isMember && (
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          if (isEvent) {
            onParticipantEditRequest(item)
            return
          }

          onClose()
        }}
      >
        {isEvent ? '출석 현황 보기' : '확인'}
      </Button>
    )}

    {/* 일반 회원 - 일반 일정 */}
    {isMember && !isEvent && (
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
      >
        확인
      </Button>
    )}

    {/* 일반 회원 - 참가 신청 행사 */}
    {isMember && isEvent && (
      <Button
        type="button"
        disabled={
          !joined && (isClosed || isFull)
        }
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
      </div>
    </div>
  )
}