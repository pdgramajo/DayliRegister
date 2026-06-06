import { useState, useCallback } from 'react'
import { STORAGE_NAMESPACE } from '../../constants/storage'

export interface ReportConfig {
  phone: string
  selectedCategoryIds: string[]
  selectedNotes: string[]
  showPaymentBreakdown: boolean
  showExpenses: boolean
  showWithdrawals: boolean
  showIncome: boolean
  showMovements: boolean
  showBalance: boolean
}

const DEFAULTS: ReportConfig = {
  phone: '',
  selectedCategoryIds: [],
  selectedNotes: [],
  showPaymentBreakdown: true,
  showExpenses: false,
  showWithdrawals: false,
  showIncome: false,
  showMovements: true,
  showBalance: false,
}

const STORAGE_PREFIX = `${STORAGE_NAMESPACE}reportConfig_`

const loadConfig = (branchId: string): ReportConfig => {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${branchId}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULTS, ...parsed }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULTS }
}

const saveConfig = (branchId: string, config: ReportConfig) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${branchId}`, JSON.stringify(config))
  } catch {
    // ignore
  }
}

export const useReportStorage = (branchId: string) => {
  const [config, setConfigState] = useState<ReportConfig>(() =>
    loadConfig(branchId)
  )

  const updateConfig = useCallback(
    (patch: Partial<ReportConfig>) => {
      setConfigState((prev) => {
        const next = { ...prev, ...patch }
        saveConfig(branchId, next)
        return next
      })
    },
    [branchId]
  )

  return { config, updateConfig }
}
