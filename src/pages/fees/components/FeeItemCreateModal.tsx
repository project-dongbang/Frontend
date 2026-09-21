import {
  useMemo,
  useState,
 type ComponentProps,
} from 'react'
import { FeeMemberPickerModal } from './FeeMemberPickerModal'
import { feePaymentMembers } from '../feesMock'

type FeeItemCreateModalProps = {
  onClose: () => void
}

type FeeCategory = {
  id: string
  name: string
  amount: number
  memberIds: string[]
}

const BASE_FEE = 40000

const categoryPalette = [
  '',
  'coral',
  'green',
  'amber',
]

const createInitialCategories = (): FeeCategory[] => {
  const memberIds = feePaymentMembers.map(
    (member) => member.id,
  )

  return [
    {
      id: 'category-normal',
      name: '일반 회비',
      amount: BASE_FEE,
      memberIds: memberIds.slice(0, 58),
    },
    {
      id: 'category-discount',
      name: '할인 회비',
      amount: Math.round(BASE_FEE * 0.75),
      memberIds: memberIds.slice(58, 61),
    },
    {
      id: 'category-support',
      name: '지원 회비',
      amount: Math.round(BASE_FEE * 1.25),
      memberIds: memberIds.slice(61),
    },
  ]
}

export function FeeItemCreateModal({
  onClose,
}: FeeItemCreateModalProps) {
  const [title, setTitle] = useState(
    '2026년 2학기 정기 회비',
  )

  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] =
    useState('')

  const [categories, setCategories] = useState<
    FeeCategory[]
  >(createInitialCategories)

  const [editingCategoryId, setEditingCategoryId] =
    useState<string | null>(null)

  const [error, setError] = useState('')

  const editingCategory = categories.find(
    (category) =>
      category.id === editingCategoryId,
  )

  const selectedMemberIds = useMemo(
    () =>
      new Set(
        categories.flatMap(
          (category) => category.memberIds,
        ),
      ),
    [categories],
  )

  const expectedAmount = useMemo(
    () =>
      categories.reduce(
        (total, category) =>
          total +
          category.amount *
            category.memberIds.length,
        0,
      ),
    [categories],
  )

  const updateCategoryName = (
    categoryId: string,
    name: string,
  ) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              name,
            }
          : category,
      ),
    )
  }

  const updateCategoryAmount = (
    categoryId: string,
    amount: number,
  ) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              amount,
            }
          : category,
      ),
    )
  }

  const removeCategory = (
    categoryId: string,
  ) => {
    setCategories((current) =>
      current.filter(
        (category) =>
          category.id !== categoryId,
      ),
    )
  }

  const addCategory = () => {
    setCategories((current) => [
      ...current,
      {
        id: `category-${Date.now()}`,
        name: '새 회비',
        amount: 0,
        memberIds: [],
      },
    ])
  }

  const saveCategoryMembers = (
    categoryId: string,
    memberIds: string[],
  ) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              memberIds,
            }
          : category,
      ),
    )

    setEditingCategoryId(null)
  }

  const handleSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
  event.preventDefault()

    if (!title.trim() || !dueDate) {
      setError(
        '납부 항목명과 납부 마감일을 입력해 주세요.',
      )
      return
    }

    if (
      categories.some(
        (category) => !category.name.trim(),
      )
    ) {
      setError(
        '카테고리 이름을 입력해 주세요.',
      )
      return
    }

    const payload = {
      title: title.trim(),
      dueDate,
      description: description.trim(),
      categories: categories.map(
        (category) => ({
          name: category.name.trim(),
          amount: category.amount,
          memberIds: category.memberIds,
        }),
      ),
    }

    // TODO:
    // POST /api/v1/organizations/{organizationId}/fee-items
    console.log('납부 항목 등록', payload)

    onClose()
  }

  return (
    <>
      <div
  className="fees-modal-backdrop"
  onMouseDown={onClose}
>
  <form
    className="fee-create-modal"
    onSubmit={handleSubmit}
    onMouseDown={(event) =>
      event.stopPropagation()
    }
  >
          <header className="fee-create-header">
            <div>
              <div className="fees-modal-eyebrow">
                DONG BANG
              </div>

              <h2>납부 항목 등록</h2>
            </div>

            <button
              type="button"
              className="fee-create-close"
              onClick={onClose}
              aria-label="납부 항목 등록 닫기"
            >
              ×
            </button>
          </header>

          <div className="fee-create-body">
            <p className="fee-collection-intro">
              대상 회원을 회비 금액별
              카테고리로 나눌 수 있어요.
              카테고리 이름과 회비 금액을 직접
              입력해 주세요.
            </p>

            <div className="fee-collection-layout">
              <section className="fee-info-section">
                <label className="fee-form-field">
                  납부 항목명

                  <input
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    required
                    maxLength={80}
                    placeholder="예: 2026년 2학기 회비"
                  />
                </label>

                <label className="fee-form-field">
                  납부 마감일

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(
                        event.target.value,
                      )
                    }
                    required
                  />
                </label>

                <label className="fee-form-field">
                  안내 내용

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value,
                      )
                    }
                    rows={4}
                    maxLength={500}
                    placeholder="납부 목적이나 회원에게 전달할 내용을 적어 주세요."
                  />
                </label>
              </section>

              <section className="fee-category-section">
                <h3>
                  납부 금액별 대상 회원
                </h3>

                <p>
                  카테고리 이름, 금액, 대상
                  회원을 각각 설정할 수 있어요.
                </p>

                <div className="fee-category-list">
                  {categories.map(
                    (category, index) => {
                      const selectedMembers =
                        category.memberIds
                          .map((memberId) =>
                            feePaymentMembers.find(
                              (member) =>
                                member.id ===
                                memberId,
                            ),
                          )
                          .filter(
                            (
                              member,
                            ): member is (typeof feePaymentMembers)[number] =>
                              Boolean(member),
                          )

                      const preview =
                        selectedMembers.slice(
                          0,
                          5,
                        )

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
                                    index %
                                      categoryPalette.length
                                  ]
                                }`}
                              />

                              <input
                                className="fee-category-name"
                                value={
                                  category.name
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateCategoryName(
                                    category.id,
                                    event.target
                                      .value,
                                  )
                                }
                                aria-label="회비 카테고리 이름"
                              />

                              <span className="fee-category-actions">
                                <button
                                  type="button"
                                  className="fees-text-btn"
                                  onClick={() =>
                                    setEditingCategoryId(
                                      category.id,
                                    )
                                  }
                                >
                                  수정
                                </button>

                                {categories.length >
                                  1 && (
                                  <button
                                    type="button"
                                    className="fees-text-btn danger-text"
                                    onClick={() =>
                                      removeCategory(
                                        category.id,
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
                                value={
                                  category.amount
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateCategoryAmount(
                                    category.id,
                                    Number(
                                      event.target
                                        .value,
                                    ) || 0,
                                  )
                                }
                              />
                            </label>
                          </header>

                          <div className="fee-category-members">
                            {preview.length >
                            0 ? (
                              <>
                                {preview.map(
                                  (member) => (
                                    <button
                                      type="button"
                                      className="member-chip"
                                      key={
                                        member.id
                                      }
                                      onClick={() =>
                                        setEditingCategoryId(
                                          category.id,
                                        )
                                      }
                                    >
                                      {
                                        member.name
                                      }

                                      <small>
                                        {
                                          member.studentId
                                        }
                                      </small>
                                    </button>
                                  ),
                                )}

                                {selectedMembers.length >
                                  preview.length && (
                                  <button
                                    type="button"
                                    className="member-chip"
                                    onClick={() =>
                                      setEditingCategoryId(
                                        category.id,
                                      )
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
                                  setEditingCategoryId(
                                    category.id,
                                  )
                                }
                              >
                                대상 회원 선택
                              </button>
                            )}
                          </div>
                        </article>
                      )
                    },
                  )}
                </div>

                <button
                  type="button"
                  className="fee-category-add"
                  onClick={addCategory}
                >
                  ＋ 납부 카테고리 추가
                </button>

                <div className="fee-category-summary">
                  <span>
                    선택 인원
                    <strong>
                      {selectedMemberIds.size}명
                    </strong>
                  </span>

                  <span>
                    예상 총 납부액
                    <strong>
                      ₩{' '}
                      {expectedAmount.toLocaleString(
                        'ko-KR',
                      )}
                    </strong>
                  </span>
                </div>
              </section>
            </div>

            {error && (
              <p
                className="fee-create-error"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          <footer className="fee-create-footer">
            <small>
              카테고리별 금액과 대상 회원을
              확인한 뒤 등록해 주세요.
            </small>

            <div>
              <button
                type="submit"
                className="fees-primary-btn"
              >
                회비 등록하기
              </button>
            </div>
          </footer>
        </form>
      </div>

      {editingCategory && (
  <FeeMemberPickerModal
    category={editingCategory}
    onClose={() =>
      setEditingCategoryId(null)
    }
    onSave={(memberIds) =>
      saveCategoryMembers(
        editingCategory.id,
        memberIds,
      )
    }
  />
)}
    </>
  )
}

