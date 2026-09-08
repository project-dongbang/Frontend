import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

type FieldBaseProps = { label?: string; required?: boolean; error?: string; hint?: string; children: ReactNode }

export function FormField({ label, required, error, hint, children }: FieldBaseProps) {
  return <label className={`form-field ${error ? 'has-error' : ''}`}>
    {label && <span className="field-label">{label}{required && <em>필수</em>}</span>}
    {children}
    {(error || hint) && <small className={error ? 'field-error' : 'field-hint'}>{error ?? hint}</small>}
  </label>
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & Omit<FieldBaseProps, 'children'>
export function Input({ label, required, error, hint, className = '', ...props }: InputProps) {
  return <FormField label={label} required={required} error={error} hint={hint}><input className={`field-control ${className}`.trim()} {...props} /></FormField>
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & Omit<FieldBaseProps, 'children'>
export function Textarea({ label, required, error, hint, className = '', ...props }: TextareaProps) {
  return <FormField label={label} required={required} error={error} hint={hint}><textarea className={`field-control field-textarea ${className}`.trim()} {...props} /></FormField>
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & Omit<FieldBaseProps, 'children'>
export function Select({ label, required, error, hint, className = '', children, ...props }: SelectProps) {
  return <FormField label={label} required={required} error={error} hint={hint}><select className={`field-control ${className}`.trim()} {...props}>{children}</select></FormField>
}
