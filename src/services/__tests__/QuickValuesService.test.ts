import { describe, it, expect, beforeEach } from 'vitest'
import { QuickValuesService } from '../QuickValuesService'

describe('QuickValuesService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('load', () => {
    it('should return default values for sale', () => {
      const values = QuickValuesService.load('sale')
      expect(values).toEqual([100, 200, 500, 1000, 2000, 5000, 10000])
    })

    it('should return default values for expense', () => {
      const values = QuickValuesService.load('expense')
      expect(values).toEqual([100, 200, 500, 1000, 2000, 5000, 10000])
    })

    it('should return default values for inventory_in', () => {
      const values = QuickValuesService.load('inventory_in')
      expect(values).toEqual([1, 2, 5, 10, 20, 50])
    })

    it('should return default values for inventory_notes', () => {
      const values = QuickValuesService.load('inventory_notes')
      expect(values).toEqual(['media res', 'yunta', 'gancho', 'cuarto'])
    })

    it('should return saved values when localStorage has data', () => {
      localStorage.setItem(
        'DayliRegister_quickValues_sale',
        JSON.stringify([50, 100, 150])
      )

      const values = QuickValuesService.load('sale')
      expect(values).toEqual([50, 100, 150])
    })

    it('should return empty array for unknown key', () => {
      const values = QuickValuesService.load('unknown_key')
      expect(values).toEqual([])
    })

    it('should fallback to defaults when stored JSON is invalid', () => {
      localStorage.setItem('DayliRegister_quickValues_sale', 'not-json')

      const values = QuickValuesService.load('sale')
      expect(values).toEqual([100, 200, 500, 1000, 2000, 5000, 10000])
    })

    it('should fallback to defaults when stored value is not an array', () => {
      localStorage.setItem('DayliRegister_quickValues_sale', '{"key": "value"}')

      const values = QuickValuesService.load('sale')
      expect(values).toEqual([100, 200, 500, 1000, 2000, 5000, 10000])
    })
  })

  describe('save', () => {
    it('should persist values to localStorage', () => {
      QuickValuesService.save('sale', [1, 2, 3])

      const stored = localStorage.getItem('DayliRegister_quickValues_sale')
      expect(JSON.parse(stored!)).toEqual([1, 2, 3])
    })

    it('should overwrite previous values', () => {
      QuickValuesService.save('sale', [1, 2, 3])
      QuickValuesService.save('sale', [4, 5, 6])

      const stored = localStorage.getItem('DayliRegister_quickValues_sale')
      expect(JSON.parse(stored!)).toEqual([4, 5, 6])
    })
  })
})
