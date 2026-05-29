import { Button } from '../../components/ui'

interface SessionHeaderProps {
  name: string
  isOpen: boolean
  onClose: () => void
  onBack: () => void
}

export const SessionHeader = ({
  name,
  isOpen,
  onClose,
  onBack,
}: SessionHeaderProps) => (
  <div className="flex items-center justify-between mb-2">
    <button
      onClick={onBack}
      className="text-sm text-content-500 hover:text-content-700 dark:hover:text-content-300 transition-colors"
    >
      ← Atrás
    </button>
    <span className="text-lg font-semibold text-content-900 dark:text-content-100">
      {name}
    </span>
    {isOpen ? (
      <Button variant="destructive" size="sm" onClick={onClose}>
        Cerrar
      </Button>
    ) : (
      <div className="w-16" />
    )}
  </div>
)
