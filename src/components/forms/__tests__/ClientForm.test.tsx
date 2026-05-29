import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ClientForm } from '../ClientForm'

const renderForm = (props = {}) => {
  return render(
    <BrowserRouter>
      <ClientForm
        branchId="branch-1"
        onSubmit={vi.fn()}
        cancelTo="/branches/branch-1/clients"
        {...props}
      />
    </BrowserRouter>
  )
}

describe('ClientForm', () => {
  it('should render form fields', () => {
    renderForm()

    expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Notas/)).toBeInTheDocument()
  })

  it('should show submit button with "Crear" for new client', () => {
    renderForm()

    expect(screen.getByText('Crear')).toBeInTheDocument()
  })

  it('should show submit button with "Guardar" when editing', () => {
    renderForm({ initialValues: { name: 'Existing Client' } })

    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })

  it('should pre-fill form with initialValues', () => {
    renderForm({
      initialValues: {
        name: 'Juan Pérez',
        phone: '+543884123456',
        notes: 'Cliente frecuente',
      },
    })

    expect(screen.getByLabelText(/Nombre/)).toHaveValue('Juan Pérez')
    expect(screen.getByLabelText(/Notas/)).toHaveValue('Cliente frecuente')
  })

  it('should show error when submitting with empty name', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
    })
  })

  it('should call onSubmit with formatted data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    await user.type(screen.getByLabelText(/Nombre/), 'Nuevo Cliente')
    await user.type(screen.getByLabelText(/Teléfono/), '541234567890')
    await user.click(screen.getByText('Crear'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Nuevo Cliente',
        phone: '+541234567890',
        branchId: 'branch-1',
      })
    })
  })

  it('should show cancel link', () => {
    renderForm()

    expect(screen.getByText('Cancelar')).toBeInTheDocument()
    expect(screen.getByText('Cancelar').closest('a')).toHaveAttribute(
      'href',
      '/branches/branch-1/clients'
    )
  })
})
