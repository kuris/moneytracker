'use client'

import { Card } from '@/components/ui/card'
import { formatWon } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react'

export function SummaryCards({
  income,
  expense,
}: {
  income: number
  expense: number
}) {
  const balance = income - expense

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex flex-row items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Wallet className="size-4" />
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            이번 달 잔액
          </span>
        </div>
        <span
          className={cn(
            'text-xl font-bold tabular-nums',
            balance >= 0 ? 'text-income' : 'text-expense',
          )}
        >
          {formatWon(balance)}
        </span>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-1.5 p-4">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ArrowUpRight className="size-3.5 text-income" />
            수입
          </span>
          <span className="text-lg font-bold tabular-nums text-income">
            {formatWon(income)}
          </span>
        </Card>
        <Card className="flex flex-col gap-1.5 p-4">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ArrowDownLeft className="size-3.5 text-expense" />
            지출
          </span>
          <span className="text-lg font-bold tabular-nums text-expense">
            {formatWon(expense)}
          </span>
        </Card>
      </div>
    </div>
  )
}
