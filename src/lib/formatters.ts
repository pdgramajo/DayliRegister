export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatMoney = (amount?: number) => {
  if (amount === undefined || amount === null) return '-'
  return new Intl.NumberFormat('es-AR').format(amount)
}

export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return ''

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('54')) {
    const without54 = cleaned.slice(2)
    if (without54.length === 10) {
      return `+54 ${without54.slice(0, 3)} ${without54.slice(3, 6)} ${without54.slice(6)}`
    }
    return phone
  }

  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }

  return phone
}

export const parsePhoneToSave = (phone: string): string => {
  if (!phone) return ''

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('54')) {
    return `+${cleaned}`
  }

  if (cleaned.length === 10) {
    return `+54${cleaned}`
  }

  return phone
}
