import { useMemo, useState } from 'react'
import type { CalendarItem } from './scheduleMock'

type ParticipantStatus =
  | 'ADDED'
  | 'KEPT'
  | 'EXCLUDED'

type Participant = {
  id: number
  name: string
  studentNumber: string
  department: string
  status: ParticipantStatus
}

type ScheduleParticipantEditModalProps = {
  open: boolean
  item: CalendarItem | null
  onClose: () => void
}

const mockParticipants: Participant[] = [
  {
    id: 1,
    name: '박서윤',
    studentNumber: '20241234',
    department: '시각디자인학과',
    status: 'ADDED',
  },
  {
    id: 2,
    name: '김도윤',
    studentNumber: '20240117',
    department: '컴퓨터정보공학부',
    status: 'ADDED',
  },
  {
    id: 3,
    name: '최민준',
    studentNumber: '20231108',
    department: '컴퓨터공학과',
    status: 'KEPT',
  },
  {
    id: 4,
    name: '서유진',
    studentNumber: '20230821',
    department: '경영학과',
    status: 'EXCLUDED',
  },
  {
    id: 5,
    name: '정하린',
    studentNumber: '20251002',
    department: '경영학과',
    status: 'EXCLUDED',
  },
  {
    id: 6,
    name: '이준혁',
    studentNumber: '20221507',
    department: '소프트웨어학과',
    status: 'KEPT',
  },
]

export function ScheduleParticipantEditModal({
  open,
  item,
  onClose,
}: ScheduleParticipantEditModalProps) {
  const [participants, setParticipants] =
    useState(mockParticipants)

  const [search, setSearch] = useState('')

  const filteredParticipants = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) {
      return participants
    }

    return participants.filter((participant) => {
      return (
        participant.name
          .toLowerCase()
          .includes(keyword) ||
        participant.studentNumber.includes(keyword)
      )
    })
  }, [participants, search])

  if (!open || !item) return null

  const addedCount = participants.filter(
    (participant) =>
      participant.status === 'ADDED',
  ).length

  const excludedCount = participants.filter(
    (participant) =>
      participant.status === 'EXCLUDED',
  ).length

  const currentCount =
    participants.length - excludedCount

  const handleStatusChange = (
    id: number,
    status: ParticipantStatus,
  ) => {
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === id
          ? {
              ...participant,
              status,
            }
          : participant,
      ),
    )
  }

  const handleSave = () => {
    // TODO: 참가자 직접 수정 API 연결
    onClose()
  }

  return (
    <div
      className="schedule-modal-backdrop nested"
      onMouseDown={onClose}
    >
      <div
        className="schedule-participant-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="participant-edit-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="schedule-participant-content">
          <div className="schedule-participant-head">
            <span className="schedule-participant-label">
              참가자 관리
            </span>

            <h2 id="participant-edit-title">
              참가자 직접 수정
            </h2>

            <p>
              오른쪽 상태 버튼을 눌러 각 회원의
              참가 상태를 추가 · 유지 · 제외로
              전환하세요.
            </p>
          </div>

          <input
            type="text"
            className="schedule-participant-search"
            placeholder="이름 또는 학번으로 검색"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <div className="schedule-participant-list">
            {filteredParticipants.map(
              (participant) => (
                <div
                  key={participant.id}
                  className={`schedule-participant-card ${
                    participant.status ===
                    'EXCLUDED'
                      ? 'excluded'
                      : participant.status ===
                          'ADDED'
                        ? 'added'
                        : ''
                  }`}
                >
                  <div className="schedule-participant-info">
                    <strong>
                      {participant.name}
                    </strong>

                    <span>
                      {participant.studentNumber}
                      {' · '}
                      {participant.department}
                    </span>
                  </div>

                  {participant.status ===
                    'ADDED' && (
                    <button
                      type="button"
                      className="schedule-participant-state added"
                      onClick={() =>
                        handleStatusChange(
                          participant.id,
                          'KEPT',
                        )
                      }
                    >
                      ＋ 추가
                    </button>
                  )}

                  {participant.status ===
                    'KEPT' && (
                    <button
                      type="button"
                      className="schedule-participant-state kept"
                      onClick={() =>
                        handleStatusChange(
                          participant.id,
                          'EXCLUDED',
                        )
                      }
                    >
                      ✓ 유지
                    </button>
                  )}

                  {participant.status ===
                    'EXCLUDED' && (
                    <button
                      type="button"
                      className="schedule-participant-state excluded"
                      onClick={() =>
                        handleStatusChange(
                          participant.id,
                          'ADDED',
                        )
                      }
                    >
                      − 제외
                    </button>
                  )}
                </div>
              ),
            )}
          </div>

          <div className="schedule-participant-summary">
            현재 {currentCount} / 40명
            <span> · </span>
            추가 {addedCount}명
            <span> · </span>
            제외 {excludedCount}명
            <span> → </span>
            변경 후 {currentCount}명
          </div>
        </div>

        <div className="schedule-participant-footer">
          <button
            type="button"
            className="schedule-participant-cancel"
            onClick={onClose}
          >
            취소
          </button>

          <button
            type="button"
            className="schedule-participant-save"
            onClick={handleSave}
          >
            변경사항 저장
          </button>
        </div>
      </div>
    </div>
  )
}