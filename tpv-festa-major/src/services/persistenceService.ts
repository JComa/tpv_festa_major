import type { Operation, OperationLine } from '../models/Operation'
import type {
  PersistedSale,
  PersistedSession,
} from '../models/Persistence'
import type { SaleLine } from '../models/SaleLine'
import type { Session } from '../models/Session'

const ACTIVE_SESSION_KEY = 'tpv_festa_major_active_session'
const CURRENT_SALE_KEY = 'tpv_festa_major_current_sale'

function getStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch (error: unknown) {
    console.error('No es pot accedir a localStorage:', error)
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isOperationLine(value: unknown): value is OperationLine {
  if (!isRecord(value)) {
    return false
  }

  return (
    isNonEmptyString(value.productId) &&
    isNonEmptyString(value.productName) &&
    Number.isInteger(value.quantity) &&
    (value.quantity as number) > 0 &&
    isFiniteNumber(value.unitPrice) &&
    isFiniteNumber(value.total)
  )
}

function isOperation(value: unknown): value is Operation {
  if (!isRecord(value)) {
    return false
  }

  const hasValidPaymentMethod =
    value.type === 'SALE'
      ? value.paymentMethod === 'EFECTIU' || value.paymentMethod === 'TARGETA'
      : value.type === 'GLASS_RETURN' && value.paymentMethod === undefined

  return (
    isNonEmptyString(value.id) &&
    Number.isInteger(value.operationNumber) &&
    (value.operationNumber as number) > 0 &&
    isNonEmptyString(value.terminal) &&
    isNonEmptyString(value.sessionId) &&
    isNonEmptyString(value.timestamp) &&
    (value.type === 'SALE' || value.type === 'GLASS_RETURN') &&
    hasValidPaymentMethod &&
    Array.isArray(value.lines) &&
    value.lines.every(isOperationLine) &&
    isFiniteNumber(value.total)
  )
}

function isSession(value: unknown): value is Session {
  if (!isRecord(value) || !Array.isArray(value.operations)) {
    return false
  }

  const hasValidOperations = value.operations.every(isOperation)
  const maximumOperationNumber = hasValidOperations
    ? value.operations.reduce(
        (maximum, operation) =>
          Math.max(maximum, operation.operationNumber),
        0,
      )
    : 0

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.createdAt) &&
    isNonEmptyString(value.terminal) &&
    Number.isInteger(value.operationCounter) &&
    (value.operationCounter as number) > maximumOperationNumber &&
    hasValidOperations
  )
}

function isSaleLine(value: unknown): value is SaleLine {
  if (!isRecord(value)) {
    return false
  }

  return (
    isNonEmptyString(value.productId) &&
    isNonEmptyString(value.nom) &&
    isFiniteNumber(value.preu) &&
    value.preu >= 0 &&
    Number.isInteger(value.quantitat) &&
    (value.quantitat as number) > 0 &&
    isFiniteNumber(value.subtotal)
  )
}

function isPersistedSession(value: unknown): value is PersistedSession {
  return (
    isRecord(value) &&
    value.version === 1 &&
    isSession(value.session) &&
    isFiniteNumber(value.currentCash) &&
    isNonEmptyString(value.savedAt)
  )
}

function isPersistedSale(value: unknown): value is PersistedSale {
  return (
    isRecord(value) &&
    value.version === 1 &&
    isNonEmptyString(value.sessionId) &&
    Array.isArray(value.saleItems) &&
    value.saleItems.every(isSaleLine) &&
    isNonEmptyString(value.savedAt)
  )
}

function saveValue(key: string, value: unknown): void {
  try {
    getStorage()?.setItem(key, JSON.stringify(value))
  } catch (error: unknown) {
    console.error(`No s'ha pogut desar ${key}:`, error)
  }
}

function clearValue(key: string): void {
  try {
    getStorage()?.removeItem(key)
  } catch (error: unknown) {
    console.error(`No s'ha pogut eliminar ${key}:`, error)
  }
}

function loadValue<T>(
  key: string,
  validator: (value: unknown) => value is T,
): T | null {
  const storage = getStorage()

  if (storage === null) {
    return null
  }

  try {
    const serializedValue = storage.getItem(key)

    if (serializedValue === null) {
      return null
    }

    const value: unknown = JSON.parse(serializedValue)

    if (!validator(value)) {
      storage.removeItem(key)
      return null
    }

    return value
  } catch (error: unknown) {
    console.error(`No s'ha pogut carregar ${key}:`, error)

    try {
      storage.removeItem(key)
    } catch {
      // localStorage may also reject cleanup in restricted browser contexts.
    }

    return null
  }
}

export function saveActiveSession(data: PersistedSession): void {
  saveValue(ACTIVE_SESSION_KEY, data)
}

export function loadActiveSession(): PersistedSession | null {
  return loadValue(ACTIVE_SESSION_KEY, isPersistedSession)
}

export function clearActiveSession(): void {
  clearValue(ACTIVE_SESSION_KEY)
}

export function saveCurrentSale(data: PersistedSale): void {
  saveValue(CURRENT_SALE_KEY, data)
}

export function loadCurrentSale(): PersistedSale | null {
  return loadValue(CURRENT_SALE_KEY, isPersistedSale)
}

export function clearCurrentSale(): void {
  clearValue(CURRENT_SALE_KEY)
}
