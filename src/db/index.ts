import Dexie, { type EntityTable } from 'dexie'
import type {
  BaseEntity,
  Branch,
  CashSession,
  Client,
  DebtEntry,
  Transaction,
  TransactionType,
  PaymentMethod,
  InventoryCategory,
  InventoryMovement,
  Product,
  LogEntry,
} from '../types/entities'

export type {
  BaseEntity,
  Branch,
  CashSession,
  Client,
  DebtEntry,
  Transaction,
  TransactionType,
  PaymentMethod,
  InventoryCategory,
  InventoryMovement,
  Product,
  LogEntry,
}

/* =========================================================
 * DATABASE
 * ========================================================= */

export class DayliRegisterDB extends Dexie {
  branches!: EntityTable<Branch, 'id'>

  cashSessions!: EntityTable<CashSession, 'id'>

  transactions!: EntityTable<Transaction, 'id'>

  inventoryCategories!: EntityTable<InventoryCategory, 'id'>

  inventoryMovements!: EntityTable<InventoryMovement, 'id'>

  products!: EntityTable<Product, 'id'>

  clients!: EntityTable<Client, 'id'>

  debtEntries!: EntityTable<DebtEntry, 'id'>

  logs!: EntityTable<LogEntry, 'id'>

  constructor() {
    super('dayliRegisterDB')

    this.version(3).stores({
      branches: 'id, name, isActive, createdAt, updatedAt, deletedAt',

      cashSessions:
        'id, branchId, name, initialAmount, closingBalance, notes, status, openedAt, closedAt, createdAt, updatedAt',

      transactions:
        'id, sessionId, branchId, type, amount, createdAt, updatedAt, deletedAt',

      inventoryCategories: 'id, name, createdAt, updatedAt',

      inventoryMovements:
        'id, sessionId, branchId, inventoryCategoryId, type, quantity, createdAt, updatedAt, deletedAt',

      products: 'id, branchId, name, price, createdAt, updatedAt, deletedAt',

      clients: 'id, branchId, name, phone, createdAt, updatedAt, deletedAt',

      debtEntries:
        'id, clientId, branchId, type, amount, createdAt, updatedAt, deletedAt',

      logs: 'id, level, context, createdAt',
    })
  }
}

export const db = new DayliRegisterDB()
