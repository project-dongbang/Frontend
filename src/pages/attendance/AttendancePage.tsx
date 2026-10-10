import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MemberAttendancePage } from './MemberAttendancePage'
import { DashboardShell } from '../dashboard/DashboardShell'
import { AttendanceQrPanel } from './AttendanceQrPanel'
import { AttendanceRoster } from './AttendanceRoster'
import type { AttendanceEvent, AttendanceMember, AttendanceStatus } from './attendanceMock'
import './attendance.css'
import { attendanceApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'

export type AttendanceFilter = AttendanceStatus | 'all'

export function AttendancePage() {
  const [searchParams] = useSearchParams()
  const { activeOrganization } = useSession()
  const [selectedEventId, setSelectedEventId] = useState(() => searchParams.get('eventId') ?? '')
  const [filter, setFilter] =
    useState<AttendanceFilter>('all')
  const [search, setSearch] = useState('')
  const [refreshText, setRefreshText] =
    useState('행사 출석 체크인')
  const [events, setEvents] = useState<AttendanceEvent[]>([])
  const [eventsOrganizationId, setEventsOrganizationId] = useState<number | null>(null)
  const [members, setMembers] = useState<AttendanceMember[]>([])
  const [membersOrganizationId, setMembersOrganizationId] = useState<number | null>(null)
  const [requestError, setRequestError] = useState('')
  const currentEvents = useMemo(() => activeOrganization && eventsOrganizationId !== activeOrganization.organizationId ? [] : events, [activeOrganization, eventsOrganizationId, events])
  const currentMembers = useMemo(() => activeOrganization && membersOrganizationId !== activeOrganization.organizationId ? [] : members, [activeOrganization, membersOrganizationId, members])

  useEffect(() => {
    if (!activeOrganization) return
    const organizationId = activeOrganization.organizationId
    let cancelled = false
    attendanceApi.events(organizationId).then((raw) => {
      if (cancelled) return
      const result = raw as { events?: Array<Record<string, unknown>> }
      const mapped = (result.events ?? []).map((event) => ({ id: String(event.eventId), title: String(event.title), start: String(event.startsAt), location: String(event.location ?? ''), sessionStatus: event.attendanceSessionStatus as AttendanceEvent['sessionStatus'] }))
      setEvents(mapped)
      setEventsOrganizationId(organizationId)
      setSelectedEventId((current) => current && mapped.some((event) => event.id === current) ? current : mapped[0]?.id ?? '')
    }).catch((error) => {
      if (cancelled) return
      setEvents([])
      setEventsOrganizationId(organizationId)
      setRequestError(errorMessage(error))
    })
    return () => { cancelled = true }
  }, [activeOrganization])

  useEffect(() => {
    if (!activeOrganization || !selectedEventId || eventsOrganizationId !== activeOrganization.organizationId) return
    const organizationId = activeOrganization.organizationId
    let cancelled = false
    attendanceApi.status(organizationId, selectedEventId).then((raw) => {
      if (cancelled) return
      const result = raw as { records?: Array<Record<string, unknown>>; session?: { status?: AttendanceEvent['sessionStatus']; qrToken?: string } }
      setMembers((result.records ?? []).map((member) => ({ id: String(member.attendanceId), name: String(member.memberName), studentId: String(member.studentNumber), generation: '-', status: member.status === 'PRESENT' ? 'present' : 'absent', checkedAt: member.checkedInAt ? new Date(String(member.checkedInAt)).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : null, version: Number(member.version ?? 0) })))
      setMembersOrganizationId(organizationId)
      setEvents((current) => current.map((event) => event.id === selectedEventId ? { ...event, sessionStatus: result.session?.status ?? event.sessionStatus, qrToken: result.session?.qrToken } : event))
      setRequestError('')
    }).catch((error) => {
      if (cancelled) return
      setMembers([])
      setMembersOrganizationId(organizationId)
      setRequestError(errorMessage(error))
    })
    return () => { cancelled = true }
  }, [activeOrganization, eventsOrganizationId, selectedEventId])

  const selectedEvent = currentEvents.find(
    (event) => event.id === selectedEventId,
  )

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return currentMembers.filter((member) => {
      const matchesFilter =
        filter === 'all' || member.status === filter

      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.studentId.includes(query)

      return matchesFilter && matchesSearch
    })
  }, [filter, search, currentMembers])

  const presentCount = currentMembers.filter(
    (member) => member.status === 'present',
  ).length

  const absentCount =
    currentMembers.length - presentCount

  const attendanceRate = currentMembers.length
    ? ((presentCount / currentMembers.length) * 100).toFixed(1)
    : '0.0'
    const handleAttendanceUpdate = (
  memberId: string,
  status: AttendanceStatus,
  reason: string,
) => {
  if (!activeOrganization) return
  const member = members.find((item) => item.id === memberId)
  void attendanceApi.update(activeOrganization.organizationId, selectedEventId, memberId, { status: status.toUpperCase(), reason, version: member?.version })
    .then(() => setMembers((current) => current.map((item) => item.id === memberId ? { ...item, status } : item)))
    .catch((error) => setRequestError(errorMessage(error)))
}

const handleDownload = () => {
  if (!currentMembers.length) { setRequestError('내보낼 출석 기록이 없습니다.'); return }
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`
  const rows = [
    ['행사명', '이름', '학번', '출석 상태', '체크인 시각'],
    ...currentMembers.map((member) => [selectedEvent?.title ?? '', member.name, member.studentId, member.status === 'present' ? '출석' : '미출석', member.checkedAt ?? '']),
  ]
  const csv = `\uFEFF${rows.map((row) => row.map((value) => quote(String(value))).join(',')).join('\r\n')}`
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `DongBang-출석-${selectedEventId}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

  const handleRefresh = () => {
    const now = new Date().toLocaleTimeString('ko-KR')

    setRefreshText(`최근 갱신 ${now}`)
    if (activeOrganization && selectedEventId) {
      void Promise.all([
        attendanceApi.events(activeOrganization.organizationId),
        attendanceApi.status(activeOrganization.organizationId, selectedEventId),
      ]).then(([eventsRaw, statusRaw]) => {
        const eventsResult = eventsRaw as { events?: Array<Record<string, unknown>> }
        const statusResult = statusRaw as { records?: Array<Record<string, unknown>>; session?: { status?: AttendanceEvent['sessionStatus']; qrToken?: string } }
        const mappedEvents = (eventsResult.events ?? []).map((event) => ({ id: String(event.eventId), title: String(event.title), start: String(event.startsAt), location: String(event.location ?? ''), sessionStatus: event.attendanceSessionStatus as AttendanceEvent['sessionStatus'] }))
        setEvents(mappedEvents.map((event) => event.id === selectedEventId ? { ...event, sessionStatus: statusResult.session?.status ?? event.sessionStatus, qrToken: statusResult.session?.qrToken } : event))
        setMembers((statusResult.records ?? []).map((member) => ({ id: String(member.attendanceId), name: String(member.memberName), studentId: String(member.studentNumber), generation: '-', status: member.status === 'PRESENT' ? 'present' : 'absent', checkedAt: member.checkedInAt ? new Date(String(member.checkedInAt)).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : null, version: Number(member.version ?? 0) })))
        setEventsOrganizationId(activeOrganization.organizationId)
        setMembersOrganizationId(activeOrganization.organizationId)
        setRequestError('')
      }).catch((error) => setRequestError(errorMessage(error)))
    }
  }
  if (activeOrganization?.myRole === 'MEMBER') {
  return <MemberAttendancePage />
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
            className="page-header-action attendance-refresh-button"
            onClick={handleRefresh}
          >
            새로고침
          </button>
        </header>

        {requestError && <p role="alert">{requestError}</p>}
        <div className="attendance-layout">
          <AttendanceQrPanel
            key={selectedEventId}
            organizationId={activeOrganization?.organizationId ?? null}
            events={currentEvents}
            selectedEventId={selectedEventId}
            selectedEvent={selectedEvent}
            onEventChange={setSelectedEventId}
            refreshText={refreshText}
            onStart={async (eventId) => {
              if (!activeOrganization) throw new Error('동아리를 먼저 선택해 주세요.')
              const response = await attendanceApi.start(activeOrganization.organizationId, eventId)
              setEvents((current) => current.map((event) => event.id === eventId ? { ...event, sessionStatus: 'ACTIVE', qrToken: response.session.qrToken } : event))
              return response
            }}
            onEnd={async (eventId) => { if (activeOrganization) await attendanceApi.close(activeOrganization.organizationId, eventId) }}
          />

          <AttendanceRoster
             eventTitle={selectedEvent?.title ?? ''}
  members={filteredMembers}
  totalCount={currentMembers.length}
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
