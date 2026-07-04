import type { Product } from '../models/Product'
import { ProductButton } from './ProductButton'

type ProductGridProps = {
  productes: Product[]
  onProductClick: (producte: Product) => void
}

export function ProductGrid({
  productes,
  onProductClick,
}: ProductGridProps) {
  return (
    <section className="productes-panel" aria-label="Productes">
      {productes.map((producte) => (
        <ProductButton
          key={producte.id}
          producte={producte}
          onClick={onProductClick}
        />
      ))}
    </section>
  )
}
