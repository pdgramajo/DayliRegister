import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../modal'

describe('Modal', () => {
  it('should not render when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        contenido
      </Modal>
    )
    expect(screen.queryByText('contenido')).toBeNull()
  })

  it('should render when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        contenido
      </Modal>
    )
    expect(screen.getByText('contenido')).toBeDefined()
  })

  it('should show the title', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Título">
        contenido
      </Modal>
    )
    expect(screen.getByText('Título')).toBeDefined()
  })

  it('should not call onClose when clicking inside the modal content', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        contenido
      </Modal>
    )
    fireEvent.click(screen.getByText('contenido'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should call onClose when clicking the close button', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Título">
        contenido
      </Modal>
    )
    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose on Escape key', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        contenido
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose on other keys', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        contenido
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should render children', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <span>child1</span>
        <span>child2</span>
      </Modal>
    )
    expect(screen.getByText('child1')).toBeDefined()
    expect(screen.getByText('child2')).toBeDefined()
  })
})
