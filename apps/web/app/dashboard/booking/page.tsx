"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Separator } from "@workspace/ui/components/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package02Icon, TruckIcon, Train01Icon, Airplane01Icon, ShipIcon,
  MapPinIcon, ArrowRight01Icon, CheckmarkCircle02Icon,
  SparklesIcon, AlertCircleIcon, BoxIcon, CalculatorIcon,
  Shield01Icon, Clock01Icon, WeightScaleIcon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { api } from "@/lib/api"
import { formatMoney, formatNumber } from "@/lib/format"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const CARGO_TYPES = [
  { value: "DOCUMENT", label: "Document", icon: "📄", description: "Letters, contracts, certificates" },
  { value: "PARCEL", label: "Parcel", icon: "📦", description: "Small to medium packages" },
  { value: "COMMERCIAL_CARGO", label: "Commercial Cargo", icon: "🏭", description: "Business goods and inventory" },
  { value: "ECOMMERCE_ORDER", label: "E-commerce Order", icon: "🛒", description: "Online store orders" },
  { value: "PALLET", label: "Pallet", icon: "🚢", description: "Palletized goods" },
  { value: "PERISHABLE_CARGO", label: "Perishable Cargo", icon: "🥬", description: "Food, flowers, temperature-sensitive" },
  { value: "FRAGILE_CARGO", label: "Fragile Cargo", icon: "🍷", description: "Glass, electronics, breakables" },
  { value: "MACHINERY_EQUIPMENT", label: "Machinery / Equipment", icon: "⚙️", description: "Heavy equipment and machinery" },
  { value: "OTHER", label: "Other", icon: "📦", description: "Any other type of cargo" },
]

const SERVICE_LEVELS = [
  { value: "STANDARD", label: "Standard" },
  { value: "EXPRESS", label: "Express" },
  { value: "SAME_DAY", label: "Same Day" },
  { value: "NEXT_DAY", label: "Next Day" },
  { value: "ECONOMY", label: "Economy" },
  { value: "PRIORITY", label: "Priority" },
]

const FULFILLMENT_TYPES = [
  { value: "DOOR_TO_DOOR", label: "Door to Door" },
  { value: "DOOR_TO_PICKUP", label: "Door to Pickup Point" },
  { value: "PICKUP_TO_DOOR", label: "Pickup Point to Door" },
  { value: "PICKUP_TO_PICKUP", label: "Pickup Point to Pickup Point" },
]

const MODE_ICONS: Record<string, any> = {
  ROAD: TruckIcon,
  RAIL: Train01Icon,
  AIR: Airplane01Icon,
  SEA: ShipIcon,
  COURIER: TruckIcon,
}

const MODE_LABELS: Record<string, string> = {
  ROAD: "Road Transport",
  RAIL: "SGR Rail",
  AIR: "Air Cargo",
  SEA: "Sea Freight",
  COURIER: "Courier",
}

const VEHICLE_LABELS: Record<string, string> = {
  MOTORCYCLE: "Boda Boda",
  CAR: "Car",
  VAN: "Van / Kirikuu",
  PICKUP: "Pickup Truck",
  TRUCK: "Commercial Truck",
  TRAILER: "Large Truck / Trailer",
  SGR_PARCEL: "SGR Parcel",
  AIR_CARGO: "Air Cargo",
  CONTAINER: "Container",
}

export default function UniversalBookingPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [recommending, setRecommending] = React.useState(false)
  const [recommendations, setRecommendations] = React.useState<any[]>([])
  const [quotes, setQuotes] = React.useState<any[]>([])
  const [selectedMode, setSelectedMode] = React.useState<string | null>(null)
  const [bookingResult, setBookingResult] = React.useState<any>(null)

  // Form state
  const [cargoType, setCargoType] = React.useState("PARCEL")
  const [description, setDescription] = React.useState("")
  const [quantity, setQuantity] = React.useState(1)
  const [weightKg, setWeightKg] = React.useState("")
  const [lengthCm, setLengthCm] = React.useState("")
  const [widthCm, setWidthCm] = React.useState("")
  const [heightCm, setHeightCm] = React.useState("")
  const [cargoValue, setCargoValue] = React.useState("")
  const [specialHandling, setSpecialHandling] = React.useState<string[]>([])

  const [fromName, setFromName] = React.useState("")
  const [fromPhone, setFromPhone] = React.useState("")
  const [fromLine1, setFromLine1] = React.useState("")
  const [fromCity, setFromCity] = React.useState("")
  const [fromCountry, setFromCountry] = React.useState("Tanzania")

  const [toName, setToName] = React.useState("")
  const [toPhone, setToPhone] = React.useState("")
  const [toLine1, setToLine1] = React.useState("")
  const [toCity, setToCity] = React.useState("")
  const [toCountry, setToCountry] = React.useState("Tanzania")

  const [serviceLevel, setServiceLevel] = React.useState("STANDARD")
  const [fulfillmentType, setFulfillmentType] = React.useState("DOOR_TO_DOOR")
  const [payer, setPayer] = React.useState("SENDER")
  const [insuranceEnabled, setInsuranceEnabled] = React.useState(false)
  const [prohibitedAccepted, setProhibitedAccepted] = React.useState(false)

  async function handleRecommend() {
    if (!weightKg || !fromCity || !toCity) {
      toast.error("Please fill in weight and cities first")
      return
    }

    setRecommending(true)
    try {
      const res = await api.booking.recommend({
        weightKg: Number(weightKg),
        lengthCm: lengthCm ? Number(lengthCm) : undefined,
        widthCm: widthCm ? Number(widthCm) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        originCity: fromCity,
        destinationCity: toCity,
        originCountry: fromCountry,
        destCountry: toCountry,
        cargoType,
        serviceLevel,
      })

      setRecommendations(res.data.recommendations || [])
      setQuotes(res.data.quotes || [])
      if (res.data.recommendations.length > 0) {
        setSelectedMode(res.data.recommendations[0].transportMode)
        toast.success(`${res.data.recommendations.length} transport options found!`)
      } else {
        toast.info("No automatic recommendations. Select a mode manually.")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to get recommendations")
    } finally {
      setRecommending(false)
    }
  }

  async function handleCreateBooking() {
    if (!description || !weightKg || !fromName || !fromPhone || !fromLine1 || !fromCity ||
        !toName || !toPhone || !toLine1 || !toCity) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!prohibitedAccepted) {
      toast.error("Please accept the Prohibited & Restricted Goods Declaration")
      return
    }

    setLoading(true)
    try {
      const res = await api.booking.create({
        cargoType,
        description,
        quantity: Number(quantity),
        weightKg: Number(weightKg),
        lengthCm: lengthCm ? Number(lengthCm) : undefined,
        widthCm: widthCm ? Number(widthCm) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        cargoValue: cargoValue ? Number(cargoValue) : undefined,
        specialHandling,
        fromAddress: {
          fullName: fromName,
          phone: fromPhone,
          line1: fromLine1,
          city: fromCity,
          country: fromCountry,
        },
        toAddress: {
          fullName: toName,
          phone: toPhone,
          line1: toLine1,
          city: toCity,
          country: toCountry,
        },
        serviceLevel,
        fulfillmentType,
        payer: payer as any,
        insuranceEnabled,
        transportMode: selectedMode || undefined,
        prohibitedGoodsAccepted: prohibitedAccepted,
      })

      setBookingResult(res.data)
      setStep(4)
      toast.success(`Booking created! Tracking: ${res.data.shipment.trackingNumber}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking")
    } finally {
      setLoading(false)
    }
  }

  const selectedQuote = quotes.find((q) => q.transportMode === selectedMode)

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "New Booking" }]}>
      <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
        <PageHeader
          title="New Shipment Booking"
          description="Send anything, anywhere — Road, SGR, Air Cargo, or International"
        />

        {/* Step indicator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { num: 1, label: "Cargo Details" },
            { num: 2, label: "Addresses" },
            { num: 3, label: "Mode & Pricing" },
            { num: 4, label: "Confirmation" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s.num ? <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" /> : s.num}
              </div>
              <span className={`text-sm ${step >= s.num ? "font-medium" : "text-muted-foreground"}`}>{s.label}</span>
              {s.num < 4 && <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step 1: Cargo Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={BoxIcon} className="size-5" />
                What do you want to send?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cargo type selection */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {CARGO_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => setCargoType(ct.value)}
                    className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all hover:border-primary ${
                      cargoType === ct.value ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                    }`}
                  >
                    <span className="text-2xl">{ct.icon}</span>
                    <span className="text-sm font-medium">{ct.label}</span>
                    <span className="text-xs text-muted-foreground">{ct.description}</span>
                  </button>
                ))}
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your cargo..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input id="weight" type="number" step="0.01" min={0.01} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="e.g. 5.5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input id="length" type="number" step="0.1" value={lengthCm} onChange={(e) => setLengthCm(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input id="width" type="number" step="0.1" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" type="number" step="0.1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cargoValue">Cargo Value (TZS)</Label>
                  <Input id="cargoValue" type="number" value={cargoValue} onChange={(e) => setCargoValue(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label>Special Handling</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Fragile", "This Side Up", "Keep Dry", "Perishable", "High Value"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (specialHandling.includes(tag)) {
                            setSpecialHandling(specialHandling.filter((s) => s !== tag))
                          } else {
                            setSpecialHandling([...specialHandling, tag])
                          }
                        }}
                        className={`rounded-full border px-3 py-1 text-xs transition-all ${
                          specialHandling.includes(tag) ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!description || !weightKg}>
                  Next: Addresses
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Addresses */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={MapPinIcon} className="size-5" />
                  Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="fromName">Sender Name *</Label>
                    <Input id="fromName" value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="fromPhone">Sender Phone *</Label>
                    <Input id="fromPhone" value={fromPhone} onChange={(e) => setFromPhone(e.target.value)} placeholder="+255..." />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fromLine1">Address Line 1 *</Label>
                  <Input id="fromLine1" value={fromLine1} onChange={(e) => setFromLine1(e.target.value)} placeholder="Street address" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="fromCity">City *</Label>
                    <Input id="fromCity" value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="Dar es Salaam" />
                  </div>
                  <div>
                    <Label htmlFor="fromCountry">Country</Label>
                    <Input id="fromCountry" value={fromCountry} onChange={(e) => setFromCountry(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={MapPinIcon} className="size-5" />
                  Delivery Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="toName">Receiver Name *</Label>
                    <Input id="toName" value={toName} onChange={(e) => setToName(e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <Label htmlFor="toPhone">Receiver Phone *</Label>
                    <Input id="toPhone" value={toPhone} onChange={(e) => setToPhone(e.target.value)} placeholder="+255..." />
                  </div>
                </div>
                <div>
                  <Label htmlFor="toLine1">Address Line 1 *</Label>
                  <Input id="toLine1" value={toLine1} onChange={(e) => setToLine1(e.target.value)} placeholder="Street address" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="toCity">City *</Label>
                    <Input id="toCity" value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="Dodoma" />
                  </div>
                  <div>
                    <Label htmlFor="toCountry">Country</Label>
                    <Input id="toCountry" value={toCountry} onChange={(e) => setToCountry(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={!fromName || !fromPhone || !fromLine1 || !fromCity || !toName || !toPhone || !toLine1 || !toCity}>
                Next: Mode & Pricing
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Mode & Pricing */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={SparklesIcon} className="size-5" />
                  Intelligent Mode Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <Label>Service Level</Label>
                    <Select value={serviceLevel} onValueChange={(v) => setServiceLevel(v ?? "STANDARD")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SERVICE_LEVELS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Delivery Type</Label>
                    <Select value={fulfillmentType} onValueChange={(v) => setFulfillmentType(v ?? "DOOR_TO_DOOR")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FULFILLMENT_TYPES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Who Pays?</Label>
                    <Select value={payer} onValueChange={(v) => setPayer(v ?? "SENDER")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SENDER">Sender Pays</SelectItem>
                        <SelectItem value="RECEIVER">Receiver Pays</SelectItem>
                        <SelectItem value="COMPANY_ACCOUNT">Company Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Insurance</Label>
                    <div className="flex h-9 items-center gap-2">
                      <input
                        type="checkbox"
                        id="insurance"
                        checked={insuranceEnabled}
                        onChange={(e) => setInsuranceEnabled(e.target.checked)}
                        className="size-4 rounded border-input"
                      />
                      <Label htmlFor="insurance" className="cursor-pointer text-sm">Enable insurance</Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleRecommend} disabled={recommending} variant="secondary" className="w-full">
                  <HugeiconsIcon icon={CalculatorIcon} className="size-4" />
                  {recommending ? "Analyzing..." : "Get Smart Recommendations"}
                </Button>

                {recommending && (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                  </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Recommended Transport Options</Label>
                    {recommendations.map((rec, i) => {
                      const ModeIcon = MODE_ICONS[rec.transportMode] || TruckIcon
                      const quote = quotes.find((q) => q.transportMode === rec.transportMode)
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedMode(rec.transportMode)}
                          className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all hover:border-primary ${
                            selectedMode === rec.transportMode ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                          }`}
                        >
                          <div className={`flex size-12 items-center justify-center rounded-lg bg-gradient-to-br ${
                            rec.transportMode === "AIR" ? "from-purple-500 to-pink-500" :
                            rec.transportMode === "RAIL" ? "from-green-500 to-emerald-600" :
                            "from-blue-500 to-cyan-500"
                          }`}>
                            <HugeiconsIcon icon={ModeIcon} className="size-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{MODE_LABELS[rec.transportMode]}</span>
                              {rec.vehicleCategory && VEHICLE_LABELS[rec.vehicleCategory] && (
                                <Badge variant="secondary" className="text-xs">{VEHICLE_LABELS[rec.vehicleCategory]}</Badge>
                              )}
                              <Badge className={rec.confidence === "HIGH" ? "bg-green-500" : "bg-yellow-500"} variant="default">
                                {rec.confidence}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{rec.reason}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><HugeiconsIcon icon={Clock01Icon} className="size-3" />{rec.estimatedDays}</span>
                              {quote && <span className="font-medium text-primary">{formatMoney(quote.total)}</span>}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Selected quote breakdown */}
                {selectedQuote && (
                  <Card className="bg-muted/30">
                    <CardContent className="space-y-2 pt-4">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(selectedQuote.subtotal)}</span></div>
                      {Object.entries(selectedQuote.fees || {}).map(([key, val]: any) => (
                        <div key={key} className="flex justify-between text-sm"><span className="text-muted-foreground">{key.replace(/_/g, " ").toLowerCase()}</span><span>{formatMoney(val)}</span></div>
                      ))}
                      {selectedQuote.insurancePremium > 0 && (
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Insurance</span><span>{formatMoney(selectedQuote.insurancePremium)}</span></div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-medium"><span>Total</span><span className="text-primary">{formatMoney(selectedQuote.total)}</span></div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <HugeiconsIcon icon={WeightScaleIcon} className="size-3" />
                        Chargeable weight: {formatNumber(selectedQuote.chargeableWeightKg)} kg
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Prohibited goods declaration */}
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <input
                    type="checkbox"
                    id="prohibited"
                    checked={prohibitedAccepted}
                    onChange={(e) => setProhibitedAccepted(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-input"
                  />
                  <Label htmlFor="prohibited" className="cursor-pointer text-sm">
                    I confirm this shipment does not contain prohibited or restricted goods including
                    illegal drugs, weapons, explosives, or any items restricted by Tanzanian law.
                  </Label>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleCreateBooking} disabled={loading || !selectedMode || !prohibitedAccepted}>
                    {loading ? "Creating..." : "Confirm Booking"}
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && bookingResult && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 pt-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Booking Confirmed!</h2>
                <p className="text-muted-foreground">Your shipment has been created successfully</p>
              </div>

              <div className="w-full max-w-md space-y-3 rounded-lg border p-4 text-left">
                <div className="flex justify-between"><span className="text-muted-foreground">Tracking Number</span><span className="font-mono font-bold text-primary">{bookingResult.shipment.trackingNumber}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Transport Mode</span><span>{MODE_LABELS[bookingResult.transportMode]}</span></div>
                {bookingResult.vehicleCategory && VEHICLE_LABELS[bookingResult.vehicleCategory] && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Vehicle</span><span>{VEHICLE_LABELS[bookingResult.vehicleCategory]}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Total Amount</span><span className="font-bold">{formatMoney(bookingResult.shipment.totalAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Payment Status</span><Badge variant="outline">Pending</Badge></div>
                <Separator />
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">From</span><span>{bookingResult.shipment.fromAddress?.city}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">To</span><span>{bookingResult.shipment.toAddress?.city}</span></div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push(`/dashboard/shipments/${bookingResult.shipment.id}`)}>
                  View Shipment
                </Button>
                <Button onClick={() => {
                  setStep(1)
                  setBookingResult(null)
                  setRecommendations([])
                  setQuotes([])
                  setSelectedMode(null)
                  setDescription("")
                  setWeightKg("")
                  setFromName("")
                  setFromPhone("")
                  setFromLine1("")
                  setToName("")
                  setToPhone("")
                  setToLine1("")
                }}>
                  New Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
