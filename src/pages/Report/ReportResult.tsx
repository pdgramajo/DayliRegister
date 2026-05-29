import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '../../components/ui'
import { toast } from '../../components/ui'
import type { ReportData } from '../../services/ReportService'

interface ReportResultProps {
  data: ReportData
  reportText: string
}

export const ReportResult = ({ data, reportText }: ReportResultProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true)
      toast.success('Reporte copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    })
  }, [reportText])

  if (data.salesByDay.length === 0 && data.totalSales === 0) {
    return (
      <div className="text-center py-8 text-content-500 dark:text-content-400">
        <p>No hay datos para el período seleccionado.</p>
        <p className="text-sm mt-1">Probá con otro rango de fechas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-content-700 dark:text-content-300">
          Vista previa
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1.5"
        >
          {copied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4" />
          )}
          {copied ? 'Copiado' : 'Copiar texto'}
        </Button>
      </div>

      <pre className="bg-surface-100 dark:bg-surface-800/50 rounded-xl p-4 text-sm text-content-700 dark:text-content-300 font-mono whitespace-pre-wrap overflow-x-auto border border-surface-200 dark:border-surface-700">
        {reportText}
      </pre>
    </div>
  )
}
