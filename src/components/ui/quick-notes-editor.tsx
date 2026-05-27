import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { QuickValuesService } from '../../services/QuickValuesService'

interface QuickNotesEditorProps {
  storageKey: string
  onSelect: (value: string) => void
  selected?: string
}

export const QuickNotesEditor = ({
  storageKey,
  onSelect,
  selected,
}: QuickNotesEditorProps) => {
  const [values, setValues] = useState<string[]>([])
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newValue, setNewValue] = useState('')

  useEffect(() => {
    setValues(QuickValuesService.load<string>(storageKey))
    setEditing(false)
    setAdding(false)
    setNewValue('')
  }, [storageKey])

  const handleDelete = (value: string) => {
    const updated = values.filter((v) => v !== value)
    setValues(updated)
    QuickValuesService.save<string>(storageKey, updated)
  }

  const handleAdd = () => {
    const trimmed = newValue.trim()
    if (!trimmed) return
    const updated = [...values, trimmed]
    setValues(updated)
    QuickValuesService.save<string>(storageKey, updated)
    setNewValue('')
    setAdding(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-content-700 dark:text-content-300">
          Notas rápidas
        </span>
        <button
          type="button"
          onClick={() => {
            setEditing((prev) => !prev)
            setAdding(false)
            setNewValue('')
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
                  : value === selected
                    ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30'
                    : 'border-transparent bg-surface-100 dark:bg-surface-700 text-content-600 dark:text-content-300 hover:bg-surface-200 dark:hover:bg-surface-600'
              }`}
            >
              {value}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => handleDelete(value)}
                aria-label={`Eliminar ${value}`}
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
                aria-label="Agregar nota rápida"
                className="size-7 flex items-center justify-center rounded-lg border border-dashed border-surface-300 dark:border-surface-600 text-content-400 hover:text-content-600 dark:hover:text-content-300 hover:border-surface-400 transition-colors"
              >
                <Plus className="size-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAdd()
                    }
                  }}
                  className="h-7 w-28 text-xs rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-2 py-0 text-content-900 dark:text-content-100 placeholder:text-content-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  placeholder="Nueva nota"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newValue.trim()}
                  aria-label="Confirmar nota rápida"
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
