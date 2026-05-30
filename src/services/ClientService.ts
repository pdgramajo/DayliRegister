import { ClientRepository } from '../repositories/ClientRepository'
import { DebtEntryRepository } from '../repositories/DebtEntryRepository'
import { Entities, type Client, type DebtEntry } from '../types/entities'
import type {
  CreateClientDTO,
  UpdateClientDTO,
  CreateDebtEntryDTO,
} from '../types/dtos'
import { ERROR_NAMES } from '../constants/errors'

export class ClientNotFoundError extends Error {
  constructor(id: string) {
    super(`Client with id "${id}" not found`)
    this.name = ERROR_NAMES.CLIENT_NOT_FOUND
  }
}

export class DebtEntryNotFoundError extends Error {
  constructor(id: string) {
    super(`Debt entry with id "${id}" not found`)
    this.name = ERROR_NAMES.DEBT_ENTRY_NOT_FOUND
  }
}

export interface ClientWithBalance extends Client {
  balance: number
  entries: DebtEntry[]
}

export const ClientService = {
  async getClientsByBranch(branchId: string): Promise<ClientWithBalance[]> {
    const clients = await ClientRepository.getAll(branchId)
    return Promise.all(
      clients.map(async (client) => {
        const entries = await DebtEntryRepository.getByClient(client.id)
        const balance = entries.reduce((acc, e) => {
          return e.type === Entities.DebtEntryTypes.DEBT
            ? acc + e.amount
            : acc - e.amount
        }, 0)
        return { ...client, balance, entries }
      })
    )
  },

  async getClientById(id: string): Promise<ClientWithBalance> {
    const client = await ClientRepository.getById(id)
    if (!client) {
      throw new ClientNotFoundError(id)
    }
    const entries = await DebtEntryRepository.getByClient(id)
    const balance = entries.reduce((acc, e) => {
      return e.type === 'debt' ? acc + e.amount : acc - e.amount
    }, 0)
    return { ...client, balance, entries }
  },

  async createClient(data: CreateClientDTO): Promise<Client> {
    const id = await ClientRepository.create(data)
    const client = await ClientRepository.getById(id)
    if (!client) {
      throw new Error('Failed to create client')
    }
    return client
  },

  async updateClient(id: string, data: UpdateClientDTO): Promise<Client> {
    const existing = await ClientRepository.getById(id)
    if (!existing) {
      throw new ClientNotFoundError(id)
    }
    await ClientRepository.update(id, data)
    const updated = await ClientRepository.getById(id)
    if (!updated) {
      throw new Error('Failed to update client')
    }
    return updated
  },

  async deleteClient(id: string): Promise<void> {
    const existing = await ClientRepository.getById(id)
    if (!existing) {
      throw new ClientNotFoundError(id)
    }
    await ClientRepository.delete(id)
  },

  async addDebtEntry(data: CreateDebtEntryDTO): Promise<DebtEntry> {
    const id = await DebtEntryRepository.create(data)
    const entry = await DebtEntryRepository.getById(id)
    if (!entry) {
      throw new Error('Failed to create debt entry')
    }
    return entry
  },

  async deleteDebtEntry(id: string): Promise<void> {
    const existing = await DebtEntryRepository.getById(id)
    if (!existing) {
      throw new DebtEntryNotFoundError(id)
    }
    await DebtEntryRepository.delete(id)
  },
}
