import { SessionRepository } from '../repositories'
import type { CashSession } from '../types/entities'
import type { CreateSessionDTO, UpdateSessionDTO } from '../types/dtos'
import { Entities } from '../types/entities'

export class SessionNotFoundError extends Error {
  constructor(id: string) {
    super(`Session with id "${id}" not found`)
    this.name = 'SessionNotFoundError'
  }
}

export class SessionAlreadyOpenError extends Error {
  constructor(branchId: string) {
    super(`There is already an open session for branch "${branchId}"`)
    this.name = 'SessionAlreadyOpenError'
  }
}

export class SessionClosedError extends Error {
  constructor(id: string) {
    super(`Session "${id}" is already closed`)
    this.name = 'SessionClosedError'
  }
}

export const SessionService = {
  async getSessionsByBranch(branchId: string): Promise<CashSession[]> {
    return SessionRepository.getByBranchId(branchId)
  },

  async getSessionById(id: string): Promise<CashSession> {
    const session = await SessionRepository.getById(id)
    if (!session) {
      throw new SessionNotFoundError(id)
    }
    return session
  },

  async createSession(data: CreateSessionDTO): Promise<CashSession> {
    const openSession = await SessionRepository.getOpenByBranchId(data.branchId)
    if (openSession) {
      throw new SessionAlreadyOpenError(data.branchId)
    }

    const id = await SessionRepository.create(data)
    const session = await SessionRepository.getById(id)
    if (!session) {
      throw new Error('Failed to create session')
    }
    return session
  },

  async updateSession(
    id: string,
    data: UpdateSessionDTO
  ): Promise<CashSession> {
    const existing = await SessionRepository.getById(id)
    if (!existing) {
      throw new SessionNotFoundError(id)
    }

    if (existing.status === Entities.CashSessionStatus.CLOSED) {
      throw new SessionClosedError(id)
    }

    await SessionRepository.update(id, data)

    const updated = await SessionRepository.getById(id)
    if (!updated) {
      throw new Error('Failed to update session')
    }
    return updated
  },

  async closeSession(
    id: string,
    closingBalance?: number
  ): Promise<CashSession> {
    const existing = await SessionRepository.getById(id)
    if (!existing) {
      throw new SessionNotFoundError(id)
    }

    if (existing.status === Entities.CashSessionStatus.CLOSED) {
      throw new SessionClosedError(id)
    }

    await SessionRepository.close(id, closingBalance)

    const closed = await SessionRepository.getById(id)
    if (!closed) {
      throw new Error('Failed to close session')
    }
    return closed
  },

  async getOpenSession(branchId: string): Promise<CashSession | undefined> {
    return SessionRepository.getOpenByBranchId(branchId)
  },
}
