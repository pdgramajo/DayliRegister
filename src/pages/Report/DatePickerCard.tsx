import { useRef, type ChangeEvent } from 'react'
import { CalendarDays } from 'lucide-react'

interface DatePickerCardProps {
  label: string
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
}

const formatDateDisplay = (iso: string): string => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export const DatePickerCard = ({
  label,
  value,
  onChange,
}: DatePickerCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    // showPicker() is supported in modern browsers; fallback to click()
    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker()
    } else {
      inputRef.current?.click()
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const formatted = formatDateDisplay(value)

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative flex flex-col items-start gap-1.5 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-brand-300 active:scale-[0.98] dark:border-surface-700 dark:bg-surface-800 dark:hover:border-brand-500/50 text-left w-full"
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest text-content-400 dark:text-content-500">
        {label}
      </span>

      <div className="flex items-center justify-between w-full gap-2">
        <span className="text-[15px] font-semibold text-content-900 dark:text-white tabular-nums">
          {formatted || (
            <span className="text-content-300 dark:text-content-600">
              Seleccionar
            </span>
          )}
        </span>
        <CalendarDays className="size-5 shrink-0 text-content-300 dark:text-content-600 transition-colors group-hover:text-brand-500" />
      </div>

      {/* Hidden native date input */}
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden
      />
    </button>
  )
}
