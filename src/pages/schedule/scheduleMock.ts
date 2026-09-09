export type CalendarItemType = 'schedule' | 'event' | 'fee'

export type CalendarItem = {
  id: string
  title: string
  start: string
  end: string
  type: CalendarItemType
}

export const calendarMockData: CalendarItem[] = [
  {
    id: 'opening',
    title: '2026년 2학기 개강 총회',
    type: 'event',
    start: '2026-09-01T19:00',
    end: '2026-09-01T21:00',
  },
  {
    id: 'welcome',
    title: '신입 부원 환영 네트워킹',
    type: 'event',
    start: '2026-09-05T16:00',
    end: '2026-09-05T18:00',
  },
  {
    id: 'meeting',
    title: '운영진 회의',
    type: 'schedule',
    start: '2026-09-09T18:00',
    end: '2026-09-09T19:00',
  },
  {
    id: 'backend',
    title: '정기 백엔드 세미나',
    type: 'event',
    start: '2026-09-12T14:00',
    end: '2026-09-12T16:00',
  },
  {
    id: 'frontend',
    title: '프론트 스터디',
    type: 'event',
    start: '2026-09-17T19:00',
    end: '2026-09-17T21:00',
  },
  {
    id: 'seminar',
    title: '정기 세미나',
    type: 'event',
    start: '2026-09-24T14:00',
    end: '2026-09-24T16:00',
  },
  {
    id: 'review',
    title: '9월 활동 회고',
    type: 'schedule',
    start: '2026-09-30T19:00',
    end: '2026-09-30T20:00',
  },
  {
    id: 'semester-fee-deadline',
    title: '2학기 회비 마감',
    type: 'fee',
    start: '2026-09-30T23:59',
    end: '2026-09-30T23:59',
  },
]