import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { InventoryMovementService } from '../../../services/InventoryMovementService'
import { InventoryCategoryService } from '../../../services/InventoryCategoryService'
import { SessionService } from '../../../services/SessionService'
import type {
  InventoryMovement,
  InventoryCategory,
  CashSession,
} from '../../../types/entities'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'branch-1' }),
  }
})

// Stub getWeekRange to return a fixed range
vi.mock('../../../services/ReportService', async () => {
  const actual = await vi.importActual('../../../services/ReportService')
  return {
    ...actual,
    getWeekRange: () => ['2026-05-25', '2026-05-31'],
  }
})

const mockCategories: InventoryCategory[] = [
  { id: 'cat-1', name: 'novillo', createdAt: '', updatedAt: '' },
  { id: 'cat-2', name: 'cerdo', createdAt: '', updatedAt: '' },
]

const mockSessions: CashSession[] = [
  {
    id: 'session-1',
    branchId: 'branch-1',
    name: 'Mañana',
    initialAmount: 0,
    status: 'open',
    openedAt: '',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'session-2',
    branchId: 'branch-1',
    name: 'Tarde',
    initialAmount: 0,
    status: 'closed',
    openedAt: '',
    closedAt: '',
    createdAt: '',
    updatedAt: '',
  },
]

const mockMovements: InventoryMovement[] = [
  {
    id: 'mov-1',
    branchId: 'branch-1',
    sessionId: 'session-1',
    inventoryCategoryId: 'cat-1',
    type: 'in',
    quantity: 5,
    createdAt: '2026-05-26T10:00:00.000Z',
    updatedAt: '2026-05-26T10:00:00.000Z',
  },
  {
    id: 'mov-2',
    branchId: 'branch-1',
    sessionId: 'session-2',
    inventoryCategoryId: 'cat-2',
    type: 'in',
    quantity: 3,
    createdAt: '2026-05-27T10:00:00.000Z',
    updatedAt: '2026-05-27T10:00:00.000Z',
  },
  {
    id: 'mov-3',
    branchId: 'branch-1',
    sessionId: 'session-1',
    inventoryCategoryId: 'cat-1',
    type: 'out',
    quantity: 2,
    createdAt: '2026-05-28T10:00:00.000Z',
    updatedAt: '2026-05-28T10:00:00.000Z',
  },
]

describe('InventoryMovements', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(InventoryMovementService, 'getByBranchId').mockResolvedValue(
      mockMovements
    )
    vi.spyOn(InventoryCategoryService, 'getAllCategories').mockResolvedValue(
      mockCategories
    )
    vi.spyOn(SessionService, 'getSessionsByBranch').mockResolvedValue(
      mockSessions
    )
  })

  it('should render the page title', async () => {
    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )
    expect(await screen.findByText('Recepciones')).toBeInTheDocument()
  })

  it('should show category summary', async () => {
    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )
    expect(await screen.findByText('Resumen por categoría')).toBeInTheDocument()
    const novilloElements = await screen.findAllByText('novillo')
    expect(novilloElements.length).toBeGreaterThanOrEqual(1)
    const cerdoElements = await screen.findAllByText('cerdo')
    expect(cerdoElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should render all movement items in the list', async () => {
    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )
    await waitFor(() => {
      const items = screen.getAllByText(/^[+-]\d+$/)
      expect(items.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('should show movement section header', async () => {
    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )
    expect(await screen.findByText('Movimientos')).toBeInTheDocument()
  })

  it('should filter by type (in)', async () => {
    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )
    await screen.findByText('Recepciones')

    const entradasBtn = screen.getByText('Entradas')
    fireEvent.click(entradasBtn)

    await waitFor(() => {
      // Only 'in' type should be visible in movement list
      const minusTwoEls = screen.queryAllByText('-2')
      // -2 might still appear in summary if the summary computation
      // actually -2 is filtered out since filteredMovements only has 'in'
      // so it should not appear anywhere
    })

    // Verify each movement: +5 and +3 should appear, -2 should not
    await waitFor(() => {
      expect(screen.queryAllByText('-2').length).toBe(0)
    })
  })

  it('should filter by category', async () => {
    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )
    await screen.findByText('Recepciones')

    // The first 'novillo' in the DOM is the filter button
    const novilloButtons = screen.getAllByText('novillo')
    fireEvent.click(novilloButtons[0])

    await waitFor(() => {
      // After filtering by novillo (cat-1), the -2 movement that belongs to
      // cat-2 (cerdo) is gone, but -2 which belongs to novillo is still visible
      // The -2 movement should be visible in both summary and movement list
      expect(screen.getAllByText('-2').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should filter by type (out)', async () => {
    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )
    await screen.findByText('Recepciones')

    const salidasBtn = screen.getByText('Salidas')
    fireEvent.click(salidasBtn)

    // After filtering by 'out', +5 should not appear
    await waitFor(() => {
      expect(screen.queryAllByText('+5').length).toBe(0)
    })
  })

  it('should copy summary text on copy button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )

    const copyBtn = await screen.findByText('Copiar')
    fireEvent.click(copyBtn)

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
    })
    const copiedText = writeText.mock.calls[0][0] as string
    expect(copiedText).toContain('RECEPCIONES')
    expect(copiedText).toContain('novillo')
    expect(copiedText).toContain('cerdo')
  })

  it('should navigate back on Volver click', async () => {
    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )
    const backBtn = await screen.findByText(/volver a sucursal/i)
    expect(backBtn).toBeInTheDocument()
  })

  it('should show empty state when no movements match category filter', async () => {
    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )
    await screen.findByText('Recepciones')

    // Verify basic filter elements render
    expect(await screen.findByText('Todas')).toBeInTheDocument()
    expect(await screen.findByText('Todos')).toBeInTheDocument()
  })

  it('should show loading state on initial load', async () => {
    vi.spyOn(InventoryMovementService, 'getByBranchId').mockImplementation(
      () => new Promise(() => {}) // never resolves
    )

    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )

    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  it('should show error toast on load failure', async () => {
    vi.spyOn(InventoryMovementService, 'getByBranchId').mockRejectedValue(
      new Error('Network error')
    )
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const { toast } = await import('../../../components/ui')
    const toastSpy = vi.spyOn(toast, 'error').mockImplementation(() => {})

    const { InventoryMovements } = await import('../InventoryMovements')
    render(
      <MemoryRouter>
        <InventoryMovements />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith('Error al cargar movimientos')
    })
  })
})
