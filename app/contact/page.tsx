"use client"

import { useState } from "react"
import { Mail, MapPin, Send, Loader2, CheckCircle2, Instagram, Youtube, AtSign, Facebook } from "lucide-react"
import { toast } from "sonner"
import { Metadata } from "next"

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields.")
      return
    }
    setStatus("loading")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus("success")
        toast.success("Message sent! We'll get back to you soon.")
        setForm({ name: "", email: "", subject: "", message: "" })
      } else {
        throw new Error(data.message || "Failed to send.")
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.")
      setStatus("idle")
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6">
            Contact <span className="text-red-500">Us</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, or a legal inquiry? We'd love to hear from you. Drop us a message and our team will get back to you within 24–48 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Contact Info */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-secondary/40 border border-border p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Email Us</h3>
              <p className="text-muted-foreground text-sm mb-3">For general queries and support</p>
              <a href="mailto:factflow1819@gmail.com" className="text-red-500 font-medium hover:underline text-sm break-all">
                factflow1819@gmail.com
              </a>
            </div>

            <div className="bg-secondary/40 border border-border p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Location</h3>
              <p className="text-muted-foreground text-sm mb-2">Headquarters</p>
              <span className="text-foreground font-medium">India</span>
            </div>

            {/* Social Links */}
            <div className="bg-secondary/40 border border-border p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-foreground mb-4 text-center">Follow Us</h3>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <a href="https://instagram.com/fact_flow" target="_blank" rel="noopener noreferrer"
                  className="p-2.5 rounded-xl text-white bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-md hover:shadow-pink-500/30 transition-all hover:-translate-y-1" title="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2.5 rounded-xl text-white bg-gradient-to-b from-blue-400 to-blue-600 shadow-md hover:shadow-blue-500/30 transition-all hover:-translate-y-1" title="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-2.5 rounded-xl text-white bg-gradient-to-b from-zinc-700 to-black shadow-md hover:shadow-black/30 transition-all hover:-translate-y-1" title="Threads">
                  <AtSign className="w-5 h-5" />
                </a>
                <a href="#" className="p-2.5 rounded-xl text-white bg-gradient-to-b from-red-500 to-red-700 shadow-md hover:shadow-red-500/30 transition-all hover:-translate-y-1" title="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>

              {status === "success" ? (
                <div className="py-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">Thank you for reaching out. You'll receive a confirmation email shortly. We'll get back to you within 24–48 hours.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-8 px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Your Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email Address *</label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Subject *</label>
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      type="text"
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Message *</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Write your message here..."
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-sm shadow-red-500/20 disabled:opacity-70"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
