import { describe, it, expect, beforeEach } from 'vitest'
import { SessionRepository } from '../SessionRepository'
import { BranchRepository } from '../BranchRepository'
import { db } from '../../db'
import { Entities } from '../../types/entities'

describe('SessionRepository', () => {
  let branchId: string

  beforeEach(async () => {
    await db.cashSessions.clear()
    await db.branches.clear()
    branchId = await BranchRepository.create({
      name: 'Test Branch',
      isActive: true,
    })
  })

  describe('create', () => {
    it('should create a session', async () => {
      const sessionData = {
        name: 'Morning Session',
        branchId,
      }

      const id = await SessionRepository.create(sessionData)

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('should create a session with initialAmount and notes', async () => {
      const sessionData = {
        name: 'Morning Session',
        branchId,
        initialAmount: 1000,
        notes: 'Test notes',
      }

      const id = await SessionRepository.create(sessionData)
      const session = await SessionRepository.getById(id)

      expect(session).toBeDefined()
      expect(session?.name).toBe('Morning Session')
      expect(session?.initialAmount).toBe(1000)
      expect(session?.notes).toBe('Test notes')
      expect(session?.status).toBe(Entities.CashSessionStatus.OPEN)
      expect(session?.openedAt).toBeDefined()
    })
  })

  describe('getByBranchId', () => {
    it('should return all sessions for a branch', async () => {
      await SessionRepository.create({ name: 'Session 1', branchId })
      await SessionRepository.create({ name: 'Session 2', branchId })

      const sessions = await SessionRepository.getByBranchId(branchId)

      expect(sessions).toHaveLength(2)
    })

    it('should return sessions ordered by openedAt descending', async () => {
      const s1 = await SessionRepository.create({ name: 'Session 1', branchId })
      const s2 = await SessionRepository.create({ name: 'Session 2', branchId })

      const sessions = await SessionRepository.getByBranchId(branchId)

      expect(sessions[0].id).toBe(s2)
      expect(sessions[1].id).toBe(s1)
    })

    it('should exclude deleted sessions', async () => {
      const id = await SessionRepository.create({ name: 'Session', branchId })
      await SessionRepository.delete(id)

      const sessions = await SessionRepository.getByBranchId(branchId)

      expect(sessions).toHaveLength(0)
    })
  })

  describe('getById', () => {
    it('should return session by id', async () => {
      const id = await SessionRepository.create({
        name: 'Test Session',
        branchId,
      })

      const session = await SessionRepository.getById(id)

      expect(session).toBeDefined()
      expect(session?.name).toBe('Test Session')
    })

    it('should return undefined for non-existent id', async () => {
      const session = await SessionRepository.getById('non-existent-id')

      expect(session).toBeUndefined()
    })
  })

  describe('getOpenByBranchId', () => {
    it('should return open session for branch', async () => {
      await SessionRepository.create({ name: 'Session 1', branchId })

      const openSession = await SessionRepository.getOpenByBranchId(branchId)

      expect(openSession).toBeDefined()
      expect(openSession?.status).toBe(Entities.CashSessionStatus.OPEN)
    })

    it('should return undefined when no open session', async () => {
      const id = await SessionRepository.create({ name: 'Session', branchId })
      await SessionRepository.close(id)

      const openSession = await SessionRepository.getOpenByBranchId(branchId)

      expect(openSession).toBeUndefined()
    })
  })

  describe('update', () => {
    it('should update a session', async () => {
      const id = await SessionRepository.create({
        name: 'Original Name',
        branchId,
      })

      await SessionRepository.update(id, { name: 'Updated Name' })

      const session = await SessionRepository.getById(id)
      expect(session?.name).toBe('Updated Name')
    })

    it('should update initialAmount', async () => {
      const id = await SessionRepository.create({
        name: 'Session',
        branchId,
      })

      await SessionRepository.update(id, { initialAmount: 5000 })

      const session = await SessionRepository.getById(id)
      expect(session?.initialAmount).toBe(5000)
    })
  })

  describe('close', () => {
    it('should close a session', async () => {
      const id = await SessionRepository.create({
        name: 'Session',
        branchId,
      })

      await SessionRepository.close(id)

      const session = await SessionRepository.getById(id)
      expect(session?.status).toBe(Entities.CashSessionStatus.CLOSED)
      expect(session?.closedAt).toBeDefined()
    })

    it('should close a session with closingBalance', async () => {
      const id = await SessionRepository.create({
        name: 'Session',
        branchId,
      })

      await SessionRepository.close(id, 1500)

      const session = await SessionRepository.getById(id)
      expect(session?.closingBalance).toBe(1500)
    })
  })

  describe('delete', () => {
    it('should soft delete a session', async () => {
      const id = await SessionRepository.create({
        name: 'Session',
        branchId,
      })

      await SessionRepository.delete(id)

      const session = await SessionRepository.getById(id)
      expect(session?.deletedAt).toBeDefined()
    })
  })
})
