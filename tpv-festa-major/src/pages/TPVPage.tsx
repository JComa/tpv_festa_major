import { ActionButtons } from '../components/ActionButtons'
import { AdminModal } from '../components/AdminModal'
import { ChangeModal } from '../components/ChangeModal'
import { PaymentModal } from '../components/PaymentModal'
import { ProductGrid } from '../components/ProductGrid'
import { ReturnGlassModal } from '../components/ReturnGlassModal'
import { SaleSummary } from '../components/SaleSummary'
import { SessionModal } from '../components/SessionModal'
import type { Product } from '../models/Product'
import type { SaleLine } from '../models/SaleLine'
import type { Session } from '../models/Session'

type TPVPageProps = {
  productes: Product[]
  isLoadingProducts: boolean
  saleItems: SaleLine[]
  totalVenda: number
  session: Session | null
  terminal: string
  nextOperationDisplay: string
  isSaleEmpty: boolean
  isSessionModalOpen: boolean
  sessionNameInput: string
  isAdminModalOpen: boolean
  isPaymentModalOpen: boolean
  cashAmount: string
  paymentError: string
  changeAmount: number
  isChangeModalOpen: boolean
  isCardModalOpen: boolean
  isReturnGlassModalOpen: boolean
  returnGlassQuantity: number
  statusMessage: string
  onSessionNameChange: (value: string) => void
  onStartSession: () => void
  onProductClick: (producte: Product) => void
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
  onCancel: () => void
  onCashPayment: () => void
  onCardPayment: () => void
  onReturnGlass: () => void
  onIncrementReturnGlass: () => void
  onDecrementReturnGlass: () => void
  onConfirmReturnGlass: () => void
  onCancelReturnGlass: () => void
  onAdmin: () => void
  onExportSession: () => void
  onCloseSession: () => void
  onCloseAdmin: () => void
  onCashAmountChange: (value: string) => void
  onExactCashPayment: () => void
  onCalculateChange: () => void
  onClosePaymentModal: () => void
  onAcceptChange: () => void
  onConfirmCardPayment: () => void
  onCancelCardPayment: () => void
}

export function TPVPage({
  productes,
  isLoadingProducts,
  saleItems,
  totalVenda,
  session,
  terminal,
  nextOperationDisplay,
  isSaleEmpty,
  isSessionModalOpen,
  sessionNameInput,
  isAdminModalOpen,
  isPaymentModalOpen,
  cashAmount,
  paymentError,
  changeAmount,
  isChangeModalOpen,
  isCardModalOpen,
  isReturnGlassModalOpen,
  returnGlassQuantity,
  statusMessage,
  onSessionNameChange,
  onStartSession,
  onProductClick,
  onIncrement,
  onDecrement,
  onCancel,
  onCashPayment,
  onCardPayment,
  onReturnGlass,
  onIncrementReturnGlass,
  onDecrementReturnGlass,
  onConfirmReturnGlass,
  onCancelReturnGlass,
  onAdmin,
  onExportSession,
  onCloseSession,
  onCloseAdmin,
  onCashAmountChange,
  onExactCashPayment,
  onCalculateChange,
  onClosePaymentModal,
  onAcceptChange,
  onConfirmCardPayment,
  onCancelCardPayment,
}: TPVPageProps) {
  return (
    <main className="app">
      <section className="tpv-page">
        <header className="tpv-header">
          <h1>TPV FESTA MAJOR</h1>
          <dl className="session-summary" aria-label="Sessió actual">
            <div>
              <dt>Sessió</dt>
              <dd>{session?.name ?? '-'}</dd>
            </div>
            <div>
              <dt>Terminal</dt>
              <dd>{terminal}</dd>
            </div>
            <div>
              <dt>Operació</dt>
              <dd>{nextOperationDisplay}</dd>
            </div>
          </dl>
        </header>

        {isLoadingProducts ? (
          <p className="products-state" role="status">
            Carregant productes...
          </p>
        ) : productes.length === 0 ? (
          <p className="products-state">No hi ha productes configurats</p>
        ) : (
          <ProductGrid
            productes={productes}
            onProductClick={onProductClick}
          />
        )}

        <SaleSummary
          items={saleItems}
          total={totalVenda}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />

        <ActionButtons
          disabled={isSaleEmpty}
          returnGlassDisabled={session === null}
          onCancel={onCancel}
          onCashPayment={onCashPayment}
          onCardPayment={onCardPayment}
          onReturnGlass={onReturnGlass}
          onAdmin={onAdmin}
        />
      </section>

      {statusMessage !== '' && (
        <div className="status-message" role="status">
          {statusMessage}
        </div>
      )}

      {isSessionModalOpen && (
        <SessionModal
          sessionName={sessionNameInput}
          onSessionNameChange={onSessionNameChange}
          onStartSession={onStartSession}
        />
      )}

      {isAdminModalOpen && (
        <AdminModal
          onExportSession={onExportSession}
          onCloseSession={onCloseSession}
          onCancel={onCloseAdmin}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          total={totalVenda}
          amount={cashAmount}
          error={paymentError}
          onAmountChange={onCashAmountChange}
          onExactPayment={onExactCashPayment}
          onCalculateChange={onCalculateChange}
          onCancel={onClosePaymentModal}
        />
      )}

      {isChangeModalOpen && (
        <ChangeModal changeAmount={changeAmount} onAccept={onAcceptChange} />
      )}

      {isReturnGlassModalOpen && (
        <ReturnGlassModal
          quantity={returnGlassQuantity}
          onIncrement={onIncrementReturnGlass}
          onDecrement={onDecrementReturnGlass}
          onConfirm={onConfirmReturnGlass}
          onCancel={onCancelReturnGlass}
        />
      )}

      {isCardModalOpen && (
        <div className="modal-backdrop">
          <section
            className="modal card-modal"
            aria-labelledby="card-payment-title"
            role="dialog"
            aria-modal="true"
          >
            <h2 id="card-payment-title">Confirmar pagament?</h2>
            <div className="modal-actions">
              <button type="button" onClick={onConfirmCardPayment}>
                Confirmar
              </button>
              <button type="button" onClick={onCancelCardPayment}>
                Cancel·lar
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
