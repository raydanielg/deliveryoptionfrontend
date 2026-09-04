"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package02Icon,
  CoinsIcon,
  TruckIcon,
  MapIcon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Airplane01Icon,
  Train01Icon,
  ShipIcon,
  Rocket01Icon,
  FlashIcon,
  Clock01Icon,
  Shield01Icon,
  PackageLock01Icon,
  FragileIcon,
  Cash01Icon,
  CreditCard01Icon,
  Wallet01Icon,
  SmartphoneIcon,
  Building03Icon,
  Home02Icon,
  Store01Icon,
  Location01Icon,
  Call01Icon,
  Mail01Icon,
  UserCircleIcon,
  ViewIcon,
  Scale01Icon,
  RulerIcon,
  InformationSquareIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

const SERVICE_OPTIONS = {
  category: [
    { value: "DOMESTIC", label: "Domestic", desc: "Within the country", icon: TruckIcon, color: "from-blue-500 to-cyan-500" },
    { value: "INTERNATIONAL", label: "International", desc: "Cross-border delivery", icon: Airplane01Icon, color: "from-purple-500 to-pink-500" },
    { value: "SPECIAL_TRANSPORT", label: "Special Transport", desc: "Heavy & oversized items", icon: PackageLock01Icon, color: "from-orange-500 to-red-500" },
  ],
  transportMode: [
    { value: "ROAD", label: "Road", desc: "Ground transport", icon: TruckIcon },
    { value: "AIR", label: "Air", desc: "Fastest option", icon: Airplane01Icon },
    { value: "SEA", label: "Sea", desc: "Cost-effective bulk", icon: ShipIcon },
    { value: "COURIER", label: "Courier", desc: "Express delivery", icon: Rocket01Icon },
    { value: "RAIL", label: "Rail", desc: "Eco-friendly freight", icon: Train01Icon },
  ],
  serviceLevel: [
    { value: "STANDARD", label: "Standard", desc: "3-5 days", icon: Clock01Icon, badge: "Popular" },
    { value: "EXPRESS", label: "Express", desc: "1-2 days", icon: FlashIcon, badge: "Fast" },
    { value: "SAME_DAY", label: "Same Day", desc: "Within hours", icon: Rocket01Icon, badge: "Fastest" },
    { value: "NEXT_DAY", label: "Next Day", desc: "Overnight delivery", icon: FlashIcon },
    { value: "ECONOMY", label: "Economy", desc: "5-7 days, best price", icon: CoinsIcon },
    { value: "PRIORITY", label: "Priority", desc: "Top priority handling", icon: SparklesIcon, badge: "Premium" },
  ],
  fulfillmentType: [
    { value: "DOOR_TO_DOOR", label: "Door to Door", desc: "Pickup & deliver to addresses", icon: Home02Icon },
    { value: "DOOR_TO_PICKUP", label: "Door to Pickup", desc: "Deliver to pickup point", icon: Store01Icon },
    { value: "PICKUP_TO_DOOR", label: "Pickup to Door", desc: "Drop at station, deliver to door", icon: Building03Icon },
    { value: "PICKUP_TO_PICKUP", label: "Pickup to Pickup", desc: "Station to station", icon: Store01Icon },
    { value: "WAREHOUSE_TO_DOOR", label: "Warehouse to Door", desc: "From warehouse to address", icon: Building03Icon },
    { value: "WAREHOUSE_TO_PICKUP", label: "Warehouse to Pickup", desc: "From warehouse to pickup point", icon: Building03Icon },
  ],
  packageType: [
    { value: "BOX", label: "Box", icon: Package02Icon },
    { value: "ENVELOPE", label: "Envelope", icon: Mail01Icon },
    { value: "BAG", label: "Bag/Sack", icon: Package02Icon },
    { value: "PALLET", label: "Pallet", icon: Package02Icon },
    { value: "Cylinder", label: "Cylinder/Tube", icon: Package02Icon },
    { value: "OTHER", label: "Other", icon: Package02Icon },
  ],
  paymentMethod: [
    { value: "MOBILE_MONEY", label: "Mobile Money", desc: "M-Pesa, Tigo Pesa, Airtel Money", icon: SmartphoneIcon },
    { value: "CARD", label: "Credit/Debit Card", desc: "Visa, Mastercard", icon: CreditCard01Icon },
    { value: "BANK_TRANSFER", label: "Bank Transfer", desc: "Direct bank transfer", icon: Building03Icon },
    { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", desc: "Pay when you receive", icon: Cash01Icon },
  ],
}

export default function NewShipmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [quoteResult, setQuoteResult] = useState<any>(null)
  const [createdShipment, setCreatedShipment] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("MOBILE_MONEY")

  const [form, setForm] = useState({
    category: "DOMESTIC",
    transportMode: "ROAD",
    serviceLevel: "STANDARD",
    fulfillmentType: "DOOR_TO_DOOR",

    fromFullName: "",
    fromPhone: "",
    fromEmail: "",
    fromLine1: "",
    fromCity: "",
    fromCountry: "Tanzania",
    fromRegion: "",
    fromPostalCode: "",
    fromLandmark: "",

    toFullName: "",
    toPhone: "",
    toEmail: "",
    toLine1: "",
    toCity: "",
    toCountry: "Tanzania",
    toRegion: "",
    toPostalCode: "",
    toLandmark: "",

    packageType: "BOX",
    quantity: "1",
    actualWeightKg: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    declaredValue: "",
    insuranceEnabled: false,
    isFragile: false,
    description: "",
    notes: "",
  })

  function updateForm(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const steps = ["Service", "Package", "Sender", "Receiver", "Quote", "Payment"]

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
      const result = await api.quotes.calculate({
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
      })

      if (result.data.requiresCustomQuote) {
        toast.error(result.data.message || "Custom quote required for this shipment")
        return
      }

      setQuoteResult(result.data)
      setStep(5)
      toast.success("Quote calculated successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to calculate quote")
    } finally {
      setLoading(false)
    }
  }

  async function createShipment() {
    setLoading(true)
    try {
      const result = await api.shipments.create({
        category: form.category,
        transportMode: form.transportMode,
        serviceLevel: form.serviceLevel,
        fulfillmentType: form.fulfillmentType,
        fromAddress: {
          fullName: form.fromFullName,
          phone: form.fromPhone,
          email: form.fromEmail || undefined,
          line1: form.fromLine1,
          city: form.fromCity,
          country: form.fromCountry,
          region: form.fromRegion || undefined,
          postalCode: form.fromPostalCode || undefined,
          landmark: form.fromLandmark || undefined,
        },
        toAddress: {
          fullName: form.toFullName,
          phone: form.toPhone,
          email: form.toEmail || undefined,
          line1: form.toLine1,
          city: form.toCity,
          country: form.toCountry,
          region: form.toRegion || undefined,
          postalCode: form.toPostalCode || undefined,
          landmark: form.toLandmark || undefined,
        },
        actualWeightKg: parseFloat(form.actualWeightKg),
        lengthCm: form.lengthCm ? parseFloat(form.lengthCm) : undefined,
        widthCm: form.widthCm ? parseFloat(form.widthCm) : undefined,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : undefined,
        declaredValue: form.declaredValue ? parseFloat(form.declaredValue) : undefined,
        insuranceEnabled: form.insuranceEnabled,
        description: form.description,
        notes: form.notes || undefined,
        packageType: form.packageType,
        quantity: parseInt(form.quantity) || 1,
        isFragile: form.isFragile,
        paymentMethod,
      })

      setCreatedShipment(result.data)
      setStep(7)
      toast.success("Shipment created successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to create shipment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Operations", href: "/dashboard/shipments" }, { label: "New Shipment" }]}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Shipment</h1>
          <p className="text-sm text-muted-foreground">Create a new shipment with instant quote & payment</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-3">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5 sm:gap-2">
            <div className={`flex size-8 items-center justify-center rounded-full text-xs font-medium transition-all sm:size-9 sm:text-sm ${step > i + 1 ? "bg-primary text-primary-foreground" : step === i + 1 ? "bg-primary/15 text-primary ring-2 ring-primary" : "bg-muted text-muted-foreground"}`}>
              {step > i + 1 ? <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" /> : i + 1}
            </div>
            <span className={`hidden text-xs font-medium sm:block sm:text-sm ${step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            {i < steps.length - 1 && <Separator orientation="vertical" className="h-5 mx-0.5 sm:h-6 sm:mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Service Configuration */}
      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-5 text-primary" />
                Shipment Category
              </CardTitle>
              <CardDescription>Choose your shipment type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {SERVICE_OPTIONS.category.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateForm("category", opt.value)}
                    className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${form.category === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-primary/40"}`}
                  >
                    <div className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${opt.color} text-white`}>
                      <HugeiconsIcon icon={opt.icon} strokeWidth={2} className="size-5" />
                    </div>
                    <div>
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </div>
                    {form.category === opt.value && (
                      <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Airplane01Icon} strokeWidth={2} className="size-5 text-primary" />
                Transport Mode
              </CardTitle>
              <CardDescription>How should your package travel?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-5">
                {SERVICE_OPTIONS.transportMode.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateForm("transportMode", opt.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all ${form.transportMode === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-primary/40"}`}
                  >
                    <div className={`flex size-10 items-center justify-center rounded-lg ${form.transportMode === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <HugeiconsIcon icon={opt.icon} strokeWidth={2} className="size-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={FlashIcon} strokeWidth={2} className="size-5 text-primary" />
                Service Level
              </CardTitle>
              <CardDescription>Choose delivery speed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {SERVICE_OPTIONS.serviceLevel.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateForm("serviceLevel", opt.value)}
                    className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${form.serviceLevel === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-primary/40"}`}
                  >
                    {(opt as any).badge && (
                      <Badge variant="secondary" className="absolute top-2 right-2 text-xs">{(opt as any).badge}</Badge>
                    )}
                    <div className={`flex size-10 items-center justify-center rounded-lg ${form.serviceLevel === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <HugeiconsIcon icon={opt.icon} strokeWidth={2} className="size-5" />
                    </div>
                    <div>
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Home02Icon} strokeWidth={2} className="size-5 text-primary" />
                Fulfillment Type
              </CardTitle>
              <CardDescription>Pickup and delivery options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SERVICE_OPTIONS.fulfillmentType.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateForm("fulfillmentType", opt.value)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${form.fulfillmentType === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-primary/40"}`}
                  >
                    <div className={`flex size-9 items-center justify-center rounded-lg ${form.fulfillmentType === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <HugeiconsIcon icon={opt.icon} strokeWidth={2} className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => setStep(2)}>
              Continue to Package
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Package Details */}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-5 text-primary" />
                Package Type
              </CardTitle>
              <CardDescription>What kind of package are you sending?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {SERVICE_OPTIONS.packageType.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateForm("packageType", opt.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all ${form.packageType === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-primary/40"}`}
                  >
                    <div className={`flex size-10 items-center justify-center rounded-lg ${form.packageType === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <HugeiconsIcon icon={opt.icon} strokeWidth={2} className="size-5" />
                    </div>
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Scale01Icon} strokeWidth={2} className="size-5 text-primary" />
                Weight & Dimensions
              </CardTitle>
              <CardDescription>Enter package weight and size</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input type="number" min="1" value={form.quantity} onChange={(e) => updateForm("quantity", e.target.value)} placeholder="1" />
              </div>
              <div className="grid gap-2">
                <Label>Actual Weight (kg) <span className="text-destructive">*</span></Label>
                <Input type="number" step="0.01" value={form.actualWeightKg} onChange={(e) => updateForm("actualWeightKg", e.target.value)} placeholder="e.g. 5.5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={RulerIcon} strokeWidth={2} className="size-5 text-primary" />
                Dimensions (cm)
              </CardTitle>
              <CardDescription>Optional — helps calculate volumetric weight</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label>Length</Label>
                  <Input type="number" value={form.lengthCm} onChange={(e) => updateForm("lengthCm", e.target.value)} placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label>Width</Label>
                  <Input type="number" value={form.widthCm} onChange={(e) => updateForm("widthCm", e.target.value)} placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label>Height</Label>
                  <Input type="number" value={form.heightCm} onChange={(e) => updateForm("heightCm", e.target.value)} placeholder="0" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Shield01Icon} strokeWidth={2} className="size-5 text-primary" />
                Insurance & Value
              </CardTitle>
              <CardDescription>Protect your shipment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Declared Value (TZS)</Label>
                <Input type="number" value={form.declaredValue} onChange={(e) => updateForm("declaredValue", e.target.value)} placeholder="0" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="insurance" checked={form.insuranceEnabled} onChange={(e) => updateForm("insuranceEnabled", e.target.checked)} className="size-4 rounded" />
                <Label htmlFor="insurance">Enable insurance coverage</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="fragile" checked={form.isFragile} onChange={(e) => updateForm("isFragile", e.target.checked)} className="size-4 rounded" />
                <Label htmlFor="fragile" className="flex items-center gap-1">
                  <HugeiconsIcon icon={FragileIcon} strokeWidth={2} className="size-4 text-orange-500" />
                  Mark as fragile
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={InformationSquareIcon} strokeWidth={2} className="size-5 text-primary" />
                Description & Notes
              </CardTitle>
              <CardDescription>Tell us what's inside</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Package Contents</Label>
                <Input value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="e.g. Electronics, documents, clothing..." />
              </div>
              <div className="grid gap-2">
                <Label>Additional Notes (optional)</Label>
                <Textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} placeholder="Any special handling instructions..." rows={3} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
              Back
            </Button>
            <Button size="lg" onClick={() => setStep(3)}>
              Continue to Sender
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Sender Info */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-5" />
                </div>
                Sender Information
              </CardTitle>
              <CardDescription>Where is the package being picked up from?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <HugeiconsIcon icon={UserCircleIcon} className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={form.fromFullName} onChange={(e) => updateForm("fromFullName", e.target.value)} placeholder="Sender name" className="ps-9" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Phone <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <HugeiconsIcon icon={Call01Icon} className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={form.fromPhone} onChange={(e) => updateForm("fromPhone", e.target.value)} placeholder="+255..." className="ps-9" />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email (optional)</Label>
                <div className="relative">
                  <HugeiconsIcon icon={Mail01Icon} className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" value={form.fromEmail} onChange={(e) => updateForm("fromEmail", e.target.value)} placeholder="sender@example.com" className="ps-9" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Address Line</Label>
                <div className="relative">
                  <HugeiconsIcon icon={Location01Icon} className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={form.fromLine1} onChange={(e) => updateForm("fromLine1", e.target.value)} placeholder="Street address, building, etc." className="ps-9" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>City <span className="text-destructive">*</span></Label>
                  <Input value={form.fromCity} onChange={(e) => updateForm("fromCity", e.target.value)} placeholder="e.g. Mwanza" />
                </div>
                <div className="grid gap-2">
                  <Label>Country</Label>
                  <Input value={form.fromCountry} onChange={(e) => updateForm("fromCountry", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Region/State</Label>
                  <Input value={form.fromRegion} onChange={(e) => updateForm("fromRegion", e.target.value)} placeholder="e.g. Mwanza" />
                </div>
                <div className="grid gap-2">
                  <Label>Postal Code</Label>
                  <Input value={form.fromPostalCode} onChange={(e) => updateForm("fromPostalCode", e.target.value)} placeholder="e.g. 33100" />
                </div>
                <div className="grid gap-2">
                  <Label>Landmark</Label>
                  <Input value={form.fromLandmark} onChange={(e) => updateForm("fromLandmark", e.target.value)} placeholder="e.g. Near post office" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
              Back
            </Button>
            <Button size="lg" onClick={() => setStep(4)}>
              Continue to Receiver
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Receiver Info */}
      {step === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-5" />
                </div>
                Recipient Information
              </CardTitle>
              <CardDescription>Where is the package being delivered to?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <HugeiconsIcon icon={UserCircleIcon} className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={form.toFullName} onChange={(e) => updateForm("toFullName", e.target.value)} placeholder="Recipient name" className="ps-9" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Phone <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <HugeiconsIcon icon={Call01Icon} className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={form.toPhone} onChange={(e) => updateForm("toPhone", e.target.value)} placeholder="+255..." className="ps-9" />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email (optional)</Label>
                <div className="relative">
                  <HugeiconsIcon icon={Mail01Icon} className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" value={form.toEmail} onChange={(e) => updateForm("toEmail", e.target.value)} placeholder="recipient@example.com" className="ps-9" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Address Line</Label>
                <div className="relative">
                  <HugeiconsIcon icon={Location01Icon} className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={form.toLine1} onChange={(e) => updateForm("toLine1", e.target.value)} placeholder="Street address, building, etc." className="ps-9" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>City <span className="text-destructive">*</span></Label>
                  <Input value={form.toCity} onChange={(e) => updateForm("toCity", e.target.value)} placeholder="e.g. Dar es Salaam" />
                </div>
                <div className="grid gap-2">
                  <Label>Country</Label>
                  <Input value={form.toCountry} onChange={(e) => updateForm("toCountry", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Region/State</Label>
                  <Input value={form.toRegion} onChange={(e) => updateForm("toRegion", e.target.value)} placeholder="e.g. Dar es Salaam" />
                </div>
                <div className="grid gap-2">
                  <Label>Postal Code</Label>
                  <Input value={form.toPostalCode} onChange={(e) => updateForm("toPostalCode", e.target.value)} placeholder="e.g. 14110" />
                </div>
                <div className="grid gap-2">
                  <Label>Landmark</Label>
                  <Input value={form.toLandmark} onChange={(e) => updateForm("toLandmark", e.target.value)} placeholder="e.g. Near mall" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
              Back
            </Button>
            <Button size="lg" onClick={calculateQuote} disabled={loading}>
              <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-4" />
              {loading ? "Calculating..." : "Calculate Quote"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Quote Review */}
      {step === 5 && quoteResult && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-5 text-primary" />
                  Quote Breakdown
                </CardTitle>
                <CardDescription>Detailed pricing for your shipment</CardDescription>
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
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-sm text-muted-foreground">
                  <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-4 text-primary" />
                  Estimated delivery: {quoteResult.etaMin}–{quoteResult.etaMax} days
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={ViewIcon} strokeWidth={2} className="size-5 text-primary" />
                  Shipment Summary
                </CardTitle>
                <CardDescription>Review all details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{form.category.replace(/_/g, " ")}</Badge>
                  <Badge variant="secondary">{form.transportMode}</Badge>
                  <Badge variant="secondary">{form.serviceLevel}</Badge>
                  <Badge variant="secondary">{form.fulfillmentType.replace(/_/g, " ")}</Badge>
                </div>
                <Separator />
                <div className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                    <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-3" />
                    FROM
                  </div>
                  <div className="text-sm font-medium">{form.fromFullName}</div>
                  <div className="text-sm text-muted-foreground">{form.fromLine1}, {form.fromCity}, {form.fromCountry}</div>
                  <div className="text-sm text-muted-foreground">{form.fromPhone}</div>
                </div>
                <div className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-purple-600">
                    <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-3" />
                    TO
                  </div>
                  <div className="text-sm font-medium">{form.toFullName}</div>
                  <div className="text-sm text-muted-foreground">{form.toLine1}, {form.toCity}, {form.toCountry}</div>
                  <div className="text-sm text-muted-foreground">{form.toPhone}</div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Package:</span> <span className="font-medium">{form.packageType}</span></div>
                  <div><span className="text-muted-foreground">Qty:</span> <span className="font-medium">{form.quantity}</span></div>
                  <div><span className="text-muted-foreground">Weight:</span> <span className="font-medium">{form.actualWeightKg} kg</span></div>
                  {form.isFragile && <div><span className="text-orange-500">Fragile</span></div>}
                </div>
                {form.description && (
                  <div className="text-sm"><span className="text-muted-foreground">Contents:</span> <span className="font-medium">{form.description}</span></div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(4)}>
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
              Back
            </Button>
            <Button size="lg" onClick={() => setStep(6)}>
              Continue to Payment
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: Payment & Confirm */}
      {step === 6 && quoteResult && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Wallet01Icon} strokeWidth={2} className="size-5 text-primary" />
                Payment Method
              </CardTitle>
              <CardDescription>How would you like to pay?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {SERVICE_OPTIONS.paymentMethod.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${paymentMethod === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-primary/40"}`}
                  >
                    <div className={`flex size-10 items-center justify-center rounded-lg ${paymentMethod === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <HugeiconsIcon icon={opt.icon} strokeWidth={2} className="size-5" />
                    </div>
                    <div>
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </div>
                    {paymentMethod === opt.value && (
                      <div className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-5 text-primary" />
                Confirm & Create
              </CardTitle>
              <CardDescription>Review the summary and create the shipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 rounded-lg bg-primary/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipment Total</span>
                  <span className="text-lg font-bold text-primary">
                    {quoteResult?.currency} {Number(quoteResult?.total || 0).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {form.fromCity} → {form.toCity} · {form.actualWeightKg} kg · {form.serviceLevel} · {paymentMethod.replace(/_/g, " ")}
                </div>
              </div>

              <Button size="lg" onClick={createShipment} disabled={loading} className="h-12 w-full text-base">
                <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-5" />
                {loading ? "Creating..." : "Confirm & Create Shipment"}
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(5)}>
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
              Back to Quote
            </Button>
          </div>
        </div>
      )}

      {/* Step 7: Confirmation */}
      {step === 7 && createdShipment && (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-10 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Shipment Created!</h2>
            <p className="text-muted-foreground">Your shipment has been booked successfully</p>
          </div>
          <Card className="w-full max-w-md">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tracking Number</span>
                <span className="font-bold text-primary">{createdShipment.shipment?.trackingNumber}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Order Number</span>
                <span className="font-medium">{createdShipment.order?.orderNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="font-bold">{createdShipment.shipment?.currency} {Number(createdShipment.shipment?.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="secondary">{createdShipment.shipment?.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment</span>
                <Badge variant="secondary">{paymentMethod.replace(/_/g, " ")}</Badge>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard/shipments")}>View All Shipments</Button>
            <Button onClick={() => router.push(`/dashboard/shipments/${createdShipment.shipment?.id}`)}>Track This Shipment</Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
