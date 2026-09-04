"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { toast } from "sonner"

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

export default function NotificationsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "OPERATIONS_MANAGER"
  const [logs, setLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterChannel, setFilterChannel] = useState("")

  useEffect(() => { loadData() }, [filterChannel])

  async function loadData() {
    try {
      if (isAdmin) {
        const params = filterChannel ? `channel=${filterChannel}` : ""
        const [logsRes, statsRes] = await Promise.all([
          api.notificationService.logs(params),
          api.notificationService.stats(),
        ])
        setLogs(logsRes.data || [])
        setStats(statsRes.data)
      } else {
        const res = await api.notifications.list()
        setLogs(res.data || [])
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.notifications.markAllRead()
      setLogs((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success("All notifications marked as read")
    } catch (err: any) {
      toast.error(err.message || "Failed to mark notifications")
    }
  }

  const channelColors: Record<string, any> = {
    SMS: "default",
    EMAIL: "secondary",
    PUSH: "outline",
    WHATSAPP: "default",
    IN_APP: "secondary",
  }

  const statusColors: Record<string, any> = {
    SENT: "default",
    PENDING: "secondary",
    FAILED: "destructive",
    DELIVERED: "default",
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAdmin ? "Notification Logs" : "My Notifications"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "SMS, Push, Email delivery tracking" : "Your personal notifications"}
          </p>
        </div>
        {!isAdmin && logs.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {isAdmin && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Sent</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          {stats.byChannel?.map((ch: any) => (
            <Card key={ch.channel}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{ch.channel}</p><p className="text-2xl font-bold">{ch._count.channel}</p></CardContent></Card>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Channel:</label>
          <select className="rounded-md border border-input bg-background px-3 py-1 text-sm" value={filterChannel} onChange={e => setFilterChannel(e.target.value)}>
            <option value="">All</option>
            <option value="SMS">SMS</option>
            <option value="EMAIL">Email</option>
            <option value="PUSH">Push</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="IN_APP">In-App</option>
          </select>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isAdmin ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Recipient</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Channel</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Provider</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Error</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b last:border-0">
                        {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>)}
                      </tr>
                    ))
                  ) : logs.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No notification logs found</td></tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{log.recipient}</td>
                        <td className="px-4 py-3"><Badge variant={channelColors[log.channel] || "secondary"}>{log.channel}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground">{log.provider || "—"}</td>
                        <td className="px-4 py-3"><Badge variant={statusColors[log.status] || "secondary"}>{log.status}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate text-red-500">{log.errorMessage || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{log.sentAt ? new Date(log.sentAt).toLocaleString() : "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="divide-y border-border/40">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 px-4 py-4">
                    <Skeleton className="size-2 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-64" />
                      <Skeleton className="h-2.5 w-16" />
                    </div>
                  </div>
                ))
              ) : logs.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No notifications</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">You&apos;ll see updates about your shipments here</p>
                </div>
              ) : (
                logs.map((n) => (
                  <div key={n.id} className={`flex gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 ${n.isRead ? "opacity-60" : ""}`}>
                    <div className={`mt-1.5 flex size-2 shrink-0 rounded-full ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground/70 shrink-0">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                      {!n.isRead && (
                        <button
                          onClick={async () => {
                            try {
                              await api.notifications.markRead(n.id)
                              setLogs((prev) => prev.map((item) => item.id === n.id ? { ...item, isRead: true } : item))
                            } catch {}
                          }}
                          className="mt-1 text-[10px] font-medium text-primary hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
