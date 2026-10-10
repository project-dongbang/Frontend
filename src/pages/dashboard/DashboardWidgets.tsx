import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card } from '../../components/common'
import { PATHS } from '../../routes/paths'
import { dashboardApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import type { DashboardData } from '../../api/types'
import { useSession } from '../../context/SessionContext'

export function DashboardOverview({ role = 'admin' }: { role?: 'admin' | 'member' }) {
  const navigate = useNavigate()
  const { activeOrganization, user } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const visibleData = data?.organizationId === activeOrganization?.organizationId ? data : null

  useEffect(() => {
    if (!activeOrganization || !user) return
    let active = true
    dashboardApi.get(activeOrganization.organizationId, user.userId, role)
      .then((result) => { if (active) { setData(result); setError('') } })
      .catch((requestError) => { if (active) setError(errorMessage(requestError)) })
    return () => { active = false }
  }, [activeOrganization, user, role])

  const stats = visibleData ? [
    ['활동 멤버', `${visibleData.stats.activeMemberCount}명`],
    ['이번 달 일정', `${visibleData.stats.thisMonthEventCount}개`],
    ['행사 출석률', `${Math.round(visibleData.stats.attendanceRate)}%`],
    ['납부율', `${Math.round(visibleData.stats.paymentRate)}%`],
  ] : [['활동 멤버', '-'], ['이번 달 일정', '-'], ['행사 출석률', '-'], ['납부율', '-']]

  return <>{error && <p role="alert">{error}</p>}<section className="dashboard-overview" aria-label="동아리 대시보드"><div className="dashboard-left-column"><section className="dashboard-stat-grid" aria-label="동아리 현황">{stats.map(([label, value]) => <article className="dashboard-stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section><UpcomingScheduleCard schedules={visibleData?.upcomingSchedules ?? []} onViewAll={() => navigate(PATHS.calendar)} /></div><AlbumCard photos={visibleData?.recentPhotos ?? []} onViewAll={() => navigate(PATHS.gallery)} /></section></>
}

function UpcomingScheduleCard({ schedules, onViewAll }: { schedules: DashboardData['upcomingSchedules']; onViewAll: () => void }) {
  return <Card title="다가오는 일정" description="예정된 동아리 일정을 확인하세요." action={<Button variant="ghost" onClick={onViewAll}>전체 보기 →</Button>} className="upcoming-card">{schedules.length > 0 ? <ul className="dashboard-schedule-list">{schedules.map((schedule) => <li className="dashboard-schedule-item" key={schedule.eventId}><div className="dashboard-date"><strong>{schedule.day}</strong><span>{schedule.month}월</span></div><i aria-hidden="true" /><div className="dashboard-schedule-copy"><strong>{schedule.title}</strong><span>{schedule.detail}</span></div><Badge tone="neutral">{schedule.status}</Badge></li>)}</ul> : <p className="dashboard-empty-note">다가오는 일정이 없어요. 전체 보기에서 일정을 확인할 수 있어요.</p>}</Card>
}

function AlbumCard({ photos, onViewAll }: { photos: DashboardData['recentPhotos']; onViewAll: () => void }) {
  return <Card title="동아리 사진첩" description="동아리의 활동 기록을 최대 4장으로 보여줘요." action={<Button variant="ghost" onClick={onViewAll}>전체 보기 →</Button>} className="album-card"><div className="album-grid">{photos.map((photo) => <article className="album-item" key={photo.photoId}><img src={photo.imageUrl} alt={photo.title} /><span>{photo.title}</span></article>)}{photos.length === 0 && <article className="album-item album-logo" aria-label="사진 없음"><strong>사진 없음</strong></article>}</div></Card>
}
