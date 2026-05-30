import { ProductRepository } from '../repositories/ProductRepository'
import { db } from '../db'
import type { Product } from '../types/entities'
import type { CreateProductDTO, UpdateProductDTO } from '../types/dtos'
import { getTimestamp } from '../lib/utils'

export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Product with id "${id}" not found`)
    this.name = 'ProductNotFoundError'
  }
}

export const ProductService = {
  async getProductsByBranch(branchId: string): Promise<Product[]> {
    return ProductRepository.getAll(branchId)
  },

  async getProductById(id: string): Promise<Product> {
    const product = await ProductRepository.getById(id)
    if (!product) {
      throw new ProductNotFoundError(id)
    }
    return product
  },

  async createProduct(data: CreateProductDTO): Promise<Product> {
    const id = await ProductRepository.create(data)
    const product = await ProductRepository.getById(id)
    if (!product) {
      throw new Error('Failed to create product')
    }
    return product
  },

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    const existing = await ProductRepository.getById(id)
    if (!existing) {
      throw new ProductNotFoundError(id)
    }
    await ProductRepository.update(id, data)
    const updated = await ProductRepository.getById(id)
    if (!updated) {
      throw new Error('Failed to update product')
    }
    return updated
  },

  async deleteProduct(id: string): Promise<void> {
    const existing = await ProductRepository.getById(id)
    if (!existing) {
      throw new ProductNotFoundError(id)
    }
    await ProductRepository.delete(id)
  },

  async bulkCreate(
    branchId: string,
    products: Array<{
      name: string
      price: number
      offerPrice?: number
      category?: string
    }>
  ): Promise<Product[]> {
    const now = getTimestamp()
    const newProducts: Product[] = products.map((p) => ({
      id: crypto.randomUUID(),
      branchId,
      name: p.name.trim(),
      price: p.price,
      offerPrice: p.offerPrice,
      category: p.category,
      createdAt: now,
      updatedAt: now,
    }))
    await db.products.bulkAdd(newProducts)
    return newProducts
  },
}
