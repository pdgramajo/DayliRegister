import { describe, it, expect, beforeEach } from 'vitest'
import { ProductRepository } from '../ProductRepository'
import { db } from '../../db'

describe('ProductRepository', () => {
  beforeEach(async () => {
    await db.products.clear()
  })

  describe('create', () => {
    it('should create a product', async () => {
      const id = await ProductRepository.create({
        branchId: 'branch-1',
        name: 'Test Product',
        price: 100,
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('should create a product with all fields', async () => {
      const id = await ProductRepository.create({
        branchId: 'branch-1',
        name: 'Full Product',
        price: 2500,
        offerPrice: 2000,
        category: 'Lacteos',
      })

      const product = await ProductRepository.getById(id)

      expect(product).toBeDefined()
      expect(product?.name).toBe('Full Product')
      expect(product?.price).toBe(2500)
      expect(product?.offerPrice).toBe(2000)
      expect(product?.category).toBe('Lacteos')
      expect(product?.branchId).toBe('branch-1')
      expect(product?.createdAt).toBeDefined()
      expect(product?.updatedAt).toBeDefined()
    })
  })

  describe('getAll', () => {
    it('should return products for a branch', async () => {
      await ProductRepository.create({
        branchId: 'branch-1',
        name: 'Product 1',
        price: 100,
      })
      await ProductRepository.create({
        branchId: 'branch-1',
        name: 'Product 2',
        price: 200,
      })

      const products = await ProductRepository.getAll('branch-1')

      expect(products).toHaveLength(2)
    })

    it('should not return products from other branches', async () => {
      await ProductRepository.create({
        branchId: 'branch-1',
        name: 'Product A',
        price: 100,
      })
      await ProductRepository.create({
        branchId: 'branch-2',
        name: 'Product B',
        price: 200,
      })

      const products = await ProductRepository.getAll('branch-1')

      expect(products).toHaveLength(1)
    })

    it('should exclude deleted products', async () => {
      const id = await ProductRepository.create({
        branchId: 'branch-1',
        name: 'To Delete',
        price: 100,
      })
      await ProductRepository.delete(id)

      const products = await ProductRepository.getAll('branch-1')

      expect(products).toHaveLength(0)
    })
  })

  describe('getById', () => {
    it('should return product by id', async () => {
      const id = await ProductRepository.create({
        branchId: 'branch-1',
        name: 'Test Product',
        price: 150,
      })

      const product = await ProductRepository.getById(id)

      expect(product).toBeDefined()
      expect(product?.name).toBe('Test Product')
    })

    it('should return undefined for non-existent id', async () => {
      const product = await ProductRepository.getById('non-existent-id')

      expect(product).toBeUndefined()
    })
  })

  describe('update', () => {
    it('should update a product', async () => {
      const id = await ProductRepository.create({
        branchId: 'branch-1',
        name: 'Original Name',
        price: 100,
      })

      await ProductRepository.update(id, { name: 'Updated Name', price: 200 })

      const product = await ProductRepository.getById(id)
      expect(product?.name).toBe('Updated Name')
      expect(product?.price).toBe(200)
    })
  })

  describe('delete', () => {
    it('should soft delete a product', async () => {
      const id = await ProductRepository.create({
        branchId: 'branch-1',
        name: 'Product',
        price: 100,
      })

      await ProductRepository.delete(id)

      const product = await ProductRepository.getById(id)
      expect(product?.deletedAt).toBeDefined()
    })
  })
})
