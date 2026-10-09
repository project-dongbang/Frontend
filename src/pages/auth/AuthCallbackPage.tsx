import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { PATHS } from '../../routes/paths'
import { authApi } from '../../api/services'
import { getAuthReturnPath } from '../../routes/authReturn'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { refresh } = useSession()

  useEffect(() => {
    void refresh().then(async () => {
      try {
        const user = await authApi.me()
        navigate(user.onboardingRequired ? PATHS.signup : getAuthReturnPath(), { replace: true })
      } catch {
        navigate(PATHS.login, { replace: true })
      }
    })
  }, [navigate, refresh])

  return <main className="login-page"><p role="status">로그인 정보를 확인하고 있어요…</p></main>
}
