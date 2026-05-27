const STORAGE_PREFIX = 'quickValues_'

const DEFAULTS: Record<string, unknown[]> = {
  sale: [100, 200, 500, 1000, 2000, 5000, 10000],
  expense: [100, 200, 500, 1000, 2000, 5000, 10000],
  withdrawal: [100, 200, 500, 1000, 2000, 5000, 10000],
  income: [100, 200, 500, 1000, 2000, 5000, 10000],
  inventory_in: [1, 2, 5, 10, 20, 50],
  inventory_out: [1, 2, 5, 10, 20, 50],
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
