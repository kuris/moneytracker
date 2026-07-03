import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  name: string
  email: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setIsLoading: (loading: boolean) => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    })
  },

  initializeAuth: async () => {
    set({ isLoading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
          },
          isAuthenticated: true,
        })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      if (user) {
        set({
          user: {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email || '',
          },
          isAuthenticated: true,
        })
      }
    } catch (error) {
      console.error('Login failed:', error)
      set({
        user: null,
        isAuthenticated: false,
      })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  signup: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      if (user) {
        set({
          user: {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email || '',
          },
          isAuthenticated: true,
        })
      }
    } catch (error) {
      console.error('Signup failed:', error)
      set({
        user: null,
        isAuthenticated: false,
      })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await supabase.auth.signOut()
      set({
        user: null,
        isAuthenticated: false,
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  setIsLoading: (loading) => {
    set({ isLoading: loading })
  },
}))
