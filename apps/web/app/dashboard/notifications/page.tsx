"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { toast } from "sonner"
import { formatNumber } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Refresh01Icon, CheckmarkCircle02Icon, Notification03Icon,
  Cancel01Icon, Clock01Icon, Search01Icon, Download01Icon,
  SendIcon, AlertCircleIcon,
} from "@hugeicons/core-free-icons"

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatDate(date: string | null | undefined) {
  if (!date) return "—"
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER"
  const [logs, setLogs] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [userNotifs, setUserNotifs] = React.useState<any[]>([])
  const [userLoading, setUserLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState("ALL")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)
  const [bulkOpen, setBulkOpen] = React.useState(false)
  const [bulkForm, setBulkForm] = React.useState({ channel: "SMS", recipient: "", subject: "", message: "" })

  React.useEffect(() => { loadData() }, [])

  async function loadData() {
    if (!isAdmin) {
      try {
        const res = await api.notifications.list()
        const rawNotifs = res.data?.notifications || res.data
        setUserNotifs(Array.isArray(rawNotifs) ? rawNotifs : [])
      } catch {
      } finally {
        setUserLoading(false)
      }
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (channelFilter !== "ALL") params.set("channel", channelFilter)
      if (statusFilter !== "ALL") params.set("status", statusFilter)

      const [logsRes, statsRes] = await Promise.all([
        api.notificationService.logs(params.toString()),
        api.notificationService.stats(),
      ])
      const rawLogs = logsRes.data?.logs || logsRes.data
      setLogs(Array.isArray(rawLogs) ? rawLogs : [])
      setStats(statsRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load notification logs")
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.notifications.markAllRead()
      setUserNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success("All notifications marked as read")
    } catch (err: any) {
      toast.error(err.message || "Failed to mark notifications")
    }
  }

  async function handleBulkSend(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.notificationService.bulk(bulkForm)
      toast.success("Bulk notification sent")
      setBulkOpen(false)
      setBulkForm({ channel: "SMS", recipient: "", subject: "", message: "" })
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Failed to send")
    }
  }

  function handleExportPDF() {
    exportToPDF({
      title: "Notification Logs Report",
      subtitle: "SMS, Email, and Push notification delivery tracking",
      columns: [
        { header: "Recipient", key: "recipient" },
        { header: "Channel", key: "channel" },
        { header: "Provider", key: "provider" },
        { header: "Status", key: "status" },
        { header: "Error", key: "error" },
        { header: "Sent At", key: "sentAt" },
      ],
      rows: filteredLogs.map((log) => ({
        recipient: log.recipient || "—",
        channel: log.channel || "—",
        provider: log.provider || "—",
        status: log.status || "—",
        error: log.errorMessage || "—",
        sentAt: log.sentAt ? formatDate(log.sentAt) : "—",
      })),
      meta: [
        { label: "Total", value: String(logs.length) },
        { label: "Sent", value: String(sentCount) },
        { label: "Failed", value: String(failedCount) },
      ],
    })
  }

  const filteredLogs = logs.filter((log) => {
    if (channelFilter !== "ALL" && log.channel !== channelFilter) return false
    if (statusFilter !== "ALL" && log.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return log.recipient?.toLowerCase().includes(q) ||
      log.provider?.toLowerCase().includes(q) ||
      log.errorMessage?.toLowerCase().includes(q)
  })

  const sentCount = stats?.byStatus?.find((s: any) => s.status === "SENT")?._count.status ?? 0
  const failedCount = stats?.byStatus?.find((s: any) => s.status === "FAILED")?._count.status ?? 0
  const pendingCount = stats?.byStatus?.find((s: any) => s.status === "PENDING")?._count.status ?? 0

  const channelFilters = ["ALL", "SMS", "EMAIL", "PUSH"]
  const statusFilters = ["ALL", "PENDING", "SENT", "FAILED"]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Exceptions", href: "/dashboard/exceptions" },
      { label: "Notifications" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title={isAdmin ? "Notification Logs" : "My Notifications"}
          icon={<HugeiconsIcon icon={Notification03Icon} className="size-6 text-primary" />}
          description={isAdmin ? "SMS, Email, and Push delivery tracking — monitor and send notifications." : "Your personal notifications and updates."}
          actions={
            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <HugeiconsIcon icon={Download01Icon} className="size-4" />
                    Export PDF
                  </Button>
                  <Button size="sm" onClick={() => setBulkOpen(true)}>
                    <HugeiconsIcon icon={SendIcon} className="size-4" />
                    Bulk Send
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => loadData()}>
                    <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
                    Refresh
                  </Button>
                </>
              )}
              {!isAdmin && userNotifs.some((n) => !n.isRead) && (
                <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                  Mark all as read
                </Button>
              )}
            </div>
          }
        />

        {isAdmin && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Sent" value={formatNumber(stats?.total ?? 0)} icon={Notification03Icon} hint="All notifications" loading={loading} />
            <MetricCard label="Delivered" value={formatNumber(sentCount)} icon={CheckmarkCircle02Icon} hint="Successfully delivered" loading={loading} />
            <MetricCard label="Failed" value={formatNumber(failedCount)} icon={Cancel01Icon} hint="Delivery failures" loading={loading} />
            <MetricCard label="Pending" value={formatNumber(pendingCount)} icon={Clock01Icon} hint="Awaiting confirmation" loading={loading} />
          </div>
        )}

        {isAdmin ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-xs">
                <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search recipient, provider, error..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {channelFilters.map((c) => (
                  <button
                    key={c}
                    onClick={() => setChannelFilter(c)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      channelFilter === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {c === "ALL" ? "All Channels" : c}
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
                  {s === "ALL" ? "All Status" : s}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="rounded-lg border bg-card py-12 text-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No notification logs found</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 text-left">
                        <th className="px-4 py-3 font-medium text-muted-foreground">Recipient</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Channel</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Provider</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Error</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="cursor-pointer transition-colors hover:bg-muted/20"
                          onClick={() => setSelected(log)}
                        >
                          <td className="px-4 py-3 font-medium">{log.recipient}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                              {log.channel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{log.provider || "—"}</td>
                          <td className="px-4 py-3"><StatusBadge status={log.status} size="sm" /></td>
                          <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{log.errorMessage || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(log.sentAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border bg-card overflow-hidden">
            {userLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 px-2 py-4">
                    <Skeleton className="size-2 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                      <Skeleton className="h-2.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : userNotifs.length === 0 ? (
              <div className="py-12 text-center">
                <HugeiconsIcon icon={Notification03Icon} className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
                <p className="mt-1 text-xs text-muted-foreground">You'll see updates about your shipments here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {userNotifs.map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-5 py-4 transition-colors hover:bg-muted/30 ${n.isRead ? "opacity-60" : ""}`}
                  >
                    <div
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`}
                    />
                    <div className="min-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <span className="shrink-0 text-[10px] text-muted-foreground/70">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                      {!n.isRead && (
                        <button
                          onClick={async () => {
                            try {
                              await api.notifications.markRead(n.id)
                              setUserNotifs((prev) =>
                                prev.map((item) =>
                                  item.id === n.id ? { ...item, isRead: true } : item,
                                ),
                              )
                            } catch {}
                          }}
                          className="mt-1 text-[10px] font-medium text-primary hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Drawer (Admin) */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Notification03Icon} className="size-5 text-primary" />
                  Notification Details
                </SheetTitle>
                <SheetDescription>
                  {selected.channel} — {selected.recipient}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={selected.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Recipient</p>
                    <p className="mt-1 text-sm font-medium">{selected.recipient || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Channel</p>
                    <p className="mt-1 text-sm font-medium">{selected.channel || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Provider</p>
                    <p className="mt-1 text-sm font-medium">{selected.provider || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Sent At</p>
                    <p className="mt-1 text-sm font-medium">{formatDate(selected.sentAt)}</p>
                  </div>
                </div>

                {selected.subject && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Subject</p>
                    <p className="text-sm font-medium">{selected.subject}</p>
                  </div>
                )}

                {selected.message && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Message</p>
                    <p className="text-sm">{selected.message}</p>
                  </div>
                )}

                {selected.errorMessage && (
                  <div className="rounded-lg border bg-red-500/5 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Error Message</p>
                    <p className="text-sm text-red-600">{selected.errorMessage}</p>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Bulk Send Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Bulk Notification</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkSend} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={bulkForm.channel} onChange={(e) => setBulkForm({ ...bulkForm, channel: e.target.value })}>
                  <option value="SMS">SMS</option>
                  <option value="EMAIL">Email</option>
                  <option value="PUSH">Push</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Recipient(s)</Label>
                <Input value={bulkForm.recipient} onChange={(e) => setBulkForm({ ...bulkForm, recipient: e.target.value })} placeholder="Phone, email, or 'all'" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={bulkForm.subject} onChange={(e) => setBulkForm({ ...bulkForm, subject: e.target.value })} placeholder="Notification subject" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={4}
                value={bulkForm.message}
                onChange={(e) => setBulkForm({ ...bulkForm, message: e.target.value })}
                placeholder="Notification message..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
              <Button type="submit">
                <HugeiconsIcon icon={SendIcon} className="size-4" />
                Send
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
