'use server'

import { db } from '@/lib/db'
import { transactions } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getTransactions() {
  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
}

export type NewTransaction = {
  author: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description?: string
  paymentMethod: string
  time?: string | null
  date: string // YYYY-MM-DD
}

export async function addTransaction(input: NewTransaction) {
  if (!input.author || !input.category || !input.date) {
    throw new Error('필수 항목이 누락되었습니다.')
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('금액을 올바르게 입력해 주세요.')
  }

  await db.insert(transactions).values({
    author: input.author,
    type: input.type,
    category: input.category,
    amount: input.amount.toFixed(2),
    description: input.description?.trim() || null,
    paymentMethod: input.paymentMethod || 'card',
    time: input.time || null,
    date: input.date,
  })

  revalidatePath('/')
}

export async function deleteTransaction(id: number) {
  await db.delete(transactions).where(eq(transactions.id, id))
  revalidatePath('/')
}
