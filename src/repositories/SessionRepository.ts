import { db } from '../db'
import type { CashSession } from '../types/entities'
import type { CreateSessionDTO, UpdateSessionDTO } from '../types/dtos'
import { Entities } from '../types/entities'

const getTimestamp = () => new Date().toISOString()

export const SessionRepository = {
  async getByBranchId(branchId: string): Promise<CashSession[]> {
    return db.cashSessions
      .where('branchId')
      .equals(branchId)
      .and((session) => !session.deletedAt)
      .toArray()
      .then((sessions) =>
        sessions.sort(
          (a, b) =>
            new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()
        )
      )
  },

  async getById(id: string): Promise<CashSession | undefined> {
    return db.cashSessions.get(id)
  },

  async getOpenByBranchId(branchId: string): Promise<CashSession | undefined> {
    return db.cashSessions
      .where('branchId')
      .equals(branchId)
      .and(
        (session) =>
          !session.deletedAt &&
          session.status === Entities.CashSessionStatus.OPEN
      )
      .first()
  },

  async create(data: CreateSessionDTO): Promise<string> {
    const now = getTimestamp()
    return db.cashSessions.add({
      id: crypto.randomUUID(),
      name: data.name,
      branchId: data.branchId,
      initialAmount: data.initialAmount,
      notes: data.notes,
      status: Entities.CashSessionStatus.OPEN,
      openedAt: now,
      createdAt: now,
      updatedAt: now,
    })
  },

  async update(id: string, data: UpdateSessionDTO): Promise<number> {
    return db.cashSessions.update(id, {
      ...data,
      updatedAt: getTimestamp(),
    })
  },

  async delete(id: string): Promise<number> {
    return db.cashSessions.update(id, {
      deletedAt: getTimestamp(),
    })
  },

  async close(id: string, closingBalance?: number): Promise<number> {
    return db.cashSessions.update(id, {
      status: Entities.CashSessionStatus.CLOSED,
      closingBalance,
      closedAt: getTimestamp(),
      updatedAt: getTimestamp(),
    })
  },
}
