const STORAGE_PREFIX = 'quickValues_'

const DEFAULTS: Record<string, number[]> = {
  sale: [100, 200, 500, 1000, 2000, 5000, 10000],
  expense: [100, 200, 500, 1000, 2000, 5000, 10000],
  withdrawal: [100, 200, 500, 1000, 2000, 5000, 10000],
  income: [100, 200, 500, 1000, 2000, 5000, 10000],
  inventory_in: [1, 2, 5, 10, 20, 50],
  inventory_out: [1, 2, 5, 10, 20, 50],
}

export const QuickValuesService = {
  load(key: string): number[] {
    const stored = localStorage.getItem(STORAGE_PREFIX + key)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed
      } catch {}
    }
    return DEFAULTS[key] || []
  },

  save(key: string, values: number[]): void {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(values))
  },
}
