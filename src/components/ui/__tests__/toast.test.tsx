import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ToastProvider, toast } from '../toast'

describe('ToastProvider', () => {
  it('should render without crashing', () => {
    const { container } = render(<ToastProvider />)
    expect(container).toBeDefined()
  })
})

describe('toast', () => {
  it('should have success, error, info, custom, and dismiss functions', () => {
    expect(typeof toast.success).toBe('function')
    expect(typeof toast.error).toBe('function')
    expect(typeof toast.info).toBe('function')
    expect(typeof toast.custom).toBe('function')
    expect(typeof toast.dismiss).toBe('function')
  })

  it('should not have inline style or emoji in info toast configuration', () => {
    // Check that the info toast function doesn't inject style inline or use emojis
    const toastInfoSource = toast.info.toString()

    // The info function should not have inline styles or emojis
    expect(toastInfoSource).not.toContain('background:')
    expect(toastInfoSource).not.toContain('color:')
    expect(toastInfoSource).not.toContain('ℹ️')
    expect(toastInfoSource).not.toContain('icon:')
  })
})
