import type {
  Branch,
  CashSession,
  Client,
  DebtEntry,
  InventoryMovementType,
  Product,
  TransactionType,
  PaymentMethod,
} from './entities'

export type CreateBranchDTO = Pick<
  Branch,
  'name' | 'address' | 'phone' | 'isActive'
>

export type UpdateBranchDTO = Partial<CreateBranchDTO>

export type CreateSessionDTO = Pick<
  CashSession,
  'name' | 'branchId' | 'initialAmount' | 'notes'
>

export type UpdateSessionDTO = Partial<CreateSessionDTO>

export type CreateProductDTO = Pick<Product, 'branchId' | 'name' | 'price'> & {
  offerPrice?: number
  category?: string
}

export type UpdateProductDTO = Partial<
  Pick<Product, 'name' | 'price' | 'offerPrice' | 'category'>
>

export type CreateClientDTO = Pick<Client, 'branchId' | 'name' | 'phone'> & {
  notes?: string
}

export type UpdateClientDTO = Partial<Pick<Client, 'name' | 'phone' | 'notes'>>

export type CreateDebtEntryDTO = Pick<
  DebtEntry,
  'clientId' | 'branchId' | 'type' | 'amount'
> & {
  description?: string
}

export interface CreateTransactionDTO {
  sessionId: string
  branchId: string
  type: TransactionType
  amount: number
  paymentMethod?: PaymentMethod
  description?: string
  notes?: string
}

export interface CreateInventoryMovementDTO {
  sessionId: string
  branchId: string
  inventoryCategoryId: string
  type: InventoryMovementType
  quantity: number
  description?: string
  notes?: string
}

export type CreateInventoryCategoryDTO = { name: string }
