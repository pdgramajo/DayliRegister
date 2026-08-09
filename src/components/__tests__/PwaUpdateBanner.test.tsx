import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { PwaUpdateBanner } from '../PwaUpdateBanner'

const updateServiceWorkerMock = vi.fn()
let triggerNeedRefresh: (() => void) | undefined

vi.mock('virtual:pwa-register/react', async () => {
  const { useState } = await import('react')
  return {
    useRegisterSW: () => {
      const [needRefresh, setNeedRefresh] = useState(false)
      triggerNeedRefresh = () => setNeedRefresh(true)
      return {
        needRefresh: [needRefresh, setNeedRefresh] as [
          boolean,
          (value: boolean) => void,
        ],
        offlineReady: [false, () => {}] as [boolean, () => void],
        updateServiceWorker: updateServiceWorkerMock,
      }
    },
  }
})

beforeEach(() => {
  updateServiceWorkerMock.mockClear()
  triggerNeedRefresh = undefined
})

describe('PwaUpdateBanner', () => {
  it('renders nothing when there is no pending update', () => {
    render(<PwaUpdateBanner />)
    expect(
      screen.queryByText('Nueva versión disponible')
    ).not.toBeInTheDocument()
  })

  it('shows the banner when a new version is available', () => {
    render(<PwaUpdateBanner />)
    act(() => triggerNeedRefresh?.())

    expect(screen.getByText('Nueva versión disponible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recargar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ahora no' })).toBeInTheDocument()
  })

  it('reloads the app when clicking "Recargar"', () => {
    render(<PwaUpdateBanner />)
    act(() => triggerNeedRefresh?.())

    fireEvent.click(screen.getByRole('button', { name: 'Recargar' }))
    expect(updateServiceWorkerMock).toHaveBeenCalledWith(true)
  })

  it('dismisses the banner when clicking "Ahora no"', () => {
    render(<PwaUpdateBanner />)
    act(() => triggerNeedRefresh?.())

    fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }))
    expect(
      screen.queryByText('Nueva versión disponible')
    ).not.toBeInTheDocument()
  })
})
