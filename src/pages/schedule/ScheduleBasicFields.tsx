import {
  Input,
  Select,
} from '../../components/common'

import type { ScheduleFormValues } from './useScheduleForm'

type ScheduleBasicFieldsProps = {
  values: ScheduleFormValues
  updateField: (
    field: keyof ScheduleFormValues,
    value: string,
  ) => void
}

export function ScheduleBasicFields({
  values,
  updateField,
}: ScheduleBasicFieldsProps) {
  return (
    <section className="schedule-workflow-section">
      <h3>01 · 기본 정보</h3>

      <div className="schedule-field-grid">
        <Select
          label="종류"
          value={values.type}
          onChange={(e) =>
            updateField(
              'type',
              e.target.value as
                | 'schedule'
                | 'event',
            )
          }
        >
          <option value="event">
            행사 · 참가 신청 받기
          </option>

          <option value="schedule">
            일정 · 캘린더에만 표시
          </option>
        </Select>

        <Select
            label="공개 범위"
            value={values.visibility}
            onChange={(e) =>
                updateField(
                    'visibility',
                    e.target.value as 'all' | 'admin',
                )
            }
        >
            <option value="all">
                전체 회원
            </option>

            <option value="admin">
                운영진
            </option>
        </Select>

        <div className="schedule-field-wide">
          <Input
            label="제목"
            required
            maxLength={80}
            placeholder="예: 2학기 프로젝트 발표회"
            value={values.title}
            onChange={(e) =>
              updateField(
                'title',
                e.target.value,
              )
            }
          />
        </div>

        <Input
          label="시작 일시"
          required
          type="datetime-local"
          value={values.start}
          onChange={(e) =>
            updateField(
              'start',
              e.target.value,
            )
          }
        />

        <Input
          label="종료 일시"
          required
          type="datetime-local"
          value={values.end}
          onChange={(e) =>
            updateField(
              'end',
              e.target.value,
            )
          }
        />

        <div className="schedule-field-wide">
          <Input
            label="장소 또는 온라인 링크"
            required
            maxLength={160}
            placeholder="예: 학생회관 201호 또는 온라인 모임 링크"
            value={values.location}
            onChange={(e) =>
              updateField(
                'location',
                e.target.value,
              )
            }
          />
        </div>
      </div>
    </section>
  )
}