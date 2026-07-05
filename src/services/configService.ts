import type { Product } from '../models/Product'

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const product = value as Record<string, unknown>

  return (
    typeof product.id === 'string' &&
    product.id.trim() !== '' &&
    typeof product.nom === 'string' &&
    product.nom.trim() !== '' &&
    typeof product.preu === 'number' &&
    Number.isFinite(product.preu) &&
    product.preu >= 0 &&
    typeof product.actiu === 'boolean'
  )
}

export async function loadProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}config/productes.json`)

    if (!response.ok) {
      throw new Error(
        `No s'han pogut carregar els productes (${response.status})`,
      )
    }

    const data: unknown = await response.json()

    if (!Array.isArray(data)) {
      throw new Error('La configuració de productes no és una llista')
    }

    return data.filter(isProduct).filter((product) => product.actiu)
  } catch (error: unknown) {
    console.error('Error carregant la configuració de productes:', error)
    return []
  }
}
