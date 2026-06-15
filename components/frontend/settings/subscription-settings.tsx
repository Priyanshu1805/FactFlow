"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, Zap, Crown, Star, AlertCircle, X, Loader2, FileText, Trash2, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: Star,
    color: "border-gray-200 dark:border-white/10",
    bg: "bg-white dark:bg-white/[0.02]",
    badge: null,
    features: [
      "Latest news updates",
      "Basic reels feed",
      "5 categories only",
      "Standard ads",
      "Web access only",
    ],
    disabled: ["Ad-free experience", "Premium articles", "Offline reading", "Priority support"],
  },
  {
    id: "weekly",
    name: "Weekly Pass",
    price: "₹15",
    period: "per week",
    icon: Zap,
    color: "border-blue-500/50",
    bg: "bg-blue-50/50 dark:bg-blue-500/[0.03]",
    badge: null,
    features: [
      "Ad-free experience",
      "All categories (15+)",
      "Premium articles",
      "Standard layout",
      "Great for short trials",
    ],
    disabled: ["Offline reading", "Priority support"],
  },
  {
    id: "monthly",
    name: "Monthly Pro",
    price: "₹99",
    period: "per month",
    icon: Zap,
    color: "border-red-500/50",
    bg: "bg-red-50/50 dark:bg-red-500/[0.03]",
    badge: "Most Popular",
    features: [
      "Everything in Weekly",
      "Offline reading",
      "HD reels feed",
      "Breaking news SMS/alerts",
      "Mobile + Web",
    ],
    disabled: ["Custom news digest", "Priority support"],
  },
  {
    id: "yearly",
    name: "Yearly Premium",
    price: "₹399",
    period: "per year",
    icon: Crown,
    color: "border-yellow-500/50",
    bg: "bg-yellow-50/50 dark:bg-yellow-500/[0.03]",
    badge: "Best Value",
    features: [
      "Everything in Monthly",
      "Custom weekly news digest",
      "Multi-device sync",
      "Priority customer support",
      "No ads ever",
    ],
    disabled: [],
  },
]

interface SubscriptionData {
  tier: string
  validUntil: string | null
  isValid: boolean
  email?: string
  name?: string
  billingCycle?: string
  amount?: number
  paymentMethod?: string
}

interface BillingRecord {
  _id: string
  createdAt: string
  plan: string
  billingCycle: string
  amount: number
  status: string
}

export function SubscriptionSettings() {
  const { user } = useAuthStore()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [paymentPlan, setPaymentPlan] = useState<{ id: string; name: string; amount: number; billing: string } | null>(null)

  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([])
  const [showBillingHistory, setShowBillingHistory] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceData, setInvoiceData] = useState<BillingRecord | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  const token = (user as any)?.accessToken || (user as any)?.stsTokenManager?.accessToken
  const api = process.env.NEXT_PUBLIC_API_URL || ""

  const fetchSubscription = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${api}/api/subscription/me?firebaseUid=${user?.uid}`)
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success && data.data) {
        setSubscription({
          ...data.data,
          tier: data.data.plan || "free",
          validUntil: data.data.endDate || null,
          isValid: data.data.status === "active",
        })
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [token, api])

  const fetchBillingHistory = useCallback(async () => {
    if (!token) return
    setHistoryLoading(true)
    try {
      const res = await fetch(`${api}/api/subscription/billing-history?firebaseUid=${user?.uid}`)
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        setBillingHistory(data.data || [])
      }
    } catch {
    } finally {
      setHistoryLoading(false)
    }
  }, [token, api])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  useEffect(() => {
    const s = document.createElement("script")
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])

  const handleUpgradeClick = async (planId: string) => {
    if (!user) {
      toast.error("Please login to subscribe")
      return
    }
    const plan = PLANS.find((p) => p.id === planId)
    if (!plan) return
    
    setSubscribing(planId)
    
    try {
      const res = await fetch(`${api}/api/subscription/create-order?firebaseUid=${user.uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ plan: planId, billingCycle: billing, coupon: "" }),
      })
      
      const orderData = await res.json()
      if (!orderData.success) throw new Error(orderData.error || "Failed to create order")
      
      const options = {
        key: orderData.data.keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        order_id: orderData.data.orderId,
        name: "Fact Flow News",
        description: `${plan.name} Plan — ${billing}`,
        theme: { color: "#ef4444" },
        handler: async (response: any) => {
          const verifyRes = await fetch(`${api}/api/subscription/verify-payment?firebaseUid=${user.uid}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...response,
              plan: planId,
              billingCycle: billing,
              paymentMethod: "Razorpay Checkout",
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            toast.success("Subscription activated!")
            fetchSubscription()
            fetchBillingHistory()
          } else {
            toast.error(verifyData.error || "Payment verification failed")
          }
        },
      }
      
      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", () => {
        toast.error("Payment failed or cancelled")
      })
      rzp.open()
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
    } finally {
      setSubscribing(null)
    }
  }

  const handleCancel = async () => {
    setSubscribing("cancel")
    try {
      const res = await fetch(`${api}/api/subscription/cancel?firebaseUid=${user?.uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      })
      if (!res.ok) throw new Error("Fetch failed")
      const data = await res.json()
      if (data.success) {
        toast.success("Subscription cancelled")
        fetchSubscription()
        setShowCancelModal(false)
      } else {
        toast.error(data.error || "Failed to cancel")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubscribing(null)
    }
  }

  const openInvoice = (record: BillingRecord) => {
    setInvoiceData(record)
    setShowInvoiceModal(true)
  }

  const currentTier = subscription?.tier || "free"
  const validUntil = subscription?.validUntil ? new Date(subscription.validUntil) : null
  const isPaid = currentTier !== "free"

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Subscription Plans</h2>
          <p className="text-gray-600 dark:text-white/[0.85] text-sm">Manage your current plan, billing history, and invoices.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl gap-1 shrink-0">
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                billing === b
                  ? "bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {b}
              {b === "yearly" && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md ${billing === b ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500"}`}>-20%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : (
        <>
          {/* COMPACT PRICING PLANS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const Icon = plan.icon
                const isActive = currentTier === plan.id
                const yearlyPrice = plan.price !== "₹0"
                  ? `₹${Math.round(parseInt(plan.price.replace("₹", "")) * 12 * 0.8)}`
                  : "₹0"

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border p-5 transition-all duration-300 flex flex-col ${plan.color} ${plan.bg} ${isActive ? "ring-1 ring-red-500/50 shadow-md" : "hover:border-gray-300 dark:hover:border-white/30"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${
                          plan.id === "premium" ? "text-yellow-500" : plan.id === "pro" ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                        }`} />
                        <span className="text-gray-900 dark:text-white font-bold text-sm">{plan.name}</span>
                        {plan.badge && (
                          <span className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded-md ${
                            plan.id === "pro" 
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.3)] dark:shadow-[0_0_8px_rgba(239,68,68,0.5)] drop-shadow-[0_0_2px_rgba(239,68,68,0.6)]" 
                              : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 shadow-[0_0_8px_rgba(234,179,8,0.3)] dark:shadow-[0_0_8px_rgba(234,179,8,0.5)] drop-shadow-[0_0_2px_rgba(234,179,8,0.6)]"
                          }`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 font-bold uppercase tracking-wider border border-green-200 dark:border-green-500/20">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {billing === "yearly" ? yearlyPrice : plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-white/60 text-[10px] ml-1 font-medium">
                        {billing === "yearly" && plan.price !== "₹0" ? "/yr" : `/${plan.period}`}
                      </span>
                    </div>

                    <ul className="space-y-1.5 mb-5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-[11px] font-medium text-gray-700 dark:text-gray-300 leading-tight">
                          <Check className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {plan.disabled.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-[11px] font-medium text-gray-400 dark:text-white/30 line-through leading-tight">
                          <X className="w-3 h-3 text-gray-300 dark:text-white/20 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgradeClick(plan.id)}
                      disabled={plan.id === "free" || isActive || subscribing !== null}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all disabled:cursor-default mt-auto ${
                        isActive
                          ? "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                          : plan.id === "free"
                          ? "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 cursor-default"
                          : subscribing === plan.id
                          ? "bg-red-500/50 text-white cursor-wait"
                          : plan.id === "premium"
                          ? "bg-yellow-400 hover:bg-yellow-500 text-black shadow-sm"
                          : "bg-red-500 hover:bg-red-600 text-white shadow-sm"
                      }`}
                    >
                      {subscribing === plan.id ? (
                        <span className="flex items-center justify-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" /> ...
                        </span>
                      ) : isActive ? (
                        "Current"
                      ) : plan.id === "free" ? (
                        "Free Forever"
                      ) : (
                        `Upgrade`
                      )}
                    </button>
                  </div>
                )
              })}
          </div>

          {/* DASHBOARD GRID: Info & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Billing Info */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[20px] p-6 shadow-sm">
              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">Billing Details</h3>
              <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-5">Your current subscription summary</p>
              
              {currentTier === "free" ? (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl text-gray-600 dark:text-gray-400 text-sm border border-gray-100 dark:border-white/5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-gray-400" />
                  No active subscription. Choose a plan from above to manage billing.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/50 font-bold mb-1">Status</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Active
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/50 font-bold mb-1">Cycle</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{subscription?.billingCycle || "Monthly"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/50 font-bold mb-1">Next Billing</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{validUntil?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/50 font-bold mb-1">Amount</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">₹{subscription?.amount || 0}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[20px] p-6 shadow-sm flex flex-col">
              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">Manage Plan</h3>
              <p className="text-gray-600 dark:text-white/[0.85] text-xs mb-5">Access your invoices or cancel your plan</p>
              
              <div className="grid grid-cols-2 gap-4 flex-1">
                <button
                  onClick={() => { fetchBillingHistory(); setShowBillingHistory(true); }}
                  className="group flex flex-col items-center justify-center gap-3 p-5 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-900 dark:text-white rounded-xl transition-all border border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold">Invoices & History</span>
                </button>
                
                {isPaid ? (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="group flex flex-col items-center justify-center gap-3 p-5 bg-gray-50 dark:bg-white/[0.03] hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all border border-gray-100 dark:border-white/5 hover:border-red-200 dark:hover:border-red-500/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">Cancel Plan</span>
                  </button>
                ) : (
                   <div className="flex flex-col items-center justify-center gap-3 p-5 bg-gray-50 dark:bg-white/[0.02] text-gray-400 dark:text-white/20 rounded-xl border border-gray-100 dark:border-white/5 cursor-not-allowed">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">Cancel Plan</span>
                  </div>
                )}
              </div>
            </div>
            
          </div>



          {/* ── Cancel Confirmation Modal ── */}
          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center mx-auto mb-5">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-gray-900 dark:text-white font-black text-xl mb-2">Cancel Subscription?</h3>
                <p className="text-gray-500 dark:text-white/60 text-sm mb-1">Your premium access continues until</p>
                <p className="text-red-500 font-bold text-lg mb-6">{validUntil?.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) || "end of billing period"}</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={subscribing === "cancel"}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-all"
                  >
                    {subscribing === "cancel" ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Yes, Cancel"}
                  </button>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-900 dark:text-white py-3 rounded-xl font-bold text-sm transition-all"
                  >
                    Keep Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Billing History Modal ── */}
          {showBillingHistory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Billing History
                  </h3>
                  <button onClick={() => setShowBillingHistory(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 p-2 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  ) : billingHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/10">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-bold text-lg mb-1">No Invoices</p>
                      <p className="text-gray-500 text-sm">You haven't made any payments yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {billingHistory.map((record) => (
                        <div key={record._id} className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => openInvoice(record)}>
                          <div>
                            <p className="text-gray-900 dark:text-white text-sm font-bold capitalize">{record.plan} Plan</p>
                            <p className="text-gray-500 dark:text-white/60 text-xs mt-0.5">
                              {new Date(record.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              {" • "}
                              {record.billingCycle}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-gray-900 dark:text-white font-bold block">₹{record.amount}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-500">Paid</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Invoice Modal ── */}
          {showInvoiceModal && invoiceData && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-blue-500"></div>
                <div className="flex justify-between items-start mb-6 mt-2">
                  <div>
                    <span className="text-gray-900 dark:text-white text-2xl font-black tracking-tight">Fact Flow</span>
                    <p className="text-gray-500 text-xs mt-1 uppercase font-semibold tracking-wider">Invoice / Receipt</p>
                  </div>
                  <button onClick={() => setShowInvoiceModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 p-2 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="border-t border-b border-gray-100 dark:border-white/10 py-4 mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Date Paid</p>
                    <p className="text-gray-900 dark:text-white text-sm font-semibold">{new Date(invoiceData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Txn ID</p>
                    <p className="text-gray-900 dark:text-white text-xs font-mono">{invoiceData._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    ["Plan", `${invoiceData.plan.toUpperCase()} (${invoiceData.billingCycle})`],
                    ["Amount", `₹${invoiceData.amount}`],
                    ["GST (18%)", `₹${Math.round(invoiceData.amount * 0.18)}`],
                  ].map(([k, v]) => (
                    <div key={k} className={`flex justify-between`}>
                      <span className="text-sm font-medium text-gray-500">{k}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/10">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Total Paid</span>
                    <span className="text-2xl font-black text-green-600 dark:text-green-500">₹{Math.round(invoiceData.amount * 1.18)}</span>
                  </div>
                </div>
                
                <button className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2">
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
