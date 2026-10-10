/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, errorMessage } from '../api/client'
import { authApi, organizationApi } from '../api/services'
import type { AuthUser, Organization } from '../api/types'

const ACTIVE_ORGANIZATION_KEY = 'dongbang.activeOrganizationId'

type SessionValue = {
  user: AuthUser | null
  organizations: Organization[]
  organizationsError: string
  activeOrganization: Organization | null
  loading: boolean
  refresh: () => Promise<AuthUser | null>
  clearSession: () => void
  selectOrganization: (organization: Organization) => void
  setActiveOrganizationId: (id: number) => void
}

const SessionContext = createContext<SessionValue | null>(null)

export function getStoredOrganizationId() {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(ACTIVE_ORGANIZATION_KEY)
  const id = value ? Number(value) : NaN
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export function setStoredOrganizationId(id: number) {
  window.localStorage.setItem(ACTIVE_ORGANIZATION_KEY, String(id))
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [organizationsError, setOrganizationsError] = useState('')
  const [activeId, setActiveId] = useState<number | null>(getStoredOrganizationId)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const currentUser = await authApi.me()
      setUser(currentUser)
      if (currentUser.onboardingRequired) {
        setOrganizations([])
        setOrganizationsError('')
      } else {
        try {
          const response = await organizationApi.mine()
          setOrganizations(response.organizations ?? [])
          setOrganizationsError('')
          const stored = getStoredOrganizationId()
          const next = response.organizations?.find((organization) => organization.organizationId === stored) ?? response.organizations?.[0]
          if (next) {
            setActiveId(next.organizationId)
            setStoredOrganizationId(next.organizationId)
          }
        } catch (error) {
          console.error(error)
          setOrganizationsError(errorMessage(error))
        }
      }
      return currentUser
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) console.error(error)
      setUser(null)
      setOrganizations([])
      setOrganizationsError('')
      if (error instanceof ApiError && error.status === 401) {
        setActiveId(null)
        window.localStorage.removeItem(ACTIVE_ORGANIZATION_KEY)
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSession = useCallback(() => {
    setUser(null)
    setOrganizations([])
    setOrganizationsError('')
    setActiveId(null)
    setLoading(false)
    window.localStorage.removeItem(ACTIVE_ORGANIZATION_KEY)
  }, [])

  useEffect(() => { queueMicrotask(() => void refresh()) }, [refresh])
  const activeOrganization = organizations.find((organization) => organization.organizationId === activeId) ?? null
  const value = useMemo<SessionValue>(() => ({
    user,
    organizations,
    organizationsError,
    activeOrganization,
    loading,
    refresh,
    clearSession,
    selectOrganization: (organization) => { setActiveId(organization.organizationId); setStoredOrganizationId(organization.organizationId) },
    setActiveOrganizationId: (id) => { setActiveId(id); setStoredOrganizationId(id) },
  }), [user, organizations, organizationsError, activeOrganization, loading, refresh, clearSession])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const value = useContext(SessionContext)
  return value ?? {
    user: null,
    organizations: [],
    organizationsError: '',
    activeOrganization: null,
    loading: false,
    refresh: async () => {},
    clearSession: () => {},
    selectOrganization: () => {},
    setActiveOrganizationId: () => {},
  }
}
