import { describe, it, expect, beforeEach } from 'vitest'
import {
  SessionService,
  SessionNotFoundError,
  SessionAlreadyOpenError,
  SessionClosedError,
} from '../SessionService'
import { SessionRepository } from '../../repositories'
import { db } from '../../db'
import { Entities } from '../../types/entities'

describe('SessionService', () => {
  let branchId: string

  beforeEach(async () => {
    await db.cashSessions.clear()
    await db.branches.clear()
    branchId = await db.branches.add({
      id: crypto.randomUUID(),
      name: 'Test Branch',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  })

  describe('getSessionsByBranch', () => {
    it('should return all sessions for a branch', async () => {
      await db.cashSessions.add({
        id: crypto.randomUUID(),
        name: 'Session 1',
        branchId,
        status: Entities.CashSessionStatus.OPEN,
        openedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const sessions = await SessionService.getSessionsByBranch(branchId)

      expect(sessions).toHaveLength(1)
      expect(sessions[0].name).toBe('Session 1')
    })
  })

  describe('getSessionById', () => {
    it('should return session by id', async () => {
      const id = crypto.randomUUID()
      await db.cashSessions.add({
        id,
        name: 'Test Session',
        branchId,
        status: Entities.CashSessionStatus.OPEN,
        openedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const session = await SessionService.getSessionById(id)

      expect(session).toBeDefined()
      expect(session?.name).toBe('Test Session')
    })

    it('should throw SessionNotFoundError for non-existent id', async () => {
      await expect(
        SessionService.getSessionById('non-existent')
      ).rejects.toThrow(SessionNotFoundError)
    })
  })

  describe('createSession', () => {
    it('should create a new session', async () => {
      const session = await SessionService.createSession({
        name: 'New Session',
        branchId,
      })

      expect(session).toBeDefined()
      expect(session.name).toBe('New Session')
      expect(session.status).toBe(Entities.CashSessionStatus.OPEN)
      expect(session.branchId).toBe(branchId)
    })

    it('should create session with initialAmount and notes', async () => {
      const session = await SessionService.createSession({
        name: 'New Session',
        branchId,
        initialAmount: 1000,
        notes: 'Test notes',
      })

      expect(session.initialAmount).toBe(1000)
      expect(session.notes).toBe('Test notes')
    })

    it('should throw SessionAlreadyOpenError when session already open', async () => {
      await SessionService.createSession({
        name: 'First Session',
        branchId,
      })

      await expect(
        SessionService.createSession({
          name: 'Second Session',
          branchId,
        })
      ).rejects.toThrow(SessionAlreadyOpenError)
    })
  })

  describe('updateSession', () => {
    it('should update an open session', async () => {
      const session = await SessionService.createSession({
        name: 'Original',
        branchId,
      })

      const updated = await SessionService.updateSession(session.id, {
        name: 'Updated',
      })

      expect(updated.name).toBe('Updated')
    })

    it('should throw SessionNotFoundError for non-existent session', async () => {
      await expect(
        SessionService.updateSession('non-existent', { name: 'Test' })
      ).rejects.toThrow(SessionNotFoundError)
    })

    it('should throw SessionClosedError for closed session', async () => {
      const session = await SessionService.createSession({
        name: 'Session',
        branchId,
      })
      await SessionService.closeSession(session.id)

      await expect(
        SessionService.updateSession(session.id, { name: 'Test' })
      ).rejects.toThrow(SessionClosedError)
    })
  })

  describe('closeSession', () => {
    it('should close an open session', async () => {
      const session = await SessionService.createSession({
        name: 'Session',
        branchId,
      })

      const closed = await SessionService.closeSession(session.id)

      expect(closed.status).toBe(Entities.CashSessionStatus.CLOSED)
      expect(closed.closedAt).toBeDefined()
    })

    it('should close session with closingBalance', async () => {
      const session = await SessionService.createSession({
        name: 'Session',
        branchId,
      })

      const closed = await SessionService.closeSession(session.id, 1500)

      expect(closed.closingBalance).toBe(1500)
    })

    it('should throw SessionNotFoundError for non-existent session', async () => {
      await expect(SessionService.closeSession('non-existent')).rejects.toThrow(
        SessionNotFoundError
      )
    })

    it('should throw SessionClosedError for already closed session', async () => {
      const session = await SessionService.createSession({
        name: 'Session',
        branchId,
      })
      await SessionService.closeSession(session.id)

      await expect(SessionService.closeSession(session.id)).rejects.toThrow(
        SessionClosedError
      )
    })
  })

  describe('deleteSession', () => {
    it('should soft delete a session', async () => {
      const session = await SessionService.createSession({
        name: 'To Delete',
        branchId,
      })

      await SessionService.deleteSession(session.id)

      const deleted = await SessionRepository.getById(session.id)
      expect(deleted?.deletedAt).toBeDefined()
    })

    it('should throw SessionNotFoundError for non-existent session', async () => {
      await expect(
        SessionService.deleteSession('non-existent')
      ).rejects.toThrow(SessionNotFoundError)
    })

    it('should delete a session with transactions', async () => {
      const session = await SessionService.createSession({
        name: 'Session With Tx',
        branchId,
      })

      await db.transactions.add({
        id: crypto.randomUUID(),
        sessionId: session.id,
        branchId,
        type: 'sale' as const,
        amount: 500,
        paymentMethod: 'cash' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      await SessionService.deleteSession(session.id)

      const deleted = await SessionRepository.getById(session.id)
      expect(deleted?.deletedAt).toBeDefined()
    })
  })

  describe('getOpenSession', () => {
    it('should return open session for branch', async () => {
      const session = await SessionService.createSession({
        name: 'Session',
        branchId,
      })

      const openSession = await SessionService.getOpenSession(branchId)

      expect(openSession).toBeDefined()
      expect(openSession?.id).toBe(session.id)
    })

    it('should return undefined when no open session', async () => {
      await SessionService.createSession({
        name: 'Session',
        branchId,
      })
      await SessionService.closeSession(
        (await SessionService.getOpenSession(branchId))!.id
      )

      const openSession = await SessionService.getOpenSession(branchId)

      expect(openSession).toBeUndefined()
    })
  })
})
