import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ProductForm } from '../ProductForm'

const renderForm = (props = {}) => {
  return render(
    <BrowserRouter>
      <ProductForm
        branchId="branch-1"
        onSubmit={vi.fn()}
        cancelTo="/branches/branch-1/products"
        {...props}
      />
    </BrowserRouter>
  )
}

describe('ProductForm', () => {
  it('should render form fields', () => {
    renderForm()

    expect(screen.getByLabelText(/^Nombre$/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Precio$/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Precio de oferta/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Categoría/)).toBeInTheDocument()
  })

  it('should show submit button with "Crear" for new product', () => {
    renderForm()

    expect(screen.getByText('Crear')).toBeInTheDocument()
  })

  it('should show submit button with "Guardar" when editing', () => {
    renderForm({ initialValues: { name: 'Existing Product' } })

    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })

  it('should pre-fill form with initialValues', () => {
    const initialValues = {
      name: 'Producto X',
      price: 1500,
      offerPrice: 1200,
      category: 'Bebidas',
    }

    renderForm({ initialValues })

    expect(screen.getByLabelText(/^Nombre$/)).toHaveValue('Producto X')
    expect(screen.getByLabelText(/Categoría/)).toHaveValue('Bebidas')
  })

  it('should show error when submitting with empty name', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
    })
  })

  it('should call onSubmit with product data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    await user.type(screen.getByLabelText(/^Nombre$/), 'Nuevo Producto')
    const priceInput = screen.getByLabelText(/^Precio$/)
    await user.type(priceInput, '1500')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Nuevo Producto',
        price: 1500,
        branchId: 'branch-1',
      })
    })
  })

  it('should call onSubmit with optional fields', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    await user.type(screen.getByLabelText(/^Nombre$/), 'Producto con Oferta')
    await user.type(screen.getByLabelText(/^Precio$/), '2000')
    await user.type(screen.getByLabelText(/Categoría/), 'Lácteos')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Producto con Oferta',
        price: 2000,
        category: 'Lácteos',
        branchId: 'branch-1',
      })
    })
  })

  it('should clear offerPrice when field is emptied on edit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const initialValues = {
      name: 'Producto Existente',
      price: 1500,
      offerPrice: 1200,
      category: 'Bebidas',
    }
    renderForm({ initialValues, onSubmit })

    // Clear offer price input (MoneyInput con formato)
    const offerPriceInput = screen.getByLabelText(/Precio de oferta/)
    await user.clear(offerPriceInput)

    // Clear category input
    const categoryInput = screen.getByLabelText(/Categoría/)
    await user.clear(categoryInput)

    await user.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
      const payload = onSubmit.mock.calls[0][0]
      expect(payload).toMatchObject({
        name: 'Producto Existente',
        price: 1500,
        branchId: 'branch-1',
      })
      // offerPrice y category deben estar explícitamente como undefined
      // para que Dexie los actualice (borre) en IndexedDB
      expect(payload).toHaveProperty('offerPrice')
      expect(payload.offerPrice).toBeUndefined()
      expect(payload).toHaveProperty('category')
      expect(payload.category).toBeUndefined()
    })
  })

  it('should show cancel link', () => {
    renderForm()

    expect(screen.getByText('Cancelar')).toBeInTheDocument()
    expect(screen.getByText('Cancelar').closest('a')).toHaveAttribute(
      'href',
      '/branches/branch-1/products'
    )
  })
})
