import { Input } from '../../components/common'

import type { ScheduleFormValues } from './useScheduleForm'

type ScheduleEventFieldsProps = {
  values: ScheduleFormValues
  updateField: (
    field: keyof ScheduleFormValues,
    value: string,
  ) => void
}

export function ScheduleEventFields({
  values,
  updateField,
}: ScheduleEventFieldsProps) {
  return (
    <section className="schedule-workflow-section">
      <h3>02 · 참가 신청</h3>

      <div className="schedule-field-grid">
        <Input
          label="모집 정원"
          type="number"
          min={1}
          max={1000}
          placeholder="비워 두면 정원 제한 없음"
          hint="등록 후 동아리 회원이 참가를 신청할 수 있어요."
          value={values.capacity}
          onChange={(e) =>
            updateField(
              'capacity',
              e.target.value,
            )
          }
        />

        <Input
          label="신청 마감"
          type="datetime-local"
          hint="비워 두면 행사 시작 시 신청을 마감해요."
          value={values.deadline}
          onChange={(e) =>
            updateField(
              'deadline',
              e.target.value,
            )
          }
        />
      </div>
    </section>
  )
}