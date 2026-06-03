import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Database, Upload, Download } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { BackupRestoreService } from '../../services/BackupRestoreService'
import type {
  BackupData,
  RestoreSummary,
} from '../../services/BackupRestoreService'
import { Button, Modal, toast } from '../../components/ui'

export const BackupPage = () => {
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreData, setRestoreData] = useState<BackupData | null>(null)
  const [restoreSummary, setRestoreSummary] = useState<RestoreSummary | null>(
    null
  )
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const lastBackupDate = BackupRestoreService.getLastBackupDate()

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const { blob, filename } = await BackupRestoreService.exportFullBackup()

      // Intentar Web Share API primero (Android/iOS)
      const file = new File([blob], filename, { type: 'application/json' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'DayliRegister Backup',
        })
        toast.success('Backup compartido correctamente')
      } else {
        // Fallback: descarga tradicional
        BackupRestoreService.downloadAsFile(blob, filename)
        toast.success('Backup descargado correctamente')
      }
    } catch (error) {
      // AbortError = usuario canceló el compartir → no mostrar error
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast.error(
        error instanceof Error ? error.message : 'Error al generar el backup'
      )
    } finally {
      setExporting(false)
    }
  }, [])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setImporting(true)
      try {
        const data = await BackupRestoreService.importFullBackup(file)
        const summary = BackupRestoreService.getRestoreSummary(data)
        setRestoreData(data)
        setRestoreSummary(summary)
        setShowConfirmModal(true)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Error al leer el archivo'
        )
      } finally {
        setImporting(false)
        // Reset input so same file can be selected again
        e.target.value = ''
      }
    },
    []
  )

  const handleRestore = useCallback(async () => {
    if (!restoreData) return

    setRestoring(true)
    try {
      await BackupRestoreService.applyRestore(restoreData)
      toast.success('Datos restaurados correctamente')
      setShowConfirmModal(false)
      setRestoreData(null)
      setRestoreSummary(null)
      setConfirmText('')
      // Redirigir al home después de restaurar
      navigate(ROUTES.HOME)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al restaurar los datos'
      )
    } finally {
      setRestoring(false)
    }
  }, [restoreData, navigate])

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Nunca'
    const d = new Date(iso)
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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
            <Database className="size-6 text-indigo-500" />
            <h1 className="text-xl font-bold text-content-900 dark:text-white">
              Backup de datos
            </h1>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-8 sm:px-6 lg:px-8 space-y-6">
          {/* Backup section */}
          <section className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50">
              <h2 className="text-sm font-semibold text-content-700 dark:text-content-300">
                Descargar backup
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-content-600 dark:text-content-400">
                Descargá un archivo con todos los datos de la aplicación
                (sucursales, transacciones, productos, clientes, etc.) para
                guardarlo como respaldo.
              </p>
              <div className="flex items-center gap-2 text-xs text-content-500 dark:text-content-400">
                <span>Último backup:</span>
                <span className="font-medium text-content-700 dark:text-content-300">
                  {formatDate(lastBackupDate)}
                </span>
              </div>
              <Button
                variant="default"
                onClick={handleExport}
                loading={exporting}
                className="gap-2"
              >
                <Download className="size-4" />
                {exporting ? 'Generando backup...' : 'Descargar Backup'}
              </Button>
            </div>
          </section>

          {/* Restore section */}
          <section className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50">
              <h2 className="text-sm font-semibold text-content-700 dark:text-content-300">
                Restaurar datos
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-content-600 dark:text-content-400">
                Seleccioná un archivo de backup previamente descargado para
                restaurar los datos.
              </p>

              {/* Warning */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                <span className="text-amber-600 dark:text-amber-400 text-lg leading-none mt-0.5">
                  ⚠️
                </span>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Esta acción{' '}
                  <strong>reemplazará todos los datos actuales</strong> por los
                  del archivo de backup. Asegurate de haber descargado un backup
                  actual antes de restaurar.
                </p>
              </div>

              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={importing}
                />
                <Button
                  variant="outline"
                  asChild
                  disabled={importing}
                  className="gap-2 cursor-pointer"
                >
                  <span>
                    <Upload className="size-4" />
                    {importing
                      ? 'Leyendo archivo...'
                      : 'Seleccionar archivo de backup'}
                  </span>
                </Button>
              </label>
            </div>
          </section>

          {/* Info section */}
          <section className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50">
              <h2 className="text-sm font-semibold text-content-700 dark:text-content-300">
                ¿Qué se guarda en el backup?
              </h2>
            </div>
            <div className="p-4">
              <ul className="text-sm text-content-600 dark:text-content-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-500 shrink-0" />
                  Todas las sucursales y sesiones de caja
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-500 shrink-0" />
                  Transacciones (ventas, gastos, retiros, ingresos)
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-500 shrink-0" />
                  Productos, precios y categorías
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-500 shrink-0" />
                  Inventario y movimientos
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-500 shrink-0" />
                  Clientes y deudas
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-indigo-500 shrink-0" />
                  Configuración (tema, valores rápidos, preferencias)
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      {/* Confirm restore modal */}
      <Modal
        open={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setConfirmText('')
        }}
        title="Restaurar datos"
      >
        {restoreSummary && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
              <span className="text-red-600 dark:text-red-400 text-lg leading-none mt-0.5">
                ⚠️
              </span>
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                  ¿Estás seguro?
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                  Esta acción{' '}
                  <strong>reemplazará todos los datos actuales</strong> de la
                  aplicación por los del backup. No se puede deshacer.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-content-500 dark:text-content-400 uppercase tracking-wide mb-2">
                Resumen del backup
              </p>
              <p className="text-xs text-content-400 dark:text-content-500 mb-3">
                Backup del: {formatDate(restoreSummary.exportedAt)}
              </p>
              <div className="bg-surface-50 dark:bg-surface-700/30 rounded-xl p-3 space-y-1">
                {restoreSummary.tables.map((table) => (
                  <div
                    key={table.name}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-content-600 dark:text-content-400">
                      {table.name}
                    </span>
                    <span className="font-medium text-content-800 dark:text-content-200">
                      {table.count.toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
                <div className="border-t border-surface-200 dark:border-surface-600 pt-1 mt-1 flex justify-between text-sm font-semibold">
                  <span className="text-content-700 dark:text-content-300">
                    Total
                  </span>
                  <span className="text-content-900 dark:text-white">
                    {restoreSummary.totalRecords.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-content-600 dark:text-content-400 mb-2">
                Escribí <strong>RESTAURAR</strong> para confirmar:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESTAURAR"
                className="w-full px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-content-900 dark:text-white placeholder:text-content-400 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmModal(false)
                  setConfirmText('')
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleRestore}
                loading={restoring}
                disabled={confirmText !== 'RESTAURAR'}
                className="gap-2"
              >
                <Upload className="size-4" />
                {restoring ? 'Restaurando...' : 'Restaurar datos'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
