import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../useTheme'

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
}

const mockMatchMedia = vi.fn()

vi.stubGlobal('localStorage', mockLocalStorage)
vi.stubGlobal('matchMedia', mockMatchMedia)

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockMatchMedia.mockReturnValue({ matches: false })
    document.documentElement.classList.remove('dark')
  })

  it('deberia iniciar con light por defecto', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
  })

  it('deberia iniciar con dark si localStorage tiene dark', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
  })

  it('deberia cambiar de light a dark al llamar toggleTheme', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')

    act(() => result.current.toggleTheme())

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'DayliRegister_theme',
      'dark'
    )
  })

  it('deberia cambiar de dark a light al llamar toggleTheme', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')

    act(() => result.current.toggleTheme())

    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'DayliRegister_theme',
      'light'
    )
  })

  it('deberia agregar clase dark al html cuando es dark', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    renderHook(() => useTheme())

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('deberia remover clase dark del html cuando es light', () => {
    document.documentElement.classList.add('dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')

    act(() => result.current.toggleTheme())
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => result.current.toggleTheme())
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
