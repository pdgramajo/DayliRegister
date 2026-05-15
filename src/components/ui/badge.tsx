import * as React from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'border-transparent bg-brand-600 text-white dark:bg-brand-500 dark:text-white',
  secondary:
    'border-transparent bg-surface-100 text-content-900 dark:bg-surface-700 dark:text-content-100',
  destructive:
    'border-transparent bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
  outline:
    'border border-surface-200 text-content-950 dark:text-content-200 dark:border-surface-700',
  success:
    'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
  warning:
    'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
export type { BadgeVariant, BadgeProps }
