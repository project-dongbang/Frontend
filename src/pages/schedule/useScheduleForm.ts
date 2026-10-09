import { useState } from 'react'
import type { SubmitEvent } from 'react'

import type { CalendarItem } from './scheduleMock'
import { scheduleApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'

export type ScheduleFormValues = {
  type: 'schedule' | 'event'
  visibility: 'all' | 'admin'
  title: string
  start: string
  end: string
  location: string
  capacity: string
  deadline: string
  description: string
}

const initialValues: ScheduleFormValues = {
  type: 'schedule',
  visibility: 'all',
  title: '',
  start: '',
  end: '',
  location: '',
  capacity: '',
  deadline: '',
  description: '',
}

function getInitialValues(
  item: CalendarItem | null,
  defaultType: ScheduleFormValues['type'],
): ScheduleFormValues {
  if (!item) {
    return { ...initialValues, type: defaultType }
  }

  return {
    type:
      item.type === 'event'
        ? 'event'
        : 'schedule',

    visibility: 'all',

    title: item.title,
    start: item.start,
    end: item.end,
    location: item.location ?? '',

    capacity:
      item.capacity !== undefined
        ? String(item.capacity)
        : '',

    deadline: item.deadline ?? '',
    description: item.description ?? '',
  }
}

export function useScheduleForm(
  item: CalendarItem | null,
  onClose: () => void,
  defaultType: ScheduleFormValues['type'] = 'schedule',
) {
  const { activeOrganization } = useSession()
  const [values, setValues] =
    useState<ScheduleFormValues>(() =>
      getInitialValues(item, defaultType),
    )

  const [error, setError] = useState('')

  const isEvent = values.type === 'event'
  const isEdit = item !== null

  const updateField = (
    field: keyof ScheduleFormValues,
    value: string,
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }))

    setError('')
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (
      !values.title ||
      !values.start ||
      !values.end ||
      !values.location
    ) {
      setError(
        '제목, 시작 일시, 종료 일시, 장소를 입력해 주세요.',
      )
      return
    }

    if (
      new Date(values.end) <=
      new Date(values.start)
    ) {
      setError(
        '종료 일시는 시작 일시보다 늦어야 합니다.',
      )
      return
    }

    if (
      isEvent &&
      values.deadline &&
      new Date(values.deadline) >
        new Date(values.start)
    ) {
      setError(
        '신청 마감은 행사 시작 이전 또는 같은 시각으로 설정해 주세요.',
      )
      return
    }

    if (!activeOrganization) { setError('동아리를 먼저 선택해 주세요.'); return }
    const body = {
      title: values.title.trim(),
      startsAt: new Date(values.start).toISOString(),
      endsAt: new Date(values.end).toISOString(),
      location: values.location.trim(),
      description: values.description.trim() || null,
      ...(isEdit ? {} : { type: values.type.toUpperCase() }),
      ...(isEvent ? {
        capacity: values.capacity ? Number(values.capacity) : null,
        registrationDeadline: values.deadline ? new Date(values.deadline).toISOString() : null,
      } : {}),
    }
    try {
      if (isEdit && item) await scheduleApi.update(activeOrganization.organizationId, item.id, body)
      else await scheduleApi.create(activeOrganization.organizationId, body)
      window.dispatchEvent(new Event('dongbang:schedule-changed'))
      handleClose()
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }

  return {
    values,
    error,
    isEvent,
    isEdit,
    updateField,
    handleClose,
    handleSubmit,
  }
}
