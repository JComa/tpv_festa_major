export type OperationType = 'SALE' | 'GLASS_RETURN'

export type OperationPaymentMethod = 'EFECTIU' | 'TARGETA'

export type OperationLine = {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export type Operation = {
  id: string
  operationNumber: number
  terminal: string
  sessionId: string
  timestamp: string
  type: OperationType
  paymentMethod?: OperationPaymentMethod
  lines: OperationLine[]
  total: number
}
