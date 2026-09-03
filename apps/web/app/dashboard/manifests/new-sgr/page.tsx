"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { api, ApiError } from "@/lib/api"
import { toast } from "sonner"

export default function NewSGRManifestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [shipments, setShipments] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [searching, setSearching] = useState(false)
  const [form, setForm] = useState({
    originStation: "",
    destinationStation: "",
    batchNo: "",
    reservedBlockSpaceKg: "1000",
    dispatchDate: "",
    notes: "",
  })

  async function searchShipments() {
    setSearching(true)
    try {
      const result = await api.shipments.list("status=BOOKED&limit=50")
      setShipments(result.data || [])
    } catch (err) {
      toast.error("Failed to load shipments")
    } finally {
      setSearching(false)
    }
  }

  function toggleShipment(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selected.length === 0) {
      toast.error("Select at least one parcel")
      return
    }
    if (!form.originStation || !form.destinationStation || !form.batchNo || !form.dispatchDate) {
      toast.error("Fill all required fields")
      return
    }
    setLoading(true)
    try {
      const result = await api.manifests.createSGR({
        originStation: form.originStation,
        destinationStation: form.destinationStation,
        batchNo: form.batchNo,
        reservedBlockSpaceKg: Number(form.reservedBlockSpaceKg),
        dispatchDate: new Date(form.dispatchDate).toISOString(),
        shipmentIds: selected,
        notes: form.notes || undefined,
      })
      toast.success("SGR Manifest created successfully")
      router.push(`/dashboard/manifests/${result.data.id}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create manifest")
    } finally {
      setLoading(false)
    }
  }

  const totalWeight = shipments
    .filter((s) => selected.includes(s.id))
    .reduce((sum, s) => sum + Number(s.chargeableWeightKg || 0), 0)

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Manifests", href: "/dashboard/manifests" }, { label: "New SGR Manifest" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New SGR Parcel Manifest</h1>
        <p className="text-sm text-muted-foreground">Create a new SGR manifest for batch parcel dispatch</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Manifest Details */}
        <Card>
          <CardHeader><CardTitle>Manifest Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originStation">Origin Station *</Label>
              <Input id="originStation" placeholder="e.g. Dar es Salaam SGR Station" value={form.originStation} onChange={(e) => setForm({ ...form, originStation: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destinationStation">Destination Station *</Label>
              <Input id="destinationStation" placeholder="e.g. Dodoma SGR Station" value={form.destinationStation} onChange={(e) => setForm({ ...form, destinationStation: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNo">Batch No *</Label>
              <Input id="batchNo" placeholder="e.g. DAR-DOD-B001" value={form.batchNo} onChange={(e) => setForm({ ...form, batchNo: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservedBlockSpaceKg">Reserved Block Space (KG) *</Label>
              <Input id="reservedBlockSpaceKg" type="number" value={form.reservedBlockSpaceKg} onChange={(e) => setForm({ ...form, reservedBlockSpaceKg: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispatchDate">Dispatch Date *</Label>
              <Input id="dispatchDate" type="date" value={form.dispatchDate} onChange={(e) => setForm({ ...form, dispatchDate: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" placeholder="Optional notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* Parcel Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Select Parcels ({selected.length} selected, {totalWeight.toFixed(1)} KG)</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={searchShipments} loading={searching}>
                Load Available Parcels
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {shipments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Click "Load Available Parcels" to search for booked shipments</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-4 py-2 w-10"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? shipments.map((s) => s.id) : [])} checked={selected.length === shipments.length} /></th>
                      <th className="px-4 py-2 font-medium">Tracking No.</th>
                      <th className="px-4 py-2 font-medium">Sender</th>
                      <th className="px-4 py-2 font-medium">Receiver</th>
                      <th className="px-4 py-2 font-medium">Weight</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((s) => (
                      <tr key={s.id} className={`border-b last:border-0 cursor-pointer hover:bg-muted/50 ${selected.includes(s.id) ? "bg-primary/5" : ""}`} onClick={() => toggleShipment(s.id)}>
                        <td className="px-4 py-2"><input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleShipment(s.id)} /></td>
                        <td className="px-4 py-2 font-mono font-medium">{s.trackingNumber}</td>
                        <td className="px-4 py-2">{s.order?.senderName || "—"}</td>
                        <td className="px-4 py-2">{s.order?.receiverName || "—"}</td>
                        <td className="px-4 py-2">{Number(s.chargeableWeightKg || 0).toFixed(1)} KG</td>
                        <td className="px-4 py-2">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/manifests")}>Cancel</Button>
          <Button type="submit" loading={loading} disabled={selected.length === 0}>Create SGR Manifest</Button>
        </div>
      </form>
    </DashboardLayout>
  )
}
