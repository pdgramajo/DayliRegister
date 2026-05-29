import { db } from '../db'
import type { Transaction } from '../types/entities'
import type { CreateTransactionDTO } from '../types/dtos'
import { getTimestamp } from '../lib/utils'

export const TransactionRepository = {
  async getBySessionId(sessionId: string): Promise<Transaction[]> {
    const transactions = await db.transactions
      .where('sessionId')
      .equals(sessionId)
      .and((t) => !t.deletedAt)
      .toArray()

    return transactions.sort((a, b) => {
      const timeDiff =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (timeDiff !== 0) return timeDiff
      return b.id.localeCompare(a.id)
    })
  },

  async getById(id: string): Promise<Transaction | undefined> {
    return db.transactions.get(id)
  },

  async create(data: CreateTransactionDTO): Promise<string> {
    const now = getTimestamp()
    return db.transactions.add({
      id: crypto.randomUUID(),
      sessionId: data.sessionId,
      branchId: data.branchId,
      type: data.type,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      description: data.description,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    })
  },

  async delete(id: string): Promise<number> {
    return db.transactions.update(id, {
      deletedAt: getTimestamp(),
    })
  },
}
