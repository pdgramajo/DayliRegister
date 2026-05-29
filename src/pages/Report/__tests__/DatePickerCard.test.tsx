import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DatePickerCard } from '../DatePickerCard'

describe('DatePickerCard', () => {
  const defaultProps = {
    label: 'Desde',
    value: '2026-05-25',
    onChange: vi.fn(),
  }

  it('should render the label', () => {
    render(<DatePickerCard {...defaultProps} />)
    expect(screen.getByText('Desde')).toBeInTheDocument()
  })

  it('should format and display the date as DD/MM/YYYY', () => {
    render(<DatePickerCard {...defaultProps} />)
    expect(screen.getByText('25/05/2026')).toBeInTheDocument()
  })

  it('should show "Seleccionar" when no value is provided', () => {
    render(<DatePickerCard {...defaultProps} value="" />)
    expect(screen.getByText('Seleccionar')).toBeInTheDocument()
  })

  it('should render the CalendarDays icon', () => {
    const { container } = render(<DatePickerCard {...defaultProps} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('should call onChange when the hidden input changes', () => {
    const onChange = vi.fn()
    const { container } = render(
      <DatePickerCard {...defaultProps} onChange={onChange} />
    )
    const hiddenInput = container.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement
    fireEvent.change(hiddenInput, { target: { value: '2026-06-01' } })
    expect(onChange).toHaveBeenCalledWith('2026-06-01')
  })
})
