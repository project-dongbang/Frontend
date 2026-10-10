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
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null)
  const [targets, setTargets] = useState<MyFeeTarget[]>([])
  const [transactions, setTransactions] = useState<FeesTransaction[]>([])
  const [summary, setSummary] = useState({ balance: 0, expense: 0 })
  const [targetsError, setTargetsError] = useState('')
  const [targetsLoaded, setTargetsLoaded] = useState(false)
  const [ledgerError, setLedgerError] = useState('')
  const [ledgerLoaded, setLedgerLoaded] = useState(false)

  useEffect(() => {
    if (!activeOrganization) return
    const organizationId = activeOrganization.organizationId
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setTargets([])
      setTransactions([])
      setSelectedTargetId(null)
      setTargetsError('')
      setTargetsLoaded(false)
      setLedgerError('')
      setLedgerLoaded(false)
    })
    feesApi.myTargets(organizationId).then((targetsRaw) => {
      if (cancelled) return
      const targetResult = targetsRaw as { content?: MyFeeTarget[] }
      setTargets(targetResult.content ?? [])
      setTargetsLoaded(true)
    }).catch((error) => { if (!cancelled) setTargetsError(errorMessage(error)) })
    feesApi.ledger(organizationId).then((ledgerRaw) => {
      if (cancelled) return
      const ledgerResult = ledgerRaw as { content?: Array<Record<string, unknown>>; summary?: Record<string, unknown> }
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
      setLedgerLoaded(true)
    }).catch((error) => { if (!cancelled) setLedgerError(errorMessage(error)) })
    return () => { cancelled = true }
  }, [activeOrganization])

  const currentTarget = targets.find((target) => target.feeTargetId === selectedTargetId)
    ?? targets.find((target) => target.status === 'UNPAID') ?? targets[0]
  const unpaidCount = targets.filter((target) => target.status === 'UNPAID').length
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
        {targetsError && <p role="alert">납부 항목을 불러오지 못했어요. {targetsError}</p>}
        {ledgerError && <p role="alert">장부를 불러오지 못했어요. {ledgerError}</p>}
        <div className="member-fees-summary">
          <article className="member-fees-summary-card is-balance"><span>현재 잔여금</span><strong>{ledgerLoaded ? `₩${summary.balance.toLocaleString('ko-KR')}` : '—'}</strong><small>회원 전체 공개</small></article>
          <article className="member-fees-summary-card is-expense"><span>누적 출금</span><strong>{ledgerLoaded ? `₩${summary.expense.toLocaleString('ko-KR')}` : '—'}</strong><small>공개 장부 기준</small></article>
          <article className="member-fees-summary-card is-payment"><span>내 납부 현황</span><strong>{targetsLoaded ? targets.length ? unpaidCount ? `${unpaidCount}건 미납` : '모두 납부 완료' : '내역 없음' : '—'}</strong><small>{targetsLoaded ? targets.length ? `전체 ${targets.length}개 납부 항목` : '등록된 납부 항목이 없습니다.' : targetsError ? '납부 항목을 확인할 수 없어요.' : '납부 항목을 불러오는 중이에요.'}</small></article>
        </div>
        {targets.length > 1 && <section className="member-fee-selector" aria-label="납부 항목 선택">
          <h2>내 납부 항목</h2>
          <div className="member-fee-selector-list">{targets.map((target) => <button
            key={target.feeTargetId}
            type="button"
            aria-pressed={currentTarget?.feeTargetId === target.feeTargetId}
            className={currentTarget?.feeTargetId === target.feeTargetId ? 'is-selected' : ''}
            onClick={() => { setSelectedTargetId(target.feeTargetId); setCopied(false) }}
          ><span>{target.title}</span><strong>₩{target.amountDue.toLocaleString('ko-KR')}</strong><small>{target.status === 'PAID' ? '납부 완료' : '미납'}</small></button>)}</div>
        </section>}
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
