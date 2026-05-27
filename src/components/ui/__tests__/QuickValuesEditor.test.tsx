import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickValuesEditor } from '../quick-values-editor'
import { QuickValuesService } from '../../../services/QuickValuesService'

const STORAGE_KEY = 'test_key'
const DEFAULT_VALUES = [100, 200, 500]

vi.mock('../../../services/QuickValuesService', () => ({
  QuickValuesService: {
    load: vi.fn(),
    save: vi.fn(),
  },
}))

describe('QuickValuesEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(QuickValuesService.load).mockReturnValue(DEFAULT_VALUES)
  })

  it('should render values from QuickValuesService', () => {
    render(<QuickValuesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />)
    DEFAULT_VALUES.forEach((v) => {
      expect(screen.getByText(v.toString())).toBeDefined()
    })
  })

  it('should call onSelect when clicking a value chip', () => {
    const onSelect = vi.fn()
    render(<QuickValuesEditor storageKey={STORAGE_KEY} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('100'))
    expect(onSelect).toHaveBeenCalledWith(100)
  })

  it('should not call onSelect when clicking in edit mode', () => {
    const onSelect = vi.fn()
    render(<QuickValuesEditor storageKey={STORAGE_KEY} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Editar'))
    fireEvent.click(screen.getByText('100'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('should toggle label between Editar and Hecho', () => {
    render(<QuickValuesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />)
    expect(screen.getByText('Editar')).toBeDefined()
    fireEvent.click(screen.getByText('Editar'))
    expect(screen.getByText('Hecho')).toBeDefined()
    fireEvent.click(screen.getByText('Hecho'))
    expect(screen.getByText('Editar')).toBeDefined()
  })

  it('should delete a value in edit mode', () => {
    render(<QuickValuesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByText('Editar'))
    fireEvent.click(screen.getByLabelText('Eliminar 100'))
    expect(QuickValuesService.save).toHaveBeenCalledWith(
      STORAGE_KEY,
      [200, 500]
    )
  })

  it('should show the add button in edit mode', () => {
    render(<QuickValuesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByText('Editar'))
    expect(screen.getByLabelText('Agregar valor rápido')).toBeDefined()
  })

  it('should add a new value', () => {
    render(<QuickValuesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByText('Editar'))
    fireEvent.click(screen.getByLabelText('Agregar valor rápido'))

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '300' } })
    fireEvent.blur(input)

    fireEvent.click(screen.getByLabelText('Confirmar valor rápido'))
    expect(QuickValuesService.save).toHaveBeenCalledWith(
      STORAGE_KEY,
      [100, 200, 500, 300]
    )
  })

  it('should use custom formatValue when provided', () => {
    const formatValue = (v: number) => `$${v}`
    render(
      <QuickValuesEditor
        storageKey={STORAGE_KEY}
        onSelect={vi.fn()}
        formatValue={formatValue}
      />
    )
    expect(screen.getByText('$100')).toBeDefined()
    expect(screen.getByText('$200')).toBeDefined()
    expect(screen.getByText('$500')).toBeDefined()
  })

  it('should reload values when storageKey changes', () => {
    const { rerender } = render(
      <QuickValuesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />
    )
    expect(screen.getByText('100')).toBeDefined()

    vi.mocked(QuickValuesService.load).mockReturnValue([999])
    rerender(<QuickValuesEditor storageKey="other_key" onSelect={vi.fn()} />)
    expect(screen.getByText('999')).toBeDefined()
  })
})
