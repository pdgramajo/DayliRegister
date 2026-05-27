import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { MoneyInput } from './money-input'
import { QuickValuesService } from '../../services/QuickValuesService'

interface QuickValuesEditorProps {
  storageKey: string
  onSelect: (value: number) => void
  formatValue?: (value: number) => string
}

export const QuickValuesEditor = ({
  storageKey,
  onSelect,
  formatValue = (v) => v.toString(),
}: QuickValuesEditorProps) => {
  const [values, setValues] = useState<number[]>([])
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newValue, setNewValue] = useState<number | undefined>()

  useEffect(() => {
    setValues(QuickValuesService.load(storageKey))
    setEditing(false)
    setAdding(false)
    setNewValue(undefined)
  }, [storageKey])

  const handleDelete = (value: number) => {
    const updated = values.filter((v) => v !== value)
    setValues(updated)
    QuickValuesService.save(storageKey, updated)
  }

  const handleAdd = () => {
    if (newValue === undefined || newValue <= 0) return
    const updated = [...values, newValue]
    setValues(updated)
    QuickValuesService.save(storageKey, updated)
    setNewValue(undefined)
    setAdding(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-content-700 dark:text-content-300">
          Valores rápidos
        </span>
        <button
          type="button"
          onClick={() => {
            setEditing((prev) => !prev)
            setAdding(false)
            setNewValue(undefined)
          }}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {editing ? 'Hecho' : 'Editar'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <div key={value} className="relative">
            <button
              type="button"
              onClick={() => !editing && onSelect(value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                editing
                  ? 'pr-7 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'border-transparent bg-surface-100 dark:bg-surface-700 text-content-600 dark:text-content-300 hover:bg-surface-200 dark:hover:bg-surface-600'
              }`}
            >
              {formatValue(value)}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => handleDelete(value)}
                aria-label={`Eliminar ${formatValue(value)}`}
                className="absolute -top-1.5 -right-1.5 size-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] leading-none"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        ))}
        {editing && (
          <>
            {!adding ? (
              <button
                type="button"
                onClick={() => setAdding(true)}
                aria-label="Agregar valor rápido"
                className="size-7 flex items-center justify-center rounded-lg border border-dashed border-surface-300 dark:border-surface-600 text-content-400 hover:text-content-600 dark:hover:text-content-300 hover:border-surface-400 transition-colors"
              >
                <Plus className="size-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <MoneyInput
                  value={newValue}
                  onChange={(v) => setNewValue(v)}
                  prefix=""
                  className="h-7 w-20 text-xs rounded-lg !px-1 !py-0"
                  placeholder="0"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newValue || newValue <= 0}
                  aria-label="Confirmar valor rápido"
                  className="size-7 flex items-center justify-center rounded-lg bg-brand-600 text-white disabled:opacity-50"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
