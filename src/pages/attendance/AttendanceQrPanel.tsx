import { useState } from 'react'
import type { AttendanceEvent } from './attendanceMock'
import { AttendanceEventPicker } from './components/AttendanceEventPicker'
import { errorMessage } from '../../api/client'

type AttendanceQrPanelProps = {
  events: AttendanceEvent[]
  selectedEventId: string
  selectedEvent?: AttendanceEvent
  onEventChange: (eventId: string) => void
  refreshText: string
  onStart?: (eventId: string) => Promise<{ session: { qrToken: string; expiresAt: string } }>
  onEnd?: (eventId: string) => Promise<void>
}

type AttendanceSessionStatus =
  | 'ready'
  | 'active'
  | 'ended'

export function AttendanceQrPanel({
  events,
  selectedEventId,
  selectedEvent,
  onEventChange,
  refreshText,
  onStart,
  onEnd,
}: AttendanceQrPanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const [localSessionStatus, setLocalSessionStatus] = useState<AttendanceSessionStatus | null>(null)
  const [localQrToken, setLocalQrToken] = useState('')
  const [requestError, setRequestError] = useState('')
  const [copied, setCopied] = useState(false)

  const apiSessionStatus: AttendanceSessionStatus = selectedEvent?.sessionStatus === 'ACTIVE'
    ? 'active'
    : selectedEvent?.sessionStatus === 'CLOSED' || selectedEvent?.sessionStatus === 'EXPIRED' ? 'ended' : 'ready'
  const sessionStatus = localSessionStatus ?? apiSessionStatus
  const qrToken = localQrToken || selectedEvent?.qrToken || ''

  const handleEventChange = (eventId: string) => {
    onEventChange(eventId)

    // 다른 행사 선택 시 출석 세션 초기화
    setLocalSessionStatus(null)
    setLocalQrToken('')
  }

  const handleStartAttendance = async () => {
    if (!selectedEvent) return
    try {
      const result = await onStart?.(selectedEvent.id)
      if (result?.session.qrToken) {
        setLocalQrToken(result.session.qrToken)
        setLocalSessionStatus('active')
        setRequestError('')
      }
    } catch (error) { setRequestError(errorMessage(error)) }
  }

  const handleEndAttendance = async () => {
    if (!selectedEvent) return
    try {
      await onEnd?.(selectedEvent.id)
      setLocalSessionStatus('ended')
      setLocalQrToken('')
      setRequestError('')
    } catch (error) { setRequestError(errorMessage(error)) }
  }

  const copyQrToken = async () => {
    try {
      await navigator.clipboard.writeText(qrToken)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch { setRequestError('체크인 코드를 복사하지 못했습니다.') }
  }

  const isActive = sessionStatus === 'active'
  const isEnded = sessionStatus === 'ended'

  return (
    <>
      <section className="attendance-card attendance-qr-panel">
        <button
          type="button"
          className="attendance-event-picker-trigger"
          onClick={() => setPickerOpen(true)}
        >
          <span>
            {selectedEvent
              ? `전체 행사 · ${selectedEvent.title}`
              : '행사를 선택하세요'}
          </span>

          <span aria-hidden="true">⌄</span>
        </button>

        <h2>
          {selectedEvent
            ? `${selectedEvent.title} 체크인`
            : '행사를 먼저 만들어 주세요'}
        </h2>

        <p>출석 시작 후 표시되는 체크인 코드를 회원 화면에 입력해 출석을 인증하세요.</p>

        {selectedEvent && (
          <>
            <div
              className={`attendance-qr-code ${
                !isActive ? 'is-disabled' : ''
              }`}
            >
              <div className="attendance-qr-placeholder">
                {isActive && <div className="attendance-checkin-token"><span>체크인 코드</span><code>{qrToken}</code><button type="button" onClick={() => void copyQrToken()}>{copied ? '복사 완료' : '코드 복사'}</button></div>}
              </div>

              {!isActive && (
                <div className="attendance-qr-overlay">
                  {isEnded
                    ? '출석이 종료되었습니다.'
                    : '출석을 시작하면 QR이 활성화됩니다.'}
                </div>
              )}
            </div>

            <div className="attendance-qr-time">
              {isActive
                ? refreshText
                : isEnded
                  ? '출석 종료'
                  : '출석 시작 전'}
            </div>

            <div className="attendance-session-control">
              <div className="attendance-session-head">
                <strong>
                  {isActive
                    ? '출석 진행 중'
                    : isEnded
                      ? '출석 종료'
                      : '출석 시작 전'}
                </strong>

                <span>
                  {isActive
                    ? 'QR 체크인이 활성화되어 있어요.'
                    : isEnded
                      ? 'QR 체크인이 종료되었어요.'
                      : '출석 시작 버튼을 눌러 QR을 활성화하세요.'}
                </span>
              </div>

              <div className="attendance-session-buttons">
                <button
                  type="button"
                  className="attendance-session-start"
                  disabled={isActive || isEnded}
                  onClick={handleStartAttendance}
                >
                  출석 시작
                </button>

                <button
                  type="button"
                  className="attendance-session-end"
                  disabled={!isActive}
                  onClick={handleEndAttendance}
                >
                  출석 종료
                </button>
              </div>
            </div>
          </>
        )}
        {requestError && <p role="alert">{requestError}</p>}
      </section>

      <AttendanceEventPicker
        open={pickerOpen}
        events={events}
        selectedEventId={selectedEventId}
        onSelect={handleEventChange}
        onClose={() => setPickerOpen(false)}
      />
    </>
  )
}
