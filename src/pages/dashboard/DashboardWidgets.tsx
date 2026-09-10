import { Badge, Button, Card } from '../../components/common'

const schedules = [
  {
    day: '05',
    title: '신입 부원 환영 네트워킹',
    detail: '16:00 · 학생회관 라운지 · 26명 신청',
    status: '행사',
  },
  {
    day: '09',
    title: '운영진 회의',
    detail: '18:00 · 동아리방',
    status: '일정',
  },
  {
    day: '12',
    title: '정기 백엔드 세미나',
    detail: '14:00 · 비대면 · 동아리 공지 링크 · 19명 신청',
    status: '행사',
  },
]

export function DashboardBanner({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section className="welcome-banner">
      <div>
        <span>2026 · 2학기 · D.Log 개발동아리</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="welcome-art" aria-hidden="true">
        <i />
        <b />
      </div>
    </section>
  )
}

export function UpcomingScheduleCard() {
  return (
    <Card
      title="다가오는 일정"
      description="참가 신청과 출석 준비가 필요한 행사예요."
      action={<Button variant="ghost">전체 보기 →</Button>}
    >
      <ul className="schedule-list">
        {schedules.map((schedule) => (
          <li className="schedule-item" key={schedule.day}>
            <div className="date-box">
              <strong>{schedule.day}</strong>
              <span>9월</span>
            </div>
            <i />
            <div>
              <strong>{schedule.title}</strong>
              <span>{schedule.detail}</span>
            </div>
            <Badge tone="neutral">{schedule.status}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function FeeSummaryCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card
      title={title}
      description={description}
      action={<Button variant="ghost">상세 →</Button>}
    >
      <div className="fee-summary">
        <span>현재 잔여금</span>
        <strong>₩ 1,842,500</strong>
        <div className="fee-progress" aria-label="누적 수입과 사용 비율">
          <i />
          <b />
        </div>
        <div className="fee-totals">
          <div>
            <span>누적 수입</span>
            <strong>₩ 2,360,000</strong>
          </div>
          <div>
            <span>누적 사용</span>
            <strong>₩ 517,500</strong>
          </div>
        </div>
        <ul className="recent-expenses">
          <li>
            <span>
              <b>개강 총회 간식</b>
              <small>2026-08-31 · 상세 보기</small>
            </span>
            <strong>−78,500</strong>
          </li>
          <li>
            <span>
              <b>세미나실 대관</b>
              <small>2026-08-28 · 상세 보기</small>
            </span>
            <strong>−120,000</strong>
          </li>
        </ul>
      </div>
    </Card>
  )
}
