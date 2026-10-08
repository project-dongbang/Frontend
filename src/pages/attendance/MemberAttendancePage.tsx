import { DashboardShell } from '../dashboard/DashboardShell'
import {
  memberAttendanceItems,
  memberAttendanceStatusLabel,
} from './attendanceMock'
import './attendance.css'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '../../routes/paths'
import { useEffect, useState, type FormEvent } from 'react'
import { attendanceApi } from '../../api/services'
import { useSession } from '../../context/SessionContext'
import { errorMessage } from '../../api/client'
import type { MemberAttendanceItem } from './attendanceMock'

export function MemberAttendancePage() {
    const navigate = useNavigate()
  const { activeOrganization } = useSession()
  const [items, setItems] = useState<MemberAttendanceItem[]>(memberAttendanceItems)
  const [requestError, setRequestError] = useState('')
  const [checkInEventId, setCheckInEventId] = useState('')
  const [qrToken, setQrToken] = useState('')
  const [checkingIn, setCheckingIn] = useState(false)
  useEffect(() => {
    if (!activeOrganization) return
    attendanceApi.mine(activeOrganization.organizationId).then((raw) => {
      const result = raw as { records?: Array<Record<string, unknown>> }
      const nextItems = (result.records ?? []).map((item) => ({ id: Number(item.eventId), title: String(item.title), date: new Date(String(item.startsAt)).toLocaleString('ko-KR'), status: item.displayStatus === 'WAITING' ? 'scheduled' as const : item.status === 'PRESENT' ? 'present' as const : 'absent' as const, checkInTime: item.checkedInAt ? new Date(String(item.checkedInAt)).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-' }))
      setItems(nextItems)
      if (nextItems[0]) setCheckInEventId((current) => current || String(nextItems[0].id))
    }).catch((error) => setRequestError(errorMessage(error)))
  }, [activeOrganization])
  const submitCheckIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeOrganization || !checkInEventId || !qrToken.trim()) return
    try {
      setCheckingIn(true)
      await attendanceApi.checkIn(activeOrganization.organizationId, checkInEventId, qrToken.trim())
      setItems((current) => current.map((item) => String(item.id) === checkInEventId ? { ...item, status: 'present', checkInTime: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) } : item))
      setQrToken('')
      setRequestError('출석이 확인되었습니다.')
    } catch (error) { setRequestError(errorMessage(error)) }
    finally { setCheckingIn(false) }
  }
  return (
    <DashboardShell role="member">
      <section className="member-attendance-page">
        <header className="member-attendance-head">
          <div className="attendance-eyebrow">
            LIVE ATTENDANCE
          </div>

          <h1>내 출석</h1>

          <p>
            행사별 참가자의 출석 상태를 확인하고 관리해요.
          </p>
        </header>

        <section className="member-attendance-card">
          {requestError && <p role="alert">{requestError}</p>}
          <form className="member-checkin-form" onSubmit={(event) => void submitCheckIn(event)}>
            <label>출석할 행사<select value={checkInEventId} onChange={(event) => setCheckInEventId(event.target.value)} required><option value="" disabled>행사를 선택하세요</option>{items.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <label>운영진의 체크인 코드<input value={qrToken} onChange={(event) => setQrToken(event.target.value)} placeholder="QR 코드의 체크인 코드를 입력하세요" required /></label>
            <button type="submit" disabled={checkingIn || !items.length}>{checkingIn ? '확인 중…' : '출석 확인'}</button>
          </form>
          <div className="member-attendance-card-head">
            <div>
              <h2>나의 행사 출석</h2>

              <p>출석 {items.filter((item) => item.status === 'present').length}회 · 결석 {items.filter((item) => item.status === 'absent').length}회 · 예정 {items.filter((item) => item.status === 'scheduled').length}회</p>
            </div>

            <button
                type="button"
                className="member-attendance-find"
                onClick={() => navigate(`${PATHS.calendar}?role=member`)}
            >
                행사 찾아보기 →
            </button>
          </div>

          <div className="member-attendance-table-wrap">
            <table className="member-attendance-table">
              <thead>
                <tr>
                  <th>행사명</th>
                  <th>행사 일시</th>
                  <th>출석 상태</th>
                  <th>체크인 시각</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="member-attendance-title">
                      {item.title}
                    </td>

                    <td>{item.date}</td>

                    <td>
                      <span
                        className={`member-attendance-status ${item.status}`}
                      >
                        {memberAttendanceStatusLabel[item.status]}
                      </span>
                    </td>

                    <td>{item.checkInTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="member-attendance-guide">
            행사장에서 운영진이 안내하는 QR로 출석해 주세요.
            출석 기록에 문제가 있다면 운영진에게 문의하세요.
          </div>
        </section>
      </section>
    </DashboardShell>
  )
}
