"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Invoice01Icon,
  HourglassIcon,
  CheckmarkCircle02Icon,
  RefreshCcwIcon,
  PlusIcon,
  Dollar01Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatMoney } from "@/lib/format"

const MANAGE_ROLES = ["SUPER_ADMIN", "OPERATIONS_MANAGER", "FINANCE"]
const REOPEN_ROLES = ["SUPER_ADMIN", "OPERATIONS_MANAGER"]

// Statuses the backend actually stores (Invoice.status). "Overdue" is derived: unpaid + past due date.
const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PAID", label: "Paid" },
]

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "MPESA", label: "M-Pesa" },
  { value: "TIGOPESA", label: "Tigo Pesa" },
  { value: "AIRTEL_MONEY", label: "Airtel Money" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "NMB", label: "NMB" },
  { value: "CRDB", label: "CRDB" },
  { value: "CARD", label: "Card" },
]

const isOverdue = (i: any) => i.status === "UNPAID" && !!i.dueDate && new Date(i.dueDate).getTime() < Date.now()
const customerOf = (i: any) => i.shipment?.customer?.user?.name || ""

export default function InvoicingPage() {
  const { user } = useAuth()
  const canManage = !!user && MANAGE_ROLES.includes(user.role)
  const canReopen = !!user && REOPEN_ROLES.includes(user.role)

  const [invoices, setInvoices] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [search, setSearch] = React.useState("")

  // Create sheet
  const [createOpen, setCreateOpen] = React.useState(false)
  const [shipmentId, setShipmentId] = React.useState("")
  const [preview, setPreview] = React.useState<any>(null)
  const [previewing, setPreviewing] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [freight, setFreight] = React.useState("")

  // Payment sheet
  const [payTarget, setPayTarget] = React.useState<any>(null)
  const [payRemarks, setPayRemarks] = React.useState("")
  const [payMethod, setPayMethod] = React.useState("CASH")
  const [paying, setPaying] = React.useState(false)

  React.useEffect(() => { load() }, [statusFilter])

  async function load() {
    setLoading(true)
    try {
      const params = `limit=100${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`
      const res = await api.invoicing.list(params)
      const raw = res.data?.invoices || res.data
      setInvoices(Array.isArray(raw) ? raw : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }

  const filtered = React.useMemo(() => {
    if (!search.trim()) return invoices
    const q = search.toLowerCase()
    return invoices.filter((inv) =>
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.shipment?.trackingNumber?.toLowerCase().includes(q) ||
      customerOf(inv).toLowerCase().includes(q)
    )
  }, [invoices, search])

  const stats = React.useMemo(() => {
    const unpaid = invoices.filter((i) => i.status === "UNPAID")
    const paid = invoices.filter((i) => i.status === "PAID")
    const sum = (list: any[]) => list.reduce((s, i) => s + Number(i.total || 0), 0)
    return { pending: unpaid.length, paid: paid.length, outstanding: sum(unpaid), collected: sum(paid), overdue: unpaid.filter(isOverdue).length }
  }, [invoices])

  async function handlePreview() {
    if (!shipmentId.trim()) { toast.error("Enter a shipment ID"); return }
    setPreviewing(true)
    setPreview(null)
    try {
      const res = await api.invoicing.preview(shipmentId.trim())
      setPreview(res.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to preview invoice")
    } finally {
      setPreviewing(false)
    }
  }

  async function handleCreate() {
    if (!shipmentId.trim()) return
    if (freight.trim() === "" || Number(freight) < 0) { toast.error("Enter the freight charge"); return }
    setCreating(true)
    try {
      await api.invoicing.create({ shipmentId: shipmentId.trim(), freightCharges: Number(freight) })
      toast.success("Invoice created")
      setCreateOpen(false)
      setShipmentId("")
      setFreight("")
      setPreview(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice")
    } finally {
      setCreating(false)
    }
  }

  async function handlePay() {
    if (!payTarget) return
    setPaying(true)
    try {
      await api.invoicing.recordPayment(payTarget.id, { paymentMethod: payMethod, ...(payRemarks.trim() ? { remarks: payRemarks.trim() } : {}) })
      toast.success("Payment recorded")
      setPayTarget(null)
      setPayRemarks("")
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment")
    } finally {
      setPaying(false)
    }
  }

  async function handleReopen(id: string) {
    const reason = window.prompt("Reason for reopening this paid invoice (required):")?.trim()
    if (!reason) return
    try {
      await api.invoicing.reopen(id, { reason })
      toast.success("Invoice reopened")
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to reopen invoice")
    }
  }

  const statusVariant = (s: string) =>
    s === "PAID" ? "default" : s === "OVERDUE" ? "destructive" : "secondary"

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Invoicing" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Invoicing"
          description="Per-shipment invoices with charge breakdown — freight, storage, delivery, other"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={load}>
                <HugeiconsIcon icon={RefreshCcwIcon} className="size-4" />
                Refresh
              </Button>
              {canManage && (
                <Button onClick={() => setCreateOpen(true)}>
                  <HugeiconsIcon icon={PlusIcon} className="size-4" />
                  New Invoice
                </Button>
              )}
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Unpaid" value={formatNumber(stats.pending)} icon={HourglassIcon} loading={loading} hint={stats.overdue ? `${stats.overdue} overdue` : "Awaiting payment"} />
          <MetricCard label="Paid" value={formatNumber(stats.paid)} icon={CheckmarkCircle02Icon} loading={loading} hint="This view" />
          <MetricCard label="Outstanding" value={formatMoney(stats.outstanding, "TZS", { compact: true })} icon={Invoice01Icon} loading={loading} hint="Unpaid total" />
          <MetricCard label="Collected" value={formatMoney(stats.collected, "TZS", { compact: true })} icon={Dollar01Icon} loading={loading} hint="Paid invoices" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input placeholder="Search invoice #, tracking #, customer…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
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
                  <th className="px-4 py-3 font-medium text-muted-foreground">Invoice #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Freight</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Storage</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Delivery</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Paid</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td className="px-4 py-3" colSpan={10}><Skeleton className="h-5 w-full" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Invoice01Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No invoices found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv: any) => (
                    <tr key={inv.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.shipment?.trackingNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{customerOf(inv) || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{formatMoney(Number(inv.freightCharges || 0), inv.currency)}</td>
                      <td className="px-4 py-3 tabular-nums">{formatMoney(Number(inv.storageCharges || 0), inv.currency)}</td>
                      <td className="px-4 py-3 tabular-nums">{formatMoney(Number(inv.deliveryCharges || 0), inv.currency)}</td>
                      <td className="px-4 py-3 tabular-nums font-semibold">{formatMoney(Number(inv.total || 0), inv.currency)}</td>
                      <td className="px-4 py-3 tabular-nums">{formatMoney(inv.status === "PAID" ? Number(inv.total || 0) : 0, inv.currency)}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant(isOverdue(inv) ? "OVERDUE" : inv.status)}>{isOverdue(inv) ? "OVERDUE" : inv.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {canManage && inv.status === "UNPAID" && (
                            <Button size="sm" variant="outline" onClick={() => { setPayTarget(inv); setPayRemarks("") }}>
                              Mark paid
                            </Button>
                          )}
                          {canReopen && inv.status === "PAID" && (
                            <Button size="sm" variant="ghost" onClick={() => handleReopen(inv.id)}>Reopen</Button>
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

      {/* Create Invoice Sheet */}
      <Sheet open={createOpen} onOpenChange={(v) => { if (!v) { setCreateOpen(false); setPreview(null); setShipmentId(""); setFreight("") } }}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Invoice01Icon} className="size-5" />
              New Invoice
            </SheetTitle>
            <SheetDescription>Enter a shipment ID to preview charges, then create the invoice.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Shipment ID <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Input value={shipmentId} onChange={(e) => setShipmentId(e.target.value)} placeholder="Shipment ID" />
                <Button variant="outline" onClick={handlePreview} loading={previewing}>Preview</Button>
              </div>
            </div>

            {preview && (
              <div className="space-y-3">
                <div className="rounded-lg border p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tracking</span><span className="font-medium">{preview.trackingNumber}</span></div>
                  {preview.customer && <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{preview.customer}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Storage ({preview.chargeableDays ?? 0} days)</span><span className="tabular-nums">{formatMoney(Number(preview.storageCharge || 0), "TZS")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="tabular-nums">{formatMoney(Number(preview.deliveryFee || 0), "TZS")}</span></div>
                </div>
                <div className="grid gap-2">
                  <Label>Freight charge <span className="text-destructive">*</span></Label>
                  <Input type="number" min="0" step="0.01" value={freight} onChange={(e) => setFreight(e.target.value)} placeholder="Entered by finance" />
                </div>
                <div className="flex justify-between rounded-lg border bg-muted/30 p-3 text-sm font-semibold">
                  <span>Invoice total</span>
                  <span className="tabular-nums">{formatMoney(Number(freight || 0) + Number(preview.totalCharges || 0), "TZS")}</span>
                </div>
              </div>
            )}

            <Button className="w-full" onClick={handleCreate} loading={creating} disabled={!shipmentId.trim() || !preview || freight.trim() === ""}>
              Create Invoice
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Record Payment Sheet */}
      <Sheet open={!!payTarget} onOpenChange={(v) => !v && setPayTarget(null)}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Dollar01Icon} className="size-5 text-emerald-600" />
              Record Payment
            </SheetTitle>
            <SheetDescription>{payTarget?.invoiceNumber} — {formatMoney(Number(payTarget?.total || 0), payTarget?.currency)} due, settled in full</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Reference / remarks</Label>
              <Input value={payRemarks} onChange={(e) => setPayRemarks(e.target.value)} placeholder="Receipt or transaction reference (optional)" maxLength={500} />
            </div>
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <Select value={payMethod} onValueChange={(v) => setPayMethod(v ?? "CASH")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handlePay} loading={paying}>
              Confirm payment received
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
