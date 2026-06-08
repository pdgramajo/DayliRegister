import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../modal'

describe('Modal', () => {
  it('should not render when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <Modal.Content>contenido</Modal.Content>
      </Modal>
    )
    expect(screen.queryByText('contenido')).toBeNull()
  })

  it('should render when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <Modal.Content>contenido</Modal.Content>
      </Modal>
    )
    expect(screen.getByText('contenido')).toBeDefined()
  })

  it('should show the title', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <Modal.Content title="Título">contenido</Modal.Content>
      </Modal>
    )
    expect(screen.getByText('Título')).toBeDefined()
  })

  it('should not call onClose when clicking inside the modal content', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <Modal.Content>contenido</Modal.Content>
      </Modal>
    )
    fireEvent.click(screen.getByText('contenido'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should call onClose when clicking the close button', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <Modal.Content title="Título">contenido</Modal.Content>
      </Modal>
    )
    const closeButton = screen.getByRole('button', { name: /cerrar/i })
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose on Escape key', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <Modal.Content>contenido</Modal.Content>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose on other keys', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <Modal.Content>contenido</Modal.Content>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should render children', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <Modal.Content>
          <span>child1</span>
          <span>child2</span>
        </Modal.Content>
      </Modal>
    )
    expect(screen.getByText('child1')).toBeDefined()
    expect(screen.getByText('child2')).toBeDefined()
  })
})
