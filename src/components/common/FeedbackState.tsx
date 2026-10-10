import type { ReactNode } from 'react'

type FeedbackStateProps = {
  title: string
  description?: string
  action?: ReactNode
  kind?: 'empty' | 'error'
  compact?: boolean
}

export function FeedbackState({
  title,
  description,
  action,
  kind = 'empty',
  compact = false,
}: FeedbackStateProps) {
  return (
    <div
      className={`feedback-state is-${kind}${compact ? ' is-compact' : ''}`}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      <span className="feedback-state-icon" aria-hidden="true">
        {kind === 'error' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" />
          </svg>
        )}
      </span>
      <div className="feedback-state-copy">
        <strong>{title}</strong>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="feedback-state-action">{action}</div>}
    </div>
  )
}
