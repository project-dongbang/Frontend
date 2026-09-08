import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/auth/login/LoginPage'
import { PATHS } from './routes/paths'

function App() {
  return (
    <Routes>
      <Route path={PATHS.login} element={<LoginPage />} />
      <Route path="/" element={<Navigate to={PATHS.login} replace />} />
      <Route path="*" element={<Navigate to={PATHS.login} replace />} />
    </Routes>
  )
}

export default App
