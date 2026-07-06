import type { Session } from '../models/Session'
import type { SessionSummary } from '../services/summaryService'
import { formatMoney } from '../utils/money'

type SessionSummaryModalProps = {
  session: Session
  summary: SessionSummary
  onClose: () => void
  onExportSession: () => void
}

function formatDateTime(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('ca-ES', {
        dateStyle: 'short',
        timeStyle: 'medium',
      })
}

export function SessionSummaryModal({
  session,
  summary,
  onClose,
  onExportSession,
}: SessionSummaryModalProps) {
  return (
    <div className="modal-backdrop">
      <section
        className="modal session-summary-modal"
        aria-labelledby="session-summary-title"
        role="dialog"
        aria-modal="true"
      >
        <header className="session-summary-modal-header">
          <h2 id="session-summary-title">RESUM DE SESSIÓ</h2>
          <dl className="session-details">
            <div>
              <dt>Nom</dt>
              <dd>{session.name}</dd>
            </div>
            <div>
              <dt>ID de sessió</dt>
              <dd>{session.id}</dd>
            </div>
            <div>
              <dt>Terminal</dt>
              <dd>{session.terminal}</dd>
            </div>
            <div>
              <dt>Inici</dt>
              <dd>{formatDateTime(session.createdAt)}</dd>
            </div>
            <div>
              <dt>Operacions registrades</dt>
              <dd>{summary.operationCount}</dd>
            </div>
          </dl>
        </header>

        <section className="summary-section" aria-labelledby="economic-title">
          <h3 id="economic-title">Resum econòmic</h3>
          <dl className="economic-summary">
            <div>
              <dt>Caixa inicial</dt>
              <dd>{formatMoney(summary.initialCash)}</dd>
            </div>
            <div>
              <dt>Total vendes</dt>
              <dd>{formatMoney(summary.totalSales)}</dd>
            </div>
            <div>
              <dt>Total efectiu</dt>
              <dd>{formatMoney(summary.totalCash)}</dd>
            </div>
            <div>
              <dt>Total targeta</dt>
              <dd>{formatMoney(summary.totalCard)}</dd>
            </div>
            <div>
              <dt>Total retorns de got</dt>
              <dd>{formatMoney(summary.totalGlassReturns)}</dd>
            </div>
          </dl>
          <div className="current-cash-total">
            <span>CAIXA ACTUAL</span>
            <strong>{formatMoney(summary.currentCash)}</strong>
          </div>
        </section>

        <section className="summary-section" aria-labelledby="products-title">
          <h3 id="products-title">Productes venuts</h3>
          <div className="summary-table-wrapper">
            <table className="session-products-table">
              <thead>
                <tr>
                  <th scope="col">Producte</th>
                  <th scope="col">Quantitat</th>
                  <th scope="col">Import</th>
                </tr>
              </thead>
              <tbody>
                {summary.products.length === 0 ? (
                  <tr>
                    <td colSpan={3}>No hi ha productes venuts</td>
                  </tr>
                ) : (
                  summary.products.map((product) => (
                    <tr key={product.productId}>
                      <td>{product.productName}</td>
                      <td>{product.quantity}</td>
                      <td>{formatMoney(product.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="summary-section" aria-labelledby="glasses-title">
          <h3 id="glasses-title">Resum de gots</h3>
          <dl className="glass-summary">
            <div>
              <dt>Gots afegits</dt>
              <dd>{summary.glassesAdded}</dd>
            </div>
            <div>
              <dt>Gots retornats</dt>
              <dd>{summary.glassesReturned}</dd>
            </div>
            <div>
              <dt>Saldo gots</dt>
              <dd>{summary.glassBalance}</dd>
            </div>
            <div>
              <dt>Import retorns</dt>
              <dd>{formatMoney(summary.totalGlassReturns)}</dd>
            </div>
          </dl>
        </section>

        <div className="session-summary-actions">
          <button type="button" onClick={onClose}>
            Tancar
          </button>
          <button type="button" onClick={onExportSession}>
            Exportar sessió
          </button>
        </div>
      </section>
    </div>
  )
}
