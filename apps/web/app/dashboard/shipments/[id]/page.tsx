"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatMoney } from "@/lib/format"
import { HugeiconsIcon } from "@hugeicons/react"
import { MapIcon, Package02Icon, TruckIcon, UserIcon, CoinsIcon, ClockIcon, CalendarIcon, CheckmarkCircle02Icon, CancelCircleIcon, Train01Icon, Airplane01Icon, Ticket01Icon } from "@hugeicons/core-free-icons"

export default function ShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [shipment, setShipment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params?.id) loadShipment(params.id as string)
  }, [params?.id])

  async function loadShipment(id: string) {
    setLoading(true)
    try {
      const result = await api.shipments.get(id)
      setShipment(result.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load shipment")
    } finally {
      setLoading(false)
    }
  }

  async function cancelShipment() {
    if (!shipment) return
    try {
      await api.shipments.cancel(shipment.id)
      toast.success("Shipment cancelled")
      loadShipment(shipment.id)
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel shipment")
    }
  }

  if (loading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shipments", href: "/dashboard/shipments" }, { label: "Details" }]}>
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    )
  }

  if (!shipment) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shipments", href: "/dashboard/shipments" }, { label: "Not Found" }]}>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-muted-foreground">Shipment not found</p>
          <Button onClick={() => router.push("/dashboard/shipments")}>Back to Shipments</Button>
        </div>
      </DashboardLayout>
    )
  }

  const events = shipment.trackingEvents || []
  const packages = shipment.packages || []

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Shipments", href: "/dashboard/shipments" }, { label: shipment.trackingNumber }]}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{shipment.trackingNumber}</h1>
          <p className="text-sm text-muted-foreground">Shipment details and tracking timeline</p>
        </div>
        <div className="flex gap-2">
          {!["DELIVERED", "CANCELLED"].includes(shipment.status) && (
            <Button variant="destructive" onClick={cancelShipment}>
              <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} className="size-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: Tracking Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tracking Timeline</CardTitle>
            <CardDescription>Shipment status history and events</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No tracking events yet</p>
            ) : (
              <div className="relative space-y-6 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-border">
                {events.map((event: any, i: number) => (
                  <div key={event.id} className="relative flex gap-4">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <HugeiconsIcon icon={i === 0 ? TruckIcon : CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{event.event?.replace(/_/g, " ")}</span>
                        <Badge variant="secondary" className="text-xs">{event.status?.replace(/_/g, " ")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-3" />
                          {event.location}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Shipment Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <Badge variant="secondary">{shipment.status?.replace(/_/g, " ")}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment</span>
                <Badge variant={shipment.paymentStatus === "PAID" ? "default" : "secondary"}>{shipment.paymentStatus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="text-sm font-medium">{shipment.category?.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transport</span>
                <span className="text-sm font-medium">{shipment.transportMode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Service</span>
                <span className="text-sm font-medium">{shipment.serviceLevel}</span>
              </div>
            </CardContent>
          </Card>

          {(shipment.transportMode === "RAIL" || shipment.transportMode === "AIR") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <HugeiconsIcon icon={shipment.transportMode === "RAIL" ? Train01Icon : Airplane01Icon} strokeWidth={2} className="size-4" />
                  {shipment.transportMode === "RAIL" ? "SGR Rail Details" : "Air Cargo Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shipment.originStation && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Origin</span>
                    <span className="text-sm font-medium">{shipment.originStation.name} — {shipment.originStation.city}</span>
                  </div>
                )}
                {shipment.destinationStation && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Destination</span>
                    <span className="text-sm font-medium">{shipment.destinationStation.name} — {shipment.destinationStation.city}</span>
                  </div>
                )}
                {shipment.trainNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Train Number</span>
                    <span className="text-sm font-medium">{shipment.trainNumber}</span>
                  </div>
                )}
                {shipment.flightNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Flight Number</span>
                    <span className="text-sm font-medium">{shipment.flightNumber}</span>
                  </div>
                )}
                {shipment.awbNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">AWB Number</span>
                    <span className="flex items-center gap-1 text-sm font-medium">
                      <HugeiconsIcon icon={Ticket01Icon} strokeWidth={2} className="size-3.5 text-sky-600" />
                      {shipment.awbNumber}
                    </span>
                  </div>
                )}
                {shipment.cargoType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cargo Type</span>
                    <Badge variant="secondary">{shipment.cargoType.replace(/_/g, " ")}</Badge>
                  </div>
                )}
                {shipment.sgrServiceType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">SGR Service</span>
                    <Badge variant="secondary">{shipment.sgrServiceType.replace(/_/g, " ")}</Badge>
                  </div>
                )}
                {shipment.airCargoServiceType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Air Cargo Service</span>
                    <Badge variant="secondary">{shipment.airCargoServiceType.replace(/_/g, " ")}</Badge>
                  </div>
                )}
                {shipment.shelfBinLocation && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Shelf/Bin</span>
                    <span className="text-sm font-medium">{shipment.shelfBinLocation}</span>
                  </div>
                )}
                {shipment.consolidationBatchId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Consolidation Batch</span>
                    <span className="text-sm font-medium">{shipment.consolidationBatchId}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">FROM</span>
                <p className="text-sm font-medium">{shipment.fromAddress?.fullName}</p>
                <p className="text-sm text-muted-foreground">{shipment.fromAddress?.line1}</p>
                <p className="text-sm text-muted-foreground">{shipment.fromAddress?.city}, {shipment.fromAddress?.country}</p>
                <p className="text-sm text-muted-foreground">{shipment.fromAddress?.phone}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">TO</span>
                <p className="text-sm font-medium">{shipment.toAddress?.fullName}</p>
                <p className="text-sm text-muted-foreground">{shipment.toAddress?.line1}</p>
                <p className="text-sm text-muted-foreground">{shipment.toAddress?.city}, {shipment.toAddress?.country}</p>
                <p className="text-sm text-muted-foreground">{shipment.toAddress?.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Package & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Chargeable Weight</span>
                <span className="text-sm font-medium">{shipment.chargeableWeightKg} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-sm font-bold text-primary">{formatMoney(Number(shipment.totalAmount || 0))}</span>
              </div>
              {shipment.insuranceEnabled && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Insurance</span>
                  <span className="text-sm font-medium">{formatMoney(Number(shipment.insurancePremium || 0))}</span>
                </div>
              )}
              {packages.length > 0 && (
                <>
                  <Separator />
                  <span className="text-xs font-medium text-muted-foreground">PACKAGES ({packages.length})</span>
                  {packages.map((pkg: any) => (
                    <div key={pkg.id} className="flex items-center justify-between text-sm">
                      <span>{pkg.type} — {pkg.weightKg} kg</span>
                      <span className="text-muted-foreground">{pkg.barcode}</span>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          {shipment.driver && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assigned Driver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{shipment.driver.user?.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{shipment.driver.user?.phone}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
