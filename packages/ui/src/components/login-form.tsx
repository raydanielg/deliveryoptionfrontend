"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, LockPasswordIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

export function LoginForm({
  className,
  title = "Xerin Delivery Express",
  subtitle = "Sign in to your account to continue",
  emailLabel = "Email",
  emailPlaceholder = "you@example.com",
  passwordLabel = "Password",
  passwordPlaceholder = "Enter your password",
  forgotPassword = "Forgot your password?",
  submitLabel = "Login",
  successMessage = "Welcome back! Redirecting to dashboard...",
  errorMessage = "Login failed. Please try again.",
  noAccountText = "Don't have an account?",
  signUpText = "Sign up",
  ...props
}: React.ComponentProps<"div"> & {
  title?: string
  subtitle?: string
  emailLabel?: string
  emailPlaceholder?: string
  passwordLabel?: string
  passwordPlaceholder?: string
  forgotPassword?: string
  submitLabel?: string
  successMessage?: string
  errorMessage?: string
  noAccountText?: string
  signUpText?: string
}) {
  const [isLoading, setIsLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://swg.xerinexpress.com/api/v1"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed")
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.data.token)
        localStorage.setItem("user", JSON.stringify(data.data.user))
      }

      toast.success(successMessage)
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 500)
    } catch (err) {
      setIsLoading(false)
      toast.error(err instanceof Error ? err.message : errorMessage)
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
                  src="/assets/social-media (1).png"
                  alt="Xerin Delivery Express"
                  className="size-16 object-contain"
                />
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-balance text-muted-foreground">
                  {subtitle}
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">{emailLabel}</FieldLabel>
                <div className="relative">
                  <HugeiconsIcon
                    icon={Mail01Icon}
                    className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder={emailPlaceholder}
                    required
                    className="h-12 ps-10 text-base"
                  />
                </div>
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{passwordLabel}</FieldLabel>
                  <a
                    href="/auth/forgot-password"
                    className="ms-auto text-sm underline-offset-2 hover:underline"
                  >
                    {forgotPassword}
                  </a>
                </div>
                <div className="relative">
                  <HugeiconsIcon
                    icon={LockPasswordIcon}
                    className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder={passwordPlaceholder}
                    required
                    className="h-12 ps-10 text-base"
                  />
                </div>
              </Field>
              <Field>
                <Button type="submit" size="lg" loading={isLoading} className="h-12 w-full text-base">
                  {submitLabel}
                </Button>
              </Field>
              <FieldDescription className="text-center text-muted-foreground">
                Authorized personnel only. Contact your administrator for access.
              </FieldDescription>
              <div className="text-center text-sm text-muted-foreground">
                {noAccountText}{" "}
                <a href="/auth/sign-up" className="font-medium text-primary hover:underline">
                  {signUpText}
                </a>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
