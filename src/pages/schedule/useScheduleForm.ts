import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { CalendarItem } from './scheduleMock'

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

export function useScheduleForm(
  open: boolean,
  item: CalendarItem | null,
  onClose: () => void,
) {
  const [values, setValues] =
    useState<ScheduleFormValues>(initialValues)

  const [error, setError] = useState('')

  const isEvent = values.type === 'event'
  const isEdit = item !== null

  useEffect(() => {
    if (!open) return

    setError('')

    if (item) {
      setValues({
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
      })

      return
    }

    setValues(initialValues)
  }, [open, item])

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
    setValues(initialValues)
    setError('')
    onClose()
  }

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
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

    if (isEdit) {
      // TODO: 일정 수정 API 연결
      console.log('수정할 일정 ID:', item?.id)
      console.log('수정 데이터:', values)
    } else {
      // TODO: 일정 등록 API 연결
      console.log('등록 데이터:', values)
    }

    handleClose()
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