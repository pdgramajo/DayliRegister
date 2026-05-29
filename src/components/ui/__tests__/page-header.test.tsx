import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from '../page-header'

describe('PageHeader', () => {
  it('should render title', () => {
    render(<PageHeader title="Title" />)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('should render description when provided', () => {
    render(<PageHeader title="Title" description="A description" />)
    expect(screen.getByText('A description')).toBeInTheDocument()
  })

  it('should not render description when not provided', () => {
    render(<PageHeader title="Title" />)
    expect(screen.queryByText('A description')).not.toBeInTheDocument()
  })

  it('should render actions when provided', () => {
    render(<PageHeader title="Title" actions={<button>Action</button>} />)
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('should not render actions div when not provided', () => {
    const { container } = render(<PageHeader title="Title" />)
    expect(
      container.querySelector('.flex.items-center.gap-2')
    ).not.toBeInTheDocument()
  })
})
