import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface Transaction {
  id: string
  amount: number
  category: string
  description?: string
  date: Date
}

interface TransactionState {
  transactions: Transaction[]
  isLoading: boolean
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  loadTransactions: () => Promise<void>
  getTransactionsByDate: (date: Date) => Transaction[]
  getTotalByCategory: (date: Date) => Record<string, number>
  getDailyTotal: (date: Date) => number
  getWeeklyTotal: (startDate: Date) => number
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,

  loadTransactions: async () => {
    set({ isLoading: true })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transactions = (data || []).map(t => ({
        id: t.id,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: new Date(t.created_at),
      }))

      set({ transactions })
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  addTransaction: async (transaction) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          created_at: transaction.date.toISOString(),
        }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        const newTransaction = {
          id: data[0].id,
          amount: data[0].amount,
          category: data[0].category,
          description: data[0].description,
          date: new Date(data[0].created_at),
        }
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }))
      }
    } catch (error) {
      console.error('Failed to add transaction:', error)
      throw error
    }
  },

  updateTransaction: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: updates.amount,
          category: updates.category,
          description: updates.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }))
    } catch (error) {
      console.error('Failed to update transaction:', error)
      throw error
    }
  },

  deleteTransaction: async (id) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      throw error
    }
  },

  getTransactionsByDate: (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return get().transactions.filter(
      (t) => t.date.toISOString().split('T')[0] === dateStr
    )
  },

  getTotalByCategory: (date) => {
    const dayTransactions = get().getTransactionsByDate(date)
    return dayTransactions.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>
    )
  },

  getDailyTotal: (date) => {
    return get()
      .getTransactionsByDate(date)
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getWeeklyTotal: (startDate) => {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 7)

    return get().transactions
      .filter((t) => t.date >= startDate && t.date < endDate)
      .reduce((sum, t) => sum + t.amount, 0)
  },
}))
