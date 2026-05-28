export const formatPhoneForWhatsApp = (phone: string): string => {
  return phone.replace(/\D/g, '')
}

export const openWhatsApp = (phone: string, text: string): void => {
  const cleanPhone = formatPhoneForWhatsApp(phone)
  const encoded = encodeURIComponent(text)
  window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank')
}
