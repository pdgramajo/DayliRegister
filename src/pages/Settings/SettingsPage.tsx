import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { LogRepository } from '../../repositories/LogRepository'
import type { LogEntry, LogLevel } from '../../types/entities'
import { Button, toast } from '../../components/ui'
import {
  ArrowLeft,
  Trash2,
  Copy,
  AlertTriangle,
  Info,
  Bug,
  XCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
} from 'lucide-react'

type FilterLevel = LogLevel | 'all'

const LEVEL_CONFIG: Record<
  FilterLevel,
  { label: string; color: string; icon: typeof Info }
> = {
  all: { label: 'Todos', color: '', icon: Info },
  error: {
    label: 'Error',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
  },
  warn: {
    label: 'Advertencia',
    color:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: AlertTriangle,
  },
  info: {
    label: 'Info',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Info,
  },
  debug: {
    label: 'Debug',
    color:
      'bg-surface-200 text-content-600 dark:bg-surface-700 dark:text-content-400',
    icon: Bug,
  },
}

export const SettingsPage = () => {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterLevel>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      // Auto-cleanup logs older than 30 days on open
      await LogRepository.deleteOlderThan(30)
      const level = filter === 'all' ? undefined : filter
      const data = await LogRepository.getAll(level)
      setLogs(data)
    } catch (error) {
      toast.error('Error al cargar los logs')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleClear = async () => {
    setClearing(true)
    try {
      await LogRepository.clearAll()
      setLogs([])
      toast.success('Logs eliminados')
    } catch {
      toast.error('Error al eliminar los logs')
    } finally {
      setClearing(false)
    }
  }

  const handleCopy = async () => {
    const text = logs
      .map(
        (log) =>
          `[${log.createdAt}] [${log.level.toUpperCase()}] ${log.message}${
            log.context ? ` (${log.context})` : ''
          }`
      )
      .join('\n')

    try {
      await navigator.clipboard.writeText(text)
      toast.success('Logs copiados al portapapeles')
    } catch {
      toast.error('Error al copiar')
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const errorCount = logs.filter((l) => l.level === 'error').length

  return (
    <div className="h-screen flex flex-col bg-surface-50 dark:bg-surface-900">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="shrink-0 px-4 pt-6 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="text-sm text-content-500 hover:text-content-700 dark:hover:text-content-300 transition-colors mb-4 block"
          >
            <ArrowLeft className="size-4 inline mr-1" />
            Volver
          </button>

          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="size-6 text-amber-500" />
            <h1 className="text-xl font-bold text-content-900 dark:text-white">
              Configuración
            </h1>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-8 sm:px-6 lg:px-8 space-y-6">
          {/* Log viewer section */}
          <section className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-content-700 dark:text-content-300">
                Registro de errores
              </h2>
              {errorCount > 0 && (
                <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                  {errorCount} error{errorCount !== 1 ? 'es' : ''}
                </span>
              )}
            </div>

            {/* Filters & actions */}
            <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(LEVEL_CONFIG) as FilterLevel[]).map((key) => {
                  const cfg = LEVEL_CONFIG[key]
                  const isActive = filter === key
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        isActive
                          ? key === 'all'
                            ? 'bg-brand-500 text-white'
                            : cfg.color
                          : 'bg-surface-100 text-content-500 dark:bg-surface-700 dark:text-content-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={logs.length === 0}
                  className="gap-1.5 text-xs"
                >
                  <Copy className="size-3.5" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  loading={clearing}
                  disabled={logs.length === 0}
                  className="gap-1.5 text-xs text-red-600 dark:text-red-400"
                >
                  <Trash2 className="size-3.5" />
                  Limpiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadLogs}
                  loading={loading}
                  className="gap-1.5 text-xs ml-auto"
                >
                  Actualizar
                </Button>
              </div>
            </div>

            {/* Log list */}
            <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {loading && logs.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="size-6 border-2 border-surface-300 dark:border-surface-600 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardList className="size-10 text-content-300 dark:text-content-600 mb-3" />
                  <p className="text-sm text-content-500 dark:text-content-400">
                    No hay registros
                  </p>
                  <p className="text-xs text-content-400 dark:text-content-500 mt-1">
                    Los errores y eventos del sistema aparecerán aquí
                  </p>
                </div>
              ) : (
                logs.map((log) => {
                  const cfg = LEVEL_CONFIG[log.level]
                  const isExpanded = expandedId === log.id

                  return (
                    <div key={log.id} className="px-4 py-2.5">
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : log.id)
                        }
                        className="w-full flex items-start gap-2.5 text-left"
                      >
                        <span
                          className={`mt-0.5 shrink-0 rounded-full p-0.5 ${
                            log.level === 'error'
                              ? 'text-red-500'
                              : log.level === 'warn'
                                ? 'text-amber-500'
                                : log.level === 'debug'
                                  ? 'text-content-400'
                                  : 'text-blue-500'
                          }`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronRight className="size-3.5" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${cfg.color}`}
                            >
                              {log.level}
                            </span>
                            <span className="text-[11px] text-content-400 dark:text-content-500 font-mono">
                              {formatDate(log.createdAt)}
                            </span>
                            {log.context && (
                              <span className="text-[11px] text-content-400 dark:text-content-500 truncate">
                                {log.context}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-content-800 dark:text-content-200 break-words">
                            {log.message}
                          </p>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 ml-6 space-y-1.5">
                          {log.stack && (
                            <pre className="text-[11px] text-content-500 dark:text-content-400 bg-surface-100 dark:bg-surface-700/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                              {log.stack}
                            </pre>
                          )}
                          {log.url && (
                            <p className="text-[11px] text-content-400 dark:text-content-500 font-mono truncate">
                              URL: {log.url}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
