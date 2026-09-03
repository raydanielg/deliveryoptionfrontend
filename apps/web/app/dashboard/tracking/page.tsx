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
import { SearchIcon, MapIcon, Package02Icon, TruckIcon, CheckmarkCircle02Icon, ClockIcon } from "@hugeicons/core-free-icons"

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
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
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
                <span className="text-sm font-medium">{data.shipment.transportMode}</span>
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
                  <HugeiconsIcon icon={ClockIcon} strokeWidth={2} className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ETA: {new Date(data.shipment.estimatedDelivery).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
              <CardDescription>All tracking events for this shipment</CardDescription>
            </CardHeader>
            <CardContent>
              {data.events && data.events.length > 0 ? (
                <div className="relative space-y-6 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-border">
                  {data.events.map((event: any, i: number) => (
                    <div key={event.id} className="relative flex gap-4">
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <HugeiconsIcon icon={i === 0 ? TruckIcon : CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="font-medium text-sm">{event.event?.replace(/_/g, " ")}</span>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        {event.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-3" />
                            {event.location}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No tracking events yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
