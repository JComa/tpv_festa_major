import type { Product } from '../models/Product'

type ProductButtonProps = {
  producte: Product
  onClick: (producte: Product) => void
}

export function ProductButton({ producte, onClick }: ProductButtonProps) {
  return (
    <button
      className="product-button"
      type="button"
      onClick={() => onClick(producte)}
    >
      <span className="product-name">{producte.nom}</span>
      <span className="product-price">
        {producte.preu.toLocaleString('ca-ES')} €
      </span>
    </button>
  )
}
