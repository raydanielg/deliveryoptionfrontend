"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { FilterSelect, NOTIFICATION_CHANNEL_OPTIONS, NOTIFICATION_STATUS_OPTIONS } from "@/components/shared/filter-select"
import { DataTable, type Column, useTableState } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/states"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Refresh01Icon,
  CheckmarkCircle02Icon,
  Notification03Icon,
  Cancel01Icon,
  Clock01Icon,
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

interface NotifLog {
  id: string
  recipient: string
  channel: string
  provider?: string
  status: string
  errorMessage?: string
  sentAt?: string
}

interface NotifStats {
  total: number
  byStatus?: { status: string; _count: { status: number } }[]
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER"
  const [logs, setLogs] = React.useState<NotifLog[]>([])
  const [stats, setStats] = React.useState<NotifStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<{ status?: number; detail?: string } | null>(null)
  const [userNotifs, setUserNotifs] = React.useState<any[]>([])
  const [userLoading, setUserLoading] = React.useState(true)

  const { page, setPage, search, setSearch, debounced, filters, setFilter } = useTableState({
    channel: "",
    status: "",
  })

  const limit = 25

  const loadData = React.useCallback(async () => {
    if (!isAdmin) {
      try {
        const res = await api.notifications.list()
        setUserNotifs(res.data || [])
      } catch {
      } finally {
        setUserLoading(false)
      }
      return
    }

    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.channel) params.set("channel", filters.channel)
      if (filters.status) params.set("status", filters.status)
      params.set("page", String(page))
      params.set("limit", String(limit))

      const [logsRes, statsRes] = await Promise.all([
        api.notificationService.logs(params.toString()),
        api.notificationService.stats(),
      ])
      setLogs(logsRes.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      setError({ detail: err.message || "Failed to load notification logs" })
      toast.error(err.message || "Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }, [isAdmin, filters.channel, filters.status, page])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  async function handleMarkAllRead() {
    try {
      await api.notifications.markAllRead()
      setUserNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success("All notifications marked as read")
    } catch (err: any) {
      toast.error(err.message || "Failed to mark notifications")
    }
  }

  const filteredLogs = React.useMemo(() => {
    if (!debounced) return logs
    const q = debounced.toLowerCase()
    return logs.filter(
      (log) =>
        log.recipient?.toLowerCase().includes(q) ||
        log.provider?.toLowerCase().includes(q) ||
        log.errorMessage?.toLowerCase().includes(q),
    )
  }, [logs, debounced])

  const total = filteredLogs.length

  const columns: Column<NotifLog>[] = [
    {
      id: "recipient",
      header: "Recipient",
      cell: (row) => <span className="font-medium">{row.recipient}</span>,
    },
    {
      id: "channel",
      header: "Channel",
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
          {row.channel}
        </span>
      ),
    },
    {
      id: "provider",
      header: "Provider",
      secondary: true,
      cell: (row) => <span className="text-muted-foreground">{row.provider || "—"}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      id: "error",
      header: "Error",
      secondary: true,
      cell: (row) => (
        <span className="max-w-xs truncate text-muted-foreground">
          {row.errorMessage || "—"}
        </span>
      ),
    },
    {
      id: "sentAt",
      header: "Sent",
      align: "right",
      cell: (row) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.sentAt)}
        </span>
      ),
    },
  ]

  const sentCount = stats?.byStatus?.find((s) => s.status === "SENT")?._count.status ?? 0
  const failedCount = stats?.byStatus?.find((s) => s.status === "FAILED")?._count.status ?? 0
  const pendingCount = stats?.byStatus?.find((s) => s.status === "PENDING")?._count.status ?? 0

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title={isAdmin ? "Notification Logs" : "My Notifications"}
          description={isAdmin ? "SMS, Email, and Push delivery tracking" : "Your personal notifications"}
          actions={
            <>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => loadData()}>
                  <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
                  Refresh
                </Button>
              )}
              {!isAdmin && userNotifs.some((n) => !n.isRead) && (
                <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                  Mark all as read
                </Button>
              )}
            </>
          }
        />

        {isAdmin && stats && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total Sent"
              value={stats.total?.toLocaleString() ?? "0"}
              icon={Notification03Icon}
              loading={loading}
            />
            <MetricCard
              label="Delivered"
              value={sentCount.toLocaleString()}
              icon={CheckmarkCircle02Icon}
              loading={loading}
              hint="Successfully delivered"
            />
            <MetricCard
              label="Failed"
              value={failedCount.toLocaleString()}
              icon={Cancel01Icon}
              loading={loading}
              positiveIsGood={false}
              hint="Delivery failures"
            />
            <MetricCard
              label="Pending"
              value={pendingCount.toLocaleString()}
              icon={Clock01Icon}
              loading={loading}
              hint="Awaiting confirmation"
            />
          </div>
        )}

        {isAdmin ? (
          <Card className="p-5">
            <DataTable
              columns={columns}
              data={filteredLogs}
              loading={loading}
              error={error}
              onRetry={loadData}
              page={page}
              onPageChange={setPage}
              pageSize={limit}
              total={total}
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search recipient, provider, or error…"
              rowKey={(row) => row.id}
              emptyTitle="No notification logs found"
              emptyDescription="Try clearing filters or widening your date range."
              filters={
                <>
                  <FilterSelect
                    label="Channel"
                    value={filters.channel ?? ""}
                    onChange={(v) => setFilter("channel", v)}
                    options={NOTIFICATION_CHANNEL_OPTIONS}
                  />
                  <FilterSelect
                    label="Status"
                    value={filters.status ?? ""}
                    onChange={(v) => setFilter("status", v)}
                    options={NOTIFICATION_STATUS_OPTIONS}
                  />
                </>
              }
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
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
              <EmptyState
                title="No notifications"
                description="You'll see updates about your shipments here."
                className="border-0"
              />
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
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
