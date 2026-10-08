import { useState } from 'react'
import { FeesDetailModal } from './FeesDetailModal'
import { FeesReceiptModal } from './FeesReceiptModal'
import type { FeesTransaction } from '../feesMock'
import { feesApi } from '../../../api/services'
import { errorMessage } from '../../../api/client'
import { useSession } from '../../../context/SessionContext'
import { LedgerTransactionEditModal } from './LedgerTransactionEditModal'

type FeesLedgerProps = {
  transactions: FeesTransaction[]
}

const formatMoney = (value: number) =>
  `₩ ${value.toLocaleString('ko-KR')}`

export function FeesLedger({
  transactions,
}: FeesLedgerProps) {
  const { activeOrganization } = useSession()
  const [detailError, setDetailError] = useState('')
  const [detailTransaction, setDetailTransaction] =
    useState<FeesTransaction | null>(null)

  const [receiptTransaction, setReceiptTransaction] =
    useState<FeesTransaction | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<FeesTransaction | null>(null)

  const openDetail = async (transaction: FeesTransaction, receipt = false) => {
    if (!activeOrganization) return
    try {
      const raw = await feesApi.ledgerDetail(activeOrganization.organizationId, transaction.id) as Record<string, unknown>
      const evidence = raw.evidence as { downloadUrl?: string } | undefined
      const createdBy = raw.createdBy as { name?: string } | undefined
      const detailed: FeesTransaction = {
        ...transaction,
        title: String(raw.title ?? transaction.title),
        date: String(raw.occurredOn ?? transaction.date).replaceAll('-', '.'),
        description: String(raw.counterparty ?? transaction.description),
        category: String(raw.category ?? transaction.category),
        amount: Number(raw.amount ?? transaction.amount),
        author: String(createdBy?.name ?? transaction.author),
        memo: String(raw.memo ?? ''),
        paymentMethod: String(raw.paymentMethod ?? ''),
        evidenceUrl: evidence?.downloadUrl,
      }
      setDetailError('')
      if (receipt) setReceiptTransaction(detailed)
      else setDetailTransaction(detailed)
    } catch (error) { setDetailError(errorMessage(error)) }
  }

  const deleteExpense = async (transaction: FeesTransaction) => {
    if (!activeOrganization || !window.confirm('이 지출 내역을 삭제할까요?')) return
    try {
      await feesApi.deleteExpense(activeOrganization.organizationId, transaction.id)
      setDetailTransaction(null)
      setReceiptTransaction(null)
      window.dispatchEvent(new Event('dongbang:fees-changed'))
    } catch (error) { setDetailError(errorMessage(error)) }
  }

  return (
    <section className="fees-card">
      <div className="fees-card-head">
        <div>
          <h2>회비 사용 내역</h2>
          <p>
            등록된 증빙은 모든 회원이 확인할 수 있어요.
          </p>
        </div>

        <div className="fees-toolbar">
          <button type="button" onClick={() => {
            if (!activeOrganization) return
            window.location.assign(feesApi.exportLedgerUrl(activeOrganization.organizationId))
          }}>내보내기</button>
        </div>
      </div>

        {detailError && <p role="alert">{detailError}</p>}
        <div className="fees-ledger-scroll">
        <div className="fees-table-wrap">
          <table>
            <thead>
              <tr>
                <th>사용일</th>
                <th>항목</th>
                <th>분류</th>
                <th>금액</th>
                <th>등록자</th>
                <th>증빙</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>

                  <td>
                    <div className="fees-item">
                      <strong>
                        {transaction.title}
                      </strong>
                      <small>
                        {transaction.description}
                      </small>
                    </div>
                  </td>

                  <td>{transaction.category}</td>

                  <td
                    className={
                      transaction.type === 'expense'
                        ? 'is-expense'
                        : 'is-income'
                    }
                  >
                    {transaction.type === 'expense'
                      ? '-'
                      : '+'}
                    {formatMoney(transaction.amount)}
                  </td>

                  <td>{transaction.author}</td>

                  <td>
                    {transaction.type === 'expense' ? (
                      <button
                        type="button"
                        className="fees-proof-link"
                        onClick={() => {
                          void openDetail(transaction, transaction.proofText !== '상세 보기')
                        }}
                      >
                        {transaction.proofText}
                      </button>
                    ) : (
                      <button type="button" className="fees-proof-link" onClick={() => void openDetail(transaction)}>{transaction.proofText}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="fees-scroll-guide">
        스크롤해 전체 사용 내역과 증빙을 확인하세요.
      </p>

    {detailTransaction && (
  <FeesDetailModal
    transaction={detailTransaction}
    onClose={() => setDetailTransaction(null)}
    onEdit={() => { setEditingTransaction(detailTransaction); setDetailTransaction(null) }}
    onDelete={detailTransaction.type === 'expense' ? () => void deleteExpense(detailTransaction) : undefined}
  />
)}

{receiptTransaction && (
  <FeesReceiptModal
    transaction={receiptTransaction}
    onClose={() => setReceiptTransaction(null)}
    onEdit={() => { setEditingTransaction(receiptTransaction); setReceiptTransaction(null) }}
    onDelete={() => void deleteExpense(receiptTransaction)}
  />
)}
{editingTransaction && <LedgerTransactionEditModal transaction={editingTransaction} onClose={() => setEditingTransaction(null)} />}
    </section>
  )
}
