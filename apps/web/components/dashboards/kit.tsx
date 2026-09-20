"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { AlertCircleIcon, ArrowRight01Icon, RefreshCcwIcon } from "@hugeicons/core-free-icons"

import { Card } from "@workspace/ui/components/card"
import { buttonVariants, Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

/* ---------- data feed: fetch, poll every 60s, allow manual refresh ---------- */
// `fetcher` must be a stable function reference (e.g. `api.dashboard.finance`), not an inline arrow.
export function useDashboardFeed<T>(fetcher: () => Promise<{ data: T }>, intervalMs = 60_000) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [tick, setTick] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const res = await fetcher()
        if (!cancelled) {
          setData(res.data)
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Could not load dashboard data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    const id = setInterval(run, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [fetcher, intervalMs, tick])

  const reload = React.useCallback(() => {
    setLoading(true)
    setTick((t) => t + 1)
  }, [])

  return { data, loading, error, reload }
}

/* ---------- layout pieces ---------- */
export function RoleHeader({
  title, description, actions, onRefresh,
}: {
  title: string
  description: string
  actions?: React.ReactNode
  onRefresh?: () => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} aria-label="Refresh">
            <HugeiconsIcon icon={RefreshCcwIcon} className="size-4" />
          </Button>
        )}
        {actions}
      </div>
    </div>
  )
}

export function ActionLink({
  href, icon, label, variant = "outline",
}: { href: string; icon: IconSvgElement; label: string; variant?: "default" | "outline" | "ghost" }) {
  return (
    <Link href={href} className={buttonVariants({ variant, size: "sm" })}>
      <HugeiconsIcon icon={icon} className="size-4" />
      {label}
    </Link>
  )
}

export function Panel({
  title, description, action, children, className, padded = true,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <Card className={cn("gap-0 overflow-hidden p-0", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className={padded ? "p-5" : ""}>{children}</div>
    </Card>
  )
}

export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "shrink-0")}>
      {children}
      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
    </Link>
  )
}

export function Row({
  href, title, subtitle, right, rightSub,
}: { href?: string; title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode; rightSub?: React.ReactNode }) {
  const inner = (
    <div className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/40">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {(right || rightSub) && (
        <div className="text-right">
          {right && <p className="text-sm font-medium tabular-nums">{right}</p>}
          {rightSub && <p className="text-xs text-muted-foreground">{rightSub}</p>}
        </div>
      )}
    </div>
  )
  return href ? <Link href={href} className="block">{inner}</Link> : inner
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border/60">
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-none" />)}
    </div>
  )
}

export function EmptyNote({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground/70">{subtitle}</p>}
    </div>
  )
}

/* A labelled horizontal bar — value as a share of `max`. */
export function Bar({
  label, value, max, display, tone = "primary",
}: { label: string; value: number; max: number; display: React.ReactNode; tone?: "primary" | "emerald" | "amber" | "red" | "sky" }) {
  const pct = max > 0 ? Math.max(2, Math.min(100, (value / max) * 100)) : 0
  const color = {
    primary: "bg-primary", emerald: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500", sky: "bg-sky-500",
  }[tone]
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{display}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: value > 0 ? `${pct}%` : "0%" }} />
      </div>
    </div>
  )
}

export function Alert({
  tone, title, description, href, cta = "Review",
}: { tone: "red" | "amber" | "sky"; title: string; description: string; href: string; cta?: string }) {
  const style = {
    red: "border-red-500/30 bg-red-500/5", amber: "border-amber-500/30 bg-amber-500/5", sky: "border-sky-500/30 bg-sky-500/5",
  }[tone]
  const iconColor = {
    red: "text-red-600 dark:text-red-400", amber: "text-amber-600 dark:text-amber-400", sky: "text-sky-600 dark:text-sky-400",
  }[tone]
  return (
    <Card className={cn("flex-row items-start gap-3 p-4", style)}>
      <HugeiconsIcon icon={AlertCircleIcon} className={cn("mt-0.5 size-5 shrink-0", iconColor)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        <Link href={href} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-2 h-7 px-2 text-xs")}>
          {cta}
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
        </Link>
      </div>
    </Card>
  )
}

export function FeedError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="flex-row items-center gap-3 border-red-500/30 bg-red-500/5 p-4">
      <HugeiconsIcon icon={AlertCircleIcon} className="size-5 shrink-0 text-red-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Dashboard data unavailable</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
    </Card>
  )
}

/* One service in the "system health" strip. */
export function HealthTile({
  label, value, detail, status,
}: { label: string; value: React.ReactNode; detail?: string; status: "ok" | "warn" | "bad" | "idle" }) {
  const dot = { ok: "bg-emerald-500", warn: "bg-amber-500", bad: "bg-red-500", idle: "bg-muted-foreground/40" }[status]
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", dot, status === "ok" && "animate-pulse")} />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="mt-1.5 text-lg font-semibold tabular-nums">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}
    </div>
  )
}
