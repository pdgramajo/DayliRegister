import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card'

describe('Card', () => {
  it('should render children', () => {
    render(
      <Card>
        <p>content</p>
      </Card>
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <p>content</p>
      </Card>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('CardHeader', () => {
  it('should render children', () => {
    render(
      <CardHeader>
        <p>header</p>
      </CardHeader>
    )
    expect(screen.getByText('header')).toBeInTheDocument()
  })
})

describe('CardTitle', () => {
  it('should render children as h3', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })
})

describe('CardDescription', () => {
  it('should render children', () => {
    render(<CardDescription>description</CardDescription>)
    expect(screen.getByText('description')).toBeInTheDocument()
  })
})

describe('CardContent', () => {
  it('should render children', () => {
    render(
      <CardContent>
        <p>content</p>
      </CardContent>
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('should render children', () => {
    render(
      <CardFooter>
        <p>footer</p>
      </CardFooter>
    )
    expect(screen.getByText('footer')).toBeInTheDocument()
  })
})
