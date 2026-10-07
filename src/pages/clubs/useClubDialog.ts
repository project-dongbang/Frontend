import { useEffect, useRef, type MouseEvent } from 'react'

type ClubDialogOptions = {
  onClose: () => void
  closeOnDesktop?: boolean
  escapeOnDesktop?: boolean
}

export function useClubDialog<T extends HTMLElement>({
  onClose,
  closeOnDesktop = false,
  escapeOnDesktop = false,
}: ClubDialogOptions) {
  const dialogRef = useRef<T>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 760px)')
    let restoreMobileBehavior = () => {}

    const applyMobileBehavior = () => {
      restoreMobileBehavior()
      restoreMobileBehavior = () => {}
      if (!mobileViewport.matches) return

      const dialog = dialogRef.current
      const previousOverflow = document.body.style.overflow
      const focusableSelector =
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'
      const trapFocus = (event: KeyboardEvent) => {
        if (event.key !== 'Tab' || !dialog) return

        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>(focusableSelector),
        ).filter((element) => element.getClientRects().length > 0)
        const first = focusable[0]
        const last = focusable.at(-1)
        if (!first || !last) return

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', trapFocus)
      window.requestAnimationFrame(() => {
        const autofocusTarget = dialog?.querySelector<HTMLElement>('[autofocus]')
        ;(autofocusTarget ?? dialog?.querySelector<HTMLElement>(focusableSelector) ?? dialog)?.focus()
      })

      restoreMobileBehavior = () => {
        document.body.style.overflow = previousOverflow
        document.removeEventListener('keydown', trapFocus)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        (mobileViewport.matches || escapeOnDesktop)
      ) {
        event.preventDefault()
        onCloseRef.current()
      }
    }

    applyMobileBehavior()
    document.addEventListener('keydown', handleEscape)
    mobileViewport.addEventListener('change', applyMobileBehavior)

    return () => {
      restoreMobileBehavior()
      document.removeEventListener('keydown', handleEscape)
      mobileViewport.removeEventListener('change', applyMobileBehavior)
    }
  }, [escapeOnDesktop])

  const handleBackdropMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (
      event.target === event.currentTarget &&
      (window.matchMedia('(max-width: 760px)').matches || closeOnDesktop)
    ) {
      onCloseRef.current()
    }
  }

  return { dialogRef, handleBackdropMouseDown }
}
