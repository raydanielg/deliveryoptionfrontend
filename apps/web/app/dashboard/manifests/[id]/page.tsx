"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api, ApiError } from "@/lib/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { PrinterIcon, QrCode01Icon, ScanIcon, CheckmarkCircle02Icon, AlertTriangle, ClipboardCheckIcon, TruckIcon, Airplane01Icon, Train01Icon } from "@hugeicons/core-free-icons"

const HANDOVER_STEPS = [
  { key: "PREPARED", label: "Prepared by Xerin" },
  { key: "VERIFIED_STATION", label: "Verified at Xerin Station" },
  { key: "HANDED_OVER_RAIL", label: "Handed Over for Rail Loading" },
  { key: "RECEIVED_DESTINATION", label: "Received at Destination Station" },
  { key: "RECONCILED", label: "Reconciled" },
]

export default function ManifestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [manifest, setManifest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scanInput, setScanInput] = useState("")
  const [scanning, setScanning] = useState(false)
  const [handoverName, setHandoverName] = useState("")
  const [reconcileNote, setReconcileNote] = useState("")
  const [reconciling, setReconciling] = useState(false)

  useEffect(() => { loadManifest() }, [])

  async function loadManifest() {
    try {
      const result = await api.manifests.get(params.id as string)
      setManifest(result.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!scanInput.trim()) return
    setScanning(true)
    try {
      const result = await api.manifests.scanParcel(params.id as string, { trackingNumber: scanInput.trim() })
      toast.success(result.message)
      setScanInput("")
      loadManifest()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Scan failed")
    } finally {
      setScanning(false)
    }
  }

  async function handleCompleteLoading() {
    try {
      const result = await api.manifests.completeLoading(params.id as string)
      toast.success(result.message)
      loadManifest()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to complete loading")
    }
  }

  async function handleSignHandover(step: string) {
    if (!handoverName.trim()) {
      toast.error("Enter your name to sign")
      return
    }
    try {
      await api.manifests.signHandover(params.id as string, { step, name: handoverName.trim() })
      toast.success(`${step} signed successfully`)
      setHandoverName("")
      loadManifest()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to sign")
    }
  }

  async function handleReconcile() {
    setReconciling(true)
    try {
      await api.manifests.updateStatus(params.id as string, { status: "RECONCILED", note: reconcileNote })
      toast.success("Manifest reconciled successfully")
      setReconcileNote("")
      loadManifest()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to reconcile")
    } finally {
      setReconciling(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Manifests", href: "/dashboard/manifests" }, { label: "Loading..." }]}>
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    )
  }

  if (!manifest) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Manifests", href: "/dashboard/manifests" }, { label: "Not Found" }]}>
        <Card><CardContent className="py-12 text-center text-muted-foreground">Manifest not found</CardContent></Card>
      </DashboardLayout>
    )
  }

  const isSGR = !!manifest.originStation
  const isAir = manifest.transportMode === "AIR" || !!manifest.flightNumber
  const isRoad = !isSGR && !isAir
  const modeIcon = isSGR ? Train01Icon : isAir ? Airplane01Icon : TruckIcon
  const modeLabel = isSGR ? "SGR Parcel Manifest" : isAir ? "Air Cargo Manifest" : "Road Shipment Manifest"
  const totalWeight = Number(manifest.totalWeightKg || 0)
  const reservedSpace = Number(manifest.reservedBlockSpaceKg || 0)
  const remaining = reservedSpace - totalWeight
  const totalPackages = manifest.shipments?.reduce((sum: number, s: any) => sum + Number(s.order?.quantity || 1), 0) || 0
  const loadedCount = manifest.shipments?.filter((s: any) => s.status === "IN_TRANSIT" || s.status === "LOADED").length || 0
  const pendingCount = manifest.shipments?.filter((s: any) => s.status !== "IN_TRANSIT" && s.status !== "LOADED" && s.status !== "DELIVERED").length || 0
  const allLoaded = loadedCount === manifest.totalShipments

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Manifests", href: "/dashboard/manifests" }, { label: manifest.manifestNumber }]}>
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{manifest.manifestNumber}</h1>
          <p className="text-sm text-muted-foreground">{isSGR ? "SGR Parcel Manifest" : "Shipment Manifest"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <HugeiconsIcon icon={PrinterIcon} className="size-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/manifests")}>
            Back
          </Button>
        </div>
      </div>

      {/* Manifest Document */}
      <div className="rounded-lg border bg-white p-8 print:border-0 print:p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={modeIcon} className="size-6" />
            XERIN {isSGR ? "SGR PARCEL" : isAir ? "AIR CARGO" : "SHIPMENT"} MANIFEST
          </h2>
            <p className="text-sm text-muted-foreground mt-1">{modeLabel} — Manifest No: <span className="font-semibold text-foreground">{manifest.manifestNumber}</span></p>
            {isSGR && (
              <div className="mt-3 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Dispatch Date:</span> {manifest.dispatchDate ? new Date(manifest.dispatchDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—"}</p>
                <p><span className="text-muted-foreground">Origin:</span> {manifest.originStation}</p>
                <p><span className="text-muted-foreground">Destination:</span> {manifest.destinationStation}</p>
                <p><span className="text-muted-foreground">Service:</span> {manifest.serviceType || "SGR Parcel Service"}</p>
                <p><span className="text-muted-foreground">Batch No:</span> {manifest.batchNo}</p>
                <p><span className="text-muted-foreground">Reserved Block Space:</span> {reservedSpace.toLocaleString()} KG</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-lg border-2 border-slate-900 p-3">
              <HugeiconsIcon icon={QrCode01Icon} className="size-16" />
            </div>
            <p className="text-xs text-muted-foreground font-mono">{manifest.qrCode}</p>
            <Badge variant={manifest.status === "COMPLETED" ? "default" : "secondary"}>{manifest.status}</Badge>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 py-4 border-b">
          <div className="text-center">
            <p className="text-2xl font-bold">{manifest.totalShipments}</p>
            <p className="text-xs text-muted-foreground">Total Parcels</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalPackages}</p>
            <p className="text-xs text-muted-foreground">Total Packages</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalWeight.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Total Weight (KG)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{remaining.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Remaining (KG)</p>
          </div>
        </div>

        {/* Parcels Table */}
        <div className="overflow-x-auto py-4">
          <table className="w-full text-sm border">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-3 py-2 text-left font-semibold">No.</th>
                <th className="px-3 py-2 text-left font-semibold">Tracking No.</th>
                <th className="px-3 py-2 text-left font-semibold">Sender</th>
                <th className="px-3 py-2 text-left font-semibold">Receiver</th>
                <th className="px-3 py-2 text-left font-semibold">Phone</th>
                <th className="px-3 py-2 text-left font-semibold">Description</th>
                <th className="px-3 py-2 text-center font-semibold">Qty</th>
                <th className="px-3 py-2 text-center font-semibold">Weight</th>
                <th className="px-3 py-2 text-left font-semibold">Service</th>
                <th className="px-3 py-2 text-center font-semibold print:hidden">Status</th>
              </tr>
            </thead>
            <tbody>
              {manifest.shipments?.map((s: any, i: number) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2 font-mono font-medium">{s.trackingNumber}</td>
                  <td className="px-3 py-2">{s.order?.senderName || "—"}</td>
                  <td className="px-3 py-2">{s.order?.receiverName || "—"}</td>
                  <td className="px-3 py-2">{s.order?.receiverPhone || "—"}</td>
                  <td className="px-3 py-2">{s.order?.description || "—"}</td>
                  <td className="px-3 py-2 text-center">{s.order?.quantity || 1}</td>
                  <td className="px-3 py-2 text-center">{Number(s.chargeableWeightKg || 0).toFixed(1)} KG</td>
                  <td className="px-3 py-2">{s.fulfillmentType?.replace(/_/g, " ").toLowerCase() || "—"}</td>
                  <td className="px-3 py-2 text-center print:hidden">
                    <Badge variant={s.status === "IN_TRANSIT" ? "default" : "outline"}>
                      {s.status === "IN_TRANSIT" ? "LOADED" : s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Manifest Summary */}
        <div className="border-t pt-4">
          <h3 className="font-bold mb-2">Manifest Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>Total Parcels: <span className="font-semibold">{manifest.totalShipments}</span></p>
            <p>Total Packages/Pieces: <span className="font-semibold">{totalPackages}</span></p>
            <p>Total Weight: <span className="font-semibold">{totalWeight.toFixed(1)} KG</span></p>
            <p>Block Space Used: <span className="font-semibold">{totalWeight.toFixed(1)} / {reservedSpace.toLocaleString()} KG</span></p>
            <p>Remaining Capacity: <span className="font-semibold">{remaining.toFixed(1)} KG</span></p>
          </div>
        </div>

        {/* Handover Chain */}
        <div className="border-t pt-4 mt-4">
          <h3 className="font-bold mb-3">Handover Chain</h3>
          <div className="space-y-3">
            {HANDOVER_STEPS.map((step) => {
              const handover = manifest.handovers?.find((h: any) => h.step === step.key)
              return (
                <div key={step.key} className="flex items-start gap-3 border rounded-lg p-3">
                  <div className={`flex size-8 items-center justify-center rounded-full ${handover ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{step.label}</p>
                    {handover ? (
                      <div className="grid grid-cols-4 gap-2 mt-2 text-xs text-muted-foreground">
                        <div><p className="font-medium text-foreground">{handover.name}</p><p>Name</p></div>
                        <div><p className="font-medium text-foreground">{handover.signature}</p><p>Signature</p></div>
                        <div><p className="font-medium text-foreground">{handover.date ? new Date(handover.date).toLocaleDateString() : "—"}</p><p>Date</p></div>
                        <div><p className="font-medium text-foreground">{handover.time}</p><p>Time</p></div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Pending</p>
                    )}
                  </div>
                  {!handover && (
                    <Button size="sm" variant="outline" className="print:hidden" onClick={() => handleSignHandover(step.key)}>
                      Sign
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 mt-3 print:hidden">
            <Input placeholder="Your name for handover signature" value={handoverName} onChange={(e) => setHandoverName(e.target.value)} className="max-w-xs" />
          </div>
        </div>
      </div>

      {/* Action Panel - print:hidden */}
      <div className="mt-4 grid gap-4 print:hidden">
        {manifest.status === "LOADING" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={ScanIcon} className="size-5" />
                Parcel Scanning - {loadedCount}/{manifest.totalShipments} loaded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScan} className="flex gap-2">
                <Input placeholder="Scan or enter tracking number..." value={scanInput} onChange={(e) => setScanInput(e.target.value)} className="flex-1" autoFocus />
                <Button type="submit" loading={scanning}>Scan & Load</Button>
              </form>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {loadedCount} of {manifest.totalShipments} parcels loaded
                </p>
                <Button variant="destructive" onClick={handleCompleteLoading}>
                  Complete Loading & Finalize Departure
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reconciliation Panel */}
        {(manifest.status === "COMPLETED" || manifest.status === "IN_TRANSIT" || manifest.status === "ARRIVED") && manifest.status !== "RECONCILED" && (
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={ClipboardCheckIcon} className="size-5 text-amber-600" />
                Manifest Reconciliation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{loadedCount}</p>
                  <p className="text-xs text-muted-foreground">Loaded</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">{manifest.totalShipments}</p>
                  <p className="text-xs text-muted-foreground">Total Expected</p>
                </div>
              </div>

              {pendingCount > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:bg-amber-950/20">
                  <HugeiconsIcon icon={AlertTriangle} className="size-5 text-amber-600 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-200">Discrepancy Detected</p>
                    <p className="text-amber-700 dark:text-amber-300">{pendingCount} shipment(s) not loaded. Review missing parcels before reconciliation.</p>
                  </div>
                </div>
              )}

              {allLoaded && (
                <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:bg-green-950/20">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 text-green-600 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900 dark:text-green-200">All Parcels Loaded</p>
                    <p className="text-green-700 dark:text-green-300">All {manifest.totalShipments} shipments confirmed loaded. Ready for reconciliation.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Reconciliation notes (optional)..."
                  value={reconcileNote}
                  onChange={(e) => setReconcileNote(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleReconcile} disabled={reconciling}>
                  <HugeiconsIcon icon={ClipboardCheckIcon} className="size-4 mr-2" />
                  {reconciling ? "Reconciling..." : "Confirm Reconciliation"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {manifest.status === "RECONCILED" && (
          <Card className="border-green-200">
            <CardContent className="flex items-center gap-3 py-6">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900 dark:text-green-200">Manifest Reconciled</p>
                <p className="text-sm text-muted-foreground">All shipments have been reconciled. This manifest is complete.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
