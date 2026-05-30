import { Entities } from '../types/entities'
import { STORAGE_NAMESPACE } from '../constants/storage'

const STORAGE_PREFIX = `${STORAGE_NAMESPACE}quickValues_`

const DEFAULTS: Record<string, unknown[]> = {
  [Entities.TransactionTypes.SALE]: [100, 200, 500, 1000, 2000, 5000, 10000],
  [Entities.TransactionTypes.EXPENSE]: [100, 200, 500, 1000, 2000, 5000, 10000],
  [Entities.TransactionTypes.WITHDRAWAL]: [
    100, 200, 500, 1000, 2000, 5000, 10000,
  ],
  [Entities.TransactionTypes.INCOME]: [100, 200, 500, 1000, 2000, 5000, 10000],
  [`inventory_${Entities.InventoryMovementTypes.IN}`]: [1, 2, 5, 10, 20, 50],
  [`inventory_${Entities.InventoryMovementTypes.OUT}`]: [1, 2, 5, 10, 20, 50],
  inventory_notes: ['media res', 'yunta', 'gancho', 'cuarto'],
}

export const QuickValuesService = {
  load<T = number>(key: string): T[] {
    const stored = localStorage.getItem(STORAGE_PREFIX + key)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed as T[]
      } catch {}
    }
    return (DEFAULTS[key] as T[]) || []
  },

  save<T = number>(key: string, values: T[]): void {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(values))
  },
}
