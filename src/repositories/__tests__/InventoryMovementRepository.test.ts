import { describe, it, expect, beforeEach } from 'vitest'
import { InventoryMovementRepository } from '../InventoryMovementRepository'
import { db } from '../../db'

describe('InventoryMovementRepository', () => {
  beforeEach(async () => {
    await db.inventoryMovements.clear()
  })

  describe('create', () => {
    it('should create a movement', async () => {
      const id = await InventoryMovementRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 10,
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('should create a movement with all fields', async () => {
      const id = await InventoryMovementRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'out',
        quantity: 5,
        description: 'Salida',
        notes: 'Nota',
      })

      const movement = await InventoryMovementRepository.getById(id)

      expect(movement).toBeDefined()
      expect(movement?.type).toBe('out')
      expect(movement?.quantity).toBe(5)
      expect(movement?.description).toBe('Salida')
      expect(movement?.notes).toBe('Nota')
      expect(movement?.createdAt).toBeDefined()
      expect(movement?.updatedAt).toBeDefined()
    })
  })

  describe('getBySessionId', () => {
    it('should return movements for a session', async () => {
      await InventoryMovementRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 10,
      })
      await InventoryMovementRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'out',
        quantity: 3,
      })

      const movements =
        await InventoryMovementRepository.getBySessionId('session-1')

      expect(movements).toHaveLength(2)
    })

    it('should exclude soft-deleted movements', async () => {
      const id = await InventoryMovementRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 10,
      })
      await InventoryMovementRepository.delete(id)

      const movements =
        await InventoryMovementRepository.getBySessionId('session-1')

      expect(movements).toHaveLength(0)
    })

    it('should return empty array when no movements', async () => {
      const movements =
        await InventoryMovementRepository.getBySessionId('empty-session')

      expect(movements).toEqual([])
    })
  })

  describe('getById', () => {
    it('should return movement by id', async () => {
      const id = await InventoryMovementRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 7,
      })

      const movement = await InventoryMovementRepository.getById(id)

      expect(movement).toBeDefined()
      expect(movement?.quantity).toBe(7)
    })

    it('should return undefined for non-existent id', async () => {
      const movement = await InventoryMovementRepository.getById('non-existent')

      expect(movement).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('should soft-delete a movement', async () => {
      const id = await InventoryMovementRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        inventoryCategoryId: 'cat-1',
        type: 'in',
        quantity: 10,
      })

      await InventoryMovementRepository.delete(id)

      const movement = await InventoryMovementRepository.getById(id)
      expect(movement?.deletedAt).toBeDefined()
    })
  })
})
