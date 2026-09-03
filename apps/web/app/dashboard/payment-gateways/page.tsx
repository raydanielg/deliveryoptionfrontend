"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
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
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    name: "", gateway: "", mode: "test" as "test" | "live",
    liveValues: "", testValues: "", isActive: true,
  })

  useEffect(() => { loadGateways() }, [])

  async function loadGateways() {
    try {
      const result = await api.paymentGateways.list()
      setGateways(result.data || [])
    } catch (err) {
      console.error(err)
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

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Payment Gateways" },
    ]}>
      <div className="flex items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Gateways</h1>
          <p className="text-sm text-muted-foreground">Configure Selcom, Azampesa, and other payment providers</p>
        </div>
        <Button onClick={openCreate}>Add Gateway</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))
        ) : gateways.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              No payment gateways configured. Click &quot;Add Gateway&quot; to set up Selcom, Azampesa, etc.
            </CardContent>
          </Card>
        ) : (
          gateways.map((gw) => (
            <Card key={gw.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{gw.name}</h3>
                    <p className="text-sm text-muted-foreground">{gw.gateway}</p>
                  </div>
                  <Switch checked={gw.isActive} onCheckedChange={() => toggleGateway(gw.id)} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={gw.mode === "live" ? "default" : "secondary"}>
                    {gw.mode === "live" ? "Live" : "Test"}
                  </Badge>
                  <Badge variant={gw.isActive ? "default" : "secondary"}>
                    {gw.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(gw)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteGateway(gw.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))
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
                rows={4}
                value={form.testValues}
                onChange={(e) => setForm({ ...form, testValues: e.target.value })}
                placeholder='{"SELCOM_BASE_URL":"...","SELCOM_VENDOR":"...","SELCOM_API_KEY":"...","SELCOM_SECRET_KEY":"..."}'
              />
            </div>
            <div className="space-y-2">
              <Label>Live Values (JSON)</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                rows={4}
                value={form.liveValues}
                onChange={(e) => setForm({ ...form, liveValues: e.target.value })}
                placeholder='{"SELCOM_BASE_URL":"...","SELCOM_VENDOR":"...","SELCOM_API_KEY":"...","SELCOM_SECRET_KEY":"..."}'
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
