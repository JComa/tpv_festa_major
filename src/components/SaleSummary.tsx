import type { SaleLine } from '../models/SaleLine'
import { formatMoney } from '../utils/money'

type SaleSummaryProps = {
  items: SaleLine[]
  total: number
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
}

export function SaleSummary({
  items,
  total,
  onIncrement,
  onDecrement,
}: SaleSummaryProps) {
  return (
    <section className="sale-summary" aria-label="Resum de venda">
      <div className="sale-lines-scroll">
        <table>
        <thead>
          <tr>
            <th scope="col">Producte</th>
            <th scope="col">Quantitat</th>
            <th scope="col">Import</th>
            <th scope="col" aria-label="Accions"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId}>
              <td>{item.nom}</td>
              <td>{item.quantitat}</td>
              <td>{formatMoney(item.subtotal)}</td>
              <td>
                <div className="quantity-actions">
                  <button
                    type="button"
                    aria-label={`Incrementar ${item.nom}`}
                    onClick={() => onIncrement(item.productId)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    aria-label={`Disminuir ${item.nom}`}
                    onClick={() => onDecrement(item.productId)}
                  >
                    -
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      <div className="total-summary">
        <span>TOTAL</span>
        <strong>{formatMoney(total)}</strong>
      </div>
    </section>
  )
}
