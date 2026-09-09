"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  TruckIcon,
  Radar02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Package02Icon,
  UserGroup02Icon,
  Tap01Icon,
  CancelCircleIcon,
  RefreshCwIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

type Tab = "unassigned" | "open-orders" | "assigned" | "analytics"

export default function DispatchPage() {
  const [overview, setOverview] = React.useState<any>(null)
  const [analytics, setAnalytics] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [tab, setTab] = React.useState<Tab>("unassigned")
  const [selectedShipment, setSelectedShipment] = React.useState<string | null>(null)
  const [eligibleDrivers, setEligibleDrivers] = React.useState<any[]>([])
  const [loadingDrivers, setLoadingDrivers] = React.useState(false)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)
  const [reassignDriver, setReassignDriver] = React.useState("")

  React.useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [ovRes, anRes] = await Promise.all([
        api.dispatch.overview(),
        api.dispatch.analytics(),
      ])
      setOverview(ovRes.data)
      setAnalytics(anRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load dispatch data")
    } finally {
      setLoading(false)
    }
  }

  async function loadEligibleDrivers(shipmentId: string) {
    setSelectedShipment(shipmentId)
    setLoadingDrivers(true)
    try {
      const res = await api.dispatch.getEligibleDrivers(shipmentId)
      setEligibleDrivers(res.data || [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load eligible drivers")
    } finally {
      setLoadingDrivers(false)
    }
  }

  async function openToDrivers(shipmentId: string) {
    setActionLoading(`open-${shipmentId}`)
    try {
      const res = await api.dispatch.openToDrivers(shipmentId, { radiusKm: 50, maxDrivers: 10 })
      toast.success(res.message || "Shipment opened to drivers")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to open shipment to drivers")
    } finally {
      setActionLoading(null)
    }
  }

  async function autoAssign(shipmentId: string) {
    setActionLoading(`auto-${shipmentId}`)
    try {
      const res = await api.dispatch.autoAssign(shipmentId)
      toast.success(res.message || "Auto-assigned successfully")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to auto-assign")
    } finally {
      setActionLoading(null)
    }
  }

  async function cancelOffers(shipmentId: string) {
    setActionLoading(`cancel-${shipmentId}`)
    try {
      const res = await api.dispatch.cancelOffers(shipmentId)
      toast.success(res.message || "Offers cancelled")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel offers")
    } finally {
      setActionLoading(null)
    }
  }

  async function reassign(shipmentId: string) {
    if (!reassignDriver) {
      toast.error("Please select a driver")
      return
    }
    setActionLoading(`reassign-${shipmentId}`)
    try {
      const res = await api.dispatch.reassign(shipmentId, { driverId: reassignDriver, reason: "Dispatcher reassignment" })
      toast.success(res.message || "Shipment reassigned")
      setReassignDriver("")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to reassign")
    } finally {
      setActionLoading(null)
    }
  }

  const stats = overview?.stats

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Dispatch Control Tower" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Dispatch Control Tower"
          description="Smart dispatch engine — direct assignment, driver marketplace & auto-assignment"
          actions={
            <Button variant="outline" onClick={loadData}>
              <HugeiconsIcon icon={Radar02Icon} className="size-4" />
              Refresh
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-2">
                <HugeiconsIcon icon={Package02Icon} className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unassigned</p>
                {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-2xl font-bold">{stats?.unassigned ?? 0}</p>}
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <HugeiconsIcon icon={UserGroup02Icon} className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Orders</p>
                {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-2xl font-bold">{stats?.openOrders ?? 0}</p>}
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned</p>
                {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-2xl font-bold">{stats?.assigned ?? 0}</p>}
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-2">
                <HugeiconsIcon icon={CancelCircleIcon} className="size-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-2xl font-bold">{stats?.failed ?? 0}</p>}
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "unassigned", label: "Unassigned" },
            { key: "open-orders", label: "Open Orders" },
            { key: "assigned", label: "Assigned" },
            { key: "analytics", label: "Analytics" },
          ] as { key: Tab; label: string }[]).map((t) => (
            <Button
              key={t.key}
              variant={tab === t.key ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "unassigned" && (
          <div className="flex flex-col gap-4">
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
            ) : overview?.unassignedShipments?.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">No unassigned shipments</Card>
            ) : (
              overview?.unassignedShipments?.map((s: any) => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{s.trackingNumber}</Badge>
                        <StatusBadge status={s.status} />
                        <Badge variant="outline">{s.serviceLevel}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {s.fromAddress?.city} → {s.toAddress?.city} · {Number(s.chargeableWeightKg).toFixed(1)} kg
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadEligibleDrivers(s.id)}
                      >
                        <HugeiconsIcon icon={UserGroup02Icon} className="size-4" />
                        Find Drivers
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openToDrivers(s.id)}
                        disabled={actionLoading === `open-${s.id}`}
                      >
                        <HugeiconsIcon icon={Tap01Icon} className="size-4" />
                        {actionLoading === `open-${s.id}` ? "Opening..." : "Open to Drivers"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => autoAssign(s.id)}
                        disabled={actionLoading === `auto-${s.id}`}
                      >
                        <HugeiconsIcon icon={TruckIcon} className="size-4" />
                        {actionLoading === `auto-${s.id}` ? "Assigning..." : "Auto-Assign"}
                      </Button>
                    </div>
                  </div>

                  {/* Eligible drivers panel */}
                  {selectedShipment === s.id && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-semibold mb-3">Eligible Drivers</h4>
                      {loadingDrivers ? (
                        <Skeleton className="h-20 w-full" />
                      ) : eligibleDrivers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No eligible drivers found</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {eligibleDrivers.map((d: any) => (
                            <div key={d.driverId} className="flex items-center justify-between rounded-lg border p-3">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="text-sm font-semibold">{d.driverName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {d.pickupDistanceKm ? `${d.pickupDistanceKm.toFixed(1)} km · ` : ""}
                                    Score: {d.score} · Rating: {d.rating ?? "N/A"} · {d.totalDeliveries} deliveries
                                  </p>
                                </div>
                              </div>
                              <Badge
                                className={
                                  d.rankLabel === "BEST_MATCH" ? "bg-green-100 text-green-700" :
                                  d.rankLabel === "GOOD_MATCH" ? "bg-blue-100 text-blue-700" :
                                  "bg-gray-100 text-gray-600"
                                }
                              >
                                {d.rankLabel?.replace(/_/g, " ")}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {tab === "open-orders" && (
          <div className="flex flex-col gap-4">
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
            ) : overview?.activeOffers?.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">No active open orders</Card>
            ) : (
              overview?.activeOffers?.map((offer: any) => (
                <Card key={offer.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{offer.shipment?.trackingNumber}</Badge>
                        <Badge variant="outline">{offer.shipment?.serviceLevel}</Badge>
                        <Badge className="bg-amber-100 text-amber-700">OFFERED</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {offer.shipment?.fromAddress?.city} → {offer.shipment?.toAddress?.city} ·
                        {" "}{Number(offer.shipment?.chargeableWeightKg).toFixed(1)} kg
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Driver: {offer.driver?.user?.name} · Rating: {offer.driver?.rating ?? "N/A"}
                        {offer.driver?.currentLatitude && " · Location available"}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelOffers(offer.shipmentId)}
                      disabled={actionLoading === `cancel-${offer.shipmentId}`}
                    >
                      <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                      Cancel Offers
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {tab === "assigned" && (
          <div className="flex flex-col gap-4">
            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
            ) : overview?.assignedShipments?.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">No assigned shipments</Card>
            ) : (
              overview?.assignedShipments?.map((s: any) => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{s.trackingNumber}</Badge>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {s.fromAddress?.city} → {s.toAddress?.city}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Driver: {s.driver?.user?.name} · {s.driver?.user?.phone}
                        {s.vehicle && ` · Vehicle: ${s.vehicle.registrationNo} (${s.vehicle.type})`}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Link href={`/dashboard/shipments/${s.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => loadEligibleDrivers(s.id)}
                      >
                        Reassign
                      </Button>
                    </div>
                  </div>

                  {/* Reassign panel */}
                  {selectedShipment === s.id && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-semibold mb-3">Reassign to New Driver</h4>
                      {loadingDrivers ? (
                        <Skeleton className="h-20 w-full" />
                      ) : eligibleDrivers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No eligible drivers found for reassignment</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {eligibleDrivers.map((d: any) => (
                            <div key={d.driverId} className="flex items-center justify-between rounded-lg border p-3">
                              <div>
                                <p className="text-sm font-semibold">{d.driverName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Score: {d.score} · {d.rankLabel?.replace(/_/g, " ")}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setReassignDriver(d.driverId)
                                  reassign(s.id)
                                }}
                                disabled={actionLoading === `reassign-${s.id}`}
                              >
                                {actionLoading === `reassign-${s.id}` ? "Reassigning..." : "Assign"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {tab === "analytics" && (
          <div className="flex flex-col gap-4">
            {loading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
            ) : analytics ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                    <p className="text-2xl font-bold">{analytics.acceptanceRate}%</p>
                    <p className="text-xs text-muted-foreground">{analytics.acceptedOffers} of {analytics.totalOffers} offers</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Assignment Success</p>
                    <p className="text-2xl font-bold">{analytics.assignmentSuccessRate}%</p>
                    <p className="text-xs text-muted-foreground">{analytics.reassignments} reassignments</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Online Drivers</p>
                    <p className="text-2xl font-bold">{analytics.onlineDrivers}</p>
                    <p className="text-xs text-muted-foreground">of {analytics.totalDrivers} total</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Driver Utilization</p>
                    <p className="text-2xl font-bold">{analytics.driverUtilization}%</p>
                    <p className="text-xs text-muted-foreground">{analytics.activeDrivers} active</p>
                  </Card>
                </div>
                <Card className="p-4">
                  <h4 className="text-sm font-semibold mb-3">Dispatch Breakdown (30 days)</h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Package02Icon} className="size-4 text-blue-500" />
                      <span className="text-sm">Total Offers: {analytics.totalOffers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-green-500" />
                      <span className="text-sm">Accepted: {analytics.acceptedOffers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={CancelCircleIcon} className="size-4 text-red-500" />
                      <span className="text-sm">Rejected: {analytics.rejectedOffers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Clock01Icon} className="size-4 text-amber-500" />
                      <span className="text-sm">Expired: {analytics.expiredOffers}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Tap01Icon} className="size-4 text-purple-500" />
                      <span className="text-sm">Auto-Assignments: {analytics.autoAssignments}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={RefreshCwIcon} className="size-4 text-orange-500" />
                      <span className="text-sm">Reassignments: {analytics.reassignments}</span>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">No analytics data available</Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
