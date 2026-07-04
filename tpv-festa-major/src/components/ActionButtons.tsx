type ActionButtonsProps = {
  disabled: boolean
  onCancel: () => void
  onCashPayment: () => void
  onCardPayment: () => void
  onAdmin: () => void
}

export function ActionButtons({
  disabled,
  onCancel,
  onCashPayment,
  onCardPayment,
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
      <button type="button" onClick={onAdmin}>
        Administració
      </button>
    </aside>
  )
}
