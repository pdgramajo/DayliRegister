import { db } from '../db'
import type { InventoryCategory } from '../types/entities'

export const InventoryCategoryRepository = {
  async getAll(): Promise<InventoryCategory[]> {
    const categories = await db.inventoryCategories.toArray()
    return categories.filter((c) => !c.deletedAt)
  },

  async getById(id: string): Promise<InventoryCategory | undefined> {
    return db.inventoryCategories.get(id)
  },

  async create(name: string): Promise<string> {
    const now = new Date().toISOString()
    return db.inventoryCategories.add({
      id: crypto.randomUUID(),
      name,
      createdAt: now,
      updatedAt: now,
    })
  },
}
