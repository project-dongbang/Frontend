export type CalendarItemType =
  | 'schedule'
  | 'event'
  | 'fee'

export type CalendarItem = {
  id: string
  title: string
  start: string
  end: string
  type: CalendarItemType

  location?: string
  description?: string

  capacity?: number
  registered?: number
  deadline?: string
}

export const calendarMockData: CalendarItem[] = [
  {
    id: 'opening',
    title: '2026년 2학기 개강 총회',
    type: 'event',
    start: '2026-09-01T19:00',
    end: '2026-09-01T21:00',
    location: '학생회관 201호',
    description:
      '2학기 활동 안내와 팀 배정을 진행합니다.',
    capacity: 50,
    registered: 38,
    deadline: '2026-09-01T18:00',
  },

  {
    id: 'welcome',
    title: '신입 부원 환영 네트워킹',
    type: 'event',
    start: '2026-09-05T16:00',
    end: '2026-09-05T18:00',
    location: '성심관 라운지',
    description:
      '신입 회원과 함께하는 교류 시간입니다.',
    capacity: 40,
    registered: 26,
    deadline: '2026-09-05T15:00',
  },

  {
    id: 'meeting',
    title: '운영진 회의',
    type: 'schedule',
    start: '2026-09-09T18:00',
    end: '2026-09-09T19:00',
    location: '동아리방',
    description:
      '9월 운영 일정을 정리합니다.',
  },

  {
    id: 'backend',
    title: '정기 백엔드 세미나',
    type: 'event',
    start: '2026-09-12T14:00',
    end: '2026-09-12T16:00',
    location: '비대면 · 동아리 공지 링크',
    description:
      '백엔드 개발 사례와 설계를 공유합니다.',
    capacity: 30,
    registered: 19,
    deadline: '2026-09-12T13:00',
  },

  {
    id: 'frontend',
    title: '프론트 스터디',
    type: 'event',
    start: '2026-09-17T19:00',
    end: '2026-09-17T21:00',
    location: '학생회관 201호',
    description:
      '프론트엔드 개발 주제와 학습 내용을 공유합니다.',
    capacity: 20,
    registered: 12,
    deadline: '2026-09-17T18:00',
  },

  {
    id: 'seminar',
    title: '정기 세미나',
    type: 'event',
    start: '2026-09-24T14:00',
    end: '2026-09-24T16:00',
    location: '성심관 라운지',
    description:
      '동아리 정기 세미나를 진행합니다.',
    capacity: 40,
    registered: 8,
    deadline: '2026-09-24T13:00',
  },

  {
    id: 'review',
    title: '9월 활동 회고',
    type: 'schedule',
    start: '2026-09-30T19:00',
    end: '2026-09-30T20:00',
    location: '동아리방',
    description:
      '9월 동아리 활동을 돌아보고 다음 달 계획을 정리합니다.',
  },

  {
    id: 'semester-fee-deadline',
    title: '2학기 회비 마감',
    type: 'fee',
    start: '2026-09-30T23:59',
    end: '2026-09-30T23:59',
  },
]