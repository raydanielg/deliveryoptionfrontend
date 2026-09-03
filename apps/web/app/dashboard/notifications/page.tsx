"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function NotificationsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterChannel, setFilterChannel] = useState("")

  useEffect(() => { loadData() }, [filterChannel])

  async function loadData() {
    try {
      const params = filterChannel ? `channel=${filterChannel}` : ""
      const [logsRes, statsRes] = await Promise.all([
        api.notificationService.logs(params),
        api.notificationService.stats(),
      ])
      setLogs(logsRes.data || [])
      setStats(statsRes.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load notifications")
    } finally {
      setLoading(false)
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notification Logs</h1>
        <p className="text-sm text-muted-foreground">SMS, Push, Email delivery tracking</p>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Sent</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          {stats.byChannel?.map((ch: any) => (
            <Card key={ch.channel}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{ch.channel}</p><p className="text-2xl font-bold">{ch._count.channel}</p></CardContent></Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
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
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
