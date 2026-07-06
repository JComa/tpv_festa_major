import type { Operation } from '../models/Operation'
import type { Session } from '../models/Session'

export type ProductSessionSummary = {
  productId: string
  productName: string
  quantity: number
  total: number
}

export type SessionSummary = {
  initialCash: number
  totalSales: number
  totalCash: number
  totalCard: number
  totalGlassReturns: number
  currentCash: number
  operationCount: number
  products: ProductSessionSummary[]
  glassesAdded: number
  glassesReturned: number
  glassBalance: number
}

export function calculateSessionSummary(
  session: Session,
  operations: Operation[],
): SessionSummary {
  const sessionOperations = operations.filter(
    (operation) => operation.sessionId === session.id,
  )
  const sales = sessionOperations.filter(
    (operation) => operation.type === 'SALE',
  )
  const glassReturns = sessionOperations.filter(
    (operation) => operation.type === 'GLASS_RETURN',
  )
  const productsById = new Map<string, ProductSessionSummary>()
  let glassesAdded = 0

  sales.forEach((operation) => {
    operation.lines.forEach((line) => {
      const currentProduct = productsById.get(line.productId)

      if (currentProduct === undefined) {
        productsById.set(line.productId, {
          productId: line.productId,
          productName: line.productName,
          quantity: line.quantity,
          total: line.total,
        })
      } else {
        currentProduct.quantity += line.quantity
        currentProduct.total += line.total
      }

      if (line.productId === 'got') {
        glassesAdded += line.quantity
      }
    })
  })

  const totalSales = sales.reduce(
    (total, operation) => total + operation.total,
    0,
  )
  const totalCash = sales
    .filter((operation) => operation.paymentMethod === 'EFECTIU')
    .reduce((total, operation) => total + operation.total, 0)
  const totalCard = sales
    .filter((operation) => operation.paymentMethod === 'TARGETA')
    .reduce((total, operation) => total + operation.total, 0)
  const totalGlassReturns = glassReturns.reduce(
    (total, operation) => total + operation.total,
    0,
  )
  const glassesReturned = glassReturns.reduce(
    (total, operation) =>
      total +
      operation.lines.reduce(
        (lineTotal, line) => lineTotal + line.quantity,
        0,
      ),
    0,
  )

  return {
    initialCash: session.initialCash ?? 0,
    totalSales,
    totalCash,
    totalCard,
    totalGlassReturns,
    currentCash: (session.initialCash ?? 0) + totalCash + totalGlassReturns,
    operationCount: sessionOperations.length,
    products: Array.from(productsById.values()),
    glassesAdded,
    glassesReturned,
    glassBalance: glassesAdded - glassesReturned,
  }
}
