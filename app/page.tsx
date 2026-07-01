import { getTransactions } from '@/app/actions/transactions'
import { BudgetApp } from '@/components/budget/budget-app'
import type { ClientTransaction } from '@/components/budget/types'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const transactions = (await getTransactions()) as ClientTransaction[]
  return (
    <main className="min-h-dvh bg-background">
      <BudgetApp initialData={transactions} />
    </main>
  )
}
