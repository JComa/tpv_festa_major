import type { SaleLine } from './SaleLine'
import type { Session } from './Session'

export type PersistedSession = {
  version: 1
  session: Session
  currentCash: number
  savedAt: string
}

export type PersistedSale = {
  version: 1
  sessionId: string
  saleItems: SaleLine[]
  savedAt: string
}
