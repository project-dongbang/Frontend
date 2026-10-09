import { useMemo, useState } from 'react'

import type { FeeCategory, FeePaymentMember } from '../feesMock'

type FeeMemberPickerModalProps = {
  category: FeeCategory
  onClose: () => void
  onSave: (memberIds: string[]) => void
  members?: FeePaymentMember[]
}

export function FeeMemberPickerModal({
  category,
  onClose,
  onSave,
  members = [],
}: FeeMemberPickerModalProps) {
  const [selectedIds, setSelectedIds] =
    useState<string[]>(category.memberIds)

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }, [members])

  const toggleMember = (memberId: string) => {
    setSelectedIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    )
  }

  const selectAll = () => {
    setSelectedIds(
      members.map((member) => member.id),
    )
  }

  const clearAll = () => {
    setSelectedIds([])
  }

  return (
    <div
      className="fees-picker-backdrop"
      onMouseDown={onClose}
    >
      <section
        className="fees-category-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-picker-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="fees-picker-head">
          <div>
            <div className="fees-modal-eyebrow">
              DONG BANG
            </div>

            <h2 id="category-picker-title">
              {category.name} 대상 회원
            </h2>
          </div>

          <button
            type="button"
            className="fee-create-close"
            onClick={onClose}
            aria-label="대상 회원 선택 닫기"
          >
            ×
          </button>
        </header>

        <div className="fees-picker-body">
          <div className="category-picker-head">
            <p>
              이 카테고리에 적용할 회원을 선택하세요.
            </p>

            <div className="category-picker-actions">
              <button
                type="button"
                className="fees-secondary-btn"
                onClick={selectAll}
              >
                전체 선택
              </button>

              <button
                type="button"
                className="fees-secondary-btn"
                onClick={clearAll}
              >
                전체 해제
              </button>
            </div>
          </div>

          <div className="fee-target-list">
            {sortedMembers.map((member) => {
              const checked =
                selectedIds.includes(member.id)

              return (
                <label
                  className={`fee-target-member ${
                    checked ? 'is-selected' : ''
                  }`}
                  key={member.id}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleMember(member.id)
                    }
                  />

                  <i className="fee-target-avatar">
                    {member.name[0]}
                  </i>

                  <span className="fee-target-copy">
                    <strong>
                      {member.name}
                    </strong>

                    <small>
                      {member.studentId}
                      {' · '}
                      {member.generation}
                    </small>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <footer className="fees-picker-footer">
          <button
            type="button"
            className="fees-primary-btn"
            onClick={() => onSave(selectedIds)}
          >
            선택 완료
          </button>
        </footer>
      </section>
    </div>
  )
}
