import type { ReactNode } from 'react'

export function StatCard({ label, value, description, icon, tone = 'navy' }: { label: string; value: string; description: string; icon: ReactNode; tone?: 'navy' | 'coral' | 'green' | 'amber' }) {
  return <article className={`stat-card stat-${tone}`}><div><span>{label}</span><strong>{value}</strong><small>{description}</small></div><div className="stat-icon">{icon}</div></article>
}
