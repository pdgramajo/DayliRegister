import {
  TransactionRepository,
  type CreateTransactionDTO,
} from '../repositories/TransactionRepository'
import type { Transaction } from '../types/entities'

export class TransactionNotFoundError extends Error {
  constructor(id: string) {
    super(`Transaction with id "${id}" not found`)
    this.name = 'TransactionNotFoundError'
  }
}

export const TransactionService = {
  async getTransactionsBySession(sessionId: string): Promise<Transaction[]> {
    return TransactionRepository.getBySessionId(sessionId)
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const transaction = await TransactionRepository.getById(id)
    if (!transaction) {
      throw new TransactionNotFoundError(id)
    }
    return transaction
  },

  async createTransaction(data: CreateTransactionDTO): Promise<Transaction> {
    const id = await TransactionRepository.create(data)
    const transaction = await TransactionRepository.getById(id)
    if (!transaction) {
      throw new Error('Failed to create transaction')
    }
    return transaction
  },

  async deleteTransaction(id: string): Promise<void> {
    const existing = await TransactionRepository.getById(id)
    if (!existing) {
      throw new TransactionNotFoundError(id)
    }
    await TransactionRepository.delete(id)
  },
}
