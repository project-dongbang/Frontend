import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/auth/login/LoginPage'
import { SignupPage } from './pages/auth/signup/SignupPage'
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { SchedulePage } from './pages/schedule/SchedulePage'
import { AttendancePage } from './pages/attendance/AttendancePage'
import { AttendanceCheckInPage } from './pages/attendance/AttendanceCheckInPage'
import { ClubCreatePage } from './pages/clubs/ClubCreatePage'
import { ClubJoinPage } from './pages/clubs/ClubJoinPage'
import { ClubSelectionPage } from './pages/clubs/ClubSelectionPage'
import { ClubSettingsPage } from './pages/clubs/ClubSettingsPage'
import { GalleryPage } from './pages/gallery/GalleryPage'
import { MembersPage } from './pages/members/MembersPage'
import { FeesPage } from './pages/fees/FeesPage'
import { PATHS } from './routes/paths'
import { useSession } from './context/SessionContext'

function HomeRedirect() {
  const { user, activeOrganization, loading } = useSession()
  if (loading) return <main role="status">로그인 정보를 확인하고 있어요…</main>
  const destination = !user ? PATHS.login : user.onboardingRequired ? PATHS.signup : activeOrganization ? PATHS.dashboard : PATHS.clubs
  return <Navigate to={destination} replace />
}

function App() {
  return (
    <Routes>
      <Route path={PATHS.login} element={<LoginPage />} />
      <Route path={PATHS.signup} element={<SignupPage />} />
      <Route path={PATHS.authCallback} element={<AuthCallbackPage />} />
      <Route path={PATHS.dashboard} element={<DashboardPage />} />
      <Route path={PATHS.gallery} element={<GalleryPage />} />
      <Route path={PATHS.members} element={<MembersPage />} />

      <Route path={PATHS.calendar} element={<SchedulePage />} />
      <Route path={PATHS.attendance} element={<AttendancePage />} />
      <Route path={PATHS.attendanceCheckIn} element={<AttendanceCheckInPage />} />
      <Route path={PATHS.fees} element={<FeesPage />} />
      <Route path={PATHS.clubs} element={<ClubSelectionPage />} />
      <Route path={PATHS.createClub} element={<ClubCreatePage />} />
      <Route path={PATHS.joinClub} element={<ClubJoinPage />} />
      <Route path={PATHS.clubSettings} element={<ClubSettingsPage />} />

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}

export default App
