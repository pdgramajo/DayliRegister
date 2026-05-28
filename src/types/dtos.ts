import type {
  Branch,
  CashSession,
  Client,
  DebtEntry,
  Product,
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
