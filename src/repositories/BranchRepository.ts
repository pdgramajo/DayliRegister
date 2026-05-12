import { db } from '../db'
import type { Branch } from '../types/entities'
import type { CreateBranchDTO, UpdateBranchDTO } from '../types/dtos'

const getTimestamp = () => new Date().toISOString()

export const BranchRepository = {
  async getAll(): Promise<Branch[]> {
    return db.branches
      .toArray()
      .then((branches) => branches.filter((branch) => !branch.deletedAt))
  },

  async getById(id: string): Promise<Branch | undefined> {
    return db.branches.get(id)
  },

  async create(data: CreateBranchDTO): Promise<string> {
    const now = getTimestamp()
    return db.branches.add({
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    })
  },

  async update(id: string, data: UpdateBranchDTO): Promise<number> {
    return db.branches.update(id, {
      ...data,
      updatedAt: getTimestamp(),
    })
  },

  async delete(id: string): Promise<number> {
    return db.branches.update(id, {
      deletedAt: getTimestamp(),
    })
  },

  async getActive(): Promise<Branch[]> {
    return db.branches
      .toArray()
      .then((branches) =>
        branches.filter((branch) => branch.isActive && !branch.deletedAt)
      )
  },

  async getByBranchId(branchId: string): Promise<Branch | undefined> {
    return db.branches
      .where('id')
      .equals(branchId)
      .and((branch) => !branch.deletedAt)
      .first()
  },
}
