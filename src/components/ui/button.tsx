import { type Ref, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md dark:bg-brand-500 dark:hover:bg-brand-600',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
        outline:
          'border border-surface-200 bg-white shadow-sm hover:bg-surface-50 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-800 dark:hover:bg-surface-700',
        secondary:
          'bg-surface-100 text-content-900 shadow-sm hover:bg-surface-200 dark:bg-surface-700 dark:text-content-100 dark:hover:bg-surface-600',
        ghost:
          'hover:bg-surface-100 hover:text-content-900 dark:hover:bg-surface-800 dark:hover:text-content-100',
        link: 'text-brand-600 underline-offset-4 hover:underline dark:text-brand-400',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 rounded-xl px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  ref?: Ref<HTMLButtonElement>
}

const Button = ({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ref,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : 'button'

  if (asChild) {
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {children}
      </Comp>
    )
  }

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
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
    </Comp>
  )
}
Button.displayName = 'Button'

export { Button, buttonVariants }
