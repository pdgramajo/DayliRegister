import { db } from '../db'
import type { InventoryCategory } from '../types/entities'
import { getTimestamp } from '../lib/utils'

export const InventoryCategoryRepository = {
  async getAll(): Promise<InventoryCategory[]> {
    const categories = await db.inventoryCategories.toArray()
    return categories.filter((c) => !c.deletedAt)
  },

  async getById(id: string): Promise<InventoryCategory | undefined> {
    return db.inventoryCategories.get(id)
  },

  async create(name: string): Promise<string> {
    const now = getTimestamp()
    return db.inventoryCategories.add({
      id: crypto.randomUUID(),
      name,
      createdAt: now,
      updatedAt: now,
    })
  },
}
