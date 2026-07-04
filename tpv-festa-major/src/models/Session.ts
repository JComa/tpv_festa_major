import type { Sale } from './Sale'

export type Session = {
  id: string
  name: string
  createdAt: string
  terminal: string
  operationCounter: number
  sales: Sale[]
}
