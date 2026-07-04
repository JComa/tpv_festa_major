import { useEffect, useState } from 'react'
import type { Producte } from '../models/Producte'
import { getProductes } from '../services/ConfigService'

export function TPVPage() {
  const [productes, setProductes] = useState<Producte[]>([])

  useEffect(() => {
    let isMounted = true

    getProductes().then((productesCarregats) => {
      if (isMounted) {
        setProductes(productesCarregats)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="app">
      <section className="tpv-page">
        <h1>TPV FESTA MAJOR</h1>
        <ul className="productes-list">
          {productes.map((producte) => (
            <li className="producte-item" key={producte.id}>
              <span>{producte.nom}</span>
              <span className="producte-preu">{producte.preu} €</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
