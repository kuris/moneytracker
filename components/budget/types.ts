export type ClientTransaction = {
  id: number
  author: string
  type: string
  category: string
  amount: string
  description: string | null
  date: string
  createdAt: string | Date
}
