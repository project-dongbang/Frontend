import { useSearchParams } from 'react-router-dom'
import { AdminDashboard } from './AdminDashboard'
import { MemberDashboard } from './MemberDashboard'

export type DashboardRole = 'admin' | 'member'

export function DashboardPage() {
  const [searchParams] = useSearchParams()
  const role: DashboardRole =
    searchParams.get('role') === 'member' ? 'member' : 'admin'

  return role === 'member' ? <MemberDashboard /> : <AdminDashboard />
}
