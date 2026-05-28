import type { Branch, CashSession, Product } from './entities'

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
