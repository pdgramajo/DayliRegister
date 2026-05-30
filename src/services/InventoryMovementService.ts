import { InventoryMovementRepository } from '../repositories/InventoryMovementRepository'
import type { InventoryMovement } from '../types/entities'
import type { CreateInventoryMovementDTO } from '../types/dtos'
import { ERROR_NAMES } from '../constants/errors'

export class InventoryMovementNotFoundError extends Error {
  constructor(id: string) {
    super(`Inventory movement with id "${id}" not found`)
    this.name = ERROR_NAMES.INVENTORY_MOVEMENT_NOT_FOUND
  }
}

export const InventoryMovementService = {
  async getByBranchId(branchId: string): Promise<InventoryMovement[]> {
    return InventoryMovementRepository.getByBranchId(branchId)
  },

  async getMovementsBySession(sessionId: string): Promise<InventoryMovement[]> {
    return InventoryMovementRepository.getBySessionId(sessionId)
  },

  async getMovementById(id: string): Promise<InventoryMovement> {
    const movement = await InventoryMovementRepository.getById(id)
    if (!movement) {
      throw new InventoryMovementNotFoundError(id)
    }
    return movement
  },

  async createMovement(
    data: CreateInventoryMovementDTO
  ): Promise<InventoryMovement> {
    const id = await InventoryMovementRepository.create(data)
    const movement = await InventoryMovementRepository.getById(id)
    if (!movement) {
      throw new Error('Failed to create inventory movement')
    }
    return movement
  },

  async deleteMovement(id: string): Promise<void> {
    const existing = await InventoryMovementRepository.getById(id)
    if (!existing) {
      throw new InventoryMovementNotFoundError(id)
    }
    await InventoryMovementRepository.delete(id)
  },
}
