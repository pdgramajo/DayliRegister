import { describe, it, expect, beforeEach } from 'vitest'
import { ProductService, ProductNotFoundError } from '../ProductService'
import { db } from '../../db'

describe('ProductService', () => {
  beforeEach(async () => {
    await db.products.clear()
  })

  describe('getProductsByBranch', () => {
    it('should return products for a branch', async () => {
      await db.products.add({
        id: crypto.randomUUID(),
        branchId: 'branch-1',
        name: 'Product 1',
        price: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const products = await ProductService.getProductsByBranch('branch-1')

      expect(products).toHaveLength(1)
      expect(products[0].name).toBe('Product 1')
    })

    it('should return empty array when no products', async () => {
      const products = await ProductService.getProductsByBranch('empty-branch')

      expect(products).toEqual([])
    })
  })

  describe('getProductById', () => {
    it('should return product by id', async () => {
      const id = crypto.randomUUID()
      await db.products.add({
        id,
        branchId: 'branch-1',
        name: 'Test Product',
        price: 2500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const product = await ProductService.getProductById(id)

      expect(product).toBeDefined()
      expect(product.name).toBe('Test Product')
      expect(product.price).toBe(2500)
    })

    it('should throw ProductNotFoundError for non-existent id', async () => {
      await expect(
        ProductService.getProductById('non-existent')
      ).rejects.toThrow(ProductNotFoundError)
    })
  })

  describe('createProduct', () => {
    it('should create a product', async () => {
      const product = await ProductService.createProduct({
        branchId: 'branch-1',
        name: 'New Product',
        price: 1500,
      })

      expect(product).toBeDefined()
      expect(product.name).toBe('New Product')
      expect(product.price).toBe(1500)
      expect(product.branchId).toBe('branch-1')
    })

    it('should create a product with optional fields', async () => {
      const product = await ProductService.createProduct({
        branchId: 'branch-1',
        name: 'Product with Offer',
        price: 3000,
        offerPrice: 2500,
        category: 'Bebidas',
      })

      expect(product.offerPrice).toBe(2500)
      expect(product.category).toBe('Bebidas')
    })
  })

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const id = crypto.randomUUID()
      await db.products.add({
        id,
        branchId: 'branch-1',
        name: 'Original',
        price: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const updated = await ProductService.updateProduct(id, {
        name: 'Updated',
        price: 200,
      })

      expect(updated.name).toBe('Updated')
      expect(updated.price).toBe(200)
    })

    it('should throw ProductNotFoundError for non-existent id', async () => {
      await expect(
        ProductService.updateProduct('non-existent', { name: 'Test' })
      ).rejects.toThrow(ProductNotFoundError)
    })
  })

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const id = crypto.randomUUID()
      await db.products.add({
        id,
        branchId: 'branch-1',
        name: 'To Delete',
        price: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      await ProductService.deleteProduct(id)

      const product = await ProductService.getProductById(id)
      expect(product.deletedAt).toBeDefined()
    })

    it('should throw ProductNotFoundError for non-existent id', async () => {
      await expect(
        ProductService.deleteProduct('non-existent')
      ).rejects.toThrow(ProductNotFoundError)
    })
  })

  describe('bulkCreate', () => {
    it('should create multiple products in batch', async () => {
      const products = await ProductService.bulkCreate('branch-1', [
        { name: 'Café', price: 1500 },
        {
          name: 'Medialuna',
          price: 800,
          offerPrice: 600,
          category: 'Facturas',
        },
      ])

      expect(products).toHaveLength(2)
      expect(products[0].name).toBe('Café')
      expect(products[0].price).toBe(1500)
      expect(products[0].branchId).toBe('branch-1')
      expect(products[0].id).toBeDefined()
      expect(products[0].createdAt).toBeDefined()
      expect(products[0].updatedAt).toBeDefined()

      expect(products[1].name).toBe('Medialuna')
      expect(products[1].price).toBe(800)
      expect(products[1].offerPrice).toBe(600)
      expect(products[1].category).toBe('Facturas')
      expect(products[1].branchId).toBe('branch-1')
    })

    it('should persist products in the database', async () => {
      await ProductService.bulkCreate('branch-1', [
        { name: 'Café', price: 1500 },
        { name: 'Té', price: 1000 },
      ])

      const saved = await ProductService.getProductsByBranch('branch-1')
      expect(saved).toHaveLength(2)
    })

    it('should assign unique ids to each product', async () => {
      const products = await ProductService.bulkCreate('branch-1', [
        { name: 'A', price: 1 },
        { name: 'B', price: 2 },
        { name: 'C', price: 3 },
      ])

      const ids = products.map((p) => p.id)
      expect(new Set(ids).size).toBe(3)
    })

    it('should trim product names', async () => {
      const products = await ProductService.bulkCreate('branch-1', [
        { name: '  Café  ', price: 1500 },
      ])

      expect(products[0].name).toBe('Café')
    })

    it('should support empty optional fields', async () => {
      const products = await ProductService.bulkCreate('branch-1', [
        { name: 'Simple', price: 100 },
      ])

      expect(products[0].offerPrice).toBeUndefined()
      expect(products[0].category).toBeUndefined()
    })
  })
})
