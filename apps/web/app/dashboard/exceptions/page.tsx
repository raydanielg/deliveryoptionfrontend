"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, PlusIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState("")
  const [form, setForm] = useState({ shipmentId: "", type: "MISSED_SCAN", reason: "", description: "", stationId: "" })

  useEffect(() => { loadData() }, [filterStatus])

  async function loadData() {
    try {
      const params = filterStatus ? `status=${filterStatus}` : ""
      const [excRes, statsRes] = await Promise.all([
        api.exceptions.list(params),
        api.exceptions.stats(),
      ])
      setExceptions(excRes.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load exceptions")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.exceptions.create(form)
      toast.success("Exception created")
      setShowForm(false)
      setForm({ shipmentId: "", type: "MISSED_SCAN", reason: "", description: "", stationId: "" })
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to create exception")
    }
  }

  async function handleResolve(id: string) {
    const resolution = prompt("Enter resolution details:")
    if (!resolution) return
    try {
      await api.exceptions.resolve(id, { resolution })
      toast.success("Exception resolved")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve")
    }
  }

  async function handleEscalate(id: string) {
    try {
      await api.exceptions.escalate(id)
      toast.success("Exception escalated")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to escalate")
    }
  }

  const statusColors: Record<string, any> = {
    OPEN: "destructive",
    IN_REVIEW: "secondary",
    RESOLVED: "default",
    ESCALATED: "destructive",
    CLOSED: "secondary",
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Exceptions" }]}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exceptions & Returns</h1>
          <p className="text-sm text-muted-foreground">Manage shipment exceptions, returns, and issues</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <HugeiconsIcon icon={PlusIcon} className="size-4 mr-2" />
          New Exception
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Open</p><p className="text-2xl font-bold text-red-500">{stats.open}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Resolved</p><p className="text-2xl font-bold text-green-500">{stats.resolved}</p></CardContent></Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Filter by Status</p>
              <select className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All</option>
                <option value="OPEN">Open</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="ESCALATED">Escalated</option>
                <option value="CLOSED">Closed</option>
              </select>
            </CardContent>
          </Card>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create New Exception</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Shipment ID *</label><Input value={form.shipmentId} onChange={e => setForm({ ...form, shipmentId: e.target.value })} required /></div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="MISSED_SCAN">Missed Scan</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="LOST">Lost</option>
                  <option value="WRONG_DESTINATION">Wrong Destination</option>
                  <option value="OVERWEIGHT">Overweight</option>
                  <option value="UNCLAIMED">Unclaimed</option>
                  <option value="RETURN_REQUEST">Return Request</option>
                  <option value="CUSTOMER_REFUSAL">Customer Refusal</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">Reason *</label><Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required /></div>
              <div><label className="text-sm font-medium">Station ID (optional)</label><Input value={form.stationId} onChange={e => setForm({ ...form, stationId: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Description</label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit">Create Exception</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Reason</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Station</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                    </tr>
                  ))
                ) : exceptions.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
                    No exceptions found
                  </td></tr>
                ) : (
                  exceptions.map((exc) => (
                    <tr key={exc.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{exc.shipment?.trackingNumber || "—"}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{exc.type.replace(/_/g, " ")}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{exc.reason}</td>
                      <td className="px-4 py-3 text-muted-foreground">{exc.station?.name || "—"}</td>
                      <td className="px-4 py-3"><Badge variant={statusColors[exc.status] || "secondary"}>{exc.status.replace(/_/g, " ")}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(exc.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {exc.status === "OPEN" && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => handleResolve(exc.id)}>Resolve</Button>
                              <Button size="sm" variant="ghost" onClick={() => handleEscalate(exc.id)}>Escalate</Button>
                            </>
                          )}
                          {exc.status === "ESCALATED" && (
                            <Button size="sm" variant="ghost" onClick={() => handleResolve(exc.id)}>Resolve</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
