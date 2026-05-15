import * as React from 'react'
import { cn } from '../../lib/utils'

export interface MoneyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value?: number
  onChange?: (value: number | undefined) => void
  prefix?: string
  suffix?: string
}

const formatNumber = (value: string): string => {
  const numericValue = value.replace(/[^0-9]/g, '')
  if (!numericValue) return ''
  return parseInt(numericValue, 10).toLocaleString('es-AR')
}

const parseNumber = (value: string): number | undefined => {
  const numericValue = value.replace(/[^0-9]/g, '')
  if (!numericValue) return undefined
  return parseInt(numericValue, 10)
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value, onChange, prefix = '$', suffix, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('')

    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(formatNumber(value.toString()))
      } else {
        setDisplayValue('')
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formattedValue = formatNumber(inputValue)
      setDisplayValue(formattedValue)

      const numericValue = parseNumber(inputValue)
      onChange?.(numericValue)
    }

    const handleBlur = () => {
      if (value !== undefined) {
        setDisplayValue(formatNumber(value.toString()))
      }
    }

    return (
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-content-500 dark:text-content-400">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'flex h-10 w-full rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-content-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-700 dark:bg-surface-800 dark:text-content-100 dark:placeholder:text-content-500 dark:focus-visible:ring-offset-surface-900',
            prefix && 'pl-7',
            suffix && 'pr-7',
            className
          )}
          placeholder={props.placeholder || '0'}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-content-500 dark:text-content-400">
            {suffix}
          </span>
        )}
      </div>
    )
  }
)

MoneyInput.displayName = 'MoneyInput'
