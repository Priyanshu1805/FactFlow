"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────
type Plan = "free" | "weekly" | "monthly" | "yearly";
type Popup = "expiring" | "expired" | "failed" | "success" | null;

interface SubData {
    plan: Plan;
    status: string;
    billingCycle?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    amount?: number;
    daysLeft?: number;
}

interface PaymentRecord {
    _id: string;
    createdAt: string;
    plan: string;
    billingCycle: string;
    amount: number;
    status: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

const PLAN_PRICES: Record<string, number> = {
    weekly: 15,
    monthly: 99,
    yearly: 399,
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function authHeader(): Record<string, string> {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token") ?? sessionStorage.getItem("token")
            : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
    const res = await fetch(`${API}${path}`, {
        headers: { "Content-Type": "application/json", ...authHeader() },
        ...opts,
    });
    const text = await res.text();
    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        throw new Error(res.ok ? "Invalid JSON response" : `Server Error: ${text.substring(0, 50)}`);
    }
    if (!res.ok || !json.success) throw new Error(json.error ?? "Request failed");
    return json.data ?? json;
}

function calcFinal(plan: Plan, coupon: string): number {
    if (plan === "free") return 0;
    let base = PLAN_PRICES[plan] ?? 0;
    const code = coupon.trim().toUpperCase();
    if (code === "GLOW20") base = Math.round(base * 0.8);
    if (code === "WELCOME") base = Math.max(0, base - 50);
    return base;
}

// ─── Confetti Component ─────────────────────────────────────────────────────
function Confetti() {
    const colors = ["#e84118", "#f0a500", "#2ecc71", "#3498db", "#9b59b6"];
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {Array.from({ length: 28 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 rounded-sm opacity-0"
                    style={{
                        left: `${Math.random() * 100}%`,
                        background: colors[i % colors.length],
                        animation: `confettiFall ${2 + Math.random() * 2}s ${Math.random() * 1.5}s linear forwards`,
                    }}
                />
            ))}
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function SubscriptionPage() {
    const router = useRouter();

    // Plan state
    const [sub, setSub] = useState<SubData>({ plan: "free", status: "inactive" });
    const [history, setHistory] = useState<PaymentRecord[]>([]);

    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [upgradePlan, setUpgradePlan] = useState<Plan>("monthly");
    const [payStep, setPayStep] = useState(1);
    const [coupon, setCoupon] = useState("");
    const [couponState, setCouponState] = useState<"idle" | "valid" | "invalid">("idle");
    const [paying, setPaying] = useState(false);
    const [txnId, setTxnId] = useState("");

    // Other UI state
    const [popup, setPopup] = useState<Popup>(null);
    const [showCancel, setShowCancel] = useState(false);
    const [showInvoice, setShowInvoice] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [nlEmail, setNlEmail] = useState("");
    const [nlPrefs, setNlPrefs] = useState({ morning: false, breaking: false, weekly: false });
    const [nlStatus, setNlStatus] = useState<"idle" | "success" | "error">("idle");
    const [showDemo, setShowDemo] = useState(false);

    // ─── Load subscription on mount ─────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch<SubData>("/subscription/me");
                setSub(data);
                if (data.daysLeft !== undefined && data.daysLeft <= 3 && data.status === "active") {
                    setPopup("expiring");
                }
                if (data.status === "expired") setPopup("expired");
            } catch {
                // not logged in or no sub — default free
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Load billing history when subscribed
    useEffect(() => {
        if (sub.plan !== "free") {
            apiFetch<PaymentRecord[]>("/subscription/billing-history")
                .then(setHistory)
                .catch(() => { });
        }
    }, [sub.plan]);

    // ─── Load Razorpay script ────────────────────────────────────────────────
    useEffect(() => {
        const s = document.createElement("script");
        // Using staging script. To go live, remove "-stage"
        s.src = "https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/" + (process.env.NEXT_PUBLIC_PAYTM_MID || "YOUR_TEST_MID") + ".js";
        document.body.appendChild(s);
        return () => { document.body.removeChild(s); };
    }, []);

    // ─── Open upgrade modal ──────────────────────────────────────────────────
    const openModal = (plan: Plan) => {
        setUpgradePlan(plan);
        setPayStep(1);
        setCoupon(""); setCouponState("idle");
        setShowModal(true);
    };

    // ─── Apply coupon ────────────────────────────────────────────────────────
    const applyCoupon = () => {
        const c = coupon.trim().toUpperCase();
        if (c === "GLOW20" || c === "WELCOME") setCouponState("valid");
        else setCouponState("invalid");
    };

    // ─── Handle payment via Paytm ─────────────────────────────────────────
    const handlePay = useCallback(async () => {
        setPaying(true);
        try {
            // 1. Create order on backend
            const orderData = await apiFetch<{
                orderId: string; txnToken: string; amount: number; mid: string;
            }>("/subscription/create-order", {
                method: "POST",
                body: JSON.stringify({ plan: upgradePlan, coupon }),
            });

            // 2. Open Paytm popup
            const config = {
                root: "",
                flow: "DEFAULT",
                data: {
                    orderId: orderData.orderId,
                    token: orderData.txnToken,
                    tokenType: "TXN_TOKEN",
                    amount: (orderData.amount / 100).toFixed(2),
                },
                handler: {
                    notifyMerchant: function(eventName: string, data: any) {
                        console.log("notifyMerchant handler function called", eventName, data);
                    },
                    transactionStatus: async function(paymentStatus: any) {
                        // @ts-ignore
                        window.Paytm.CheckoutJS.close();
                        
                        if (paymentStatus.STATUS === "TXN_SUCCESS") {
                            // 3. Verify on backend
                            const verifyData = await apiFetch<SubData>("/subscription/verify-payment", {
                                method: "POST",
                                body: JSON.stringify({
                                    paytm_order_id: paymentStatus.ORDERID,
                                    paytm_transaction_id: paymentStatus.TXNID,
                                    plan: upgradePlan,
                                    paymentMethod: "Paytm Checkout",
                                }),
                            });

                            setTxnId(paymentStatus.TXNID);
                            setSub(verifyData);
                            setPayStep(4);
                            setPaying(false);
                            setShowConfetti(true);
                            setTimeout(() => setShowConfetti(false), 4000);

                            // Refresh history
                            const h = await apiFetch<PaymentRecord[]>("/subscription/billing-history");
                            setHistory(h);

                            setTimeout(() => {
                                setShowModal(false);
                                setPopup("success");
                                setTimeout(() => setPopup(null), 4000);
                            }, 3000);
                        } else {
                            setPaying(false);
                            setPopup("failed");
                        }
                    }
                }
            };

            // @ts-ignore
            if (window.Paytm && window.Paytm.CheckoutJS) {
                // @ts-ignore
                window.Paytm.CheckoutJS.init(config).then(function onSuccess() {
                    // @ts-ignore
                    window.Paytm.CheckoutJS.invoke();
                }).catch(function onError(error: any) {
                    setPaying(false);
                    setPopup("failed");
                });
            } else {
                toast.error("Paytm script not loaded");
                setPaying(false);
            }
        } catch (err: any) {
            setPaying(false);
            setPopup("failed");
        }
    }, [upgradePlan, coupon]);

    // ─── Cancel subscription ─────────────────────────────────────────────────
    const cancelSub = async () => {
        try {
            await apiFetch("/subscription/cancel", { method: "POST" });
            setSub({ plan: "free", status: "inactive" });
            setShowCancel(false);
        } catch { }
    };

    // ─── Newsletter subscribe ────────────────────────────────────────────────
    const subscribeNL = async () => {
        try {
            await apiFetch("/subscription/newsletter", {
                method: "POST",
                body: JSON.stringify({ email: nlEmail, preferences: nlPrefs }),
            });
            setNlStatus("success");
        } catch { setNlStatus("error"); }
    };

    // ─── Demo controls ───────────────────────────────────────────────────────
    const demoSetPlan = (plan: Plan) => {
        const now = new Date();
        const end = new Date();
        end.setMonth(end.getMonth() + 1);
        setSub({
            plan, status: "active",
            billingCycle: plan,
            startDate: now.toLocaleDateString("en-IN"),
            endDate: end.toLocaleDateString("en-IN"),
            paymentMethod: "Visa •••• 4242",
            amount: plan === "weekly" ? 15 : plan === "monthly" ? 99 : 399,
            daysLeft: 30,
        });
    };

    // ─── Price helpers ───────────────────────────────────────────────────────
    const basePrice = upgradePlan === "free" ? 0 : PLAN_PRICES[upgradePlan];
    const finalPrice = calcFinal(upgradePlan, coupon);
    const discount = basePrice - finalPrice;

    // ─── Render ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#e84118] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            {/* Confetti */}
            {showConfetti && <Confetti />}

            {/* ── Popups ── */}

            {/* Expiring soon — bottom right toast */}
            {popup === "expiring" && (
                <div className="fixed bottom-6 right-6 z-50 w-72 bg-[#1a1a1a] border border-[#e84118] rounded-xl p-4">
                    <p className="font-semibold mb-1">⏰ Subscription expiring soon!</p>
                    <p className="text-sm text-gray-400 mb-3">Your {sub.plan} plan expires in {sub.daysLeft} days.</p>
                    <div className="flex gap-2">
                        <button onClick={() => { setPopup(null); openModal(sub.plan as Plan); }}
                            className="flex-1 bg-[#e84118] text-white text-sm py-2 rounded-lg font-semibold">Renew</button>
                        <button onClick={() => setPopup(null)}
                            className="flex-1 bg-[#333] text-gray-400 text-sm py-2 rounded-lg">Later</button>
                    </div>
                </div>
            )}

            {/* Expired — full screen blocking */}
            {popup === "expired" && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 max-w-sm w-full text-center">
                        <div className="text-5xl mb-4">😔</div>
                        <h2 className="text-2xl font-bold mb-2">Subscription Expired</h2>
                        <p className="text-gray-400 text-sm mb-6">You've lost access to premium features</p>
                        <button onClick={() => { setPopup(null); openModal("monthly"); }}
                            className="w-full bg-[#e84118] text-white py-3 rounded-xl font-semibold mb-3">Reactivate Plan</button>
                        <button onClick={() => setPopup(null)}
                            className="w-full bg-[#333] text-gray-400 py-2 rounded-xl text-sm">Continue with Free</button>
                    </div>
                </div>
            )}

            {/* Payment failed — top toast */}
            {popup === "failed" && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] border border-red-600 rounded-xl p-4 w-80">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-red-400">❌ Payment Failed</p>
                            <p className="text-sm text-gray-400 mt-1">Could not process payment. Try again.</p>
                        </div>
                        <button onClick={() => setPopup(null)} className="text-gray-500 text-lg leading-none">✕</button>
                    </div>
                    <button onClick={() => { setPopup(null); openModal(upgradePlan); }}
                        className="mt-3 w-full bg-[#e84118] text-white py-2 rounded-lg text-sm font-semibold">Retry Payment</button>
                </div>
            )}

            {/* Upgrade success — top right */}
            {popup === "success" && (
                <div className="fixed top-6 right-6 z-50 bg-[#1a3d2b] border border-green-500 rounded-xl p-4 w-72">
                    <p className="font-semibold text-green-400">🎉 Welcome to {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)}!</p>
                    <p className="text-sm text-gray-400 mt-1">Your account has been upgraded.</p>
                </div>
            )}

            {/* ── Main page ── */}
            <div className="min-h-screen bg-[#0d0d0d] text-white">

                {/* Inline keyframes */}
                <style>{`
          @keyframes confettiFall {
            0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
        `}</style>

                <div className="max-w-5xl mx-auto px-4 py-8">

                    {/* ── Plan banner ── */}
                    <div className={`rounded-xl px-5 py-4 mb-8 flex items-center justify-between border ${sub.plan === "premium" ? "border-yellow-600/40 bg-yellow-900/10"
                            : sub.plan === "pro" ? "border-orange-600/40 bg-orange-900/10"
                                : "border-gray-700 bg-gray-900/30"
                        }`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">
                                {sub.plan === "premium" ? "👑" : sub.plan === "pro" ? "⚡" : "⭐"}
                            </span>
                            <div>
                                <p className="font-semibold">
                                    {sub.plan === "free" && "You are on the Free Plan — Upgrade to unlock premium features"}
                                    {sub.plan === "pro" && `You are on the Pro Plan · Next billing: ${sub.endDate ?? "—"}`}
                                    {sub.plan === "premium" && "You are on the Premium Plan ✨"}
                                </p>
                                {sub.plan !== "free" && (
                                    <p className="text-xs text-gray-400 mt-0.5">Started: {sub.startDate}</p>
                                )}
                            </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${sub.plan !== "free" ? "bg-green-900 text-green-400" : "bg-gray-800 text-gray-400"
                            }`}>Active</span>
                    </div>

                    {/* ── Plan cards ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 mt-4">

                        {/* Free */}
                        <div className={`bg-[#1a1a1a] rounded-2xl p-6 border transition-all hover:scale-[1.02] flex flex-col ${sub.plan === "free" ? "border-gray-500" : "border-[#2a2a2a]"}`}>
                            <span className="text-3xl">⭐</span>
                            <h3 className="text-2xl font-bold mt-3 mb-2">Free</h3>
                            <p className="text-4xl font-bold mb-5">₹0 <span className="text-sm font-normal text-gray-400">/forever</span></p>
                            <div className="flex-1">
                                {["Latest news updates", "Basic reels feed", "5 categories only", "Standard ads"].map(f => (
                                    <p key={f} className="text-sm mb-2"><span className="text-green-400 mr-2">✓</span>{f}</p>
                                ))}
                                {["Ad-free experience", "Premium articles", "All categories (15+)"].map(f => (
                                    <p key={f} className="text-sm mb-2 line-through text-gray-600"><span className="mr-2">✓</span>{f}</p>
                                ))}
                            </div>
                            <button disabled className="w-full mt-5 bg-[#333] text-gray-500 py-3 rounded-xl font-semibold cursor-default">
                                {sub.plan === "free" ? "Current Plan" : "Free Tier"}
                            </button>
                        </div>

                        {/* Weekly */}
                        <div className={`bg-[#1a1a1a] rounded-2xl p-6 border transition-all hover:scale-[1.02] flex flex-col relative ${sub.plan === "weekly" ? "border-[#3498db] shadow-[0_0_20px_rgba(52,152,219,0.15)]" : "border-[#2a2a2a] hover:border-[#3498db]"}`}>
                            <span className="text-3xl">🚀</span>
                            <h3 className="text-2xl font-bold mt-3 mb-1 text-[#3498db]">Weekly Pass</h3>
                            <p className="text-4xl font-bold text-[#3498db]">₹{PLAN_PRICES.weekly} <span className="text-sm font-normal text-gray-400">/week</span></p>
                            <div className="mt-4 flex-1">
                                {["Ad-free experience", "All categories (15+)", "Premium articles", "Great for short trials"].map(f => (
                                    <p key={f} className="text-sm mb-2"><span className="text-green-400 mr-2">✓</span>{f}</p>
                                ))}
                            </div>
                            <button onClick={() => openModal("weekly")} disabled={sub.plan === "weekly" || sub.plan === "monthly" || sub.plan === "yearly"} className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all ${sub.plan === "weekly" || sub.plan === "monthly" || sub.plan === "yearly" ? "bg-[#333] text-gray-500 cursor-default" : "bg-[#3498db] hover:bg-[#2980b9] text-white"}`}>
                                {sub.plan === "weekly" ? "Current Plan" : sub.plan === "monthly" || sub.plan === "yearly" ? "Included in Plan" : "Get Weekly Pass"}
                            </button>
                        </div>

                        {/* Monthly */}
                        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#e84118] shadow-[0_0_20px_rgba(232,65,24,0.15)] hover:shadow-[0_0_30px_rgba(232,65,24,0.3)] hover:scale-[1.02] transition-all flex flex-col relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e84118] text-white text-xs px-3 py-1 rounded-full font-semibold">Most Popular</div>
                            <span className="text-3xl">⚡</span>
                            <h3 className="text-2xl font-bold mt-3 mb-1 text-[#e84118]">Monthly Pro</h3>
                            <p className="text-4xl font-bold text-[#e84118]">₹{PLAN_PRICES.monthly} <span className="text-sm font-normal text-gray-400">/month</span></p>
                            <div className="mt-4 flex-1">
                                {["Everything in Weekly", "Billed Monthly", "Cancel anytime"].map(f => (
                                    <p key={f} className="text-sm mb-2"><span className="text-green-400 mr-2">✓</span>{f}</p>
                                ))}
                            </div>
                            <button onClick={() => openModal("monthly")} disabled={sub.plan === "monthly" || sub.plan === "yearly"} className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all ${sub.plan === "monthly" || sub.plan === "yearly" ? "bg-[#333] text-gray-500 cursor-default" : "bg-[#e84118] hover:bg-[#c73510] text-white"}`}>
                                {sub.plan === "monthly" ? "Current Plan" : sub.plan === "yearly" ? "Included in Plan" : "Upgrade to Monthly"}
                            </button>
                        </div>

                        {/* Yearly */}
                        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-yellow-500/60 shadow-[0_0_20px_rgba(240,165,0,0.12)] hover:shadow-[0_0_30px_rgba(240,165,0,0.3)] hover:scale-[1.02] transition-all flex flex-col relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f0a500] text-black text-xs px-3 py-1 rounded-full font-semibold">Best Value</div>
                            <span className="text-3xl">👑</span>
                            <h3 className="text-2xl font-bold mt-3 mb-1 text-[#f0a500]">Yearly Premium</h3>
                            <p className="text-4xl font-bold text-[#f0a500]">₹{PLAN_PRICES.yearly} <span className="text-sm font-normal text-gray-400">/year</span></p>
                            <p className="text-xs text-green-400 mb-3">Save ₹789 compared to monthly!</p>
                            <div className="mt-4 flex-1">
                                {["Everything in Monthly", "Best Value", "Billed Yearly", "No ads ever"].map(f => (
                                    <p key={f} className="text-sm mb-2"><span className="text-green-400 mr-2">✓</span>{f}</p>
                                ))}
                            </div>
                            <button onClick={() => openModal("yearly")} disabled={sub.plan === "yearly"} className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all ${sub.plan === "yearly" ? "bg-[#333] text-gray-500 cursor-default" : "bg-[#f0a500] hover:bg-[#d99200] text-black"}`}>
                                {sub.plan === "yearly" ? "Current Plan" : "Upgrade to Yearly"}
                            </button>
                        </div>
                    </div>

                    {/* ── News access table ── */}
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-8">
                        <h3 className="font-semibold mb-4 text-gray-300">📰 News Access by Plan</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500">
                                        <th className="text-left py-2 pr-4">Feature</th>
                                        <th className="text-center py-2 px-3">Free</th>
                                        <th className="text-center py-2 px-3 text-[#3498db]">Weekly</th>
                                        <th className="text-center py-2 px-3 text-[#e84118]">Monthly</th>
                                        <th className="text-center py-2 px-3 text-[#f0a500]">Yearly</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ["Categories", "5 only", "All 15+", "All 15+", "All 15+"],
                                        ["Ad-Free", false, true, true, true],
                                        ["Premium Articles", false, true, true, true],
                                    ].map(([label, f, w, m, y]) => (
                                        <tr key={String(label)} className="border-t border-[#222]">
                                            <td className="py-2 pr-4 text-gray-300">{label}</td>
                                            {[f, w, m, y].map((v, i) => (
                                                <td key={i} className={`text-center py-2 px-3 ${[sub.plan === "free", sub.plan === "weekly", sub.plan === "monthly", sub.plan === "yearly"][i]
                                                        ? "bg-white/5 rounded"
                                                        : ""
                                                    }`}>
                                                    {typeof v === "boolean" ? (v ? "✅" : "❌") : <span className="text-gray-400">{v}</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Billing information ── */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">💳 Billing Information</h2>

                        {sub.plan === "free" ? (
                            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 text-gray-400 text-sm flex items-center gap-2">
                                <span>ℹ️</span> No active subscription. Upgrade a plan to manage billing.
                            </div>
                        ) : (
                            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                                    {[
                                        ["Plan", <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sub.plan === "premium" ? "bg-yellow-900 text-yellow-400" : "bg-orange-900 text-orange-400"}`}>{sub.plan.toUpperCase()}</span>],
                                        ["Billing Cycle", sub.billingCycle ?? "monthly"],
                                        ["Next Billing", sub.endDate ?? "—"],
                                        ["Amount", `₹${sub.amount ?? 0}`],
                                        ["Payment Method", sub.paymentMethod ?? "—"],
                                        ["Status", <span className="text-xs px-2 py-0.5 rounded-full bg-green-900 text-green-400 font-semibold">Active</span>],
                                    ].map(([k, v]) => (
                                        <div key={String(k)} className="bg-[#222] rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">{k}</p>
                                            <p className="text-sm font-medium">{v}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                        className="px-4 py-2 text-sm border border-[#333] rounded-lg text-gray-400 hover:border-gray-500 hover:text-white transition-all">
                                        Change Plan
                                    </button>
                                    <button onClick={() => setShowCancel(true)}
                                        className="px-4 py-2 text-sm border border-red-800 rounded-lg text-red-400 hover:border-red-500 transition-all">
                                        Cancel Subscription
                                    </button>
                                    <button onClick={() => setShowInvoice(true)}
                                        className="px-4 py-2 text-sm border border-[#333] rounded-lg text-gray-400 hover:border-gray-500 hover:text-white transition-all">
                                        Download Invoice
                                    </button>
                                    <button onClick={() => openModal(sub.plan as Plan)}
                                        className="px-4 py-2 text-sm border border-[#333] rounded-lg text-gray-400 hover:border-gray-500 hover:text-white transition-all">
                                        Update Payment Method
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Billing history */}
                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
                            <h3 className="font-semibold mb-4 text-gray-300">Billing History</h3>
                            {history.length === 0 ? (
                                <p className="text-gray-600 text-sm text-center py-4">No billing records yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-gray-500 border-b border-[#222]">
                                                <th className="text-left py-2">Date</th>
                                                <th className="text-left py-2">Plan</th>
                                                <th className="text-left py-2">Amount</th>
                                                <th className="text-left py-2">Status</th>
                                                <th className="text-left py-2">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map(h => (
                                                <tr key={h._id} className="border-t border-[#222] hover:bg-white/5">
                                                    <td className="py-2 text-gray-300">{new Date(h.createdAt).toLocaleDateString("en-IN")}</td>
                                                    <td className="py-2 text-gray-300">{h.plan} ({h.billingCycle})</td>
                                                    <td className="py-2 text-gray-300">₹{h.amount}</td>
                                                    <td className="py-2"><span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full">Paid ✅</span></td>
                                                    <td className="py-2">
                                                        <button onClick={() => setShowInvoice(true)}
                                                            className="text-xs border border-[#333] px-2 py-1 rounded-lg text-gray-400 hover:text-white hover:border-gray-500">
                                                            Download
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Newsletter ── */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">📬 Newsletter Subscription</h2>
                        <p className="text-gray-400 text-sm mb-5">Get daily news digest in your inbox — free forever</p>

                        {nlStatus !== "success" ? (
                            <div className="flex gap-3 mb-5">
                                <input
                                    type="email" placeholder="Enter your email" value={nlEmail}
                                    onChange={e => { setNlEmail(e.target.value); setNlStatus("idle"); }}
                                    className="flex-1 bg-[#222] border border-[#333] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#e84118] focus:shadow-[0_0_0_2px_rgba(232,65,24,0.2)] text-white placeholder-gray-600"
                                />
                                <button onClick={subscribeNL}
                                    className="bg-[#e84118] hover:bg-[#c73510] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all">
                                    Subscribe
                                </button>
                            </div>
                        ) : (
                            <div className="bg-green-900/30 border border-green-600 rounded-xl px-4 py-3 text-green-400 text-sm mb-5">
                                ✅ Successfully subscribed! Check your inbox.
                            </div>
                        )}
                        {nlStatus === "error" && <p className="text-red-400 text-xs -mt-3 mb-4">Please enter a valid email.</p>}

                        {[
                            { key: "morning" as const, label: "Daily Morning Digest", desc: "Top 10 stories every morning at 7 AM", minPlan: "free" },
                            { key: "breaking" as const, label: "Breaking News Alerts", desc: "Instant alerts for major breaking stories", minPlan: "pro" },
                            { key: "weekly" as const, label: "Weekly Trending Roundup", desc: "Best of the week, every Sunday", minPlan: "premium" },
                        ].map(({ key, label, desc, minPlan }) => {
                            const planOrder = ["free", "pro", "premium"];
                            const locked = planOrder.indexOf(sub.plan) < planOrder.indexOf(minPlan);
                            return (
                                <div
                                    key={key}
                                    onClick={() => !locked && setNlPrefs(p => ({ ...p, [key]: !p[key] }))}
                                    className={`flex items-start gap-3 p-4 bg-[#222] rounded-xl mb-2 transition-all ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#2a2a2a]"
                                        }`}>
                                    <input type="checkbox" checked={nlPrefs[key]} readOnly disabled={locked}
                                        className="mt-0.5 w-4 h-4 accent-[#e84118] flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            {label}
                                            {locked && (
                                                <span className="text-[10px] bg-[#333] text-gray-400 px-2 py-0.5 rounded-full">
                                                    🔒 {minPlan === "pro" ? "Pro" : "Premium"}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Demo panel ── */}
                    <div className="border border-dashed border-[#333] rounded-2xl p-5">
                        <button onClick={() => setShowDemo(!showDemo)}
                            className="w-full flex justify-between items-center text-gray-500 text-sm font-medium">
                            <span>🛠 Demo Controls (Development Only)</span>
                            <span>{showDemo ? "▲" : "▼"}</span>
                        </button>
                        {showDemo && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                                {[
                                    ["⏰ Expiring Soon", () => { demoSetPlan("pro"); setPopup("expiring"); }],
                                    ["😔 Expired", () => setPopup("expired")],
                                    ["❌ Payment Failed", () => setPopup("failed")],
                                    ["🎉 Success", () => { setShowConfetti(true); setPopup("success"); setTimeout(() => { setShowConfetti(false); setPopup(null); }, 4000); }],
                                    ["Reset → Free", () => setSub({ plan: "free", status: "inactive" })],
                                    ["Set → Pro", () => demoSetPlan("pro")],
                                    ["Set → Premium", () => demoSetPlan("premium")],
                                    ["Clear Popups", () => setPopup(null)],
                                ].map(([label, fn]) => (
                                    <button key={String(label)} onClick={fn as () => void}
                                        className="text-xs border border-[#333] text-gray-400 py-2 px-3 rounded-lg hover:border-gray-500 hover:text-white transition-all">
                                        {String(label)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ── Payment Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-40 bg-black/85 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto">

                        {/* Step 1 — Confirm */}
                        {payStep === 1 && (
                            <>
                                <h3 className="text-xl font-bold mb-5">Confirm Plan</h3>
                                <div className="bg-[#222] rounded-xl p-4 mb-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`text-lg font-bold ${upgradePlan === "yearly" ? "text-[#f0a500]" : upgradePlan === "weekly" ? "text-[#3498db]" : "text-[#e84118]"}`}>
                                            {upgradePlan === "yearly" ? "👑" : upgradePlan === "weekly" ? "🚀" : "⚡"} {upgradePlan.charAt(0).toUpperCase() + upgradePlan.slice(1)} Plan
                                        </span>
                                    </div>
                                </div>

                                {/* Coupon */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-1.5">Apply Coupon</p>
                                    <div className="flex gap-2">
                                        <input value={coupon} onChange={e => { setCoupon(e.target.value); setCouponState("idle"); }}
                                            placeholder="GLOW20 or WELCOME"
                                            className="flex-1 bg-[#222] border border-[#333] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#e84118] text-white placeholder-gray-600" />
                                        <button onClick={applyCoupon}
                                            className="border border-[#333] text-gray-400 px-4 py-2 rounded-xl text-sm hover:border-gray-500 hover:text-white transition-all">Apply</button>
                                    </div>
                                    {couponState === "valid" && <p className="text-green-400 text-xs mt-1">✅ Coupon applied!</p>}
                                    {couponState === "invalid" && <p className="text-red-400 text-xs mt-1">❌ Invalid coupon code</p>}
                                </div>

                                {/* Price breakdown */}
                                <div className="bg-[#222] rounded-xl p-4 mb-5">
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>Base Price</span><span>₹{basePrice}/{upgradePlan === "weekly" ? "wk" : upgradePlan === "yearly" ? "yr" : "mo"}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-400 mb-2">
                                            <span>Discount</span><span>- ₹{discount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-base border-t border-[#333] pt-2 mt-2">
                                        <span>Total</span>
                                        <span className={upgradePlan === "yearly" ? "text-[#f0a500]" : upgradePlan === "weekly" ? "text-[#3498db]" : "text-[#e84118]"}>₹{finalPrice}/{upgradePlan === "weekly" ? "wk" : upgradePlan === "yearly" ? "yr" : "mo"}</span>
                                    </div>
                                </div>

                                {paying ? (
                                    <div className="text-center py-4">
                                        <div className="w-8 h-8 border-2 border-[#e84118] border-t-transparent rounded-full animate-spin mx-auto" />
                                        <p className="text-gray-400 text-xs mt-2">Opening payment window...</p>
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={handlePay}
                                            className="w-full bg-[#e84118] hover:bg-[#c73510] text-white py-3 rounded-xl font-semibold transition-all">
                                            Proceed to Payment →
                                        </button>
                                        <button onClick={() => setShowModal(false)}
                                            className="w-full mt-2 text-gray-600 text-sm py-2 hover:text-gray-400 transition-all">Cancel</button>
                                    </>
                                )}
                            </>
                        )}

                        {/* Step 4 — Success */}
                        {payStep === 4 && (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">✓</div>
                                <h3 className="text-2xl font-bold mb-2">Payment Successful! 🎉</h3>
                                <p className="text-gray-400 mb-5">Welcome to {upgradePlan.charAt(0).toUpperCase() + upgradePlan.slice(1)}!</p>
                                <div className="bg-[#222] rounded-xl p-4 text-left mb-4">
                                    {[
                                        ["Plan", upgradePlan.toUpperCase()],
                                        ["Amount Paid", `₹${finalPrice}`],
                                        ["Transaction ID", txnId],
                                        ["Date", new Date().toLocaleDateString("en-IN")],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">{k}</span>
                                            <span className="font-medium">{v}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-gray-600 text-xs">Closing automatically...</p>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* ── Cancel confirm modal ── */}
            {showCancel && (
                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-7 max-w-sm w-full text-center">
                        <div className="text-4xl mb-3">⚠️</div>
                        <h3 className="text-xl font-bold mb-2">Cancel Subscription?</h3>
                        <p className="text-gray-400 text-sm mb-1">Your access continues until</p>
                        <p className="text-[#e84118] font-semibold mb-5">{sub.endDate ?? "end of billing period"}</p>
                        <button onClick={cancelSub}
                            className="w-full bg-red-700 hover:bg-red-600 text-white py-3 rounded-xl font-semibold mb-2 transition-all">
                            Yes, Cancel
                        </button>
                        <button onClick={() => setShowCancel(false)}
                            className="w-full bg-[#333] text-gray-400 py-2.5 rounded-xl font-semibold transition-all">
                            Keep My Subscription
                        </button>
                    </div>
                </div>
            )}

            {/* ── Invoice modal ── */}
            {showInvoice && (
                <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-7 max-w-sm w-full">
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-[#e84118] text-xl font-bold">🔥 Fact Flow</span>
                            <button onClick={() => setShowInvoice(false)} className="text-gray-500 text-xl hover:text-white">✕</button>
                        </div>
                        <div className="border-t border-[#333] pt-4 mb-4">
                            <p className="text-gray-500 text-xs">INVOICE · {new Date().toLocaleDateString("en-IN")}</p>
                        </div>
                        {[
                            ["Plan", `${sub.plan?.toUpperCase()} (${sub.billingCycle ?? "monthly"})`],
                            ["Amount", `₹${sub.amount ?? 0}`],
                            ["GST (18%)", `₹${Math.round((sub.amount ?? 0) * 0.18)}`],
                            ["Total", `₹${Math.round((sub.amount ?? 0) * 1.18)}`],
                        ].map(([k, v], i) => (
                            <div key={k} className={`flex justify-between py-2.5 ${i < 3 ? "border-b border-[#222]" : ""}`}>
                                <span className="text-sm text-gray-400">{k}</span>
                                <span className={`text-sm font-medium ${i === 3 ? "text-green-400" : ""}`}>{v}</span>
                            </div>
                        ))}
                        <button
                            onClick={() => alert("PDF generation requires backend integration with Puppeteer or pdfkit.")}
                            className="w-full mt-5 bg-[#e84118] hover:bg-[#c73510] text-white py-3 rounded-xl font-semibold transition-all">
                            Download PDF
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
