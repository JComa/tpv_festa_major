type ActionButtonsProps = {
  disabled: boolean
  returnGlassDisabled: boolean
  onCancel: () => void
  onCashPayment: () => void
  onCardPayment: () => void
  onReturnGlass: () => void
  onAdmin: () => void
}

export function ActionButtons({
  disabled,
  returnGlassDisabled,
  onCancel,
  onCashPayment,
  onCardPayment,
  onReturnGlass,
  onAdmin,
}: ActionButtonsProps) {
  return (
    <aside className="action-buttons" aria-label="Accions de venda">
      <button
        className="action-button cancel"
        type="button"
        disabled={disabled}
        onClick={onCancel}
      >
        Cancel·lar
      </button>
      <button
        className="action-button cash"
        type="button"
        disabled={disabled}
        onClick={onCashPayment}
      >
        Efectiu
      </button>
      <button
        className="action-button card"
        type="button"
        disabled={disabled}
        onClick={onCardPayment}
      >
        Targeta
      </button>
      <button
        className="action-button glass-return"
        type="button"
        disabled={returnGlassDisabled}
        onClick={onReturnGlass}
      >
        RETORNAR GOT
      </button>
      <button
        className="action-button admin"
        type="button"
        onClick={onAdmin}
      >
        Administració
      </button>
    </aside>
  )
}
