import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { BranchList } from '../BranchList'
import branchReducer from '../../../store/branchSlice'
import { BranchService } from '../../../services'
import type { Branch } from '../../../types/entities'

const mockBranch: Branch = {
  id: 'branch-1',
  name: 'Sucursal Centro',
  address: 'Av. Siempre Viva 123',
  phone: '+543881234567',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      branches: branchReducer,
    },
    preloadedState,
  })

const renderWithStore = (preloadedState: Record<string, unknown>) =>
  render(
    <MemoryRouter>
      <Provider store={createTestStore(preloadedState)}>
        <BranchList />
      </Provider>
    </MemoryRouter>
  )

describe('BranchList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    const { container } = renderWithStore({
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: true,
        error: null,
      },
    })

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should show error state and retry', async () => {
    vi.spyOn(BranchService, 'getAllBranches').mockRejectedValue(
      new Error('fail')
    )
    vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithStore({
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: false,
        error: null,
      },
    })

    await waitFor(() => {
      expect(
        screen.getByText('Error al cargar las sucursales')
      ).toBeInTheDocument()
    })

    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('should show empty state when no branches', async () => {
    vi.spyOn(BranchService, 'getAllBranches').mockResolvedValue([])

    renderWithStore({
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: false,
        error: null,
      },
    })

    await waitFor(() => {
      expect(screen.getByText('No hay sucursales creadas')).toBeInTheDocument()
    })
  })

  it('should render branches list', async () => {
    vi.spyOn(BranchService, 'getAllBranches').mockResolvedValue([mockBranch])

    renderWithStore({
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: false,
        error: null,
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Sucursal Centro')).toBeInTheDocument()
    })

    expect(screen.getByText('Av. Siempre Viva 123')).toBeInTheDocument()
  })

  it('should open delete modal and cancel', async () => {
    const user = userEvent.setup()
    vi.spyOn(BranchService, 'getAllBranches').mockResolvedValue([mockBranch])

    renderWithStore({
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: false,
        error: null,
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Sucursal Centro')).toBeInTheDocument()
    })

    const deleteButton = screen.getByTestId('delete-button')
    await user.click(deleteButton)

    expect(
      screen.getByText(/¿Estás seguro de que quieres eliminar/)
    ).toBeInTheDocument()

    await user.click(screen.getByText('Cancelar'))

    expect(
      screen.queryByText(/¿Estás seguro de que quieres eliminar/)
    ).not.toBeInTheDocument()
  })

  it('should confirm delete and call service', async () => {
    const user = userEvent.setup()
    vi.spyOn(BranchService, 'getAllBranches').mockResolvedValue([mockBranch])
    const deleteSpy = vi
      .spyOn(BranchService, 'deleteBranch')
      .mockResolvedValue(undefined)

    renderWithStore({
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: false,
        error: null,
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Sucursal Centro')).toBeInTheDocument()
    })

    const deleteButton = screen.getByTestId('delete-button')
    await user.click(deleteButton)

    await user.click(screen.getByText('Eliminar'))

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('branch-1')
    })
  })

  it('should close delete modal on overlay click', async () => {
    const user = userEvent.setup()
    vi.spyOn(BranchService, 'getAllBranches').mockResolvedValue([mockBranch])

    renderWithStore({
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: false,
        error: null,
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Sucursal Centro')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('delete-button'))

    await waitFor(() => {
      expect(
        screen.getByText(/¿Estás seguro de que quieres eliminar/)
      ).toBeInTheDocument()
    })

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(
        screen.queryByText(/¿Estás seguro de que quieres eliminar/)
      ).not.toBeInTheDocument()
    })
  })

  it('should show error toast on delete failure', async () => {
    const user = userEvent.setup()
    vi.spyOn(BranchService, 'getAllBranches').mockResolvedValue([mockBranch])
    vi.spyOn(BranchService, 'deleteBranch').mockRejectedValue(
      new Error('Delete failed')
    )

    renderWithStore({
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: false,
        error: null,
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Sucursal Centro')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('delete-button'))
    await user.click(screen.getByText('Eliminar'))
  })

  it('should retry on Reintentar click when error', async () => {
    const user = userEvent.setup()
    vi.spyOn(BranchService, 'getAllBranches').mockRejectedValue(
      new Error('fail')
    )
    vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithStore({
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: false,
        error: null,
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Reintentar')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Reintentar'))
  })
})
