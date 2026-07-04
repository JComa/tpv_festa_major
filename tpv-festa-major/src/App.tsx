import { useEffect, useMemo, useRef, useState } from 'react'
import { TERMINAL_NAME } from './config/config'
import type { Operation } from './models/Operation'
import type { Product } from './models/Product'
import type { PaymentMethod, Sale } from './models/Sale'
import type { SaleLine } from './models/SaleLine'
import type { Session } from './models/Session'
import { TPVPage } from './pages/TPVPage'
import { loadProducts } from './services/configService'
import {
  buildSessionExport,
  downloadSessionExport,
} from './services/exportService'

function formatDatePart(value: number) {
  return value.toString().padStart(2, '0')
}

function formatSessionTimestamp(date: Date) {
  const year = date.getFullYear()
  const month = formatDatePart(date.getMonth() + 1)
  const day = formatDatePart(date.getDate())
  const hours = formatDatePart(date.getHours())
  const minutes = formatDatePart(date.getMinutes())
  const seconds = formatDatePart(date.getSeconds())

  return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

function normalizeSessionName(name: string) {
  return name.trim().toUpperCase().replace(/\s+/g, '_')
}

function formatOperationCounter(counter: number) {
  return counter.toString().padStart(6, '0')
}

function getOperationNumber(counter: number) {
  return `${TERMINAL_NAME}-${formatOperationCounter(counter)}`
}

function updateLineQuantity(line: SaleLine, quantitat: number): SaleLine {
  return {
    ...line,
    quantitat,
    subtotal: line.preu * quantitat,
  }
}

function saleToOperation(sale: Sale): Operation {
  const operationNumberMatch = sale.operationNumber.match(/(\d+)$/)

  return {
    id: sale.operationNumber,
    operationNumber:
      operationNumberMatch === null ? 0 : Number(operationNumberMatch[1]),
    terminal: sale.terminal,
    sessionId: sale.sessionId,
    timestamp: sale.timestamp,
    type: 'SALE',
    paymentMethod: sale.paymentMethod === 'cash' ? 'EFECTIU' : 'TARGETA',
    lines: sale.lines.map((line) => ({
      productId: line.productId,
      productName: line.nom,
      quantity: line.quantitat,
      unitPrice: line.preu,
      total: line.subtotal,
    })),
    total: sale.total,
  }
}

function App() {
  const [productes, setProductes] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [saleItems, setSaleItems] = useState<SaleLine[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [sessionNameInput, setSessionNameInput] = useState('')
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [cashAmount, setCashAmount] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [changeAmount, setChangeAmount] = useState(0)
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const statusTimeoutRef = useRef<number | undefined>(undefined)
  const cardClearTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    let isMounted = true

    loadProducts()
      .then((productesCarregats) => {
        if (isMounted) {
          setProductes(productesCarregats)
          setIsLoadingProducts(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current !== undefined) {
        window.clearTimeout(statusTimeoutRef.current)
      }

      if (cardClearTimeoutRef.current !== undefined) {
        window.clearTimeout(cardClearTimeoutRef.current)
      }
    }
  }, [])

  const totalVenda = useMemo(
    () => saleItems.reduce((total, item) => total + item.subtotal, 0),
    [saleItems],
  )

  const isSaleEmpty = saleItems.length === 0
  const nextOperationCounter = session?.operationCounter ?? 1
  const nextOperationDisplay = formatOperationCounter(nextOperationCounter)

  function showTemporaryMessage(message: string) {
    if (statusTimeoutRef.current !== undefined) {
      window.clearTimeout(statusTimeoutRef.current)
    }

    setStatusMessage(message)
    statusTimeoutRef.current = window.setTimeout(() => {
      setStatusMessage('')
      statusTimeoutRef.current = undefined
    }, 1000)
  }

  function resetPaymentState() {
    setIsPaymentModalOpen(false)
    setCashAmount('')
    setPaymentError('')
    setChangeAmount(0)
    setIsChangeModalOpen(false)
    setIsCardModalOpen(false)
  }

  function registerSale(paymentMethod: PaymentMethod): Sale | null {
    if (session === null || saleItems.length === 0) {
      return null
    }

    const sale: Sale = {
      operationNumber: getOperationNumber(session.operationCounter),
      terminal: TERMINAL_NAME,
      sessionId: session.id,
      timestamp: new Date().toISOString(),
      paymentMethod,
      total: totalVenda,
      lines: saleItems.map((item) => ({ ...item })),
    }

    setSession((currentSession) => {
      if (currentSession === null) {
        return currentSession
      }

      return {
        ...currentSession,
        operationCounter: currentSession.operationCounter + 1,
        sales: [...currentSession.sales, sale],
      }
    })

    return sale
  }

  function finishSale(message: string, paymentMethod: PaymentMethod) {
    const sale = registerSale(paymentMethod)

    if (sale === null) {
      return
    }

    setSaleItems([])
    resetPaymentState()
    showTemporaryMessage(message)
  }

  function finishCardSale() {
    const sale = registerSale('card')

    if (sale === null) {
      return
    }

    resetPaymentState()
    showTemporaryMessage('Pagament acceptat')

    if (cardClearTimeoutRef.current !== undefined) {
      window.clearTimeout(cardClearTimeoutRef.current)
    }

    cardClearTimeoutRef.current = window.setTimeout(() => {
      setSaleItems([])
      cardClearTimeoutRef.current = undefined
    }, 1000)
  }

  function handleStartSession() {
    const normalizedName = normalizeSessionName(sessionNameInput)

    if (normalizedName === '') {
      return
    }

    const now = new Date()
    const newSession: Session = {
      id: `${normalizedName}_${formatSessionTimestamp(now)}`,
      name: normalizedName,
      createdAt: now.toISOString(),
      terminal: TERMINAL_NAME,
      operationCounter: 1,
      sales: [],
    }

    setSession(newSession)
    setSessionNameInput('')
    setSaleItems([])
    resetPaymentState()
  }

  function handleProductClick(producte: Product) {
    if (session === null) {
      return
    }

    setSaleItems((itemsActuals) => {
      const existingItem = itemsActuals.find(
        (item) => item.productId === producte.id,
      )

      if (existingItem === undefined) {
        return [
          ...itemsActuals,
          {
            productId: producte.id,
            nom: producte.nom,
            preu: producte.preu,
            quantitat: 1,
            subtotal: producte.preu,
          },
        ]
      }

      return itemsActuals.map((item) =>
        item.productId === producte.id
          ? updateLineQuantity(item, item.quantitat + 1)
          : item,
      )
    })
  }

  function handleIncrement(productId: string) {
    setSaleItems((itemsActuals) =>
      itemsActuals.map((item) =>
        item.productId === productId
          ? updateLineQuantity(item, item.quantitat + 1)
          : item,
      ),
    )
  }

  function handleDecrement(productId: string) {
    setSaleItems((itemsActuals) =>
      itemsActuals
        .map((item) =>
          item.productId === productId
            ? updateLineQuantity(item, item.quantitat - 1)
            : item,
        )
        .filter((item) => item.quantitat > 0),
    )
  }

  function handleCancel() {
    if (window.confirm('Vols cancel\u00b7lar la venda?')) {
      setSaleItems([])
      resetPaymentState()
    }
  }

  function handleCashPayment() {
    setPaymentError('')
    setCashAmount('')
    setIsPaymentModalOpen(true)
  }

  function handleCardPayment() {
    setIsCardModalOpen(true)
  }

  function handleCashAmountChange(value: string) {
    const normalizedValue = value.replace(',', '.')
    const sanitizedValue = normalizedValue
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1')

    setCashAmount(sanitizedValue)
    setPaymentError('')
  }

  function handleExactCashPayment() {
    finishSale('Venda finalitzada', 'cash')
  }

  function handleCalculateChange() {
    if (cashAmount.trim() === '') {
      setPaymentError('Introdueix un import')
      return
    }

    const amountReceived = Number(cashAmount)

    if (Number.isNaN(amountReceived) || amountReceived < totalVenda) {
      setPaymentError('Import insuficient')
      return
    }

    const calculatedChange = amountReceived - totalVenda

    if (calculatedChange === 0) {
      finishSale('Venda finalitzada', 'cash')
      return
    }

    setChangeAmount(calculatedChange)
    setIsPaymentModalOpen(false)
    setIsChangeModalOpen(true)
  }

  function handleClosePaymentModal() {
    setIsPaymentModalOpen(false)
    setCashAmount('')
    setPaymentError('')
  }

  function handleAcceptChange() {
    finishSale('Venda finalitzada', 'cash')
  }

  function handleConfirmCardPayment() {
    finishCardSale()
  }

  function handleCancelCardPayment() {
    setIsCardModalOpen(false)
  }

  function handleOpenAdmin() {
    setIsAdminModalOpen(true)
  }

  function handleCloseAdmin() {
    setIsAdminModalOpen(false)
  }

  function handleExportSession() {
    if (session === null) {
      showTemporaryMessage('No hi ha cap sessió activa')
      return
    }

    try {
      const operations = session.sales.map(saleToOperation)
      const finalCash = operations
        .filter(
          (operation) =>
            operation.type === 'SALE' &&
            operation.paymentMethod === 'EFECTIU',
        )
        .reduce((total, operation) => total + operation.total, 0)
      const exportData = buildSessionExport({
        session,
        products: productes,
        operations,
        finalCash,
      })

      downloadSessionExport(exportData)
      showTemporaryMessage('Sessió exportada correctament')
    } catch (error: unknown) {
      console.error("Error exportant la sessió:", error)
      showTemporaryMessage("No s'ha pogut exportar la sessió")
    }
  }

  function handleCloseSession() {
    if (window.confirm('Vols tancar la sessió? Les vendes es perdran.')) {
      setSession(null)
      setSaleItems([])
      setSessionNameInput('')
      setIsAdminModalOpen(false)
      resetPaymentState()
    }
  }

  return (
    <TPVPage
      productes={productes}
      isLoadingProducts={isLoadingProducts}
      saleItems={saleItems}
      totalVenda={totalVenda}
      session={session}
      terminal={TERMINAL_NAME}
      nextOperationDisplay={nextOperationDisplay}
      isSaleEmpty={isSaleEmpty}
      isSessionModalOpen={session === null}
      sessionNameInput={sessionNameInput}
      isAdminModalOpen={isAdminModalOpen}
      isPaymentModalOpen={isPaymentModalOpen}
      cashAmount={cashAmount}
      paymentError={paymentError}
      changeAmount={changeAmount}
      isChangeModalOpen={isChangeModalOpen}
      isCardModalOpen={isCardModalOpen}
      statusMessage={statusMessage}
      onSessionNameChange={setSessionNameInput}
      onStartSession={handleStartSession}
      onProductClick={handleProductClick}
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
      onCancel={handleCancel}
      onCashPayment={handleCashPayment}
      onCardPayment={handleCardPayment}
      onAdmin={handleOpenAdmin}
      onExportSession={handleExportSession}
      onCloseSession={handleCloseSession}
      onCloseAdmin={handleCloseAdmin}
      onCashAmountChange={handleCashAmountChange}
      onExactCashPayment={handleExactCashPayment}
      onCalculateChange={handleCalculateChange}
      onClosePaymentModal={handleClosePaymentModal}
      onAcceptChange={handleAcceptChange}
      onConfirmCardPayment={handleConfirmCardPayment}
      onCancelCardPayment={handleCancelCardPayment}
    />
  )
}

export default App
