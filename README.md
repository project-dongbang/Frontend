# DongBang Frontend

동아리 운영 서비스 DongBang의 React + TypeScript 프론트엔드입니다.

## 실행

```bash
npm install
npm run dev
```

## 배포 API와 OAuth 로그인

운영 Vercel에서는 `vercel.json`이 브라우저의 `/api/*` 요청을
`https://api.3.36.171.188.nip.io/api/*`로 전달합니다. 운영 빌드는
`VITE_API_BASE_URL`이 없을 때 같은 출처의 `/api/*`를 사용합니다.
Vercel에 이전 API 주소로 설정한 `VITE_API_BASE_URL`이 남아 있다면 제거하고
다시 배포해야 합니다. 로컬 Vite에서 직접 API를 호출할 때만 `.env.example`의
값을 `.env.local`에 설정합니다.

OAuth 시작 요청과 백엔드 콜백도 반드시 Vercel의 `/api` 프록시를 지나야
인증 쿠키가 Vercel 호스트에 저장됩니다. 새 콜백을 Google·Kakao 개발자
콘솔에 먼저 등록한 뒤 EC2의 실제 `.env`를 다음과 같이 설정합니다.

```dotenv
AUTH_COOKIE_SECURE=true
AUTH_ALLOWED_REDIRECT_URIS=https://dongbang-frontend.vercel.app,https://dongbang-frontend.vercel.app/auth/callback
GOOGLE_CALLBACK_URI=https://dongbang-frontend.vercel.app/api/v1/auth/oauth/google/callback
KAKAO_CALLBACK_URI=https://dongbang-frontend.vercel.app/api/v1/auth/oauth/kakao/callback
```

`AUTH_ALLOWED_REDIRECT_URIS`는 이미 프론트 콜백을 포함한다면 그대로 둘 수
있습니다. Vercel 프록시가 배포된 후 EC2 설정을 변경하고 API 컨테이너를
재생성합니다. 새 콜백은 Google·Kakao 콘솔에도 같은 문자열로 등록해야 합니다.
로컬 OAuth 테스트는 로컬 백엔드를 `localhost:8080`에서 실행하고, 각 공급자의
콜백을 `http://localhost:8080/api/v1/auth/oauth/{provider}/callback`으로
설정합니다. 로컬 프론트의 API 주소는 `http://localhost:8080`을 사용합니다.

배포 확인 순서는 Google·Kakao 로그인 시작 → 백엔드 OAuth 콜백의
`Set-Cookie` → 프론트 `/auth/callback` → `/api/v1/auth/me`의 200 응답입니다.
모바일 브라우저에서도 같은 순서로 확인합니다. 인증 응답은 CDN에
캐시하지 않습니다.

## 공통 UI 구성

- 앱 레이아웃: 상단 헤더, 반응형 사이드바
- 버튼, 상태 배지, 카드, 페이지 헤더, 통계 카드, 빈 상태
- 동아리 운영 대시보드 예시 화면

도메인별 화면과 API 연동은 각 기능 브랜치에서 이 공통 컴포넌트를 재사용합니다.
