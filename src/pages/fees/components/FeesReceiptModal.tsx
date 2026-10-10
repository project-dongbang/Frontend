import type { FeesTransaction } from '../feesMock'

type FeesReceiptModalProps = {
  transaction: FeesTransaction
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const formatMoney = (value: number) =>
  `₩ ${value.toLocaleString('ko-KR')}`

export function FeesReceiptModal({
  transaction,
  onClose,
  onEdit,
  onDelete,
}: FeesReceiptModalProps) {
  return (
    <div
      className="fees-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="fees-receipt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fees-receipt-title"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="fees-receipt-header">
          <div className="fees-receipt-title-group">
            <span>RECEIPT DETAIL</span>

            <h2 id="fees-receipt-title">
              {transaction.title}
            </h2>

            <p>
              {transaction.date} · {transaction.description}
            </p>
          </div>

          <button
            type="button"
            className="fees-receipt-x"
            aria-label="닫기"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {/* Content */}
        <div className="fees-receipt-content">
          {/* 왼쪽 */}
          <aside className="fees-expense-summary">
            <div className="fees-receipt-amount-card">
              <span>결제 금액</span>

              <strong>
                {formatMoney(transaction.amount)}
              </strong>

              <small>{transaction.category}</small>
            </div>

            <div className="fees-receipt-metadata">
              <div>
                <span>사용일</span>
                <strong>{transaction.date}</strong>
              </div>

              <div>
                <span>사용처</span>
                <strong>
                  {transaction.description}
                </strong>
              </div>

              <div>
                <span>분류</span>
                <strong>
                  {transaction.category}
                </strong>
              </div>

              <div>
                <span>등록자</span>
                <strong>
                  {transaction.author}
                </strong>
              </div>
            </div>

            <div className="fees-receipt-purpose">
              <span>사용 내역</span>

              <p>{transaction.title}</p>
            </div>

            <div className="fees-receipt-attachment">
              <span>증빙</span>

              <strong>
                {transaction.proofText}
              </strong>

              {transaction.evidenceUrl ? <a href={transaction.evidenceUrl} target="_blank" rel="noreferrer">증빙 파일 열기</a> : <small>아직 등록된 증빙 파일이 없어요.</small>}
            </div>

            <div className="fees-receipt-privacy">
              <span>●</span>

              <strong>
                등록된 증빙은 모든 회원이 확인할 수 있어요.
              </strong>
            </div>
          </aside>

          {/* 오른쪽 */}
          <section className="fees-receipt-preview">
            <div className="fees-preview-label">
              <strong>영수증 미리보기</strong>
              <span>등록된 증빙</span>
            </div>

            <div className="fees-receipt-paper">
              {transaction.evidenceUrl ? <a href={transaction.evidenceUrl} target="_blank" rel="noreferrer">실제 영수증 파일 보기 ↗</a> : <p>영수증 파일을 열 수 없어요. 운영진에게 문의해 주세요.</p>}
              {transaction.memo && <><div className="fees-receipt-divider" /><p>{transaction.memo}</p></>}
            </div>

            <p className="fees-preview-caption">
              등록된 영수증 증빙 자료입니다.
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="fees-receipt-footer">
          <div>
            <strong>
              동아리 회원 공개 내역
            </strong>

            <span>
              등록된 지출 정보와 증빙을 함께 공개합니다.
            </span>
          </div>

          <div className="fees-receipt-actions">
            {onEdit && <button type="button" onClick={onEdit}>수정</button>}
            {onDelete && <button type="button" onClick={onDelete}>삭제</button>}
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            닫기
          </button>
        </footer>
      </div>
    </div>
  )
}
