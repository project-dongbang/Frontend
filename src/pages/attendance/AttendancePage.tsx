import { useMemo, useState } from 'react'
import { DashboardShell } from '../dashboard/DashboardShell'
import { AttendanceQrPanel } from './AttendanceQrPanel'
import { AttendanceRoster } from './AttendanceRoster'
import {
  attendanceEvents,
  attendanceMembers,
} from './attendanceMock'
import type { AttendanceStatus } from './attendanceMock'
import './attendance.css'

export type AttendanceFilter = AttendanceStatus | 'all'

export function AttendancePage() {
  const [selectedEventId, setSelectedEventId] = useState(
    attendanceEvents[0]?.id ?? '',
  )
  const [filter, setFilter] =
    useState<AttendanceFilter>('present')
  const [search, setSearch] = useState('')
  const [refreshText, setRefreshText] =
    useState('행사 출석 체크인')

  const selectedEvent = attendanceEvents.find(
    (event) => event.id === selectedEventId,
  )

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return attendanceMembers.filter((member) => {
      const matchesFilter =
        filter === 'all' || member.status === filter

      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.studentId.includes(query)

      return matchesFilter && matchesSearch
    })
  }, [filter, search])

  const presentCount = attendanceMembers.filter(
    (member) => member.status === 'present',
  ).length

  const absentCount =
    attendanceMembers.length - presentCount

  const attendanceRate = attendanceMembers.length
    ? ((presentCount / attendanceMembers.length) * 100).toFixed(1)
    : '0.0'
    const handleAttendanceUpdate = (
  memberId: string,
  status: AttendanceStatus,
  reason: string,
) => {
  // TODO: 출석 수정 API 연결
  console.log('출석 수정 요청', {
    eventId: selectedEventId,
    memberId,
    status,
    reason,
  })
}

const handleDownload = () => {
  // TODO: 출석 명단 다운로드 API 연결
  console.log('명단 다운로드 요청', {
    eventId: selectedEventId,
  })
}

  const handleRefresh = () => {
    const now = new Date().toLocaleTimeString('ko-KR')

    setRefreshText(`최근 갱신 ${now}`)
  }

  return (
    <DashboardShell role="admin">
      <section className="attendance-page">
        <header className="attendance-page-head">
          <div>
            <div className="attendance-eyebrow">
              ATTENDANCE
            </div>

            <h1>출석 관리</h1>

            <p>
              행사별 참가자의 출석 상태를 확인하고 관리해요.
            </p>
          </div>

          <button
            type="button"
            className="attendance-refresh-button"
            onClick={handleRefresh}
          >
            새로고침
          </button>
        </header>

        <div className="attendance-layout">
          <AttendanceQrPanel
            events={attendanceEvents}
            selectedEventId={selectedEventId}
            selectedEvent={selectedEvent}
            onEventChange={setSelectedEventId}
            refreshText={refreshText}
          />

          <AttendanceRoster
             eventTitle={selectedEvent?.title ?? ''}
  members={filteredMembers}
  totalCount={attendanceMembers.length}
  presentCount={presentCount}
  absentCount={absentCount}
  attendanceRate={attendanceRate}
  filter={filter}
  search={search}
  onFilterChange={setFilter}
  onSearchChange={setSearch}
  onAttendanceUpdate={handleAttendanceUpdate}
  onDownload={handleDownload}
          />
        </div>
      </section>
    </DashboardShell>
  )
}