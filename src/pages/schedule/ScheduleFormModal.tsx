import { Button, Textarea } from '../../components/common'
import type { CalendarItem } from './scheduleMock'
import { useScheduleForm } from './useScheduleForm'
import { ScheduleBasicFields } from './ScheduleBasicFields'
import { ScheduleEventFields } from './ScheduleEventFields'

type ScheduleFormModalProps = {
  open: boolean
  onClose: () => void
  item?: CalendarItem | null
}

export function ScheduleFormModal({
  open,
  onClose,
  item = null,
}: ScheduleFormModalProps) {
  const {
    values,
    error,
    isEvent,
    isEdit,
    updateField,
    handleSubmit,
  } = useScheduleForm(item, onClose)

  if (!open) return null

  return (
    <div
  className={`schedule-modal-backdrop ${
    item ? 'nested' : ''
  }`}
  onMouseDown={onClose}
>
      <form
  className="schedule-workflow-dialog schedule-workflow-form"
  role="dialog"
  aria-modal="true"
  aria-labelledby="schedule-form-title"
  onSubmit={handleSubmit}
  onMouseDown={(event) =>
    event.stopPropagation()
  }
>
          <header className="schedule-modal-head">
            <div>
              <h2 id="schedule-form-title">
                {isEdit
                  ? '일정·행사 수정'
                  : isEvent
                    ? '행사 만들기'
                    : '일정 등록'}
              </h2>

              <p>
                동아리 일정과 참가 신청을 함께
                준비하세요.
              </p>
            </div>

            <button
              type="button"
              className="schedule-modal-close"
              aria-label={
                isEdit
                  ? '일정 수정 닫기'
                  : '일정 등록 닫기'
              }
              onClick={onClose}
            >
              ×
            </button>
          </header>

          <div className="schedule-workflow-body">
            <ScheduleBasicFields
              values={values}
              updateField={updateField}
            />

            {isEvent && (
              <ScheduleEventFields
                values={values}
                updateField={updateField}
              />
            )}

            <section className="schedule-workflow-section">
              <h3>안내 사항</h3>

              <Textarea
                label="상세 내용"
                rows={4}
                maxLength={2000}
                placeholder="행사 소개, 준비물, 진행 순서를 입력하세요."
                value={values.description}
                onChange={(e) =>
                  updateField(
                    'description',
                    e.target.value,
                  )
                }
              />
            </section>

            {error && (
              <p
                className="schedule-form-error"
                role="alert"
              >
                {error}
              </p>
            )}

            <p className="schedule-form-note">
              {isEdit
                ? '수정할 내용을 확인한 후 저장해 주세요.'
                : '일정에 필요한 내용을 확인한 후 등록해 주세요.'}
            </p>
          </div>

          <footer className="schedule-workflow-footer">
            <small>
              {isEdit
                ? '변경한 내용이 일정에 반영돼요.'
                : '등록하면 캘린더에 바로 표시돼요.'}
            </small>

            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                취소
              </Button>

              <Button type="submit">
                {isEdit
                  ? '변경사항 저장'
                  : '등록하기'}
              </Button>
            </div>
          </footer>
        </form>
      </div>
  )
}