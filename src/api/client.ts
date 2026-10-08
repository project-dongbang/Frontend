export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.3.36.171.188.nip.io'
).replace(/\/$/, '')

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
  return responseCsrfToken || decodeURIComponent(readCookie('XSRF-TOKEN') || readCookie('xsrf_token'))
}

function captureCsrfToken(response: Response) {
  const token = response.headers.get(responseCsrfHeaderName) || response.headers.get('X-XSRF-TOKEN') || response.headers.get('X-CSRF-TOKEN')
  if (token) responseCsrfToken = token
}

async function ensureCsrfToken() {
  if (currentCsrfToken()) return
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
}

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, raw = false, retry = true, ...init } = options
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
  return error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.'
}
