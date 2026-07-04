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
        className="cancel-button"
        type="button"
        disabled={disabled}
        onClick={onCancel}
      >
        Cancel·lar
      </button>
      <button type="button" disabled={disabled} onClick={onCashPayment}>
        Efectiu
      </button>
      <button type="button" disabled={disabled} onClick={onCardPayment}>
        Targeta
      </button>
      <button
        className="return-glass-button"
        type="button"
        disabled={returnGlassDisabled}
        onClick={onReturnGlass}
      >
        RETORNAR GOT
      </button>
      <button type="button" onClick={onAdmin}>
        Administració
      </button>
    </aside>
  )
}
