import { describe, it, expect, vi } from 'vitest'
import { formatPhoneForWhatsApp, openWhatsApp } from '../whatsapp'

describe('formatPhoneForWhatsApp', () => {
  it('strips non-digit characters', () => {
    expect(formatPhoneForWhatsApp('+54 123 456 7890')).toBe('541234567890')
  })

  it('returns same string if no non-digits', () => {
    expect(formatPhoneForWhatsApp('541234567890')).toBe('541234567890')
  })

  it('handles empty string', () => {
    expect(formatPhoneForWhatsApp('')).toBe('')
  })
})

describe('openWhatsApp', () => {
  it('opens whatsapp URL with cleaned phone and encoded text', () => {
    const open = vi.fn()
    vi.stubGlobal('open', open)

    openWhatsApp('+54 123 456 7890', 'Hola, mundo!')

    expect(open).toHaveBeenCalledWith(
      'https://wa.me/541234567890?text=Hola%2C%20mundo!',
      '_blank'
    )
  })
})
