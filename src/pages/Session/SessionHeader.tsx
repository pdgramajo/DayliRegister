import { Button } from '../../components/ui'

interface SessionHeaderBaseProps {
  name: string
  onBack: () => void
}

interface SessionHeaderOpenProps extends SessionHeaderBaseProps {
  onClose: () => void
}

export const SessionHeaderOpen = ({
  name,
  onClose,
  onBack,
}: SessionHeaderOpenProps) => (
  <div className="flex items-center justify-between mb-2 lg:mb-3">
    <button
      onClick={onBack}
      className="text-base lg:text-lg text-content-500 hover:text-content-700 dark:hover:text-content-300 transition-colors"
    >
      ← Atrás
    </button>
    <span className="text-base lg:text-xl font-semibold text-content-900 dark:text-content-100">
      {name}
    </span>
    <Button variant="destructive" size="default" onClick={onClose}>
      Cerrar
    </Button>
  </div>
)

export const SessionHeaderClosed = ({
  name,
  onBack,
}: SessionHeaderBaseProps) => (
  <div className="flex items-center justify-between mb-2 lg:mb-3">
    <button
      onClick={onBack}
      className="text-base lg:text-lg text-content-500 hover:text-content-700 dark:hover:text-content-300 transition-colors"
    >
      ← Atrás
    </button>
    <span className="text-base lg:text-xl font-semibold text-content-900 dark:text-content-100">
      {name}
    </span>
    <div className="w-16" />
  </div>
)
