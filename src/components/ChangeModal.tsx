type ChangeModalProps = {
  changeAmount: number
  onAccept: () => void
}

const currencyFormatter = new Intl.NumberFormat('ca-ES', {
  style: 'currency',
  currency: 'EUR',
})

export function ChangeModal({ changeAmount, onAccept }: ChangeModalProps) {
  return (
    <div className="modal-backdrop">
      <section
        className="modal change-modal"
        aria-labelledby="change-title"
        role="dialog"
        aria-modal="true"
      >
        <h2 id="change-title">RETORNAR</h2>
        <strong>{currencyFormatter.format(changeAmount)}</strong>
        <button type="button" onClick={onAccept}>
          ACCEPTAR
        </button>
      </section>
    </div>
  )
}
