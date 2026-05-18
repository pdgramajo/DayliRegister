import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let lastTimestamp = 0

export const getTimestamp = (): string => {
  const now = Date.now()
  const time = now <= lastTimestamp ? lastTimestamp + 1 : now
  lastTimestamp = time
  return new Date(time).toISOString()
}
