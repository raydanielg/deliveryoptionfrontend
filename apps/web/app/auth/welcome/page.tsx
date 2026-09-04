"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Toaster } from "@workspace/ui/components/sonner"
import { toast } from "sonner"
import { AuthBackground } from "@/components/auth-background"

export default function WelcomePage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const name = sessionStorage.getItem("userName") || "there"
    setUserName(name)

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push("/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Branding panel */}
      <div className="relative hidden flex-col bg-primary/5 lg:flex">
        <AuthBackground />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2.5 text-lg font-semibold text-white">
            <img src="/assets/m%20app2.png" alt="Xerin" className="size-9 rounded-lg object-cover" />
            <span>Xerin Express</span>
          </div>

          <div className="max-w-md space-y-6">
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white">
              You&apos;re all set.
              <br />
              Welcome aboard.
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              Your account is verified and ready. Start creating shipments, tracking packages in real-time, and managing your deliveries with ease.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                </div>
                <span className="text-sm text-white/70">Create and manage shipments in seconds</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <span className="text-sm text-white/70">Track deliveries with live GPS updates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span className="text-sm text-white/70">Secure payments and instant receipts</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>

      {/* Welcome panel */}
      <div className="relative flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 lg:hidden">
          <AuthBackground />
        </div>

        <Card className="relative z-10 w-full max-w-md overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <div className="flex flex-col items-center gap-6 p-8 md:p-10 text-center">
              {/* Success checkmark */}
              <div className="relative">
                <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="size-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                </div>
                <div className="absolute -inset-2 rounded-full border-2 border-emerald-200 animate-ping opacity-75" style={{ animationDuration: "2s" }} />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome, {userName}!
                </h1>
                <p className="text-balance text-muted-foreground">
                  Your Xerin Express account is verified and ready to go. Start shipping smarter today.
                </p>
              </div>

              {/* Feature cards */}
              <div className="grid w-full grid-cols-1 gap-3">
                <div className="flex items-center gap-3 rounded-xl border p-3 text-left">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                    <svg className="size-5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m7.5 4.27 9 5.15" />
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Create Shipments</p>
                    <p className="text-xs text-muted-foreground">Book deliveries across road, rail, and air</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border p-3 text-left">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <svg className="size-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Track in Real-Time</p>
                    <p className="text-xs text-muted-foreground">Live GPS tracking for every package</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border p-3 text-left">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                    <svg className="size-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Secure Payments</p>
                    <p className="text-xs text-muted-foreground">Pay with mobile money or card</p>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 pt-2">
                <Button size="lg" className="h-12 w-full text-base" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
                <p className="text-xs text-muted-foreground">
                  Redirecting in {countdown}s...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="relative z-10 mt-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Xerin Express. All rights reserved.
        </p>
        <Toaster />
      </div>
    </div>
  )
}
