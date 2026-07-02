import {
  date,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  author: text('author').notNull(),
  type: text('type').notNull(), // 'income' | 'expense'
  category: text('category').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  paymentMethod: text('payment_method').notNull().default('card'), // 'card' | 'cash'
  date: date('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Transaction = typeof transactions.$inferSelect
