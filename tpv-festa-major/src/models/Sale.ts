import type { SaleLine } from './SaleLine'

export type PaymentMethod = 'cash' | 'card'

export type Sale = {
  operationNumber: string
  terminal: string
  sessionId: string
  timestamp: string
  paymentMethod: PaymentMethod
  total: number
  lines: SaleLine[]
}
