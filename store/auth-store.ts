import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  uid: string
  _id?: string
  id?: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  username?: string
  role?: string
  // Fact Flow Specific Fields (synced with MongoDB)
  bio?: string
  theme?: string
  favoriteTopics?: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  is2faVerified: boolean
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  set2faVerified: (verified: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      is2faVerified: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      set2faVerified: (verified) => set({ is2faVerified: verified }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false, is2faVerified: false }),
    }),
    {
      name: 'factflow-auth-storage',
    }
  )
)
