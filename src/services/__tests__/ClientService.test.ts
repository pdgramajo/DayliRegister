import { describe, it, expect, beforeEach } from 'vitest'
import {
  ClientService,
  ClientNotFoundError,
  DebtEntryNotFoundError,
} from '../ClientService'
import { db } from '../../db'

describe('ClientService', () => {
  beforeEach(async () => {
    await db.clients.clear()
    await db.debtEntries.clear()
  })

  const seedClient = async (overrides = {}) => {
    const id = crypto.randomUUID()
    await db.clients.add({
      id,
      branchId: 'branch-1',
      name: 'Test Client',
      phone: '+543884123456',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    })
    return id
  }

  const seedEntry = async (overrides = {}) => {
    const id = crypto.randomUUID()
    await db.debtEntries.add({
      id,
      clientId: 'client-1',
      branchId: 'branch-1',
      type: 'debt',
      amount: 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    })
    return id
  }

  describe('getClientsByBranch', () => {
    it('should return clients with zero balance when no entries', async () => {
      await seedClient({ id: 'client-1' })

      const clients = await ClientService.getClientsByBranch('branch-1')

      expect(clients).toHaveLength(1)
      expect(clients[0].balance).toBe(0)
      expect(clients[0].entries).toEqual([])
    })

    it('should calculate balance from debt entries', async () => {
      await seedClient({ id: 'client-1' })
      await seedEntry({ clientId: 'client-1', type: 'debt', amount: 2000 })
      await seedEntry({ clientId: 'client-1', type: 'payment', amount: 500 })

      const clients = await ClientService.getClientsByBranch('branch-1')

      expect(clients).toHaveLength(1)
      expect(clients[0].balance).toBe(1500)
      expect(clients[0].entries).toHaveLength(2)
    })

    it('should exclude deleted entries from balance', async () => {
      await seedClient({ id: 'client-1' })
      await seedEntry({ clientId: 'client-1', type: 'debt', amount: 1000 })
      const deletedId = await seedEntry({
        clientId: 'client-1',
        type: 'debt',
        amount: 500,
      })
      await db.debtEntries.update(deletedId, {
        deletedAt: new Date().toISOString(),
      })

      const clients = await ClientService.getClientsByBranch('branch-1')

      expect(clients[0].balance).toBe(1000)
    })
  })

  describe('getClientById', () => {
    it('should return client with balance', async () => {
      await seedClient({ id: 'client-1' })
      await seedEntry({ clientId: 'client-1', type: 'debt', amount: 3000 })

      const client = await ClientService.getClientById('client-1')

      expect(client.name).toBe('Test Client')
      expect(client.balance).toBe(3000)
    })

    it('should throw ClientNotFoundError for non-existent id', async () => {
      await expect(ClientService.getClientById('non-existent')).rejects.toThrow(
        ClientNotFoundError
      )
    })
  })

  describe('createClient', () => {
    it('should create and return a client', async () => {
      const client = await ClientService.createClient({
        branchId: 'branch-1',
        name: 'New Client',
        phone: '+543884000000',
      })

      expect(client).toBeDefined()
      expect(client.name).toBe('New Client')
      expect(client.phone).toBe('+543884000000')
      expect(client.id).toBeDefined()
    })
  })

  describe('updateClient', () => {
    it('should update a client', async () => {
      const id = await seedClient()

      const updated = await ClientService.updateClient(id, {
        name: 'Updated Name',
      })

      expect(updated.name).toBe('Updated Name')
    })

    it('should throw ClientNotFoundError for non-existent id', async () => {
      await expect(
        ClientService.updateClient('non-existent', { name: 'Test' })
      ).rejects.toThrow(ClientNotFoundError)
    })
  })

  describe('deleteClient', () => {
    it('should soft delete a client', async () => {
      const id = await seedClient()

      await ClientService.deleteClient(id)

      const client = await db.clients.get(id)
      expect(client?.deletedAt).toBeDefined()
    })

    it('should throw ClientNotFoundError for non-existent id', async () => {
      await expect(ClientService.deleteClient('non-existent')).rejects.toThrow(
        ClientNotFoundError
      )
    })
  })

  describe('addDebtEntry', () => {
    it('should create a debt entry', async () => {
      const entry = await ClientService.addDebtEntry({
        clientId: 'client-1',
        branchId: 'branch-1',
        type: 'debt',
        amount: 2500,
      })

      expect(entry).toBeDefined()
      expect(entry.amount).toBe(2500)
      expect(entry.type).toBe('debt')
    })

    it('should create a payment entry', async () => {
      const entry = await ClientService.addDebtEntry({
        clientId: 'client-1',
        branchId: 'branch-1',
        type: 'payment',
        amount: 1000,
      })

      expect(entry.type).toBe('payment')
      expect(entry.amount).toBe(1000)
    })

    it('should create entry with description', async () => {
      const entry = await ClientService.addDebtEntry({
        clientId: 'client-1',
        branchId: 'branch-1',
        type: 'debt',
        amount: 1500,
        description: 'Pollo y pan',
      })

      expect(entry.description).toBe('Pollo y pan')
    })
  })

  describe('deleteDebtEntry', () => {
    it('should soft delete a debt entry', async () => {
      const id = await seedEntry()

      await ClientService.deleteDebtEntry(id)

      const entry = await db.debtEntries.get(id)
      expect(entry?.deletedAt).toBeDefined()
    })

    it('should throw DebtEntryNotFoundError for non-existent id', async () => {
      await expect(
        ClientService.deleteDebtEntry('non-existent')
      ).rejects.toThrow(DebtEntryNotFoundError)
    })
  })
})
