import { PageHeader } from '../../components/common'
import { DashboardOverview } from './DashboardWidgets'
import { DashboardShell } from './DashboardShell'

export function MemberDashboard() {
  return (
    <DashboardShell role="member">
      <PageHeader eyebrow="오늘의 동아리방" title="안녕하세요, 남은우님" description="참여할 행사와 나의 활동, 동아리 소식을 확인해요." />
      <DashboardOverview />
    </DashboardShell>
  )
}
