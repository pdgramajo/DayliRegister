import { describe, it, expect, beforeEach } from 'vitest'
import { ClientRepository } from '../ClientRepository'
import { db } from '../../db'

describe('ClientRepository', () => {
  beforeEach(async () => {
    await db.clients.clear()
  })

  describe('create', () => {
    it('should create a client', async () => {
      const id = await ClientRepository.create({
        branchId: 'branch-1',
        name: 'Test Client',
        phone: '+543884123456',
      })

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('should create a client with all fields', async () => {
      const id = await ClientRepository.create({
        branchId: 'branch-1',
        name: 'Juan Pérez',
        phone: '+543884123456',
        notes: 'Cliente frecuente',
      })

      const client = await ClientRepository.getById(id)

      expect(client).toBeDefined()
      expect(client?.name).toBe('Juan Pérez')
      expect(client?.phone).toBe('+543884123456')
      expect(client?.notes).toBe('Cliente frecuente')
      expect(client?.branchId).toBe('branch-1')
      expect(client?.createdAt).toBeDefined()
      expect(client?.updatedAt).toBeDefined()
    })
  })

  describe('getAll', () => {
    it('should return all clients for a branch', async () => {
      await ClientRepository.create({
        branchId: 'branch-1',
        name: 'Client A',
        phone: '',
      })
      await ClientRepository.create({
        branchId: 'branch-1',
        name: 'Client B',
        phone: '',
      })

      const clients = await ClientRepository.getAll('branch-1')

      expect(clients).toHaveLength(2)
    })

    it('should not mix clients from different branches', async () => {
      await ClientRepository.create({
        branchId: 'branch-1',
        name: 'Client A',
        phone: '',
      })
      await ClientRepository.create({
        branchId: 'branch-2',
        name: 'Client B',
        phone: '',
      })

      const clients = await ClientRepository.getAll('branch-1')

      expect(clients).toHaveLength(1)
    })

    it('should exclude deleted clients', async () => {
      const id = await ClientRepository.create({
        branchId: 'branch-1',
        name: 'Client',
        phone: '',
      })
      await ClientRepository.delete(id)

      const clients = await ClientRepository.getAll('branch-1')

      expect(clients).toHaveLength(0)
    })
  })

  describe('getById', () => {
    it('should return client by id', async () => {
      const id = await ClientRepository.create({
        branchId: 'branch-1',
        name: 'Test',
        phone: '',
      })

      const client = await ClientRepository.getById(id)

      expect(client).toBeDefined()
      expect(client?.name).toBe('Test')
    })

    it('should return undefined for non-existent id', async () => {
      const client = await ClientRepository.getById('non-existent')
      expect(client).toBeUndefined()
    })
  })

  describe('update', () => {
    it('should update a client', async () => {
      const id = await ClientRepository.create({
        branchId: 'branch-1',
        name: 'Original',
        phone: '',
      })

      await ClientRepository.update(id, { name: 'Updated' })

      const client = await ClientRepository.getById(id)
      expect(client?.name).toBe('Updated')
    })

    it('should update phone and notes', async () => {
      const id = await ClientRepository.create({
        branchId: 'branch-1',
        name: 'Test',
        phone: '',
      })

      await ClientRepository.update(id, {
        phone: '+543884999999',
        notes: 'New note',
      })

      const client = await ClientRepository.getById(id)
      expect(client?.phone).toBe('+543884999999')
      expect(client?.notes).toBe('New note')
    })
  })

  describe('delete', () => {
    it('should soft delete a client', async () => {
      const id = await ClientRepository.create({
        branchId: 'branch-1',
        name: 'To Delete',
        phone: '',
      })

      await ClientRepository.delete(id)

      const client = await ClientRepository.getById(id)
      expect(client?.deletedAt).toBeDefined()
    })
  })
})
