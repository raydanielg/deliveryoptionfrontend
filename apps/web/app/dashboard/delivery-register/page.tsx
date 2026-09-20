"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DeliverySentIcon,
  HourglassIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  RefreshCcwIcon,
  PlusIcon,
  TruckIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatMoney } from "@/lib/format"

const OPERATE_ROLES = ["SUPER_ADMIN", "OPERATIONS_MANAGER"]
const DRIVER_ROLES = ["SUPER_ADMIN", "OPERATIONS_MANAGER", "DRIVER"]
const MANAGER_ROLES = ["SUPER_ADMIN", "OPERATIONS_MANAGER"]

const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "FAILED_DELIVERY", label: "Failed" },
]

export default function DeliveryRegisterPage() {
  const { user } = useAuth()
  const canOperate = !!user && OPERATE_ROLES.includes(user.role)
  const canDrive = !!user && DRIVER_ROLES.includes(user.role)
  const canApproveFee = !!user && MANAGER_ROLES.includes(user.role)

  const [records, setRecords] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [search, setSearch] = React.useState("")

  // Create sheet
  const [createOpen, setCreateOpen] = React.useState(false)
  const [drivers, setDrivers] = React.useState<any[]>([])
  const [vehicles, setVehicles] = React.useState<any[]>([])
  const [zones, setZones] = React.useState<any[]>([])
  const [form, setForm] = React.useState({ shipmentId: "", driverId: "", vehicleId: "", zoneId: "", deliveryFee: "", feeOverrideReason: "", address: "" })
  const [creating, setCreating] = React.useState(false)

  // Complete sheet
  const [completeTarget, setCompleteTarget] = React.useState<any>(null)
  const [receiverName, setReceiverName] = React.useState("")
  const [receiverOtp, setReceiverOtp] = React.useState("")
  const [completing, setCompleting] = React.useState(false)

  // Fail sheet
  const [failTarget, setFailTarget] = React.useState<any>(null)
  const [failReason, setFailReason] = React.useState("")
  const [failing, setFailing] = React.useState(false)

  React.useEffect(() => { load() }, [statusFilter])

  async function load() {
    setLoading(true)
    try {
      const params = statusFilter !== "ALL" ? `status=${statusFilter}` : ""
      const res = await api.deliveryRegister.list(params)
      const raw = res.data
      setRecords(Array.isArray(raw) ? raw : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load deliveries")
    } finally {
      setLoading(false)
    }
  }

  async function openCreate() {
    setCreateOpen(true)
    try {
      const [d, v, z] = await Promise.all([api.drivers.list(), api.vehicles.list(), api.deliveryConfig.zones()])
      setDrivers(Array.isArray(d.data) ? d.data : [])
      setVehicles(Array.isArray(v.data) ? v.data : [])
      setZones(Array.isArray(z.data) ? z.data : [])
    } catch { /* dropdowns stay empty — user can still type IDs */ }
  }

  const filtered = React.useMemo(() => {
    if (!search.trim()) return records
    const q = search.toLowerCase()
    return records.filter((r) =>
      r.deliveryNo?.toLowerCase().includes(q) ||
      r.shipment?.trackingNumber?.toLowerCase().includes(q) ||
      r.driver?.user?.name?.toLowerCase().includes(q) ||
      r.shipment?.customer?.user?.name?.toLowerCase().includes(q)
    )
  }, [records, search])

  const stats = React.useMemo(() => {
    const assigned = records.filter((r) => r.status === "ASSIGNED").length
    const out = records.filter((r) => r.status === "OUT_FOR_DELIVERY").length
    const delivered = records.filter((r) => r.status === "DELIVERED").length
    const failed = records.filter((r) => r.status === "FAILED_DELIVERY").length
    return { assigned, out, delivered, failed }
  }, [records])

  function setF(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleCreate() {
    if (!form.shipmentId.trim() || !form.driverId) { toast.error("Shipment ID and driver are required"); return }
    setCreating(true)
    try {
      await api.deliveryRegister.create({
        shipmentId: form.shipmentId.trim(),
        driverId: form.driverId,
        vehicleId: form.vehicleId || undefined,
        zoneId: form.zoneId || undefined,
        deliveryFee: form.deliveryFee ? Number(form.deliveryFee) : undefined,
        feeOverrideReason: form.feeOverrideReason || undefined,
        address: form.address || undefined,
      })
      toast.success("Delivery assigned")
      setCreateOpen(false)
      setForm({ shipmentId: "", driverId: "", vehicleId: "", zoneId: "", deliveryFee: "", feeOverrideReason: "", address: "" })
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to create delivery")
    } finally {
      setCreating(false)
    }
  }

  async function handleOutForDelivery(id: string) {
    try {
      await api.deliveryRegister.outForDelivery(id)
      toast.success("Marked out for delivery")
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to update")
    }
  }

  async function handleComplete() {
    if (!completeTarget || !receiverName.trim()) { toast.error("Receiver name is required"); return }
    if (!receiverOtp.trim()) { toast.error("Customer OTP is required to close a delivery"); return }
    setCompleting(true)
    try {
      await api.deliveryRegister.complete(completeTarget.id, { receiverName: receiverName.trim(), receiverOtp: receiverOtp.trim() })
      toast.success("Delivery completed")
      setCompleteTarget(null); setReceiverName(""); setReceiverOtp("")
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to complete delivery")
    } finally {
      setCompleting(false)
    }
  }

  async function handleFail() {
    if (!failTarget || !failReason.trim()) { toast.error("Enter a failure reason"); return }
    setFailing(true)
    try {
      await api.deliveryRegister.fail(failTarget.id, { reason: failReason.trim() })
      toast.success("Marked as failed — parcel returned to warehouse")
      setFailTarget(null); setFailReason("")
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to mark delivery")
    } finally {
      setFailing(false)
    }
  }

  async function handleFeeDecision(id: string, approved: boolean) {
    try {
      await api.deliveryRegister.approveFeeOverride(id, { approved })
      toast.success(approved ? "Fee override approved" : "Fee override rejected")
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to decide fee override")
    }
  }

  const statusVariant = (s: string) =>
    s === "DELIVERED" ? "default" : s === "FAILED_DELIVERY" ? "destructive" : s === "OUT_FOR_DELIVERY" ? "secondary" : "outline"

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Delivery Register" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Delivery Register"
          description="Assign drivers to shipments, track out-for-delivery, and close with OTP or signature"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={load}>
                <HugeiconsIcon icon={RefreshCcwIcon} className="size-4" />
                Refresh
              </Button>
              {canOperate && (
                <Button onClick={openCreate}>
                  <HugeiconsIcon icon={PlusIcon} className="size-4" />
                  Assign Delivery
                </Button>
              )}
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Assigned" value={formatNumber(stats.assigned)} icon={HourglassIcon} loading={loading} hint="Awaiting dispatch" />
          <MetricCard label="Out for Delivery" value={formatNumber(stats.out)} icon={TruckIcon} loading={loading} hint="On the road" />
          <MetricCard label="Delivered" value={formatNumber(stats.delivered)} icon={CheckmarkCircle02Icon} loading={loading} hint="This view" />
          <MetricCard label="Failed" value={formatNumber(stats.failed)} icon={Cancel01Icon} loading={loading} hint="Returned to warehouse" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input placeholder="Search delivery #, tracking #, driver, customer…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
            <SelectTrigger className="w-full sm:w-[190px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Delivery #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Driver</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Zone</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Fee</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Attempt</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td className="px-4 py-3" colSpan={9}><Skeleton className="h-5 w-full" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={DeliverySentIcon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No deliveries found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r: any) => (
                    <tr key={r.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{r.deliveryNo}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.shipment?.trackingNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.shipment?.customer?.user?.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.driver?.user?.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.zone?.name || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatMoney(Number(r.deliveryFee || 0), "TZS")}
                        {r.feeOverrideReason && !r.feeApprovedById && (
                          <Badge variant="secondary" className="ml-1 text-[10px]">override pending</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{r.attempt}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant(r.status)}>{r.status.replace(/_/g, " ")}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {canOperate && r.status === "ASSIGNED" && !(r.feeOverrideReason && !r.feeApprovedById) && (
                            <Button size="sm" variant="outline" onClick={() => handleOutForDelivery(r.id)}>Dispatch</Button>
                          )}
                          {canDrive && r.status === "OUT_FOR_DELIVERY" && (
                            <>
                              <Button size="sm" onClick={() => setCompleteTarget(r)}>Complete</Button>
                              <Button size="sm" variant="destructive" onClick={() => setFailTarget(r)}>Fail</Button>
                            </>
                          )}
                          {canApproveFee && r.feeOverrideReason && !r.feeApprovedById && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleFeeDecision(r.id, true)}>Approve Fee</Button>
                              <Button size="sm" variant="ghost" onClick={() => handleFeeDecision(r.id, false)}>Reject Fee</Button>
                            </>
                          )}
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

      {/* Assign Delivery Sheet */}
      <Sheet open={createOpen} onOpenChange={(v) => !v && setCreateOpen(false)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={DeliverySentIcon} className="size-5" />
              Assign Delivery
            </SheetTitle>
            <SheetDescription>Assign a driver and vehicle to a shipment. Payment approval is required first.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Shipment ID <span className="text-destructive">*</span></Label>
              <Input value={form.shipmentId} onChange={(e) => setF("shipmentId", e.target.value)} placeholder="Shipment ID" />
            </div>
            <div className="grid gap-2">
              <Label>Driver <span className="text-destructive">*</span></Label>
              <Select value={form.driverId} onValueChange={(v) => setF("driverId", v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => <SelectItem key={d.id} value={d.id}>{d.user?.name || d.id}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Vehicle</Label>
              <Select value={form.vehicleId} onValueChange={(v) => setF("vehicleId", v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select vehicle (optional)" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.registrationNo || v.id}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Zone</Label>
              <Select value={form.zoneId} onValueChange={(v) => setF("zoneId", v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select zone (optional)" /></SelectTrigger>
                <SelectContent>
                  {zones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name} — {formatMoney(Number(z.feeAmount), "TZS")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Delivery Fee (leave blank for zone rate)</Label>
              <Input type="number" min="0" value={form.deliveryFee} onChange={(e) => setF("deliveryFee", e.target.value)} placeholder="Zone rate" />
            </div>
            <div className="grid gap-2">
              <Label>Fee Override Reason (if fee differs from zone rate)</Label>
              <Input value={form.feeOverrideReason} onChange={(e) => setF("feeOverrideReason", e.target.value)} placeholder="e.g. Special quote" />
            </div>
            <div className="grid gap-2">
              <Label>Delivery Address</Label>
              <Textarea value={form.address} onChange={(e) => setF("address", e.target.value)} placeholder="Street, area, landmark" />
            </div>
            <Button className="w-full" onClick={handleCreate} loading={creating} disabled={!form.shipmentId.trim() || !form.driverId}>
              Assign Delivery
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Complete Delivery Sheet */}
      <Sheet open={!!completeTarget} onOpenChange={(v) => !v && setCompleteTarget(null)}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 text-emerald-600" />
              Complete Delivery
            </SheetTitle>
            <SheetDescription>{completeTarget?.deliveryNo} — {completeTarget?.shipment?.trackingNumber}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Receiver Name <span className="text-destructive">*</span></Label>
              <Input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Who received the parcel" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label>Customer OTP <span className="text-destructive">*</span></Label>
              <Input value={receiverOtp} onChange={(e) => setReceiverOtp(e.target.value)} placeholder="OTP from customer" />
            </div>
            <Button className="w-full" onClick={handleComplete} loading={completing} disabled={!receiverName.trim() || !receiverOtp.trim()}>
              Confirm Delivery
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Fail Delivery Sheet */}
      <Sheet open={!!failTarget} onOpenChange={(v) => !v && setFailTarget(null)}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Cancel01Icon} className="size-5 text-destructive" />
              Failed Delivery
            </SheetTitle>
            <SheetDescription>{failTarget?.deliveryNo} — parcel returns to warehouse, storage resumes.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Reason <span className="text-destructive">*</span></Label>
              <Textarea value={failReason} onChange={(e) => setFailReason(e.target.value)} placeholder="e.g. Customer not available, wrong address" autoFocus />
            </div>
            <Button className="w-full" variant="destructive" onClick={handleFail} loading={failing} disabled={!failReason.trim()}>
              Mark as Failed
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
