import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { SessionForm } from '../SessionForm'

const renderForm = (props = {}) => {
  return render(
    <BrowserRouter>
      <SessionForm onSubmit={vi.fn()} {...props} />
    </BrowserRouter>
  )
}

describe('SessionForm', () => {
  it('should render form fields', () => {
    renderForm()

    expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Monto inicial/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Notas/)).toBeInTheDocument()
  })

  it('should show "Abrir sesión" for new session', () => {
    renderForm()

    expect(screen.getByText('Abrir sesión')).toBeInTheDocument()
  })

  it('should show "Guardar" when editing', () => {
    renderForm({ initialValues: { name: 'Existing Session' } })

    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })

  it('should use custom submitText when provided', () => {
    renderForm({ submitText: 'Actualizar' })

    expect(screen.getByText('Actualizar')).toBeInTheDocument()
  })

  it('should pre-fill form with initialValues', () => {
    renderForm({
      initialValues: { name: 'Sesión Mañana', notes: 'Nota de prueba' },
    })

    expect(screen.getByLabelText(/Nombre/)).toHaveValue('Sesión Mañana')
    expect(screen.getByLabelText(/Notas/)).toHaveValue('Nota de prueba')
  })

  it('should show error when submitting with empty name', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByText('Abrir sesión'))

    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
    })
  })

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    await user.type(screen.getByLabelText(/Nombre/), 'Mi Sesión')
    await user.click(screen.getByText('Abrir sesión'))

    await waitFor(() => {
      expect(onSubmit.mock.calls[0][0]).toEqual({
        name: 'Mi Sesión',
        initialAmount: undefined,
        notes: '',
      })
    })
  })

  it('should show cancel link with default href', () => {
    renderForm()

    expect(screen.getByText('Cancelar')).toBeInTheDocument()
    expect(screen.getByText('Cancelar').closest('a')).toHaveAttribute(
      'href',
      '/branches'
    )
  })

  it('should show cancel link with custom href', () => {
    renderForm({ cancelTo: '/branches/branch-1/sessions' })

    expect(screen.getByText('Cancelar').closest('a')).toHaveAttribute(
      'href',
      '/branches/branch-1/sessions'
    )
  })
})
