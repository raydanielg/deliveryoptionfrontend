"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { StatusBadge } from "@/components/shared/status-badge"
import { AuthorizedImage } from "@/components/shared/authorized-image"
import { api, ApiError } from "@/lib/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Package02Icon,
  Delete02Icon,
  ScaleIcon,
  Airplane01Icon,
  Bookshelf01Icon,
  PrinterIcon,
  Download04Icon,
} from "@hugeicons/core-free-icons"
import { formatDate } from "@/lib/format"

export default function ConsolidationBoxDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [box, setBox] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [trackingInput, setTrackingInput] = React.useState("")
  const [adding, setAdding] = React.useState(false)
  const [removingId, setRemovingId] = React.useState<string | null>(null)
  const [actualWeight, setActualWeight] = React.useState("")
  const [closing, setClosing] = React.useState(false)

  React.useEffect(() => { load() }, [id])

  async function load() {
    try {
      const res = await api.consolidationBoxes.get(id)
      setBox(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!trackingInput.trim()) return
    setAdding(true)
    try {
      await api.consolidationBoxes.addItem(id, { trackingNumber: trackingInput.trim() })
      toast.success("Item added")
      setTrackingInput("")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add item")
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveItem(shipmentId: string) {
    setRemovingId(shipmentId)
    try {
      await api.consolidationBoxes.removeItem(id, shipmentId)
      toast.success("Item removed")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove item")
    } finally {
      setRemovingId(null)
    }
  }

  async function handleClose() {
    if (!actualWeight) return
    setClosing(true)
    try {
      await api.consolidationBoxes.close(id, { actualWeightKg: Number(actualWeight) })
      toast.success("Box closed & packed")
      setActualWeight("")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to close box")
    } finally {
      setClosing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Consolidation Boxes", href: "/dashboard/consolidation-boxes" }, { label: "Loading..." }]}>
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    )
  }

  if (!box) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Consolidation Boxes", href: "/dashboard/consolidation-boxes" }, { label: "Not Found" }]}>
        <Card><CardContent className="py-12 text-center text-muted-foreground">Box not found</CardContent></Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Consolidation Boxes", href: "/dashboard/consolidation-boxes" }, { label: box.boxNumber }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <HugeiconsIcon icon={Package02Icon} className="size-6 text-primary" />
              {box.boxNumber}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Created {formatDate(box.createdAt)} by {box.packedBy?.name || "—"}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={box.status} />
            <Button variant="outline" onClick={() => router.push("/dashboard/consolidation-boxes")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              Back
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Box info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Box Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Origin Station" value={box.originStation ? `${box.originStation.name} (${box.originStation.code})` : "—"} />
              <InfoRow label="Current Station" value={box.currentStation ? `${box.currentStation.name} (${box.currentStation.code})` : "—"} />
              <InfoRow label="Shelf Location" value={box.currentShelfLocation?.code || "Not shelved"} />
              <InfoRow label="Target / Actual Weight" value={`${box.targetWeightKg ?? "—"} kg / ${box.actualWeightKg ?? "—"} kg`} />
              <InfoRow
                label="Trip Manifest"
                value={box.tripManifest ? `${box.tripManifest.tripNo} — ${box.tripManifest.passengerName} (${box.tripManifest.status})` : "Not assigned"}
                action={box.tripManifest ? (
                  <Button size="sm" variant="link" className="h-auto p-0" onClick={() => router.push(`/dashboard/trip-manifests/${box.tripManifest.id}`)}>
                    View trip
                  </Button>
                ) : undefined}
              />
              <InfoRow label="Notes" value={box.notes || "—"} />
            </CardContent>
          </Card>

          {/* QR / Label */}
          <Card>
            <CardHeader>
              <CardTitle>QR Label</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <AuthorizedImage
                fetcher={() => api.consolidationBoxes.fetchLabelBlobUrl(id)}
                alt={`Label for ${box.boxNumber}`}
                width={180}
                height={180}
              />
              <p className="text-xs font-mono text-muted-foreground">{box.qrPayload}</p>
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={async () => {
                    try {
                      const url = await api.consolidationBoxes.fetchLabelBlobUrl(id)
                      window.open(url, "_blank")
                    } catch {
                      toast.error("Failed to open label")
                    }
                  }}
                >
                  <HugeiconsIcon icon={Download04Icon} className="size-3.5" />
                  Open
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => window.print()}>
                  <HugeiconsIcon icon={PrinterIcon} className="size-3.5" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contents */}
        <Card>
          <CardHeader>
            <CardTitle>Contents ({box.items?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {box.status === "PACKING" && (
              <form onSubmit={handleAddItem} className="mb-4 flex gap-2">
                <Input
                  placeholder="Scan or enter tracking number..."
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" loading={adding}>Add Item</Button>
              </form>
            )}
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Added</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Notes</th>
                    {box.status === "PACKING" && <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {(!box.items || box.items.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No items in this box yet</td>
                    </tr>
                  ) : (
                    box.items.map((item: any) => (
                      <tr key={item.id} className="transition-colors hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{item.shipment?.trackingNumber}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.shipment?.description || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(item.addedAt)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.notes || "—"}</td>
                        {box.status === "PACKING" && (
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              loading={removingId === item.shipmentId}
                              onClick={() => handleRemoveItem(item.shipmentId)}
                            >
                              <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                              Remove
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Close box action */}
        {box.status === "PACKING" && (
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={ScaleIcon} className="size-5 text-amber-600" />
                Close This Box
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="grid gap-2 sm:max-w-xs">
                <label className="text-xs text-muted-foreground">Actual Weight (kg)</label>
                <Input type="number" value={actualWeight} onChange={(e) => setActualWeight(e.target.value)} placeholder="e.g. 22.8" />
              </div>
              <Button onClick={handleClose} loading={closing} disabled={!actualWeight || !box.items?.length}>
                Close & Mark Packed
              </Button>
              {!box.items?.length && <p className="text-xs text-muted-foreground">Add at least one item before closing.</p>}
            </CardContent>
          </Card>
        )}

        {box.status === "PACKED" && (
          <Card className="border-blue-200">
            <CardContent className="flex items-center gap-3 py-6">
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <HugeiconsIcon icon={Airplane01Icon} className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Ready for a Trip</p>
                <p className="text-sm text-muted-foreground">Assign this box to a trip manifest from the boxes list to hand it to a passenger.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {box.status === "ARRIVED_TZ" && (
          <Card className="border-emerald-200">
            <CardContent className="flex items-center gap-3 py-6">
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                <HugeiconsIcon icon={Bookshelf01Icon} className="size-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold">Arrived in Tanzania — Needs Shelving</p>
                <p className="text-sm text-muted-foreground">Assign this box a shelf location from the Shelf Map page.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

function InfoRow({ label, value, action }: { label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
      {action}
    </div>
  )
}
