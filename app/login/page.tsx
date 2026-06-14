"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Mail, Lock, ArrowRight, User as UserIcon, Eye, EyeOff, CheckCircle2, XCircle, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { auth, googleProvider } from "@/lib/firebase"
import { 
  signInWithPopup, signInWithRedirect, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  updateProfile, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, sendPasswordResetEmail
} from "firebase/auth"
import { useAuthStore } from "@/store/auth-store"
import { useTheme } from "@/components/theme-provider"
import FastGhostCursor from "@/components/ui/fast-ghost-cursor"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function LoginPage() {
  // Common
  const [isSignUp, setIsSignUp] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"standard" | "magic" | "forgot">("standard")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Standard Auth Form (Email/Username/Password)
  const [identifier, setIdentifier] = useState("") // Login (Email/Username/Phone)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Sign up specifics
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
  const [countryCode, setCountryCode] = useState("+91")
  const [showCountryMenu, setShowCountryMenu] = useState(false)
  const [phone, setPhone] = useState("")

  const countries = [
    { code: "+91", flag: "🇮🇳" },
    { code: "+1", flag: "🇺🇸" },
    { code: "+44", flag: "🇬🇧" },
    { code: "+61", flag: "🇦🇺" },
    { code: "+81", flag: "🇯🇵" },
    { code: "+971", flag: "🇦🇪" },
    { code: "+92", flag: "🇵🇰" },
    { code: "+880", flag: "🇧🇩" },
  ]

  // Magic Link Auth
  const [magicEmail, setMagicEmail] = useState("")
  const [magicSent, setMagicSent] = useState(false)

  // Forgot Password Auth
  const [resetEmail, setResetEmail] = useState("")

  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const { theme } = useTheme()
  const isDark = theme !== "light"

  // Check for Magic Link and Google Redirect on Mount
  useEffect(() => {
    // 1. Handle Google Redirect Result
    getRedirectResult(auth).then(async (result) => {
      if (result && result.user) {
        setIsLoading(true)
        try {
          const profileRes = await fetch(`${API}/users/profile?firebaseUid=${result.user.uid}&email=${result.user.email}&name=${encodeURIComponent(result.user.displayName || "")}`)
          const profileData = await profileRes.json()
          const mongoUser = profileData.success ? profileData.user : {}

          setUser({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || mongoUser.name || "",
            photoURL: result.user.photoURL || mongoUser.avatar || "",
            _id: mongoUser._id,
            id: mongoUser._id,
            username: mongoUser.username,
            role: mongoUser.role
          })
          router.push("/")
        } catch (err: any) {
          setError("Google login redirect failed: " + err.message)
        } finally {
          setIsLoading(false)
        }
      }
    }).catch(err => {
      setError("Google sign in failed: " + err.message)
    })

    // 2. Handle Magic Link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let savedEmail = window.localStorage.getItem("emailForSignIn")
      if (!savedEmail) {
        savedEmail = window.prompt("Please provide your email for confirmation")
      }
      if (savedEmail) {
        setIsLoading(true)
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem("emailForSignIn")
            // Create/Update profile in MongoDB
            const profileRes = await fetch(`${API}/users/profile?firebaseUid=${result.user.uid}&email=${result.user.email}&name=${encodeURIComponent(result.user.displayName || "")}`)
            const profileData = await profileRes.json()
            const mongoUser = profileData.success ? profileData.user : {}
            
            setUser({
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName || mongoUser.name || "",
              photoURL: result.user.photoURL || mongoUser.avatar || "",
              _id: mongoUser._id,
              id: mongoUser._id,
              username: mongoUser.username,
              role: mongoUser.role
            })
            router.push("/")
          })
          .catch((err) => {
            setError("Error signing in with magic link: " + err.message)
            setIsLoading(false)
          })
      }
    }
  }, [router, setUser])

  // Live Username Availability Check
  useEffect(() => {
    if (!isSignUp || !username) {
      setUsernameStatus("idle")
      return
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("checking")
      try {
        const res = await fetch(`${API}/users/check-username`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username })
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Profile check failed");
        }
        const data = await res.json()
        setUsernameStatus(data.available ? "available" : "taken")
      } catch {
        setUsernameStatus("idle")
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username, isSignUp])

  // Keep Name state update separate
  const handleNameChange = (val: string) => {
    setName(val)
  }

  const handleUsernameChange = (val: string) => {
    let cleaned = val.replace(/[^A-Za-z0-9_]/g, '')
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
    }
    setUsername(cleaned)
    
    if (cleaned.length > 2) {
      const s1 = cleaned + Math.floor(10 + Math.random() * 90)
      const s2 = cleaned + Math.floor(100 + Math.random() * 900)
      setUsernameSuggestions([s1, s2])
    } else {
      setUsernameSuggestions([])
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true); setError("")
    try {
      // Always try popup first (even on mobile) to avoid cross-site tracking cookie drops which break signInWithRedirect
      // Fallback to redirect is already handled in the catch block below if popup is blocked
      const result = await signInWithPopup(auth, googleProvider)
      const profileRes = await fetch(`${API}/users/profile?firebaseUid=${result.user.uid}&email=${result.user.email}&name=${encodeURIComponent(result.user.displayName || "")}`)
      const profileData = await profileRes.json()
      const mongoUser = profileData.success ? profileData.user : {}

      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || mongoUser.name || "",
        photoURL: result.user.photoURL || mongoUser.avatar || "",
        _id: mongoUser._id,
        id: mongoUser._id,
        username: mongoUser.username,
        role: mongoUser.role
      })
      router.push("/")
    } catch (err: any) {
      if (err.code === "auth/invalid-api-key") setError("Firebase API Key is missing!")
      else if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user" || err.code === "auth/internal-error") {
        // Fallback to redirect if popup fails for any reason
        await signInWithRedirect(auth, googleProvider)
      }
      else setError("Google login failed. " + err.message)
      setIsLoading(false)
    }
  }

  // --- STANDARD AUTH (Email/Username/Phone + Password) ---
  const handleStandardAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setError("")

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    try {
      if (isSignUp) {
        // Sign Up Flow
        if (!username) throw new Error("Username is required")
        if (!phone) throw new Error("Phone number is required")
        if (!email.includes("@")) throw new Error("Invalid email format")

        // Password Validation
        if (password.length < 8) throw new Error("Password must be at least 8 characters long.")
        if (!/^[A-Z]/.test(password)) throw new Error("The first character of the password must be a capital letter.")
        if (!/[0-9]/.test(password)) throw new Error("Password must contain at least 1 number.")
        if (!/[^A-Za-z0-9]/.test(password)) throw new Error("Password must contain at least 1 special character.")

        // 1. Check Username
        const checkRes = await fetch(`${API}/users/check-username`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username })
        })
        if (!checkRes.ok) {
          const errData = await checkRes.json().catch(() => ({}));
          throw new Error(errData.error || "Username check failed");
        }
        const checkData = await checkRes.json()
        if (!checkData.success || !checkData.available) {
          throw new Error("Username is already taken.")
        }

        // 2. Create Firebase Auth User
        const result = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(result.user, { displayName: name })
        
        // 3. Create MongoDB Profile
        const fullPhone = countryCode + phone
        const profileRes = await fetch(`${API}/users/profile?firebaseUid=${result.user.uid}&email=${email}&name=${encodeURIComponent(name)}&username=${encodeURIComponent(username)}&phone=${encodeURIComponent(fullPhone)}`)
        if (!profileRes.ok) {
          const errData = await profileRes.json().catch(() => ({}));
          throw new Error(errData.error || "Profile setup failed");
        }
        const profileData = await profileRes.json()
        if (!profileData.success) {
          throw new Error("Failed to create profile: " + profileData.error)
        }

        setUser({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || name || profileData.user.name || "",
          photoURL: result.user.photoURL || profileData.user.avatar || "",
          _id: profileData.user._id,
          id: profileData.user._id,
          username: profileData.user.username,
          role: profileData.user.role
        })
        router.push("/")
      } else {
        // Login Flow
        let loginEmail = identifier
        
        // If it's not an email, lookup the email via our proxy
        if (!identifier.includes("@")) {
          const lookupRes = await fetch(`${API}/users/lookup`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier })
          })
          if (!lookupRes.ok) {
            let errorText = "User not found"
            try {
              const errData = await lookupRes.json()
              if (errData.error) errorText = errData.error
            } catch (e) {
              errorText = `Server returned ${lookupRes.status}`
            }
            throw new Error(`Lookup failed: ${errorText}`)
          }
          
          const lookupData = await lookupRes.json()
          if (!lookupData.success || !lookupData.email) {
            throw new Error("No account found for this username/phone.")
          }
          loginEmail = lookupData.email
        }

        // Login with resolved Email
        const result = await signInWithEmailAndPassword(auth, loginEmail, password)
        
        // Fetch MongoDB Profile during standard login
        const profileRes = await fetch(`${API}/users/profile?firebaseUid=${result.user.uid}&email=${result.user.email}`)
        const profileData = await profileRes.json()
        
        if (!profileRes.ok || !profileData.success) {
          // Sign out from Firebase if Mongo profile is missing/corrupted to prevent glitches
          await auth.signOut()
          throw new Error("Profile synchronization failed. If you just signed up, your username or phone might already be in use by another account.")
        }
        const mongoUser = profileData.user

        setUser({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || mongoUser.name || "",
          photoURL: result.user.photoURL || mongoUser.avatar || "",
          _id: mongoUser._id,
          id: mongoUser._id,
          username: mongoUser.username,
          role: mongoUser.role
        })
        router.push("/")
      }
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") setError("Email already in use. Try logging in.")
      else if (err.code === "auth/invalid-credential") setError("Invalid credentials: The email/username or password you entered is incorrect, or you haven't signed up yet.")
      else setError("Authentication failed: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // --- MAGIC LINK AUTH ---
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!magicEmail) return setError("Please enter your email")
    setIsLoading(true); setError("")
    try {
      const actionCodeSettings = {
        url: window.location.origin + "/login",
        handleCodeInApp: true,
      }
      await sendSignInLinkToEmail(auth, magicEmail, actionCodeSettings)
      window.localStorage.setItem("emailForSignIn", magicEmail)
      setMagicSent(true)
    } catch (err: any) {
      setError("Failed to send magic link: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // --- FORGOT PASSWORD ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return setError("Please enter your email")
    setIsLoading(true); setError("")
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      setLoginMethod("standard")
      alert("Password reset link sent! Check your email.")
    } catch (err: any) {
      setError("Failed to send reset link: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative overflow-hidden flex items-center justify-center ${isDark ? "bg-black" : "bg-gray-50"}`}>
      
      {/* High-Performance Custom Ghost Cursor */}
      <FastGhostCursor />

      {/* Cinematic Background Elements */}
      {isDark && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse pointer-events-none will-change-opacity transform-gpu" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse pointer-events-none will-change-opacity transform-gpu" style={{ animationDelay: '2s' }} />
        </>
      )}

      {/* Grid Pattern */}
      <div className={`absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] ${!isDark && "invert"}`} />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* Left Side: Animated Welcome Text */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6 ${
              isDark ? "bg-white/10 text-white/80 border border-white/10" : "bg-black/5 text-black/80 border border-black/10"
            }`}>
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Next-Gen Media OS</span>
            </div>
            
            <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
              Welcome To <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                FACT FLOW
              </span>
            </h1>
            
            <p className={`text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 mb-8 ${isDark ? "text-white/[0.85]" : "text-gray-600"}`}>
              Your AI-powered social news operating system. Join the global network of minds, ideas, and breaking stories.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Glass Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className={`relative p-8 sm:p-10 rounded-3xl border backdrop-blur-xl ${
            isDark 
              ? "bg-white/5 border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]" 
              : "bg-white/80 border-gray-200 shadow-xl"
          }`}>
            
            {/* Glow effect around card in dark mode */}
            {isDark && (
              <div className="absolute inset-0 rounded-3xl border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] pointer-events-none" />
            )}

            <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              {isSignUp ? "Create an Account" : (loginMethod === "standard" ? "Log In" : loginMethod === "magic" ? "Passwordless Login" : "Reset Password")}
            </h2>
            <p className={`text-sm mb-6 ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
              {isSignUp ? "Join the Fact Flow network" : "Access your personalized AI dashboard"}
            </p>

            {error && (
              <div className="p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Login Method Tabs (Only show during Login) */}
            {!isSignUp && loginMethod !== "forgot" && (
              <div className={`flex p-1 mb-6 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                <button
                  onClick={() => setLoginMethod("standard")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    loginMethod === "standard" 
                      ? (isDark ? "bg-white/10 text-white shadow" : "bg-white text-gray-900 shadow") 
                      : (isDark ? "text-white/[0.85] hover:text-white" : "text-gray-500 hover:text-gray-900")
                  }`}
                >
                  Password
                </button>
                <button
                  onClick={() => setLoginMethod("magic")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    loginMethod === "magic" 
                      ? (isDark ? "bg-white/10 text-white shadow" : "bg-white text-gray-900 shadow") 
                      : (isDark ? "text-white/[0.85] hover:text-white" : "text-gray-500 hover:text-gray-900")
                  }`}
                >
                  Magic Link
                </button>
              </div>
            )}

            {loginMethod === "standard" ? (
              <>
                {/* Email / Username Auth Form */}
                <form onSubmit={handleStandardAuth} className="space-y-4 mb-6">
                  {isSignUp && (
                    <>
                      <div className="space-y-1">
                        <label className={`text-sm font-medium ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Full Name <span className="text-red-500">*</span></label>
                        <input
                          type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required
                          placeholder="User"
                          className={`w-full px-4 py-3 rounded-xl outline-none border transition-all ${
                            isDark ? "bg-white/5 border-white/10 focus:border-blue-500 text-white" : "bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={`text-sm font-medium ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Username <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-white/[0.85]" : "text-gray-400"}`} />
                          <input
                            type="text" value={username} onChange={(e) => handleUsernameChange(e.target.value)} required
                            placeholder="User123"
                            className={`w-full pl-10 pr-10 py-3 rounded-xl outline-none border transition-all ${
                              isDark 
                                ? usernameStatus === "available" ? "bg-green-500/10 border-green-500/50 text-white" : usernameStatus === "taken" ? "bg-red-500/10 border-red-500/50 text-white" : "bg-white/5 border-white/10 focus:border-blue-500 text-white" 
                                : usernameStatus === "available" ? "bg-green-50 border-green-500 text-gray-900" : usernameStatus === "taken" ? "bg-red-50 border-red-500 text-gray-900" : "bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {usernameStatus === "checking" && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                            {usernameStatus === "available" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            {usernameStatus === "taken" && <XCircle className="w-5 h-5 text-red-500" />}
                          </div>
                        </div>
                        {usernameStatus === "taken" && <p className="text-xs text-red-500 mt-1">This username is already taken.</p>}
                        {usernameStatus === "available" && <p className="text-xs text-green-500 mt-1">Username is available!</p>}
                        <p className={`text-[11px] mt-1 ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>First letter will be capital. Letters, numbers and underscores only.</p>
                        
                        {usernameSuggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {usernameSuggestions.map(s => (
                              <button
                                key={s} type="button"
                                onClick={() => { setUsername(s); setUsernameSuggestions([]); }}
                                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                  isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className={`text-sm font-medium ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Email <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-white/[0.85]" : "text-gray-400"}`} />
                          <input
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            placeholder="User@example.com"
                            className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none border transition-all ${
                              isDark ? "bg-white/5 border-white/10 focus:border-blue-500 text-white" : "bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                            }`}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className={`text-sm font-medium ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Phone <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowCountryMenu(!showCountryMenu)}
                              className={`w-[90px] h-full py-3 flex items-center justify-between px-3 rounded-xl outline-none border transition-all ${
                                isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900"
                              }`}
                            >
                              <span>{countries.find(c => c.code === countryCode)?.flag}</span>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showCountryMenu ? "rotate-180" : ""}`} />
                            </button>
                            
                            <AnimatePresence>
                              {showCountryMenu && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  transition={{ duration: 0.2, ease: "easeOut" }}
                                  className={`absolute top-full left-0 mt-2 w-[140px] rounded-xl border shadow-xl z-50 overflow-hidden ${
                                    isDark ? "bg-[#111] border-white/10" : "bg-white border-gray-200"
                                  }`}
                                >
                                  <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
                                    {countries.map(c => (
                                      <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => {
                                          setCountryCode(c.code)
                                          setShowCountryMenu(false)
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                                          isDark ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-gray-900"
                                        }`}
                                      >
                                        <span className="text-lg">{c.flag}</span>
                                        <span className="font-medium">{c.code}</span>
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <input
                            type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} required
                            placeholder="1234567890"
                            className={`flex-1 px-4 py-3 rounded-xl outline-none border transition-all ${
                              isDark ? "bg-white/5 border-white/10 focus:border-blue-500 text-white" : "bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                            }`}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {!isSignUp && (
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>
                        Email, Username or Phone
                      </label>
                      <div className="relative">
                        <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-white/[0.85]" : "text-gray-400"}`} />
                        <input
                          type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value.replace(/\s/g, ''))} required
                          placeholder="User123 or 1234..."
                          className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none border transition-all ${
                            isDark ? "bg-white/5 border-white/10 focus:border-blue-500 text-white" : "bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className={`text-sm font-medium ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-white/[0.85]" : "text-gray-400"}`} />
                      <input
                        type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                        placeholder={isSignUp ? "Abcxyz@1234" : "••••••••"}
                        className={`w-full pl-10 pr-12 py-3 rounded-xl outline-none border transition-all ${
                          isDark ? "bg-white/5 border-white/10 focus:border-blue-500 text-white" : "bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                        }`}
                      />
                      {password.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                            isDark ? "text-white/[0.85] hover:text-white" : "text-gray-400 hover:text-gray-900"
                          }`}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                    {!isSignUp && (
                      <div className="flex justify-end mt-1">
                        <button 
                          type="button" 
                          onClick={() => { setLoginMethod("forgot"); setError(""); }} 
                          className={`text-xs font-medium hover:underline transition-colors ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                    {isSignUp && (
                      <>
                        <p className={`text-[11px] mt-1.5 ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                          Example: Abcxyz@1234 (8+ chars, 1 Capital, 1 Number, 1 Special)
                        </p>
                        <div className="space-y-1 mt-4">
                          <label className={`text-sm font-medium ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Confirm Password <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-white/[0.85]" : "text-gray-400"}`} />
                            <input
                              type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                              placeholder="••••••••"
                              className={`w-full pl-10 pr-12 py-3 rounded-xl outline-none border transition-all ${
                                isDark ? "bg-white/5 border-white/10 focus:border-blue-500 text-white" : "bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                              }`}
                            />
                            {confirmPassword.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                                  isDark ? "text-white/[0.85] hover:text-white" : "text-gray-400 hover:text-gray-900"
                                }`}
                              >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn w-full mt-2"
                  >
                    <span>
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {isSignUp ? "Sign Up" : "Log In"} <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* Social Logins divider */}
                <div className={`relative flex items-center justify-center mb-6`}>
                  <div className={`absolute inset-0 flex items-center`}><div className={`w-full border-t ${isDark ? "border-white/10" : "border-gray-200"}`}></div></div>
                  <div className={`relative px-4 text-xs uppercase tracking-wider ${isDark ? "bg-[#0a0a0a] text-white/[0.85]" : "bg-white text-gray-400"}`}>Or continue with</div>
                </div>

                {/* Social Logins */}
                <div className="flex gap-3 mb-6">
                  <button onClick={handleGoogleLogin} disabled={isLoading} className={`w-full flex justify-center items-center py-3 rounded-xl border transition-all ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-gray-200 hover:bg-gray-50"}`}>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
                    Continue with Google
                  </button>
                </div>
              </>
            ) : loginMethod === "magic" ? (
              <>
                {/* Magic Link Auth Form */}
                {!magicSent ? (
                  <form onSubmit={handleSendMagicLink} className="space-y-4 mb-6">
                    <div className="space-y-1">
                      <label className={`text-sm font-medium ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Email Address</label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-white/[0.85]" : "text-gray-400"}`} />
                        <input
                          type="email" value={magicEmail} onChange={(e) => setMagicEmail(e.target.value)} required
                          placeholder="john@example.com"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none border transition-all ${
                            isDark ? "bg-white/5 border-white/10 focus:border-blue-500 text-white" : "bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                          }`}
                        />
                      </div>
                      <p className={`text-xs mt-2 ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>We will send you a secure login link.</p>
                    </div>
                    <button
                      type="submit" disabled={isLoading}
                      className="btn w-full mt-2"
                    >
                      <span>
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Send Magic Link"}
                      </span>
                    </button>
                  </form>
                ) : (
                  <div className="text-center mb-6 space-y-4">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Check your email</h3>
                    <p className={`text-sm ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
                      We've sent a magic link to <br/>
                      <span className="font-medium text-blue-500">{magicEmail}</span>
                    </p>
                    <p className={`text-xs mt-4 ${isDark ? "text-white/[0.85]" : "text-gray-400"}`}>
                      Click the link in the email to sign in instantly.
                    </p>
                    <button 
                      type="button" onClick={() => setMagicSent(false)}
                      className={`mt-4 w-full py-2 text-sm ${isDark ? "text-white/[0.85] hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                    >
                      Use a different email
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Forgot Password Form */}
                <form onSubmit={handleResetPassword} className="space-y-4 mb-6">
                  <div className="space-y-1">
                    <label className={`text-sm font-medium ${isDark ? "text-white/[0.85]" : "text-gray-700"}`}>Email Address</label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-white/[0.85]" : "text-gray-400"}`} />
                      <input
                        type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required
                        placeholder="john@example.com"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none border transition-all ${
                          isDark ? "bg-white/5 border-white/10 focus:border-blue-500 text-white" : "bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900"
                        }`}
                      />
                    </div>
                    <p className={`text-xs mt-2 ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>Enter your email to receive a password reset link.</p>
                  </div>
                  <button
                    type="submit" disabled={isLoading}
                    className="btn w-full mt-2"
                  >
                    <span>
                      {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Reset Password"}
                    </span>
                  </button>
                  <button 
                    type="button" onClick={() => setLoginMethod("standard")}
                    className={`mt-4 w-full py-2 text-sm ${isDark ? "text-white/[0.85] hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    Back to Login
                  </button>
                </form>
              </>
            )}

            <p className={`text-center text-sm ${isDark ? "text-white/[0.85]" : "text-gray-500"}`}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"} {" "}
              <button 
                onClick={() => {
                  setIsSignUp(!isSignUp); 
                  setLoginMethod("standard"); 
                  setError(""); 
                }} 
                className="text-blue-500 hover:underline font-medium"
              >
                {isSignUp ? "Log In" : "Sign up"}
              </button>
            </p>

          </div>
        </motion.div>
      </div>
    </div>
  )
}
