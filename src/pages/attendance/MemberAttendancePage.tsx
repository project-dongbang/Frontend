import { DashboardShell } from '../dashboard/DashboardShell'
import {
  memberAttendanceItems,
  memberAttendanceStatusLabel,
} from './attendanceMock'
import './attendance.css'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '../../routes/paths'

export function MemberAttendancePage() {
    const navigate = useNavigate()
  return (
    <DashboardShell role="member">
      <section className="member-attendance-page">
        <header className="member-attendance-head">
          <div className="attendance-eyebrow">
            LIVE ATTENDANCE
          </div>

          <h1>내 출석</h1>

          <p>
            행사별 참가자의 출석 상태를 확인하고 관리해요.
          </p>
        </header>

        <section className="member-attendance-card">
          <div className="member-attendance-card-head">
            <div>
              <h2>나의 행사 출석</h2>

              <p>
                출석 2회 · 지각 1회 · 결석 1회 · 예정 1회
              </p>
            </div>

            <button
                type="button"
                className="member-attendance-find"
                onClick={() => navigate(`${PATHS.calendar}?role=member`)}
            >
                행사 찾아보기 →
            </button>
          </div>

          <div className="member-attendance-table-wrap">
            <table className="member-attendance-table">
              <thead>
                <tr>
                  <th>행사명</th>
                  <th>행사 일시</th>
                  <th>출석 상태</th>
                  <th>체크인 시각</th>
                </tr>
              </thead>

              <tbody>
                {memberAttendanceItems.map((item) => (
                  <tr key={item.id}>
                    <td className="member-attendance-title">
                      {item.title}
                    </td>

                    <td>{item.date}</td>

                    <td>
                      <span
                        className={`member-attendance-status ${item.status}`}
                      >
                        {memberAttendanceStatusLabel[item.status]}
                      </span>
                    </td>

                    <td>{item.checkInTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="member-attendance-guide">
            행사장에서 운영진이 안내하는 QR로 출석해 주세요.
            출석 기록에 문제가 있다면 운영진에게 문의하세요.
          </div>
        </section>
      </section>
    </DashboardShell>
  )
}