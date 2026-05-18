import { InventoryCategoryRepository } from '../repositories/InventoryCategoryRepository'
import type { InventoryCategory } from '../types/entities'

export class InventoryCategoryNotFoundError extends Error {
  constructor(id: string) {
    super(`Inventory category with id "${id}" not found`)
    this.name = 'InventoryCategoryNotFoundError'
  }
}

export const InventoryCategoryService = {
  async getAllCategories(): Promise<InventoryCategory[]> {
    return InventoryCategoryRepository.getAll()
  },

  async getCategoryById(id: string): Promise<InventoryCategory> {
    const category = await InventoryCategoryRepository.getById(id)
    if (!category) {
      throw new InventoryCategoryNotFoundError(id)
    }
    return category
  },

  async createCategory(name: string): Promise<InventoryCategory> {
    const id = await InventoryCategoryRepository.create(name)
    const category = await InventoryCategoryRepository.getById(id)
    if (!category) {
      throw new Error('Failed to create category')
    }
    return category
  },
}
