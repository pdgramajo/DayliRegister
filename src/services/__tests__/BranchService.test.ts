import { describe, it, expect, beforeEach } from 'vitest'
import { BranchService, BranchNotFoundError } from '../BranchService'
import { db } from '../../db'

describe('BranchService', () => {
  beforeEach(async () => {
    await db.branches.clear()
  })

  describe('getAllBranches', () => {
    it('should return all branches', async () => {
      await db.branches.add({
        id: crypto.randomUUID(),
        name: 'Branch 1',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const branches = await BranchService.getAllBranches()

      expect(branches).toHaveLength(1)
      expect(branches[0].name).toBe('Branch 1')
    })
  })

  describe('getBranchById', () => {
    it('should return branch by id', async () => {
      const id = crypto.randomUUID()
      await db.branches.add({
        id,
        name: 'Test Branch',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const branch = await BranchService.getBranchById(id)

      expect(branch).toBeDefined()
      expect(branch?.name).toBe('Test Branch')
    })

    it('should throw BranchNotFoundError for non-existent id', async () => {
      await expect(BranchService.getBranchById('non-existent')).rejects.toThrow(
        BranchNotFoundError
      )
    })
  })

  describe('createBranch', () => {
    it('should create a branch', async () => {
      const branch = await BranchService.createBranch({
        name: 'New Branch',
        isActive: true,
      })

      expect(branch).toBeDefined()
      expect(branch.name).toBe('New Branch')
      expect(branch.isActive).toBe(true)
    })
  })

  describe('updateBranch', () => {
    it('should update a branch', async () => {
      const id = crypto.randomUUID()
      await db.branches.add({
        id,
        name: 'Original',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const updated = await BranchService.updateBranch(id, { name: 'Updated' })

      expect(updated.name).toBe('Updated')
    })

    it('should throw BranchNotFoundError for non-existent id', async () => {
      await expect(
        BranchService.updateBranch('non-existent', { name: 'Test' })
      ).rejects.toThrow(BranchNotFoundError)
    })
  })

  describe('deleteBranch', () => {
    it('should delete a branch', async () => {
      const id = crypto.randomUUID()
      await db.branches.add({
        id,
        name: 'To Delete',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      await BranchService.deleteBranch(id)

      const branch = await BranchService.getBranchById(id)
      expect(branch?.deletedAt).toBeDefined()
    })

    it('should throw BranchNotFoundError for non-existent id', async () => {
      await expect(BranchService.deleteBranch('non-existent')).rejects.toThrow(
        BranchNotFoundError
      )
    })

    it('should delete a branch with sessions and transactions', async () => {
      const branchId = crypto.randomUUID()
      await db.branches.add({
        id: branchId,
        name: 'Branch With Sessions',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const sessionId = crypto.randomUUID()
      await db.cashSessions.add({
        id: sessionId,
        branchId,
        name: 'Session',
        status: 'open' as const,
        initialAmount: 1000,
        openedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      await db.transactions.add({
        id: crypto.randomUUID(),
        sessionId,
        type: 'sale' as const,
        amount: 500,
        paymentMethod: 'cash' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      await BranchService.deleteBranch(branchId)

      const branch = await BranchService.getBranchById(branchId)
      expect(branch?.deletedAt).toBeDefined()
    })
  })

  describe('getActiveBranches', () => {
    it('should return only active branches', async () => {
      await db.branches.add({
        id: crypto.randomUUID(),
        name: 'Active 1',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      await db.branches.add({
        id: crypto.randomUUID(),
        name: 'Active 2',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const branches = await BranchService.getActiveBranches()

      expect(branches).toHaveLength(2)
      expect(branches.every((b) => b.isActive)).toBe(true)
    })
  })
})
