'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { getCategory } from '@/lib/categories'
import { formatDateLabel, formatWon } from '@/lib/format'
import { cn } from '@/lib/utils'
import { deleteTransaction } from '@/app/actions/transactions'
import { Loader2, Trash2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import type { ClientTransaction } from './types'

export function TransactionList({
  transactions,
  onChanged,
}: {
  transactions: ClientTransaction[]
  onChanged: () => void
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  if (transactions.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Wallet className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">
          아직 기록된 내역이 없어요.
          <br />첫 거래를 추가해 보세요.
        </p>
      </Card>
    )
  }

  // 날짜별 그룹화
  const groups = new Map<string, ClientTransaction[]>()
  for (const tx of transactions) {
    const list = groups.get(tx.date) ?? []
    list.push(tx)
    groups.set(tx.date, list)
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deleteTransaction(id)
      toast.success('삭제되었습니다.')
      onChanged()
    } catch {
      toast.error('삭제에 실패했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {Array.from(groups.entries()).map(([date, items]) => {
        const dayTotal = items.reduce(
          (sum, t) =>
            sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
          0,
        )
        return (
          <div key={date} className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-foreground">
                {formatDateLabel(date)}
              </span>
              <span
                className={cn(
                  'text-xs font-medium tabular-nums',
                  dayTotal >= 0 ? 'text-income' : 'text-expense',
                )}
              >
                {dayTotal >= 0 ? '+' : ''}
                {formatWon(dayTotal)}
              </span>
            </div>
            <Card className="divide-y divide-border p-0">
              {items.map((tx) => {
                const cat = getCategory(tx.category)
                const Icon = cat?.icon ?? Wallet
                const isIncome = tx.type === 'income'
                return (
                  <div
                    key={tx.id}
                    className="group flex items-center gap-3 px-4 py-3"
                  >
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full',
                        isIncome
                          ? 'bg-income/12 text-income'
                          : 'bg-expense/12 text-expense',
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {tx.description || cat?.label || '거래'}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{cat?.label}</span>
                        <span aria-hidden>·</span>
                        <span>{tx.author}</span>
                        <span aria-hidden>·</span>
                        <span className={cn(
                          "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                          tx.paymentMethod === 'cash' 
                            ? "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400" 
                            : "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400"
                        )}>
                          {tx.paymentMethod === 'cash' ? '현금' : '카드'}
                        </span>
                      </span>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 text-sm font-semibold tabular-nums',
                        isIncome ? 'text-income' : 'text-foreground',
                      )}
                    >
                      {isIncome ? '+' : '-'}
                      {formatWon(Number(tx.amount))}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(tx.id)}
                      disabled={deletingId === tx.id}
                      aria-label="삭제"
                      className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      {deletingId === tx.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                )
              })}
            </Card>
          </div>
        )
      })}
    </div>
  )
}
