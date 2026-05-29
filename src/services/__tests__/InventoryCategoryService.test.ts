import { describe, it, expect, beforeEach } from 'vitest'
import {
  InventoryCategoryService,
  InventoryCategoryNotFoundError,
} from '../InventoryCategoryService'
import { db } from '../../db'

describe('InventoryCategoryService', () => {
  beforeEach(async () => {
    await db.inventoryCategories.clear()
  })

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const id = await db.inventoryCategories.add({
        id: crypto.randomUUID(),
        name: 'Categoria 1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const categories = await InventoryCategoryService.getAllCategories()

      expect(categories).toHaveLength(1)
      expect(categories[0].name).toBe('Categoria 1')
    })

    it('should return empty array when no categories', async () => {
      const categories = await InventoryCategoryService.getAllCategories()
      expect(categories).toEqual([])
    })
  })

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      const id = crypto.randomUUID()
      await db.inventoryCategories.add({
        id,
        name: 'Test Category',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const category = await InventoryCategoryService.getCategoryById(id)

      expect(category).toBeDefined()
      expect(category.name).toBe('Test Category')
    })

    it('should throw InventoryCategoryNotFoundError for non-existent id', async () => {
      await expect(
        InventoryCategoryService.getCategoryById('non-existent')
      ).rejects.toThrow(InventoryCategoryNotFoundError)
    })
  })

  describe('createCategory', () => {
    it('should create a category', async () => {
      const category =
        await InventoryCategoryService.createCategory('New Category')

      expect(category).toBeDefined()
      expect(category.name).toBe('New Category')
    })
  })
})
