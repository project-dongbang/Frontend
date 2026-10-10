import { PATHS } from './paths'

const AUTH_RETURN_KEY = 'dongbang.authReturnPath'
const AUTH_RETURN_EXPIRY_KEY = 'dongbang.authReturnPathExpiresAt'
const AUTH_RETURN_TTL_MS = 30 * 60 * 1000

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
  if (!safe || typeof window === 'undefined') return
  for (const kind of ['sessionStorage', 'localStorage'] as const) {
    try {
      window[kind]?.setItem(AUTH_RETURN_KEY, safe)
      window[kind]?.setItem(AUTH_RETURN_EXPIRY_KEY, String(Date.now() + AUTH_RETURN_TTL_MS))
    } catch { /* Storage may be unavailable in a restricted browser. */ }
  }
}

export function getAuthReturnPath() {
  if (typeof window === 'undefined') return PATHS.clubs
  for (const kind of ['sessionStorage', 'localStorage'] as const) {
    try {
      const storage = window[kind]
      if (!storage) continue
      const expiresAt = Number(storage.getItem(AUTH_RETURN_EXPIRY_KEY))
      if (expiresAt && expiresAt < Date.now()) continue
      const safe = safeReturnPath(storage.getItem(AUTH_RETURN_KEY))
      if (safe) return safe
    } catch { /* Try the other storage. */ }
  }
  return PATHS.clubs
}

export function getPostAuthDestination() {
  const path = getAuthReturnPath()
  const url = new URL(path, 'https://dongbang.local')
  if (url.pathname === PATHS.joinClub && url.searchParams.get('invite')) {
    url.searchParams.set('autoJoin', '1')
    return `${url.pathname}${url.search}`
  }
  return path
}

export function clearAuthReturnPath() {
  if (typeof window === 'undefined') return
  for (const kind of ['sessionStorage', 'localStorage'] as const) {
    try {
      window[kind]?.removeItem(AUTH_RETURN_KEY)
      window[kind]?.removeItem(AUTH_RETURN_EXPIRY_KEY)
    } catch { /* Storage may be unavailable in a restricted browser. */ }
  }
}
