import type { Product } from '../models/Product'

export async function getProductes(): Promise<Product[]> {
  const response = await fetch('/config/productes.json')

  if (!response.ok) {
    throw new Error("No s'han pogut carregar els productes")
  }

  return response.json() as Promise<Product[]>
}
