import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickNotesEditor } from '../quick-notes-editor'
import { QuickValuesService } from '../../../services/QuickValuesService'

const STORAGE_KEY = 'test_notes'
const DEFAULT_VALUES = ['media res', 'yunta', 'gancho']

vi.mock('../../../services/QuickValuesService', () => ({
  QuickValuesService: {
    load: vi.fn(),
    save: vi.fn(),
  },
}))

describe('QuickNotesEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(QuickValuesService.load).mockReturnValue(DEFAULT_VALUES)
  })

  it('should render values from QuickValuesService', () => {
    render(<QuickNotesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />)
    DEFAULT_VALUES.forEach((v) => {
      expect(screen.getByText(v)).toBeDefined()
    })
  })

  it('should call onSelect when clicking a note chip', () => {
    const onSelect = vi.fn()
    render(<QuickNotesEditor storageKey={STORAGE_KEY} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('media res'))
    expect(onSelect).toHaveBeenCalledWith('media res')
  })

  it('should not call onSelect when clicking in edit mode', () => {
    const onSelect = vi.fn()
    render(<QuickNotesEditor storageKey={STORAGE_KEY} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Editar'))
    fireEvent.click(screen.getByText('media res'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('should toggle label between Editar and Hecho', () => {
    render(<QuickNotesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />)
    expect(screen.getByText('Editar')).toBeDefined()
    fireEvent.click(screen.getByText('Editar'))
    expect(screen.getByText('Hecho')).toBeDefined()
    fireEvent.click(screen.getByText('Hecho'))
    expect(screen.getByText('Editar')).toBeDefined()
  })

  it('should delete a note in edit mode', () => {
    render(<QuickNotesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByText('Editar'))
    fireEvent.click(screen.getByLabelText('Eliminar media res'))
    expect(QuickValuesService.save).toHaveBeenCalledWith(STORAGE_KEY, [
      'yunta',
      'gancho',
    ])
  })

  it('should show the add button in edit mode', () => {
    render(<QuickNotesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByText('Editar'))
    expect(screen.getByLabelText('Agregar nota rápida')).toBeDefined()
  })

  it('should add a new note', () => {
    render(<QuickNotesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />)
    fireEvent.click(screen.getByText('Editar'))
    fireEvent.click(screen.getByLabelText('Agregar nota rápida'))

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'cuarto' } })

    fireEvent.click(screen.getByLabelText('Confirmar nota rápida'))
    expect(QuickValuesService.save).toHaveBeenCalledWith(STORAGE_KEY, [
      'media res',
      'yunta',
      'gancho',
      'cuarto',
    ])
  })

  it('should highlight the selected note', () => {
    render(
      <QuickNotesEditor
        storageKey={STORAGE_KEY}
        onSelect={vi.fn()}
        selected="yunta"
      />
    )
    const chip = screen.getByText('yunta')
    expect(chip.className).toContain('text-green-700')
  })

  it('should reload values when storageKey changes', () => {
    const { rerender } = render(
      <QuickNotesEditor storageKey={STORAGE_KEY} onSelect={vi.fn()} />
    )
    expect(screen.getByText('media res')).toBeDefined()

    vi.mocked(QuickValuesService.load).mockReturnValue(['cuarto'])
    rerender(<QuickNotesEditor storageKey="other_notes" onSelect={vi.fn()} />)
    expect(screen.getByText('cuarto')).toBeDefined()
  })
})
