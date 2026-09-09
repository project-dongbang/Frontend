import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/auth/login/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { SchedulePage } from './pages/schedule/SchedulePage'
import { PATHS } from './routes/paths'

function App() {
  return (
    <Routes>
      <Route path={PATHS.login} element={<LoginPage />} />
      <Route path={PATHS.dashboard} element={<DashboardPage />} />
      <Route path={PATHS.calendar} element={<SchedulePage />} />
      <Route path="/" element={<Navigate to={PATHS.login} replace />} />
      <Route path="*" element={<Navigate to={PATHS.login} replace />} />
    </Routes>
  )
}

export default App
