"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  CoinsIcon, ReceiptIcon, File02Icon, Clock01Icon, Cancel01Icon, CheckmarkCircle02Icon,
  Invoice01Icon, Shield01Icon, DashboardSpeed01Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@workspace/ui/components/chart"

import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { formatMoney, formatNumber, formatRelative } from "@/lib/format"
import { MetricCard } from "@/components/shared/metric-card"
import {
  ActionLink, Alert, Bar, EmptyNote, FeedError, ListSkeleton, Panel, PanelLink, RoleHeader, Row, useDashboardFeed,
} from "@/components/dashboards/kit"

interface FinanceFeed {
  revenue: { total: number; today: number; last7d: number; last30d: number; trendPct: number | null }
  outstanding: { amount: number; orders: number }
  refunds: { amount: number; count: number }
  transactions30d: { count: number; byMethod: Array<{ method: string; amount: number; count: number }> }
  approvals: {
    pending: number
    pendingAmount: number
    oldest: Array<{ id: string; trackingNumber?: string; amount: number; requestedBy?: string; createdAt: string }>
  }
  invoices: { unpaidCount: number; unpaidTotal: number; overdueCount: number; overdueTotal: number; paidLast30d: number }
  revenueByMode: Array<{ mode: string; amount: number; shipments: number }>
  series: Array<{ date: string; amount: number }>
  recentPayments: Array<{
    id: string; reference: string; amount: number; currency: string; method: string
    paidAt: string; orderNumber?: string; payer?: string
  }>
}

const MODE_LABEL: Record<string, string> = { ROAD: "Road", RAIL: "Rail (SGR)", AIR: "Air cargo", SEA: "Sea freight", COURIER: "Courier" }
const METHOD_LABEL: Record<string, string> = {
  MOBILE_MONEY: "Mobile money", CARD: "Card", BANK_TRANSFER: "Bank transfer", CASH: "Cash",
  CREDIT: "Credit account", WALLET: "Wallet", MANUAL: "Manual entry",
}

const chartConfig = { amount: { label: "Revenue", color: "var(--chart-2)" } } satisfies ChartConfig

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function RevenueChart({ series, loading }: { series?: FinanceFeed["series"]; loading: boolean }) {
  const points = (series ?? []).map((p) => ({
    ...p,
    label: new Date(p.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
  }))
  const hasRevenue = points.some((p) => p.amount > 0)

  return (
    <Panel title="Revenue — last 14 days" description="Confirmed payments by day (East Africa time)">
      {loading ? (
        <Skeleton className="h-[240px] w-full" />
      ) : !hasRevenue ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
          No confirmed payments in the last 14 days.
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <AreaChart data={points} margin={{ left: 4, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="xe-revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-amount)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-amount)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} width={52} tickMargin={8} className="text-xs" tickFormatter={(v: number) => compact(v)} />
            <ChartTooltip
              cursor={{ strokeDasharray: "4 4" }}
              content={<ChartTooltipContent indicator="line" formatter={(v) => formatMoney(Number(v))} />}
            />
            <Area dataKey="amount" type="monotone" stroke="var(--color-amount)" strokeWidth={2} fill="url(#xe-revenue-fill)" activeDot={{ r: 4, strokeWidth: 2 }} />
          </AreaChart>
        </ChartContainer>
      )}
    </Panel>
  )
}

export function FinanceDashboard() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useDashboardFeed<FinanceFeed>(api.dashboard.finance)
  const firstName = user?.name?.split(" ")[0] || "there"

  const modeMax = Math.max(0, ...(data?.revenueByMode ?? []).map((m) => m.amount))
  const methodMax = Math.max(0, ...(data?.transactions30d.byMethod ?? []).map((m) => m.amount))

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title={`Finance Center — ${firstName}`}
        description="Money in, money owed, and everything waiting on your approval."
        onRefresh={reload}
        actions={
          <>
            <ActionLink href="/dashboard/payments/transactions" icon={File02Icon} label="Transactions" />
            <ActionLink href="/dashboard/invoicing" icon={Invoice01Icon} label="Invoicing" />
            <ActionLink href="/dashboard/payment-approvals" icon={Shield01Icon} label="Approve payments" variant="default" />
          </>
        }
      />

      {error && <FeedError message={error} onRetry={reload} />}

      {/* What needs a decision right now */}
      {data && (data.approvals.pending > 0 || data.invoices.overdueCount > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {data.approvals.pending > 0 && (
            <Alert
              tone="amber"
              title={`${data.approvals.pending} payment approval${data.approvals.pending === 1 ? "" : "s"} waiting`}
              description={`${formatMoney(data.approvals.pendingAmount, "TZS", { compact: true })} in storage/delivery charges is blocking cargo release.`}
              href="/dashboard/payment-approvals"
              cta="Approve or hold"
            />
          )}
          {data.invoices.overdueCount > 0 && (
            <Alert
              tone="red"
              title={`${data.invoices.overdueCount} overdue invoice${data.invoices.overdueCount === 1 ? "" : "s"}`}
              description={`${formatMoney(data.invoices.overdueTotal, "TZS", { compact: true })} is past its due date.`}
              href="/dashboard/invoicing"
              cta="Chase payment"
            />
          )}
        </div>
      )}

      {/* Money in */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Revenue today" value={formatMoney(data?.revenue.today, "TZS", { compact: true })} icon={CoinsIcon} loading={loading} hint={data ? `${formatMoney(data.revenue.last7d, "TZS", { compact: true })} in 7 days` : undefined} />
        <MetricCard label="Revenue — 30 days" value={formatMoney(data?.revenue.last30d, "TZS", { compact: true })} icon={DashboardSpeed01Icon} loading={loading} delta={data?.revenue.trendPct ?? null} deltaLabel="vs previous 30 days" />
        <MetricCard label="Outstanding" value={formatMoney(data?.outstanding.amount, "TZS", { compact: true })} icon={Clock01Icon} loading={loading} hint={data ? `${formatNumber(data.outstanding.orders)} unpaid order${data.outstanding.orders === 1 ? "" : "s"}` : undefined} />
        <MetricCard label="Total collected" value={formatMoney(data?.revenue.total, "TZS", { compact: true })} icon={CheckmarkCircle02Icon} loading={loading} hint="All time, confirmed" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Transactions — 30 days" value={formatNumber(data?.transactions30d.count)} icon={ReceiptIcon} loading={loading} />
        <MetricCard label="Unpaid invoices" value={formatNumber(data?.invoices.unpaidCount)} icon={Invoice01Icon} loading={loading} hint={data ? formatMoney(data.invoices.unpaidTotal, "TZS", { compact: true }) : undefined} />
        <MetricCard label="Invoices paid — 30 days" value={formatMoney(data?.invoices.paidLast30d, "TZS", { compact: true })} icon={File02Icon} loading={loading} />
        <MetricCard label="Refunds" value={formatMoney(data?.refunds.amount, "TZS", { compact: true })} icon={Cancel01Icon} loading={loading} positiveIsGood={false} hint={data ? `${data.refunds.count} refunded payment${data.refunds.count === 1 ? "" : "s"}` : undefined} />
      </div>

      <RevenueChart series={data?.series} loading={loading} />

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Revenue by transport mode" description="Paid shipments, all time">
          {loading ? (
            <ListSkeleton rows={3} />
          ) : !data || data.revenueByMode.length === 0 ? (
            <EmptyNote title="No paid shipments yet" />
          ) : (
            <div className="space-y-4">
              {data.revenueByMode.map((m) => (
                <Bar key={m.mode} label={`${MODE_LABEL[m.mode] ?? m.mode} · ${m.shipments}`} value={m.amount} max={modeMax} display={formatMoney(m.amount, "TZS", { compact: true })} />
              ))}
            </div>
          )}
        </Panel>

        <Panel title="How customers pay" description="Confirmed payments, last 30 days">
          {loading ? (
            <ListSkeleton rows={3} />
          ) : !data || data.transactions30d.byMethod.length === 0 ? (
            <EmptyNote title="No payments in the last 30 days" />
          ) : (
            <div className="space-y-4">
              {data.transactions30d.byMethod.map((m) => (
                <Bar key={m.method} tone="emerald" label={`${METHOD_LABEL[m.method] ?? m.method} · ${m.count}`} value={m.amount} max={methodMax} display={formatMoney(m.amount, "TZS", { compact: true })} />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Approval queue"
          description="Oldest first — cargo is held until these are decided"
          padded={false}
          action={<PanelLink href="/dashboard/payment-approvals">Open</PanelLink>}
        >
          {loading ? (
            <ListSkeleton />
          ) : !data || data.approvals.oldest.length === 0 ? (
            <EmptyNote title="Nothing waiting" subtitle="Every payment approval has been decided." />
          ) : (
            <ul className="divide-y divide-border/60">
              {data.approvals.oldest.map((a) => (
                <li key={a.id}>
                  <Row
                    href="/dashboard/payment-approvals"
                    title={a.trackingNumber || "Shipment"}
                    subtitle={`Requested by ${a.requestedBy || "—"} · ${formatRelative(a.createdAt)}`}
                    right={formatMoney(a.amount, "TZS", { compact: true })}
                    rightSub={<Badge variant="secondary">Pending</Badge>}
                  />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Latest payments"
          description="Most recent confirmed transactions"
          padded={false}
          action={<PanelLink href="/dashboard/payments/transactions">All</PanelLink>}
        >
          {loading ? (
            <ListSkeleton />
          ) : !data || data.recentPayments.length === 0 ? (
            <EmptyNote title="No payments yet" />
          ) : (
            <ul className="divide-y divide-border/60">
              {data.recentPayments.map((p) => (
                <li key={p.id}>
                  <Row
                    title={p.payer || p.reference}
                    subtitle={`${p.orderNumber ? `${p.orderNumber} · ` : ""}${METHOD_LABEL[p.method] ?? p.method}`}
                    right={formatMoney(p.amount, p.currency, { compact: true })}
                    rightSub={formatRelative(p.paidAt)}
                  />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
