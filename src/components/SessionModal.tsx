type SessionModalProps = {
  sessionName: string
  onSessionNameChange: (value: string) => void
  onStartSession: () => void
}

export function SessionModal({
  sessionName,
  onSessionNameChange,
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
          <button type="submit" disabled={sessionName.trim() === ''}>
            Iniciar
          </button>
        </form>
      </section>
    </div>
  )
}
