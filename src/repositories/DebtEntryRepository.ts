import { db } from '../db'
import type { DebtEntry } from '../types/entities'
import type { CreateDebtEntryDTO } from '../types/dtos'
import { getTimestamp } from '../lib/utils'

export const DebtEntryRepository = {
  async getByClient(clientId: string): Promise<DebtEntry[]> {
    return db.debtEntries
      .where('clientId')
      .equals(clientId)
      .and((entry) => !entry.deletedAt)
      .toArray()
  },

  async getById(id: string): Promise<DebtEntry | undefined> {
    return db.debtEntries.get(id)
  },

  async create(data: CreateDebtEntryDTO): Promise<string> {
    const now = getTimestamp()
    return db.debtEntries.add({
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    })
  },

  async delete(id: string): Promise<number> {
    return db.debtEntries.update(id, {
      deletedAt: getTimestamp(),
    })
  },
}
