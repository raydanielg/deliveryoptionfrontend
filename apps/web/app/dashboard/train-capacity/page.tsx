"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Train01Icon, PlusIcon, Edit01Icon, TrashIcon,
  WeightScaleIcon, Calendar01Icon, Route02Icon,
} from "@hugeicons/core-free-icons"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { formatNumber, formatDate } from "@/lib/format"
import { toast } from "sonner"

export default function TrainCapacityPage() {
  const [trains, setTrains] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any>(null)

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const res = await api.trainCapacity.list("?limit=100")
      const rawTrains = res.data?.trains || res.data
      setTrains(Array.isArray(rawTrains) ? rawTrains : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load trains")
    } finally {
      setLoading(false)
    }
  }

  const totalCapacity = trains.reduce((sum, t) => sum + Number(t.totalCapacityKg), 0)
  const totalAllocated = trains.reduce((sum, t) => sum + Number(t.allocatedKg), 0)
  const totalUsed = trains.reduce((sum, t) => sum + Number(t.usedKg), 0)
  const totalRemaining = trains.reduce((sum, t) => sum + Number(t.remainingKg), 0)
  const activeTrains = trains.filter((t) => t.isActive).length

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Train Capacity" }]}>
      <div className="space-y-6 p-4 lg:p-6">
        <PageHeader
          title="Train / Capacity Management"
          description="Configure train departures, routes, and cargo capacity allocation for SGR services"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Trains" value={formatNumber(trains.length)} icon={Train01Icon} loading={loading} hint={`${activeTrains} active`} />
          <MetricCard label="Total Capacity" value={`${formatNumber(totalCapacity)} kg`} icon={WeightScaleIcon} loading={loading} hint="Across all trains" />
          <MetricCard label="Allocated" value={`${formatNumber(totalAllocated)} kg`} icon={Route02Icon} loading={loading} hint="Xerin reserved" />
          <MetricCard label="Remaining" value={`${formatNumber(totalRemaining)} kg`} icon={WeightScaleIcon} loading={loading} hint="Available capacity" />
        </div>

        <div className="flex justify-end">
          <TrainDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            editing={editing}
            onSaved={() => { load(); setEditing(null); setDialogOpen(false) }}
          />
        </div>

        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Train Number</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Departure</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Total Capacity</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Used</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Remaining</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                    </tr>
                  ))
                ) : trains.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Train01Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No trains configured yet</p>
                    </td>
                  </tr>
                ) : (
                  trains.map((train) => (
                    <tr key={train.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{train.trainNumber}</td>
                      <td className="px-4 py-3">{train.route}</td>
                      <td className="px-4 py-3">{formatDate(train.departureAt)}</td>
                      <td className="px-4 py-3">{formatNumber(Number(train.totalCapacityKg))} kg</td>
                      <td className="px-4 py-3">{formatNumber(Number(train.usedKg))} kg</td>
                      <td className="px-4 py-3">
                        <span className={Number(train.remainingKg) < Number(train.totalCapacityKg) * 0.2 ? "text-amber-600 font-medium" : ""}>
                          {formatNumber(Number(train.remainingKg))} kg
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={train.isActive ? "default" : "secondary"}>{train.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditing(train); setDialogOpen(true) }}>
                            <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-7" onClick={async () => {
                            try { await api.trainCapacity.delete(train.id); toast.success("Train deleted"); load() }
                            catch (err: any) { toast.error(err.message) }
                          }}>
                            <HugeiconsIcon icon={TrashIcon} className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function TrainDialog({ open, onOpenChange, editing, onSaved }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: any
  onSaved: () => void
}) {
  const [trainNumber, setTrainNumber] = React.useState("")
  const [route, setRoute] = React.useState("")
  const [departureAt, setDepartureAt] = React.useState("")
  const [arrivalAt, setArrivalAt] = React.useState("")
  const [totalCapacityKg, setTotalCapacityKg] = React.useState("")
  const [allocatedKg, setAllocatedKg] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (editing) {
      setTrainNumber(editing.trainNumber)
      setRoute(editing.route)
      setDepartureAt(editing.departureAt ? new Date(editing.departureAt).toISOString().slice(0, 16) : "")
      setArrivalAt(editing.arrivalAt ? new Date(editing.arrivalAt).toISOString().slice(0, 16) : "")
      setTotalCapacityKg(String(editing.totalCapacityKg))
      setAllocatedKg(String(editing.allocatedKg))
    } else {
      setTrainNumber("")
      setRoute("")
      setDepartureAt("")
      setArrivalAt("")
      setTotalCapacityKg("")
      setAllocatedKg("0")
    }
  }, [editing, open])

  async function handleSave() {
    if (!trainNumber || !route || !departureAt || !totalCapacityKg) {
      toast.error("Please fill in all required fields")
      return
    }

    setSaving(true)
    try {
      const body: any = {
        trainNumber,
        route,
        departureAt: new Date(departureAt).toISOString(),
        totalCapacityKg: Number(totalCapacityKg),
        allocatedKg: Number(allocatedKg) || 0,
      }
      if (arrivalAt) body.arrivalAt = new Date(arrivalAt).toISOString()

      if (editing) {
        await api.trainCapacity.update(editing.id, body)
        toast.success("Train updated")
      } else {
        await api.trainCapacity.create(body)
        toast.success("Train created")
      }
      onSaved()
    } catch (err: any) {
      toast.error(err.message || "Failed to save train")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Train" : "Add Train"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Train Number *</Label>
            <Input value={trainNumber} onChange={(e) => setTrainNumber(e.target.value)} placeholder="e.g. TRC-001" />
          </div>
          <div>
            <Label>Route *</Label>
            <Input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="e.g. Dar es Salaam → Dodoma" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Departure *</Label>
              <Input type="datetime-local" value={departureAt} onChange={(e) => setDepartureAt(e.target.value)} />
            </div>
            <div>
              <Label>Arrival</Label>
              <Input type="datetime-local" value={arrivalAt} onChange={(e) => setArrivalAt(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Total Capacity (kg) *</Label>
              <Input type="number" value={totalCapacityKg} onChange={(e) => setTotalCapacityKg(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label>Allocated to Xerin (kg)</Label>
              <Input type="number" value={allocatedKg} onChange={(e) => setAllocatedKg(e.target.value)} placeholder="0" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : editing ? "Update Train" : "Create Train"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
