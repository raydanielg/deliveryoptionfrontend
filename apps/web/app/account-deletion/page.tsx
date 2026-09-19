"use client"

import { useState, FormEvent } from "react"

export default function AccountDeletionPage() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [reason, setReason] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/account-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, reason }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStatus("success")
        setMessage(data.message)
        setEmail("")
        setPhone("")
        setReason("")
      } else {
        setStatus("error")
        setMessage(data.message || "Request failed. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again later.")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-950/80 via-black/60 to-slate-900/40 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Account & Data Deletion</h1>
        <p className="text-slate-600 mb-6">
          Request deletion of your Xerin Express account and all associated personal data.
        </p>

        {status === "success" ? (
          <div className="rounded-lg bg-green-50 p-4 text-green-800">
            <p className="font-medium">{message}</p>
            <p className="mt-2 text-sm">
              Our support team will process your request within 30 days and contact you if needed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+255..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-slate-700">
                Reason for deletion
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Optional..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {status === "error" && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Sending request..." : "Request account deletion"}
            </button>

            <p className="text-xs text-slate-500">
              We may retain certain records for legal, tax, fraud-prevention, or regulatory purposes.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
