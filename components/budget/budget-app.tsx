'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getTransactions } from '@/app/actions/transactions'
import { monthLabel } from '@/lib/format'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { SummaryCards } from './summary-cards'
import { TransactionForm } from './transaction-form'
import { TransactionList } from './transaction-list'
import type { ClientTransaction } from './types'

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function BudgetApp({
  initialData,
}: {
  initialData: ClientTransaction[]
}) {
  const { data, mutate } = useSWR<ClientTransaction[]>(
    'transactions',
    () => getTransactions() as Promise<ClientTransaction[]>,
    { fallbackData: initialData },
  )
  const [month, setMonth] = useState<string>(currentMonth())
  const [showForm, setShowForm] = useState(false)

  const all = data ?? []

  const monthTx = useMemo(
    () => all.filter((t) => t.date.startsWith(month)),
    [all, month],
  )

  const { income, expense } = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of monthTx) {
      if (t.type === 'income') income += Number(t.amount)
      else expense += Number(t.amount)
    }
    return { income, expense }
  }, [monthTx])

  const isCurrentMonth = month === currentMonth()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-28 pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          우리집 가계부
        </h1>
        <p className="text-sm text-muted-foreground">
          남편과 아내가 함께 쓰는 가계부
        </p>
      </header>

      {/* 월 선택 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
          aria-label="이전 달"
          className="size-9"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-base font-semibold text-foreground">
          {monthLabel(`${month}-01`)}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          aria-label="다음 달"
          disabled={isCurrentMonth}
          className="size-9"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <SummaryCards income={income} expense={expense} />

      {showForm && (
        <Card className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              내역 추가
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="닫기"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
          <TransactionForm
            onAdded={() => {
              mutate()
              setShowForm(false)
            }}
          />
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="px-1 text-sm font-semibold text-muted-foreground">
          내역
        </h2>
        <TransactionList transactions={monthTx} onChanged={() => mutate()} />
      </div>

      {/* 추가 플로팅 버튼 */}
      {!showForm && (
        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md px-4 pb-5">
          <Button
            onClick={() => setShowForm(true)}
            className="h-12 w-full text-base shadow-lg"
          >
            <Plus className="size-5" />
            내역 추가하기
          </Button>
        </div>
      )}
    </div>
  )
}
