"use client"

import * as React from "react"
import {
  TruckIcon, Radar01Icon, UserGroupIcon, PlugSocketIcon, Message01Icon, Settings02Icon, VanIcon,
  Package02Icon, CheckmarkCircle02Icon, AlertCircleIcon, Route02Icon, Shield01Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@workspace/ui/components/badge"

import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { formatNumber, formatRelative } from "@/lib/format"
import { ROLE_LABELS, ROLE_BADGE_COLORS, ALL_ROLES, type Role } from "@/lib/role-nav"
import { MetricCard } from "@/components/shared/metric-card"
import {
  ActionLink, Alert, Bar, EmptyNote, FeedError, HealthTile, ListSkeleton, Panel, PanelLink, RoleHeader, Row, useDashboardFeed,
} from "@/components/dashboards/kit"

interface OperationsFeed {
  queue: { awaitingAssignment: number; activeTrips: number; exceptionsOpen: number }
  shipments: { createdToday: number; deliveredToday: number; inTransit: number }
  drivers: { total: number; online: number; available: number; busy: number }
  system: {
    api: { ok: boolean; uptimeSec: number }
    database: { ok: boolean; latencyMs: number }
    webhooks: { failed24h: number; retrying: number }
    whatsapp: { connected: number; total: number }
    paymentGateways: { active: number; total: number }
    partners: { active: number }
  }
  users: { active: number; inactive: number; byRole: Record<string, number> }
  audit: Array<{ id: string; action: string; entity: string; createdAt: string; user: string; role: string | null }>
}

function formatUptime(sec: number) {
  if (sec < 90) return `${sec}s`
  if (sec < 5400) return `${Math.round(sec / 60)} min`
  if (sec < 172800) return `${Math.round(sec / 3600)} h`
  return `${Math.round(sec / 86400)} d`
}

function prettyAction(action: string) {
  return action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}

export function OperationsDashboard() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useDashboardFeed<OperationsFeed>(api.dashboard.operations)
  const firstName = user?.name?.split(" ")[0] || "there"
  const sys = data?.system

  const driverMax = data?.drivers.total ?? 0

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title={`Operations & System — ${firstName}`}
        description="Run the network, keep the platform healthy, and manage who has access."
        onRefresh={reload}
        actions={
          <>
            <ActionLink href="/dashboard/dispatch" icon={TruckIcon} label="Dispatch" />
            <ActionLink href="/dashboard/users" icon={UserGroupIcon} label="Users" />
            <ActionLink href="/dashboard/control-tower" icon={Radar01Icon} label="Control tower" variant="default" />
          </>
        }
      />

      {error && <FeedError message={error} onRetry={reload} />}

      {data && (data.queue.awaitingAssignment > 0 || data.queue.exceptionsOpen > 0 || data.system.webhooks.failed24h > 0) && (
        <div className="grid gap-3 md:grid-cols-3">
          {data.queue.awaitingAssignment > 0 && (
            <Alert tone="amber" title={`${data.queue.awaitingAssignment} shipment${data.queue.awaitingAssignment === 1 ? "" : "s"} need a driver`} description="Paid road shipments with no driver assigned yet." href="/dashboard/dispatch" cta="Dispatch now" />
          )}
          {data.queue.exceptionsOpen > 0 && (
            <Alert tone="red" title={`${data.queue.exceptionsOpen} open exception${data.queue.exceptionsOpen === 1 ? "" : "s"}`} description="Delivery problems waiting for an owner." href="/dashboard/exceptions" cta="Resolve" />
          )}
          {data.system.webhooks.failed24h > 0 && (
            <Alert tone="sky" title={`${data.system.webhooks.failed24h} failed webhook${data.system.webhooks.failed24h === 1 ? "" : "s"} (24h)`} description="Partner systems did not receive an update." href="/dashboard/integrations" cta="Inspect" />
          )}
        </div>
      )}

      {/* Live system health — every value below is measured, not assumed */}
      <Panel title="System health" description="Measured from the running platform">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <HealthTile label="API" status={sys ? (sys.api.ok ? "ok" : "bad") : "idle"} value={sys ? "Online" : "…"} detail={sys ? `Up ${formatUptime(sys.api.uptimeSec)}` : undefined} />
          <HealthTile label="Database" status={!sys ? "idle" : sys.database.latencyMs < 200 ? "ok" : sys.database.latencyMs < 1000 ? "warn" : "bad"} value={sys ? `${sys.database.latencyMs} ms` : "…"} detail="Round-trip time" />
          <HealthTile label="Webhooks" status={!sys ? "idle" : sys.webhooks.failed24h === 0 ? "ok" : sys.webhooks.failed24h < 10 ? "warn" : "bad"} value={sys ? `${sys.webhooks.failed24h} failed` : "…"} detail={sys ? `${sys.webhooks.retrying} retrying · last 24h` : undefined} />
          <HealthTile label="WhatsApp" status={!sys ? "idle" : sys.whatsapp.total === 0 ? "idle" : sys.whatsapp.connected === sys.whatsapp.total ? "ok" : sys.whatsapp.connected === 0 ? "bad" : "warn"} value={sys ? (sys.whatsapp.total === 0 ? "Not set up" : `${sys.whatsapp.connected}/${sys.whatsapp.total} linked`) : "…"} detail="Connected sessions" />
          <HealthTile label="Payment gateways" status={!sys ? "idle" : sys.paymentGateways.active === 0 ? "bad" : "ok"} value={sys ? `${sys.paymentGateways.active}/${sys.paymentGateways.total} active` : "…"} detail={sys && sys.paymentGateways.active === 0 ? "Online payments unavailable" : "Accepting payments"} />
          <HealthTile label="Partners" status={!sys ? "idle" : sys.partners.active === 0 ? "idle" : "ok"} value={sys ? `${sys.partners.active} active` : "…"} detail="API integrations" />
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Awaiting a driver" value={formatNumber(data?.queue.awaitingAssignment)} icon={Package02Icon} loading={loading} positiveIsGood={false} hint="Road, paid, unassigned" />
        <MetricCard label="Active trips" value={formatNumber(data?.queue.activeTrips)} icon={Route02Icon} loading={loading} hint="Accepted through delivered" />
        <MetricCard label="Drivers online" value={`${formatNumber(data?.drivers.online)} / ${formatNumber(data?.drivers.total)}`} icon={VanIcon} loading={loading} hint={data ? `${data.drivers.available} free to take work` : undefined} />
        <MetricCard label="Delivered today" value={formatNumber(data?.shipments.deliveredToday)} icon={CheckmarkCircle02Icon} loading={loading} hint={data ? `${data.shipments.createdToday} created · ${data.shipments.inTransit} moving` : undefined} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_3fr]">
        <Panel title="Driver capacity" description="Active drivers right now">
          {loading || !data ? (
            <ListSkeleton rows={3} />
          ) : data.drivers.total === 0 ? (
            <EmptyNote title="No active drivers" subtitle="Approve drivers to start dispatching." />
          ) : (
            <div className="space-y-4">
              <Bar label="Online" value={data.drivers.online} max={driverMax} display={`${data.drivers.online} of ${data.drivers.total}`} tone="emerald" />
              <Bar label="Free to take work" value={data.drivers.available} max={driverMax} display={data.drivers.available} tone="sky" />
              <Bar label="Busy on a job" value={data.drivers.busy} max={driverMax} display={data.drivers.busy} tone="amber" />
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <ActionLink href="/dashboard/drivers" icon={VanIcon} label="Drivers" />
            <ActionLink href="/dashboard/tracking/drivers" icon={Radar01Icon} label="Live locations" />
          </div>
        </Panel>

        <Panel
          title="Recent activity"
          description="Latest actions recorded in the audit trail"
          padded={false}
          action={<PanelLink href="/dashboard/reports">Reports</PanelLink>}
        >
          {loading ? (
            <ListSkeleton rows={5} />
          ) : !data || data.audit.length === 0 ? (
            <EmptyNote title="No activity recorded yet" />
          ) : (
            <ul className="divide-y divide-border/60">
              {data.audit.map((a) => (
                <li key={a.id}>
                  <Row
                    title={prettyAction(a.action)}
                    subtitle={`${a.user}${a.role ? ` · ${ROLE_LABELS[a.role as Role] ?? a.role}` : ""}`}
                    right={a.entity}
                    rightSub={formatRelative(a.createdAt)}
                  />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title="Who has access"
        description={data ? `${formatNumber(data.users.active)} active · ${formatNumber(data.users.inactive)} deactivated` : "Users by role"}
        action={<PanelLink href="/dashboard/roles">Roles & permissions</PanelLink>}
      >
        {loading || !data ? (
          <ListSkeleton rows={2} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {ALL_ROLES.map((r) => (
              <div key={r} className="rounded-lg border p-3">
                <Badge className={ROLE_BADGE_COLORS[r]}>{ROLE_LABELS[r]}</Badge>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{formatNumber(data.users.byRole[r] ?? 0)}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="flex flex-wrap items-center gap-2">
        <ActionLink href="/dashboard/integrations" icon={PlugSocketIcon} label="Integrations" />
        <ActionLink href="/dashboard/whatsapp" icon={Message01Icon} label="WhatsApp engine" />
        <ActionLink href="/dashboard/exceptions" icon={AlertCircleIcon} label="Exceptions" />
        <ActionLink href="/dashboard/roles" icon={Shield01Icon} label="Roles" />
        <ActionLink href="/dashboard/settings" icon={Settings02Icon} label="Settings" />
      </div>
    </div>
  )
}
