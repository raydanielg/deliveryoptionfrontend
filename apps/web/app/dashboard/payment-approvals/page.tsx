"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { getSocket } from "@/lib/socket"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CreditCardIcon,
  HourglassIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  RefreshCcwIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { formatNumber, formatMoney, formatDate } from "@/lib/format"

const APPROVE_ROLES = ["SUPER_ADMIN", "OPERATIONS_MANAGER", "FINANCE"]

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
]

export default function PaymentApprovalsPage() {
  const { user } = useAuth()
  const canApprove = !!user && APPROVE_ROLES.includes(user.role)
  const [approvals, setApprovals] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState("PENDING")
  const [actingId, setActingId] = React.useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = React.useState<any>(null)
  const [rejectReason, setRejectReason] = React.useState("")
  const [rejecting, setRejecting] = React.useState(false)

  React.useEffect(() => { load() }, [statusFilter])

  React.useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onRequested = () => {
      toast.info("New payment approval requested")
      load()
    }
    const onResolved = () => load()
    socket.on("payment:approval_requested", onRequested)
    socket.on("payment:approval_resolved", onResolved)
    return () => {
      socket.off("payment:approval_requested", onRequested)
      socket.off("payment:approval_resolved", onResolved)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function load() {
    setLoading(true)
    try {
      const params = statusFilter !== "ALL" ? `approvalStatus=${statusFilter}` : ""
      const res = await api.paymentApprovals.list(params)
      const raw = res.data?.approvals || res.data
      setApprovals(Array.isArray(raw) ? raw : [])
    } catch (err: any) {
      toast.error(err.message || "Failed to load payment approvals")
    } finally {
      setLoading(false)
    }
  }

  const stats = React.useMemo(() => {
    const pending = approvals.filter((a) => a.approvalStatus === "PENDING").length
    const approved = approvals.filter((a) => a.approvalStatus === "APPROVED").length
    const rejected = approvals.filter((a) => a.approvalStatus === "REJECTED").length
    const pendingTotal = approvals.filter((a) => a.approvalStatus === "PENDING").reduce((sum, a) => sum + Number(a.totalCharges || 0), 0)
    return { pending, approved, rejected, pendingTotal }
  }, [approvals])

  async function handleApprove(id: string) {
    setActingId(id)
    try {
      await api.paymentApprovals.approve(id)
      toast.success("Approval granted")
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to approve")
    } finally {
      setActingId(null)
    }
  }

  async function handleReject() {
    if (!rejectTarget || !rejectReason.trim()) {
      toast.error("Enter a rejection reason")
      return
    }
    setRejecting(true)
    try {
      await api.paymentApprovals.reject(rejectTarget.id, { reason: rejectReason.trim() })
      toast.success("Approval rejected")
      setRejectTarget(null)
      setRejectReason("")
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to reject")
    } finally {
      setRejecting(false)
    }
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Payment Approvals" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Payment Approvals"
          description="Charges that must be approved before a shipment can be released"
          actions={
            <Button variant="outline" onClick={load}>
              <HugeiconsIcon icon={RefreshCcwIcon} className="size-4" />
              Refresh
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Pending" value={formatNumber(stats.pending)} icon={HourglassIcon} loading={loading} hint="Awaiting decision" />
          <MetricCard label="Approved" value={formatNumber(stats.approved)} icon={CheckmarkCircle02Icon} loading={loading} hint="This view" />
          <MetricCard label="Rejected" value={formatNumber(stats.rejected)} icon={Cancel01Icon} loading={loading} hint="This view" />
          <MetricCard label="Pending Value" value={formatMoney(stats.pendingTotal, undefined, { compact: true })} icon={CreditCardIcon} loading={loading} hint="Sum of pending charges" />
        </div>

        {!canApprove && (
          <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Your role can view this queue but only Super Admin, Operations Manager, or Finance can approve or reject.
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "PENDING")}>
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
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tracking #</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Delivery Option</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Storage</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Delivery Fee</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Other</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Requested By</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td className="px-4 py-3" colSpan={9}><Skeleton className="h-5 w-full" /></td></tr>
                  ))
                ) : approvals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={CreditCardIcon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No payment approvals found</p>
                    </td>
                  </tr>
                ) : (
                  approvals.map((a: any) => (
                    <tr key={a.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{a.shipment?.trackingNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.shipment?.deliveryOption?.replace(/_/g, " ") || "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{formatMoney(Number(a.storageCharge || 0), a.shipment?.currency)}</td>
                      <td className="px-4 py-3 tabular-nums">{formatMoney(Number(a.deliveryFee || 0), a.shipment?.currency)}</td>
                      <td className="px-4 py-3 tabular-nums">{formatMoney(Number(a.otherCharges || 0), a.shipment?.currency)}</td>
                      <td className="px-4 py-3 tabular-nums font-semibold">{formatMoney(Number(a.totalCharges || 0), a.shipment?.currency)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.requestedBy?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={a.approvalStatus === "APPROVED" ? "default" : a.approvalStatus === "REJECTED" ? "destructive" : "secondary"}>
                          {a.approvalStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {a.approvalStatus === "PENDING" && canApprove ? (
                          <div className="flex gap-1">
                            <Button size="sm" loading={actingId === a.id} onClick={() => handleApprove(a.id)}>
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setRejectTarget(a)}>
                              <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                              Reject
                            </Button>
                          </div>
                        ) : a.approvalStatus === "REJECTED" && a.rejectionReason ? (
                          <span className="text-xs text-muted-foreground">{a.rejectionReason}</span>
                        ) : a.approvalStatus === "APPROVED" ? (
                          <span className="text-xs text-muted-foreground">by {a.approvedBy?.name || "—"}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reject Sheet */}
      <Sheet open={!!rejectTarget} onOpenChange={(v) => !v && setRejectTarget(null)}>
        <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Cancel01Icon} className="size-5 text-destructive" />
              Reject Payment Approval
            </SheetTitle>
            <SheetDescription>{rejectTarget?.shipment?.trackingNumber}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="grid gap-2">
              <Label>Reason <span className="text-destructive">*</span></Label>
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this is rejected" autoFocus />
            </div>
            <Button className="w-full" variant="destructive" onClick={handleReject} loading={rejecting} disabled={!rejectReason.trim()}>
              Confirm Rejection
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
