import {
  useMemo,
  useState,
  type ComponentProps,
} from 'react'

import {
  type FeeCategory,
  type FeeCollection,
  type FeeCollectionDraft,
  type FeePaymentMember,
} from '../feesMock'
import { FeeMemberPickerModal } from './FeeMemberPickerModal'
import { errorMessage } from '../../../api/client'
import { createInitialFeeCategories, summarizeFeeCategories } from '../feeItemDraft'

type FeeItemModalProps = {
  collection?: FeeCollection
  onClose: () => void
  onSave: (collection: FeeCollectionDraft) => Promise<void> | void
  onDelete?: () => void
  members?: FeePaymentMember[]
}

const categoryPalette = ['', 'coral', 'green', 'amber']

const toDateInputValue = (date: string) =>
  date.replaceAll('.', '-')

export function FeeItemModal({
  collection,
  onClose,
  onSave,
  onDelete,
  members = [],
}: FeeItemModalProps) {
  const isEditing = Boolean(collection)
  const [title, setTitle] = useState(
    collection?.title ?? '',
  )
  const [dueDate, setDueDate] = useState(
    collection ? toDateInputValue(collection.dueDate) : '',
  )
  const [description, setDescription] = useState(
    collection?.description ?? '',
  )
  const [bank, setBank] = useState(
    collection?.bank ?? '',
  )
  const [accountNumber, setAccountNumber] = useState(
    collection?.accountNumber ?? '',
  )
  const [accountHolder, setAccountHolder] = useState(
    collection?.accountHolder ?? '',
  )
  const [categories, setCategories] = useState<
    FeeCategory[]
  >(() =>
    collection
      ? collection.categories.map((category) => ({
          ...category,
          memberIds: [...category.memberIds],
        }))
      : createInitialFeeCategories(),
  )
  const [editingCategoryId, setEditingCategoryId] =
    useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] =
    useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const editingCategory = categories.find(
    (category) => category.id === editingCategoryId,
  )
  const { selectedMemberCount, expectedAmount } = useMemo(
    () => summarizeFeeCategories(categories),
    [categories],
  )

  const updateCategory = (
    categoryId: string,
    patch: Partial<FeeCategory>,
  ) => {
    setError('')
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? { ...category, ...patch }
          : category,
      ),
    )
  }

  const saveCategoryMembers = (
    categoryId: string,
    memberIds: string[],
  ) => {
    setError('')
    const selectedIds = new Set(memberIds)

    setCategories((current) =>
      current.map((category) => {
        if (category.id === categoryId) {
          return { ...category, memberIds }
        }

        return {
          ...category,
          memberIds: category.memberIds.filter(
            (memberId) => !selectedIds.has(memberId),
          ),
        }
      }),
    )
    setEditingCategoryId(null)
  }

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = async (
    event,
  ) => {
    event.preventDefault()

    if (!title.trim()) {
      setError('납부 항목명을 입력해 주세요.')
      return
    }
    if (!dueDate) {
      setError('납부 마감일을 입력해 주세요.')
      return
    }

    if (
      !bank.trim() ||
      !accountNumber.trim() ||
      !accountHolder.trim()
    ) {
      setError('납부 계좌 정보를 모두 입력해 주세요.')
      return
    }
    if (!/^[0-9-]+$/.test(accountNumber.trim())) {
      setError('계좌번호는 숫자와 하이픈(-)만 입력해 주세요.')
      return
    }

    for (const [index, category] of categories.entries()) {
      if (!category.name.trim()) {
        setError(`${index + 1}번째 카테고리 이름을 입력해 주세요.`)
        return
      }
      if (category.amount <= 0) {
        setError(`${category.name} 카테고리의 납부 금액을 입력해 주세요.`)
        return
      }
      if (!Number.isInteger(category.amount) || category.amount > 10000000) {
        setError(`${category.name} 카테고리의 납부 금액은 1원부터 1,000만 원까지 입력해 주세요.`)
        return
      }
      if (category.memberIds.length === 0) {
        setError(`${category.name} 카테고리의 대상 회원을 선택해 주세요.`)
        return
      }
    }

    setSubmitting(true)
    setError('')
    try {
      await onSave({
        title: title.trim(),
        dueDate: dueDate.replaceAll('-', '.'),
        description: description.trim(),
        bank: bank.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        categories: categories.map((category) => ({
          ...category,
          name: category.name.trim(),
          memberIds: [...category.memberIds],
        })),
      })
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div
        className="fees-modal-backdrop"
        onMouseDown={onClose}
      >
        <form
          className="fee-create-modal"
          noValidate
          role="dialog"
          aria-modal="true"
          aria-labelledby="fee-item-modal-title"
          onSubmit={handleSubmit}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="fee-create-header">
            <div>
              <div className="fees-modal-eyebrow">
                DONG BANG
              </div>
              <h2 id="fee-item-modal-title">
                {isEditing
                  ? '납부 항목 수정'
                  : '납부 항목 등록'}
              </h2>
            </div>

            <button
              type="button"
              className="fee-create-close"
              onClick={onClose}
              aria-label={`납부 항목 ${
                isEditing ? '수정' : '등록'
              } 닫기`}
            >
              ×
            </button>
          </header>

          <div className="fee-create-body">
            <p className="fee-collection-intro">
              대상 회원을 납부 금액별 카테고리로 나눌 수
              있어요. 카테고리 이름과 납부 금액을 직접
              입력해 주세요.
            </p>

            <div className="fee-collection-layout">
              <section className="fee-info-section">
                <label className="fee-form-field">
                  납부 항목명
                  <input
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value)
                      setError('')
                    }}
                    required
                    maxLength={80}
                    placeholder="예: 2026년 2학기 정기 납부"
                  />
                </label>

                <label className="fee-form-field">
                  납부 마감일
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => {
                      setDueDate(event.target.value)
                      setError('')
                    }}
                    required
                  />
                </label>

                <label className="fee-form-field">
                  안내 내용
                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    rows={4}
                    maxLength={500}
                    placeholder="납부 목적이나 회원에게 전달할 내용을 적어 주세요."
                  />
                </label>

                <div className="fee-account-fields">
                  <label className="fee-form-field">
                    은행명
                    <input
                      value={bank}
                      onChange={(event) => {
                        setBank(event.target.value)
                        setError('')
                      }}
                      required
                      placeholder="예: 카카오뱅크"
                    />
                  </label>
                  <label className="fee-form-field">
                    계좌번호
                    <input
                      value={accountNumber}
                      onChange={(event) => {
                        setAccountNumber(event.target.value)
                        setError('')
                      }}
                      required
                      inputMode="numeric"
                      placeholder="계좌번호 입력"
                    />
                  </label>
                  <label className="fee-form-field">
                    예금주
                    <input
                      value={accountHolder}
                      onChange={(event) => {
                        setAccountHolder(event.target.value)
                        setError('')
                      }}
                      required
                      placeholder="예금주 입력"
                    />
                  </label>
                </div>
              </section>

              <section className="fee-category-section">
                <h3>납부 금액별 대상 회원</h3>
                <p>
                  카테고리 이름, 금액, 대상 회원을 각각
                  설정할 수 있어요.
                </p>

                <div className="fee-category-list">
                  {categories.map((category, index) => {
                    const selectedMembers = category.memberIds
                      .map((memberId) =>
                        members.find(
                          (member) => member.id === memberId,
                        ),
                      )
                      .filter(
                        (
                          member,
                        ): member is FeePaymentMember =>
                          Boolean(member),
                      )
                    const preview = selectedMembers.slice(0, 5)

                    return (
                      <article
                        key={category.id}
                        className="fee-category-card"
                      >
                        <header>
                          <div>
                            <i
                              className={`fee-category-dot ${
                                categoryPalette[
                                  index % categoryPalette.length
                                ]
                              }`}
                            />
                            <label className={`fee-category-name-field${category.name.trim() ? '' : ' is-empty'}`}>
                              <span>카테고리 이름 <em>필수</em></span>
                              <input
                                className="fee-category-name"
                                value={category.name}
                                placeholder="예: 정기 회비"
                                maxLength={100}
                                required
                                onChange={(event) =>
                                  updateCategory(category.id, {
                                    name: event.target.value,
                                  })
                                }
                              />
                            </label>
                            <span className="fee-category-actions">
                              <button
                                type="button"
                                className="fees-text-btn"
                                onClick={() =>
                                  setEditingCategoryId(category.id)
                                }
                              >
                                {selectedMembers.length ? '회원 변경' : '회원 선택'}
                              </button>
                              {categories.length > 1 && (
                                <button
                                  type="button"
                                  className="fees-text-btn danger-text"
                                  onClick={() =>
                                    setCategories((current) =>
                                      current.filter(
                                        (item) =>
                                          item.id !== category.id,
                                      ),
                                    )
                                  }
                                >
                                  삭제
                                </button>
                              )}
                            </span>
                          </div>

                          <label className="fee-category-amount">
                            ₩
                            <input
                              type="number"
                              min={0}
                              max={10000000}
                              step={1}
                              value={category.amount || ''}
                              placeholder="0"
                              onChange={(event) =>
                                updateCategory(category.id, {
                                  amount:
                                    Number(event.target.value) || 0,
                                })
                              }
                              aria-label={`${category.name} 납부 금액`}
                            />
                          </label>
                        </header>

                        <div className="fee-category-members">
                          {preview.length > 0 ? (
                            <>
                              {preview.map((member) => (
                                <button
                                  type="button"
                                  className="member-chip"
                                  key={member.id}
                                  onClick={() =>
                                    setEditingCategoryId(category.id)
                                  }
                                >
                                  {member.name}
                                  <small>{member.studentId}</small>
                                </button>
                              ))}
                              {selectedMembers.length >
                                preview.length && (
                                <button
                                  type="button"
                                  className="member-chip"
                                  onClick={() =>
                                    setEditingCategoryId(category.id)
                                  }
                                >
                                  +
                                  {selectedMembers.length -
                                    preview.length}
                                  명
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              type="button"
                              className="member-chip empty"
                              onClick={() =>
                                setEditingCategoryId(category.id)
                              }
                            >
                              대상 회원 선택
                            </button>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>

                <button
                  type="button"
                  className="fee-category-add"
                  onClick={() =>
                    setCategories((current) => [
                      ...current,
                      {
                        id: `category-${Date.now()}`,
                        name: '새 납부',
                        amount: 0,
                        memberIds: [],
                      },
                    ])
                  }
                >
                  ＋ 납부 카테고리 추가
                </button>

                <div className="fee-category-summary">
                  <span>
                    선택 인원
                    <strong>{selectedMemberCount}명</strong>
                  </span>
                  <span>
                    예상 총 납부액
                    <strong>
                      ₩ {expectedAmount.toLocaleString('ko-KR')}
                    </strong>
                  </span>
                </div>
              </section>
            </div>

          </div>

          <footer className={`fee-create-footer${error ? ' has-error' : ''}`}>
            <div className="fee-create-footer-message">
              {error ? <p className="fee-create-error" role="alert">{error}</p> : <small>
                {isEditing
                  ? '변경 내용을 확인한 뒤 저장해 주세요. 삭제한 납부 항목은 복구할 수 없습니다.'
                  : '카테고리별 금액과 대상 회원을 확인한 뒤 등록해 주세요.'}
              </small>}
            </div>

            <div className="fee-create-footer-actions">
              {isEditing && onDelete && (
                <button
                  type="button"
                  className="fee-delete-button"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  항목 삭제
                </button>
              )}
              <button type="submit" className="fees-primary-btn" disabled={submitting}>
                {submitting ? '저장 중…' : isEditing ? '변경 사항 저장' : '회비 등록하기'}
              </button>
            </div>
          </footer>
        </form>
      </div>

      {editingCategory && (
        <FeeMemberPickerModal
          category={editingCategory}
          members={members}
          onClose={() => setEditingCategoryId(null)}
          onSave={(memberIds) =>
            saveCategoryMembers(editingCategory.id, memberIds)
          }
        />
      )}

      {deleteConfirmOpen && onDelete && (
        <div
          className="fee-delete-confirm-backdrop"
          onMouseDown={() => setDeleteConfirmOpen(false)}
        >
          <section
            className="fee-delete-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="fee-delete-confirm-title"
            aria-describedby="fee-delete-confirm-description"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="fees-modal-eyebrow">DONG BANG</span>
            <h2 id="fee-delete-confirm-title">
              납부 항목을 삭제할까요?
            </h2>
            <p id="fee-delete-confirm-description">
              {collection?.title} 항목과 설정한 카테고리 정보가
              삭제되며 복구할 수 없습니다.
            </p>
            <div>
              <button
                type="button"
                className="fees-secondary-btn"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="fee-delete-confirm-button"
                onClick={onDelete}
              >
                삭제하기
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
