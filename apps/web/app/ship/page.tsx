"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthBackground } from "@/components/auth-background"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { Toaster } from "@workspace/ui/components/sonner"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package02Icon,
  CoinsIcon,
  TruckIcon,
  MapIcon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  UserCircleIcon,
  Mail01Icon,
  LockPasswordIcon,
} from "@hugeicons/core-free-icons"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://swg.xerinexpress.com/api/v1"

export default function ShipPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [quoteResult, setQuoteResult] = useState<any>(null)
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup")

  const [form, setForm] = useState({
    category: "DOMESTIC",
    transportMode: "ROAD",
    serviceLevel: "STANDARD",
    fulfillmentType: "DOOR_TO_DOOR",

    fromFullName: "",
    fromPhone: "",
    fromLine1: "",
    fromCity: "",
    fromCountry: "Tanzania",

    toFullName: "",
    toPhone: "",
    toLine1: "",
    toCity: "",
    toCountry: "Tanzania",

    actualWeightKg: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    declaredValue: "",
    insuranceEnabled: false,
    description: "",
  })

  function updateForm(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const steps = ["Shipment Details", "Addresses", "Quote Review", "Sign Up & Confirm"]

  async function calculateQuote() {
    if (!form.fromCity || !form.toCity || !form.actualWeightKg) {
      toast.error("Please fill in origin city, destination city, and weight")
      return
    }
    if (!form.fromFullName || !form.fromPhone || !form.toFullName || !form.toPhone) {
      toast.error("Please fill in sender and recipient names and phone numbers")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/quotes/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          transportMode: form.transportMode,
          serviceLevel: form.serviceLevel,
          originCity: form.fromCity,
          destinationCity: form.toCity,
          originCountry: form.fromCountry,
          destCountry: form.toCountry,
          actualWeightKg: parseFloat(form.actualWeightKg),
          lengthCm: form.lengthCm ? parseFloat(form.lengthCm) : undefined,
          widthCm: form.widthCm ? parseFloat(form.widthCm) : undefined,
          heightCm: form.heightCm ? parseFloat(form.heightCm) : undefined,
          insuranceEnabled: form.insuranceEnabled,
          declaredValue: form.declaredValue ? parseFloat(form.declaredValue) : 0,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to calculate quote")
      if (data.data.requiresCustomQuote) {
        toast.error(data.data.message || "Custom quote required for this shipment")
        return
      }
      setQuoteResult(data.data)
      setStep(3)
      toast.success("Quote calculated successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to calculate quote")
    } finally {
      setLoading(false)
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    const formData = e.target as HTMLFormElement

    setLoading(true)
    try {
      if (authMode === "signup") {
        const name = (formData.elements.namedItem("name") as HTMLInputElement).value
        const email = (formData.elements.namedItem("email") as HTMLInputElement).value
        const password = (formData.elements.namedItem("password") as HTMLInputElement).value
        const confirm = (formData.elements.namedItem("confirm-password") as HTMLInputElement).value

        if (password !== confirm) {
          toast.error("Passwords do not match")
          setLoading(false)
          return
        }

        const regRes = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, confirmPassword: confirm, role: "CUSTOMER" }),
        })
        const regData = await regRes.json()
        if (!regRes.ok || !regData.success) throw new Error(regData.message || "Registration failed")

        if (typeof window !== "undefined") {
          localStorage.setItem("token", regData.data.token)
          localStorage.setItem("user", JSON.stringify(regData.data.user))
        }

        await createShipmentAfterAuth(regData.data.token)
      } else {
        const email = (formData.elements.namedItem("email") as HTMLInputElement).value
        const password = (formData.elements.namedItem("password") as HTMLInputElement).value

        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        const loginData = await loginRes.json()
        if (!loginRes.ok || !loginData.success) throw new Error(loginData.message || "Login failed")

        if (typeof window !== "undefined") {
          localStorage.setItem("token", loginData.data.token)
          localStorage.setItem("user", JSON.stringify(loginData.data.user))
        }

        await createShipmentAfterAuth(loginData.data.token)
      }
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message || "Something went wrong")
    }
  }

  async function createShipmentAfterAuth(token: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: form.category,
          transportMode: form.transportMode,
          serviceLevel: form.serviceLevel,
          fulfillmentType: form.fulfillmentType,
          fromAddress: {
            fullName: form.fromFullName,
            phone: form.fromPhone,
            line1: form.fromLine1,
            city: form.fromCity,
            country: form.fromCountry,
          },
          toAddress: {
            fullName: form.toFullName,
            phone: form.toPhone,
            line1: form.toLine1,
            city: form.toCity,
            country: form.toCountry,
          },
          actualWeightKg: parseFloat(form.actualWeightKg),
          lengthCm: form.lengthCm ? parseFloat(form.lengthCm) : undefined,
          widthCm: form.widthCm ? parseFloat(form.widthCm) : undefined,
          heightCm: form.heightCm ? parseFloat(form.heightCm) : undefined,
          declaredValue: form.declaredValue ? parseFloat(form.declaredValue) : undefined,
          insuranceEnabled: form.insuranceEnabled,
          description: form.description,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create shipment")

      toast.success("Shipment created successfully! Redirecting...")
      setTimeout(() => {
        router.push(`/track?number=${encodeURIComponent(data.data.shipment?.trackingNumber || "")}`)
      }, 800)
    } catch (err: any) {
      toast.error(err.message || "Failed to create shipment. Please try again from the dashboard.")
      setTimeout(() => router.push("/dashboard/shipments"), 1500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-svh">
      <AuthBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 text-white">
            <img src="/assets/social-media.png" alt="Xerin" className="size-8 rounded-lg object-cover" />
            <span className="text-base font-semibold tracking-tight">Xerin Express</span>
          </a>
          <a href="/" className="text-sm text-white/60 transition-colors hover:text-white">
            Back to Home
          </a>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ship a Package</h1>
          <p className="mt-2 text-white/60">Fill in your shipment details — sign up at the final step to confirm</p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex size-9 items-center justify-center rounded-full text-sm font-medium transition-all ${step > i + 1 ? "bg-primary text-primary-foreground" : step === i + 1 ? "bg-white/20 text-white ring-2 ring-primary" : "bg-white/10 text-white/40"}`}>
                {step > i + 1 ? <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" /> : i + 1}
              </div>
              <span className={`hidden text-sm font-medium sm:block ${step === i + 1 ? "text-white" : "text-white/40"}`}>{label}</span>
              {i < 3 && <Separator orientation="vertical" className="h-6 mx-1 bg-white/20" />}
            </div>
          ))}
        </div>

        {/* Step 1: Shipment Details + Package */}
        {step === 1 && (
          <div className="space-y-4">
            <Card className="border-white/10 bg-white/95 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-5 text-primary" />
                  Shipment Configuration
                </CardTitle>
                <CardDescription>Select the type and mode of delivery</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => updateForm("category", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOMESTIC">Domestic</SelectItem>
                      <SelectItem value="INTERNATIONAL">International</SelectItem>
                      <SelectItem value="SPECIAL_TRANSPORT">Special Transport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Transport Mode</Label>
                  <Select value={form.transportMode} onValueChange={(v) => updateForm("transportMode", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROAD">Road</SelectItem>
                      <SelectItem value="AIR">Air</SelectItem>
                      <SelectItem value="SEA">Sea</SelectItem>
                      <SelectItem value="COURIER">Courier</SelectItem>
                      <SelectItem value="RAIL">Rail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Service Level</Label>
                  <Select value={form.serviceLevel} onValueChange={(v) => updateForm("serviceLevel", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="EXPRESS">Express</SelectItem>
                      <SelectItem value="SAME_DAY">Same Day</SelectItem>
                      <SelectItem value="NEXT_DAY">Next Day</SelectItem>
                      <SelectItem value="ECONOMY">Economy</SelectItem>
                      <SelectItem value="PRIORITY">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Fulfillment Type</Label>
                  <Select value={form.fulfillmentType} onValueChange={(v) => updateForm("fulfillmentType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOOR_TO_DOOR">Door to Door</SelectItem>
                      <SelectItem value="DOOR_TO_PICKUP">Door to Pickup Point</SelectItem>
                      <SelectItem value="PICKUP_TO_DOOR">Pickup Point to Door</SelectItem>
                      <SelectItem value="PICKUP_TO_PICKUP">Pickup to Pickup Point</SelectItem>
                      <SelectItem value="WAREHOUSE_TO_DOOR">Warehouse to Door</SelectItem>
                      <SelectItem value="WAREHOUSE_TO_PICKUP">Warehouse to Pickup Point</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/95 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
                <CardDescription>Weight and dimensions</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Actual Weight (kg) <span className="text-destructive">*</span></Label>
                  <Input type="number" step="0.01" value={form.actualWeightKg} onChange={(e) => updateForm("actualWeightKg", e.target.value)} placeholder="e.g. 5.5" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="grid gap-2">
                    <Label>L (cm)</Label>
                    <Input type="number" value={form.lengthCm} onChange={(e) => updateForm("lengthCm", e.target.value)} placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label>W (cm)</Label>
                    <Input type="number" value={form.widthCm} onChange={(e) => updateForm("widthCm", e.target.value)} placeholder="0" />
                  </div>
                  <div className="grid gap-2">
                    <Label>H (cm)</Label>
                    <Input type="number" value={form.heightCm} onChange={(e) => updateForm("heightCm", e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Declared Value (TZS)</Label>
                  <Input type="number" value={form.declaredValue} onChange={(e) => updateForm("declaredValue", e.target.value)} placeholder="0" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="insurance" checked={form.insuranceEnabled} onChange={(e) => updateForm("insuranceEnabled", e.target.checked)} className="size-4 rounded" />
                  <Label htmlFor="insurance">Enable insurance</Label>
                </div>
                <div className="grid gap-2">
                  <Label>Description (optional)</Label>
                  <Input value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Package contents" />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button size="lg" onClick={() => setStep(2)}>
                Continue
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Addresses */}
        {step === 2 && (
          <div className="space-y-4">
            <Card className="border-white/10 bg-white/95 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-5 text-primary" />
                  Addresses
                </CardTitle>
                <CardDescription>Sender and recipient information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* From */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-4 text-primary" />
                      From (Sender)
                    </div>
                    <div className="grid gap-2">
                      <Label>Full Name <span className="text-destructive">*</span></Label>
                      <Input value={form.fromFullName} onChange={(e) => updateForm("fromFullName", e.target.value)} placeholder="Sender name" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Phone <span className="text-destructive">*</span></Label>
                      <Input value={form.fromPhone} onChange={(e) => updateForm("fromPhone", e.target.value)} placeholder="+255..." />
                    </div>
                    <div className="grid gap-2">
                      <Label>Address Line</Label>
                      <Input value={form.fromLine1} onChange={(e) => updateForm("fromLine1", e.target.value)} placeholder="Street address" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-2">
                        <Label>City <span className="text-destructive">*</span></Label>
                        <Input value={form.fromCity} onChange={(e) => updateForm("fromCity", e.target.value)} placeholder="e.g. Mwanza" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Country</Label>
                        <Input value={form.fromCountry} onChange={(e) => updateForm("fromCountry", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* To */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-4 text-primary" />
                      To (Recipient)
                    </div>
                    <div className="grid gap-2">
                      <Label>Full Name <span className="text-destructive">*</span></Label>
                      <Input value={form.toFullName} onChange={(e) => updateForm("toFullName", e.target.value)} placeholder="Recipient name" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Phone <span className="text-destructive">*</span></Label>
                      <Input value={form.toPhone} onChange={(e) => updateForm("toPhone", e.target.value)} placeholder="+255..." />
                    </div>
                    <div className="grid gap-2">
                      <Label>Address Line</Label>
                      <Input value={form.toLine1} onChange={(e) => updateForm("toLine1", e.target.value)} placeholder="Street address" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-2">
                        <Label>City <span className="text-destructive">*</span></Label>
                        <Input value={form.toCity} onChange={(e) => updateForm("toCity", e.target.value)} placeholder="e.g. Dar es Salaam" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Country</Label>
                        <Input value={form.toCountry} onChange={(e) => updateForm("toCountry", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button size="lg" onClick={calculateQuote} disabled={loading}>
                <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-4" />
                {loading ? "Calculating..." : "Calculate Quote"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Quote Review */}
        {step === 3 && quoteResult && (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-white/10 bg-white/95 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
                  <CardDescription>Review your pricing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Chargeable Weight</span>
                    <span className="font-medium">{quoteResult.chargeableWeightKg} kg</span>
                  </div>
                  {quoteResult.volumetricWeightKg > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Volumetric Weight</span>
                      <span className="font-medium">{quoteResult.volumetricWeightKg} kg</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{quoteResult.currency} {Number(quoteResult.subtotal).toLocaleString()}</span>
                  </div>
                  {Object.entries(quoteResult.fees || {}).map(([key, val]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, " ").toLowerCase()}</span>
                      <span className="font-medium">{quoteResult.currency} {Number(val).toLocaleString()}</span>
                    </div>
                  ))}
                  {quoteResult.insurancePremium > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Insurance</span>
                      <span className="font-medium">{quoteResult.currency} {Number(quoteResult.insurancePremium).toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-primary">{quoteResult.currency} {Number(quoteResult.total).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-4" />
                    Estimated delivery: {quoteResult.etaMin}–{quoteResult.etaMax} days
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/95 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Shipment Summary</CardTitle>
                  <CardDescription>Confirm shipment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge variant="secondary">{form.category.replace(/_/g, " ")}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Transport Mode</span>
                    <Badge variant="secondary">{form.transportMode}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Service Level</span>
                    <Badge variant="secondary">{form.serviceLevel}</Badge>
                  </div>
                  <Separator />
                  <div className="text-sm">
                    <span className="text-muted-foreground">From: </span>
                    <span className="font-medium">{form.fromFullName} — {form.fromCity}, {form.fromCountry}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">To: </span>
                    <span className="font-medium">{form.toFullName} — {form.toCity}, {form.toCountry}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Weight: </span>
                    <span className="font-medium">{form.actualWeightKg} kg</span>
                  </div>
                  {form.description && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Description: </span>
                      <span className="font-medium">{form.description}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button size="lg" onClick={() => setStep(4)}>
                Continue to Sign Up
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Auth & Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <Card className="border-white/10 bg-white/95 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} className="size-5 text-primary" />
                  {authMode === "signup" ? "Create Your Account" : "Sign In"}
                </CardTitle>
                <CardDescription>
                  {authMode === "signup"
                    ? "Create an account to confirm your shipment. Your details are saved."
                    : "Sign in to confirm your shipment. Your details are saved."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Summary banner */}
                <div className="mb-6 rounded-lg bg-primary/5 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipment Total</span>
                    <span className="text-lg font-bold text-primary">
                      {quoteResult?.currency} {Number(quoteResult?.total || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {form.fromCity} → {form.toCity} · {form.actualWeightKg} kg · {form.serviceLevel}
                  </div>
                </div>

                {/* Auth mode toggle */}
                <div className="mb-6 flex gap-2 rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${authMode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${authMode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                  >
                    Sign In
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === "signup" && (
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <HugeiconsIcon icon={UserCircleIcon} className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input id="name" type="text" placeholder="John Doe" required className="h-12 ps-10 text-base" />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <HugeiconsIcon icon={Mail01Icon} className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="you@example.com" required className="h-12 ps-10 text-base" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <HugeiconsIcon icon={LockPasswordIcon} className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input id="password" type="password" placeholder={authMode === "signup" ? "Create a strong password" : "Your password"} required className="h-12 ps-10 text-base" />
                    </div>
                  </div>

                  {authMode === "signup" && (
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <HugeiconsIcon icon={LockPasswordIcon} className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input id="confirm-password" type="password" placeholder="Re-enter your password" required className="h-12 ps-10 text-base" />
                      </div>
                    </div>
                  )}

                  <Button type="submit" size="lg" loading={loading} className="h-12 w-full text-base">
                    {authMode === "signup" ? "Create Account & Confirm Shipment" : "Sign In & Confirm Shipment"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button variant="ghost" className="text-white/60 hover:text-white" onClick={() => setStep(3)}>
                Back to Quote
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} Xerin Delivery Express. All rights reserved.
        </p>
      </div>

      <Toaster />
    </div>
  )
}
