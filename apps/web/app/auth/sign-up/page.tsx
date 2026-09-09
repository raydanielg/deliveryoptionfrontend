"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AuthBackground } from "@/components/auth-background"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLang } from "@/lib/i18n"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Toaster } from "@workspace/ui/components/sonner"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserCircleIcon,
  Mail01Icon,
  PhoneIcon,
  LockPasswordIcon,
  CheckmarkCircle02Icon,
  TruckIcon,
  Package02Icon,
  ArrowRight01Icon,
  EyeIcon,
  EyeOffIcon,
} from "@hugeicons/core-free-icons"

const ROLES = [
  {
    value: "CUSTOMER",
    label: "Customer",
    description: "Send & track shipments",
    icon: Package02Icon,
    color: "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30",
    selectedColor: "border-orange-500 bg-orange-50 dark:bg-orange-950/50 ring-2 ring-orange-500/30",
  },
  {
    value: "DRIVER",
    label: "Driver",
    description: "Deliver & earn money",
    icon: TruckIcon,
    color: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30",
    selectedColor: "border-blue-500 bg-blue-50 dark:bg-blue-950/50 ring-2 ring-blue-500/30",
  },
]

export default function SignUpPage() {
  const { t } = useLang()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name || form.name.length < 2) errs.name = "Name must be at least 2 characters"
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email"
    if (!form.phone || form.phone.length < 10) errs.phone = "Enter a valid phone number"
    if (!form.password || form.password.length < 8) errs.password = "Password must be at least 8 characters"
    else if (!/[A-Z]/.test(form.password)) errs.password = "Must contain an uppercase letter"
    else if (!/[a-z]/.test(form.password)) errs.password = "Must contain a lowercase letter"
    else if (!/[0-9]/.test(form.password)) errs.password = "Must contain a number"
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://swg.xerinexpress.com/api/v1"}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email.toLowerCase().trim(),
          phone: form.phone.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          role: form.role,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed")
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("resetEmail", form.email.toLowerCase().trim())
        sessionStorage.setItem("userName", form.name)
        sessionStorage.setItem("justRegistered", "true")
      }

      toast.success("Account created! Verification code sent via email, SMS & WhatsApp.")
      setTimeout(() => {
        router.push("/auth/verify")
      }, 800)
    } catch (err) {
      setIsLoading(false)
      toast.error(err instanceof Error ? err.message : "Registration failed")
    }
  }

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
              {t("auth.heroTitle")}
              <br />
              {t("auth.heroTitle2")}
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              {t("auth.heroDesc")}
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-white" />
                </div>
                <span className="text-sm text-white/70">{t("auth.feature1")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-white" />
                </div>
                <span className="text-sm text-white/70">{t("auth.feature2")}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-white" />
                </div>
                <span className="text-sm text-white/70">{t("auth.feature3")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 lg:hidden">
          <AuthBackground />
        </div>

        <div className="relative z-10 w-full max-w-md shadow-2xl">
          <div className="mb-3 flex justify-end">
            <LanguageSwitcher />
          </div>

          <Card className="overflow-hidden p-0">
            <CardContent className="p-0">
              <form className="p-6 md:p-8 space-y-4" onSubmit={handleSubmit}>
                <div className="flex flex-col items-center gap-2 text-center mb-2">
                  <img src="/assets/social-media (1).png" alt="Xerin Express" className="size-16 object-contain" />
                  <h1 className="text-2xl font-bold">Create Account</h1>
                  <p className="text-balance text-muted-foreground text-sm">
                    Join Xerin Express — send shipments, track deliveries, and grow your business.
                  </p>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>I want to register as</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map((role) => {
                      const isSelected = form.role === role.value
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, role: role.value }))}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${isSelected ? role.selectedColor : role.color}`}
                        >
                          <HugeiconsIcon icon={role.icon} className={`size-7 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <div>
                            <p className={`text-sm font-semibold ${isSelected ? "text-primary" : ""}`}>{role.label}</p>
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <HugeiconsIcon icon={UserCircleIcon} className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="h-12 ps-10 text-base"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <HugeiconsIcon icon={Mail01Icon} className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className="h-12 ps-10 text-base"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <HugeiconsIcon icon={PhoneIcon} className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="255700000000"
                      value={form.phone}
                      onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-12 ps-10 text-base"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Include country code (e.g. 255 for Tanzania)</p>
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <HugeiconsIcon icon={LockPasswordIcon} className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      value={form.password}
                      onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                      className="h-12 ps-10 pe-10 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <HugeiconsIcon icon={showPassword ? EyeOffIcon : EyeIcon} className="size-5" />
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <HugeiconsIcon icon={LockPasswordIcon} className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="h-12 ps-10 pe-10 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <HugeiconsIcon icon={showConfirm ? EyeOffIcon : EyeIcon} className="size-5" />
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>

                {/* OTP info banner */}
                <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 shrink-0 mt-0.5 text-blue-500" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    After registration, a verification code will be sent to your <strong>email</strong>, <strong>SMS</strong>, and <strong>WhatsApp</strong>. Enter it to activate your account.
                  </p>
                </div>

                <Button type="submit" size="lg" loading={isLoading} className="h-12 w-full text-base">
                  Create Account
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <a href="/auth" className="font-medium text-primary hover:underline">
                    Sign in
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        <p className="relative z-10 mt-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Xerin Express. {t("auth.rights")}
        </p>
        <Toaster />
      </div>
    </div>
  )
}
