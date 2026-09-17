import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './Button'

type ModalProps = { open: boolean; title: string; description?: string; children?: ReactNode; confirmLabel?: string; cancelLabel?: string; tone?: 'default' | 'danger'; className?: string; footer?: ReactNode; onClose: () => void; onConfirm?: () => void }

export function Modal({ open, title, description, children, confirmLabel = '저장', cancelLabel = '취소', tone = 'default', className = '', footer, onClose, onConfirm }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLElement>(null)
  useEffect(() => { if (!open) return; const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [open, onClose])
  useEffect(() => {
    if (!open || !dialogRef.current) return
    const dialog = dialogRef.current
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')).filter((element) => element.getClientRects().length > 0)
    ;(dialog.querySelector<HTMLElement>('input:not(:disabled), select:not(:disabled)') ?? focusable()[0] ?? dialog).focus()
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0]
      const last = elements.at(-1)
      if (!first) { event.preventDefault(); dialog.focus(); return }
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last?.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first.focus()
      }
    }
    document.addEventListener('keydown', trapFocus)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', trapFocus)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [open])
  if (!open) return null
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section ref={dialogRef} tabIndex={-1} className={`modal modal-${tone} ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()}><header><div><span className="modal-kicker">DONG BANG</span><h2 id={titleId}>{title}</h2></div><button type="button" aria-label="닫기" onClick={onClose}>×</button></header><div className="modal-body">{description && <p className="modal-description">{description}</p>}{children}</div>{footer ?? (onConfirm && <footer><Button variant="secondary" onClick={onClose}>{cancelLabel}</Button><Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button></footer>)}</section></div>
}
