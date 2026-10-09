import { AdminDashboard } from './AdminDashboard'
import { MemberDashboard } from './MemberDashboard'
import './DashboardPage.css'
import { useSession } from '../../context/SessionContext'

export type DashboardRole = 'admin' | 'member'

export function DashboardPage() {
  const { activeOrganization } = useSession()
  const role: DashboardRole =
    activeOrganization?.myRole === 'MEMBER' ? 'member' : 'admin'

  return role === 'member' ? <MemberDashboard /> : <AdminDashboard />
}
