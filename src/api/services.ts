import { apiRequest, apiUrl } from './client'
import type { ApiMember, AuthUser, CalendarEvent, DashboardData, Notification, Organization, PhotoDetail, PhotoListItem, Profile } from './types'

export const authApi = {
  csrf: () => apiRequest<{ token: string; headerName: string }>('/api/v1/auth/csrf'),
  me: () => apiRequest<AuthUser>('/api/v1/auth/me'),
  onboarding: (body: { name: string; studentNumber: string; department: string; email: string }) =>
    apiRequest<{ userId: number }>('/api/v1/auth/onboarding', { method: 'PUT', body }),
  logout: () => apiRequest<void>('/api/v1/auth/logout', { method: 'POST' }),
  authorizeUrl: (provider: 'google' | 'kakao', redirectUri: string) =>
    apiUrl(`/api/v1/auth/oauth/${provider}/authorize?redirectUri=${encodeURIComponent(redirectUri)}`),
}

export const organizationApi = {
  mine: () => apiRequest<{ organizations: Organization[] }>('/api/v1/users/me/organizations'),
  detail: (id: number) => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${id}`),
  create: (body: { name: string; description?: string; logoUrl?: string }) =>
    apiRequest<{ organizationId: number; slug: string }>('/api/v1/organizations', { method: 'POST', body }),
  update: (id: number, body: Record<string, unknown>) =>
    apiRequest(`/api/v1/organizations/${id}`, { method: 'PATCH', body }),
  remove: (id: number) => apiRequest(`/api/v1/organizations/${id}`, { method: 'DELETE' }),
  leave: (id: number) => apiRequest(`/api/v1/organizations/${id}/members/me`, { method: 'DELETE' }),
  join: (token: string) => apiRequest<{ organizationId: number; membershipId: number; role: string }>(`/api/v1/invitations/${encodeURIComponent(token)}/accept`, { method: 'POST' }),
  invitation: (id: number, expiresInHours = 168) => apiRequest<{ invitationToken: string; expiresAt: string }>(`/api/v1/organizations/${id}/invitations`, { method: 'POST', body: { expiresInHours } }),
  members: (id: number) => apiRequest<{ members: ApiMember[] }>(`/api/v1/organizations/${id}/members`),
  updateMemberInfo: (id: number, memberId: number, body: { status?: 'ACTIVE' | 'INACTIVE'; generation?: string; position?: string }) => apiRequest(`/api/v1/organizations/${id}/members/${memberId}`, { method: 'PATCH', body }),
  changeRole: (id: number, memberId: number, role: 'ADMIN' | 'MEMBER') => apiRequest(`/api/v1/organizations/${id}/members/${memberId}/role`, { method: 'PATCH', body: { role } }),
  expel: (id: number, memberId: number) => apiRequest(`/api/v1/organizations/${id}/members/${memberId}`, { method: 'DELETE' }),
  delegateOwner: (id: number, targetMemberId: number) => apiRequest(`/api/v1/organizations/${id}/owner`, { method: 'PATCH', body: { targetMemberId } }),
}

export const profileApi = {
  get: () => apiRequest<Profile>('/api/v1/users/me'),
  withdraw: () => apiRequest<void>('/api/v1/users/me', { method: 'DELETE' }),
  update: (body: Partial<Pick<Profile, 'name' | 'studentNumber' | 'department' | 'email'>>) => apiRequest<Profile>('/api/v1/users/me', { method: 'PATCH', body }),
  activities: (organizationId: number) => apiRequest<Record<string, unknown>>(`/api/v1/users/me/activities?organizationId=${organizationId}`),
  uploadImage: (image: File) => { const body = new FormData(); body.append('image', image); return apiRequest('/api/v1/users/me/profile-image', { method: 'POST', body }) },
  resetImage: () => apiRequest('/api/v1/users/me/profile-image/default', { method: 'PUT' }),
}

export const dashboardApi = {
  get: (organizationId: number, userId: number, role: 'admin' | 'member') =>
    apiRequest<DashboardData>(`/api/v1/organizations/${organizationId}/dashboard/${role}?userId=${userId}`),
}

export const scheduleApi = {
  calendar: (organizationId: number, year: number, month: number) => apiRequest<{ year: number; month: number; events: CalendarEvent[] }>(`/api/v1/organizations/${organizationId}/calendar?year=${year}&month=${month}`),
  detail: (organizationId: number, eventId: string | number) => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/events/${eventId}`),
  create: (organizationId: number, body: Record<string, unknown>) => apiRequest(`/api/v1/organizations/${organizationId}/events`, { method: 'POST', body }),
  update: (organizationId: number, eventId: string | number, body: Record<string, unknown>) => apiRequest(`/api/v1/organizations/${organizationId}/events/${eventId}`, { method: 'PATCH', body }),
  remove: (organizationId: number, eventId: string | number) => apiRequest(`/api/v1/organizations/${organizationId}/events/${eventId}`, { method: 'DELETE' }),
  apply: (organizationId: number, eventId: string | number) => apiRequest<{ participating: boolean; participantCount: number }>(`/api/v1/organizations/${organizationId}/events/${eventId}/applications`, { method: 'POST' }),
  withdraw: (organizationId: number, eventId: string | number) => apiRequest<{ participating: boolean; participantCount: number }>(`/api/v1/organizations/${organizationId}/events/${eventId}/applications`, { method: 'DELETE' }),
  closeApplications: (organizationId: number, eventId: string | number) => apiRequest(`/api/v1/organizations/${organizationId}/events/${eventId}/applications/close`, { method: 'POST' }),
  participantCandidates: (organizationId: number, eventId: string | number, keyword = '') => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/events/${eventId}/participant-candidates?size=100${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`),
  changeParticipants: (organizationId: number, eventId: string | number, participantVersion: number, changes: Array<{ membershipId: number; action: 'ADD' | 'REMOVE' }>) => apiRequest(`/api/v1/organizations/${organizationId}/events/${eventId}/participants`, { method: 'PATCH', body: { participantVersion, changes } }),
}

export const attendanceApi = {
  events: (organizationId: number) => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/attendance/events?size=100`),
  status: (organizationId: number, eventId: string | number) => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/events/${eventId}/attendance?size=100`),
  mine: (organizationId: number) => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/attendance/me?size=100`),
  start: (organizationId: number, eventId: string | number) => apiRequest<{ eventId: number; session: { attendanceSessionId: number; status: string; startedAt: string; expiresAt: string; qrToken: string }; serverTime: string }>(`/api/v1/organizations/${organizationId}/events/${eventId}/attendance/session`, { method: 'POST' }),
  close: (organizationId: number, eventId: string | number) => apiRequest(`/api/v1/organizations/${organizationId}/events/${eventId}/attendance/session/close`, { method: 'POST' }),
  update: (organizationId: number, eventId: string | number, attendanceId: string | number, body: Record<string, unknown>) => apiRequest(`/api/v1/organizations/${organizationId}/events/${eventId}/attendance/${attendanceId}`, { method: 'PATCH', body }),
  checkIn: (organizationId: number, eventId: string | number, qrToken: string) => apiRequest(`/api/v1/organizations/${organizationId}/events/${eventId}/attendance/check-in`, { method: 'POST', body: { qrToken } }),
}

export const notificationApi = {
  list: (organizationId: number) => apiRequest<{ unreadCount: number; content: Notification[] }>(`/api/v1/notifications?organizationId=${organizationId}&size=100`),
  read: (id: number) => apiRequest(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }),
  readAll: (organizationId: number) => apiRequest(`/api/v1/notifications/read-all?organizationId=${organizationId}`, { method: 'POST' }),
}

export const feesApi = {
  recognizeReceipt: (organizationId: number, file: File) => { const body = new FormData(); body.append('file', file); return apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/receipts/ocr`, { method: 'POST', body }) },
  ledger: (organizationId: number) => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/ledger?size=100`),
  ledgerDetail: (organizationId: number, transactionId: string | number) => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/ledger/${transactionId}`),
  updateIncome: (organizationId: number, transactionId: string | number, body: Record<string, unknown>) => apiRequest(`/api/v1/organizations/${organizationId}/ledger/incomes/${transactionId}`, { method: 'PATCH', body }),
  updateExpense: (organizationId: number, transactionId: string | number, request: Record<string, unknown>, evidence?: File) => { const body = new FormData(); body.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' })); if (evidence) body.append('evidence', evidence); return apiRequest(`/api/v1/organizations/${organizationId}/ledger/expenses/${transactionId}`, { method: 'PATCH', body }) },
  deleteExpense: (organizationId: number, transactionId: string | number) => apiRequest(`/api/v1/organizations/${organizationId}/ledger/expenses/${transactionId}`, { method: 'DELETE' }),
  exportLedgerUrl: (organizationId: number, format = 'xlsx') => apiUrl(`/api/v1/organizations/${organizationId}/ledger/export?format=${encodeURIComponent(format)}`),
  feeItems: (organizationId: number) => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/fee-items?size=100`),
  feeItemDetail: (organizationId: number, feeItemId: string | number) => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/fee-items/${feeItemId}`),
  feeTargets: (organizationId: number, feeItemId: string | number) => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/fee-targets?feeItemId=${feeItemId}&size=100`),
  myTargets: (organizationId: number) => apiRequest<Record<string, unknown>>(`/api/v1/organizations/${organizationId}/fee-targets/me?size=100`),
  createFeeItem: (organizationId: number, body: Record<string, unknown>) => apiRequest(`/api/v1/organizations/${organizationId}/fee-items`, { method: 'POST', body }),
  updateFeeItem: (organizationId: number, feeItemId: string | number, body: Record<string, unknown>) => apiRequest(`/api/v1/organizations/${organizationId}/fee-items/${feeItemId}`, { method: 'PATCH', body }),
  deleteFeeItem: (organizationId: number, feeItemId: string | number) => apiRequest(`/api/v1/organizations/${organizationId}/fee-items/${feeItemId}`, { method: 'DELETE' }),
  changeTarget: (organizationId: number, targetId: string | number, status: 'PAID' | 'UNPAID') => apiRequest(`/api/v1/organizations/${organizationId}/fee-targets/${targetId}/status`, { method: 'PATCH', body: { status } }),
  createIncome: (organizationId: number, body: Record<string, unknown>) => apiRequest(`/api/v1/organizations/${organizationId}/ledger/incomes`, { method: 'POST', body }),
  createExpense: (organizationId: number, request: Record<string, unknown>, evidence: File) => {
    const body = new FormData()
    body.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }))
    body.append('evidence', evidence)
    return apiRequest(`/api/v1/organizations/${organizationId}/ledger/expenses`, { method: 'POST', body })
  },
  exportTargetsUrl: (organizationId: number, feeItemId: string | number) => apiUrl(`/api/v1/organizations/${organizationId}/fee-targets/export?feeItemId=${feeItemId}&format=xlsx`),
}

export const photoApi = {
  list: (organizationId: number, cursor?: number) => apiRequest<{ content: PhotoListItem[]; hasNext: boolean; nextCursor: number | null }>(`/api/v1/organizations/${organizationId}/photos?size=100${cursor ? `&cursor=${cursor}` : ''}`),
  detail: (organizationId: number, photoId: string | number) => apiRequest<PhotoDetail>(`/api/v1/organizations/${organizationId}/photos/${photoId}`),
  create: (organizationId: number, file: File, title?: string) => {
    const body = new FormData()
    body.append('file', file)
    if (title) body.append('title', title)
    return apiRequest<PhotoDetail>(`/api/v1/organizations/${organizationId}/photos`, { method: 'POST', body })
  },
  update: (organizationId: number, photoId: string | number, title: string) => apiRequest<PhotoDetail>(`/api/v1/organizations/${organizationId}/photos/${photoId}`, { method: 'PATCH', body: { title } }),
  replaceImage: (organizationId: number, photoId: string | number, file: File, title?: string) => {
    const body = new FormData()
    body.append('file', file)
    if (title) body.append('title', title)
    return apiRequest<PhotoDetail>(`/api/v1/organizations/${organizationId}/photos/${photoId}/image`, { method: 'PATCH', body })
  },
  remove: (organizationId: number, photoId: string | number) => apiRequest(`/api/v1/organizations/${organizationId}/photos/${photoId}`, { method: 'DELETE' }),
}
