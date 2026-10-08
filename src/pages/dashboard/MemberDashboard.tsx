import { PageHeader } from '../../components/common'
import { DashboardOverview } from './DashboardWidgets'
import { DashboardShell } from './DashboardShell'
import { useSession } from '../../context/SessionContext'

export function MemberDashboard() {
  const { user } = useSession()
  return (
    <DashboardShell role="member">
      <PageHeader eyebrow="오늘의 동아리방" title={`안녕하세요, ${user?.name ?? '회원'}님`} description="참여할 행사와 나의 활동, 동아리 소식을 확인해요." />
      <DashboardOverview role="member" />
    </DashboardShell>
  )
}
