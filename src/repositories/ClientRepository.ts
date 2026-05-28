import { db } from '../db'
import type { Client } from '../types/entities'
import type { CreateClientDTO, UpdateClientDTO } from '../types/dtos'
import { getTimestamp } from '../lib/utils'

export const ClientRepository = {
  async getAll(branchId: string): Promise<Client[]> {
    return db.clients
      .where('branchId')
      .equals(branchId)
      .and((client) => !client.deletedAt)
      .toArray()
  },

  async getById(id: string): Promise<Client | undefined> {
    return db.clients.get(id)
  },

  async create(data: CreateClientDTO): Promise<string> {
    const now = getTimestamp()
    return db.clients.add({
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    })
  },

  async update(id: string, data: UpdateClientDTO): Promise<number> {
    return db.clients.update(id, {
      ...data,
      updatedAt: getTimestamp(),
    })
  },

  async delete(id: string): Promise<number> {
    return db.clients.update(id, {
      deletedAt: getTimestamp(),
    })
  },
}
