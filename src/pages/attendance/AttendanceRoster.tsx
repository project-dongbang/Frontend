import { useState } from 'react'
import type {
  AttendanceMember,
  AttendanceStatus,
} from './attendanceMock'
import type { AttendanceFilter } from './AttendancePage'
import searchIcon from '../../assets/search.svg'
import { AttendanceEditModal } from './components/AttendanceEditModal'
import { AttendanceMemberRow } from './components/AttendanceMemberRow'
import { FeedbackState } from '../../components/common/FeedbackState'

type AttendanceRosterProps = {
  eventTitle: string
  members: AttendanceMember[]
  totalCount: number
  presentCount: number
  absentCount: number
  attendanceRate: string
  filter: AttendanceFilter
  search: string
  onFilterChange: (filter: AttendanceFilter) => void
  onSearchChange: (value: string) => void
  onAttendanceUpdate: (
    memberId: string,
    status: AttendanceStatus,
    reason: string,
  ) => void
  onDownload: () => void
}

export function AttendanceRoster({
  eventTitle,
  members,
  totalCount,
  presentCount,
  absentCount,
  attendanceRate,
  filter,
  search,
  onFilterChange,
  onSearchChange,
  onAttendanceUpdate,
  onDownload,
}: AttendanceRosterProps) {
  const [editingMember, setEditingMember] =
    useState<AttendanceMember | null>(null)

  return (
    <>
      <section className="attendance-card">
        <header className="attendance-card-head">
          <div>
            <h2>참가자 출석 명단</h2>

            <p>
              {eventTitle
                ? `${eventTitle} · 참가자 ${totalCount}명`
                : '행사를 선택해 주세요.'}
            </p>
          </div>

          <button
            type="button"
            className="attendance-text-button"
            onClick={onDownload}
          >
            명단 받기
          </button>
        </header>

        <div className="attendance-tools">
          <div className="attendance-filters">
            <button
              type="button"
              aria-pressed={filter === 'present'}
              onClick={() => onFilterChange('present')}
            >
              출석 {presentCount}
            </button>

            <button
              type="button"
              aria-pressed={filter === 'absent'}
              onClick={() => onFilterChange('absent')}
            >
              미출석 {absentCount}
            </button>

            <button
              type="button"
              aria-pressed={filter === 'all'}
              onClick={() => onFilterChange('all')}
            >
              전체 {totalCount}
            </button>
          </div>

          <div className="attendance-search-wrap">
            <img
              src={searchIcon}
              className="attendance-search-icon"
              alt=""
              aria-hidden="true"
            />

            <input
              className="attendance-search"
              type="search"
              placeholder="이름 또는 학번 검색"
              value={search}
              onChange={(event) =>
                onSearchChange(event.target.value)
              }
            />
          </div>

          <p className="attendance-result">
            표시 {members.length}명 · 참가 신청자 전체{' '}
            {totalCount}명
          </p>
        </div>

        <div className="attendance-list">
          {members.length > 0 ? (
            members.map((member) => (
              <AttendanceMemberRow
                key={member.id}
                member={member}
                onEdit={setEditingMember}
              />
            ))
          ) : (
            <FeedbackState
              title={eventTitle ? totalCount ? '조건에 맞는 참가자가 없어요' : '아직 참가 신청자가 없어요' : '행사를 선택해 주세요'}
              description={eventTitle ? totalCount ? '검색어나 출석 상태를 바꿔 보세요.' : '참가자가 생기면 이곳에서 출석을 관리할 수 있어요.' : '행사를 선택하면 참가자 명단이 표시돼요.'}
              action={totalCount > 0 ? <button type="button" className="feedback-reset-button" onClick={() => { onSearchChange(''); onFilterChange('all') }}>조건 초기화</button> : undefined}
            />
          )}
        </div>

        {members.length > 0 && <p className="attendance-scroll-guide">아래로 스크롤해 참가자 명단을 확인하세요.</p>}

        <div className="attendance-summary">
          <div>
            <strong>{presentCount}</strong>
            <span>출석</span>
          </div>

          <div>
            <strong>{absentCount}</strong>
            <span>미출석</span>
          </div>

          <div>
            <strong>{attendanceRate}%</strong>
            <span>출석률</span>
          </div>
        </div>
      </section>

      <AttendanceEditModal
        key={editingMember?.id ?? 'closed'}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSave={onAttendanceUpdate}
      />
    </>
  )
}
