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
import {
  CreditCardIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  AlertCircleIcon, PlusIcon, PencilEdit02Icon, TrashIcon,
} from "@hugeicons/core-free-icons"

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any>(null)
  const [search, setSearch] = React.useState("")
  const [form, setForm] = React.useState({
    name: "", gateway: "", mode: "test" as "test" | "live",
    liveValues: "", testValues: "", isActive: true,
  })

  React.useEffect(() => { loadGateways() }, [])

  async function loadGateways() {
    try {
      const result = await api.paymentGateways.list()
      setGateways(result.data || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: "", gateway: "", mode: "test", liveValues: "", testValues: "", isActive: true })
    setDialogOpen(true)
  }

  function openEdit(gw: any) {
    setEditing(gw)
    setForm({
      name: gw.name, gateway: gw.gateway, mode: gw.mode,
      liveValues: "", testValues: "", isActive: gw.isActive,
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data: any = { name: form.name, gateway: form.gateway, mode: form.mode, isActive: form.isActive }
      if (form.liveValues) {
        try { data.liveValues = JSON.parse(form.liveValues) } catch { data.liveValues = {} }
      }
      if (form.testValues) {
        try { data.testValues = JSON.parse(form.testValues) } catch { data.testValues = {} }
      }
      if (editing) {
        await api.paymentGateways.update(editing.id, data)
        toast.success("Gateway updated")
      } else {
        await api.paymentGateways.create(data)
        toast.success("Gateway created")
      }
      setDialogOpen(false)
      loadGateways()
    } catch (err: any) {
      toast.error(err.message || "Failed to save gateway")
    }
  }

  async function toggleGateway(id: string) {
    try {
      await api.paymentGateways.toggle(id)
      loadGateways()
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle")
    }
  }

  async function deleteGateway(id: string) {
    if (!confirm("Delete this gateway?")) return
    try {
      await api.paymentGateways.delete(id)
      toast.success("Gateway deleted")
      loadGateways()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete")
    }
  }

  const filtered = gateways.filter((gw) => {
    if (!search) return true
    const q = search.toLowerCase()
    return gw.name?.toLowerCase().includes(q) || gw.gateway?.toLowerCase().includes(q)
  })

  const activeCount = gateways.filter((gw) => gw.isActive).length
  const liveCount = gateways.filter((gw) => gw.mode === "live").length
  const testCount = gateways.filter((gw) => gw.mode === "test").length

  function handleExportPDF() {
    exportToPDF({
      title: "Payment Gateways Report",
      subtitle: "Configured payment providers and their status",
      columns: [
        { header: "Name", key: "name" },
        { header: "Gateway", key: "gateway" },
        { header: "Mode", key: "mode" },
        { header: "Status", key: "status" },
      ],
      rows: filtered.map((gw) => ({
        name: gw.name || "—",
        gateway: gw.gateway || "—",
        mode: gw.mode || "—",
        status: gw.isActive ? "Active" : "Inactive",
      })),
      meta: [
        { label: "Total Gateways", value: String(gateways.length) },
        { label: "Active", value: String(activeCount) },
        { label: "Live Mode", value: String(liveCount) },
      ],
    })
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Payments", href: "/dashboard/payments" },
      { label: "Gateways" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Gateways"
          icon={<HugeiconsIcon icon={CreditCardIcon} className="size-6 text-primary" />}
          description="Configure Selcom, Azampesa, and other payment providers — manage credentials and modes."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <HugeiconsIcon icon={Download01Icon} className="size-4" />
                Export PDF
              </Button>
              <Button size="sm" onClick={openCreate}>
                <HugeiconsIcon icon={PlusIcon} className="size-4" />
                Add Gateway
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Gateways" value={formatNumber(gateways.length)} icon={CreditCardIcon} hint="All providers" />
          <MetricCard label="Active" value={formatNumber(activeCount)} icon={CheckmarkCircle02Icon} hint="Currently enabled" />
          <MetricCard label="Live Mode" value={formatNumber(liveCount)} icon={CreditCardIcon} hint="Production" />
          <MetricCard label="Test Mode" value={formatNumber(testCount)} icon={CreditCardIcon} hint="Sandbox" />
        </div>

        <div className="relative max-w-xs">
          <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search gateway name or key..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No payment gateways configured</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((gw) => (
              <div
                key={gw.id}
                className="group rounded-lg border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <HugeiconsIcon icon={CreditCardIcon} className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{gw.name}</h3>
                      <p className="text-xs text-muted-foreground">{gw.gateway}</p>
                    </div>
                  </div>
                  <Switch checked={gw.isActive} onCheckedChange={() => toggleGateway(gw.id)} />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={gw.mode === "live" ? "default" : "secondary"} className="text-xs">
                    {gw.mode === "live" ? "Live" : "Test"}
                  </Badge>
                  <Badge variant={gw.isActive ? "default" : "secondary"} className="text-xs">
                    {gw.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex gap-2 border-t pt-3">
                  <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => openEdit(gw)}>
                    <HugeiconsIcon icon={PencilEdit02Icon} className="size-3.5" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => deleteGateway(gw.id)}>
                    <HugeiconsIcon icon={TrashIcon} className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Gateway" : "Add Payment Gateway"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Selcom" required />
              </div>
              <div className="space-y-2">
                <Label>Gateway Key</Label>
                <Input value={form.gateway} onChange={(e) => setForm({ ...form, gateway: e.target.value })} placeholder="e.g. selcom" required disabled={!!editing} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as "test" | "live" })}>
                <option value="test">Test</option>
                <option value="live">Live</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Test Values (JSON)</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                rows={3}
                value={form.testValues}
                onChange={(e) => setForm({ ...form, testValues: e.target.value })}
                placeholder='{"SELCOM_BASE_URL":"...","SELCOM_VENDOR":"..."}'
              />
            </div>
            <div className="space-y-2">
              <Label>Live Values (JSON)</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                rows={3}
                value={form.liveValues}
                onChange={(e) => setForm({ ...form, liveValues: e.target.value })}
                placeholder='{"SELCOM_BASE_URL":"...","SELCOM_VENDOR":"..."}'
              />
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
