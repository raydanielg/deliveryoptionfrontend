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
import { PlusIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon, AlertCircleIcon, MapPinIcon } from "@hugeicons/core-free-icons"

export default function ZonesPage() {
  const [zones, setZones] = React.useState<any[]>([])
  const [countries, setCountries] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any>(null)
  const [search, setSearch] = React.useState("")
  const [form, setForm] = React.useState({
    name: "", code: "", countryId: "", regionId: "", cityId: "", isActive: true,
  })

  React.useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const [zonesRes, geoRes] = await Promise.all([
        api.zones.list(),
        api.geography.listCountries().catch(() => ({ data: [] })),
      ])
      setZones(zonesRes.data || [])
      setCountries(geoRes.data || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: "", code: "", countryId: countries[0]?.id || "", regionId: "", cityId: "", isActive: true })
    setDialogOpen(true)
  }

  function openEdit(zone: any) {
    setEditing(zone)
    setForm({
      name: zone.name, code: zone.code || "",
      countryId: zone.countryId, regionId: zone.regionId || "", cityId: zone.cityId || "",
      isActive: zone.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data: any = { name: form.name, isActive: form.isActive }
      if (form.code) data.code = form.code
      if (form.countryId) data.countryId = form.countryId
      if (form.regionId) data.regionId = form.regionId
      if (form.cityId) data.cityId = form.cityId
      if (editing) {
        await api.zones.update(editing.id, data)
        toast.success("Zone updated")
      } else {
        await api.zones.create(data)
        toast.success("Zone created")
      }
      setDialogOpen(false)
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to save zone")
    }
  }

  async function toggleZone(id: string) {
    try {
      await api.zones.toggle(id)
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle")
    }
  }

  async function deleteZone(id: string) {
    if (!confirm("Delete this zone?")) return
    try {
      await api.zones.delete(id)
      toast.success("Zone deleted")
      loadAll()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  const filtered = zones.filter((z) => {
    if (!search) return true
    const q = search.toLowerCase()
    return z.name?.toLowerCase().includes(q) ||
      z.code?.toLowerCase().includes(q) ||
      z.country?.name?.toLowerCase().includes(q)
  })

  const activeCount = zones.filter((z) => z.isActive).length
  const totalPricingRules = zones.reduce((s, z) => s + (z._count?.pricingRules || 0), 0)
  const countryCount = new Set(zones.map((z) => z.country?.name).filter(Boolean)).size

  function handleExportPDF() {
    exportToPDF({
      title: "Zones Report",
      subtitle: "Delivery zones by country, region, and city",
      columns: [
        { header: "Name", key: "name" },
        { header: "Code", key: "code" },
        { header: "Country", key: "country" },
        { header: "Region", key: "region" },
        { header: "City", key: "city" },
        { header: "Pricing Rules", key: "rules" },
        { header: "Status", key: "status" },
      ],
      rows: filtered.map((z) => ({
        name: z.name || "—",
        code: z.code || "—",
        country: z.country?.name || "—",
        region: z.region?.name || "—",
        city: z.city?.name || "—",
        rules: String(z._count?.pricingRules || 0),
        status: z.isActive ? "Active" : "Inactive",
      })),
      meta: [
        { label: "Total Zones", value: String(zones.length) },
        { label: "Active", value: String(activeCount) },
        { label: "Countries", value: String(countryCount) },
      ],
    })
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Zones" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="🗺️ Zones"
          description="Manage delivery zones by country, region, and city — linked to pricing rules."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <HugeiconsIcon icon={Download01Icon} className="size-4" />
                Export PDF
              </Button>
              <Button size="sm" onClick={openCreate}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                Add Zone
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Zones" value={formatNumber(zones.length)} icon={MapPinIcon} hint="All configured" />
          <MetricCard label="Active" value={formatNumber(activeCount)} icon={CheckmarkCircle02Icon} hint="In use" />
          <MetricCard label="Countries" value={formatNumber(countryCount)} icon={MapPinIcon} hint="Covered" />
          <MetricCard label="Pricing Rules" value={formatNumber(totalPricingRules)} icon={MapPinIcon} hint="Linked to zones" />
        </div>

        <div className="relative max-w-xs">
          <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search zones..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No zones found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Code</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Country</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Region</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">City</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Pricing Rules</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((z) => (
                    <tr key={z.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{z.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{z.code || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{z.country?.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{z.region?.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{z.city?.name || "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{z._count?.pricingRules || 0}</td>
                      <td className="px-4 py-3"><Switch checked={z.isActive} onCheckedChange={() => toggleZone(z.id)} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => openEdit(z)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => deleteZone(z.id)}>Delete</Button>
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
            <DialogTitle>{editing ? "Edit Zone" : "Add Zone"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dar es Salaam Central" required />
            </div>
            <div className="space-y-2">
              <Label>Code (optional)</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. DSM-01" />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.countryId} onChange={(e) => setForm({ ...form, countryId: e.target.value })} required>
                <option value="">Select country</option>
                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Region ID (optional)</Label>
                <Input value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })} placeholder="Region ID" />
              </div>
              <div className="space-y-2">
                <Label>City ID (optional)</Label>
                <Input value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })} placeholder="City ID" />
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
