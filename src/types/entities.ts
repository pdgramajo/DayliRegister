/* =========================================================
 * BASE
 * ========================================================= */

export interface BaseEntity {
  id: string

  createdAt: string

  updatedAt: string

  deletedAt?: string
}

/* =========================================================
 * BRANCHES
 * ========================================================= */

export interface Branch extends BaseEntity {
  name: string
}

/* =========================================================
 * CASH SESSIONS
 * ========================================================= */

export interface CashSession extends BaseEntity {
  branchId: string

  status: 'open' | 'closed'

  openedAt: string

  closedAt?: string
}

/* =========================================================
 * TRANSACTIONS
 * ========================================================= */

export type TransactionType = 'sale' | 'expense' | 'withdrawal' | 'income'

export type PaymentMethod =
  | 'cash'
  | 'transfer'
  | 'debit_card'
  | 'credit_card'
  | 'mercado_pago'

export interface Transaction extends BaseEntity {
  sessionId: string

  branchId: string

  type: TransactionType

  amount: number

  paymentMethod?: PaymentMethod

  description?: string

  notes?: string
}

/* =========================================================
 * INVENTORY CATEGORIES
 * ========================================================= */

export interface InventoryCategory extends BaseEntity {
  name: string
}

/* =========================================================
 * INVENTORY MOVEMENTS
 * ========================================================= */

export interface InventoryMovement extends BaseEntity {
  sessionId: string

  branchId: string

  inventoryCategoryId: string

  type: 'in' | 'out'

  quantity: number

  description?: string

  notes?: string
}

/* =========================================================
 * PRODUCTS
 * ========================================================= */

export interface Product extends BaseEntity {
  branchId: string

  name: string

  price: number

  offerPrice?: number

  category?: string
}
