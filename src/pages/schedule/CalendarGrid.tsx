import type { CalendarItem } from './scheduleMock'

type CalendarGridProps = {
  year: number
  month: number
  items: CalendarItem[]
  onItemClick: (item: CalendarItem) => void
}

const weekDays = ['일', '월', '화', '수', '목', '금', '토']

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function CalendarGrid({
  year,
  month,
  items,
  onItemClick,
}: CalendarGridProps) {
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()

  const totalCells =
    Math.ceil((firstDay + lastDate) / 7) * 7

  const startDate = new Date(year, month, 1)
  startDate.setDate(1 - firstDay)

  const today = formatDate(new Date())

  return (
    <div className="calendar-grid">
      {weekDays.map((day) => (
        <div
          key={day}
          className="calendar-weekday"
        >
          {day}
        </div>
      ))}

      {Array.from({ length: totalCells }, (_, index) => {
        const date = new Date(startDate)

        date.setDate(startDate.getDate() + index)

        const dateKey = formatDate(date)

        const isOutside =
          date.getMonth() !== month

        const isToday =
          dateKey === today

        const dayItems = items.filter(
          (item) =>
            item.start.slice(0, 10) <= dateKey &&
            item.end.slice(0, 10) >= dateKey,
        )

        return (
          <div
            key={dateKey}
            className={`calendar-day ${
              isOutside ? 'muted' : ''
            } ${isToday ? 'today' : ''}`}
          >
            <span className="calendar-day-number">
              {date.getDate()}
            </span>

            {dayItems.map((item) => {
              const isStartDay =
                item.start.slice(0, 10) === dateKey

              const time = isStartDay
                ? item.start.slice(11, 16)
                : '진행 중'

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`calendar-event ${
                    item.type === 'event'
                      ? 'coral'
                      : item.type === 'fee'
                        ? 'fee'
                        : ''
                  }`}
                  onClick={() => {
                    if (item.type !== 'fee') {
                      onItemClick(item)
                    }
                  }}
                >
                  {item.type === 'fee'
                    ? item.title
                    : `${time} ${item.title}`}
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}