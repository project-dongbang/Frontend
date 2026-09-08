# 페이지 구조

Figma 스토리보드의 화면 코드를 기준으로 페이지를 도메인별로 구성한다. 각 화면 구현 시 해당 도메인 폴더 아래에 화면 전용 컴포넌트와 스타일을 추가한다.

| 도메인 | Figma 화면 | 예정 경로 |
| --- | --- | --- |
| `auth` | LGN001 로그인, SGN001 회원가입 추가 정보 | `/login`, `/signup` |
| `club` | CLB001~004 동아리 선택·생성·참여·설정 | `/clubs`, `/clubs/new`, `/clubs/join`, `/clubs/:clubId/settings` |
| `dashboard` | DSH001 운영진, DSH002 일반 회원 대시보드 | `/dashboard` |
| `members` | MEM001~003 목록·초대·수정 | `/members` |
| `schedule` | CAL001~002 캘린더·일정, EVT001~004 행사 | `/calendar`, `/events` |
| `attendance` | ATT001~003 QR 출석·상태 수정·내 출석 | `/attendance` |
| `fees` | FEE001~005 회비 현황·장부·사용내역·수납 | `/fees` |
| `my-page` | MYP001 알림, MYP002 내 정보 | `/notifications`, `/profile` |
