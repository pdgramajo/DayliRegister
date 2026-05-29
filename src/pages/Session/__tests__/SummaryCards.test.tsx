import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryCards } from '../SummaryCards'

describe('SummaryCards', () => {
  const defaultProps = {
    cashSales: 1500,
    transferSales: 3000,
    totalSales: 4500,
    cashInBox: 6000,
  }

  it('renders all summary labels', () => {
    render(<SummaryCards {...defaultProps} />)

    expect(screen.getByText('Efectivo')).toBeInTheDocument()
    expect(screen.getByText('Transferencias')).toBeInTheDocument()
    expect(screen.getByText('Total Ventas')).toBeInTheDocument()
    expect(screen.getByText('Dinero Caja')).toBeInTheDocument()
  })

  it('renders monetary values formatted', () => {
    render(<SummaryCards {...defaultProps} />)

    expect(screen.getByText('1.500')).toBeInTheDocument()
    expect(screen.getByText('3.000')).toBeInTheDocument()
    expect(screen.getByText('4.500')).toBeInTheDocument()
    expect(screen.getByText('6.000')).toBeInTheDocument()
  })

  it('copies value to clipboard on click', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })

    render(<SummaryCards {...defaultProps} />)

    const buttons = screen.getAllByTitle('Clic para copiar')
    await user.click(buttons[0])
    expect(writeText).toHaveBeenCalledWith('1500')
  })

  it('copies transfer sales on second card click', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })

    render(<SummaryCards {...defaultProps} />)

    const buttons = screen.getAllByTitle('Clic para copiar')
    await user.click(buttons[1])
    expect(writeText).toHaveBeenCalledWith('3000')
  })

  it('copies total sales on third card click', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })

    render(<SummaryCards {...defaultProps} />)

    const buttons = screen.getAllByTitle('Clic para copiar')
    await user.click(buttons[2])
    expect(writeText).toHaveBeenCalledWith('4500')
  })

  it('copies cash in box on fourth card click', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })

    render(<SummaryCards {...defaultProps} />)

    const buttons = screen.getAllByTitle('Clic para copiar')
    await user.click(buttons[3])
    expect(writeText).toHaveBeenCalledWith('6000')
  })
})
