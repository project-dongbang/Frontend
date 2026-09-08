import { useEffect, type ReactNode } from 'react'
import { Button } from './Button'

type ModalProps = { open: boolean; title: string; description?: string; children?: ReactNode; confirmLabel?: string; cancelLabel?: string; tone?: 'default' | 'danger'; onClose: () => void; onConfirm?: () => void }

export function Modal({ open, title, description, children, confirmLabel = '저장', cancelLabel = '취소', tone = 'default', onClose, onConfirm }: ModalProps) {
  useEffect(() => { if (!open) return; const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [open, onClose])
  if (!open) return null
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className={`modal modal-${tone}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="modal-kicker">DONG BANG</span><h2 id="modal-title">{title}</h2></div><button type="button" aria-label="닫기" onClick={onClose}>×</button></header><div className="modal-body">{description && <p className="modal-description">{description}</p>}{children}</div>{onConfirm && <footer><Button variant="secondary" onClick={onClose}>{cancelLabel}</Button><Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button></footer>}</section></div>
}
