import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export const Modal = ({ open, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-xl p-6">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-content-900 dark:text-content-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-content-400 hover:text-content-600 dark:hover:text-content-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}
