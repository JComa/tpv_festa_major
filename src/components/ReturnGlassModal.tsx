type ReturnGlassModalProps = {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  onConfirm: () => void
  onCancel: () => void
}

const currencyFormatter = new Intl.NumberFormat('ca-ES', {
  style: 'currency',
  currency: 'EUR',
})

export function ReturnGlassModal({
  quantity,
  onIncrement,
  onDecrement,
  onConfirm,
  onCancel,
}: ReturnGlassModalProps) {
  return (
    <div className="modal-backdrop">
      <section
        className="modal return-glass-modal"
        aria-labelledby="return-glass-title"
        role="dialog"
        aria-modal="true"
      >
        <h2 id="return-glass-title">RETORNAR GOTS</h2>

        <div className="return-glass-quantity">
          <span>Quantitat</span>
          <div className="quantity-selector">
            <button
              type="button"
              aria-label="Disminuir quantitat"
              disabled={quantity <= 1}
              onClick={onDecrement}
            >
              -
            </button>
            <strong aria-live="polite">{quantity}</strong>
            <button
              type="button"
              aria-label="Augmentar quantitat"
              onClick={onIncrement}
            >
              +
            </button>
          </div>
        </div>

        <div className="return-glass-total">
          <span>Import a retornar</span>
          <strong>{currencyFormatter.format(quantity)}</strong>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onConfirm}>
            CONFIRMAR
          </button>
          <button type="button" onClick={onCancel}>
            CANCEL·LAR
          </button>
        </div>
      </section>
    </div>
  )
}
