type SessionModalProps = {
  sessionName: string
  initialCash: string
  onSessionNameChange: (value: string) => void
  onInitialCashChange: (value: string) => void
  onStartSession: () => void
}

export function SessionModal({
  sessionName,
  initialCash,
  onSessionNameChange,
  onInitialCashChange,
  onStartSession,
}: SessionModalProps) {
  return (
    <div className="modal-backdrop">
      <section
        className="modal session-modal"
        aria-labelledby="session-title"
        role="dialog"
        aria-modal="true"
      >
        <h2 id="session-title">Nom de la sessió</h2>

        <form
          className="session-form"
          onSubmit={(event) => {
            event.preventDefault()
            onStartSession()
          }}
        >
          <label htmlFor="session-name">Nom</label>
          <input
            id="session-name"
            type="text"
            value={sessionName}
            autoFocus
            onChange={(event) => onSessionNameChange(event.target.value)}
          />
          <label htmlFor="initial-cash">Efectiu inicial en caixa (€)</label>
          <input
            id="initial-cash"
            type="text"
            inputMode="decimal"
            value={initialCash}
            placeholder="0,00"
            onChange={(event) => onInitialCashChange(event.target.value)}
          />
          <button
            type="submit"
            disabled={
              sessionName.trim() === '' ||
              initialCash.trim() === '' ||
              !Number.isFinite(Number(initialCash)) ||
              Number(initialCash) < 0
            }
          >
            Iniciar
          </button>
        </form>
      </section>
    </div>
  )
}
