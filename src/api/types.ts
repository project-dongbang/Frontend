export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export type AuthUser = {
  userId: number
  name: string
  email: string
  status: 'PENDING_ONBOARDING' | 'ACTIVE'
  onboardingRequired: boolean
  oauthProviders: Array<'GOOGLE' | 'KAKAO'>
}

export type Organization = {
  organizationId: number
  name: string
  slug: string
  logoUrl?: string
  myRole: OrganizationRole
  joinedAt: string
}

export type Profile = {
  userId: number
  name: string
  studentNumber: string
  department: string
  email: string
  profileImageUrl?: string
  oauthProviders: string[]
  currentMembership?: {
    organizationId: number
    role: OrganizationRole
    generation?: string
    position?: string
  }
}

export type DashboardData = {
  organizationId: number
  organizationName: string
  stats: {
    activeMemberCount: number
    thisMonthEventCount: number
    attendanceRate: number
    paymentRate: number
  }
  myStats?: { attendanceRate: number; attendedEventCount: number; unpaidFeeCount: number }
  upcomingSchedules: Array<{
    eventId: number
    day: string
    month: number
    title: string
    detail: string
    status: string
    startsAt: string
  }>
  recentPhotos: Array<{ photoId: number; title: string; imageUrl: string }>
}

export type ApiMember = {
  membershipId: number
  userId: number
  memberName: string
  studentNumber: string
  generation?: string
  position?: string
  role: OrganizationRole
  status: 'ACTIVE' | 'INACTIVE' | 'LEFT' | 'EXPELLED'
  joinedAt: string
}

export type CalendarEvent = {
  eventId?: number
  feeItemId?: number
  type: 'SCHEDULE' | 'EVENT' | 'FEE_DUE'
  title: string
  startsAt?: string
  endsAt?: string
  dueDate?: string
}

export type Notification = {
  notificationId: number
  notificationType: string
  title: string
  message: string
  referenceType: 'EVENT' | 'FEE_ITEM' | 'ATTENDANCE_SESSION'
  referenceId: number
  isRead: boolean
  readAt?: string
  sentAt: string
}
