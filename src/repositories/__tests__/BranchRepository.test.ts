import { describe, it, expect, beforeEach } from 'vitest'
import { BranchRepository } from '../BranchRepository'
import { db } from '../../db'

describe('BranchRepository', () => {
  beforeEach(async () => {
    await db.branches.clear()
  })

  describe('create', () => {
    it('should create a branch', async () => {
      const branchData = {
        name: 'Test Branch',
        isActive: true,
      }

      const id = await BranchRepository.create(branchData)

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('should create a branch with all fields', async () => {
      const branchData = {
        name: 'Main Branch',
        address: '123 Main St',
        phone: '+1234567890',
        isActive: true,
      }

      const id = await BranchRepository.create(branchData)
      const branch = await BranchRepository.getById(id)

      expect(branch).toBeDefined()
      expect(branch?.name).toBe('Main Branch')
      expect(branch?.address).toBe('123 Main St')
      expect(branch?.phone).toBe('+1234567890')
      expect(branch?.isActive).toBe(true)
      expect(branch?.createdAt).toBeDefined()
      expect(branch?.updatedAt).toBeDefined()
    })
  })

  describe('getAll', () => {
    it('should return all branches', async () => {
      await BranchRepository.create({ name: 'Branch 1', isActive: true })
      await BranchRepository.create({ name: 'Branch 2', isActive: true })

      const branches = await BranchRepository.getAll()

      expect(branches).toHaveLength(2)
    })

    it('should exclude deleted branches', async () => {
      const id = await BranchRepository.create({
        name: 'Branch',
        isActive: true,
      })
      await BranchRepository.delete(id)

      const branches = await BranchRepository.getAll()

      expect(branches).toHaveLength(0)
    })
  })

  describe('getById', () => {
    it('should return branch by id', async () => {
      const id = await BranchRepository.create({
        name: 'Test Branch',
        isActive: true,
      })

      const branch = await BranchRepository.getById(id)

      expect(branch).toBeDefined()
      expect(branch?.name).toBe('Test Branch')
    })

    it('should return undefined for non-existent id', async () => {
      const branch = await BranchRepository.getById('non-existent-id')

      expect(branch).toBeUndefined()
    })
  })

  describe('update', () => {
    it('should update a branch', async () => {
      const id = await BranchRepository.create({
        name: 'Original Name',
        isActive: true,
      })

      await BranchRepository.update(id, { name: 'Updated Name' })

      const branch = await BranchRepository.getById(id)
      expect(branch?.name).toBe('Updated Name')
    })
  })

  describe('delete', () => {
    it('should soft delete a branch', async () => {
      const id = await BranchRepository.create({
        name: 'Branch',
        isActive: true,
      })

      await BranchRepository.delete(id)

      const branch = await BranchRepository.getById(id)
      expect(branch?.deletedAt).toBeDefined()
    })
  })
})
