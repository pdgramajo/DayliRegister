import * as React from 'react'
import { cn } from '../../lib/utils'

const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-2xl bg-white border border-gray-200/60 shadow-lg shadow-gray-200/40 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-0.5 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-850 dark:border-gray-700/50 dark:shadow-none dark:hover:shadow-none dark:hover:border-indigo-500/30',
      className
    )}
    {...props}
  />
)

const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
)

const CardTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  >
    {children}
  </h3>
)

const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-gray-500', className)} {...props} />
)

const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
)

const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
)

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
