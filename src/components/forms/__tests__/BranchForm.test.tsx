import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BranchForm } from '../BranchForm'
import branchReducer from '../../../store/branchSlice'

const createTestStore = () =>
  configureStore({
    reducer: {
      branches: branchReducer,
    },
  })

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <Provider store={createTestStore()}>{component}</Provider>
    </BrowserRouter>
  )
}

describe('BranchForm', () => {
  it('should render form fields', () => {
    renderWithProviders(<BranchForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Dirección/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sucursal activa/)).toBeInTheDocument()
  })

  it('should show submit button with correct text for new branch', () => {
    renderWithProviders(<BranchForm onSubmit={vi.fn()} />)

    expect(screen.getByText('Crear sucursal')).toBeInTheDocument()
  })

  it('should show submit button with correct text for editing', () => {
    renderWithProviders(
      <BranchForm
        onSubmit={vi.fn()}
        initialValues={{ name: 'Existing Branch', isActive: true }}
      />
    )

    expect(screen.getByText('Guardar cambios')).toBeInTheDocument()
  })

  it('should pre-fill form with initialValues', () => {
    const initialValues = {
      name: 'Initial Branch',
      address: '123 Street',
      phone: '123456789',
      isActive: false,
    }

    renderWithProviders(
      <BranchForm onSubmit={vi.fn()} initialValues={initialValues} />
    )

    expect(screen.getByLabelText(/Nombre/)).toHaveValue('Initial Branch')
    expect(screen.getByLabelText(/Dirección/)).toHaveValue('123 Street')
    expect(screen.getByLabelText(/Teléfono/)).toHaveValue('123456789')
    expect(screen.getByLabelText(/Sucursal activa/)).not.toBeChecked()
  })
})
