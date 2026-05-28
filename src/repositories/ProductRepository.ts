import { db } from '../db'
import type { Product } from '../types/entities'
import type { CreateProductDTO, UpdateProductDTO } from '../types/dtos'
import { getTimestamp } from '../lib/utils'

export const ProductRepository = {
  async getAll(branchId: string): Promise<Product[]> {
    return db.products
      .where('branchId')
      .equals(branchId)
      .and((product) => !product.deletedAt)
      .toArray()
  },

  async getById(id: string): Promise<Product | undefined> {
    return db.products.get(id)
  },

  async create(data: CreateProductDTO): Promise<string> {
    const now = getTimestamp()
    return db.products.add({
      id: crypto.randomUUID(),
      ...data,
      offerPrice: data.offerPrice,
      category: data.category,
      createdAt: now,
      updatedAt: now,
    })
  },

  async update(id: string, data: UpdateProductDTO): Promise<number> {
    return db.products.update(id, {
      ...data,
      updatedAt: getTimestamp(),
    })
  },

  async delete(id: string): Promise<number> {
    return db.products.update(id, {
      deletedAt: getTimestamp(),
    })
  },
}
