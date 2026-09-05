"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatMoney, formatNumber } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon, AlertCircleIcon, CoinsIcon } from "@hugeicons/core-free-icons"

export default function ParcelFaresPage() {
  const [fares, setFares] = React.useState<any[]>([])
  const [fareWeights, setFareWeights] = React.useState<any[]>([])
  const [categories, setCategories] = React.useState<any[]>([])
  const [weights, setWeights] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [fareDialogOpen, setFareDialogOpen] = React.useState(false)
  const [fwDialogOpen, setFwDialogOpen] = React.useState(false)
  const [editingFare, setEditingFare] = React.useState<any>(null)
  const [editingFw, setEditingFw] = React.useState<any>(null)
  const [search, setSearch] = React.useState("")
  const [fwSearch, setFwSearch] = React.useState("")

  const [fareForm, setFareForm] = React.useState({
    baseFare: 0, returnFee: 0, cancellationFee: 0, baseFarePerKm: 0,
    cancellationFeePercent: 0, minCancellationFee: 0, isActive: true,
  })
  const [fwForm, setFwForm] = React.useState({
    parcelFareId: "", parcelWeightId: "", parcelCategoryId: "",
    baseFare: 0, returnFee: 0, cancellationFee: 0, farePerKm: 0,
  })

  React.useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const [faresRes, fwRes, catRes, wRes] = await Promise.all([
        api.parcelFares.list(),
        api.parcelFares.listFareWeights(),
        api.parcelCategories.list(),
        api.parcelWeights.list(),
      ])
      setFares(faresRes.data || [])
      setFareWeights(fwRes.data || [])
      setCategories(catRes.data || [])
      setWeights(wRes.data || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  function openCreateFare() {
    setEditingFare(null)
    setFareForm({ baseFare: 0, returnFee: 0, cancellationFee: 0, baseFarePerKm: 0, cancellationFeePercent: 0, minCancellationFee: 0, isActive: true })
    setFareDialogOpen(true)
  }

  function openEditFare(fare: any) {
    setEditingFare(fare)
    setFareForm({
      baseFare: fare.baseFare, returnFee: fare.returnFee, cancellationFee: fare.cancellationFee,
      baseFarePerKm: fare.baseFarePerKm, cancellationFeePercent: fare.cancellationFeePercent,
      minCancellationFee: fare.minCancellationFee, isActive: fare.isActive,
    })
    setFareDialogOpen(true)
  }

  async function handleFareSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingFare) {
        await api.parcelFares.update(editingFare.id, fareForm)
        toast.success("Fare updated")
      } else {
        await api.parcelFares.create(fareForm)
        toast.success("Fare created")
      }
      setFareDialogOpen(false)
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to save fare")
    }
  }

  async function deleteFare(id: string) {
    if (!confirm("Delete this fare?")) return
    try {
      await api.parcelFares.delete(id)
      toast.success("Fare deleted")
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  function openCreateFw() {
    setEditingFw(null)
    setFwForm({ parcelFareId: fares[0]?.id || "", parcelWeightId: "", parcelCategoryId: "", baseFare: 0, returnFee: 0, cancellationFee: 0, farePerKm: 0 })
    setFwDialogOpen(true)
  }

  function openEditFw(fw: any) {
    setEditingFw(fw)
    setFwForm({
      parcelFareId: fw.parcelFareId, parcelWeightId: fw.parcelWeightId,
      parcelCategoryId: fw.parcelCategoryId || "", baseFare: fw.baseFare,
      returnFee: fw.returnFee, cancellationFee: fw.cancellationFee, farePerKm: fw.farePerKm,
    })
    setFwDialogOpen(true)
  }

  async function handleFwSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data = { ...fwForm, parcelCategoryId: fwForm.parcelCategoryId || undefined }
      if (editingFw) {
        await api.parcelFares.updateFareWeight(editingFw.id, data)
        toast.success("Fare weight updated")
      } else {
        await api.parcelFares.createFareWeight(data)
        toast.success("Fare weight created")
      }
      setFwDialogOpen(false)
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to save fare weight")
    }
  }

  async function deleteFw(id: string) {
    if (!confirm("Delete this fare weight?")) return
    try {
      await api.parcelFares.deleteFareWeight(id)
      toast.success("Fare weight deleted")
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  const activeFares = fares.filter((f) => f.isActive).length
  const avgBaseFare = fares.length > 0 ? fares.reduce((s, f) => s + Number(f.baseFare || 0), 0) / fares.length : 0
  const totalFareWeights = fareWeights.length

  const filteredFares = fares.filter((f) => {
    if (!search) return true
    const q = search.toLowerCase()
    return String(f.baseFare).includes(q) || String(f.baseFarePerKm).includes(q)
  })

  const filteredFw = fareWeights.filter((fw) => {
    if (!fwSearch) return true
    const q = fwSearch.toLowerCase()
    return fw.parcelCategory?.name?.toLowerCase().includes(q) ||
      String(fw.parcelWeight?.minWeight).includes(q) ||
      String(fw.parcelWeight?.maxWeight).includes(q)
  })

  function handleExportPDF() {
    exportToPDF({
      title: "Parcel Fares Report",
      subtitle: "Base fares and fare-weight combinations",
      columns: [
        { header: "Base Fare (TZS)", key: "baseFare" },
        { header: "Per Km (TZS)", key: "perKm" },
        { header: "Return Fee", key: "returnFee" },
        { header: "Cancel Fee", key: "cancelFee" },
        { header: "Cancel %", key: "cancelPct" },
        { header: "Status", key: "status" },
      ],
      rows: filteredFares.map((f) => ({
        baseFare: formatMoney(Number(f.baseFare), undefined, { showCode: false }),
        perKm: formatMoney(Number(f.baseFarePerKm), undefined, { showCode: false }),
        returnFee: formatMoney(Number(f.returnFee), undefined, { showCode: false }),
        cancelFee: formatMoney(Number(f.cancellationFee), undefined, { showCode: false }),
        cancelPct: `${f.cancellationFeePercent}%`,
        status: f.isActive ? "Active" : "Inactive",
      })),
      meta: [
        { label: "Total Fares", value: String(fares.length) },
        { label: "Active", value: String(activeFares) },
        { label: "Avg Base Fare", value: formatMoney(avgBaseFare, undefined, { compact: true }) },
      ],
    })
  }

  function handleExportFwPDF() {
    exportToPDF({
      title: "Fare Weights Report",
      subtitle: "Category × weight tier pricing combinations",
      columns: [
        { header: "Category", key: "category" },
        { header: "Weight Range", key: "weight" },
        { header: "Base Fare (TZS)", key: "baseFare" },
        { header: "Per Km (TZS)", key: "perKm" },
        { header: "Return Fee", key: "returnFee" },
        { header: "Cancel Fee", key: "cancelFee" },
      ],
      rows: filteredFw.map((fw) => ({
        category: fw.parcelCategory?.name || "Any",
        weight: fw.parcelWeight ? `${fw.parcelWeight.minWeight}–${fw.parcelWeight.maxWeight} kg` : "—",
        baseFare: formatMoney(Number(fw.baseFare), undefined, { showCode: false }),
        perKm: formatMoney(Number(fw.farePerKm), undefined, { showCode: false }),
        returnFee: formatMoney(Number(fw.returnFee), undefined, { showCode: false }),
        cancelFee: formatMoney(Number(fw.cancellationFee), undefined, { showCode: false }),
      })),
      meta: [
        { label: "Total Fare Weights", value: String(fareWeights.length) },
        { label: "Categories", value: String(categories.length) },
        { label: "Weight Tiers", value: String(weights.length) },
      ],
    })
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Parcel Fares" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Parcel Fares"
          icon={<HugeiconsIcon icon={CoinsIcon} className="size-6 text-primary" />}
          description="Manage base fares, weight-based pricing, cancellation fees, and per-km rates."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <HugeiconsIcon icon={Download01Icon} className="size-4" />
                Export PDF
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Fares" value={formatNumber(fares.length)} icon={CoinsIcon} hint="Base fare configs" />
          <MetricCard label="Active" value={formatNumber(activeFares)} icon={CheckmarkCircle02Icon} hint="In use" />
          <MetricCard label="Avg Base Fare" value={formatMoney(avgBaseFare, undefined, { compact: true })} icon={CoinsIcon} hint="Across fares" />
          <MetricCard label="Fare Weights" value={formatNumber(totalFareWeights)} icon={CoinsIcon} hint="Category × weight combos" />
        </div>

        <Tabs defaultValue="fares">
          <TabsList>
            <TabsTrigger value="fares">Base Fares</TabsTrigger>
            <TabsTrigger value="fare-weights">Fare Weights</TabsTrigger>
          </TabsList>

          {/* Base Fares Tab */}
          <TabsContent value="fares" className="mt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-xs">
                <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search fares..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button size="sm" onClick={openCreateFare}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                Add Fare
              </Button>
            </div>

            {loading ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : filteredFares.length === 0 ? (
              <div className="mt-4 rounded-lg border bg-card py-12 text-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No fares found</p>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 text-left">
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Base Fare</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Per Km</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Return Fee</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Cancel Fee</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Cancel %</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFares.map((f) => (
                        <tr key={f.id} className="transition-colors hover:bg-muted/20">
                          <td className="px-4 py-3 text-right tabular-nums font-medium">{formatMoney(Number(f.baseFare), undefined, { showCode: false })}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatMoney(Number(f.baseFarePerKm), undefined, { showCode: false })}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatMoney(Number(f.returnFee), undefined, { showCode: false })}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatMoney(Number(f.cancellationFee), undefined, { showCode: false })}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{f.cancellationFeePercent}%</td>
                          <td className="px-4 py-3"><Badge variant={f.isActive ? "default" : "secondary"} className="text-xs">{f.isActive ? "Active" : "Inactive"}</Badge></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="text-xs" onClick={() => openEditFare(f)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => deleteFare(f.id)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Fare Weights Tab */}
          <TabsContent value="fare-weights" className="mt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-xs">
                <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by category or weight..." value={fwSearch} onChange={(e) => setFwSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportFwPDF}>
                  <HugeiconsIcon icon={Download01Icon} className="size-4" />
                  Export PDF
                </Button>
                <Button size="sm" onClick={openCreateFw}>
                  <HugeiconsIcon icon={PlusIcon} className="size-4" />
                  Add Fare Weight
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : filteredFw.length === 0 ? (
              <div className="mt-4 rounded-lg border bg-card py-12 text-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No fare weights found</p>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 text-left">
                        <th className="px-4 py-3 font-medium text-muted-foreground">Category</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Weight Range</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Base Fare</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Per Km</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Return Fee</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Cancel Fee</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFw.map((fw) => (
                        <tr key={fw.id} className="transition-colors hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium">{fw.parcelCategory?.name || "Any"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{fw.parcelWeight ? `${fw.parcelWeight.minWeight}–${fw.parcelWeight.maxWeight} kg` : "—"}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">{formatMoney(Number(fw.baseFare), undefined, { showCode: false })}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatMoney(Number(fw.farePerKm), undefined, { showCode: false })}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatMoney(Number(fw.returnFee), undefined, { showCode: false })}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatMoney(Number(fw.cancellationFee), undefined, { showCode: false })}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="text-xs" onClick={() => openEditFw(fw)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => deleteFw(fw.id)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Fare Dialog */}
        <Dialog open={fareDialogOpen} onOpenChange={setFareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFare ? "Edit Fare" : "Add Parcel Fare"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFareSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Fare (TZS)</Label>
                  <Input type="number" step="0.01" value={fareForm.baseFare} onChange={(e) => setFareForm({ ...fareForm, baseFare: parseFloat(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>Per Km (TZS)</Label>
                  <Input type="number" step="0.01" value={fareForm.baseFarePerKm} onChange={(e) => setFareForm({ ...fareForm, baseFarePerKm: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Return Fee (TZS)</Label>
                  <Input type="number" step="0.01" value={fareForm.returnFee} onChange={(e) => setFareForm({ ...fareForm, returnFee: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Cancellation Fee (TZS)</Label>
                  <Input type="number" step="0.01" value={fareForm.cancellationFee} onChange={(e) => setFareForm({ ...fareForm, cancellationFee: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Cancellation %</Label>
                  <Input type="number" step="0.01" value={fareForm.cancellationFeePercent} onChange={(e) => setFareForm({ ...fareForm, cancellationFeePercent: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Min Cancel Fee (TZS)</Label>
                  <Input type="number" step="0.01" value={fareForm.minCancellationFee} onChange={(e) => setFareForm({ ...fareForm, minCancellationFee: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={fareForm.isActive} onCheckedChange={(v) => setFareForm({ ...fareForm, isActive: v })} />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setFareDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingFare ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Fare Weight Dialog */}
        <Dialog open={fwDialogOpen} onOpenChange={setFwDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFw ? "Edit Fare Weight" : "Add Fare Weight"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFwSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Fare</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={fwForm.parcelFareId} onChange={(e) => setFwForm({ ...fwForm, parcelFareId: e.target.value })} required>
                  <option value="">Select fare</option>
                  {fares.map((f) => <option key={f.id} value={f.id}>Fare {f.id.slice(-6)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weight Tier</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={fwForm.parcelWeightId} onChange={(e) => setFwForm({ ...fwForm, parcelWeightId: e.target.value })} required>
                    <option value="">Select weight</option>
                    {weights.map((w) => <option key={w.id} value={w.id}>{w.minWeight} - {w.maxWeight} kg</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={fwForm.parcelCategoryId} onChange={(e) => setFwForm({ ...fwForm, parcelCategoryId: e.target.value })}>
                    <option value="">Any category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Fare (TZS)</Label>
                  <Input type="number" step="0.01" value={fwForm.baseFare} onChange={(e) => setFwForm({ ...fwForm, baseFare: parseFloat(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>Per Km (TZS)</Label>
                  <Input type="number" step="0.01" value={fwForm.farePerKm} onChange={(e) => setFwForm({ ...fwForm, farePerKm: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Return Fee (TZS)</Label>
                  <Input type="number" step="0.01" value={fwForm.returnFee} onChange={(e) => setFwForm({ ...fwForm, returnFee: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Cancel Fee (TZS)</Label>
                  <Input type="number" step="0.01" value={fwForm.cancellationFee} onChange={(e) => setFwForm({ ...fwForm, cancellationFee: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setFwDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingFw ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
