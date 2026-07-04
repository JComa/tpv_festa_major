import type { Operation } from '../models/Operation'
import type { Product } from '../models/Product'
import type { Session } from '../models/Session'
import type { SessionExport } from '../models/SessionExport'

type BuildSessionExportParams = {
  session: Session
  products: Product[]
  operations: Operation[]
  finalCash: number
}

export function buildSessionExport({
  session,
  products,
  operations,
  finalCash,
}: BuildSessionExportParams): SessionExport {
  const exportedAt = new Date().toISOString()
  const sales = operations.filter((operation) => operation.type === 'SALE')
  const glassReturns = operations.filter(
    (operation) => operation.type === 'GLASS_RETURN',
  )

  return {
    version: 1,
    exportedAt,
    terminal: session.terminal,
    session: {
      id: session.id,
      name: session.name,
      createdAt: session.createdAt,
      closedAt: exportedAt,
    },
    summary: {
      totalSales: sales.reduce((total, operation) => total + operation.total, 0),
      totalCash: sales
        .filter((operation) => operation.paymentMethod === 'EFECTIU')
        .reduce((total, operation) => total + operation.total, 0),
      totalCard: sales
        .filter((operation) => operation.paymentMethod === 'TARGETA')
        .reduce((total, operation) => total + operation.total, 0),
      totalGlassReturns: glassReturns.reduce(
        (total, operation) => total + operation.total,
        0,
      ),
      finalCash,
      operationCount: operations.length,
    },
    products: products.map((product) => ({ ...product })),
    operations: operations.map((operation) => ({
      ...operation,
      lines: operation.lines.map((line) => ({ ...line })),
    })),
  }
}

export function downloadSessionExport(exportData: SessionExport): void {
  const json = JSON.stringify(exportData, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `tpv_festa_major_${exportData.terminal}_${exportData.session.id}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
