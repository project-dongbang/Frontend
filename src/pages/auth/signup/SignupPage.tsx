import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Modal } from '../../../components/common'
import { ClubBackdrop } from '../../clubs/ClubBackdrop'
import { PATHS } from '../../../routes/paths'
import { authApi } from '../../../api/services'
import { errorMessage } from '../../../api/client'
import { useSession } from '../../../context/SessionContext'
import './SignupPage.css'
import { getAuthReturnPath } from '../../../routes/authReturn'

type SignupForm = {
  name: string
  studentId: string
  department: string
  email: string
}

type SignupErrors = Partial<Record<keyof SignupForm, string>>

const initialForm: SignupForm = {
  name: '',
  studentId: '',
  department: '',
  email: '',
}

export function SignupPage() {
  const navigate = useNavigate()
  const { user, refresh } = useSession()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<SignupErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(key: keyof SignupForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = form.email.trim() || user?.email?.trim() || ''
    const nextErrors: SignupErrors = {}
    if (!form.name.trim()) nextErrors.name = '이름을 입력해 주세요.'
    if (!/^\d+$/.test(form.studentId.trim())) nextErrors.studentId = '학번은 숫자로 입력해 주세요.'
    if (!form.department.trim()) nextErrors.department = '학과를 입력해 주세요.'
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = '이메일 형식을 확인해 주세요.'
    setErrors(nextErrors)

    const firstInvalidField = Object.keys(nextErrors)[0]
    if (firstInvalidField) {
      event.currentTarget.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus()
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      await authApi.onboarding({
        name: form.name.trim(),
        studentNumber: form.studentId.trim(),
        department: form.department.trim(),
        email,
      })
      await refresh()
      navigate(getAuthReturnPath())
    } catch (error) {
      setSubmitError(errorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ClubBackdrop>
      <Modal open title="가입 정보 입력" className="signup-modal" onClose={() => navigate(PATHS.login)}>
        <p className="signup-description">동아리 활동에 사용할 이름, 학번, 학과를 입력해 주세요.</p>
        <form className="signup-form" onSubmit={submit} noValidate>
          <div className="signup-form-grid">
            <Input label="이름" name="name" value={form.name} onChange={(event) => update('name', event.target.value)} error={errors.name} aria-invalid={Boolean(errors.name)} autoComplete="name" />
            <Input label="학번" name="studentId" value={form.studentId} onChange={(event) => update('studentId', event.target.value)} error={errors.studentId} aria-invalid={Boolean(errors.studentId)} inputMode="numeric" />
            <Input label="학과" name="department" value={form.department} onChange={(event) => update('department', event.target.value)} error={errors.department} aria-invalid={Boolean(errors.department)} />
            <Input label="이메일" name="email" type="email" value={form.email || user?.email || ''} onChange={(event) => update('email', event.target.value)} error={errors.email} aria-invalid={Boolean(errors.email)} autoComplete="email" />
          </div>
          {submitError && <p role="alert">{submitError}</p>}
          <div className="signup-actions"><Button type="submit" disabled={submitting}>{submitting ? '저장 중…' : '가입 완료'}</Button></div>
        </form>
      </Modal>
    </ClubBackdrop>
  )
}
