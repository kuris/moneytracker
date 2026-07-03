'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTransactionStore } from '@/store/transactionStore'
import { useWeeklyGoalStore } from '@/store/weeklyGoalStore'

export function RootClient({ children }: { children: React.ReactNode }) {
  const { initializeAuth, isAuthenticated } = useAuthStore()
  const { loadTransactions } = useTransactionStore()
  const { loadCurrentWeekGoal } = useWeeklyGoalStore()

  useEffect(() => {
    const init = async () => {
      await initializeAuth()
    }
    init()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions()
      loadCurrentWeekGoal()
    }
  }, [isAuthenticated, loadTransactions, loadCurrentWeekGoal])

  return <>{children}</>
}
