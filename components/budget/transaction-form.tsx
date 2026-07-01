'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { AUTHORS, categoriesFor, type TxType } from '@/lib/categories'
import { todayISO } from '@/lib/format'
import { addTransaction } from '@/app/actions/transactions'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

export function TransactionForm({ onAdded }: { onAdded: () => void }) {
  const [author, setAuthor] = useState<string>(AUTHORS[0])
  const [type, setType] = useState<TxType>('expense')
  const [category, setCategory] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [date, setDate] = useState<string>(todayISO())
  const [submitting, setSubmitting] = useState(false)

  const categories = categoriesFor(type)

  function changeType(next: TxType) {
    setType(next)
    setCategory('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numericAmount = Number(amount.replace(/,/g, ''))
    if (!category) {
      toast.error('분류를 선택해 주세요.')
      return
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('금액을 올바르게 입력해 주세요.')
      return
    }
    setSubmitting(true)
    try {
      await addTransaction({
        author,
        type,
        category,
        amount: numericAmount,
        description,
        date,
      })
      toast.success('저장되었습니다.')
      setAmount('')
      setDescription('')
      setCategory('')
      onAdded()
    } catch (err) {
      toast.error('저장에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* 작성자 */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm text-muted-foreground">작성자</Label>
        <div className="grid grid-cols-2 gap-2">
          {AUTHORS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAuthor(a)}
              className={cn(
                'rounded-lg border py-2.5 text-sm font-medium transition-colors',
                author === a
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted',
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* 수입/지출 */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm text-muted-foreground">구분</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => changeType('expense')}
            className={cn(
              'rounded-lg border py-2.5 text-sm font-medium transition-colors',
              type === 'expense'
                ? 'border-expense bg-expense text-expense-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            지출
          </button>
          <button
            type="button"
            onClick={() => changeType('income')}
            className={cn(
              'rounded-lg border py-2.5 text-sm font-medium transition-colors',
              type === 'income'
                ? 'border-income bg-income text-income-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            수입
          </button>
        </div>
      </div>

      {/* 날짜 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="date" className="text-sm text-muted-foreground">
          날짜
        </Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11"
        />
      </div>

      {/* 분류 */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm text-muted-foreground">분류</Label>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v ?? '')}
        >
          <SelectTrigger className="h-11 w-full">
            <SelectValue placeholder="분류를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => {
              const Icon = c.icon
              return (
                <SelectItem key={c.value} value={c.value}>
                  <Icon className="size-4 text-muted-foreground" />
                  {c.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* 금액 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="amount" className="text-sm text-muted-foreground">
          금액
        </Label>
        <div className="relative">
          <Input
            id="amount"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, '')
              setAmount(raw ? Number(raw).toLocaleString('ko-KR') : '')
            }}
            className="h-11 pr-8 text-right text-base font-semibold tabular-nums"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            원
          </span>
        </div>
      </div>

      {/* 사용처/내용 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="description" className="text-sm text-muted-foreground">
          사용처 / 내용
        </Label>
        <Input
          id="description"
          placeholder="예: 마트 장보기"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-11"
        />
      </div>

      <Button type="submit" disabled={submitting} className="h-11 w-full">
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        저장하기
      </Button>
    </form>
  )
}
