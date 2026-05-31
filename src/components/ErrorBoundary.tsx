import { Component, type ReactNode, type ErrorInfo } from 'react'
import { LoggerService } from '../services/LoggerService'
import { AlertTriangle, RotateCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

const isChunkLoadError = (error: Error) =>
  error.name === 'ChunkLoadError' ||
  /Loading chunk.*failed/i.test(error.message) ||
  /Failed to fetch dynamically imported module/i.test(error.message)

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    LoggerService.error(
      `ErrorBoundary: ${error.message}`,
      'ErrorBoundary.componentDidCatch',
      error
    )
  }

  handleReload = () => {
    if (isChunkLoadError(this.state.error!)) {
      // For chunk load failures, a full page reload is needed
      // so the Service Worker serves the correct version
      window.location.reload()
    } else {
      this.setState({ hasError: false, error: undefined })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isChunkError = isChunkLoadError(this.state.error!)

      return (
        <div
          role="alert"
          className="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-900 p-6"
        >
          <div className="text-center max-w-sm">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 mb-4">
              <AlertTriangle className="size-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-content-900 dark:text-white mb-2">
              Algo salió mal
            </h2>
            <p className="text-sm text-content-500 dark:text-content-400 mb-6">
              {isChunkError
                ? 'La aplicación se actualizó. Necesitás recargar la página para continuar.'
                : this.state.error?.message || 'Ocurrió un error inesperado.'}
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <RotateCw className="size-4" />
              {isChunkError ? 'Recargar página' : 'Intentar de nuevo'}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
