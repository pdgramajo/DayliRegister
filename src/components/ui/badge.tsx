import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
  {
    variants: {
      default:
        'border-transparent bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white',
      secondary:
        'border-transparent bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
      destructive:
        'border-transparent bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
      outline: 'text-gray-950 dark:text-gray-200',
      success:
        'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
      warning:
        'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
