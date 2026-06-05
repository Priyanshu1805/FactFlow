"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, X, Loader2, Send, Image as ImageIcon, Film, 
  MessageSquare, User as UserIcon, Check, CheckCheck, 
  ArrowLeft, Plus, ShieldAlert, Info, Phone, Video
} from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { useTheme } from "@/components/theme-provider"
import { Navbar } from "@/components/frontend/navbar"
import { useSocket } from "@/hooks/use-socket"
import { toast } from "sonner"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL && process.env.NEXT_PUBLIC_SOCKET_URL !== "/"
  ? process.env.NEXT_PUBLIC_SOCKET_URL
  : "http://localhost:5000"

export default function DirectInboxPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { theme } = useTheme()
  const isDark = theme !== "light"

  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const { socket } = useSocket()
  
  // Modals & UI States
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [chatsLoading, setChatsLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [peerTyping, setPeerTyping] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<"inbox" | "chat">("inbox")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<any>(null)

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, peerTyping])

  // Connect socket.io
  useEffect(() => {
    if (!user || !socket) return

    const handleChatListUpdate = (data: any) => {
      setChats(prev => {
        const updated = prev.map(c => {
          if (c._id === data.chatId) {
            return { ...c, latestMessage: data.latestMessage }
          }
          return c
        })
        return updated.sort((a, b) => {
          const aTime = a.latestMessage ? new Date(a.latestMessage.createdAt).getTime() : new Date(a.updatedAt).getTime()
          const bTime = b.latestMessage ? new Date(b.latestMessage.createdAt).getTime() : new Date(b.updatedAt).getTime()
          return bTime - aTime
        })
      })
    }
    
    socket.on("chat_list_update", handleChatListUpdate)

    return () => {
      socket.off("chat_list_update", handleChatListUpdate)
    }
  }, [user, socket])

  // Listen to active chat room events
  useEffect(() => {
    if (!socket || !selectedChat) return

    socket.emit("join_chat", selectedChat._id)

    const handleNewMessage = (message: any) => {
      setMessages(prev => {
        if (prev.find(m => m._id === message._id)) return prev
        return [...prev, message]
      })
      // Mark read
      fetch(`${API}/messages/${selectedChat._id}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user?.uid })
      }).catch(() => {})
    }

    const handleTyping = (data: { chatId: string; username: string }) => {
      if (data.chatId === selectedChat._id) {
        setPeerTyping(data.username)
      }
    }

    const handleStopTyping = (data: { chatId: string; username: string }) => {
      if (data.chatId === selectedChat._id) {
        setPeerTyping(null)
      }
    }

    const handleReadStatus = (data: { chatId: string; userId: string }) => {
      if (data.chatId === selectedChat._id) {
        setMessages(prev => prev.map(m => {
          if (m.sender._id !== data.userId && !m.readBy.includes(data.userId)) {
            return { ...m, readBy: [...m.readBy, data.userId] }
          }
          return m
        }))
      }
    }

    socket.on("new_message", handleNewMessage)
    socket.on("typing", handleTyping)
    socket.on("stop_typing", handleStopTyping)
    socket.on("messages_read", handleReadStatus)

    // Fetch messages for selected chat
    setMessagesLoading(true)
    fetch(`${API}/messages/${selectedChat._id}`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .then(data => {
        if (data.success) {
          setMessages(data.messages)
          // Mark as read immediately on entering chat
          fetch(`${API}/messages/${selectedChat._id}/read`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firebaseUid: user?.uid })
          }).catch(() => {})
        }
      })
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setMessagesLoading(false))

    return () => {
      socket.emit("leave_chat", selectedChat._id)
      socket.off("new_message", handleNewMessage)
      socket.off("typing", handleTyping)
      socket.off("stop_typing", handleStopTyping)
      socket.off("messages_read", handleReadStatus)
    }
  }, [socket, selectedChat, user?.uid])

  // Fetch all chats
  const fetchChats = useCallback(() => {
    if (!user) return
    setChatsLoading(true)
    fetch(`${API}/chats?firebaseUid=${user.uid}`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .then(data => {
        if (data.success) {
          setChats(data.chats)
        }
      })
      .catch(() => toast.error("Failed to load inbox"))
      .finally(() => setChatsLoading(false))
  }, [user])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  // Search users to start new chat
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    const delayDebounce = setTimeout(() => {
      fetch(`${API}/users?search=${encodeURIComponent(searchQuery)}&limit=15`)
        .then(res => {
          if (!res.ok) throw new Error("Fetch failed")
          return res.json()
        })
        .then(data => {
          if (data.success) {
            setSearchResults(data.users.filter((u: any) => u.firebaseUid !== user?.uid))
          }
        })
        .catch(() => {})
        .finally(() => setSearchLoading(false))
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery, user?.uid])

  // Access or Create chat with user
  const accessChat = async (targetUser: any) => {
    if (!user) return
    try {
      const res = await fetch(`${API}/chats/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: user.uid, userId: targetUser._id })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setChats(prev => {
          if (prev.find(c => c._id === data.chat._id)) return prev
          return [data.chat, ...prev]
        })
        setSelectedChat(data.chat)
        setSearchOpen(false)
        setSearchQuery("")
        setMobileView("chat")
      }
    } catch {
      toast.error("Failed to start conversation")
    }
  }

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)

    if (!socket || !selectedChat || !user) return

    if (!isTyping) {
      setIsTyping(true)
      socket.emit("typing", { chatId: selectedChat._id, username: user.displayName || user.email })
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socket.emit("stop_typing", { chatId: selectedChat._id, username: user.displayName || user.email })
    }, 2000)
  }

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim() && !selectedFile) return
    if (!user || !selectedChat) return

    setUploadingMedia(true)
    const formData = new FormData()
    formData.append("firebaseUid", user.uid)
    formData.append("chatId", selectedChat._id)
    if (inputText.trim()) {
      formData.append("content", inputText.trim())
    }
    if (selectedFile) {
      formData.append("media", selectedFile)
    }

    // Stop typing immediately
    if (isTyping) {
      setIsTyping(false)
      socket.emit("stop_typing", { chatId: selectedChat._id, username: user.displayName || user.email })
    }

    try {
      const res = await fetch(`${API}/messages`, {
        method: "POST",
        body: formData
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, data.message])
        setInputText("")
        setSelectedFile(null)
        setFilePreview(null)
      } else {
        toast.error("Failed to send message")
      }
    } catch {
      toast.error("Error sending message")
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setFilePreview(URL.createObjectURL(file))
    }
  }

  // Get Peer Name
  const getPeerInfo = (chat: any) => {
    if (!chat) return { name: "", avatar: "", username: "" }
    if (chat.isGroupChat) {
      return { name: chat.chatName, avatar: "", username: "Group Chat" }
    }
    const peer = chat.participants.find((p: any) => p.name !== user?.displayName && p.username !== (user as any)?.username)
    return peer || { name: "User", avatar: "", username: "user" }
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"}`}>
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 px-4">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-500 text-center max-w-sm mb-6">
            Please log in to your account to access your direct messages and chat with creators.
          </p>
          <a href="/login" className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-md transition-colors">
            Login Now
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-900"} overflow-hidden`}>
      <Navbar />

      <main className="pt-16 h-[calc(100vh)] flex max-w-7xl mx-auto px-0 md:px-4 md:py-4 gap-4">
        {/* LEFT PANEL: CHAT LIST */}
        <div className={`w-full md:w-80 lg:w-96 rounded-2xl flex flex-col overflow-hidden border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200"} ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
          {/* Panel Header */}
          <div className={`p-4 flex items-center justify-between border-b ${isDark ? "border-zinc-800" : "border-gray-200"}`}>
            <h2 className="text-xl font-black tracking-tight">Messages</h2>
            <button 
              onClick={() => setSearchOpen(true)}
              className={`p-2 rounded-xl transition-all ${isDark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              <Plus className="w-5 h-5 text-blue-500" />
            </button>
          </div>

          {/* Inbox Search bar */}
          <div className="p-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? "bg-black/30 border-zinc-850" : "bg-gray-100 border-transparent"}`}>
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search direct chats..."
                className="bg-transparent text-sm border-none outline-none w-full"
              />
            </div>
          </div>

          {/* Chat List Scrollable Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chatsLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-20 px-6">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400 opacity-40 mb-4" />
                <h3 className="font-bold mb-1">Start chatting</h3>
                <p className="text-xs text-gray-500">Connect with creators and friends. Click the plus icon to start a new chat.</p>
              </div>
            ) : (
              chats.map(chat => {
                const peer = getPeerInfo(chat)
                const isSelected = selectedChat?._id === chat._id
                const hasUnread = chat.latestMessage && chat.latestMessage.sender._id !== user?.id && !chat.latestMessage.readBy.includes(user?.id)
                
                return (
                  <button
                    key={chat._id}
                    onClick={() => {
                      setSelectedChat(chat)
                      setMobileView("chat")
                    }}
                    className={`w-full flex items-center gap-3 p-3 text-left border-b transition-colors ${
                      isDark ? "border-zinc-900" : "border-gray-100"
                    } ${isSelected ? (isDark ? "bg-zinc-850" : "bg-gray-100") : (isDark ? "hover:bg-zinc-900" : "hover:bg-gray-50")}`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                        {peer.avatar ? (
                          <img src={peer.avatar} alt={peer.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-base">
                            {peer.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#161616]" />
                    </div>

                    {/* Chat Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-bold truncate ${hasUnread ? "text-blue-500" : ""}`}>
                          {peer.name}
                        </p>
                        {chat.latestMessage && (
                          <span className="text-[10px] text-gray-400">
                            {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${hasUnread ? "font-bold text-white" : "text-gray-400"}`}>
                        {chat.latestMessage ? chat.latestMessage.content || "Sent an attachment" : "Start conversation..."}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CONVERSATION WINDOW */}
        <div className={`flex-1 rounded-2xl flex flex-col overflow-hidden border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200"} ${mobileView === "inbox" ? "hidden md:flex" : "flex"}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={`h-16 flex items-center justify-between px-4 border-b ${isDark ? "border-zinc-800" : "border-gray-200"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <button 
                    onClick={() => setMobileView("inbox")}
                    className="p-1.5 rounded-lg md:hidden hover:opacity-75 transition-opacity"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                      {getPeerInfo(selectedChat).avatar ? (
                        <img src={getPeerInfo(selectedChat).avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                          {getPeerInfo(selectedChat).name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-sm leading-tight truncate">
                      {getPeerInfo(selectedChat).name}
                    </h3>
                    <p className="text-[10px] text-gray-400 truncate">
                      @{getPeerInfo(selectedChat).username}
                    </p>
                  </div>
                </div>

                {/* Header Call Buttons */}
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:opacity-70 transition-opacity"><Phone className="w-4 h-4 text-gray-400" /></button>
                  <button className="p-2 hover:opacity-70 transition-opacity"><Video className="w-4 h-4 text-gray-400" /></button>
                  <button className="p-2 hover:opacity-70 transition-opacity"><Info className="w-4 h-4 text-gray-400" /></button>
                </div>
              </div>

              {/* Messages Content */}
              <div className={`flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 ${isDark ? "bg-black/25" : "bg-gray-50/50"}`}>
                {messagesLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isSelf = msg.sender._id === user?.id || msg.sender.firebaseUid === user?.uid
                    const showSeen = isSelf && msg.readBy && msg.readBy.length > 1 && index === messages.length - 1

                    return (
                      <div 
                        key={msg._id} 
                        className={`flex flex-col max-w-[75%] ${isSelf ? "self-end items-end" : "self-start items-start"}`}
                      >
                        {/* Sender name for group chats */}
                        {selectedChat.isGroupChat && !isSelf && (
                          <span className="text-[10px] text-gray-400 mb-0.5 ml-2">{msg.sender.name}</span>
                        )}

                        <div 
                          className={`rounded-2xl px-4 py-2.5 text-sm ${
                            isSelf 
                              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none" 
                              : (isDark ? "bg-zinc-800 text-white rounded-bl-none" : "bg-gray-200 text-gray-900 rounded-bl-none")
                          }`}
                        >
                          {msg.mediaUrl && (
                            <div className="mb-2 max-w-[240px] rounded-lg overflow-hidden border border-black/10">
                              {msg.mediaType === "video" ? (
                                <video src={msg.mediaUrl} controls className="max-h-48 object-cover w-full" />
                              ) : (
                                <img src={msg.mediaUrl} alt="Chat attachment" className="max-h-48 object-cover w-full" />
                              )}
                            </div>
                          )}
                          <p className="break-words leading-relaxed">{msg.content}</p>
                        </div>

                        {/* Seen Status Checkmarks */}
                        {showSeen && (
                          <span className="text-[9px] text-gray-400 mt-1 flex items-center gap-0.5">
                            Seen <CheckCheck className="w-3 h-3 text-blue-500" />
                          </span>
                        )}
                      </div>
                    )
                  })
                )}

                {/* Peer Typing Indicator */}
                {peerTyping && (
                  <div className="self-start flex items-center gap-2 bg-zinc-800/40 rounded-2xl px-4 py-2.5 text-sm text-gray-400">
                    <span className="animate-pulse">{peerTyping} is typing</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Message Input bar */}
              <form onSubmit={handleSendMessage} className={`p-4 border-t ${isDark ? "border-zinc-800" : "border-gray-200"}`}>
                {/* Selected attachment preview */}
                {filePreview && (
                  <div className="mb-3 relative inline-block">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950">
                      {selectedFile?.type.startsWith("video") ? (
                        <video src={filePreview} className="w-full h-full object-cover" />
                      ) : (
                        <img src={filePreview} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setSelectedFile(null); setFilePreview(null) }}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                  
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2.5 rounded-xl hover:opacity-75 transition-all ${isDark ? "bg-zinc-800" : "bg-gray-100"}`}
                  >
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </button>

                  <input 
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className={`flex-1 px-4 py-2.5 text-sm rounded-xl outline-none border focus:border-blue-500 transition-colors ${
                      isDark ? "bg-black/30 border-zinc-800 text-white" : "bg-gray-150 border-gray-100 text-black"
                    }`}
                  />

                  <button 
                    type="submit"
                    disabled={uploadingMedia || (!inputText.trim() && !selectedFile)}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {uploadingMedia ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold mb-1">Your Inbox</h2>
              <p className="text-xs text-gray-500 max-w-xs mb-6">
                Select a chat from the menu on the left, or search for users to initiate a new private conversation.
              </p>
              <button 
                onClick={() => setSearchOpen(true)}
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
              >
                Send Message
              </button>
            </div>
          )}
        </div>
      </main>

      {/* NEW CHAT SEARCH DIALOG */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setSearchOpen(false)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-md rounded-2xl overflow-hidden border shadow-2xl flex flex-col h-[75vh] ${
                isDark ? "bg-[#1e1e1e] border-zinc-800 text-white" : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <div className={`p-4 flex items-center justify-between border-b ${isDark ? "border-zinc-850" : "border-gray-150"}`}>
                <h3 className="font-bold">New Message</h3>
                <button onClick={() => setSearchOpen(false)} className="hover:opacity-75"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? "bg-black/30 border-zinc-850" : "bg-gray-100"}`}>
                  <Search className="w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search people by name or @username..."
                    className="bg-transparent text-sm border-none outline-none w-full"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {searchLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    {searchQuery ? "No users found" : "Type above to search users..."}
                  </div>
                ) : (
                  searchResults.map(u => (
                    <button
                      key={u._id}
                      onClick={() => accessChat(u)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                        isDark ? "hover:bg-zinc-850" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-850 shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
