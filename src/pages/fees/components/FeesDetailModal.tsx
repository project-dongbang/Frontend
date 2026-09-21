import type { FeesTransaction } from '../feesMock'

type FeesDetailModalProps = {
  transaction: FeesTransaction
  onClose: () => void
}

const formatMoney = (value: number) =>
  `₩${value.toLocaleString('ko-KR')}`

export function FeesDetailModal({
  transaction,
  onClose,
}: FeesDetailModalProps) {
  return (
    <div
      className="fees-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="fees-ledger-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fees-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="fees-ledger-modal-head">
          <div>
            <span className="fees-ledger-modal-eyebrow">
              DONG BANG
            </span>

            <h2 id="fees-detail-title">
              {transaction.type === 'income'
                ? '입금 내역 상세'
                : '사용 내역 상세'}
            </h2>
          </div>

          <button
            type="button"
            className="fees-ledger-modal-close"
            aria-label="닫기"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="fees-ledger-detail-body">
          <dl className="fees-ledger-detail-list">
            <div>
              <dt>
                {transaction.type === 'income'
                  ? '입금일'
                  : '사용일'}
              </dt>
              <dd>{transaction.date}</dd>
            </div>

            <div>
              <dt>
                {transaction.type === 'income'
                  ? '입금 항목'
                  : '사용 항목'}
              </dt>
              <dd>{transaction.title}</dd>
            </div>

            <div>
              <dt>분류</dt>
              <dd>{transaction.category}</dd>
            </div>

            <div>
              <dt>등록자</dt>
              <dd>{transaction.author}</dd>
            </div>

            <div className="fees-ledger-detail-amount">
              <dt>
                {transaction.type === 'income'
                  ? '입금액'
                  : '사용 금액'}
              </dt>

              <dd
                className={
                  transaction.type === 'income'
                    ? 'is-income'
                    : 'is-expense'
                }
              >
                {transaction.type === 'income'
                  ? '+'
                  : '-'}
                {formatMoney(transaction.amount)}
              </dd>
            </div>
          </dl>

          {transaction.description && (
            <div className="fees-ledger-detail-note">
              <span>메모</span>
              <p>{transaction.description}</p>
            </div>
          )}
        </div>

        <footer className="fees-ledger-modal-footer">
          <button
            type="button"
            className="fees-ledger-close-button"
            onClick={onClose}
          >
            닫기
          </button>
        </footer>
      </div>
    </div>
  )
}