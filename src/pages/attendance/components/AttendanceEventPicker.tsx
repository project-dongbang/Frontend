import { useMemo, useState } from 'react'
import type { AttendanceEvent } from '../attendanceMock'
import { FeedbackState } from '../../../components/common/FeedbackState'

type AttendanceEventPickerProps = {
  open: boolean
  events: AttendanceEvent[]
  selectedEventId: string
  onSelect: (eventId: string) => void
  onClose: () => void
}

const EVENTS_PER_PAGE = 4

export function AttendanceEventPicker({
  open,
  events,
  selectedEventId,
  onSelect,
  onClose,
}: AttendanceEventPickerProps) {
  const [query, setQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [latestOnly, setLatestOnly] = useState(false)
  const [page, setPage] = useState(0)

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    let result = events.filter((event) => {
      const matchesQuery =
        !normalizedQuery ||
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.location.toLowerCase().includes(normalizedQuery)

      const eventDate = event.start.slice(0, 10)

      const matchesStart =
        !startDate || eventDate >= startDate

      const matchesEnd =
        !endDate || eventDate <= endDate

      return matchesQuery && matchesStart && matchesEnd
    })

    if (latestOnly) {
      result = [...result].sort(
        (a, b) =>
          new Date(b.start).getTime() -
          new Date(a.start).getTime(),
      )
    }

    return result
  }, [
    events,
    query,
    startDate,
    endDate,
    latestOnly,
  ])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / EVENTS_PER_PAGE),
  )

  const currentPage = Math.min(page, totalPages - 1)

  const visibleEvents = filteredEvents.slice(
    currentPage * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE + EVENTS_PER_PAGE,
  )

  const resetPage = () => {
    setPage(0)
  }

  const handleSelect = (eventId: string) => {
    onSelect(eventId)
    onClose()
  }

  if (!open) {
    return null
  }

  return (
    <div
      className="attendance-picker-backdrop"
      onMouseDown={onClose}
    >
      <section
        className="attendance-picker-modal"
        role="dialog"
        aria-modal="true"
        aria-label="출석 행사 선택"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="attendance-picker-head">
          <div>
            <div className="attendance-picker-eyebrow">
              DONG BANG
            </div>

            <h2>출석 행사 선택</h2>
          </div>

          <button
            type="button"
            className="attendance-picker-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="attendance-picker-body">
          <input
            type="search"
            className="attendance-picker-search"
            placeholder="행사명으로 검색하세요"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              resetPage()
            }}
          />

          <div className="attendance-picker-dates">
            <label>
              <span>시작일</span>

              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value)
                  resetPage()
                }}
              />
            </label>

            <label>
              <span>종료일</span>

              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value)
                  resetPage()
                }}
              />
            </label>
          </div>

          <div className="attendance-picker-sort">
            <button
              type="button"
              aria-pressed={!latestOnly}
              onClick={() => {
                setLatestOnly(false)
                resetPage()
              }}
            >
              전체
            </button>

            <button
              type="button"
              aria-pressed={latestOnly}
              onClick={() => {
                setLatestOnly(true)
                resetPage()
              }}
            >
              최신순
            </button>
          </div>

          <div className="attendance-picker-list">
            {visibleEvents.length > 0 ? (
              visibleEvents.map((event) => (
                <button
                  type="button"
                  key={event.id}
                  className={`attendance-picker-row ${
                    event.id === selectedEventId
                      ? 'is-selected'
                      : ''
                  }`}
                  onClick={() => handleSelect(event.id)}
                >
                  <strong>{event.title}</strong>

                  <small>
                    {event.start.replace('T', ' ')} ·{' '}
                    {event.location}
                  </small>
                </button>
              ))
            ) : (
              <FeedbackState
                title={events.length ? '검색 결과가 없어요' : '아직 출석할 행사가 없어요'}
                description={events.length
                  ? '검색어나 날짜를 바꿔 보세요. 조건을 초기화하면 모든 행사를 볼 수 있어요.'
                  : '행사가 등록되면 여기에서 선택할 수 있어요.'}
                action={events.length ? <button type="button" className="feedback-reset-button" onClick={() => {
                  setQuery('')
                  setStartDate('')
                  setEndDate('')
                  setLatestOnly(false)
                  resetPage()
                }}>조건 초기화</button> : undefined}
              />
            )}
          </div>

          {filteredEvents.length > 0 && <div className="attendance-picker-pagination">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() =>
                setPage((current) =>
                  Math.max(0, current - 1),
                )
              }
            >
              이전
            </button>

            <span>
              {currentPage + 1} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages - 1, current + 1),
                )
              }
            >
              다음
            </button>
          </div>}
        </div>
      </section>
    </div>
  )
}
