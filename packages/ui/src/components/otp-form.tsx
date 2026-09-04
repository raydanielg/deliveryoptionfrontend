"use client"

import * as React from "react"
import { toast } from "sonner"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp"

type OtpMethod = "email" | "sms"

export function OtpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [otpValue, setOtpValue] = React.useState("")
  const [method, setMethod] = React.useState<OtpMethod>("email")
  const [resendTimer, setResendTimer] = React.useState(0)
  const email = typeof window !== "undefined" ? sessionStorage.getItem("resetEmail") : null
  const userName = typeof window !== "undefined" ? sessionStorage.getItem("userName") : null

  React.useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  async function handleResend() {
    if (!email) {
      toast.error("Session expired. Please request a new code.")
      setTimeout(() => { window.location.href = "/auth/forgot-password" }, 1000)
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://swg.xerinexpress.com/api/v1"}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to resend")
      toast.success(`Code sent via ${method === "email" ? "email" : "SMS"}!`)
      setResendTimer(60)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend code")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email) {
      toast.error("Session expired. Please request a new code.")
      setTimeout(() => {
        window.location.href = "/auth/forgot-password"
      }, 1000)
      return
    }

    if (otpValue.length !== 6) {
      toast.error("Please enter the 6-digit code.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://swg.xerinexpress.com/api/v1"}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Verification failed")
      }

      const isRegistration = sessionStorage.getItem("justRegistered") === "true"
      sessionStorage.removeItem("justRegistered")

      if (isRegistration) {
        toast.success("Account verified! Welcome to Xerin Express.")
        setTimeout(() => {
          window.location.href = "/auth/welcome"
        }, 500)
      } else {
        toast.success("Verified! Redirecting to reset password...")
        setTimeout(() => {
          window.location.href = "/auth/reset-password"
        }, 500)
      }
    } catch (err) {
      setIsLoading(false)
      toast.error(err instanceof Error ? err.message : "Invalid or expired code. Please try again.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <img
                  src="/assets/m app2.png"
                  alt="Xerin Express"
                  className="size-16 object-contain"
                />
                <h1 className="text-2xl font-bold">Verify Your Account</h1>
                <p className="text-balance text-muted-foreground">
                  We sent a 6-digit code to your {method === "email" ? "email" : "phone"}. Enter it below.
                </p>
              </div>

              {/* Method Tabs */}
              <div className="flex gap-2 rounded-xl bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    method === "email"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    Email
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("sms")}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    method === "sms"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    SMS
                  </span>
                </button>
              </div>

              <Field>
                <div className="flex justify-center py-2">
                  <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </Field>

              <Field>
                <Button type="submit" size="lg" loading={isLoading} className="h-12 w-full text-base">
                  Verify Code
                </Button>
              </Field>

              <div className="flex flex-col gap-2 text-center">
                <FieldDescription>
                  {resendTimer > 0 ? (
                    <span className="text-muted-foreground">
                      Resend code in {resendTimer}s
                    </span>
                  ) : (
                    <button type="button" onClick={handleResend} className="font-medium text-primary hover:underline">
                      Resend code via {method === "email" ? "email" : "SMS"}
                    </button>
                  )}
                </FieldDescription>
                <FieldDescription>
                  <a href="/auth/forgot-password" className="text-muted-foreground hover:text-foreground">
                    Use a different email
                  </a>
                </FieldDescription>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
