import type { Producte } from '../models/Producte'

export async function getProductes(): Promise<Producte[]> {
  const response = await fetch('/config/productes.json')

  if (!response.ok) {
    throw new Error('No s\'han pogut carregar els productes')
  }

  return response.json() as Promise<Producte[]>
}
