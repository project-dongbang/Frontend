import type { ReactNode } from 'react'

type CardProps = { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }

export function Card({ title, description, action, children, className = '' }: CardProps) {
  return <section className={`card ${className}`.trim()}>
    {(title || action) && <header className="card-header"><div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>{action}</header>}
    {children}
  </section>
}
