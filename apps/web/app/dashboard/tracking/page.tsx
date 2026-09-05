"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { api, ApiError } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon, MapIcon, Package02Icon, TruckIcon, Train01Icon, Airplane01Icon, CheckmarkCircle02Icon, ClockIcon, WarehouseIcon, PackageReceiveIcon, ContainerIcon, SendIcon } from "@hugeicons/core-free-icons"

const MODE_FLOWS: Record<string, { key: string; label: string; icon: any }[]> = {
  ROAD: [
    { key: "BOOKED", label: "Booked", icon: Package02Icon },
    { key: "ASSIGNED", label: "Driver Assigned", icon: TruckIcon },
    { key: "PICKED_UP", label: "Picked Up", icon: PackageReceiveIcon },
    { key: "IN_TRANSIT", label: "In Transit", icon: TruckIcon },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: SendIcon },
    { key: "DELIVERED", label: "Delivered", icon: CheckmarkCircle02Icon },
  ],
  RAIL: [
    { key: "BOOKED", label: "SGR Booking Created", icon: Package02Icon },
    { key: "RECEIVED_AT_STATION", label: "Received at Station", icon: WarehouseIcon },
    { key: "WEIGHED", label: "Verified & Weighed", icon: CheckmarkCircle02Icon },
    { key: "CONSOLIDATED", label: "Consolidated", icon: ContainerIcon },
    { key: "LOADED", label: "Loaded on Train", icon: Train01Icon },
    { key: "IN_TRANSIT", label: "Rail Transit", icon: Train01Icon },
    { key: "ARRIVED_AT_DESTINATION", label: "Arrived at Destination", icon: WarehouseIcon },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: SendIcon },
    { key: "DELIVERED", label: "Delivered", icon: CheckmarkCircle02Icon },
  ],
  AIR: [
    { key: "BOOKED", label: "Air Cargo Booking", icon: Package02Icon },
    { key: "CARGO_ACCEPTED", label: "Cargo Accepted", icon: PackageReceiveIcon },
    { key: "WEIGHED", label: "Weighed & Labeled", icon: CheckmarkCircle02Icon },
    { key: "LOADED", label: "Loaded on Flight", icon: Airplane01Icon },
    { key: "IN_TRANSIT", label: "Air Transit", icon: Airplane01Icon },
    { key: "ARRIVED_AT_AIRPORT", label: "Arrived at Airport", icon: WarehouseIcon },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: SendIcon },
    { key: "DELIVERED", label: "Delivered", icon: CheckmarkCircle02Icon },
  ],
}

const MODE_ICONS: Record<string, any> = {
  ROAD: TruckIcon,
  RAIL: Train01Icon,
  AIR: Airplane01Icon,
}

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function trackShipment() {
    if (!trackingNumber.trim()) return
    setLoading(true)
    setError("")
    setData(null)
    try {
      const result = await api.tracking.trackShipment(trackingNumber.trim())
      setData(result.data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to track shipment")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tracking" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Track Shipment</h1>
        <p className="text-sm text-muted-foreground">Enter a tracking number to see real-time status</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <HugeiconsIcon icon={SearchIcon} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="e.g. XRD-2026-000928"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && trackShipment()}
                className="pl-9"
              />
            </div>
            <Button onClick={trackShipment} disabled={loading}>
              {loading ? "Tracking..." : "Track"}
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {data && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Shipment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tracking #</span>
                <span className="font-medium">{data.shipment.trackingNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="secondary">{data.shipment.status?.replace(/_/g, " ")}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transport</span>
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {data.shipment.transportMode && MODE_ICONS[data.shipment.transportMode] && (
                    <HugeiconsIcon icon={MODE_ICONS[data.shipment.transportMode]} className="size-4" />
                  )}
                  {data.shipment.transportMode}
                </span>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">FROM</span>
                <p className="text-sm">{data.shipment.fromAddress?.city}, {data.shipment.fromAddress?.country}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">TO</span>
                <p className="text-sm">{data.shipment.toAddress?.city}, {data.shipment.toAddress?.country}</p>
              </div>
              {data.shipment.estimatedDelivery && (
                <div className="flex items-center gap-2 text-sm">
                  <HugeiconsIcon icon={ClockIcon} className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ETA: {new Date(data.shipment.estimatedDelivery).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mode-Specific Status Flow */}
          {data.shipment.transportMode && MODE_FLOWS[data.shipment.transportMode] && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {MODE_ICONS[data.shipment.transportMode] && (
                    <HugeiconsIcon icon={MODE_ICONS[data.shipment.transportMode]} className="size-5 text-primary" />
                  )}
                  {data.shipment.transportMode === "ROAD" ? "Road Delivery" : data.shipment.transportMode === "RAIL" ? "SGR Rail" : "Air Cargo"} Status Flow
                </CardTitle>
                <CardDescription>Progress through the {data.shipment.transportMode.toLowerCase()} delivery pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {MODE_FLOWS[data.shipment.transportMode]!.map((step, i) => {
                    const currentStatus = data.shipment.status
                    const flow = MODE_FLOWS[data.shipment.transportMode]!
                    const currentIdx = flow.findIndex(s => s.key === currentStatus)
                    const isCompleted = currentIdx > i
                    const isCurrent = currentIdx === i
                    const isPending = currentIdx < i
                    return (
                      <div
                        key={step.key}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                          isCompleted ? "border-green-200 bg-green-50 dark:bg-green-950/20" :
                          isCurrent ? "border-primary bg-primary/5" :
                          "border-muted bg-muted/30"
                        }`}
                      >
                        <div className={`flex size-7 items-center justify-center rounded-full ${
                          isCompleted ? "bg-green-500 text-white" :
                          isCurrent ? "bg-primary text-primary-foreground" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          <HugeiconsIcon icon={step.icon} className="size-3.5" />
                        </div>
                        <span className={`text-xs font-medium ${isPending ? "text-muted-foreground" : ""}`}>
                          {step.label}
                        </span>
                        {isCompleted && (
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-green-600" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
              <CardDescription>Shipment status history and events</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const events = (data.events || []).map((e: any) => ({
                  id: e.id,
                  event: e.event,
                  description: e.description,
                  location: e.location,
                  createdAt: e.createdAt,
                }))
                const timeline = (data.timeline || []).map((t: any) => ({
                  id: t.id,
                  event: `STATUS_${t.status}`,
                  description: t.notes || `Status changed to ${t.status?.replace(/_/g, " ").toLowerCase()}`,
                  location: t.location,
                  createdAt: t.createdAt,
                }))
                const combined = [...events, ...timeline].sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )

                if (combined.length === 0) {
                  return <p className="text-sm text-muted-foreground py-8 text-center">No tracking events yet</p>
                }

                return (
                  <div className="relative space-y-6 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-border">
                    {combined.map((event: any, i: number) => (
                      <div key={event.id} className="relative flex gap-4">
                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          <HugeiconsIcon icon={i === 0 ? TruckIcon : CheckmarkCircle02Icon} className="size-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <span className="font-medium text-sm">{event.event?.replace(/_/g, " ").toLowerCase()}</span>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          {event.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <HugeiconsIcon icon={MapIcon} className="size-3" />
                              {event.location}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
