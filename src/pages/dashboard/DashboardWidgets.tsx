import { Badge, Button, Card } from '../../components/common'

const schedules = [
  { day: '01', title: '2026년 2학기 개강 총회', detail: '19:00 · 학생회관 201호', status: '행사' },
  { day: '05', title: '신입 부원 환영 네트워킹', detail: '16:00 · 성심관 라운지', status: '행사' },
  { day: '09', title: '운영진 회의', detail: '18:00 · 동아리방', status: '일정' },
  { day: '10', title: '2026년 2학기 정기 납부 마감', detail: '23:59 · 납부 항목 마감', status: '마감' },
  { day: '12', title: '정기 백엔드 세미나', detail: '14:00 · 비대면 · 동아리 공지 링크', status: '행사' },
  { day: '17', title: '프론트 스터디', detail: '19:00 · 동아리방', status: '일정' },
  { day: '24', title: '정기 세미나', detail: '14:00 · 성심관 라운지', status: '행사' },
  { day: '30', title: '9월 활동 회고', detail: '19:00 · 동아리방', status: '일정' },
]

const stats = [['활동 멤버', '64명'], ['이번 달 일정', '8개'], ['행사 출석률', '82%'], ['납부율', '91%']]
const album = [['album-sky', '2026년 2학기 개강 총회'], ['album-sand', '신입 부원 환영 네트워킹'], ['album-blue', '정기 백엔드 세미나']] as const

export function DashboardOverview() {
  return <section className="dashboard-overview" aria-label="동아리 대시보드"><div className="dashboard-left-column"><section className="dashboard-stat-grid" aria-label="동아리 현황">{stats.map(([label, value]) => <article className="dashboard-stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section><UpcomingScheduleCard /></div><AlbumCard /></section>
}

function UpcomingScheduleCard() {
  return <Card title="다가오는 일정" description="아래로 스크롤해 전체 일정을 확인하세요." action={<Button variant="ghost">전체 보기 →</Button>} className="upcoming-card"><ul className="dashboard-schedule-list">{schedules.map((schedule) => <li className="dashboard-schedule-item" key={`${schedule.day}-${schedule.title}`}><div className="dashboard-date"><strong>{schedule.day}</strong><span>9월</span></div><i aria-hidden="true" /><div className="dashboard-schedule-copy"><strong>{schedule.title}</strong><span>{schedule.detail}</span></div><Badge tone="neutral">{schedule.status}</Badge></li>)}</ul><p className="schedule-scroll-note">스크롤 시 이후 일정이 이어집니다.</p></Card>
}

function AlbumCard() {
  return <Card title="동아리 사진첩" description="동아리의 활동 기록을 최대 4장으로 보여줘요." action={<Button variant="ghost">전체 보기 →</Button>} className="album-card"><div className="album-grid">{album.map(([className, title]) => <article className={`album-item ${className}`} key={title}><span>{title}</span></article>)}<article className="album-item album-logo" aria-label="D.Log"><strong>D.Log</strong></article></div></Card>
}
