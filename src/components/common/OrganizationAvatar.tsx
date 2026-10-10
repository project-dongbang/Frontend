import { useState } from 'react'
import type { Organization } from '../../api/types'

export function OrganizationAvatar({ organization }: { organization: Pick<Organization, 'name' | 'logoUrl'> | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const logoUrl = organization?.logoUrl?.trim()
  const initial = organization?.name.trim().slice(0, 1) || 'D'

  return (
    <b className="organization-avatar" aria-hidden="true">
      {logoUrl && failedUrl !== logoUrl
        ? <img src={logoUrl} alt="" onError={() => setFailedUrl(logoUrl)} />
        : initial}
    </b>
  )
}
