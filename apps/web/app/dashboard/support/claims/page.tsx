"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { toast } from "sonner"
import { formatNumber, formatDate, formatMoney } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  ClockIcon, Cancel01Icon, ImageIcon,
} from "@hugeicons/core-free-icons"

// Mirrors back/src/modules/claims/controller.js exactly — a claim can only ever move
// forward along this graph, so the status dropdown only offers what the backend will
// actually accept from the claim's current state instead of letting staff pick a dead end.
const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["INVESTIGATION", "APPROVED", "REJECTED"],
  INVESTIGATION: ["APPROVED", "REJECTED"],
  APPROVED: ["RESOLUTION"],
  REJECTED: ["CLOSED"],
  RESOLUTION: ["CLOSED"],
  CLOSED: [],
}
const TYPE_LABELS: Record<string, string> = {
  LOST: "Lost", DAMAGED: "Damaged", MISSING_ITEM: "Missing Item",
  WRONG_DELIVERY: "Wrong Delivery", DELAYED: "Delayed", OTHER: "Other",
}

const STAFF_ROLES = ["SUPER_ADMIN", "OPERATIONS_MANAGER", "CUSTOMER_SUPPORT"]

export default function ClaimsPage() {
  const { user } = useAuth()
  const isStaff = STAFF_ROLES.includes(user?.role || "")
  const [claims, setClaims] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)
  const [nextStatus, setNextStatus] = React.useState("")
  const [resolution, setResolution] = React.useState("")
  const [resolvedAmount, setResolvedAmount] = React.useState("")
  const [updating, setUpdating] = React.useState(false)

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.claims.list()
      const raw = result.data
      setClaims(Array.isArray(raw) ? raw : [])
    } catch {
      setClaims([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = claims.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return c.claimNumber?.toLowerCase().includes(q) ||
      c.customer?.name?.toLowerCase().includes(q) ||
      c.shipment?.trackingNumber?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
  })

  const openCount = claims.filter((c) => !["CLOSED", "REJECTED"].includes(c.status)).length
  const investigatingCount = claims.filter((c) => c.status === "UNDER_REVIEW" || c.status === "INVESTIGATION").length
  const resolvedCount = claims.filter((c) => c.status === "CLOSED").length
  const totalClaimedValue = claims.reduce((sum, c) => sum + Number(c.claimedAmount || 0), 0)

  function openDetail(c: any) {
    setSelected(c)
    const options = VALID_TRANSITIONS[c.status] || []
    setNextStatus(options[0] || c.status)
    setResolution(c.resolution || "")
    setResolvedAmount(c.resolvedAmount ? String(c.resolvedAmount) : "")
  }

  async function submitStatusUpdate() {
    if (!selected || !nextStatus) return
    setUpdating(true)
    try {
      const body: Record<string, any> = { status: nextStatus }
      if (resolution.trim()) body.resolution = resolution.trim()
      if (resolvedAmount) body.resolvedAmount = Number(resolvedAmount)
      await api.claims.updateStatus(selected.id, body)
      toast.success("Claim updated")
      setSelected(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to update claim")
    } finally {
      setUpdating(false)
    }
  }

  function handleExportPDF() {
    exportToPDF({
      title: "Claims Report",
      subtitle: "Customer claims — lost, damaged, missing, wrong delivery, or delayed shipments",
      columns: [
        { header: "Claim #", key: "num" },
        { header: "Shipment", key: "shipment" },
        { header: "Customer", key: "customer" },
        { header: "Type", key: "type" },
        { header: "Claimed", key: "amount" },
        { header: "Status", key: "status" },
        { header: "Date", key: "date" },
      ],
      rows: filtered.map((c) => ({
        num: c.claimNumber || "—",
        shipment: c.shipment?.trackingNumber || "—",
        customer: c.customer?.name || "—",
        type: TYPE_LABELS[c.type] || c.type || "—",
        amount: c.claimedAmount ? formatMoney(Number(c.claimedAmount)) : "—",
        status: c.status || "—",
        date: c.createdAt ? formatDate(c.createdAt) : "—",
      })),
      meta: [
        { label: "Total Claims", value: String(claims.length) },
        { label: "Open", value: String(openCount) },
        { label: "Closed", value: String(resolvedCount) },
      ],
    })
  }

  const statusFilters = ["ALL", "OPEN", "UNDER_REVIEW", "INVESTIGATION", "APPROVED", "REJECTED", "RESOLUTION", "CLOSED"]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Support", href: "/dashboard/support" },
      { label: "Claims" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Claims"
          icon={<HugeiconsIcon icon={AlertCircleIcon} className="size-6 text-primary" />}
          description="Customer claims for lost, damaged, missing, wrongly-delivered, or delayed shipments."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Claims" value={formatNumber(claims.length)} icon={AlertCircleIcon} hint="All claims" />
          <MetricCard label="Open" value={formatNumber(openCount)} icon={ClockIcon} hint="Not yet closed" />
          <MetricCard label="Under Review" value={formatNumber(investigatingCount)} icon={Search01Icon} hint="Being investigated" />
          <MetricCard label="Claimed Value" value={formatMoney(totalClaimedValue)} icon={CheckmarkCircle02Icon} hint="Across all claims" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search claim #, tracking #, customer" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {s === "ALL" ? "All Status" : s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No claims found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Claim #</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Shipment</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Claimed</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="cursor-pointer transition-colors hover:bg-muted/20" onClick={() => openDetail(c)}>
                      <td className="px-4 py-3 font-medium tabular-nums">{c.claimNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.shipment?.trackingNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.customer?.name || "—"}</td>
                      <td className="px-4 py-3">{TYPE_LABELS[c.type] || c.type}</td>
                      <td className="px-4 py-3 tabular-nums">{c.claimedAmount ? formatMoney(Number(c.claimedAmount)) : "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{c.createdAt ? formatDate(c.createdAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-primary" />
                  {selected.claimNumber || "Claim"}
                </SheetTitle>
                <SheetDescription>
                  {TYPE_LABELS[selected.type] || selected.type} — {selected.customer?.name || "Unknown"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={selected.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Shipment</p>
                    <p className="mt-1 text-sm font-medium">{selected.shipment?.trackingNumber || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Claimed Amount</p>
                    <p className="mt-1 text-sm font-medium">{selected.claimedAmount ? formatMoney(Number(selected.claimedAmount)) : "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="mt-1 text-sm font-medium">{selected.customer?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{selected.customer?.phone || selected.customer?.email || ""}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Filed</p>
                    <p className="mt-1 text-sm font-medium">{selected.createdAt ? formatDate(selected.createdAt) : "—"}</p>
                  </div>
                </div>

                {selected.description && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{selected.description}</p>
                  </div>
                )}

                {selected.evidenceUrls?.length > 0 && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                      <HugeiconsIcon icon={ImageIcon} className="size-3.5" />
                      Evidence ({selected.evidenceUrls.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selected.evidenceUrls.map((url: string, i: number) => (
                        <a key={i} href={url.startsWith("http") ? url : `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1$/, "")}${url}`} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border">
                          <img src={url.startsWith("http") ? url : `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1$/, "")}${url}`} alt={`Evidence ${i + 1}`} className="h-20 w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selected.assignedTo?.name && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="mt-1 text-sm font-medium">{selected.assignedTo.name}</p>
                  </div>
                )}

                {selected.resolution && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Resolution</p>
                    <p className="text-sm">{selected.resolution}</p>
                  </div>
                )}

                {/* Status update — staff only; the backend rejects this from a customer anyway,
                    but showing controls that will 403 on click would be misleading. */}
                {!isStaff ? null : (VALID_TRANSITIONS[selected.status] || []).length > 0 ? (
                  <div className="space-y-3 rounded-lg border p-3">
                    <div className="space-y-2">
                      <Label>Move to</Label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={nextStatus}
                        onChange={(e) => setNextStatus(e.target.value)}
                      >
                        {(VALID_TRANSITIONS[selected.status] || []).map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </div>
                    {(nextStatus === "RESOLUTION" || nextStatus === "REJECTED" || nextStatus === "CLOSED") && (
                      <div className="space-y-2">
                        <Label>Resolution Note</Label>
                        <textarea
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          rows={2}
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          placeholder="Explain the outcome for the customer..."
                        />
                      </div>
                    )}
                    {nextStatus === "RESOLUTION" && (
                      <div className="space-y-2">
                        <Label>Approved Amount</Label>
                        <Input type="number" value={resolvedAmount} onChange={(e) => setResolvedAmount(e.target.value)} placeholder="0" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                      <Button className="flex-1" onClick={submitStatusUpdate} disabled={updating}>
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                        {updating ? "Updating..." : "Update"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                    <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                    This claim is closed — no further status changes.
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
