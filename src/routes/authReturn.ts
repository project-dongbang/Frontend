import { PATHS } from './paths'

const AUTH_RETURN_KEY = 'dongbang.authReturnPath'

function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  try {
    const url = new URL(value, 'https://dongbang.local')
    if (url.origin !== 'https://dongbang.local') return null
    if (url.pathname !== PATHS.joinClub && url.pathname !== PATHS.attendanceCheckIn) return null
    return `${url.pathname}${url.search}`
  } catch { return null }
}

export function saveAuthReturnPath(path: string) {
  const safe = safeReturnPath(path)
  if (safe && typeof window !== 'undefined') window.sessionStorage.setItem(AUTH_RETURN_KEY, safe)
}

export function getAuthReturnPath() {
  if (typeof window === 'undefined') return PATHS.clubs
  return safeReturnPath(window.sessionStorage.getItem(AUTH_RETURN_KEY)) ?? PATHS.clubs
}

export function clearAuthReturnPath() {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(AUTH_RETURN_KEY)
}
