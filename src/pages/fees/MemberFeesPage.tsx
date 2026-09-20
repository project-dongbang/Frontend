import { useState } from 'react'
import { DashboardShell } from '../dashboard/DashboardShell'
import { FeesLedger } from './components/FeesLedger'
import {
  feeCollections,
  feesSummary,
  feesTransactions,
} from './feesMock'
import './fees.css'

export function MemberFeesPage() {
  const [copied, setCopied] = useState(false)

  const currentCollection = feeCollections[0]

  const handleCopyAccount = async () => {
    if (!currentCollection) return

    try {
      await navigator.clipboard.writeText(
        currentCollection.accountNumber,
      )

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <DashboardShell role="member">
      <section className="fees-page member-fees-page">
        <header className="fees-page-head">
          <div>
            <div className="fees-eyebrow">
              OPEN LEDGER
            </div>

            <h1>납부 항목 관리</h1>

            <p>
              납부 현황부터 사용 내역, 증빙과 잔여금까지
              투명하게 공개해요.
            </p>
          </div>
        </header>

        <div className="member-fees-summary">
          <article className="member-fees-summary-card is-balance">
            <span>현재 잔여금</span>

            <strong>
              ₩ {feesSummary.balance.toLocaleString('ko-KR')}
            </strong>

            <small>회원 전체 공개</small>
          </article>

          <article className="member-fees-summary-card is-expense">
            <span>이번 학기 출금</span>

            <strong>
              ₩ {feesSummary.semesterExpense.toLocaleString(
                'ko-KR',
              )}
            </strong>

            <small>사용 내역 14건</small>
          </article>

          <article className="member-fees-summary-card is-payment">
            <span>내 납부 현황</span>

            <strong>미납</strong>

            <small>2026년 2학기 정기 납부 · ₩40,000</small>
          </article>
        </div>

        {currentCollection && (
          <section className="member-fee-payment-card">
            <div className="member-fee-payment-head">
              <div>
                <h2>2026년 2학기 정기 납부</h2>
                <p>남은일 · 미납</p>
              </div>

              <span className="member-fee-unpaid">
                미납
              </span>
            </div>

            <div className="member-fee-payment-body">
              <p className="member-fee-payment-info">
                납부 금액 ₩40,000 · 마감{' '}
                {currentCollection.dueDate}
              </p>

              <div className="member-fee-account">
                <span>
                  입금 계좌 · {currentCollection.bank}{' '}
                  {currentCollection.accountNumber} · 예금주{' '}
                  {currentCollection.accountHolder}
                </span>

                <button
                  type="button"
                  onClick={handleCopyAccount}
                >
                  {copied ? '복사 완료' : '계좌번호 복사'}
                </button>
              </div>

              <p className="member-fee-payment-guide">
                입금 후 운영진의 확인을 기다려 주세요.
                별도의 확인 요청을 작성할 필요가 없어요.
              </p>
            </div>
          </section>
        )}

        <div className="member-fees-ledger">
          <FeesLedger transactions={feesTransactions} />
        </div>
      </section>
    </DashboardShell>
  )
}