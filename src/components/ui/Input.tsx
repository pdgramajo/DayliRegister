import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = ({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) => {
  const inputId = id || props.name

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 border rounded-lg
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400'
          }
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
