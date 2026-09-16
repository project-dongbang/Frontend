import { useState } from 'react'
import { FeesDetailModal } from './FeesDetailModal'
import { FeesReceiptModal } from './FeesReceiptModal'
import type { FeesTransaction } from '../feesMock'

type FeesLedgerProps = {
  transactions: FeesTransaction[]
}

const formatMoney = (value: number) =>
  `₩ ${value.toLocaleString('ko-KR')}`

export function FeesLedger({
  transactions,
}: FeesLedgerProps) {
  const [detailTransaction, setDetailTransaction] =
    useState<FeesTransaction | null>(null)

  const [receiptTransaction, setReceiptTransaction] =
    useState<FeesTransaction | null>(null)

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
          <button type="button">전체 내역</button>
          <button type="button">내보내기</button>
        </div>
      </div>

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
                          if (
                            transaction.proofText ===
                            '상세 보기'
                          ) {
                            setDetailTransaction(
                              transaction,
                            )
                          } else {
                            setReceiptTransaction(
                              transaction,
                            )
                          }
                        }}
                      >
                        {transaction.proofText}
                      </button>
                    ) : (
                      <span className="fees-proof-info">
                        {transaction.proofText}
                      </span>
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
  />
)}

{receiptTransaction && (
  <FeesReceiptModal
    transaction={receiptTransaction}
    onClose={() => setReceiptTransaction(null)}
  />
)}
    </section>
  )
}