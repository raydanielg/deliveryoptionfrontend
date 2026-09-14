"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Airplane01Icon,
  PlusIcon,
  Search01Icon,
  UserIcon,
  CheckmarkCircle02Icon,
  PackageIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "PLANNED", label: "Planned" },
  { value: "BOXES_ASSIGNED", label: "Boxes Assigned" },
  { value: "DEPARTED", label: "Departed" },
  { value: "ARRIVED", label: "Arrived" },
  { value: "RECONCILED", label: "Reconciled" },
  { value: "CANCELLED", label: "Cancelled" },
]

const EMPTY_FORM = {
  passengerName: "",
  passengerPhone: "",
  passengerIdNumber: "",
  airline: "",
  flightNumber: "",
  flightDate: "",
  departureAirport: "",
  arrivalAirport: "",
  notes: "",
}

export default function TripManifestsPage() {
  const router = useRouter()
  const [trips, setTrips] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [form, setForm] = React.useState(EMPTY_FORM)
  const [creating, setCreating] = React.useState(false)

  React.useEffect(() => { load() }, [statusFilter])

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      if (search) params.set("search", search)
      const res = await api.tripManifests.list(params.toString())
      const raw = res.data?.trips || res.data
      setTrips(Array.isArray(raw) ? raw : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load trip manifests")
    } finally {
      setLoading(false)
    }
  }

  const stats = React.useMemo(() => {
    const planned = trips.filter((t) => t.status === "PLANNED").length
    const assigned = trips.filter((t) => t.status === "BOXES_ASSIGNED").length
    const departed = trips.filter((t) => t.status === "DEPARTED").length
    const arrived = trips.filter((t) => t.status === "ARRIVED" || t.status === "RECONCILED").length
    return { planned, assigned, departed, arrived }
  }, [trips])

  async function handleCreate() {
    if (!form.passengerName || !form.airline || !form.flightNumber || !form.flightDate || !form.departureAirport || !form.arrivalAirport) {
      toast.error("Fill in all required fields")
      return
    }
    setCreating(true)
    try {
      await api.tripManifests.create({
        passengerName: form.passengerName,
        passengerPhone: form.passengerPhone || undefined,
        passengerIdNumber: form.passengerIdNumber || undefined,
        airline: form.airline,
        flightNumber: form.flightNumber,
        flightDate: form.flightDate,
        departureAirport: form.departureAirport,
        arrivalAirport: form.arrivalAirport,
        notes: form.notes || undefined,
      })
      toast.success("Trip manifest created")
      setCreateOpen(false)
      setForm(EMPTY_FORM)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to create trip manifest")
    } finally {
      setCreating(false)
    }
  }

  const filtered = trips.filter((t) => {
    if (!search) return true
    const q = search.toLowerCase()
    return t.tripNo?.toLowerCase().includes(q) || t.passengerName?.toLowerCase().includes(q)
  })

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Trip Manifests" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Trip Manifests"
          description="Passengers carrying consolidation boxes on commercial flights from Dubai"
          actions={
            <Button onClick={() => setCreateOpen(true)}>
              <HugeiconsIcon icon={PlusIcon} className="size-4" />
              Create Trip
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Planned" value={formatNumber(stats.planned)} icon={UserIcon} loading={loading} hint="Awaiting boxes" />
          <MetricCard label="Boxes Assigned" value={formatNumber(stats.assigned)} icon={PackageIcon} loading={loading} hint="Ready to depart" />
          <MetricCard label="Departed" value={formatNumber(stats.departed)} icon={Airplane01Icon} loading={loading} hint="In the air" />
          <MetricCard label="Arrived" value={formatNumber(stats.arrived)} icon={CheckmarkCircle02Icon} loading={loading} hint="Landed in Tanzania" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search trip #, passenger..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
            <SelectTrigger className="w-full sm:w-[190px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} className="sm:ml-auto">
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
            Search
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Trip #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Passenger</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Flight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Flight Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Boxes</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}><td className="px-4 py-3" colSpan={7}><Skeleton className="h-5 w-full" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Airplane01Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No trip manifests found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t: any) => (
                    <tr
                      key={t.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => router.push(`/dashboard/trip-manifests/${t.id}`)}
                    >
                      <td className="px-4 py-3 font-medium">{t.tripNo}</td>
                      <td className="px-4 py-3">{t.passengerName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.airline} {t.flightNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.departureAirport} → {t.arrivalAirport}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(t.flightDate)}</td>
                      <td className="px-4 py-3 tabular-nums">{t.boxes?.length ?? 0}</td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Trip Sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PlusIcon} className="size-5 text-primary" />
              Create Trip Manifest
            </SheetTitle>
            <SheetDescription>Register a passenger and flight to carry consolidation boxes</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Passenger Name <span className="text-destructive">*</span></Label>
              <Input value={form.passengerName} onChange={(e) => setForm({ ...form, passengerName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={form.passengerPhone} onChange={(e) => setForm({ ...form, passengerPhone: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>ID Number</Label>
                <Input value={form.passengerIdNumber} onChange={(e) => setForm({ ...form, passengerIdNumber: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Airline <span className="text-destructive">*</span></Label>
                <Input value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} placeholder="e.g. Emirates" />
              </div>
              <div className="grid gap-2">
                <Label>Flight Number <span className="text-destructive">*</span></Label>
                <Input value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} placeholder="e.g. EK719" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Flight Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={form.flightDate} onChange={(e) => setForm({ ...form, flightDate: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Departure Airport <span className="text-destructive">*</span></Label>
                <Input value={form.departureAirport} onChange={(e) => setForm({ ...form, departureAirport: e.target.value })} placeholder="DXB" />
              </div>
              <div className="grid gap-2">
                <Label>Arrival Airport <span className="text-destructive">*</span></Label>
                <Input value={form.arrivalAirport} onChange={(e) => setForm({ ...form, arrivalAirport: e.target.value })} placeholder="DAR" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
            </div>
            <Button className="w-full" onClick={handleCreate} loading={creating}>Create Trip Manifest</Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
