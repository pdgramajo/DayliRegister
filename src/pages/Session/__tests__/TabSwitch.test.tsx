import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabSwitch } from '../TabSwitch'

describe('TabSwitch', () => {
  it('renders both tabs with counts', () => {
    render(
      <TabSwitch
        activeTab="movements"
        onChange={vi.fn()}
        transactionCount={5}
        inventoryCount={3}
      />
    )
    expect(screen.getByText('Movimientos (5)')).toBeInTheDocument()
    expect(screen.getByText('Inventario (3)')).toBeInTheDocument()
  })

  it('calls onChange with inventory when clicking Inventario tab', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <TabSwitch
        activeTab="movements"
        onChange={handleChange}
        transactionCount={0}
        inventoryCount={0}
      />
    )
    await user.click(screen.getByText('Inventario (0)'))
    expect(handleChange).toHaveBeenCalledWith('inventory')
  })

  it('calls onChange with movements when clicking Movimientos tab', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <TabSwitch
        activeTab="inventory"
        onChange={handleChange}
        transactionCount={5}
        inventoryCount={3}
      />
    )
    await user.click(screen.getByText('Movimientos (5)'))
    expect(handleChange).toHaveBeenCalledWith('movements')
  })
})
