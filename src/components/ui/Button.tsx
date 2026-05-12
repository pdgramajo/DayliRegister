import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variantStyles = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md',
  secondary:
    'bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900',
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-sm font-medium min-h-[44px]',
  lg: 'px-6 py-3 text-base font-semibold min-h-[52px]',
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-xl
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
