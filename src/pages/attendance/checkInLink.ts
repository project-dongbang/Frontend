import { PATHS } from '../../routes/paths'

export function checkInPath(organizationId: number, eventId: string | number, qrToken: string) {
  const params = new URLSearchParams({ organizationId: String(organizationId), eventId: String(eventId), qrToken })
  return `${PATHS.attendanceCheckIn}?${params}`
}

export function parseCheckInParams(params: URLSearchParams) {
  const organizationId = Number(params.get('organizationId'))
  const eventId = Number(params.get('eventId'))
  const qrToken = params.get('qrToken')?.trim() ?? ''
  if (!Number.isSafeInteger(organizationId) || organizationId <= 0 || !Number.isSafeInteger(eventId) || eventId <= 0 || !qrToken) return null
  return { organizationId, eventId, qrToken }
}
