"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, X, Loader2, Send, Image as ImageIcon, 
  MessageSquare, Check, CheckCheck, 
  ArrowLeft, Plus, ShieldAlert, Info, Phone, Video,
  MoreVertical, Smile, Mic, MicOff, VideoOff, PhoneOff, Trash2, Trash, ShieldCheck, Volume2, VolumeX
} from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { useSocket } from "@/hooks/use-socket"
import { toast } from "sonner"
import Link from "next/link"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL && process.env.NEXT_PUBLIC_SOCKET_URL !== "/"
  ? process.env.NEXT_PUBLIC_SOCKET_URL
  : "http://localhost:5000"

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
}

interface EmojiItem {
  char: string
  tags: string
}

interface EmojiCategory {
  name: string
  emojis: EmojiItem[]
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: "Smileys & Faces",
    emojis: [
      { char: "😀", tags: "smile happy grin face" },
      { char: "😃", tags: "smile happy grin face joy" },
      { char: "😄", tags: "smile happy grin face laughing" },
      { char: "😁", tags: "smile happy grin beam" },
      { char: "😆", tags: "smile happy grin squint face" },
      { char: "😅", tags: "smile happy grin sweat cold sweat" },
      { char: "🤣", tags: "laugh roll floor laughing face" },
      { char: "😂", tags: "laugh tears joy face" },
      { char: "🙂", tags: "smile slight face" },
      { char: "🙃", tags: "upside down face" },
      { char: "😉", tags: "wink face" },
      { char: "😊", tags: "smile blush cheeks face" },
      { char: "😇", tags: "halo angel face" },
      { char: "🥰", tags: "love hearts blush smile face" },
      { char: "😍", tags: "love heart eyes smile face" },
      { char: "🤩", tags: "star eyes face" },
      { char: "😘", tags: "kiss blowing heart face" },
      { char: "😋", tags: "delicious tongue yum face" },
      { char: "😛", tags: "tongue face stuck out" },
      { char: "😜", tags: "tongue wink face squint" },
      { char: "🤪", tags: "zany goofy crazy face" },
      { char: "😝", tags: "tongue squint face stuck out" },
      { char: "🤑", tags: "money mouth face rich" },
      { char: "🤗", tags: "hug face" },
      { char: "🤫", tags: "quiet shh silent face" },
      { char: "🤔", tags: "thinking ponder face" },
      { char: "🤐", tags: "zipper mouth silent face" },
      { char: "😐", tags: "neutral face straight" },
      { char: "😏", tags: "smirk face sly" },
      { char: "😒", tags: "unamused face unhappy" },
      { char: "🙄", tags: "rolling eyes face" },
      { char: "😬", tags: "grimace face tense" },
      { char: "😌", tags: "relieved face content" },
      { char: "😔", tags: "pensive sad face" },
      { char: "😪", tags: "sleepy drool face" },
      { char: "🤤", tags: "drooling face" },
      { char: "😴", tags: "sleeping zzz face" },
      { char: "😷", tags: "mask sick medical face" },
      { char: "🤒", tags: "thermometer sick fever face" },
      { char: "🤕", tags: "bandage hurt head face" },
      { char: "🤢", tags: "nausea vomit green sick face" },
      { char: "🤮", tags: "vomit sick spew face" },
      { char: "🤧", tags: "sneeze sick running nose face" },
      { char: "🥵", tags: "hot red sweat summer face" },
      { char: "🥶", tags: "cold blue ice winter face" },
      { char: "🥴", tags: "woozy drunk dizzy face" },
      { char: "😵", tags: "dizzy dead knocked out face" },
      { char: "🤯", tags: "mind blown explode head face" },
      { char: "🤠", tags: "cowboy hat sheriff face" },
      { char: "🥳", tags: "party celebration horn hat face" },
      { char: "😎", tags: "cool sunglasses shades face" },
      { char: "🤓", tags: "nerd glasses geek face" },
      { char: "🧐", tags: "monocle inspector face" },
      { char: "😕", tags: "confused face puzzled" },
      { char: "😟", tags: "worried face concerned" },
      { char: "🙁", tags: "frown slight sad face" },
      { char: "😮", tags: "open mouth surprised gasp face" },
      { char: "😲", tags: "astonished surprised face" },
      { char: "😳", tags: "flushed blush red cheeks face" },
      { char: "🥺", tags: "pleading begging puppy eyes face" },
      { char: "😱", tags: "scream scared fear face" },
      { char: "😭", tags: "cry sob tears sad face" },
      { char: "😤", tags: "triumph steam nose angry face" },
      { char: "😡", tags: "angry red mad face" },
      { char: "🤬", tags: "cursing swear bad words face" },
      { char: "💀", tags: "skull death ghost bones" },
      { char: "💩", tags: "poop turd smile" }
    ]
  },
  {
    name: "Gestures & Hearts",
    emojis: [
      { char: "👋", tags: "wave hello bye greeting hand" },
      { char: "👌", tags: "ok hand correct perfect" },
      { char: "✌", tags: "victory peace hand two" },
      { char: "🤞", tags: "fingers crossed luck hand" },
      { char: "🤟", tags: "love rock hand" },
      { char: "🤘", tags: "rock on metal horns hand" },
      { char: "🤙", tags: "call me hand" },
      { char: "👍", tags: "thumbs up like good yes hand" },
      { char: "👎", tags: "thumbs down dislike bad no hand" },
      { char: "✊", tags: "fist raised power" },
      { char: "👊", tags: "fist punch bump" },
      { char: "👏", tags: "clap applaud hands" },
      { char: "🙌", tags: "raising hands celebrate" },
      { char: "👐", tags: "open hands" },
      { char: "🤝", tags: "handshake agree deal" },
      { char: "🙏", tags: "pray thank you please namaste" },
      { char: "💪", tags: "muscle strong flex power" },
      { char: "❤", tags: "red heart love" },
      { char: "🧡", tags: "orange heart love" },
      { char: "💛", tags: "yellow heart love" },
      { char: "💚", tags: "green heart love" },
      { char: "💙", tags: "blue heart love" },
      { char: "💜", tags: "purple heart love" },
      { char: "🖤", tags: "black heart love" },
      { char: "🤍", tags: "white heart love" },
      { char: "💔", tags: "broken heart sad" },
      { char: "💕", tags: "two hearts love" },
      { char: "💞", tags: "spinning revolving hearts" },
      { char: "💓", tags: "beating heart love" },
      { char: "💗", tags: "growing heart love" },
      { char: "💖", tags: "sparkle heart love" },
      { char: "💘", tags: "cupid arrow heart love" }
    ]
  },
  {
    name: "Food & Activities",
    emojis: [
      { char: "🍕", tags: "pizza cheese slice food" },
      { char: "🍔", tags: "burger hamburger fastfood cheese" },
      { char: "🍟", tags: "fries french potato fastfood" },
      { char: "🍿", tags: "popcorn movie theater cinema snack" },
      { char: "☕", tags: "coffee cup tea warm drink" },
      { char: "🍺", tags: "beer drink alcohol mug" },
      { char: "🍦", tags: "icecream sweet cold food dessert" },
      { char: "🍰", tags: "cake pastry sweet dessert slice" },
      { char: "🍩", tags: "donut sweet dessert" },
      { char: "🍫", tags: "chocolate sweet candy" },
      { char: "🎈", tags: "balloon red party celebrate" },
      { char: "🎉", tags: "tada party popper celebrate congrats" },
      { char: "🎊", tags: "confetti ball party celebrate" },
      { char: "🔥", tags: "fire hot flame burn cool trending" },
      { char: "✨", tags: "sparkles shine magic clean stars" },
      { char: "⭐", tags: "star yellow gold rating" },
      { char: "💡", tags: "lightbulb idea brainstorm light" },
      { char: "💻", tags: "laptop computer tech pc coder" },
      { char: "📱", tags: "phone smartphone mobile call apple" },
      { char: "🎮", tags: "controller game video playstation xbox" },
      { char: "👑", tags: "crown king queen royal leader" },
      { char: "🚀", tags: "rocket space launch ship" },
      { char: "💯", tags: "hundred 100 score perfect standard" }
    ]
  }
]

interface SocialInboxProps {
  isDark: boolean
}

export function SocialInbox({ isDark }: SocialInboxProps) {
  const { user, isAuthenticated } = useAuthStore()

  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const { socket } = useSocket()
  
  // Folders / Sub-Tabs
  const [activeFolder, setActiveFolder] = useState<"primary" | "general" | "requests">("primary")
  
  // Dropdowns & Toggles
  const [threeDotOpen, setThreeDotOpen] = useState(false)
  const [listMenuOpenId, setListMenuOpenId] = useState<string | null>(null)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [emojiSearch, setEmojiSearch] = useState("")

  // WebRTC & Calling states
  const [callState, setCallState] = useState<null | "dialing" | "ringing" | "active">(null)
  const [callType, setCallType] = useState<"audio" | "video">("audio")
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [incomingCallData, setIncomingCallData] = useState<any>(null)
  const [callActiveParticipant, setCallActiveParticipant] = useState<any>(null)
  
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
  const [isPeerOnline, setIsPeerOnline] = useState(false)
  const [unreadDividerIndex, setUnreadDividerIndex] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<any>(null)
  const threeDotRef = useRef<HTMLDivElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const callTimerRef = useRef<any>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (threeDotRef.current && !threeDotRef.current.contains(event.target as Node)) {
        setThreeDotOpen(false)
      }
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setEmojiPickerOpen(false)
      }
      // Close list menu if clicking anywhere outside of it
      if (!(event.target as Element).closest('.list-menu-container')) {
        setListMenuOpenId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Call duration counter
  useEffect(() => {
    if (callState === "active") {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(callTimerRef.current)
      setCallDuration(0)
    }
    return () => clearInterval(callTimerRef.current)
  }, [callState])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, peerTyping])

  // Keep refs in sync for WebRTC handlers to avoid dependency loops
  const socketRef = useRef<any>(null)
  const callActiveParticipantRef = useRef<any>(null)

  useEffect(() => {
    socketRef.current = socket
  }, [socket])

  useEffect(() => {
    callActiveParticipantRef.current = callActiveParticipant
  }, [callActiveParticipant])

  // WebRTC Signal cleanup & helper
  const endActiveCall = useCallback((emitSignal = true) => {
    if (emitSignal && socketRef.current && callActiveParticipantRef.current) {
      socketRef.current.emit("end_call", { targetUserId: callActiveParticipantRef.current.id })
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    setRemoteStream(null)

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    setCallState(null)
    setIncomingCallData(null)
    setCallActiveParticipant(null)
  }, [localStream])

  // Setup sockets & signaling room registration
  useEffect(() => {
    if (!user || !socket) return

    socket.on("chat_list_update", (data: any) => {
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
    })

    // Online / Offline presence events
    newSocket.on("user_online", (data: { userId: string }) => {
      // Check if this is the currently selected chat's peer
      setSelectedChat((prev: any) => {
        if (!prev) return prev
        const peer = prev.participants?.find((p: any) => 
          p._id === data.userId || p.id === data.userId
        )
        if (peer) setIsPeerOnline(true)
        return prev
      })
    })

    newSocket.on("user_offline", (data: { userId: string }) => {
      setSelectedChat((prev: any) => {
        if (!prev) return prev
        const peer = prev.participants?.find((p: any) => 
          p._id === data.userId || p.id === data.userId
        )
        if (peer) setIsPeerOnline(false)
        return prev
      })
    })

    // WebRTC Incoming Call Signaling
    newSocket.on("incoming_call", (data: { fromUserId: string; offer: any; callerName: string; callType: "audio" | "video" }) => {
      setIncomingCallData(data)
      setCallType(data.callType)
      setCallState("ringing")
      setCallActiveParticipant({
        id: data.fromUserId,
        name: data.callerName
      })
    })

    newSocket.on("call_answered", async (data: { answer: any }) => {
      setCallState("active")
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer))
        } catch (err) {
          console.error("Error setting remote description on caller side:", err)
        }
      }
    })

    newSocket.on("ice_candidate", async (data: { candidate: any }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch (err) {
          console.error("Error adding ice candidate:", err)
        }
      }
    })

    newSocket.on("call_ended", () => {
      endActiveCall(false)
      toast.info("Call ended by remote user")
    })

    return () => {
      socket.off("chat_list_update")
      socket.off("user_online")
      socket.off("user_offline")
      socket.off("incoming_call")
      socket.off("call_answered")
      socket.off("ice_candidate")
      socket.off("call_ended")
    }
  }, [user, endActiveCall, socket])

  useEffect(() => {
    if (!socket || !selectedChat) return

    socket.emit("join_chat", selectedChat._id)

    const handleNewMessage = (message: any) => {
      setMessages(prev => {
        if (prev.find(m => m._id === message._id)) return prev
        return [...prev, message]
      })
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

    setMessagesLoading(true)
    setUnreadDividerIndex(null)
    fetch(`${API}/messages/${selectedChat._id}`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch failed")
        return res.json()
      })
      .then(data => {
        if (data.success) {
          setMessages(data.messages)

          // Find first unread message from peer to show divider
          const selfMongoId = user?._id || user?.id
          if (selfMongoId) {
            const firstUnreadIdx = data.messages.findIndex((m: any) => {
              const isMine = !!(
                (user?.uid && m.sender?.firebaseUid && m.sender.firebaseUid === user.uid) ||
                (selfMongoId && m.sender?._id && String(m.sender._id) === String(selfMongoId))
              )
              return !isMine && !m.readBy?.map(String).includes(String(selfMongoId))
            })
            if (firstUnreadIdx > 0) {
              setUnreadDividerIndex(firstUnreadIdx)
            }
          }

          fetch(`${API}/messages/${selectedChat._id}/read`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firebaseUid: user?.uid })
          }).then(() => {
            // Notify navbar/mobile-nav that DMs have been read
            window.dispatchEvent(new CustomEvent("dm_read"))
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

  // Check peer online status whenever we open a chat
  useEffect(() => {
    if (!socket || !selectedChat) {
      setIsPeerOnline(false)
      return
    }
    const peer = getPeerInfo(selectedChat)
    const peerId = selectedChat.participants?.find(
      (p: any) => p.firebaseUid !== user?.uid && p._id !== user?.id
    )?._id
    if (!peerId) return

    socket.emit("check_online_status", { userId: peerId }, (res: { isOnline: boolean }) => {
      setIsPeerOnline(res?.isOnline ?? false)
    })
  }, [socket, selectedChat, user])

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
        // Do NOT append locally. Socket listener "new_message" handles it safely to avoid duplicates.
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

  const getPeerInfo = (chat: any) => {
    if (!chat) return { name: "", avatar: "", username: "", firebaseUid: "" }
    if (chat.isGroupChat) {
      return { name: chat.chatName, avatar: "", username: "Group Chat", firebaseUid: "" }
    }
    const peer = chat.participants.find((p: any) => p.name !== user?.displayName && p.username !== (user as any)?.username)
    return peer || { name: "User", avatar: "", username: "user", firebaseUid: "" }
  }

  // Active Chats Sub-Folder state management
  const toggleChatCategory = async (chatId: string, currentCategory: string) => {
    const newCategory = currentCategory === "general" ? "primary" : "general"
    try {
      const res = await fetch(`${API}/chats/${chatId}/category`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory })
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setChats((prev: any[]) => prev.map(c => c._id === chatId ? { ...c, category: newCategory } : c))
        setSelectedChat((prev: any) => prev ? { ...prev, category: newCategory } : null)
        toast.success(`Moved to ${newCategory === "general" ? "General" : "Primary"}`)
        setThreeDotOpen(false)
      }
    } catch (err) {
      toast.error("Failed to move chat category")
    }
  }

  const clearChatMessages = async (chatId: string) => {
    if (!confirm("Are you sure you want to clear all messages in this chat? This cannot be undone.")) return
    try {
      const res = await fetch(`${API}/chats/${chatId}/clear`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setMessages([])
        setChats(prev => prev.map(c => c._id === chatId ? { ...c, latestMessage: null } : c))
        toast.success("Messages cleared successfully")
        setThreeDotOpen(false)
      }
    } catch (err) {
      toast.error("Failed to clear chat")
    }
  }

  const deleteChatCompletely = async (chatId: string) => {
    if (!confirm("Are you sure you want to delete this conversation completely? This will delete all messages for you.")) return
    try {
      const res = await fetch(`${API}/chats/${chatId}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setChats(prev => prev.filter(c => c._id !== chatId))
        setSelectedChat(null)
        toast.success("Conversation deleted")
        setThreeDotOpen(false)
      }
    } catch (err) {
      toast.error("Failed to delete chat")
    }
  }

  const acceptRequest = async (chatId: string) => {
    try {
      const res = await fetch(`${API}/chats/${chatId}/accept`, {
        method: "PUT"
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setChats(prev => prev.map(c => c._id === chatId ? { ...c, status: "accepted" } : c))
        setSelectedChat(prev => prev ? { ...prev, status: "accepted" } : null)
        toast.success("Message request accepted")
      }
    } catch (err) {
      toast.error("Failed to accept message request")
    }
  }

  const declineRequest = async (chatId: string) => {
    if (!confirm("Decline this chat request? This will permanently delete the conversation.")) return
    try {
      const res = await fetch(`${API}/chats/${chatId}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setChats(prev => prev.filter(c => c._id !== chatId))
        setSelectedChat(null)
        toast.success("Request declined")
      }
    } catch (err) {
      toast.error("Failed to decline request")
    }
  }

  // WebRTC Call Initiation Flow (Real connection)
  const initiateCall = async (type: "audio" | "video") => {
    if (!selectedChat || !socket || !user) return
    const peer = getPeerInfo(selectedChat)
    
    setCallType(type)
    setCallState("dialing")
    setIsMuted(false)
    setIsCameraOff(false)
    setIsSpeakerOn(false)
    setCallActiveParticipant({
      id: peer._id || peer.id,
      name: peer.name
    })

    // Log call start to database chat history (Instagram style)
    fetch(`${API}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebaseUid: user.uid,
        chatId: selectedChat._id,
        content: type === "video" ? "🎥 Video Call Started" : "📞 Voice Call Started"
      })
    }).catch(err => console.error("Failed to log call to DB:", err))

    try {
      const pc = new RTCPeerConnection(ICE_SERVERS)
      peerConnectionRef.current = pc

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true
      })
      setLocalStream(stream)
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      }, 100)

      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0])
          setTimeout(() => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0]
            }
          }, 100)
        }
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice_candidate", {
            targetUserId: peer._id || peer.id,
            candidate: event.candidate
          })
        }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      socket.emit("call_user", {
        targetUserId: peer._id || peer.id,
        offer,
        callerName: user.displayName || user.email || "Someone",
        callType: type,
        fromUserId: user.id || (user as any)._id
      })
    } catch (err) {
      console.error("Failed to start stream:", err)
      endActiveCall()
    }
  }

  // WebRTC Accept Incoming Call Flow
  const acceptIncomingCall = async () => {
    if (!incomingCallData || !socket) return
    setCallState("active")
    setIsMuted(false)
    setIsCameraOff(false)
    setIsSpeakerOn(false)

    try {
      const pc = new RTCPeerConnection(ICE_SERVERS)
      peerConnectionRef.current = pc

      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true
      })
      setLocalStream(stream)
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      }, 100)

      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0])
          setTimeout(() => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0]
            }
          }, 100)
        }
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice_candidate", {
            targetUserId: incomingCallData.fromUserId,
            candidate: event.candidate
          })
        }
      }

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      socket.emit("answer_call", {
        targetUserId: incomingCallData.fromUserId,
        answer
      })

      setIncomingCallData(null)
    } catch (err) {
      console.error("Failed to answer stream:", err)
      endActiveCall()
    }
  }

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    } else {
      setIsMuted(!isMuted)
    }
  }

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsCameraOff(!videoTrack.enabled)
      }
    } else {
      setIsCameraOff(!isCameraOff)
    }
  }

  const toggleSpeaker = () => {
    // Simulated Speaker Mode
    setIsSpeakerOn(!isSpeakerOn)
    toast.success(isSpeakerOn ? "Speakerphone disabled" : "Speakerphone enabled")
  }

  const formatCallDuration = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`
  }

  // Categorize Chats
  const filteredChats = chats.filter(chat => {
    const isIncomingRequest = chat.status === "requested" && 
      (chat.requestRecipient === user?.id || chat.requestRecipient?._id === user?.id)

    if (activeFolder === "requests") {
      return isIncomingRequest
    } else {
      // Show in primary/general if accepted, OR if it's a requested chat initiated by us (where we are not the requestRecipient)
      const isMyPendingRequest = chat.status === "requested" && !isIncomingRequest
      const isAccepted = chat.status === "accepted"
      
      if (isAccepted || isMyPendingRequest) {
        return chat.category === activeFolder || (!chat.category && activeFolder === "primary")
      }
      return false
    }
  })

  const requestCount = chats.filter(chat => 
    chat.status === "requested" && (chat.requestRecipient === user?.id || chat.requestRecipient?._id === user?.id)
  ).length

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Access Denied</h3>
        <p className="text-gray-500 text-center max-w-sm mb-6">
          Please log in to your account to access your direct messages and chat with creators.
        </p>
      </div>
    )
  }

  const peerInfo = getPeerInfo(selectedChat)
  const isIncomingRequest = selectedChat && selectedChat.status === "requested" && 
    (selectedChat.requestRecipient === user?.id || selectedChat.requestRecipient?._id === user?.id)

  // Filter Emojis dynamically based on search
  const getFilteredEmojis = () => {
    if (!emojiSearch.trim()) return null
    const query = emojiSearch.toLowerCase().trim()
    const matches: string[] = []
    EMOJI_CATEGORIES.forEach(cat => {
      cat.emojis.forEach(emo => {
        if (emo.tags.includes(query)) {
          matches.push(emo.char)
        }
      })
    })
    return matches
  }

  const filteredEmojiList = getFilteredEmojis()

  return (
    <div className="h-[70vh] flex gap-4 relative">
      {/* LEFT PANEL: CHAT LIST */}
      <div className={`w-full md:w-80 lg:w-96 rounded-2xl flex flex-col overflow-hidden border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200"} ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
        {/* Inbox Header & Search Action */}
        <div className={`p-4 flex items-center justify-between border-b ${isDark ? "border-zinc-800" : "border-gray-200"}`}>
          <h2 className="text-base font-bold">Inbox</h2>
          <button 
            onClick={() => setSearchOpen(true)}
            className={`p-1.5 rounded-lg transition-all ${isDark ? "bg-zinc-850 hover:bg-zinc-700" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            <Plus className="w-4 h-4 text-blue-500" />
          </button>
        </div>

        {/* Instagram style Tabs switcher */}
        <div className={`flex text-xs font-semibold border-b ${isDark ? "border-zinc-850 bg-black/20" : "border-gray-150 bg-gray-50/50"}`}>
          <button
            onClick={() => setActiveFolder("primary")}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeFolder === "primary"
                ? "border-blue-500 text-blue-500 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-400"
            }`}
          >
            Primary
          </button>
          <button
            onClick={() => setActiveFolder("general")}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeFolder === "general"
                ? "border-blue-500 text-blue-500 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-400"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveFolder("requests")}
            className={`flex-1 py-3 text-center border-b-2 transition-all relative ${
              activeFolder === "requests"
                ? "border-blue-500 text-blue-500 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-400"
            }`}
          >
            Requests
            {requestCount > 0 && (
              <span className="absolute right-3 top-2.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {requestCount}
              </span>
            )}
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chatsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-12 px-6">
              <MessageSquare className="w-10 h-10 mx-auto text-gray-400 opacity-40 mb-3" />
              <h4 className="font-bold text-sm mb-1">
                {activeFolder === "requests" ? "No Requests" : "Start chatting"}
              </h4>
              <p className="text-xs text-gray-500">
                {activeFolder === "requests" 
                  ? "Messages from users you don't follow will appear here." 
                  : "Connect with creators and friends. Click the plus icon to start a new chat."}
              </p>
            </div>
          ) : (
            filteredChats.map(chat => {
              const peer = getPeerInfo(chat)
              const isSelected = selectedChat?._id === chat._id
              const myMongoId = user?._id || user?.id
              const isIncoming = chat.status === "requested" && (
                chat.requestRecipient === myMongoId ||
                chat.requestRecipient?._id === myMongoId
              )
              // Unread: last message was NOT sent by me AND I haven't read it
              const lastMsg = chat.latestMessage
              const hasUnread = !!(lastMsg && user && (
                (lastMsg.sender?.firebaseUid && lastMsg.sender.firebaseUid !== user.uid) ||
                (!lastMsg.sender?.firebaseUid && myMongoId && String(lastMsg.sender?._id) !== String(myMongoId))
              ) && myMongoId && !lastMsg.readBy?.map(String).includes(String(myMongoId)))
              const unreadCount = hasUnread ? (chat.unreadCount || 1) : 0
              
              return (
                <div
                  key={chat._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedChat(chat)
                    setMobileView("chat")
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left border-b transition-colors cursor-pointer ${
                    isDark ? "border-zinc-900" : "border-gray-100"
                  } ${isSelected 
                    ? (isDark ? "bg-zinc-850" : "bg-blue-50/50") 
                    : isIncoming && !isSelected
                      ? (isDark ? "hover:bg-amber-950/30 bg-amber-950/10" : "hover:bg-amber-50 bg-amber-50/60")
                      : hasUnread && !isSelected
                        ? (isDark ? "bg-blue-950/15 hover:bg-blue-950/25" : "bg-blue-50/40 hover:bg-blue-50/70")
                        : (isDark ? "hover:bg-zinc-900" : "hover:bg-gray-50")
                  }`}
                >
                  {/* Avatar with online dot */}
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full overflow-hidden ${
                      isIncoming ? "ring-2 ring-amber-400/60" : ""
                    }`}>
                      {peer.avatar ? (
                        <img src={peer.avatar} alt={peer.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm">
                          {peer.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Unread dot */}
                    {hasUnread && !isIncoming && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-black" />
                    )}
                  </div>
 
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className={`text-xs font-bold truncate ${
                          isIncoming ? "text-amber-400" : hasUnread ? (isDark ? "text-white" : "text-black") : ""
                        }`}>
                          {peer.name}
                        </p>
                        {peer.username && (
                          <span className="text-[9px] text-gray-500 truncate hidden sm:block">@{peer.username}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isIncoming && (
                          <span className="text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded-full border border-amber-500/20">
                            Request
                          </span>
                        )}
                        {chat.latestMessage && (
                          <span className={`text-[9px] ${
                            hasUnread ? (isDark ? "text-blue-400" : "text-blue-600") : "text-gray-500"
                          }`}>
                            {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {/* Unread message count badge */}
                        {hasUnread && (
                          <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-blue-500 rounded-full text-[9px] font-bold text-white px-1 shadow-sm">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                        
                        {/* 3-dot menu button for list item */}
                        <div className="relative ml-1 list-menu-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setListMenuOpenId(listMenuOpenId === chat._id ? null : chat._id)
                            }}
                            className={`p-1 rounded-full transition-colors ${
                              isDark ? "hover:bg-zinc-800 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                            }`}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          
                          <AnimatePresence>
                            {listMenuOpenId === chat._id && (
                              <motion.div
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                className={`absolute right-0 top-full mt-1 w-48 rounded-xl shadow-2xl border p-1 z-[100] overflow-hidden ${
                                  isDark ? "bg-[#1f1f1f] border-zinc-800 text-white" : "bg-white border-gray-200 text-black"
                                }`}
                              >
                                {chat.status === "accepted" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleChatCategory(chat._id, chat.category || "primary")
                                      setListMenuOpenId(null)
                                    }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                                      isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
                                    }`}
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                    {chat.category === "general" ? "Move to Primary" : "Move to General"}
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    clearChatMessages(chat._id)
                                    setListMenuOpenId(null)
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                                    isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
                                  }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                                  Clear Chat
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteChatCompletely(chat._id)
                                    setListMenuOpenId(null)
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs rounded-lg transition-colors text-red-500 ${
                                    isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                                  }`}
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                  Delete Chat
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${
                      isIncoming ? "text-amber-300/70 italic" : 
                      hasUnread ? `font-bold ${isDark ? "text-white" : "text-gray-900"}` : "text-gray-400"
                    }`}>
                      {chat.latestMessage ? chat.latestMessage.content || "📎 Attachment" : 
                       isIncoming ? "Sent you a message request" : "Start conversation..."}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CONVERSATION WINDOW */}
      <div className={`flex-1 rounded-2xl flex flex-col overflow-hidden border ${isDark ? "bg-[#161616] border-zinc-800" : "bg-white border-gray-200"} ${mobileView === "inbox" ? "hidden md:flex" : "flex"} relative`}>
        {selectedChat ? (
          <>
            {/* Header section with Settings Dropdown */}
            <div className={`h-14 flex items-center justify-between px-4 border-b ${isDark ? "border-zinc-800" : "border-gray-200"}`}>
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setMobileView("inbox")}
                  className="p-1 md:hidden hover:opacity-75"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <Link 
                  href={`/u/${peerInfo.username || peerInfo.firebaseUid}`}
                  className="flex items-center gap-3 min-w-0 hover:opacity-85"
                >
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                      {peerInfo.avatar ? (
                        <img src={peerInfo.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-bold">
                          {peerInfo.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Online dot in header avatar */}
                    {isPeerOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#161616] shadow" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-xs leading-tight truncate">
                      {peerInfo.name}
                    </h3>
                    <p className={`text-[9px] truncate flex items-center gap-1 ${
                      peerTyping ? "text-green-400" : isPeerOnline ? "text-green-400" : "text-gray-500"
                    }`}>
                      {peerTyping ? (
                        <span className="flex items-center gap-1">
                          typing
                          <span className="inline-flex gap-0.5">
                            <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                        </span>
                      ) : isPeerOnline ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          Online
                        </span>
                      ) : (
                        `@${peerInfo.username}`
                      )}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Header icons: Phone, Video, and 3-Dot settings */}
              <div className="flex items-center gap-1.5 relative">
                {selectedChat.status === "accepted" && (
                  <>
                    <button onClick={() => initiateCall("audio")} className="p-1.5 hover:opacity-70 rounded-full hover:bg-zinc-800/20 text-gray-400">
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => initiateCall("video")} className="p-1.5 hover:opacity-70 rounded-full hover:bg-zinc-800/20 text-gray-400">
                      <Video className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                
                {/* 3-Dot dropdown selector */}
                <div ref={threeDotRef} className="relative">
                  <button 
                    onClick={() => setThreeDotOpen(!threeDotOpen)}
                    className="p-1.5 hover:opacity-70 rounded-full hover:bg-zinc-800/20 text-gray-400"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  <AnimatePresence>
                    {threeDotOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border p-1 z-50 overflow-hidden ${
                          isDark ? "bg-[#1f1f1f] border-zinc-800 text-white" : "bg-white border-gray-200 text-black"
                        }`}
                      >
                        {selectedChat.status === "accepted" && (
                          <button
                            onClick={() => toggleChatCategory(selectedChat._id, selectedChat.category || "primary")}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                              isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                            {selectedChat.category === "general" ? "Move to Primary" : "Move to General"}
                          </button>
                        )}
                        <button
                          onClick={() => clearChatMessages(selectedChat._id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                            isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
                          }`}
                        >
                          <Info className="w-3.5 h-3.5 text-yellow-500" />
                          Clear Chat
                        </button>
                        <button
                          onClick={() => deleteChatCompletely(selectedChat._id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-red-500 rounded-lg transition-colors ${
                            isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          Delete Chat
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className={`flex-1 px-4 py-3 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 ${isDark ? "bg-black/25" : "bg-gray-50/50"}`}>
              {messagesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                </div>
              ) : (
                messages.map((msg, index) => {
                  // Primary: compare firebaseUid (always populated after backend fix)
                  // Fallback: compare MongoDB _id as string
                  const selfUid = user?.uid
                  const selfMongoId = user?._id || user?.id

                  const isSelf = !!(
                    // Firebase UID match (most reliable)
                    (selfUid && msg.sender?.firebaseUid && msg.sender.firebaseUid === selfUid) ||
                    // MongoDB _id match (fallback)
                    (selfMongoId && msg.sender?._id && String(msg.sender._id) === String(selfMongoId))
                  )
                  const showSeen = isSelf && msg.readBy && msg.readBy.length > 1 && index === messages.length - 1

                  // Check if message is an Instagram-style call notification
                  const isCallLog = msg.content?.startsWith("📞") || msg.content?.startsWith("🎥")

                  // Unread messages divider
                  const showUnreadDivider = unreadDividerIndex !== null && index === unreadDividerIndex

                  if (isCallLog) {
                    return (
                      <div key={msg._id}>
                        {showUnreadDivider && (
                          <div className="flex items-center gap-3 my-3 px-2">
                            <div className={`flex-1 h-px ${isDark ? "bg-blue-500/40" : "bg-blue-400/50"}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isDark ? "text-blue-400 bg-blue-500/10" : "text-blue-600 bg-blue-100/60"
                            }`}>Unread Messages</span>
                            <div className={`flex-1 h-px ${isDark ? "bg-blue-500/40" : "bg-blue-400/50"}`} />
                          </div>
                        )}
                        <div className="self-center my-1.5 flex flex-col items-center gap-1">
                          <div className={`px-4 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-2 ${
                            isDark ? "bg-zinc-900/60 text-zinc-400 border border-zinc-800/40" : "bg-gray-150 text-gray-500 border border-gray-200/50"
                          }`}>
                            <span>{msg.content}</span>
                            <span className="text-[9px] opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={msg._id}>
                      {/* Unread messages divider for regular messages */}
                      {showUnreadDivider && (
                        <div className="flex items-center gap-3 my-3 px-2">
                          <div className={`flex-1 h-px ${isDark ? "bg-blue-500/40" : "bg-blue-400/50"}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isDark ? "text-blue-400 bg-blue-500/10" : "text-blue-600 bg-blue-100/60"
                          }`}>Unread Messages</span>
                          <div className={`flex-1 h-px ${isDark ? "bg-blue-500/40" : "bg-blue-400/50"}`} />
                        </div>
                      )}
                    <div
                      className={`flex gap-2 ${
                        isSelf ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Peer avatar — only show on left messages */}
                      {!isSelf && (
                        <div className="shrink-0 self-end mb-4">
                          {peerInfo.avatar ? (
                            <img
                              src={peerInfo.avatar}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-[9px] font-bold">
                              {(msg.sender?.name || peerInfo.name)?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`flex flex-col max-w-[70%] ${
                        isSelf ? "items-end" : "items-start"
                      }`}>
                        {/* Username label above peer messages */}
                        {!isSelf && (
                          <span className="text-[10px] font-semibold text-gray-400 mb-0.5 ml-1">
                            {msg.sender?.username ? `@${msg.sender.username}` : (msg.sender?.name || peerInfo.name)}
                          </span>
                        )}

                        {/* Bubble */}
                        <div
                          className={`rounded-2xl px-3.5 py-2 text-xs ${
                            isSelf
                              ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm"
                              : isDark
                                ? "bg-zinc-800 text-white rounded-bl-sm"
                                : "bg-gray-200 text-gray-900 rounded-bl-sm"
                          }`}
                        >
                          {msg.mediaUrl && (
                            <div className="mb-2 max-w-[200px] rounded-lg overflow-hidden border border-black/10">
                              {msg.mediaType === "video" ? (
                                <video src={msg.mediaUrl} controls className="max-h-36 object-cover w-full" />
                              ) : (
                                <img src={msg.mediaUrl} alt="" className="max-h-36 object-cover w-full" />
                              )}
                            </div>
                          )}
                          <p className="break-words leading-normal">{msg.content}</p>
                        </div>

                        {/* Time + seen for self messages */}
                        <div className={`flex items-center gap-1 mt-0.5 ${
                          isSelf ? "flex-row-reverse" : "flex-row"
                        }`}>
                          <span className="text-[9px] text-gray-500">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {showSeen && (
                            <CheckCheck className="w-3 h-3 text-blue-400" />
                          )}
                          {isSelf && !showSeen && (
                            <Check className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    </div>
                  )
                })
              )}

              {/* Typing indicator — WhatsApp style with peer avatar */}
              {peerTyping && (
                <div className="flex gap-2 items-end">
                  <div className="shrink-0">
                    {peerInfo.avatar ? (
                      <img src={peerInfo.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-[9px] font-bold">
                        {peerInfo.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-bl-sm ${
                    isDark ? "bg-zinc-800" : "bg-gray-200"
                  }`}>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '160ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '320ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Toolbar or Message Request Actions Footer */}
            {isIncomingRequest ? (
              <div className={`p-4 border-t flex flex-col items-center text-center gap-3 ${isDark ? "border-zinc-800 bg-zinc-950/40" : "border-gray-200 bg-gray-55/40"}`}>
                <p className="text-[11.5px] text-gray-400 max-w-md">
                  Do you want to let <strong>{peerInfo.name}</strong> (@{peerInfo.username}) send you messages? They won't know you've seen their request until you accept.
                </p>
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <button 
                    onClick={() => declineRequest(selectedChat._id)}
                    className="flex-1 py-2 text-xs font-bold text-red-500 border border-red-500/20 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => acceptRequest(selectedChat._id)}
                    className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className={`p-3 border-t relative ${isDark ? "border-zinc-800" : "border-gray-200"}`}>
                {filePreview && (
                  <div className="mb-2 relative inline-block">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950">
                      {selectedFile?.type.startsWith("video") ? (
                        <video src={filePreview} className="w-full h-full object-cover" />
                      ) : (
                        <img src={filePreview} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setSelectedFile(null); setFilePreview(null) }}
                      className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 rounded-full text-white"
                    >
                      <X className="w-3 h-3" />
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
                    className={`p-2 rounded-lg hover:opacity-75 ${isDark ? "bg-zinc-850" : "bg-gray-100"}`}
                  >
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* WhatsApp style Rich Emojis search & scroll picker */}
                  <div ref={emojiRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                      className={`p-2 rounded-lg hover:opacity-75 ${isDark ? "bg-zinc-850" : "bg-gray-100"}`}
                    >
                      <Smile className="w-4 h-4 text-yellow-500" />
                    </button>

                    <AnimatePresence>
                      {emojiPickerOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.95 }}
                          className={`absolute bottom-12 left-0 p-3 rounded-2xl border shadow-2xl z-[100] w-64 flex flex-col gap-2 ${
                            isDark ? "bg-[#1c1c1c] border-zinc-800 text-white" : "bg-white border-gray-200 text-black"
                          }`}
                        >
                          {/* Search bar inside emoji picker */}
                          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${
                            isDark ? "bg-black/40 border-zinc-800" : "bg-gray-50 border-gray-150"
                          }`}>
                            <Search className="w-3.5 h-3.5 text-gray-400" />
                            <input 
                              type="text"
                              value={emojiSearch}
                              onChange={e => setEmojiSearch(e.target.value)}
                              placeholder="Search emojis..."
                              className="bg-transparent text-[11px] border-none outline-none w-full"
                            />
                            {emojiSearch && (
                              <button type="button" onClick={() => setEmojiSearch("")}>
                                <X className="w-3 h-3 text-gray-400 hover:text-white" />
                              </button>
                            )}
                          </div>

                          {/* Emojis Grid Container */}
                          <div className="max-h-52 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1 text-left">
                            {filteredEmojiList !== null ? (
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold mb-1.5 uppercase tracking-wide">Search Results</p>
                                {filteredEmojiList.length === 0 ? (
                                  <p className="text-[10px] text-gray-500 text-center py-4">No emojis found</p>
                                ) : (
                                  <div className="grid grid-cols-6 gap-1.5">
                                    {filteredEmojiList.map(emoji => (
                                      <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => {
                                          setInputText(prev => prev + emoji)
                                          setEmojiPickerOpen(false)
                                          setEmojiSearch("")
                                        }}
                                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm hover:scale-120 transition-transform ${
                                          isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
                                        }`}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              EMOJI_CATEGORIES.map(category => (
                                <div key={category.name}>
                                  <p className="text-[9px] text-gray-400 font-bold mb-1.5 uppercase tracking-wide">
                                    {category.name}
                                  </p>
                                  <div className="grid grid-cols-6 gap-1.5">
                                    {category.emojis.map(emoji => (
                                      <button
                                        key={emoji.char}
                                        type="button"
                                        onClick={() => {
                                          setInputText(prev => prev + emoji.char)
                                          setEmojiPickerOpen(false)
                                        }}
                                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm hover:scale-120 transition-transform ${
                                          isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
                                        }`}
                                      >
                                        {emoji.char}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <input 
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className={`flex-1 px-3 py-2 text-xs rounded-lg outline-none border focus:border-blue-500 ${
                      isDark ? "bg-black/30 border-zinc-850 text-white" : "bg-gray-50 border-gray-100 text-black"
                    }`}
                  />

                  <button 
                    type="submit"
                    disabled={uploadingMedia || (!inputText.trim() && !selectedFile)}
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                  >
                    {uploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7 text-blue-500" />
            </div>
            <h4 className="font-bold text-sm mb-1">Direct Messages</h4>
            <p className="text-[11px] text-gray-500 max-w-[200px] mb-4">
              Select an active conversation, or start a new message with creators.
            </p>
            <button 
              onClick={() => setSearchOpen(true)}
              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-xs transition-colors shadow-md"
            >
              Start Chat
            </button>
          </div>
        )}

        {/* DRAGGABLE FLOATING CALL PANEL / WIDGET */}
        <AnimatePresence>
          {callState && (
            <motion.div
              drag
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed bottom-6 right-6 z-[300] w-80 h-[480px] bg-zinc-950/95 border border-zinc-800 text-white rounded-2xl shadow-2xl flex flex-col justify-between p-4 overflow-hidden select-none cursor-move"
            >
              {/* Webcam streams if video call is active */}
              {callType === "video" && callState === "active" && (
                <div className="absolute inset-0 z-0 bg-black">
                  {/* Remote Participant Stream (Main View) */}
                  {remoteStream ? (
                    <video 
                      ref={remoteVideoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-xs text-gray-400">
                      Waiting for video...
                    </div>
                  )}

                  {/* Local Participant Stream (PiP Corner View) */}
                  {!isCameraOff && localStream && (
                    <div className="absolute top-3 right-3 w-24 h-32 rounded-lg border border-white/20 bg-black overflow-hidden shadow-lg z-10">
                      <video 
                        ref={localVideoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                </div>
              )}

              {/* Top Handle Header */}
              <div className="z-10 flex items-center justify-between bg-black/20 p-2 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wide">
                    {callType === "video" ? "Video Line" : "Voice Line"}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium">
                  {callState === "active" ? formatCallDuration(callDuration) : "Connecting..."}
                </div>
              </div>

              {/* Call Center Info: Display avatar in audio call or connection phases */}
              {(callType === "audio" || callState !== "active") && (
                <div className="z-10 flex flex-col items-center justify-center gap-3 my-auto">
                  <div className="relative">
                    {/* Pulsing rings for dialing/ringing */}
                    {callState !== "active" && (
                      <>
                        <div className="absolute -inset-3 border border-blue-500/30 rounded-full animate-ping" style={{ animationDuration: "1.6s" }} />
                        <div className="absolute -inset-6 border border-blue-500/15 rounded-full animate-ping" style={{ animationDuration: "2.2s" }} />
                      </>
                    )}
                    
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl">
                      {peerInfo.avatar ? (
                        <img src={peerInfo.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold">
                          {callActiveParticipant?.name?.charAt(0).toUpperCase() || peerInfo.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="font-bold text-sm">{callActiveParticipant?.name || peerInfo.name}</h3>
                    <p className="text-[10px] text-gray-400">
                      {callState === "dialing" && "Dialing..."}
                      {callState === "ringing" && "Ringing..."}
                      {callState === "active" && "Connected"}
                    </p>
                  </div>
                </div>
              )}

              {/* Incoming Call Answer/Decline Actions Overlay */}
              {incomingCallData && callState === "ringing" ? (
                <div className="z-10 p-3 bg-black/60 rounded-2xl border border-white/5 backdrop-blur-md flex flex-col gap-3">
                  <p className="text-xs text-center text-gray-200">
                    Incoming {callType} call request...
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => endActiveCall(true)}
                      className="flex-1 py-2 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={acceptIncomingCall}
                      className="flex-1 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-500 rounded-xl transition-all shadow-lg"
                    >
                      Answer
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Call Controls Footer with Speaker button */
                <div className="z-10 flex items-center justify-center gap-4 bg-black/25 p-3 rounded-2xl backdrop-blur-md">
                  {/* Speaker Button */}
                  <button 
                    onClick={toggleSpeaker}
                    className={`p-2.5 rounded-full transition-all border ${
                      isSpeakerOn 
                        ? "bg-blue-500 border-blue-500 text-white animate-pulse" 
                        : "bg-white/10 border-white/5 text-white hover:bg-white/20"
                    }`}
                  >
                    {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  <button 
                    onClick={toggleMute}
                    className={`p-2.5 rounded-full transition-all border ${
                      isMuted 
                        ? "bg-red-500 border-red-500 text-white animate-pulse" 
                        : "bg-white/10 border-white/5 text-white hover:bg-white/20"
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button 
                    onClick={() => endActiveCall(true)}
                    className="p-3.5 rounded-full bg-red-600 text-white hover:bg-red-500 transition-all hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>

                  {callType === "video" ? (
                    <button 
                      onClick={toggleCamera}
                      className={`p-2.5 rounded-full transition-all border ${
                        isCameraOff 
                          ? "bg-red-500 border-red-500 text-white animate-pulse" 
                          : "bg-white/10 border-white/5 text-white hover:bg-white/20"
                      }`}
                    >
                      {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </button>
                  ) : (
                    <div className="w-9 h-9" />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NEW CHAT SEARCH DIALOG */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setSearchOpen(false)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-sm rounded-2xl overflow-hidden border shadow-2xl flex flex-col h-[60vh] ${
                isDark ? "bg-[#1e1e1e] border-zinc-800 text-white" : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <div className={`p-3 flex items-center justify-between border-b ${isDark ? "border-zinc-850" : "border-gray-150"}`}>
                <h4 className="font-bold text-sm">New Message</h4>
                <button onClick={() => setSearchOpen(false)} className="hover:opacity-75"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDark ? "bg-black/30 border-zinc-850" : "bg-gray-100"}`}>
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search creators..."
                    className="bg-transparent text-xs border-none outline-none w-full"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {searchLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-xs">
                    {searchQuery ? "No users found" : "Type above to search creators..."}
                  </div>
                ) : (
                  searchResults.map(u => (
                    <button
                      key={u._id}
                      onClick={() => accessChat(u)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                        isDark ? "hover:bg-zinc-850" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-850 shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-bold">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{u.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">@{u.username}</p>
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
