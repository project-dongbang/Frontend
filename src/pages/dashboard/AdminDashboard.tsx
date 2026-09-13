import { Button, PageHeader } from '../../components/common'
import addIcon from '../../assets/dashboard-add.svg'
import { DashboardOverview } from './DashboardWidgets'
import { DashboardShell } from './DashboardShell'

export function AdminDashboard() {
  return (
    <DashboardShell role="admin">
      <PageHeader
        eyebrow="오늘의 동아리방"
        title="안녕하세요, 김동방 운영진님"
        description="지금 확인해야 할 동아리 운영 현황을 모았어요."
        action={<><Button variant="secondary" className="dashboard-fee-button">▣&nbsp; 납부 항목 등록</Button><Button className="dashboard-create-button"><img src={addIcon} alt="" />행사 만들기</Button></>}
      />
      <DashboardOverview />
    </DashboardShell>
  )
}
