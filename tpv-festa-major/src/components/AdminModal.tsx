type AdminModalProps = {
  onViewSessionSummary: () => void
  onExportSession: () => void
  onCloseSession: () => void
  onCancel: () => void
}

export function AdminModal({
  onViewSessionSummary,
  onExportSession,
  onCloseSession,
  onCancel,
}: AdminModalProps) {
  return (
    <div className="modal-backdrop">
      <section
        className="modal admin-modal"
        aria-labelledby="admin-title"
        role="dialog"
        aria-modal="true"
      >
        <h2 id="admin-title">Administració</h2>
        <div className="modal-actions">
          <button type="button" onClick={onViewSessionSummary}>
            Veure resum sessió
          </button>
          <button type="button" onClick={onExportSession}>
            Exportar sessió
          </button>
          <button type="button" onClick={onCloseSession}>
            Tancar sessió
          </button>
          <button type="button" onClick={onCancel}>
            Cancel·lar
          </button>
        </div>
      </section>
    </div>
  )
}
