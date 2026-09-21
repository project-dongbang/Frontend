import { useState } from 'react'
import type {
  AttendanceMember,
  AttendanceStatus,
} from '../attendanceMock'

type AttendanceEditModalProps = {
  member: AttendanceMember | null

  onClose: () => void

  onSave: (
    memberId: string,
    status: AttendanceStatus,
    reason: string,
  ) => void
}

export function AttendanceEditModal({
  member,
  onClose,
  onSave,
}: AttendanceEditModalProps) {
  const [status, setStatus] =
  useState<AttendanceStatus>(member?.status ?? 'present')

  const [reason, setReason] = useState('')

  if (!member) {
    return null
  }

  const handleSave = () => {
    const trimmedReason = reason.trim()

    if (!trimmedReason) {
      return
    }

    onSave(
      member.id,
      status,
      trimmedReason,
    )

    onClose()
  }

  return (
    <div
      className="attendance-edit-backdrop"
      onMouseDown={onClose}
    >
      <section
        className="attendance-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-label="출석 상태 수정"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="attendance-edit-head">
          <div>
            <div className="attendance-edit-eyebrow">
              DONG BANG
            </div>

            <h2>출석 상태 수정</h2>
          </div>

          <button
            type="button"
            className="attendance-edit-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="attendance-edit-body">
          <div className="attendance-edit-member">
            {member.name} · {member.studentId}
          </div>

          <label className="attendance-edit-field">
            <span>출석 상태</span>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as AttendanceStatus,
                )
              }
            >
              <option value="present">출석</option>
              <option value="absent">미출석</option>
            </select>
          </label>

          <label className="attendance-edit-field">
            <span>수정 사유</span>

            <input
              type="text"
              maxLength={200}
              placeholder="예: 현장 출석 확인"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
            />
          </label>

          <button
            type="button"
            className="attendance-edit-save"
            disabled={!reason.trim()}
            onClick={handleSave}
          >
            저장하기
          </button>
        </div>
      </section>
    </div>
  )
}