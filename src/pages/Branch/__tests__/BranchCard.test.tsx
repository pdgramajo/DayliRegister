import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { BranchCard } from '../BranchCard'
import type { Branch } from '../../../types/entities'

const mockBranch: Branch = {
  id: 'test-branch-1',
  name: 'Central Branch',
  address: '123 Main St',
  phone: '+54 388 123 4567',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('BranchCard', () => {
  it('should render branch name', () => {
    renderWithRouter(<BranchCard branch={mockBranch} onDelete={vi.fn()} />)

    expect(screen.getByText('Central Branch')).toBeInTheDocument()
  })

  it('should render address when provided', () => {
    renderWithRouter(<BranchCard branch={mockBranch} onDelete={vi.fn()} />)

    expect(screen.getByText('123 Main St')).toBeInTheDocument()
  })

  it('should render phone when provided', () => {
    renderWithRouter(<BranchCard branch={mockBranch} onDelete={vi.fn()} />)

    expect(screen.getByText('+54 388 123 4567')).toBeInTheDocument()
  })

  it('should show active indicator when branch is active', () => {
    const activeBranch = { ...mockBranch, isActive: true }
    renderWithRouter(<BranchCard branch={activeBranch} onDelete={vi.fn()} />)

    const indicator = screen.getByTestId('status-indicator')
    expect(indicator).toHaveClass('bg-emerald-500')
  })

  it('should show inactive indicator when branch is inactive', () => {
    const inactiveBranch = { ...mockBranch, isActive: false }
    renderWithRouter(<BranchCard branch={inactiveBranch} onDelete={vi.fn()} />)

    const indicator = screen.getByTestId('status-indicator')
    expect(indicator).toHaveClass('bg-surface-300')
  })

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const handleDelete = vi.fn()

    renderWithRouter(<BranchCard branch={mockBranch} onDelete={handleDelete} />)

    const deleteButton = screen.getByTestId('delete-button')
    await user.click(deleteButton)

    expect(handleDelete).toHaveBeenCalledWith('test-branch-1', 'Central Branch')
  })

  it('should not render address when not provided', () => {
    const branchWithoutAddress = {
      ...mockBranch,
      address: undefined,
      phone: undefined,
    }

    renderWithRouter(
      <BranchCard branch={branchWithoutAddress} onDelete={vi.fn()} />
    )

    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument()
  })
})
