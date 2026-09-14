"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { StatusBadge } from "@/components/shared/status-badge"
import { api, ApiError } from "@/lib/api"
import { getSocket } from "@/lib/socket"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Airplane01Icon,
  UserIcon,
  Package02Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  ClipboardCheckIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { formatDate } from "@/lib/format"

export default function TripManifestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [trip, setTrip] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [unpairingId, setUnpairingId] = React.useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = React.useState(false)

  React.useEffect(() => { load() }, [id])

  React.useEffect(() => {
    const socket = getSocket()
    if (!socket || !id) return

    socket.emit("subscribe:trip", id)
    const onTripUpdated = (payload: any) => {
      if (!payload || payload.id === id || payload.tripId === id) load()
    }
    const onBoxStatusChanged = () => load()
    socket.on("trip:updated", onTripUpdated)
    socket.on("box:status_changed", onBoxStatusChanged)
    socket.on("box:shelved", onBoxStatusChanged)

    return () => {
      socket.emit("unsubscribe:trip", id)
      socket.off("trip:updated", onTripUpdated)
      socket.off("box:status_changed", onBoxStatusChanged)
      socket.off("box:shelved", onBoxStatusChanged)
    }
  }, [id])

  async function load() {
    try {
      const res = await api.tripManifests.get(id)
      setTrip(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUnpair(boxId: string) {
    setUnpairingId(boxId)
    try {
      await api.tripManifests.unpairBox(id, boxId)
      toast.success("Box unpaired")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to unpair box")
    } finally {
      setUnpairingId(null)
    }
  }

  async function handleStatusChange(status: string) {
    setStatusUpdating(true)
    try {
      await api.tripManifests.updateStatus(id, { status })
      toast.success(`Trip marked ${status.toLowerCase()}`)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update trip status")
    } finally {
      setStatusUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Trip Manifests", href: "/dashboard/trip-manifests" }, { label: "Loading..." }]}>
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    )
  }

  if (!trip) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Trip Manifests", href: "/dashboard/trip-manifests" }, { label: "Not Found" }]}>
        <Card><CardContent className="py-12 text-center text-muted-foreground">Trip manifest not found</CardContent></Card>
      </DashboardLayout>
    )
  }

  const canDepart = trip.status === "PLANNED" || trip.status === "BOXES_ASSIGNED"
  const canArrive = trip.status === "DEPARTED"
  const canReconcile = trip.status === "ARRIVED"
  const canCancel = !["DEPARTED", "ARRIVED", "RECONCILED", "CANCELLED"].includes(trip.status)

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Trip Manifests", href: "/dashboard/trip-manifests" }, { label: trip.tripNo }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <HugeiconsIcon icon={Airplane01Icon} className="size-6 text-primary" />
              {trip.tripNo}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Created by {trip.createdBy?.name || "—"}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={trip.status} />
            <Button variant="outline" onClick={() => router.push("/dashboard/trip-manifests")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              Back
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={UserIcon} className="size-4" />
                Passenger
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Name" value={trip.passengerName} />
              <InfoRow label="Phone" value={trip.passengerPhone || "—"} />
              <InfoRow label="ID Number" value={trip.passengerIdNumber || "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Airplane01Icon} className="size-4" />
                Flight
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Airline / Flight #" value={`${trip.airline} ${trip.flightNumber}`} />
              <InfoRow label="Flight Date" value={formatDate(trip.flightDate)} />
              <InfoRow label="Route" value={`${trip.departureAirport} → ${trip.arrivalAirport}`} />
              <InfoRow label="Departed / Arrived" value={`${trip.departedAt ? formatDate(trip.departedAt) : "—"} / ${trip.arrivedAt ? formatDate(trip.arrivedAt) : "—"}`} />
            </CardContent>
          </Card>
        </div>

        {/* Status actions */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {canDepart && (
              <Button loading={statusUpdating} disabled={!trip.boxes?.length} onClick={() => handleStatusChange("DEPARTED")}>
                <HugeiconsIcon icon={Airplane01Icon} className="size-4" />
                Mark Departed
              </Button>
            )}
            {canArrive && (
              <Button loading={statusUpdating} onClick={() => handleStatusChange("ARRIVED")}>
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                Mark Arrived
              </Button>
            )}
            {canReconcile && (
              <Button loading={statusUpdating} onClick={() => handleStatusChange("RECONCILED")}>
                <HugeiconsIcon icon={ClipboardCheckIcon} className="size-4" />
                Reconcile
              </Button>
            )}
            {canCancel && (
              <Button variant="destructive" loading={statusUpdating} onClick={() => handleStatusChange("CANCELLED")}>
                <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                Cancel Trip
              </Button>
            )}
            {!canDepart && !canArrive && !canReconcile && !canCancel && (
              <p className="text-sm text-muted-foreground">No further status transitions available.</p>
            )}
            {canDepart && !trip.boxes?.length && (
              <p className="w-full text-xs text-muted-foreground">Pair at least one box before departing.</p>
            )}
          </CardContent>
        </Card>

        {/* Paired boxes */}
        <Card>
          <CardHeader>
            <CardTitle>Paired Boxes ({trip.boxes?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Box #</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Items</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Weight</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(!trip.boxes || trip.boxes.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        <HugeiconsIcon icon={Package02Icon} className="mx-auto size-6 text-muted-foreground/40" />
                        No boxes paired to this trip yet
                      </td>
                    </tr>
                  ) : (
                    trip.boxes.map((b: any) => (
                      <tr key={b.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">
                          <button className="hover:underline" onClick={() => router.push(`/dashboard/consolidation-boxes/${b.id}`)}>
                            {b.boxNumber}
                          </button>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-4 py-3 tabular-nums">{b.items?.length ?? 0}</td>
                        <td className="px-4 py-3 tabular-nums">{b.actualWeightKg ? `${b.actualWeightKg} kg` : "—"}</td>
                        <td className="px-4 py-3">
                          {trip.status === "PLANNED" || trip.status === "BOXES_ASSIGNED" ? (
                            <Button size="sm" variant="ghost" loading={unpairingId === b.id} onClick={() => handleUnpair(b.id)}>
                              <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                              Unpair
                            </Button>
                          ) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  )
}
