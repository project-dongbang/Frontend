import { useNavigate } from 'react-router-dom'
import { Button, PageHeader } from '../../components/common'
import addIcon from '../../assets/dashboard-add.svg'
import { PATHS } from '../../routes/paths'
import { DashboardOverview } from './DashboardWidgets'
import { DashboardShell } from './DashboardShell'
import { useSession } from '../../context/SessionContext'

export function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useSession()

  return (
    <DashboardShell role="admin">
      <PageHeader
        eyebrow="오늘의 동아리방"
        title={`안녕하세요, ${user?.name ?? '운영진'}님`}
        description="지금 확인해야 할 동아리 운영 현황을 모았어요."
        action={<><Button variant="secondary" className="page-header-action dashboard-fee-button" onClick={() => navigate(`${PATHS.fees}?dialog=fee-item-create`)}>납부 항목 등록</Button><Button className="page-header-action page-header-action-with-icon dashboard-create-button" onClick={() => navigate(`${PATHS.calendar}?dialog=event-create`)}><img src={addIcon} alt="" />행사 만들기</Button></>}
      />
      <DashboardOverview role="admin" />
    </DashboardShell>
  )
}
