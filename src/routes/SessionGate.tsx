import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { PATHS } from './paths'

export function SessionGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { user, activeOrganization, loading, organizationsError } = useSession()
  const publicPath = pathname === '/' || pathname === PATHS.login || pathname === PATHS.signup || pathname === PATHS.authCallback || pathname === PATHS.joinClub || pathname === PATHS.attendanceCheckIn
  if (publicPath) return children
  if (loading) return <main role="status">로그인 정보를 확인하고 있어요…</main>
  if (!user) return <Navigate to={PATHS.login} replace />
  if (user.onboardingRequired) return <Navigate to={PATHS.signup} replace />
  if (!activeOrganization && pathname !== PATHS.clubs && pathname !== PATHS.createClub) {
    return <Navigate to={PATHS.clubs} replace state={organizationsError ? { organizationsError } : undefined} />
  }
  return children
}
