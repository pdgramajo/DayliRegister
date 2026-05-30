import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReportStorage } from '../useReportStorage'

describe('useReportStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return default config when no stored data', () => {
    const { result } = renderHook(() => useReportStorage('branch-1'))
    expect(result.current.config.phone).toBe('')
    expect(result.current.config.selectedCategoryIds).toEqual([])
    expect(result.current.config.showPaymentBreakdown).toBe(true)
    expect(result.current.config.showExpenses).toBe(false)
    expect(result.current.config.showWithdrawals).toBe(false)
    expect(result.current.config.showIncome).toBe(false)
    expect(result.current.config.showMovements).toBe(true)
    expect(result.current.config.showBalance).toBe(false)
  })

  it('should persist updates to localStorage', () => {
    const { result } = renderHook(() => useReportStorage('branch-1'))
    act(() => {
      result.current.updateConfig({ phone: '+5491123456789' })
    })
    expect(result.current.config.phone).toBe('+5491123456789')
    const stored = JSON.parse(
      localStorage.getItem('DayliRegister_reportConfig_branch-1')!
    )
    expect(stored.phone).toBe('+5491123456789')
  })

  it('should load stored config on init', () => {
    localStorage.setItem(
      'DayliRegister_reportConfig_branch-1',
      JSON.stringify({ phone: '+5491112345678', showBalance: true })
    )
    const { result } = renderHook(() => useReportStorage('branch-1'))
    expect(result.current.config.phone).toBe('+5491112345678')
    expect(result.current.config.showBalance).toBe(true)
    expect(result.current.config.showPaymentBreakdown).toBe(true) // default preserved
  })

  it('should handle multiple updates', () => {
    const { result } = renderHook(() => useReportStorage('branch-1'))
    act(() => {
      result.current.updateConfig({ showExpenses: true })
    })
    act(() => {
      result.current.updateConfig({ showIncome: true, showWithdrawals: true })
    })
    expect(result.current.config.showExpenses).toBe(true)
    expect(result.current.config.showIncome).toBe(true)
    expect(result.current.config.showWithdrawals).toBe(true)
    expect(result.current.config.showPaymentBreakdown).toBe(true) // default preserved
  })

  it('should use separate storage per branch', () => {
    const { result: result1 } = renderHook(() => useReportStorage('branch-1'))
    const { result: result2 } = renderHook(() => useReportStorage('branch-2'))

    act(() => {
      result1.current.updateConfig({ phone: '111' })
    })
    act(() => {
      result2.current.updateConfig({ phone: '222' })
    })

    expect(result1.current.config.phone).toBe('111')
    expect(result2.current.config.phone).toBe('222')
  })

  it('should handle invalid stored JSON gracefully', () => {
    localStorage.setItem('DayliRegister_reportConfig_branch-1', 'invalid-json')
    const { result } = renderHook(() => useReportStorage('branch-1'))
    expect(result.current.config.phone).toBe('')
    expect(result.current.config.showPaymentBreakdown).toBe(true)
  })
})
