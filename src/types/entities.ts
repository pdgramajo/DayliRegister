/**
 * Tipos para la base de datos de DayliRegister
 * @package @dayli-register/types
 */

/* =========================================================
 * BASE
 * ========================================================= */

/** Entidad base con timestamps */
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/* =========================================================
 * BRANCHES
 * ========================================================= */

/** Sucursal del negocio */
export interface Branch extends BaseEntity {
  name: string
  address?: string
  phone?: string
  isActive: boolean
}

/* =========================================================
 * CASH SESSIONS
 * ========================================================= */

/** Estado de sesión de caja */
export type CashSessionStatus = 'open' | 'closed'

/** Sesión de caja */
export interface CashSession extends BaseEntity {
  branchId: string
  name: string
  initialAmount?: number
  closingBalance?: number
  notes?: string
  status: CashSessionStatus
  openedAt: string
  closedAt?: string
}

/* =========================================================
 * TRANSACTIONS
 * ========================================================= */

/** Tipo de transacción */
export type TransactionType = 'sale' | 'expense' | 'withdrawal' | 'income'

/** Método de pago */
export type PaymentMethod = 'cash' | 'transfer'

/** Transacción (venta, gasto, retiro, ingreso) */
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

/** Categoría de inventario */
export interface InventoryCategory extends BaseEntity {
  name: string
}

/* =========================================================
 * INVENTORY MOVEMENTS
 * ========================================================= */

/** Tipo de movimiento de inventario */
export type InventoryMovementType = 'in' | 'out'

/** Movimiento de inventario */
export interface InventoryMovement extends BaseEntity {
  sessionId: string
  branchId: string
  inventoryCategoryId: string
  type: InventoryMovementType
  quantity: number
  description?: string
  notes?: string
}

/* =========================================================
 * PRODUCTS
 * ========================================================= */

/** Producto */
export interface Product extends BaseEntity {
  branchId: string
  name: string
  price: number
  offerPrice?: number
  category?: string
}

/* =========================================================
 * EXPORTS
 * ========================================================= */

export const Entities = {
  TransactionTypes: {
    SALE: 'sale',
    EXPENSE: 'expense',
    WITHDRAWAL: 'withdrawal',
    INCOME: 'income',
  },

  PaymentMethods: {
    CASH: 'cash',
    TRANSFER: 'transfer',
  },

  CashSessionStatus: {
    OPEN: 'open',
    CLOSED: 'closed',
  },

  InventoryMovementTypes: {
    IN: 'in',
    OUT: 'out',
  },
} as const satisfies {
  TransactionTypes: Record<string, TransactionType>
  PaymentMethods: Record<string, PaymentMethod>
  CashSessionStatus: Record<string, CashSessionStatus>
  InventoryMovementTypes: Record<string, InventoryMovementType>
}
