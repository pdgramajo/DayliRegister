import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatMoney,
  formatPhoneForDisplay,
  parsePhoneToSave,
} from '../formatters'

describe('formatDate', () => {
  it('formats a date string to es-AR locale', () => {
    const result = formatDate('2024-06-15T10:30:00Z')
    expect(result).toContain('15/06/2024')
  })
})

describe('formatMoney', () => {
  it('formats a number with thousands separator', () => {
    expect(formatMoney(1500)).toBe('1.500')
  })

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('0')
  })

  it('formats a small number', () => {
    expect(formatMoney(300)).toBe('300')
  })

  it('returns "-" for undefined', () => {
    expect(formatMoney(undefined)).toBe('-')
  })

  it('returns "-" for null', () => {
    expect(formatMoney(null as unknown as undefined)).toBe('-')
  })
})

describe('formatPhoneForDisplay', () => {
  it('formats argentinian phone with 54 prefix', () => {
    expect(formatPhoneForDisplay('541234567890')).toBe('+54 123 456 7890')
  })

  it('formats local 10-digit phone', () => {
    expect(formatPhoneForDisplay('1234567890')).toBe('123 456 7890')
  })

  it('returns empty string for empty input', () => {
    expect(formatPhoneForDisplay('')).toBe('')
  })

  it('returns original for unknown format', () => {
    expect(formatPhoneForDisplay('123')).toBe('123')
  })

  it('cleans non-digit characters', () => {
    expect(formatPhoneForDisplay('+54 123 456 7890')).toBe('+54 123 456 7890')
  })
})

describe('parsePhoneToSave', () => {
  it('adds + prefix for 54-prefixed numbers', () => {
    expect(parsePhoneToSave('541234567890')).toBe('+541234567890')
  })

  it('adds +54 for local 10-digit numbers', () => {
    expect(parsePhoneToSave('1234567890')).toBe('+541234567890')
  })

  it('returns empty string for empty input', () => {
    expect(parsePhoneToSave('')).toBe('')
  })

  it('returns original for unknown format', () => {
    expect(parsePhoneToSave('123')).toBe('123')
  })

  it('cleans non-digit characters', () => {
    expect(parsePhoneToSave('+54 123 456 7890')).toBe('+541234567890')
  })
})
