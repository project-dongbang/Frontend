import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react'
import receiptIcon from '../../../assets/receipt.svg'
type ExpenseCreateModalProps = {
  onClose: () => void
}

const MAX_RECEIPT_SIZE = 3 * 1024 * 1024

const getToday = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 10)
}

export function ExpenseCreateModal({
  onClose,
}: ExpenseCreateModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [receipt, setReceipt] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [spentOn, setSpentOn] = useState(getToday)
  const [amount, setAmount] = useState('')
  const [merchant, setMerchant] = useState('')
  const [category, setCategory] = useState('')
  const [paymentMethod, setPaymentMethod] =
    useState('동아리 카드')
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')

  const handleReceipt = (file: File) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError(
        'JPG, PNG, WEBP 형식의 파일만 첨부할 수 있어요.',
      )
      return
    }

    if (file.size > MAX_RECEIPT_SIZE) {
      setError('영수증은 최대 3MB까지 첨부할 수 있어요.')
      return
    }

    setReceipt(file)
    setError('')
  }

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (file) {
      handleReceipt(file)
    }
  }

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault()

    const file = event.dataTransfer.files?.[0]

    if (file) {
      handleReceipt(file)
    }
  }

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const numericAmount = Number(amount)

    if (!receipt) {
      setError('영수증을 첨부해 주세요.')
      return
    }

    if (
      !title.trim() ||
      !merchant.trim() ||
      !category
    ) {
      setError(
        '필수 입력 항목을 모두 입력해 주세요.',
      )
      return
    }

    if (
      !Number.isSafeInteger(numericAmount) ||
      numericAmount < 1
    ) {
      setError('금액을 올바르게 입력해 주세요.')
      return
    }

    const payload = {
      title: title.trim(),
      spentOn,
      amount: numericAmount,
      merchant: merchant.trim(),
      category,
      paymentMethod,
      memo: memo.trim(),
      receipt,
    }

    // TODO:
    // POST /api/v1/organizations/{organizationId}/ledger/expenses
    console.log('출금 내역 등록', payload)

    onClose()
  }

  return (
    <div
      className="fees-modal-backdrop"
      onMouseDown={onClose}
    >
      <form
        className="expense-create-modal"
        onSubmit={handleSubmit}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="expense-create-header">
          <div>
            <h2>회비 사용 내역 등록</h2>
            <p>
              영수증을 첨부하고 실제 사용한 내용을
              확인해 주세요.
            </p>
          </div>

          <button
            type="button"
            className="expense-create-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </header>

        <div className="expense-create-body">
          <div className="expense-create-layout">
            {/* 왼쪽 */}
            <section className="expense-receipt-section">
              <h3>
                01 · 영수증 첨부
                <em>필수</em>
              </h3>

              <div
                className="expense-receipt-drop"
                onDragOver={(event) =>
                  event.preventDefault()
                }
                onDrop={handleDrop}
              >
                <div className="expense-receipt-icon">
                  <img
                    src={receiptIcon}
                    alt=""
                    aria-hidden="true"
                  />
                </div>

                <strong>
                  영수증 사진을 올려 주세요
                </strong>

                <p>
                  사진을 끌어 놓거나 파일을 선택하세요.
                  <br />
                  JPG · PNG · WEBP / 최대 3MB
                </p>

                <div className="expense-file-row">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    파일 선택
                  </button>

                  <span>
                    {receipt
                      ? receipt.name
                      : '선택된 파일 없음'}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  hidden
                />
              </div>

              <p className="expense-helper">
                영수증과 작성 내용을 확인한 뒤 등록해
                주세요.
              </p>

              <div className="expense-ai-box">
                <button type="button" disabled>
                  AI 자동 입력
                </button>

                <span>추후 제공</span>
              </div>

              <p className="expense-helper">
                영수증을 보면서 사용 내용을 작성하세요.
                등록 전 금액과 날짜를 확인해 주세요.
              </p>
            </section>

            {/* 오른쪽 */}
            <section className="expense-info-section">
              <h3>02 · 사용 내용 확인</h3>

              <label className="expense-form-field">
                <span>
                  사용 항목
                  <em>필수</em>
                </span>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="예: 개강 총회 간식"
                  maxLength={80}
                />
              </label>

              <div className="expense-field-grid">
                <label className="expense-form-field">
                  <span>
                    사용일
                    <em>필수</em>
                  </span>

                  <input
                    type="date"
                    value={spentOn}
                    onChange={(event) =>
                      setSpentOn(event.target.value)
                    }
                  />
                </label>

                <label className="expense-form-field">
                  <span>
                    금액 (원)
                    <em>필수</em>
                  </span>

                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="0"
                  />
                </label>
              </div>

              <label className="expense-form-field">
                <span>
                  사용처
                  <em>필수</em>
                </span>

                <input
                  value={merchant}
                  onChange={(event) =>
                    setMerchant(event.target.value)
                  }
                  placeholder="예: 동아리마트 역곡점"
                  maxLength={80}
                />
              </label>

              <div className="expense-field-grid">
                <label className="expense-form-field">
                  <span>
                    분류
                    <em>필수</em>
                  </span>

                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                  >
                    <option value="">
                      선택해 주세요
                    </option>
                    <option value="행사 운영">
                      행사 운영
                    </option>
                    <option value="공간 대관">
                      공간 대관
                    </option>
                    <option value="운영비">
                      운영비
                    </option>
                    <option value="물품 구매">
                      물품 구매
                    </option>
                    <option value="홍보비">
                      홍보비
                    </option>
                    <option value="기타">
                      기타
                    </option>
                  </select>
                </label>

                <label className="expense-form-field">
                  <span>결제 수단</span>

                  <select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value,
                      )
                    }
                  >
                    <option value="동아리 카드">
                      동아리 카드
                    </option>
                    <option value="계좌이체">
                      계좌이체
                    </option>
                    <option value="현금">
                      현금
                    </option>
                    <option value="기타">
                      기타
                    </option>
                  </select>
                </label>
              </div>

              <label className="expense-form-field">
                <span>사용 목적 · 메모</span>

                <textarea
                  value={memo}
                  onChange={(event) =>
                    setMemo(event.target.value)
                  }
                  rows={4}
                  maxLength={300}
                  placeholder="구매 목적이나 정산할 내용을 남겨 주세요."
                />
              </label>

              <p className="expense-register-note">
                등록자: 김동방 · 운영진 / 영수증의 민감한
                정보는 가려 주세요.
              </p>
            </section>
          </div>

          <p className="expense-public-note">
            등록한 사용 내역과 영수증은 동아리 회원에게
            공개됩니다.
          </p>

          {error && (
            <p className="expense-create-error">
              {error}
            </p>
          )}
        </div>

        <footer className="expense-create-footer">
          <small>
            등록하면 사용 내역과 잔여금에 반영돼요.
          </small>

          <div>

            <button
              type="submit"
              className="fees-primary-btn"
            >
              사용 내역 등록하기
            </button>
          </div>
        </footer>
      </form>
    </div>
  )
}