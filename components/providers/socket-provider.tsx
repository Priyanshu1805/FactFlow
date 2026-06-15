"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useAuthStore } from "@/store/auth-store"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false })

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Only connect if the user is authenticated (or we could connect globally for public sockets)
    // For now, we connect globally but only register if authenticated.
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL && process.env.NEXT_PUBLIC_SOCKET_URL !== "/"
      ? process.env.NEXT_PUBLIC_SOCKET_URL
      : (process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "")

    const newSocket = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"]
    })

    newSocket.on("connect", () => {
      setIsConnected(true)
      if (isAuthenticated && user) {
        // Strict prioritization of MongoDB ID
        const userId = (user as any)._id || user.id || user.uid
        if (userId) {
          newSocket.emit("register_user", userId)
        }
      }
    })

    newSocket.on("disconnect", () => {
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [isAuthenticated, user?.uid, (user as any)?._id])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
