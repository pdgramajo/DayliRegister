import { LogRepository } from '../repositories/LogRepository'
import type { LogLevel } from '../types/entities'

const getContextFromStack = (): string => {
  try {
    throw new Error('stack')
  } catch (e: unknown) {
    const stack = (e as Error).stack ?? ''
    // stack[0] is this function, stack[1] is log/error/warn/info, stack[2] is caller
    const lines = stack.split('\n')
    // Find the first line that's not from LoggerService itself
    for (const line of lines) {
      const match = line.match(/at\s+(.+?)\s+\(/)
      if (match && !match[1].includes('LoggerService')) {
        return match[1].split(' ')[0] || 'unknown'
      }
    }
    return 'unknown'
  }
}

export const LoggerService = {
  async log(
    level: LogLevel,
    message: string,
    context?: string,
    error?: unknown
  ): Promise<string> {
    const id = await LogRepository.create({
      level,
      message,
      context: context || getContextFromStack(),
      stack: error instanceof Error ? error.stack : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    })

    // Auto-cleanup old logs every 20 writes (probabilistic)
    if (Math.random() < 0.05) {
      LogRepository.deleteOlderThan(30).catch(() => {})
    }

    return id
  },

  async info(message: string, context?: string): Promise<string> {
    return LoggerService.log('info', message, context)
  },

  async warn(message: string, context?: string): Promise<string> {
    return LoggerService.log('warn', message, context)
  },

  async error(
    message: string,
    context?: string,
    error?: unknown
  ): Promise<string> {
    return LoggerService.log('error', message, context, error)
  },

  async debug(message: string, context?: string): Promise<string> {
    return LoggerService.log('debug', message, context)
  },
}
