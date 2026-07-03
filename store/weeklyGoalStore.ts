import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface WeeklyGoal {
  id: string
  weekStartDate: Date
  budget: number
}

interface WeeklyGoalState {
  goal: WeeklyGoal | null
  isLoading: boolean
  setGoal: (budget: number) => Promise<void>
  loadCurrentWeekGoal: () => Promise<void>
  getCurrentWeekGoal: () => WeeklyGoal | null
  getWeekStartDate: (date: Date) => Date
}

export const useWeeklyGoalStore = create<WeeklyGoalState>((set, get) => ({
  goal: null,
  isLoading: false,

  getWeekStartDate: (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  },

  loadCurrentWeekGoal: async () => {
    set({ isLoading: true })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const weekStart = get().getWeekStartDate(new Date())
      const weekStartStr = weekStart.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        set({
          goal: {
            id: data.id,
            weekStartDate: new Date(data.week_start_date),
            budget: data.budget,
          },
        })
      }
    } catch (error) {
      console.error('Failed to load weekly goal:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  setGoal: async (budget) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const weekStart = get().getWeekStartDate(new Date())
      const weekStartStr = weekStart.toISOString().split('T')[0]

      const { data: existingGoal } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr)
        .single()

      let result
      if (existingGoal) {
        result = await supabase
          .from('goals')
          .update({ budget })
          .eq('id', existingGoal.id)
          .select()
      } else {
        result = await supabase
          .from('goals')
          .insert([{
            user_id: user.id,
            budget,
            week_start_date: weekStartStr,
          }])
          .select()
      }

      if (result.error) throw result.error

      if (result.data && result.data[0]) {
        set({
          goal: {
            id: result.data[0].id,
            weekStartDate: new Date(result.data[0].week_start_date),
            budget: result.data[0].budget,
          },
        })
      }
    } catch (error) {
      console.error('Failed to set weekly goal:', error)
      throw error
    }
  },

  getCurrentWeekGoal: () => {
    const goal = get().goal
    if (!goal) return null

    const now = new Date()
    const currentWeekStart = get().getWeekStartDate(now)
    const goalWeekStart = goal.weekStartDate

    if (goalWeekStart.getTime() === currentWeekStart.getTime()) {
      return goal
    }
    return null
  },
}))
