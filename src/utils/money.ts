const moneyFormatter = new Intl.NumberFormat('ca-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(value: number): string {
  return moneyFormatter.format(value)
}
