import { useState, type FormEvent } from 'react'
import { feesApi } from '../../../api/services'
import { errorMessage } from '../../../api/client'
import { useSession } from '../../../context/SessionContext'

type IncomeCreateModalProps = {
  onClose: () => void
}

export function IncomeCreateModal({
  onClose,
}: IncomeCreateModalProps) {
  const { activeOrganization } = useSession()
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [amount, setAmount] = useState('')
  const getToday = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 10)
}

const [receivedOn, setReceivedOn] =
  useState(getToday)
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const numericAmount = Number(amount)

    if (!title.trim() || !source.trim()) {
      setError('입금 항목과 입금처를 입력해 주세요.')
      return
    }

    if (
      !Number.isSafeInteger(numericAmount) ||
      numericAmount < 1
    ) {
      setError('입금액을 올바르게 입력해 주세요.')
      return
    }

    if (!receivedOn) {
      setError('입금일을 입력해 주세요.')
      return
    }

    const payload = {
      title: title.trim(),
      counterparty: source.trim(),
      amount: numericAmount,
      occurredOn: receivedOn,
      memo: memo.trim(),
    }
    if (!activeOrganization) { setError('동아리를 먼저 선택해 주세요.'); return }
    try {
      await feesApi.createIncome(activeOrganization.organizationId, payload)
      window.dispatchEvent(new Event('dongbang:fees-changed'))
      onClose()
    } catch (requestError) { setError(errorMessage(requestError)) }
  }

  return (
    <div
      className="fees-modal-backdrop"
      onMouseDown={onClose}
    >
      <section
        className="income-create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="income-create-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="income-create-header">
          <div>
            <div className="fees-modal-eyebrow">
              DONG BANG
            </div>

            <h2 id="income-create-title">
              입금 내역 등록
            </h2>
          </div>

          <button
            type="button"
            className="income-create-close"
            onClick={onClose}
            aria-label="입금 내역 등록 닫기"
          >
            ×
          </button>
        </header>

        <form
          className="income-create-form"
          onSubmit={handleSubmit}
        >
          <div className="income-create-body">
            <label className="income-form-field">
              <span>입금 항목</span>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                maxLength={80}
                placeholder="예: 교내 활동 지원금"
                required
              />
            </label>

            <div className="income-field-grid">
              <label className="income-form-field">
                <span>입금처</span>

                <input
                  type="text"
                  value={source}
                  onChange={(event) =>
                    setSource(event.target.value)
                  }
                  maxLength={80}
                  placeholder="예: 학생지원팀"
                  required
                />
              </label>

              <label className="income-form-field">
                <span>입금액</span>

                <input
                  type="number"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  min={1}
                  step={1}
                  placeholder="0"
                  required
                />
              </label>
            </div>

            <label className="income-form-field">
              <span>입금일</span>

              <input
                type="date"
                value={receivedOn}
                onChange={(event) =>
                  setReceivedOn(event.target.value)
                }
                required
              />
            </label>

            <label className="income-form-field">
              <span>메모</span>

              <textarea
                value={memo}
                onChange={(event) =>
                  setMemo(event.target.value)
                }
                maxLength={300}
                rows={4}
                placeholder="지원금, 상금 등 입금 사유"
              />
            </label>

            {error && (
              <p
                className="income-create-error"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="income-submit-button"
            >
              입금 내역 저장
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
