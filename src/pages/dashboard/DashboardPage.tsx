import { useSearchParams } from 'react-router-dom'
import { AdminDashboard } from './AdminDashboard'
import { MemberDashboard } from './MemberDashboard'
import './DashboardPage.css'
import { useSession } from '../../context/SessionContext'

export type DashboardRole = 'admin' | 'member'

export function DashboardPage() {
  const [searchParams] = useSearchParams()
  const { activeOrganization } = useSession()
  const role: DashboardRole =
    activeOrganization?.myRole === 'MEMBER' || searchParams.get('role') === 'member' ? 'member' : 'admin'

  return role === 'member' ? <MemberDashboard /> : <AdminDashboard />
}
