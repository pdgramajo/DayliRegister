import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ToastProvider, toast } from '../toast'

describe('ToastProvider', () => {
  it('should render without crashing', () => {
    const { container } = render(<ToastProvider />)
    expect(container).toBeDefined()
  })
})

describe('toast', () => {
  it('should have success and error functions', () => {
    expect(typeof toast.success).toBe('function')
    expect(typeof toast.error).toBe('function')
  })
})
