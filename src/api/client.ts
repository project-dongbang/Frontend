export function resolveApiBaseUrl(configured: string | undefined, production: boolean) {
  if (production) return ''
  return (configured ?? 'http://localhost:8080').replace(/\/$/, '')
}

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL, import.meta.env.PROD)

export type ApiEnvelope<T> = {
  isSuccess: boolean
  code: string
  message: string
  result: T
  errorDetail?: unknown
}

export class ApiError extends Error {
  status: number
  code?: string
  detail?: unknown

  constructor(message: string, status: number, code?: string, detail?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.detail = detail
  }
}

function readCookie(name: string) {
  if (typeof document === 'undefined') return ''
  const prefix = `${encodeURIComponent(name)}=`
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length) ?? ''
}

let responseCsrfToken = ''
let responseCsrfHeaderName = 'X-XSRF-TOKEN'
let csrfRequest: Promise<void> | null = null

function currentCsrfToken() {
  const sameOrigin = typeof window !== 'undefined' && new URL(API_BASE_URL, window.location.href).origin === window.location.origin
  const cookieToken = sameOrigin ? decodeURIComponent(readCookie('XSRF-TOKEN') || readCookie('xsrf_token')) : ''
  return cookieToken || responseCsrfToken
}

function captureCsrfToken(response: Response) {
  const token = response.headers.get(responseCsrfHeaderName) || response.headers.get('X-XSRF-TOKEN') || response.headers.get('X-CSRF-TOKEN')
  if (token) responseCsrfToken = token
}

async function ensureCsrfToken(force = false) {
  if (force) responseCsrfToken = ''
  if (!force && currentCsrfToken()) return
  if (!csrfRequest) {
    csrfRequest = fetch(apiUrl('/api/v1/auth/csrf'), { credentials: 'include' })
      .then(async (response) => {
        const payload = await response.json() as { isSuccess?: boolean; message?: string; result?: { token?: string; headerName?: string } }
        if (!response.ok || payload.isSuccess === false || !payload.result?.token) {
          throw new ApiError(payload.message || 'CSRF 토큰을 가져오지 못했습니다.', response.status)
        }
        responseCsrfToken = payload.result.token
        responseCsrfHeaderName = payload.result.headerName || 'X-XSRF-TOKEN'
      })
      .finally(() => { csrfRequest = null })
  }
  await csrfRequest
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null
  raw?: boolean
  retry?: boolean
  csrfRetry?: boolean
}

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, raw = false, retry = true, csrfRetry = true, ...init } = options
  const headers = new Headers(init.headers)
  const isFormData = body instanceof FormData
  const requestBody = body && !isFormData && typeof body === 'object'
    ? JSON.stringify(body)
    : body as BodyInit | null | undefined

  if (body && !isFormData && typeof body === 'object') {
    headers.set('Content-Type', 'application/json')
  }
  const method = (init.method ?? 'GET').toUpperCase()
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    await ensureCsrfToken()
    const csrfToken = currentCsrfToken()
    if (csrfToken) headers.set(responseCsrfHeaderName, csrfToken)
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    method,
    headers,
    body: requestBody,
    credentials: 'include',
  })
  captureCsrfToken(response)

  if (response.status === 401 && retry && !path.includes('/auth/refresh')) {
    if (!currentCsrfToken()) await ensureCsrfToken()
    const refreshToken = currentCsrfToken()
    const refreshed = await fetch(apiUrl('/api/v1/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      headers: refreshToken ? { [responseCsrfHeaderName]: refreshToken } : undefined,
    })
    captureCsrfToken(refreshed)
    if (refreshed.ok) return apiRequest<T>(path, { ...options, retry: false })
  }

  if (raw) {
    if (!response.ok) throw new ApiError('요청을 처리하지 못했습니다.', response.status)
    return response as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? await response.json() as Partial<ApiEnvelope<T>>
    : null

  if (response.status === 403 && csrfRetry && !['GET', 'HEAD', 'OPTIONS'].includes(method)
      && payload?.code === 'AUTH_403_001' && payload.message === '요청이 거부되었습니다.') {
    await ensureCsrfToken(true)
    return apiRequest<T>(path, { ...options, csrfRetry: false })
  }

  if (!response.ok || payload?.isSuccess === false) {
    throw new ApiError(
      payload?.message || '요청을 처리하지 못했습니다.',
      response.status,
      payload?.code,
      payload?.errorDetail,
    )
  }

  if (response.status === 204) return undefined as T
  return (payload && 'result' in payload ? payload.result : payload) as T
}

export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const attendanceMessages: Record<string, string> = {
      ATT_400_001: 'QR 코드가 올바르지 않아요. 운영진에게 새 QR 코드를 요청해 주세요.',
      ATT_400_002: '다른 행사의 QR 코드예요. 참여 중인 행사 정보를 확인해 주세요.',
      ATT_403_001: '이 행사 참가자만 출석할 수 있어요. 참가 신청 상태를 확인해 주세요.',
      ATT_409_001: '아직 출석이 열리지 않았어요. 운영진에게 확인해 주세요.',
      ATT_409_003: '출석이 종료됐어요. 운영진에게 다시 열어 달라고 요청해 주세요.',
      ATT_410_001: 'QR 코드가 만료됐어요. 새 QR 코드를 받아 다시 시도해 주세요.',
    }
    if (error.code && attendanceMessages[error.code]) return attendanceMessages[error.code]
    if (error.status === 401) return '로그인이 필요해요. 다시 로그인해 주세요.'
    if (error.status === 403) {
      if (error.message === '요청이 거부되었습니다.') return '요청을 완료하지 못했어요. 새로고침한 뒤 다시 시도해 주세요.'
      if (/회장|OWNER/.test(error.message)) return '동아리 대표만 할 수 있는 작업이에요.'
      if (/운영진/.test(error.message)) return '동아리 운영진만 할 수 있는 작업이에요.'
      if (/회원/.test(error.message)) return '동아리 회원만 이용할 수 있어요.'
      return '이 작업을 할 권한이 없어요. 동아리에서 내 역할을 확인해 주세요.'
    }
    if (error.code === 'COMMON_400_001' || error.code === 'COMMON_400_002') {
      return '입력한 내용을 다시 확인해 주세요.'
    }
    if (error.code === 'COMMON_404_001') return '요청한 내용을 찾지 못했어요. 목록을 다시 확인해 주세요.'
    if (error.status >= 500) return '서비스에 잠시 문제가 생겼어요. 잠시 후 다시 시도해 주세요.'
    if (error.message === '요청을 처리하지 못했습니다.') return '요청을 완료하지 못했어요. 다시 시도해 주세요.'
    return error.message
  }
  if (error instanceof TypeError && /Failed to fetch|NetworkError|Load failed/i.test(error.message)) {
    return '연결이 원활하지 않아요. 인터넷 연결을 확인하고 다시 시도해 주세요.'
  }
  return error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.'
}
