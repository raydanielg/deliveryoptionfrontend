"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  TruckIcon,
  Navigation01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Clock01Icon,
  Package02Icon,
  RefreshCwIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

type Tab = "active" | "exceptions" | "completed" | "capacity"

export default function TripsPage() {
  const [overview, setOverview] = React.useState<any>(null)
  const [trips, setTrips] = React.useState<any[]>([])
  const [capacity, setCapacity] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [tab, setTab] = React.useState<Tab>("active")
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    try {
      const [ov, tripData] = await Promise.all([
        api.trips.overview(),
        api.trips.list("status=ASSIGNED&status=ACCEPTED&status=ARRIVED_PICKUP&status=CARGO_VERIFIED&status=PICKED_UP&status=IN_TRANSIT&status=ARRIVED_DESTINATION&status=DELIVERED&status=EXCEPTION&limit=50"),
      ])
      setOverview(ov.data)
      setTrips(tripData.data || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load trips")
    } finally {
      setLoading(false)
    }
  }

  async function loadCapacity() {
    try {
      const res = await api.transport.listCapacity("status=AVAILABLE&limit=20")
      setCapacity(res.data || [])
    } catch {
      setCapacity([])
    }
  }

  async function loadExceptions() {
    try {
      const res = await api.trips.list("status=EXCEPTION&limit=20")
      setTrips(res.data || [])
    } catch {
      setTrips([])
    }
  }

  async function loadCompleted() {
    try {
      const res = await api.trips.list("status=COMPLETED&limit=20")
      setTrips(res.data || [])
    } catch {
      setTrips([])
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  React.useEffect(() => {
    if (tab === "capacity") loadCapacity()
    else if (tab === "exceptions") loadExceptions()
    else if (tab === "completed") loadCompleted()
    else loadData()
  }, [tab])

  async function resolveException(tripId: string, exceptionId: string, resolution: string) {
    setActionLoading(`resolve-${tripId}`)
    try {
      await api.trips.resolveException(tripId, { exceptionId, resolution })
      toast.success("Exception resolved")
      loadExceptions()
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve")
    } finally {
      setActionLoading(null)
    }
  }

  async function completeTrip(tripId: string) {
    setActionLoading(`complete-${tripId}`)
    try {
      await api.trips.complete(tripId)
      toast.success("Trip completed")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed")
    } finally {
      setActionLoading(null)
    }
  }

  async function cancelCapacity(id: string) {
    setActionLoading(`cancel-cap-${id}`)
    try {
      await api.transport.cancelCapacity(id)
      toast.success("Capacity cancelled")
      loadCapacity()
    } catch (err: any) {
      toast.error(err.message || "Failed")
    } finally {
      setActionLoading(null)
    }
  }

  const stats = overview?.stats

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Trips" }]}>
      <PageHeader
        title="Trip Control Tower"
        description="Monitor all transport trips, exceptions, and partner capacity"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <HugeiconsIcon icon={TruckIcon} className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{stats?.total ?? 0}</p>}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <HugeiconsIcon icon={Clock01Icon} className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{stats?.active ?? 0}</p>}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <HugeiconsIcon icon={Navigation01Icon} className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Transit</p>
              {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{stats?.inTransit ?? 0}</p>}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-50 p-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{stats?.delivered ?? 0}</p>}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exceptions</p>
              {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{stats?.exceptions ?? 0}</p>}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <HugeiconsIcon icon={Package02Icon} className="size-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-2xl font-bold">{stats?.completed ?? 0}</p>}
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {([
          ["active", "Active Trips"],
          ["exceptions", "Exceptions"],
          ["completed", "Completed"],
          ["capacity", "Transport Capacity"],
        ] as [Tab, string][]).map(([key, label]) => (
          <Button
            key={key}
            variant={tab === key ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Content */}
      {tab === "capacity" ? (
        <div className="space-y-3">
          {capacity.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No available transport capacity published
            </Card>
          ) : (
            capacity.map((cap) => (
              <Card key={cap.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{cap.vehicleType}</Badge>
                      <span className="text-sm font-semibold">{cap.routeLabel || `${cap.originCity} → ${cap.destCity}`}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Capacity: {Number(cap.capacityKg).toFixed(0)} kg
                      {cap.volumeM3 ? ` · ${Number(cap.volumeM3).toFixed(1)} m³` : ""}
                      {cap.registrationNo ? ` · ${cap.registrationNo}` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Available: {new Date(cap.availableFrom).toLocaleDateString()} → {new Date(cap.availableTo).toLocaleDateString()}
                      {cap.askingPrice ? ` · Asking: ${Number(cap.askingPrice).toLocaleString()} ${cap.currency}${cap.pricePerKg ? "/kg" : ""}` : ""}
                    </div>
                    {cap.partner && (
                      <div className="text-xs text-muted-foreground">
                        Partner: {cap.partner.name} ({cap.partner.health})
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelCapacity(cap.id)}
                    disabled={actionLoading === `cancel-cap-${cap.id}`}
                  >
                    <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                    Cancel
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-16 w-full" />
              </Card>
            ))
          ) : trips.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No trips found
            </Card>
          ) : (
            trips.map((trip) => (
              <Card key={trip.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{trip.tripNumber}</span>
                      <TripStatusBadge status={trip.status} />
                      <span className="text-sm text-muted-foreground">{trip.shipment?.trackingNumber}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trip.shipment?.fromAddress?.city} → {trip.shipment?.toAddress?.city}
                      {" · "}{Number(trip.shipment?.chargeableWeightKg || 0).toFixed(1)} kg
                      {" · "}{trip.shipment?.serviceLevel || "Standard"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Driver: {trip.driver?.user?.name || "N/A"}
                      {trip.vehicle ? ` · Vehicle: ${trip.vehicle.registrationNo}` : ""}
                      {trip.partner ? ` · Partner: ${trip.partner.name}` : ""}
                    </div>
                    {trip.status === "EXCEPTION" && trip.exceptions?.length > 0 && (
                      <div className="mt-2 p-2 rounded-md bg-red-50 border border-red-200">
                        <p className="text-sm font-medium text-red-700">
                          {trip.exceptions[0].type}: {trip.exceptions[0].reason}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Reported: {new Date(trip.exceptions[0].reportedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {trip.status === "EXCEPTION" && trip.exceptions?.length > 0 && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => resolveException(trip.id, trip.exceptions[0].id, "REASSIGN")}
                          disabled={actionLoading === `resolve-${trip.id}`}
                        >
                          Reassign
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveException(trip.id, trip.exceptions[0].id, "RETRY")}
                          disabled={actionLoading === `resolve-${trip.id}`}
                        >
                          Retry
                        </Button>
                      </>
                    )}
                    {trip.status === "POD_COMPLETE" && (
                      <Button
                        size="sm"
                        onClick={() => completeTrip(trip.id)}
                        disabled={actionLoading === `complete-${trip.id}`}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Settlements summary */}
      {overview?.pendingSettlements && (
        <Card className="mt-6 p-4">
          <h3 className="text-sm font-semibold mb-3">Pending Settlements</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Customer Revenue</p>
              <p className="text-lg font-bold">
                {Number(overview.pendingSettlements.customerPrice).toLocaleString()} TZS
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Provider Payout</p>
              <p className="text-lg font-bold text-amber-600">
                {Number(overview.pendingSettlements.providerSettlement).toLocaleString()} TZS
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Xerin Margin</p>
              <p className="text-lg font-bold text-green-600">
                {Number(overview.pendingSettlements.xerinMargin).toLocaleString()} TZS
              </p>
            </div>
          </div>
        </Card>
      )}
    </DashboardLayout>
  )
}

function TripStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    CREATED: "bg-blue-100 text-blue-700",
    ASSIGNED: "bg-blue-100 text-blue-700",
    ACCEPTED: "bg-purple-100 text-purple-700",
    ARRIVED_PICKUP: "bg-amber-100 text-amber-700",
    CARGO_VERIFIED: "bg-amber-100 text-amber-700",
    PICKED_UP: "bg-green-100 text-green-700",
    IN_TRANSIT: "bg-green-100 text-green-700",
    ARRIVED_DESTINATION: "bg-cyan-100 text-cyan-700",
    DELIVERED: "bg-cyan-100 text-cyan-700",
    POD_COMPLETE: "bg-green-100 text-green-700",
    COMPLETED: "bg-green-100 text-green-700",
    EXCEPTION: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-600",
    REASSIGNED: "bg-gray-100 text-gray-600",
  }
  const label = status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  )
}
