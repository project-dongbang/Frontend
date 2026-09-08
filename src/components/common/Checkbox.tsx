import type { InputHTMLAttributes, ReactNode } from 'react'

export function Checkbox({ children, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { children?: ReactNode }) {
  return <label className={`checkbox ${className}`.trim()}><input type="checkbox" {...props} /><span aria-hidden="true">✓</span>{children}</label>
}
