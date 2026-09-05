"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatNumber, formatDate } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CustomerService01Icon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  AlertCircleIcon, ClockIcon, PlusIcon, SendIcon, StarIcon,
} from "@hugeicons/core-free-icons"

export default function TicketsPage() {
  const [tickets, setTickets] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)
  const [statusUpdate, setStatusUpdate] = React.useState("")
  const [reply, setReply] = React.useState("")
  const [replying, setReplying] = React.useState(false)

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.tickets.list()
      setTickets(result.data || [])
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = tickets.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return t.subject?.toLowerCase().includes(q) ||
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.customer?.name?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
  })

  const openCount = tickets.filter((t) => t.status === "OPEN" || t.status === "REOPENED").length
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "ASSIGNED").length
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length
  const highPriorityCount = tickets.filter((t) => t.priority === "HIGH" || t.priority === "URGENT").length

  function openDetail(t: any) {
    setSelected(t)
    setStatusUpdate(t.status)
    setReply("")
  }

  async function updateStatus() {
    if (!selected || !statusUpdate) return
    try {
      await api.tickets.updateStatus(selected.id, { status: statusUpdate })
      toast.success("Ticket status updated")
      setSelected(null)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    }
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return
    setReplying(true)
    try {
      await api.tickets.addReply(selected.id, { message: reply })
      toast.success("Reply sent")
      setReply("")
      const updated = await api.tickets.get(selected.id)
      setSelected(updated.data || updated)
      load()
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply")
    } finally {
      setReplying(false)
    }
  }

  function handleExportPDF() {
    exportToPDF({
      title: "Support Tickets Report",
      subtitle: "All customer support tickets and their status",
      columns: [
        { header: "Ticket #", key: "num" },
        { header: "Subject", key: "subject" },
        { header: "Customer", key: "customer" },
        { header: "Priority", key: "priority" },
        { header: "Status", key: "status" },
        { header: "Date", key: "date" },
      ],
      rows: filtered.map((t) => ({
        num: t.ticketNumber || "—",
        subject: t.subject || "—",
        customer: t.customer?.name || "—",
        priority: t.priority || "—",
        status: t.status || "—",
        date: t.createdAt ? formatDate(t.createdAt) : "—",
      })),
      meta: [
        { label: "Total Tickets", value: String(tickets.length) },
        { label: "Open", value: String(openCount) },
        { label: "Resolved", value: String(resolvedCount) },
      ],
    })
  }

  const statusFilters = ["ALL", "OPEN", "ASSIGNED", "IN_PROGRESS", "REOPENED", "RESOLVED", "CLOSED"]
  const priorityFilters = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"]
  const STATUS_OPTIONS = ["OPEN", "ASSIGNED", "IN_PROGRESS", "REOPENED", "RESOLVED", "CLOSED"]

  const priorityColors: Record<string, string> = {
    URGENT: "bg-red-500/15 text-red-600 border-red-500/30",
    HIGH: "bg-orange-500/15 text-orange-600 border-orange-500/30",
    MEDIUM: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
    LOW: "bg-green-500/15 text-green-600 border-green-500/30",
  }

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Support", href: "/dashboard/support" },
      { label: "Tickets" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="🎫 Tickets"
          description="Customer support tickets — track inquiries, assign agents, and resolve issues."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Tickets" value={formatNumber(tickets.length)} icon={CustomerService01Icon} hint="All tickets" />
          <MetricCard label="Open" value={formatNumber(openCount)} icon={AlertCircleIcon} hint="Awaiting response" />
          <MetricCard label="In Progress" value={formatNumber(inProgressCount)} icon={ClockIcon} hint="Being worked on" />
          <MetricCard label="Resolved" value={formatNumber(resolvedCount)} icon={CheckmarkCircle02Icon} hint="Closed tickets" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search subject, customer, #" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {priorityFilters.map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  priorityFilter === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {p === "ALL" ? "All Priority" : p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {s === "ALL" ? "All Status" : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No tickets found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Ticket #</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Subject</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Priority</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr
                      key={t.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => openDetail(t)}
                    >
                      <td className="px-4 py-3 font-medium tabular-nums">{t.ticketNumber || "—"}</td>
                      <td className="px-4 py-3 max-w-[250px] truncate">{t.subject || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.customer?.name || "—"}</td>
                      <td className="px-4 py-3">
                        {t.priority && (
                          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${priorityColors[t.priority] || "bg-muted/40 text-muted-foreground border-border"}`}>
                            {t.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{t.createdAt ? formatDate(t.createdAt) : "—"}</td>
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
                  <HugeiconsIcon icon={CustomerService01Icon} className="size-5 text-primary" />
                  {selected.ticketNumber || "Ticket"}
                </SheetTitle>
                <SheetDescription>
                  {selected.subject} — {selected.customer?.name || "Unknown"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={selected.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Ticket #</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.ticketNumber || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <p className="mt-1">
                      {selected.priority && (
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${priorityColors[selected.priority] || "bg-muted/40 text-muted-foreground border-border"}`}>
                          {selected.priority}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="mt-1 text-sm font-medium">{selected.customer?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="mt-1 text-sm font-medium">{selected.createdAt ? formatDate(selected.createdAt) : "—"}</p>
                  </div>
                </div>

                {selected.description && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{selected.description}</p>
                  </div>
                )}

                {selected.assignedTo?.name && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="mt-1 text-sm font-medium">{selected.assignedTo.name}</p>
                  </div>
                )}

                {/* Replies */}
                {selected.replies?.length > 0 && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-2">Replies ({selected.replies.length})</p>
                    <div className="space-y-2">
                      {selected.replies.map((r: any, i: number) => (
                        <div key={i} className="rounded-md bg-muted/30 p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{r.author?.name || "Agent"}</span>
                            <span className="text-[10px] text-muted-foreground">{r.createdAt ? formatDate(r.createdAt) : ""}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply input */}
                <div className="space-y-2">
                  <Label>Add Reply</Label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={3}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your response..."
                  />
                  <Button size="sm" className="w-full" onClick={sendReply} disabled={replying || !reply.trim()}>
                    <HugeiconsIcon icon={SendIcon} className="size-4" />
                    {replying ? "Sending..." : "Send Reply"}
                  </Button>
                </div>

                {/* Status update */}
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Close</Button>
                  <Button className="flex-1" onClick={updateStatus}>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                    Update Status
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
