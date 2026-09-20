export type AttendanceStatus = 'present' | 'absent'

export type AttendanceMember = {
  id: string
  name: string
  studentId: string
  generation: string
  status: AttendanceStatus
  checkedAt: string | null
}

export type AttendanceEvent = {
  id: string
  title: string
  start: string
  location: string
}

export const attendanceEvents: AttendanceEvent[] = [
  {
    id: 'opening',
    title: '2026년 2학기 개강 총회',
    start: '2026-09-01T19:00',
    location: '학생회관 201호',
  },
  {
    id: 'welcome',
    title: '신입 부원 환영 네트워킹',
    start: '2026-09-05T16:00',
    location: '성심관 라운지',
  },
  {
    id: 'backend',
    title: '정기 백엔드 세미나',
    start: '2026-09-12T14:00',
    location: '비대면 · 동아리 공지 링크',
  },
  {
    id: 'frontend',
    title: '프론트 스터디',
    start: '2026-09-17T19:00',
    location: '학생회관 201호',
  },
  {
    id: 'seminar',
    title: '정기 세미나',
    start: '2026-09-24T14:00',
    location: '성심관 라운지',
  },
]

const names = [
  '정하늘',
  '윤민지',
  '강준호',
  '김동방',
  '이서연',
  '박지훈',
  '최유진',
  '김민준',
  '이도윤',
  '박서준',
  '최지우',
  '정서윤',
  '강하윤',
  '조수빈',
  '윤지호',
  '장예린',
  '임현우',
  '한서진',
  '오지민',
  '신유나',
  '서민서',
  '권도현',
  '황수아',
  '안지안',
  '송준서',
  '류예원',
  '전시우',
  '홍채원',
  '문건우',
  '양다은',
  '배서현',
  '백승우',
  '남소율',
  '심태윤',
  '노유빈',
  '하재윤',
  '곽나연',
  '성지후',
]

export const attendanceMembers: AttendanceMember[] = names.map(
  (name, index) => {
    const present = index < 31

    return {
      id: `member-${index + 1}`,
      name,
      studentId: String(20260001 + index),
      generation: `${11 + (index % 3)}기`,
      status: present ? 'present' : 'absent',
      checkedAt: present
        ? `18:${String(30 + Math.floor(index / 2)).padStart(2, '0')}`
        : null,
    }
  },
)

export type MemberAttendanceStatus =
  | 'present'
  | 'late'
  | 'absent'
  | 'scheduled'

export type MemberAttendanceItem = {
  id: number
  title: string
  date: string
  status: MemberAttendanceStatus
  checkInTime: string
}

export const memberAttendanceItems: MemberAttendanceItem[] = [
  {
    id: 1,
    title: '9월 정기 모임',
    date: '2026.09.12 19:00',
    status: 'present',
    checkInTime: '18:57',
  },
  {
    id: 2,
    title: '개강 총회',
    date: '2026.09.05 18:30',
    status: 'late',
    checkInTime: '18:42',
  },
  {
    id: 3,
    title: '여름 MT',
    date: '2026.08.22 10:00',
    status: 'absent',
    checkInTime: '-',
  },
  {
    id: 4,
    title: '9월 네트워킹 데이',
    date: '2026.09.26 14:00',
    status: 'scheduled',
    checkInTime: '-',
  },
]

export const memberAttendanceStatusLabel: Record<
  MemberAttendanceStatus,
  string
> = {
  present: '출석',
  late: '지각',
  absent: '결석',
  scheduled: '예정',
}