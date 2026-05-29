import { describe, it, expect, beforeEach } from 'vitest'
import { TransactionRepository } from '../TransactionRepository'
import { db } from '../../db'

describe('TransactionRepository', () => {
  beforeEach(async () => {
    await db.transactions.clear()
  })

  describe('create', () => {
    it('should create a transaction', async () => {
      const id = await TransactionRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'sale',
        amount: 1500,
        paymentMethod: 'cash',
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('should create a transaction with all fields', async () => {
      const id = await TransactionRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'expense',
        amount: 300,
        description: 'Compra de insumos',
        notes: 'Nota opcional',
      })

      const tx = await TransactionRepository.getById(id)

      expect(tx).toBeDefined()
      expect(tx?.type).toBe('expense')
      expect(tx?.amount).toBe(300)
      expect(tx?.description).toBe('Compra de insumos')
      expect(tx?.notes).toBe('Nota opcional')
      expect(tx?.createdAt).toBeDefined()
      expect(tx?.updatedAt).toBeDefined()
    })
  })

  describe('getBySessionId', () => {
    it('should return transactions for a session', async () => {
      await TransactionRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'sale',
        amount: 1000,
        paymentMethod: 'cash',
      })
      await TransactionRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'expense',
        amount: 200,
      })

      const transactions =
        await TransactionRepository.getBySessionId('session-1')

      expect(transactions).toHaveLength(2)
    })

    it('should exclude soft-deleted transactions', async () => {
      const id = await TransactionRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'sale',
        amount: 500,
      })
      await TransactionRepository.delete(id)

      const transactions =
        await TransactionRepository.getBySessionId('session-1')

      expect(transactions).toHaveLength(0)
    })

    it('should return empty array when no transactions', async () => {
      const transactions =
        await TransactionRepository.getBySessionId('empty-session')

      expect(transactions).toEqual([])
    })
  })

  describe('getById', () => {
    it('should return transaction by id', async () => {
      const id = await TransactionRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'sale',
        amount: 2500,
      })

      const tx = await TransactionRepository.getById(id)

      expect(tx).toBeDefined()
      expect(tx?.amount).toBe(2500)
    })

    it('should return undefined for non-existent id', async () => {
      const tx = await TransactionRepository.getById('non-existent')

      expect(tx).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('should soft-delete a transaction', async () => {
      const id = await TransactionRepository.create({
        sessionId: 'session-1',
        branchId: 'branch-1',
        type: 'sale',
        amount: 1000,
      })

      await TransactionRepository.delete(id)

      const tx = await TransactionRepository.getById(id)
      expect(tx?.deletedAt).toBeDefined()
    })
  })
})
