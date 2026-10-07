import { useNavigate } from 'react-router-dom'
import { Button, PageHeader } from '../../components/common'
import addIcon from '../../assets/dashboard-add.svg'
import { PATHS } from '../../routes/paths'
import { DashboardOverview } from './DashboardWidgets'
import { DashboardShell } from './DashboardShell'

export function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <DashboardShell role="admin">
      <PageHeader
        eyebrow="오늘의 동아리방"
        title="안녕하세요, 김동방 운영진님"
        description="지금 확인해야 할 동아리 운영 현황을 모았어요."
        action={<><Button variant="secondary" className="dashboard-fee-button" onClick={() => navigate(`${PATHS.fees}?dialog=fee-item-create`)}>▣&nbsp; 납부 항목 등록</Button><Button className="dashboard-create-button" onClick={() => navigate(`${PATHS.calendar}?dialog=schedule-create`)}><img src={addIcon} alt="" />행사 만들기</Button></>}
      />
      <DashboardOverview />
    </DashboardShell>
  )
}
