type PaymentModalProps = {
  total: number
  amount: string
  error: string
  onAmountChange: (value: string) => void
  onExactPayment: () => void
  onCalculateChange: () => void
  onCancel: () => void
}

const currencyFormatter = new Intl.NumberFormat('ca-ES', {
  style: 'currency',
  currency: 'EUR',
})

export function PaymentModal({
  total,
  amount,
  error,
  onAmountChange,
  onExactPayment,
  onCalculateChange,
  onCancel,
}: PaymentModalProps) {
  const hasManualAmount = amount.trim() !== ''

  return (
    <div className="modal-backdrop">
      <section
        className="modal payment-modal"
        aria-labelledby="payment-title"
        role="dialog"
        aria-modal="true"
      >
        <h2 id="payment-title">COBRAMENT EN EFECTIU</h2>

        <div className="payment-total">
          <span>Import a cobrar</span>
          <strong>{currencyFormatter.format(total)}</strong>
        </div>

        <form
          className="payment-form"
          onSubmit={(event) => {
            event.preventDefault()
            onCalculateChange()
          }}
        >
          <label htmlFor="cash-amount">Import rebut</label>
          <input
            id="cash-amount"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            value={amount}
            autoFocus
            onChange={(event) => onAmountChange(event.target.value)}
          />

          {error !== '' && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="submit">Calcular retorn</button>
            <button
              type="button"
              disabled={hasManualAmount}
              onClick={onExactPayment}
            >
              Import exacte
            </button>
            <button type="button" onClick={onCancel}>
              Cancel·lar
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
