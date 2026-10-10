import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, errorMessage } from '../../api/client'
import { attendanceApi } from '../../api/services'
import { useSession } from '../../context/SessionContext'
import { clearAuthReturnPath, saveAuthReturnPath } from '../../routes/authReturn'
import { PATHS } from '../../routes/paths'
import { checkInPath, parseCheckInParams } from './checkInLink'
import './attendance.css'

type CheckInState = { key: string; kind: 'pending' | 'success' | 'already' | 'error'; message: string }

export function AttendanceCheckInPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading } = useSession()
  const [state, setState] = useState<CheckInState>({ key: '', kind: 'pending', message: '출석 정보를 확인하고 있어요…' })
  const attempted = useRef('')
  const organizationId = params.get('organizationId')
  const eventId = params.get('eventId')
  const qrToken = params.get('qrToken')
  const parsed = useMemo(() => parseCheckInParams(new URLSearchParams({ organizationId: organizationId ?? '', eventId: eventId ?? '', qrToken: qrToken ?? '' })), [organizationId, eventId, qrToken])
  const path = parsed ? checkInPath(parsed.organizationId, parsed.eventId, parsed.qrToken) : ''

  useEffect(() => {
    if (!parsed) return
    if (loading) return
    if (!user || user.onboardingRequired) {
      saveAuthReturnPath(path)
      navigate(user ? PATHS.signup : PATHS.login, { replace: true })
      return
    }
    if (attempted.current === path) return
    attempted.current = path
    void attendanceApi.checkIn(parsed.organizationId, parsed.eventId, parsed.qrToken)
      .then(() => {
        clearAuthReturnPath()
        setState({ key: path, kind: 'success', message: '출석이 완료됐어요.' })
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          attempted.current = ''
          saveAuthReturnPath(path)
          navigate(PATHS.login, { replace: true })
          return
        }
        clearAuthReturnPath()
        if (error instanceof ApiError && error.code === 'ATT_409_004') {
          setState({ key: path, kind: 'already', message: '이미 출석했어요.' })
        } else {
          setState({ key: path, kind: 'error', message: errorMessage(error) })
        }
      })
  }, [loading, navigate, parsed, path, user])

  const result = parsed ? state.key === path ? state : { kind: 'pending', message: '출석 정보를 확인하고 있어요…' } : { kind: 'error', message: 'QR 코드 정보를 확인할 수 없어요. 운영진에게 새 QR 코드를 요청해 주세요.' }
  return (
    <main className="attendance-checkin-page">
      <section className="attendance-checkin-card">
        <span className="attendance-eyebrow">ATTENDANCE</span>
        <h1>{result.kind === 'success' ? '출석 완료' : result.kind === 'already' ? '출석 확인' : 'QR 출석'}</h1>
        <p role={result.kind === 'error' ? 'alert' : 'status'}>{result.message}</p>
        {result.kind !== 'pending' && <Link to={PATHS.attendance}>출석 화면으로 이동</Link>}
      </section>
    </main>
  )
}
