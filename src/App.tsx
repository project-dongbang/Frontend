import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/auth/login/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ClubCreatePage } from './pages/clubs/ClubCreatePage'
import { ClubJoinPage } from './pages/clubs/ClubJoinPage'
import { ClubSelectionPage } from './pages/clubs/ClubSelectionPage'
import { ClubSettingsPage } from './pages/clubs/ClubSettingsPage'
import { PATHS } from './routes/paths'

function App() {
  return (
    <Routes>
      <Route path={PATHS.login} element={<LoginPage />} />
      <Route path={PATHS.dashboard} element={<DashboardPage />} />
      <Route path={PATHS.clubs} element={<ClubSelectionPage />} />
      <Route path={PATHS.createClub} element={<ClubCreatePage />} />
      <Route path={PATHS.joinClub} element={<ClubJoinPage />} />
      <Route path={PATHS.clubSettings} element={<ClubSettingsPage />} />
      <Route path="/" element={<Navigate to={PATHS.login} replace />} />
      <Route path="*" element={<Navigate to={PATHS.login} replace />} />
    </Routes>
  )
}

export default App
