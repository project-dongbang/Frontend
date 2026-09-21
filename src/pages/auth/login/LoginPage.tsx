import dongbangLogo from '../../../assets/dongbang-logo.svg'
import googleIcon from '../../../assets/google.svg'
import kakaoIcon from '../../../assets/kakao.svg'
import './LoginPage.css'

export function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-accent" aria-hidden="true" />
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card-accent" aria-hidden="true" />
        <div className="login-brand" aria-label="DongBang"><img src={dongbangLogo} alt="DongBang" /><strong>DongBang</strong></div>
        <header className="login-heading"><p>WELCOME TO DONGBANG</p><h1 id="login-title">우리 동아리방에<br />들어가 볼까요?</h1><span>사용하는 계정으로 간편하게 시작하세요.</span></header>
        <div className="login-actions">
          <button className="social-button google-button" type="button"><img src={googleIcon} alt="" />Google로 계속하기</button>
          <button className="social-button kakao-button" type="button"><img src={kakaoIcon} alt="" />카카오로 계속하기</button>
        </div>
        <p className="login-helper">별도의 비밀번호 없이 안전하고 간편하게 로그인합니다.</p>
      </section>
      <footer>© 2026 DongBang</footer>
    </main>
  )
}
