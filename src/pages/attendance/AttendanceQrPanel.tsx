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

export function AttendanceQrPanel({
  events,
  selectedEventId,
  selectedEvent,
  onEventChange,
  refreshText,
}: AttendanceQrPanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

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
            <div className="attendance-qr-code">
              <div className="attendance-qr-placeholder">
                QR
              </div>
            </div>

            <div className="attendance-qr-time">
              {refreshText}
            </div>
          </>
        )}
      </section>

      <AttendanceEventPicker
        open={pickerOpen}
        events={events}
        selectedEventId={selectedEventId}
        onSelect={onEventChange}
        onClose={() => setPickerOpen(false)}
      />
    </>
  )
}