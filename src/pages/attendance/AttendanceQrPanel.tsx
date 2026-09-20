import { useState } from 'react'
import type { AttendanceEvent } from './attendanceMock'
import { AttendanceEventPicker } from './components/AttendanceEventPicker'

type AttendanceQrPanelProps = {
  events: AttendanceEvent[]
  selectedEventId: string
  selectedEvent?: AttendanceEvent
  onEventChange: (eventId: string) => void
  refreshText: string
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
}: AttendanceQrPanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const [sessionStatus, setSessionStatus] =
    useState<AttendanceSessionStatus>('ready')

  const handleEventChange = (eventId: string) => {
    onEventChange(eventId)

    // 다른 행사 선택 시 출석 세션 초기화
    setSessionStatus('ready')
  }

  const handleStartAttendance = () => {
    if (!selectedEvent) return

    // TODO: 출석 시작 API 연결
    setSessionStatus('active')
  }

  const handleEndAttendance = () => {
    if (!selectedEvent) return

    // TODO: 출석 종료 API 연결
    setSessionStatus('ended')
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

        <p>QR 코드를 스캔해 출석을 인증하세요.</p>

        {selectedEvent && (
          <>
            <div
              className={`attendance-qr-code ${
                !isActive ? 'is-disabled' : ''
              }`}
            >
              <div className="attendance-qr-placeholder">
                {isActive ? 'QR' : ''}
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