import { describe, it, expect, beforeEach } from 'vitest'
import {
  InventoryMovementService,
  InventoryMovementNotFoundError,
} from '../InventoryMovementService'
import { db } from '../../db'

describe('InventoryMovementService', () => {
  beforeEach(async () => {
    await db.inventoryMovements.clear()
  })

  describe('getByBranchId', () => {
    it('should return movements for a branch', async () => {
      await db.inventoryMovements.add({
        id: crypto.randomUUID(),
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      await db.inventoryMovements.add({
        id: crypto.randomUUID(),
        sessionId: 'session-2',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-2',
        type: 'out',
        quantity: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const movements = await InventoryMovementService.getByBranchId('branch-1')

      expect(movements).toHaveLength(2)
    })

    it('should not return deleted movements', async () => {
      const id = crypto.randomUUID()
      await db.inventoryMovements.add({
        id,
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 5,
        deletedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const movements = await InventoryMovementService.getByBranchId('branch-1')

      expect(movements).toHaveLength(0)
    })

    it('should return empty array for branch with no movements', async () => {
      const movements =
        await InventoryMovementService.getByBranchId('empty-branch')
      expect(movements).toEqual([])
    })

    it('should return movements sorted by newest first', async () => {
      await db.inventoryMovements.add({
        id: crypto.randomUUID(),
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 1,
        createdAt: '2026-05-25T10:00:00.000Z',
        updatedAt: '2026-05-25T10:00:00.000Z',
      })
      await db.inventoryMovements.add({
        id: crypto.randomUUID(),
        sessionId: 'session-2',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-2',
        type: 'in',
        quantity: 2,
        createdAt: '2026-05-27T10:00:00.000Z',
        updatedAt: '2026-05-27T10:00:00.000Z',
      })
      await db.inventoryMovements.add({
        id: crypto.randomUUID(),
        sessionId: 'session-3',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-3',
        type: 'out',
        quantity: 3,
        createdAt: '2026-05-26T10:00:00.000Z',
        updatedAt: '2026-05-26T10:00:00.000Z',
      })

      const movements = await InventoryMovementService.getByBranchId('branch-1')

      expect(movements).toHaveLength(3)
      // Newest first
      expect(
        new Date(movements[0].createdAt) > new Date(movements[1].createdAt)
      ).toBe(true)
      expect(
        new Date(movements[1].createdAt) > new Date(movements[2].createdAt)
      ).toBe(true)
    })
  })

  describe('getMovementsBySession', () => {
    it('should return movements for a session', async () => {
      await db.inventoryMovements.add({
        id: crypto.randomUUID(),
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const movements =
        await InventoryMovementService.getMovementsBySession('session-1')

      expect(movements).toHaveLength(1)
      expect(movements[0].quantity).toBe(10)
    })

    it('should return empty array when no movements', async () => {
      const movements =
        await InventoryMovementService.getMovementsBySession('empty-session')

      expect(movements).toEqual([])
    })
  })

  describe('getMovementById', () => {
    it('should return movement by id', async () => {
      const id = crypto.randomUUID()
      await db.inventoryMovements.add({
        id,
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const movement = await InventoryMovementService.getMovementById(id)

      expect(movement).toBeDefined()
      expect(movement.quantity).toBe(5)
    })

    it('should throw InventoryMovementNotFoundError for non-existent id', async () => {
      await expect(
        InventoryMovementService.getMovementById('non-existent')
      ).rejects.toThrow(InventoryMovementNotFoundError)
    })
  })

  describe('createMovement', () => {
    it('should create a movement', async () => {
      const movement = await InventoryMovementService.createMovement({
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 10,
      })

      expect(movement).toBeDefined()
      expect(movement.quantity).toBe(10)
      expect(movement.type).toBe('in')
    })

    it('should create a movement with optional fields', async () => {
      const movement = await InventoryMovementService.createMovement({
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'out',
        quantity: 3,
        description: 'Salida por venta',
        notes: 'Nota opcional',
      })

      expect(movement.description).toBe('Salida por venta')
      expect(movement.notes).toBe('Nota opcional')
    })
  })

  describe('deleteMovement', () => {
    it('should delete a movement', async () => {
      const movement = await InventoryMovementService.createMovement({
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 10,
      })

      await InventoryMovementService.deleteMovement(movement.id)

      const deleted = await db.inventoryMovements.get(movement.id)
      expect(deleted?.deletedAt).toBeDefined()
    })

    it('should throw InventoryMovementNotFoundError for non-existent id', async () => {
      await expect(
        InventoryMovementService.deleteMovement('non-existent')
      ).rejects.toThrow(InventoryMovementNotFoundError)
    })
  })
})
