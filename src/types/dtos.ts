import type { Branch } from './entities'

export type CreateBranchDTO = Pick<
  Branch,
  'name' | 'address' | 'phone' | 'isActive'
>

export type UpdateBranchDTO = Partial<CreateBranchDTO>
