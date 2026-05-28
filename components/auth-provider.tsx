"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  _id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load from local storage
    const storedToken = localStorage.getItem("ff_token")
    if (storedToken) {
      setToken(storedToken)
      fetchMe(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchMe = async (currentToken: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      })
      const data = await res.json()
      if (data.success && data.data) {
        setUser(data.data)
      } else {
        logout()
      }
    } catch (err) {
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = (newToken: string, userData: User) => {
    setToken(newToken)
    setUser(userData)
    localStorage.setItem("ff_token", newToken)
    router.push("/")
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("ff_token")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
