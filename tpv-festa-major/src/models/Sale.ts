import type { Product } from './Product'

export type Sale = {
  operationId: string
  terminal: string
  timestamp: string
  products: Product[]
  paymentType: string
  total: number
}
