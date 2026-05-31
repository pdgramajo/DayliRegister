import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '../ProductCard'
import type { Product } from '../../../types/entities'

const mockProduct: Product = {
  id: 'product-1',
  branchId: 'branch-1',
  name: 'Producto Test',
  price: 1500,
  category: 'Categoría A',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const defaultProps = {
  isSelected: false,
  onToggleSelect: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
}

describe('ProductCard', () => {
  it('should render product name', () => {
    render(<ProductCard product={mockProduct} {...defaultProps} />)

    expect(screen.getByText('Producto Test')).toBeInTheDocument()
  })

  it('should render category when provided', () => {
    render(<ProductCard product={mockProduct} {...defaultProps} />)

    expect(screen.getByText('Categoría A')).toBeInTheDocument()
  })

  it('should render formatted price', () => {
    render(<ProductCard product={mockProduct} {...defaultProps} />)

    expect(screen.getByText('$1.500')).toBeInTheDocument()
  })

  it('should render offer price when provided', () => {
    const productWithOffer = { ...mockProduct, offerPrice: 1200 }
    render(<ProductCard product={productWithOffer} {...defaultProps} />)

    expect(screen.getByText(/Oferta:.*1\.200/)).toBeInTheDocument()
  })

  it('should not render offer badge when offerPrice is undefined', () => {
    render(<ProductCard product={mockProduct} {...defaultProps} />)

    expect(screen.queryByText(/Oferta/)).not.toBeInTheDocument()
  })

  it('should not render category when not provided', () => {
    const productWithoutCategory = { ...mockProduct, category: undefined }
    render(<ProductCard product={productWithoutCategory} {...defaultProps} />)

    expect(screen.queryByText('Categoría A')).not.toBeInTheDocument()
  })

  it('should show checkbox as checked when selected', () => {
    render(
      <ProductCard product={mockProduct} {...defaultProps} isSelected={true} />
    )

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('should show checkbox as unchecked when not selected', () => {
    render(
      <ProductCard product={mockProduct} {...defaultProps} isSelected={false} />
    )

    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('should call onToggleSelect when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const handleToggle = vi.fn()
    render(
      <ProductCard
        product={mockProduct}
        {...defaultProps}
        onToggleSelect={handleToggle}
      />
    )

    await user.click(screen.getByRole('checkbox'))

    expect(handleToggle).toHaveBeenCalledWith('product-1')
  })

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    const handleEdit = vi.fn()
    render(
      <ProductCard
        product={mockProduct}
        {...defaultProps}
        onEdit={handleEdit}
      />
    )

    await user.click(screen.getAllByRole('button')[0])

    expect(handleEdit).toHaveBeenCalledWith('product-1')
  })

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const handleDelete = vi.fn()
    render(
      <ProductCard
        product={mockProduct}
        {...defaultProps}
        onDelete={handleDelete}
      />
    )

    await user.click(screen.getAllByRole('button')[1])

    expect(handleDelete).toHaveBeenCalledWith('product-1')
  })
})
