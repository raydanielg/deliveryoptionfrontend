"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
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
import { PlusIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon, AlertCircleIcon, TrendingUpIcon } from "@hugeicons/core-free-icons"

export default function SurgePricingPage() {
  const [surges, setSurges] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any>(null)
  const [search, setSearch] = React.useState("")
  const [form, setForm] = React.useState({
    name: "", surgePercentage: 0, isActive: true,
    startDate: "", endDate: "",
  })

  React.useEffect(() => { loadSurges() }, [])

  async function loadSurges() {
    try {
      const result = await api.surgePricing.list()
      setSurges(result.data || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: "", surgePercentage: 0, isActive: true, startDate: "", endDate: "" })
    setDialogOpen(true)
  }

  function openEdit(s: any) {
    setEditing(s)
    setForm({
      name: s.name, surgePercentage: s.surgePercentage, isActive: s.isActive,
      startDate: s.startDate ? new Date(s.startDate).toISOString().slice(0, 16) : "",
      endDate: s.endDate ? new Date(s.endDate).toISOString().slice(0, 16) : "",
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data: any = {
        name: form.name,
        surgePercentage: form.surgePercentage,
        isActive: form.isActive,
        startDate: new Date(form.startDate).toISOString(),
      }
      if (form.endDate) data.endDate = new Date(form.endDate).toISOString()
      if (editing) {
        await api.surgePricing.update(editing.id, data)
        toast.success("Surge pricing updated")
      } else {
        await api.surgePricing.create(data)
        toast.success("Surge pricing created")
      }
      setDialogOpen(false)
      loadSurges()
    } catch (err: any) {
      toast.error(err.message || "Failed to save")
    }
  }

  async function toggleSurge(id: string) {
    try {
      await api.surgePricing.toggle(id)
      loadSurges()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle")
    }
  }

  async function deleteSurge(id: string) {
    if (!confirm("Delete this surge pricing?")) return
    try {
      await api.surgePricing.delete(id)
      toast.success("Surge pricing deleted")
      loadSurges()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  const filtered = surges.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.name?.toLowerCase().includes(q) || String(s.surgePercentage).includes(q)
  })

  const activeCount = surges.filter((s) => s.isActive).length
  const avgSurge = surges.length > 0 ? surges.reduce((s, x) => s + Number(x.surgePercentage || 0), 0) / surges.length : 0
  const totalTimeSlots = surges.reduce((s, x) => s + (x.timeSlots?.length || 0), 0)

  function handleExportPDF() {
    exportToPDF({
      title: "Surge Pricing Report",
      subtitle: "Time-based surge pricing rules for peak hours",
      columns: [
        { header: "Name", key: "name" },
        { header: "Surge %", key: "surge" },
        { header: "Start Date", key: "start" },
        { header: "End Date", key: "end" },
        { header: "Time Slots", key: "slots" },
        { header: "Status", key: "status" },
      ],
      rows: filtered.map((s) => ({
        name: s.name || "—",
        surge: `${s.surgePercentage}%`,
        start: s.startDate ? new Date(s.startDate).toLocaleDateString("en-GB") : "—",
        end: s.endDate ? new Date(s.endDate).toLocaleDateString("en-GB") : "—",
        slots: String(s.timeSlots?.length || 0),
        status: s.isActive ? "Active" : "Inactive",
      })),
      meta: [
        { label: "Total Rules", value: String(surges.length) },
        { label: "Active", value: String(activeCount) },
        { label: "Avg Surge", value: `${avgSurge.toFixed(1)}%` },
      ],
    })
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Surge Pricing" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="📈 Surge Pricing"
          description="Manage time-based surge pricing for peak hours, holidays, and high-demand periods."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <HugeiconsIcon icon={Download01Icon} className="size-4" />
                Export PDF
              </Button>
              <Button size="sm" onClick={openCreate}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                Add Surge
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Rules" value={formatNumber(surges.length)} icon={TrendingUpIcon} hint="All configured" />
          <MetricCard label="Active" value={formatNumber(activeCount)} icon={CheckmarkCircle02Icon} hint="Currently active" />
          <MetricCard label="Avg Surge" value={`${avgSurge.toFixed(1)}%`} icon={TrendingUpIcon} hint="Across rules" />
          <MetricCard label="Time Slots" value={formatNumber(totalTimeSlots)} icon={TrendingUpIcon} hint="Peak time windows" />
        </div>

        <div className="relative max-w-xs">
          <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or percentage..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No surge pricing rules found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Surge %</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Start Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">End Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Time Slots</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3"><Badge variant="default" className="text-xs">{s.surgePercentage}%</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{s.startDate ? new Date(s.startDate).toLocaleDateString("en-GB") : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.endDate ? new Date(s.endDate).toLocaleDateString("en-GB") : "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{s.timeSlots?.length || 0}</td>
                      <td className="px-4 py-3"><Switch checked={s.isActive} onCheckedChange={() => toggleSurge(s.id)} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => openEdit(s)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => deleteSurge(s.id)}>Delete</Button>
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
            <DialogTitle>{editing ? "Edit Surge Pricing" : "Add Surge Pricing"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Peak Hours Surge" required />
            </div>
            <div className="space-y-2">
              <Label>Surge Percentage (%)</Label>
              <Input type="number" step="0.01" min="0" max="500" value={form.surgePercentage} onChange={(e) => setForm({ ...form, surgePercentage: parseFloat(e.target.value) })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>End Date (optional)</Label>
                <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
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
