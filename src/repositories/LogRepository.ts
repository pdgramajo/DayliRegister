import { db } from '../db'
import type { LogEntry, LogLevel } from '../types/entities'
import { getTimestamp } from '../lib/utils'

const MAX_LOG_AGE_DAYS = 30

export const LogRepository = {
  async create(
    data: Omit<LogEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const now = getTimestamp()
    return db.logs.add({
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    })
  },

  async getAll(level?: LogLevel, limit = 200): Promise<LogEntry[]> {
    let collection = db.logs.orderBy('createdAt').reverse().limit(limit)
    if (level) {
      const all = await collection.toArray()
      return all.filter((log) => log.level === level)
    }
    return collection.toArray()
  },

  async deleteOlderThan(days: number = MAX_LOG_AGE_DAYS): Promise<number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString()

    const oldLogs = await db.logs.where('createdAt').below(cutoffStr).toArray()

    const ids = oldLogs.map((log) => log.id)
    if (ids.length === 0) return 0

    await db.logs.bulkDelete(ids)
    return ids.length
  },

  async clearAll(): Promise<void> {
    await db.logs.clear()
  },
}
