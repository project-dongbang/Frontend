type FeesSummaryProps = {
  balance: number
  semesterExpense: number
  paidCount: number
  totalCount: number
}

const formatMoney = (value: number) =>
  `₩ ${value.toLocaleString('ko-KR')}`

export function FeesSummary({
  balance,
  semesterExpense,
  paidCount,
  totalCount,
}: FeesSummaryProps) {
  const paymentRate = totalCount
    ? ((paidCount / totalCount) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="fees-summary">
      <div className="fees-money-card">
        <span>현재 잔여금</span>
        <strong>{formatMoney(balance)}</strong>
        <small>회원 전체 공개</small>
      </div>

      <div className="fees-money-card is-coral">
        <span>이번 학기 사용</span>
        <strong>{formatMoney(semesterExpense)}</strong>
        <small>사용 내역 14건</small>
      </div>

      <div className="fees-money-card is-light">
        <span>회비 납부</span>
        <strong>
          {paidCount} / {totalCount}명
        </strong>
        <small>납부율 {paymentRate}%</small>
      </div>
    </div>
  )
}