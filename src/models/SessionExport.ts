import type { Operation } from './Operation'
import type { Product } from './Product'

export type SessionExport = {
  version: 1
  exportedAt: string
  terminal: string
  session: {
    id: string
    name: string
    createdAt: string
    closedAt: string
  }
  summary: {
    totalSales: number
    totalCash: number
    totalCard: number
    totalGlassReturns: number
    finalCash: number
    operationCount: number
  }
  products: Product[]
  operations: Operation[]
}
