import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { PATHS } from '../../routes/paths'
import { getPostAuthDestination } from '../../routes/authReturn'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { refresh } = useSession()

  useEffect(() => {
    const loginError = new URLSearchParams(window.location.search).get('loginError')
    if (loginError) {
      navigate(`${PATHS.login}?error=${loginError === 'cancelled' ? 'cancelled' : 'failed'}`, { replace: true })
      return
    }
    void refresh().then((user) => {
      navigate(user ? user.onboardingRequired ? PATHS.signup : getPostAuthDestination() : PATHS.login, { replace: true })
    })
  }, [navigate, refresh])

  return <main className="login-page"><p role="status">로그인 정보를 확인하고 있어요…</p></main>
}
