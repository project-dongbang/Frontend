import { useState } from 'react'

import { DashboardShell } from '../dashboard/DashboardShell'
import { ExpenseCreateModal } from './components/ExpenseCreateModal'
import { FeeItemCreateModal } from './components/FeeItemCreateModal'
import { IncomeCreateModal } from './components/IncomeCreateModal'
import { FeesLedger } from './components/FeesLedger'
import { FeesPayments } from './components/FeesPayments'
import {
  FeesTabs,
  type FeesTab,
} from './components/FeesTabs'
import { FeesSummary } from './components/FeesSummary'

import {
  feeCollections,
  feePaymentMembers,
  feesSummary,
  feesTransactions,
} from './feesMock'

import './fees.css'

export function FeesPage() {
  const [activeTab, setActiveTab] =
    useState<FeesTab>('ledger')

  const [paymentMembers, setPaymentMembers] =
    useState(feePaymentMembers)

  const [paymentSummary, setPaymentSummary] = useState({
    feeItemId: 21,
    targetCount: 64,
    paidCount: 58,
    unpaidCount: 6,
    paymentRate: 90.6,
  })

  const [feeItemModalOpen, setFeeItemModalOpen] =
    useState(false)
  const [incomeModalOpen, setIncomeModalOpen] =
  useState(false)
  const [expenseModalOpen, setExpenseModalOpen] =
  useState(false)

  const handlePaymentStatusChange = (
    collectionId: string,
    memberId: string,
    status: 'paid' | 'unpaid',
  ) => {
    // TODO: 회비 납부 상태 변경 API 연결
    console.log('회비 납부 상태 변경', {
      collectionId,
      memberId,
      status,
    })

    setPaymentMembers((current) =>
      current.map((member) =>
        member.id === memberId
          ? { ...member, status }
          : member,
      ),
    )

    setPaymentSummary((current) => {
      const paidCount =
        current.paidCount +
        (status === 'paid' ? 1 : -1)

      return {
        ...current,
        paidCount,
        unpaidCount:
          current.targetCount - paidCount,
        paymentRate: Number(
          (
            (paidCount / current.targetCount) *
            100
          ).toFixed(1),
        ),
      }
    })
  }

  const handlePaymentExport = (
    collectionId: string,
  ) => {
    // TODO: 회비 납부 현황 다운로드 API 연결
    console.log('회비 납부 현황 내보내기', {
      collectionId,
    })
  }

  return (
    <DashboardShell role="admin">
      <section className="fees-page">
        <header className="fees-page-head">
          <div>
            <div className="fees-eyebrow">
              OPEN LEDGER
            </div>

            <h1>회비 관리</h1>

            <p>
              납부부터 사용 내역, 증빙과 잔여금까지
              투명하게 공개해요.
            </p>
          </div>

          <div className="fees-page-actions">
            <button
              type="button"
              className="fees-secondary-btn"
              onClick={() =>
                setFeeItemModalOpen(true)
              }
            >
              납부 항목 등록
            </button>

            <button
              type="button"
              className="fees-secondary-btn"
              onClick={() =>
                setIncomeModalOpen(true)
              }
            >
              입금 내역 등록
            </button>

            <button
              type="button"
              className="fees-primary-btn"
              onClick={() =>
                setExpenseModalOpen(true)
              }
            >
              <span aria-hidden="true">＋</span>
              출금 내역 등록
            </button>
          </div>
        </header>

        <FeesSummary
          balance={feesSummary.balance}
          semesterExpense={
            feesSummary.semesterExpense
          }
          paidCount={paymentSummary.paidCount}
          totalCount={paymentSummary.targetCount}
        />

        <FeesTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'ledger' ? (
          <FeesLedger
            transactions={feesTransactions}
          />
        ) : (
          <FeesPayments
            collections={feeCollections}
            members={paymentMembers}
            onPaymentStatusChange={
              handlePaymentStatusChange
            }
            onExport={handlePaymentExport}
          />
        )}
      </section>

      {feeItemModalOpen && (
        <FeeItemCreateModal
          onClose={() =>
            setFeeItemModalOpen(false)
          }
        />
      )}
      {incomeModalOpen && (
  <IncomeCreateModal
    onClose={() =>
      setIncomeModalOpen(false)
    }
  />
)}
{expenseModalOpen && (
  <ExpenseCreateModal
    onClose={() =>
      setExpenseModalOpen(false)
    }
  />
)}
    </DashboardShell>
  )
}