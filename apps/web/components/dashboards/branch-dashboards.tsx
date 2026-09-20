"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Package02Icon, TruckIcon, AlertCircleIcon, CheckmarkCircle02Icon, Clock01Icon, Location01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@workspace/ui/components/badge"

import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { formatNumber, formatRelative } from "@/lib/format"
import { MetricCard } from "@/components/shared/metric-card"
import { ActionLink, Alert, EmptyNote, FeedError, ListSkeleton, Panel, PanelLink, RoleHeader, Row, useDashboardFeed } from "@/components/dashboards/kit"

// Both feeds are assembled from endpoints that already narrow the data to the person's branch /
// their own tasks on the server, so nothing here can show another branch's work.
interface Feed {
  stats: { total: number; active: number; delivered: number; cancelled: number; inTransit: number }
  shipments: any[]
  tasks: any[]
  emergencies: any[]
}

async function loadFeed(): Promise<{ data: Feed }> {
  const [stats, shipments, tasks, emergencies] = await Promise.all([
    api.shipments.stats(),
    api.shipments.list("limit=6"),
    api.branches.tasks(),
    api.emergencies.list(),
  ])
  return { data: { stats: stats.data, shipments: shipments.data || [], tasks: tasks.data || [], emergencies: emergencies.data || [] } }
}

const KIND_LABEL: Record<string, string> = { CLEARING: "Clearing", FORWARDING: "Forwarding", RECEIVING: "Receiving" }
const TASK_TONE: Record<string, string> = { PENDING: "secondary", IN_PROGRESS: "default", DONE: "outline", CANCELLED: "outline" }

function TaskRows({ tasks, empty }: { tasks: any[]; empty: string }) {
  if (tasks.length === 0) return <EmptyNote title={empty} />
  return (
    <div className="divide-y divide-border/60">
      {tasks.slice(0, 6).map((t) => (
        <Row
          key={t.id}
          href="/dashboard/branch-work"
          title={`${KIND_LABEL[t.kind] ?? t.kind} · ${t.shipment?.trackingNumber ?? ""}`}
          subtitle={`${t.shipment?.fromAddress?.city ?? "—"} → ${t.shipment?.toAddress?.city ?? "—"}${t.assignedTo ? ` · ${t.assignedTo.name}` : ""}`}
          right={<Badge variant={(TASK_TONE[t.status] as any) ?? "secondary"}>{t.status.replace("_", " ").toLowerCase()}</Badge>}
          rightSub={formatRelative(t.createdAt)}
        />
      ))}
    </div>
  )
}

function EmergencyAlerts({ emergencies }: { emergencies: any[] }) {
  const open = emergencies.filter((e) => e.status !== "RESOLVED")
  if (open.length === 0) return null
  const critical = open.filter((e) => e.severity === "CRITICAL" || e.severity === "HIGH").length
  return (
    <Alert
      tone="red"
      title={`${open.length} open emergenc${open.length === 1 ? "y" : "ies"}${critical ? ` · ${critical} high priority` : ""}`}
      description={open[0].description}
      href="/dashboard/branch-work?tab=emergencies"
      cta="Open"
    />
  )
}

export function BranchManagerDashboard() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useDashboardFeed<Feed>(loadFeed)
  const pending = (data?.tasks ?? []).filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS")
  const branchName = data?.tasks?.[0]?.branch?.name

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title={`Branch Desk — ${user?.name?.split(" ")[0] || "there"}`}
        description={branchName ? `${branchName}: your shipments, agents and emergencies.` : "Your branch's shipments, agents and emergencies."}
        onRefresh={reload}
        actions={
          <>
            <ActionLink href="/dashboard/shipments" icon={TruckIcon} label="Shipments" />
            <ActionLink href="/dashboard/branch-work" icon={Package02Icon} label="Assign a task" variant="default" />
          </>
        }
      />
      {error && <FeedError message={error} onRetry={reload} />}
      <EmergencyAlerts emergencies={data?.emergencies ?? []} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Branch shipments" value={formatNumber(data?.stats.total)} icon={Package02Icon} loading={loading} hint="Starting or ending at your branch" />
        <MetricCard label="In progress" value={formatNumber(data?.stats.active)} icon={TruckIcon} loading={loading} hint={data ? `${data.stats.inTransit} on the road` : undefined} />
        <MetricCard label="Delivered" value={formatNumber(data?.stats.delivered)} icon={CheckmarkCircle02Icon} loading={loading} />
        <MetricCard label="Agent tasks open" value={formatNumber(pending.length)} icon={Clock01Icon} loading={loading} hint="Pending or in progress" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Latest shipments" description="Newest first" action={<PanelLink href="/dashboard/shipments">All</PanelLink>} padded={false}>
          {loading && !data ? <ListSkeleton /> : (data?.shipments.length ?? 0) === 0 ? (
            <EmptyNote title="No shipments for this branch yet" subtitle="Bookings that start or end in your city appear here." />
          ) : (
            <div className="divide-y divide-border/60">
              {data!.shipments.map((s) => (
                <Row key={s.id} href={`/dashboard/shipments/${s.id}`} title={s.trackingNumber}
                  subtitle={`${s.fromAddress?.city ?? "—"} → ${s.toAddress?.city ?? "—"}`}
                  right={<Badge variant="secondary">{String(s.status).replaceAll("_", " ").toLowerCase()}</Badge>} rightSub={formatRelative(s.createdAt)} />
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Agent tasks" description="Clearing, forwarding and receiving work" action={<PanelLink href="/dashboard/branch-work">Manage</PanelLink>} padded={false}>
          {loading && !data ? <ListSkeleton /> : <TaskRows tasks={data?.tasks ?? []} empty="No tasks assigned yet" />}
        </Panel>
      </div>
    </div>
  )
}

export function AgentDashboard() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useDashboardFeed<Feed>(loadFeed)
  const mine = data?.tasks ?? []
  const open = mine.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS")
  const done = mine.filter((t) => t.status === "DONE").length

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title={`My Work — ${user?.name?.split(" ")[0] || "there"}`}
        description={`${user?.agentKind ? KIND_LABEL[user.agentKind] ?? user.agentKind : "Agent"} tasks assigned to you.`}
        onRefresh={reload}
        actions={<ActionLink href="/dashboard/branch-work?tab=emergencies" icon={AlertCircleIcon} label="Report emergency" variant="outline" />}
      />
      {error && <FeedError message={error} onRetry={reload} />}
      <EmergencyAlerts emergencies={data?.emergencies ?? []} />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="To do" value={formatNumber(open.length)} icon={Clock01Icon} loading={loading} hint="Pending or in progress" />
        <MetricCard label="Completed" value={formatNumber(done)} icon={CheckmarkCircle02Icon} loading={loading} />
        <MetricCard label="My shipments" value={formatNumber(data?.stats.total)} icon={Location01Icon} loading={loading} hint="Ones you hold a task on" />
      </div>

      <Panel title="My tasks" description="Open each to add notes and mark it done" action={<PanelLink href="/dashboard/branch-work">Open</PanelLink>} padded={false}>
        {loading && !data ? <ListSkeleton /> : <TaskRows tasks={open} empty="Nothing waiting for you" />}
      </Panel>
    </div>
  )
}
