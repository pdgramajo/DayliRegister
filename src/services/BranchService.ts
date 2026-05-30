import {
  BranchRepository,
  SessionRepository,
  TransactionRepository,
  InventoryMovementRepository,
} from '../repositories'
import type { Branch } from '../types/entities'
import type { CreateBranchDTO, UpdateBranchDTO } from '../types/dtos'
import { ERROR_NAMES } from '../constants/errors'

export class BranchNotFoundError extends Error {
  constructor(id: string) {
    super(`Branch with id "${id}" not found`)
    this.name = ERROR_NAMES.BRANCH_NOT_FOUND
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

    const sessions = await SessionRepository.getByBranchId(id)
    for (const session of sessions) {
      const transactions = await TransactionRepository.getBySessionId(
        session.id
      )
      for (const t of transactions) {
        await TransactionRepository.delete(t.id)
      }

      const movements = await InventoryMovementRepository.getBySessionId(
        session.id
      )
      for (const m of movements) {
        await InventoryMovementRepository.delete(m.id)
      }

      await SessionRepository.delete(session.id)
    }

    await BranchRepository.delete(id)
  },

  async getActiveBranches(): Promise<Branch[]> {
    return BranchRepository.getActive()
  },
}
