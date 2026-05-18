import { db } from '../db'
import type {
  InventoryMovement,
  InventoryMovementType,
} from '../types/entities'

const getTimestamp = (() => {
  let lastTime = 0

  return () => {
    const now = Date.now()
    const time = now <= lastTime ? lastTime + 1 : now
    lastTime = time
    return new Date(time).toISOString()
  }
})()

export interface CreateInventoryMovementDTO {
  sessionId: string
  branchId: string
  inventoryCategoryId: string
  type: InventoryMovementType
  quantity: number
  description?: string
  notes?: string
}

export const InventoryMovementRepository = {
  async getBySessionId(sessionId: string): Promise<InventoryMovement[]> {
    const movements = await db.inventoryMovements
      .where('sessionId')
      .equals(sessionId)
      .and((m) => !m.deletedAt)
      .toArray()

    return movements.sort((a, b) => {
      const timeDiff =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (timeDiff !== 0) return timeDiff
      return b.id.localeCompare(a.id)
    })
  },

  async getById(id: string): Promise<InventoryMovement | undefined> {
    return db.inventoryMovements.get(id)
  },

  async create(data: CreateInventoryMovementDTO): Promise<string> {
    const now = getTimestamp()
    return db.inventoryMovements.add({
      id: crypto.randomUUID(),
      sessionId: data.sessionId,
      branchId: data.branchId,
      inventoryCategoryId: data.inventoryCategoryId,
      type: data.type,
      quantity: data.quantity,
      description: data.description,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    })
  },

  async delete(id: string): Promise<number> {
    return db.inventoryMovements.update(id, {
      deletedAt: getTimestamp(),
    })
  },
}
