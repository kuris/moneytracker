export type ClientTransaction = {
  id: number
  author: string
  type: string
  category: string
  amount: string
  description: string | null
  paymentMethod: string
  date: string
  createdAt: string | Date
}
