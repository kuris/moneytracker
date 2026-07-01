import {
  Bus,
  Clapperboard,
  Coins,
  Gift,
  HeartPulse,
  House,
  PiggyBank,
  ShoppingCart,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type TxType = 'income' | 'expense'

export type CategoryDef = {
  value: string
  label: string
  icon: LucideIcon
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { value: 'food', label: '식비', icon: UtensilsCrossed },
  { value: 'transport', label: '교통/차량', icon: Bus },
  { value: 'living', label: '생활/마트', icon: ShoppingCart },
  { value: 'housing', label: '주거/공과금', icon: House },
  { value: 'culture', label: '문화/여가', icon: Clapperboard },
  { value: 'medical', label: '의료/건강', icon: HeartPulse },
  { value: 'etc_expense', label: '기타', icon: Wallet },
]

export const INCOME_CATEGORIES: CategoryDef[] = [
  { value: 'salary', label: '급여', icon: Wallet },
  { value: 'bonus', label: '상여/보너스', icon: Gift },
  { value: 'investment', label: '투자수익', icon: PiggyBank },
  { value: 'etc_income', label: '기타수입', icon: Coins },
]

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

export function getCategory(value: string): CategoryDef | undefined {
  return ALL_CATEGORIES.find((c) => c.value === value)
}

export function categoriesFor(type: TxType): CategoryDef[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export const AUTHORS = ['남편', '아내'] as const
export type Author = (typeof AUTHORS)[number]
