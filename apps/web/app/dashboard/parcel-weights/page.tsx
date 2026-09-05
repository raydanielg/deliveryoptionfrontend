"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Skeleton } from "@workspace/ui/components/skeleton"
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
import { formatNumber } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon, AlertCircleIcon, ScaleIcon } from "@hugeicons/core-free-icons"

export default function ParcelWeightsPage() {
  const [weights, setWeights] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any>(null)
  const [form, setForm] = React.useState({ minWeight: 0, maxWeight: 0, isActive: true })
  const [search, setSearch] = React.useState("")

  React.useEffect(() => { loadWeights() }, [])

  async function loadWeights() {
    try {
      const result = await api.parcelWeights.list()
      setWeights(result.data || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ minWeight: 0, maxWeight: 0, isActive: true })
    setDialogOpen(true)
  }

  function openEdit(w: any) {
    setEditing(w)
    setForm({ minWeight: w.minWeight, maxWeight: w.maxWeight, isActive: w.isActive })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editing) {
        await api.parcelWeights.update(editing.id, form)
        toast.success("Weight tier updated")
      } else {
        await api.parcelWeights.create(form)
        toast.success("Weight tier created")
      }
      setDialogOpen(false)
      loadWeights()
    } catch (err: any) {
      toast.error(err.message || "Failed to save")
    }
  }

  async function toggleWeight(id: string) {
    try {
      await api.parcelWeights.toggle(id)
      loadWeights()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle")
    }
  }

  async function deleteWeight(id: string) {
    if (!confirm("Delete this weight tier?")) return
    try {
      await api.parcelWeights.delete(id)
      toast.success("Weight tier deleted")
      loadWeights()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  const filtered = weights.filter((w) => {
    if (!search) return true
    const q = search
    return String(w.minWeight).includes(q) || String(w.maxWeight).includes(q)
  })

  const activeCount = weights.filter((w) => w.isActive).length
  const totalFareRules = weights.reduce((s, w) => s + (w._count?.fareWeights || 0), 0)
  const maxWeight = weights.length > 0 ? Math.max(...weights.map((w) => Number(w.maxWeight || 0))) : 0

  function handleExportPDF() {
    exportToPDF({
      title: "Parcel Weight Tiers Report",
      subtitle: "Weight ranges used for parcel fare calculation",
      columns: [
        { header: "Min Weight (kg)", key: "min" },
        { header: "Max Weight (kg)", key: "max" },
        { header: "Fare Rules", key: "fareRules" },
        { header: "Status", key: "status" },
      ],
      rows: filtered.map((w) => ({
        min: String(w.minWeight),
        max: String(w.maxWeight),
        fareRules: String(w._count?.fareWeights || 0),
        status: w.isActive ? "Active" : "Inactive",
      })),
      meta: [
        { label: "Total Tiers", value: String(weights.length) },
        { label: "Active", value: String(activeCount) },
        { label: "Max Weight", value: `${formatNumber(maxWeight)} kg` },
      ],
    })
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Weight Tiers" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="⚖️ Weight Tiers"
          description="Define weight ranges that determine parcel fares — each tier links to specific pricing rules."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <HugeiconsIcon icon={Download01Icon} className="size-4" />
                Export PDF
              </Button>
              <Button size="sm" onClick={openCreate}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                Add Tier
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Tiers" value={formatNumber(weights.length)} icon={ScaleIcon} hint="All configured" />
          <MetricCard label="Active" value={formatNumber(activeCount)} icon={CheckmarkCircle02Icon} hint="In use" />
          <MetricCard label="Max Weight" value={`${formatNumber(maxWeight)} kg`} icon={ScaleIcon} hint="Upper bound" />
          <MetricCard label="Fare Rules" value={formatNumber(totalFareRules)} icon={ScaleIcon} hint="Linked to tiers" />
        </div>

        <div className="relative max-w-xs">
          <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by weight..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No weight tiers found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Min Weight (kg)</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Max Weight (kg)</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Fare Rules</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w) => (
                    <tr key={w.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium tabular-nums">{w.minWeight}</td>
                      <td className="px-4 py-3 font-medium tabular-nums">{w.maxWeight}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{w._count?.fareWeights || 0}</td>
                      <td className="px-4 py-3"><Switch checked={w.isActive} onCheckedChange={() => toggleWeight(w.id)} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => openEdit(w)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => deleteWeight(w.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Weight Tier" : "Add Weight Tier"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minWeight">Min Weight (kg)</Label>
                <Input id="minWeight" type="number" step="0.01" value={form.minWeight} onChange={(e) => setForm({ ...form, minWeight: parseFloat(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWeight">Max Weight (kg)</Label>
                <Input id="maxWeight" type="number" step="0.01" value={form.maxWeight} onChange={(e) => setForm({ ...form, maxWeight: parseFloat(e.target.value) })} required />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
