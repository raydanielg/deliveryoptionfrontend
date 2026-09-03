"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Package02Icon, CoinsIcon, TruckIcon, MapIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

export default function NewShipmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [quoteResult, setQuoteResult] = useState<any>(null)
  const [createdShipment, setCreatedShipment] = useState<any>(null)

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

  async function calculateQuote() {
    if (!form.fromCity || !form.toCity || !form.actualWeightKg) {
      toast.error("Please fill in origin city, destination city, and weight")
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
      setStep(2)
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
      })

      setCreatedShipment(result.data)
      setStep(3)
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
          <p className="text-sm text-muted-foreground">Create a new shipment and get an instant quote</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4">
        {["Shipment Details", "Quote Review", "Confirmation"].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${step > i + 1 ? "bg-primary text-primary-foreground" : step === i + 1 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              {step > i + 1 ? <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            {i < 2 && <Separator orientation="vertical" className="h-6 mx-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Shipment Configuration</CardTitle>
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
                    <SelectItem value="PICKUP_TO_PICKUP">Pickup Point to Pickup Point</SelectItem>
                    <SelectItem value="WAREHOUSE_TO_DOOR">Warehouse to Door</SelectItem>
                    <SelectItem value="WAREHOUSE_TO_PICKUP">Warehouse to Pickup Point</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Package Details</CardTitle>
              <CardDescription>Weight and dimensions</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Actual Weight (kg)</Label>
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

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
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
                    <Label>Full Name</Label>
                    <Input value={form.fromFullName} onChange={(e) => updateForm("fromFullName", e.target.value)} placeholder="Sender name" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={form.fromPhone} onChange={(e) => updateForm("fromPhone", e.target.value)} placeholder="+255..." />
                  </div>
                  <div className="grid gap-2">
                    <Label>Address Line</Label>
                    <Input value={form.fromLine1} onChange={(e) => updateForm("fromLine1", e.target.value)} placeholder="Street address" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label>City</Label>
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
                    <Label>Full Name</Label>
                    <Input value={form.toFullName} onChange={(e) => updateForm("toFullName", e.target.value)} placeholder="Recipient name" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={form.toPhone} onChange={(e) => updateForm("toPhone", e.target.value)} placeholder="+255..." />
                  </div>
                  <div className="grid gap-2">
                    <Label>Address Line</Label>
                    <Input value={form.toLine1} onChange={(e) => updateForm("toLine1", e.target.value)} placeholder="Street address" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label>City</Label>
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

          <div className="lg:col-span-3 flex justify-end">
            <Button size="lg" onClick={calculateQuote} disabled={loading}>
              <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-4" />
              {loading ? "Calculating..." : "Calculate Quote"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Quote Review */}
      {step === 2 && quoteResult && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
              <CardDescription>Review your pricing before confirming</CardDescription>
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

          <Card>
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
                <span className="font-medium">{form.fromCity}, {form.fromCountry}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">To: </span>
                <span className="font-medium">{form.toCity}, {form.toCountry}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Weight: </span>
                <span className="font-medium">{form.actualWeightKg} kg</span>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button size="lg" onClick={createShipment} disabled={loading}>
              <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-4" />
              {loading ? "Creating..." : "Confirm & Create Shipment"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && createdShipment && (
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
