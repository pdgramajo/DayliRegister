import type { Branch, CashSession } from './entities'

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
