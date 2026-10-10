import dongbangLogo from '../../../assets/dongbang-logo.svg'
import googleIcon from '../../../assets/google.svg'
import kakaoIcon from '../../../assets/kakao.svg'
import { authApi } from '../../../api/services'
import { useSearchParams } from 'react-router-dom'
import './LoginPage.css'
import { FeedbackState } from '../../../components/common/FeedbackState'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const loginError = searchParams.get('error')
  const login = (provider: 'google' | 'kakao') => {
    const redirectUri = `${window.location.origin}/auth/callback`
    window.location.assign(authApi.authorizeUrl(provider, redirectUri))
  }

  return (
    <main className="login-page">
      <div className="login-accent" aria-hidden="true" />
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card-accent" aria-hidden="true" />
        <div className="login-brand" aria-label="DongBang"><img src={dongbangLogo} alt="DongBang" /><strong>DongBang</strong></div>
        <header className="login-heading"><p>WELCOME TO DONGBANG</p><h1 id="login-title">우리 동아리방에<br />들어가 볼까요?</h1><span>사용하는 계정으로 간편하게 시작하세요.</span></header>
        <div className="login-actions">
          <button className="social-button google-button" type="button" onClick={() => login('google')}><img src={googleIcon} alt="" />Google로 계속하기</button>
          <button className="social-button kakao-button" type="button" onClick={() => login('kakao')}><img src={kakaoIcon} alt="" />카카오로 계속하기</button>
        </div>
        {(loginError === 'cancelled' || loginError === 'failed') && <FeedbackState
          kind="error"
          compact
          title={loginError === 'cancelled' ? '로그인이 취소됐어요' : '로그인을 완료하지 못했어요'}
          description={loginError === 'cancelled' ? '원할 때 다시 로그인해 주세요.' : '아래에서 로그인 방법을 다시 선택해 주세요.'}
        />}
        <p className="login-helper">별도의 비밀번호 없이 안전하고 간편하게 로그인합니다.</p>
      </section>
      <footer>© 2026 DongBang</footer>
    </main>
  )
}
