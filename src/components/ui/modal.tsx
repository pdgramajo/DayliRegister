import {
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/* ─── Context ─── */

interface ModalContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

const useModalContext = () => {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('Modal sub-components must be used within <Modal>')
  return ctx
}

/* ─── Root ─── */

interface ModalRootProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  children: ReactNode
}

const ModalRoot = ({
  open: controlledOpen,
  onOpenChange,
  onClose,
  children,
}: ModalRootProps) => {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      if (!next) onClose?.()
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange, onClose]
  )

  return (
    <ModalContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </ModalContext.Provider>
  )
}

/* ─── Trigger ─── */

interface TriggerProps {
  asChild?: boolean
  children: ReactNode
}

const Trigger = ({ asChild, children }: TriggerProps) => {
  const { onOpenChange } = useModalContext()
  if (asChild) {
    return (
      <TriggerSlot onClick={() => onOpenChange(true)}>{children}</TriggerSlot>
    )
  }
  return (
    <button type="button" onClick={() => onOpenChange(true)}>
      {children}
    </button>
  )
}

/** Wraps a single child cloning onClick into it (basic asChild pattern) */
const TriggerSlot = ({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) => {
  const child = Array.isArray(children) ? children[0] : children
  if (!child || typeof child !== 'object' || !('type' in (child as object))) {
    return <button onClick={onClick}>{children}</button>
  }
  return <ChildClone onClick={onClick}>{child}</ChildClone>
}

const ChildClone = ({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) => {
  /* Simple clone using a span wrapper — consumers can style the trigger themselves */
  return (
    <span onClick={onClick} style={{ display: 'inline-flex' }}>
      {children}
    </span>
  )
}

/* ─── Close ─── */

interface CloseProps {
  asChild?: boolean
  children?: ReactNode
}

const Close = ({ asChild, children }: CloseProps) => {
  const { onOpenChange } = useModalContext()
  if (asChild && children) {
    return (
      <span
        onClick={() => onOpenChange(false)}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </span>
    )
  }
  return (
    <button
      onClick={() => onOpenChange(false)}
      className="p-1 rounded-lg text-content-400 hover:text-content-600 dark:hover:text-content-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
      aria-label="Cerrar"
    >
      {children ?? <X className="size-4" />}
    </button>
  )
}

/* ─── Content ─── */

interface ContentProps {
  title?: string
  children: ReactNode
  className?: string
}

const Content = ({ title, children, className }: ContentProps) => {
  const { open, onOpenChange } = useModalContext()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={`relative w-full max-w-sm bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-xl p-6 ${className ?? ''}`}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-content-900 dark:text-content-100">
              {title}
            </h2>
            <Close />
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}

/* ─── Export compound ─── */

export const Modal = Object.assign(ModalRoot, {
  Trigger,
  Content,
  Close,
})
