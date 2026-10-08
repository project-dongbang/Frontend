import { useEffect, useState } from 'react'
import { errorMessage } from '../../api/client'
import { feesApi } from '../../api/services'
import { useSession } from '../../context/SessionContext'
import { DashboardShell } from '../dashboard/DashboardShell'
import { FeesLedger } from './components/FeesLedger'
import type { FeesTransaction } from './feesMock'
import './fees.css'

type MyFeeTarget = {
  feeTargetId: number
  title: string
  categoryName: string
  amountDue: number
  dueDate: string
  description: string
  status: 'UNPAID' | 'PAID'
  paymentAccount?: { bankName?: string; accountNumber?: string; accountHolder?: string }
}

export function ApiMemberFeesPage() {
  const { activeOrganization } = useSession()
  const [copied, setCopied] = useState(false)
  const [targets, setTargets] = useState<MyFeeTarget[]>([])
  const [transactions, setTransactions] = useState<FeesTransaction[]>([])
  const [summary, setSummary] = useState({ balance: 0, expense: 0 })
  const [requestError, setRequestError] = useState('')

  useEffect(() => {
    if (!activeOrganization) return
    Promise.all([
      feesApi.myTargets(activeOrganization.organizationId),
      feesApi.ledger(activeOrganization.organizationId),
    ]).then(([targetsRaw, ledgerRaw]) => {
      const targetResult = targetsRaw as { content?: MyFeeTarget[] }
      const ledgerResult = ledgerRaw as { content?: Array<Record<string, unknown>>; summary?: Record<string, unknown> }
      setTargets(targetResult.content ?? [])
      setTransactions((ledgerResult.content ?? []).map((item) => ({
        id: String(item.transactionId ?? item.feeItemId),
        date: String(item.occurredOn ?? '').replaceAll('-', '.'),
        title: String(item.title ?? ''),
        description: String(item.counterparty ?? ''),
        category: String(item.category ?? ''),
        amount: Number(item.amount ?? 0),
        type: item.transactionType === 'INCOME' ? 'income' : 'expense',
        author: String(item.createdByName ?? '시스템'),
        proofText: item.hasEvidence ? '영수증 보기' : '상세 보기',
      })))
      const rawSummary = ledgerResult.summary ?? {}
      setSummary({
        balance: Number(rawSummary.balance ?? rawSummary.currentBalance ?? 0),
        expense: Number(rawSummary.expense ?? rawSummary.totalExpense ?? rawSummary.semesterExpense ?? 0),
      })
      setRequestError('')
    }).catch((error) => setRequestError(errorMessage(error)))
  }, [activeOrganization])

  const currentTarget = targets.find((target) => target.status === 'UNPAID') ?? targets[0]
  const account = currentTarget?.paymentAccount
  const handleCopyAccount = async () => {
    if (!account?.accountNumber) return
    try {
      await navigator.clipboard.writeText(account.accountNumber)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch { setCopied(false) }
  }

  return (
    <DashboardShell role="member">
      <section className="fees-page member-fees-page">
        <header className="fees-page-head"><div><div className="fees-eyebrow">OPEN LEDGER</div><h1>납부 항목 관리</h1><p>납부 현황과 동아리 회계 사용 내역을 확인하세요.</p></div></header>
        {requestError && <p role="alert">{requestError}</p>}
        <div className="member-fees-summary">
          <article className="member-fees-summary-card is-balance"><span>현재 잔여금</span><strong>₩{summary.balance.toLocaleString('ko-KR')}</strong><small>회원 전체 공개</small></article>
          <article className="member-fees-summary-card is-expense"><span>누적 출금</span><strong>₩{summary.expense.toLocaleString('ko-KR')}</strong><small>공개 장부 기준</small></article>
          <article className="member-fees-summary-card is-payment"><span>내 납부 현황</span><strong>{currentTarget?.status === 'UNPAID' ? '미납' : currentTarget ? '납부 완료' : '내역 없음'}</strong><small>{currentTarget ? `${currentTarget.title} · ₩${currentTarget.amountDue.toLocaleString('ko-KR')}` : '등록된 납부 항목이 없습니다.'}</small></article>
        </div>
        {currentTarget && (
          <section className="member-fee-payment-card">
            <div className="member-fee-payment-head"><div><h2>{currentTarget.title}</h2><p>{currentTarget.categoryName} · {currentTarget.status === 'PAID' ? '납부 완료' : '미납'}</p></div><span className={currentTarget.status === 'PAID' ? 'fees-status' : 'member-fee-unpaid'}>{currentTarget.status === 'PAID' ? '납부 완료' : '미납'}</span></div>
            <div className="member-fee-payment-body">
              <p className="member-fee-payment-info">납부 금액 ₩{currentTarget.amountDue.toLocaleString('ko-KR')} · 마감 {currentTarget.dueDate.replaceAll('-', '.')}</p>
              {account?.accountNumber && <div className="member-fee-account"><span>입금 계좌 · {account.bankName} {account.accountNumber} · 예금주 {account.accountHolder}</span><button type="button" onClick={() => void handleCopyAccount()}>{copied ? '복사 완료' : '계좌번호 복사'}</button></div>}
              {currentTarget.description && <p className="member-fee-payment-guide">{currentTarget.description}</p>}
            </div>
          </section>
        )}
        <div className="member-fees-ledger"><FeesLedger transactions={transactions} /></div>
      </section>
    </DashboardShell>
  )
}
