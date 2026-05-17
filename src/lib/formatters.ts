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
