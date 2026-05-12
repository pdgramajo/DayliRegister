import { BranchRepository } from '../repositories'
import type { Branch } from '../types/entities'
import type { CreateBranchDTO, UpdateBranchDTO } from '../types/dtos'

export class BranchNotFoundError extends Error {
  constructor(id: string) {
    super(`Branch with id "${id}" not found`)
    this.name = 'BranchNotFoundError'
  }
}

export const BranchService = {
  async getAllBranches(): Promise<Branch[]> {
    return BranchRepository.getAll()
  },

  async getBranchById(id: string): Promise<Branch> {
    const branch = await BranchRepository.getById(id)
    if (!branch) {
      throw new BranchNotFoundError(id)
    }
    return branch
  },

  async createBranch(data: CreateBranchDTO): Promise<Branch> {
    const id = await BranchRepository.create(data)
    const branch = await BranchRepository.getById(id)
    if (!branch) {
      throw new Error('Failed to create branch')
    }
    return branch
  },

  async updateBranch(id: string, data: UpdateBranchDTO): Promise<Branch> {
    const existing = await BranchRepository.getById(id)
    if (!existing) {
      throw new BranchNotFoundError(id)
    }

    await BranchRepository.update(id, data)

    const updated = await BranchRepository.getById(id)
    if (!updated) {
      throw new Error('Failed to update branch')
    }
    return updated
  },

  async deleteBranch(id: string): Promise<void> {
    const existing = await BranchRepository.getById(id)
    if (!existing) {
      throw new BranchNotFoundError(id)
    }
    await BranchRepository.delete(id)
  },

  async getActiveBranches(): Promise<Branch[]> {
    return BranchRepository.getActive()
  },
}
