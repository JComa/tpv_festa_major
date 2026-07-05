export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error: unknown) => {
      console.error("No s'ha pogut activar el mode sense connexió:", error)
    })
  })
}
