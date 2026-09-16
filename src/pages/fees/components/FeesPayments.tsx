import { useMemo, useState } from 'react'
import type {
  FeeCollection,
  FeePaymentMember,
  FeePaymentStatus,
} from '../feesMock'

type FeesPaymentsProps = {
  collections: FeeCollection[]
  members: FeePaymentMember[]
  onPaymentStatusChange: (
    collectionId: string,
    memberId: string,
    status: FeePaymentStatus,
  ) => void
  onExport: (collectionId: string) => void
}

type PaymentFilter = 'all' | FeePaymentStatus

const formatMoney = (value: number) =>
  `₩ ${value.toLocaleString('ko-KR')}`

export function FeesPayments({
  collections,
  members,
  onPaymentStatusChange,
  onExport,
}: FeesPaymentsProps) {
  const [selectedCollectionId, setSelectedCollectionId] =
    useState(collections[0]?.id ?? '')

  const [filter, setFilter] =
    useState<PaymentFilter>('all')

  const selectedCollection = collections.find(
    (collection) => collection.id === selectedCollectionId,
  )

  const filteredMembers = useMemo(() => {
    if (filter === 'all') {
      return members
    }

    return members.filter(
      (member) => member.status === filter,
    )
  }, [filter, members])

  const paidCount = members.filter(
    (member) => member.status === 'paid',
  ).length

  if (!selectedCollection) {
    return (
      <section className="fees-card fees-placeholder">
        등록된 회비가 없습니다.
      </section>
    )
  }

  return (
  <section className="fees-card">
    <div className="fees-card-head">
      <div>
        <h2>멤버별 납부 현황</h2>
        <p>
          {selectedCollection.dueDate} 마감 · {paidCount}/
          {members.length}명 완료 · {selectedCollection.bank}{' '}
          {selectedCollection.accountNumber}{' '}
          {selectedCollection.accountHolder}
        </p>
      </div>

      <div className="fees-toolbar fee-context">
        <select
          className="filter-select"
          aria-label="회비 선택"
          value={selectedCollectionId}
          onChange={(event) =>
            setSelectedCollectionId(event.target.value)
          }
        >
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.title}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          aria-label="납부 상태 필터"
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value as PaymentFilter)
          }
        >
          <option value="all">전체 상태</option>
          <option value="unpaid">미납</option>
          <option value="paid">납부 완료</option>
        </select>

        <button
          type="button"
          className="fees-secondary-btn"
          onClick={() => onExport(selectedCollection.id)}
        >
          내보내기
        </button>
      </div>
    </div>

    <div className="fees-table-wrap fees-payment-scroll">
      <table>
        <thead>
          <tr>
            <th>멤버</th>
            <th>기수</th>
            <th>납부 금액</th>
            <th>납부 상태</th>
            <th>바로 처리</th>
          </tr>
        </thead>

        <tbody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => {
              const isPaid = member.status === 'paid'

              return (
                <tr key={member.id}>
                  <td>
                    <strong>{member.name}</strong>
                    <br />
                    <small>{member.studentId}</small>
                  </td>

                  <td>{member.generation}</td>

                  <td>
                    {formatMoney(member.amount)}
                  </td>

                  <td>
                    <span
                      className={`fees-status ${
                        isPaid ? '' : 'pending'
                      }`}
                    >
                      {isPaid ? '납부 완료' : '미납'}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className={`payment-toggle ${
                        isPaid ? 'paid' : ''
                      }`}
                      onClick={() =>
                        onPaymentStatusChange(
                          selectedCollection.id,
                          member.id,
                          isPaid ? 'unpaid' : 'paid',
                        )
                      }
                    >
                      {isPaid
                        ? '미납으로 변경'
                        : '납부 완료'}
                    </button>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={5} className="fees-empty">
                해당 상태의 멤버가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <p className="fees-payment-scroll-guide">
        스크롤해 전체 멤버의 납부 현황을 확인하세요.
      </p>
  </section>
)
}