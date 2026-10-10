import { PATHS } from '../../routes/paths'

export function invitationTokenFromInput(value: string) {
  const input = value.trim()
  if (!/^https?:\/\//i.test(input)) return input

  try {
    const url = new URL(input)
    return url.pathname === PATHS.joinClub ? (url.searchParams.get('invite')?.trim() ?? '') : ''
  } catch {
    return ''
  }
}
