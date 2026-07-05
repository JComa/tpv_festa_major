import type { Operation } from './Operation'

export type Session = {
  id: string
  name: string
  createdAt: string
  terminal: string
  operationCounter: number
  operations: Operation[]
}
