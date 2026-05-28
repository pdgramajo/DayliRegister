import { describe, it, expect, beforeEach } from 'vitest'
import { DebtEntryRepository } from '../DebtEntryRepository'
import { db } from '../../db'

describe('DebtEntryRepository', () => {
  beforeEach(async () => {
    await db.debtEntries.clear()
  })

  const baseEntry = {
    clientId: 'client-1',
    branchId: 'branch-1',
    type: 'debt' as const,
    amount: 1500,
  }

  describe('create', () => {
    it('should create a debt entry', async () => {
      const id = await DebtEntryRepository.create(baseEntry)

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('should create with all fields including description', async () => {
      const id = await DebtEntryRepository.create({
        ...baseEntry,
        description: 'Pollo y pan',
      })

      const entry = await DebtEntryRepository.getById(id)

      expect(entry).toBeDefined()
      expect(entry?.type).toBe('debt')
      expect(entry?.amount).toBe(1500)
      expect(entry?.description).toBe('Pollo y pan')
      expect(entry?.clientId).toBe('client-1')
      expect(entry?.branchId).toBe('branch-1')
      expect(entry?.createdAt).toBeDefined()
      expect(entry?.updatedAt).toBeDefined()
    })
  })

  describe('getByClient', () => {
    it('should return entries for a client', async () => {
      await DebtEntryRepository.create(baseEntry)
      await DebtEntryRepository.create({ ...baseEntry, amount: 500 })

      const entries = await DebtEntryRepository.getByClient('client-1')

      expect(entries).toHaveLength(2)
    })

    it('should not mix entries from different clients', async () => {
      await DebtEntryRepository.create(baseEntry)
      await DebtEntryRepository.create({ ...baseEntry, clientId: 'client-2' })

      const entries = await DebtEntryRepository.getByClient('client-1')

      expect(entries).toHaveLength(1)
    })

    it('should exclude deleted entries', async () => {
      const id = await DebtEntryRepository.create(baseEntry)
      await DebtEntryRepository.delete(id)

      const entries = await DebtEntryRepository.getByClient('client-1')

      expect(entries).toHaveLength(0)
    })
  })

  describe('getById', () => {
    it('should return entry by id', async () => {
      const id = await DebtEntryRepository.create(baseEntry)

      const entry = await DebtEntryRepository.getById(id)

      expect(entry).toBeDefined()
      expect(entry?.amount).toBe(1500)
    })

    it('should return undefined for non-existent id', async () => {
      const entry = await DebtEntryRepository.getById('non-existent')
      expect(entry).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('should soft delete an entry', async () => {
      const id = await DebtEntryRepository.create(baseEntry)

      await DebtEntryRepository.delete(id)

      const entry = await DebtEntryRepository.getById(id)
      expect(entry?.deletedAt).toBeDefined()
    })
  })
})
