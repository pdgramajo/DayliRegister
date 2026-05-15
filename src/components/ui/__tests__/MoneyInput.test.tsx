import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MoneyInput } from '../money-input'

describe('MoneyInput', () => {
  it('should render with prefix', () => {
    render(<MoneyInput value={1000} />)

    expect(screen.getByText('$')).toBeDefined()
  })

  it('should display formatted value', () => {
    render(<MoneyInput value={1000} />)

    const input = screen.getByPlaceholderText('0')
    expect(input).toHaveValue('1.000')
  })

  it('should display millions formatted', () => {
    render(<MoneyInput value={1000000} />)

    const input = screen.getByPlaceholderText('0')
    expect(input).toHaveValue('1.000.000')
  })

  it('should not show decimals', () => {
    render(<MoneyInput value={100} />)

    const input = screen.getByPlaceholderText('0')
    expect(input).toHaveValue('100')
  })

  it('should call onChange with number when typing', () => {
    const onChange = vi.fn()
    render(<MoneyInput onChange={onChange} />)

    const input = screen.getByPlaceholderText('0')
    fireEvent.change(input, { target: { value: '1.500' } })

    expect(onChange).toHaveBeenCalledWith(1500)
  })

  it('should return undefined when cleared', () => {
    const onChange = vi.fn()
    render(<MoneyInput value={1000} onChange={onChange} />)

    const input = screen.getByPlaceholderText('0')
    fireEvent.change(input, { target: { value: '' } })

    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('should handle initial value of 0', () => {
    render(<MoneyInput value={0} />)

    const input = screen.getByPlaceholderText('0')
    expect(input).toHaveValue('0')
  })
})
