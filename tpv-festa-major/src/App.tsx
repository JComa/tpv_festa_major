import { useEffect, useMemo, useRef, useState } from 'react'
import { TERMINAL_NAME } from './config/config'
import type {
  Operation,
  OperationPaymentMethod,
} from './models/Operation'
import type { Product } from './models/Product'
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

function getOperationId(counter: number, date: Date) {
  const dateId = formatSessionTimestamp(date).slice(0, 8)
  const terminalId = TERMINAL_NAME.replace(/[^a-zA-Z0-9]/g, '')

  return `${dateId}-${terminalId}-${formatOperationCounter(counter)}`
}

function updateLineQuantity(line: SaleLine, quantitat: number): SaleLine {
  return {
    ...line,
    quantitat,
    subtotal: line.preu * quantitat,
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
  const [isReturnGlassModalOpen, setIsReturnGlassModalOpen] = useState(false)
  const [returnGlassQuantity, setReturnGlassQuantity] = useState(1)
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

  const currentCash = useMemo(
    () =>
      session?.operations.reduce((total, operation) => {
        if (
          operation.type === 'GLASS_RETURN' ||
          operation.paymentMethod === 'EFECTIU'
        ) {
          return total + operation.total
        }

        return total
      }, 0) ?? 0,
    [session],
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

  function registerSale(
    paymentMethod: OperationPaymentMethod,
  ): Operation | null {
    if (session === null || saleItems.length === 0) {
      return null
    }

    const now = new Date()
    const operation: Operation = {
      id: getOperationId(session.operationCounter, now),
      operationNumber: session.operationCounter,
      terminal: TERMINAL_NAME,
      sessionId: session.id,
      timestamp: now.toISOString(),
      type: 'SALE',
      paymentMethod,
      total: totalVenda,
      lines: saleItems.map((item) => ({
        productId: item.productId,
        productName: item.nom,
        quantity: item.quantitat,
        unitPrice: item.preu,
        total: item.subtotal,
      })),
    }

    setSession((currentSession) => {
      if (currentSession === null) {
        return currentSession
      }

      return {
        ...currentSession,
        operationCounter: currentSession.operationCounter + 1,
        operations: [...currentSession.operations, operation],
      }
    })

    return operation
  }

  function finishSale(
    message: string,
    paymentMethod: OperationPaymentMethod,
  ) {
    const operation = registerSale(paymentMethod)

    if (operation === null) {
      return
    }

    setSaleItems([])
    resetPaymentState()
    showTemporaryMessage(message)
  }

  function finishCardSale() {
    const operation = registerSale('TARGETA')

    if (operation === null) {
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
      operations: [],
    }

    setSession(newSession)
    setSessionNameInput('')
    setSaleItems([])
    setIsReturnGlassModalOpen(false)
    setReturnGlassQuantity(1)
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
    finishSale('Venda finalitzada', 'EFECTIU')
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
      finishSale('Venda finalitzada', 'EFECTIU')
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
    finishSale('Venda finalitzada', 'EFECTIU')
  }

  function handleConfirmCardPayment() {
    finishCardSale()
  }

  function handleCancelCardPayment() {
    setIsCardModalOpen(false)
  }

  function handleOpenReturnGlass() {
    if (session === null) {
      showTemporaryMessage('No hi ha cap sessió activa')
      return
    }

    setReturnGlassQuantity(1)
    setIsReturnGlassModalOpen(true)
  }

  function handleIncrementReturnGlass() {
    setReturnGlassQuantity((quantity) => quantity + 1)
  }

  function handleDecrementReturnGlass() {
    setReturnGlassQuantity((quantity) => Math.max(1, quantity - 1))
  }

  function handleCancelReturnGlass() {
    setIsReturnGlassModalOpen(false)
    setReturnGlassQuantity(1)
  }

  function handleConfirmReturnGlass() {
    if (session === null || returnGlassQuantity < 1) {
      showTemporaryMessage('No es pot registrar el retorn de gots')
      return
    }

    const now = new Date()
    const total = -returnGlassQuantity
    const operation: Operation = {
      id: getOperationId(session.operationCounter, now),
      operationNumber: session.operationCounter,
      terminal: TERMINAL_NAME,
      sessionId: session.id,
      timestamp: now.toISOString(),
      type: 'GLASS_RETURN',
      lines: [
        {
          productId: 'got',
          productName: 'GOT RETORNAT',
          quantity: returnGlassQuantity,
          unitPrice: -1,
          total,
        },
      ],
      total,
    }

    setSession((currentSession) => {
      if (currentSession === null) {
        return currentSession
      }

      return {
        ...currentSession,
        operationCounter: currentSession.operationCounter + 1,
        operations: [...currentSession.operations, operation],
      }
    })
    setIsReturnGlassModalOpen(false)
    setReturnGlassQuantity(1)
    showTemporaryMessage('Retorn de gots registrat')
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
      const exportData = buildSessionExport({
        session,
        products: productes,
        operations: session.operations,
        finalCash: currentCash,
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
      setIsReturnGlassModalOpen(false)
      setReturnGlassQuantity(1)
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
      isReturnGlassModalOpen={isReturnGlassModalOpen}
      returnGlassQuantity={returnGlassQuantity}
      statusMessage={statusMessage}
      onSessionNameChange={setSessionNameInput}
      onStartSession={handleStartSession}
      onProductClick={handleProductClick}
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
      onCancel={handleCancel}
      onCashPayment={handleCashPayment}
      onCardPayment={handleCardPayment}
      onReturnGlass={handleOpenReturnGlass}
      onIncrementReturnGlass={handleIncrementReturnGlass}
      onDecrementReturnGlass={handleDecrementReturnGlass}
      onConfirmReturnGlass={handleConfirmReturnGlass}
      onCancelReturnGlass={handleCancelReturnGlass}
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
