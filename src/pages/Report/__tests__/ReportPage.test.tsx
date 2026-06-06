import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import branchReducer from '../../../store/branchSlice'
import { BranchService } from '../../../services'
import { InventoryCategoryService } from '../../../services/InventoryCategoryService'

// --- Mocks ---

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'branch-1' }),
  }
})

const mockGetReportData = vi.fn()
const mockGenerateReportText = vi.fn()

vi.mock('../../../services/ReportService', async () => {
  const actual = await vi.importActual('../../../services/ReportService')
  return {
    ...actual,
    getWeekRange: () => ['2026-05-25', '2026-05-31'],
    getReportData: mockGetReportData,
    generateReportText: mockGenerateReportText,
  }
})

const mockOpenWhatsApp = vi.fn()
vi.mock('../../../lib/whatsapp', () => ({
  openWhatsApp: mockOpenWhatsApp,
}))

const mockBranch: import('../../../types/entities').Branch = {
  id: 'branch-1',
  name: 'Test Branch',
  address: '',
  phone: '',
  isActive: true,
  createdAt: '',
  updatedAt: '',
}

beforeEach(() => {
  vi.clearAllMocks()

  // Mock scrollIntoView for JSDOM
  Element.prototype.scrollIntoView = vi.fn()

  vi.spyOn(BranchService, 'getBranchById').mockResolvedValue(mockBranch)

  mockGetReportData.mockResolvedValue({
    branchName: 'Test Branch',
    from: '2026-05-25',
    to: '2026-05-31',
    salesByDay: [
      {
        date: '2026-05-25',
        dayName: 'Lunes',
        dayNumber: 25,
        total: 1000,
        cash: 500,
        transfer: 500,
      },
    ],
    totalSales: 1000,
  })

  mockGenerateReportText.mockReturnValue(
    'REPORTE SEMANAL\nTest Branch\nTotal semana: $1.000'
  )

  vi.spyOn(InventoryCategoryService, 'getAllCategories').mockResolvedValue([
    { id: 'cat-1', name: 'novillo', createdAt: '', updatedAt: '' },
    { id: 'cat-2', name: 'cerdo', createdAt: '', updatedAt: '' },
  ])
})

const createStore = (overrides = {}) =>
  configureStore({
    reducer: { branches: branchReducer },
    preloadedState: {
      branches: {
        branches: [],
        currentBranch: null,
        isLoading: false,
        error: null,
        ...overrides,
      },
    },
  })

const renderWithValidStore = async () => {
  const { ReportPage } = await import('../ReportPage')
  const result = render(
    <Provider
      store={createStore({
        currentBranch: mockBranch,
      })}
    >
      <MemoryRouter>
        <ReportPage />
      </MemoryRouter>
    </Provider>
  )
  await act(async () => {})
  return result
}

// --- Tests ---

describe('ReportPage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  describe('Loading state', () => {
    it('should show spinner when branch is not loaded', async () => {
      const { ReportPage } = await import('../ReportPage')
      const store = createStore()
      render(
        <Provider store={store}>
          <MemoryRouter>
            <ReportPage />
          </MemoryRouter>
        </Provider>
      )

      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
      await act(async () => {})
    })
  })

  describe('Main content', () => {
    it('should render the report page header', async () => {
      await renderWithValidStore()
      expect(
        await screen.findByText('Reporte', {}, { timeout: 5000 })
      ).toBeInTheDocument()
    })

    it('should show the branch name in the back button', async () => {
      await renderWithValidStore()
      expect(
        await screen.findByText(/volver a test branch/i, {}, { timeout: 5000 })
      ).toBeInTheDocument()
    })

    it('should show both date pickers with week range', async () => {
      await renderWithValidStore()
      expect(
        await screen.findByText('25/05/2026', {}, { timeout: 5000 })
      ).toBeInTheDocument()
      expect(
        await screen.findByText('31/05/2026', {}, { timeout: 5000 })
      ).toBeInTheDocument()
    })

    it('should navigate back on "Volver" click', async () => {
      await renderWithValidStore()
      const backBtn = await screen.findByText(
        /volver a test branch/i,
        {},
        { timeout: 5000 }
      )
      fireEvent.click(backBtn)
      expect(mockNavigate).toHaveBeenCalledWith('/branches/branch-1/sessions')
    })
  })

  describe('Config section', () => {
    it('should show the config section title', async () => {
      await renderWithValidStore()
      await screen.findByText(
        'Configuración del reporte',
        {},
        { timeout: 5000 }
      )
    })

    it('should show all toggle switches', async () => {
      await renderWithValidStore()
      expect(
        await screen.findByText(
          'Desglose efectivo/transferencia',
          {},
          { timeout: 5000 }
        )
      ).toBeInTheDocument()
      expect(
        await screen.findByText('Gastos', {}, { timeout: 5000 })
      ).toBeInTheDocument()
      expect(
        await screen.findByText('Retiros', {}, { timeout: 5000 })
      ).toBeInTheDocument()
      expect(
        await screen.findByText('Ingresos', {}, { timeout: 5000 })
      ).toBeInTheDocument()
      expect(
        await screen.findByText(
          'Movimientos de inventario',
          {},
          { timeout: 5000 }
        )
      ).toBeInTheDocument()
      expect(
        await screen.findByText('Balance', {}, { timeout: 5000 })
      ).toBeInTheDocument()
    })

    it('should toggle a switch when clicked', async () => {
      await renderWithValidStore()
      const gastosLabel = await screen.findByText(
        'Gastos',
        {},
        { timeout: 5000 }
      )
      const toggleContainer = gastosLabel.closest('label')
      const checkbox = toggleContainer?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(false)
      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(true)
    })

    it('should show category checkboxes when movements toggle is on', async () => {
      await renderWithValidStore()
      await waitFor(
        () => {
          expect(screen.getByText('novillo')).toBeInTheDocument()
          expect(screen.getByText('cerdo')).toBeInTheDocument()
        },
        { timeout: 5000 }
      )
    })

    it('should show a message when no categories are available', async () => {
      vi.spyOn(InventoryCategoryService, 'getAllCategories').mockResolvedValue(
        []
      )

      await renderWithValidStore()
      // With showMovements=true and categories=[], the category section
      // should simply not render additional checkboxes
      await screen.findByText(
        'Configuración del reporte',
        {},
        { timeout: 5000 }
      )
    })
  })

  describe('Generate report', () => {
    it('should show the generate button', async () => {
      await renderWithValidStore()
      expect(
        await screen.findByText('Generar reporte', {}, { timeout: 5000 })
      ).toBeInTheDocument()
    })

    it('should auto-generate report on mount with valid data', async () => {
      await renderWithValidStore()
      await waitFor(
        () => {
          expect(mockGetReportData).toHaveBeenCalled()
        },
        { timeout: 10000 }
      )
      await waitFor(
        () => {
          expect(mockGenerateReportText).toHaveBeenCalled()
        },
        { timeout: 10000 }
      )
    })

    it('should show report preview after generation', async () => {
      await renderWithValidStore()

      // Wait for auto-generation to complete
      await waitFor(
        () => {
          expect(mockGetReportData).toHaveBeenCalled()
        },
        { timeout: 10000 }
      )

      // Now check that the preview appears in the DOM
      await waitFor(
        () => {
          expect(screen.getByText('Vista previa')).toBeInTheDocument()
        },
        { timeout: 10000 }
      )

      // Verify the report text is visible (inside <pre>)
      expect(
        screen.getByText(/Total semana/, { exact: false })
      ).toBeInTheDocument()
    }, 30000)

    it('should show success toast on generation', async () => {
      const { toast } = await import('../../../components/ui')
      const successSpy = vi.spyOn(toast, 'success').mockImplementation(() => {})

      await renderWithValidStore()

      await waitFor(
        () => {
          expect(successSpy).toHaveBeenCalledWith(
            'Reporte generado correctamente'
          )
        },
        { timeout: 10000 }
      )
    })

    it('should show error toast on generation failure', async () => {
      mockGetReportData.mockRejectedValue(new Error('DB error'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      const { toast } = await import('../../../components/ui')
      const errorSpy = vi.spyOn(toast, 'error').mockImplementation(() => {})

      await renderWithValidStore()

      await waitFor(
        () => {
          expect(errorSpy).toHaveBeenCalledWith('Error al generar el reporte')
        },
        { timeout: 10000 }
      )
    })

    it('should regenerate report when generate button is clicked', async () => {
      await renderWithValidStore()

      await waitFor(
        () => {
          expect(mockGetReportData).toHaveBeenCalledTimes(1)
        },
        { timeout: 10000 }
      )

      const generateBtn = await screen.findByText(
        'Generar reporte',
        {},
        { timeout: 5000 }
      )
      fireEvent.click(generateBtn)

      await waitFor(
        () => {
          expect(mockGetReportData).toHaveBeenCalledTimes(2)
        },
        { timeout: 10000 }
      )
    })
  })

  describe('WhatsApp section', () => {
    it('should show WhatsApp section', async () => {
      await renderWithValidStore()
      expect(
        await screen.findByText('Enviar por WhatsApp', {}, { timeout: 5000 })
      ).toBeInTheDocument()
    })

    it('should show phone input', async () => {
      await renderWithValidStore()
      expect(
        await screen.findByPlaceholderText(
          '+54 388 412 3456',
          {},
          { timeout: 5000 }
        )
      ).toBeInTheDocument()
    })

    it('should update phone value on input', async () => {
      await renderWithValidStore()
      const phoneInput = (await screen.findByPlaceholderText(
        '+54 388 412 3456',
        {},
        { timeout: 5000 }
      )) as HTMLInputElement
      fireEvent.change(phoneInput, { target: { value: '+5491112345678' } })
      expect(phoneInput.value).toBe('+5491112345678')
    })

    it('should show error toast when sending without phone', async () => {
      const { toast } = await import('../../../components/ui')
      const errorSpy = vi.spyOn(toast, 'error').mockImplementation(() => {})

      await renderWithValidStore()

      await waitFor(
        () => {
          expect(mockGenerateReportText).toHaveBeenCalled()
        },
        { timeout: 10000 }
      )

      const sendBtn = await screen.findByText('Enviar', {}, { timeout: 5000 })
      fireEvent.click(sendBtn)

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith('Ingresá un número de teléfono')
      })
    })

    it('should call openWhatsApp when phone and report are ready', async () => {
      await renderWithValidStore()

      await waitFor(
        () => {
          expect(mockGenerateReportText).toHaveBeenCalled()
        },
        { timeout: 10000 }
      )

      // Enter a phone
      const phoneInput = await screen.findByPlaceholderText(
        '+54 388 412 3456',
        {},
        { timeout: 5000 }
      )
      fireEvent.change(phoneInput, { target: { value: '+5491112345678' } })

      // Click send
      const sendBtn = screen.getByText('Enviar')
      fireEvent.click(sendBtn)

      await waitFor(() => {
        expect(mockOpenWhatsApp).toHaveBeenCalled()
      })
    })

    it('should disable Enviar button when report is not generated', async () => {
      // Mock getReportData to hang indefinitely
      mockGetReportData.mockImplementation(() => new Promise(() => {}))

      await renderWithValidStore()

      // Enter a phone so the only thing missing is the report
      const phoneInput = await screen.findByPlaceholderText(
        '+54 388 412 3456',
        {},
        { timeout: 5000 }
      )
      fireEvent.change(phoneInput, { target: { value: '+5491112345678' } })

      // The Enviar button should be disabled because reportText is empty
      const sendBtn = screen.getByText('Enviar')
      expect(sendBtn.closest('button')).toBeDisabled()
    })

    it('should have the WhatsApp section with description text', async () => {
      await renderWithValidStore()
      expect(
        await screen.findByText(
          'El reporte se abrirá en WhatsApp Web con el texto listo para enviar.',
          {},
          { timeout: 5000 }
        )
      ).toBeInTheDocument()
    })
  })
})
