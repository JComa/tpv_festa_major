import type { Operation } from '../models/Operation'
import type { Product } from '../models/Product'
import type { Session } from '../models/Session'
import type { SessionExport } from '../models/SessionExport'
import { calculateSessionSummary } from './summaryService'

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
  const summary = calculateSessionSummary(session, operations)

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
      initialCash: summary.initialCash,
      totalSales: summary.totalSales,
      totalCash: summary.totalCash,
      totalCard: summary.totalCard,
      totalGlassReturns: summary.totalGlassReturns,
      finalCash,
      operationCount: summary.operationCount,
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
