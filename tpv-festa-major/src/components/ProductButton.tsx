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
      <span>{producte.nom}</span>
      <span>{producte.preu.toLocaleString('ca-ES')} €</span>
    </button>
  )
}
