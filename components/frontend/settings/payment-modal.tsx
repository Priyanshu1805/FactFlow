"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CreditCard, Lock, Loader2 } from "lucide-react"

interface PaymentModalProps {
  open: boolean
  plan: { id: string; name: string; amount: number; billing: string }
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ open, plan, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<"form" | "processing" | "done">("form")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardholderName, setCardholderName] = useState("")
  const [savedCards, setSavedCards] = useState<any[]>([])
  const [selectedMethodId, setSelectedMethodId] = useState<string>("")
  const [showNewCard, setShowNewCard] = useState(false)
  const [error, setError] = useState("")
  const [loadingCards, setLoadingCards] = useState(true)

  const token = typeof window !== "undefined" ? localStorage.getItem("factflow-auth-storage") : null
  const parsed = token ? (() => { try { return JSON.parse(token) } catch { return null } })() : null
  const jwt = parsed?.state?.user?.accessToken || parsed?.state?.user?.stsTokenManager?.accessToken

  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useState(() => {
    if (!open) return
    setStep("form")
    setError("")
    setShowNewCard(false)
    setCardNumber("")
    setExpiryMonth("")
    setExpiryYear("")
    setCvv("")
    setCardholderName("")

    if (!jwt) {
      setLoadingCards(false)
      setShowNewCard(true)
      return
    }

    fetch(`${api}/api/payment/methods`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Fetch failed")
        return r.json()
      })
      .then((d) => {
        if (d.success && d.paymentMethods?.length > 0) {
          setSavedCards(d.paymentMethods)
          const def = d.paymentMethods.find((pm: any) => pm.isDefault) || d.paymentMethods[0]
          setSelectedMethodId(def.methodId)
          setShowNewCard(false)
        } else {
          setShowNewCard(true)
        }
      })
      .catch(() => setShowNewCard(true))
      .finally(() => setLoadingCards(false))
  })

  const formatCard = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
  }

  const handlePay = async () => {
    if (!jwt) return

    if (showNewCard) {
      if (!cardNumber.replace(/\s/g, "") || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
        setError("Please fill all card fields")
        return
      }
      if (cardNumber.replace(/\s/g, "").length < 13) {
        setError("Invalid card number")
        return
      }
      if (!cvv || cvv.length < 3) {
        setError("Invalid CVV")
        return
      }
    }

    setError("")
    setStep("processing")

    try {
      let methodId = selectedMethodId

      if (showNewCard) {
        const addRes = await fetch(`${api}/api/payment/methods`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            cardNumber: cardNumber.replace(/\s/g, ""),
            expiryMonth: parseInt(expiryMonth, 10),
            expiryYear: parseInt(expiryYear, 10),
            cvv,
            cardholderName,
          }),
        })
        if (!addRes.ok) throw new Error("Fetch failed")
        const addData = await addRes.json()
        if (!addData.success) {
          setError(addData.error || "Failed to save card")
          setStep("form")
          return
        }
        methodId = addData.paymentMethod.methodId
      }

      const chargeRes = await fetch(`${api}/api/payment/charge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ tier: plan.id, billing: plan.billing, methodId }),
      })
      if (!chargeRes.ok) throw new Error("Fetch failed")
      const chargeData = await chargeRes.json()

      if (!chargeData.success) {
        setError(chargeData.error || "Payment failed")
        setStep("form")
        return
      }

      setStep("done")
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch {
      setError("Something went wrong")
      setStep("form")
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && step !== "processing") onClose() }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {step === "form" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-lg">Complete Payment</h2>
                  <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Plan</p>
                  <p className="text-white font-bold text-lg">{plan.name}</p>
                  <p className="text-yellow-400 font-bold text-xl mt-1">
                    ₹{plan.amount} <span className="text-gray-400 text-sm font-normal">/ {plan.billing === "yearly" ? "year" : "month"}</span>
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2.5 mb-4">
                    {error}
                  </div>
                )}

                {!loadingCards && savedCards.length > 0 && !showNewCard && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Saved Cards</p>
                    <div className="space-y-2">
                      {savedCards.map((card: any) => (
                        <label
                          key={card.methodId}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            selectedMethodId === card.methodId
                              ? "border-red-500/60 bg-red-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name="savedCard"
                            checked={selectedMethodId === card.methodId}
                            onChange={() => setSelectedMethodId(card.methodId)}
                            className="accent-red-500"
                          />
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-white text-sm font-semibold">
                              **** {card.lastFour}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Expires {card.expiryMonth}/{card.expiryYear}
                            </p>
                          </div>
                          {card.isDefault && (
                            <span className="text-xs text-red-400 font-semibold">Default</span>
                          )}
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => { setShowNewCard(true); setSelectedMethodId("") }}
                      className="text-red-400 text-sm mt-2 hover:text-red-300 transition-colors"
                    >
                      + Use a different card
                    </button>
                  </div>
                )}

                {(showNewCard || savedCards.length === 0) && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Cardholder Name</label>
                      <input
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Card Number</label>
                      <input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCard(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Expiry</label>
                        <div className="flex gap-2">
                          <input
                            value={expiryMonth}
                            onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                            placeholder="MM"
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                          />
                          <span className="text-gray-500 self-center">/</span>
                          <input
                            value={expiryYear}
                            onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
                            placeholder="YY"
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">CVV</label>
                        <input
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="123"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={!jwt}
                  className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Pay ₹{plan.amount} — Subscribe to {plan.name}
                </button>

                <p className="text-gray-500 text-xs text-center mt-4">
                  Secured with 256-bit encryption. Your card details are safe.
                </p>
              </div>
            )}

            {step === "processing" && (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="text-white font-bold text-lg mb-1">Processing Payment...</p>
                <p className="text-gray-400 text-sm">Please wait while we process your payment securely.</p>
              </div>
            )}

            {step === "done" && (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white font-bold text-lg mb-1">Payment Successful!</p>
                <p className="text-gray-400 text-sm">Your {plan.name} plan is now active.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
