import { describe, it, expect, beforeEach } from 'vitest'
import { InventoryCategoryRepository } from '../InventoryCategoryRepository'
import { db } from '../../db'

describe('InventoryCategoryRepository', () => {
  beforeEach(async () => {
    await db.inventoryCategories.clear()
  })

  describe('create', () => {
    it('should create a category', async () => {
      const id = await InventoryCategoryRepository.create('Nueva Categoria')

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('should create a category with timestamps', async () => {
      const id = await InventoryCategoryRepository.create('Test')

      const category = await InventoryCategoryRepository.getById(id)

      expect(category).toBeDefined()
      expect(category?.name).toBe('Test')
      expect(category?.createdAt).toBeDefined()
      expect(category?.updatedAt).toBeDefined()
    })
  })

  describe('getAll', () => {
    it('should return all categories', async () => {
      await InventoryCategoryRepository.create('Cat A')
      await InventoryCategoryRepository.create('Cat B')

      const categories = await InventoryCategoryRepository.getAll()

      expect(categories).toHaveLength(2)
    })

    it('should exclude soft-deleted categories', async () => {
      const id = await InventoryCategoryRepository.create('To Delete')
      await db.inventoryCategories.update(id, {
        deletedAt: new Date().toISOString(),
      })

      const categories = await InventoryCategoryRepository.getAll()

      expect(categories).toHaveLength(0)
    })

    it('should return empty array when no categories', async () => {
      const categories = await InventoryCategoryRepository.getAll()

      expect(categories).toEqual([])
    })
  })

  describe('getById', () => {
    it('should return category by id', async () => {
      const id = await InventoryCategoryRepository.create('Test Cat')

      const category = await InventoryCategoryRepository.getById(id)

      expect(category).toBeDefined()
      expect(category?.name).toBe('Test Cat')
    })

    it('should return undefined for non-existent id', async () => {
      const category = await InventoryCategoryRepository.getById('non-existent')

      expect(category).toBeUndefined()
    })
  })
})
