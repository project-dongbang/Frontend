import type { AttendanceMember } from '../attendanceMock'

type AttendanceMemberRowProps = {
  member: AttendanceMember
  onEdit: (member: AttendanceMember) => void
}

export function AttendanceMemberRow({
  member,
  onEdit,
}: AttendanceMemberRowProps) {
  return (
    <div className="attendance-member-row">
      <div className="attendance-avatar">
        {member.name.slice(0, 1)}
      </div>

      <div className="attendance-member-copy">
        <div className="attendance-member-line">
          <strong>{member.name}</strong>
          <span>{member.studentId}</span>
        </div>

        <small>
          {member.status === 'present'
            ? `체크인 ${member.checkedAt}`
            : '체크인 기록 없음'}
        </small>
      </div>

      <span
        className={`attendance-status ${
          member.status === 'absent'
            ? 'is-absent'
            : ''
        }`}
      >
        {member.status === 'present'
          ? '출석'
          : '미출석'}
      </span>

      <button
        type="button"
        className="attendance-text-button"
        onClick={() => onEdit(member)}
        aria-label={`${member.name} 출석 수정`}
      >
        수정
      </button>
    </div>
  )
}