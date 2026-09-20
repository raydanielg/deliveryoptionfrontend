"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  WarehouseIcon, PackageReceiveIcon, Package02Icon, TruckIcon, Clock01Icon, CheckmarkCircle02Icon,
  Location01Icon, Airplane01Icon, DeliverySent01Icon, Cancel01Icon, ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

import { api } from "@/lib/api"
import { useAuth } from "@/lib/use-auth"
import { formatMoney, formatNumber, formatRelative } from "@/lib/format"
import { MetricCard } from "@/components/shared/metric-card"
import {
  ActionLink, Alert, Bar, EmptyNote, FeedError, ListSkeleton, Panel, PanelLink, RoleHeader, Row, useDashboardFeed,
} from "@/components/dashboards/kit"

interface WarehouseFeed {
  stages: {
    receivedDubai: number; awaitingConsolidation: number; inTransitToTz: number; arrivedTanzania: number
    onShelf: number; readyToRelease: number; outForDelivery: number; onHold: number
  }
  boxes: { byStatus: Record<string, number>; packedToday: number }
  shelves: { locations: number; boxesShelved: number }
  manifests: {
    byStatus: Record<string, number>
    upcoming: Array<{ id: string; tripNo: string; airline: string; flightNumber: string; flightDate: string; route: string; status: string; boxes: number }>
  }
  release: { awaitingApproval: number; oldest: Array<{ id: string; trackingNumber?: string; amount: number; createdAt: string }> }
  deliveries: { assigned: number; outForDelivery: number; delivered: number; failed: number }
  exceptionsOpen: number
  stationInventory: { held: number; dispatchedToday: number }
}

// The cargo journey, left to right. Each stage links to the screen where that stage is worked.
const PIPELINE: Array<{ key: keyof WarehouseFeed["stages"]; label: string; hint: string; href: string }> = [
  { key: "receivedDubai", label: "Received in Dubai", hint: "Checked in", href: "/dashboard/dubai-receiving" },
  { key: "awaitingConsolidation", label: "To consolidate", hint: "Waiting for a box", href: "/dashboard/consolidation-boxes" },
  { key: "inTransitToTz", label: "In transit to TZ", hint: "Departed Dubai", href: "/dashboard/trip-manifests" },
  { key: "arrivedTanzania", label: "Arrived in TZ", hint: "To receive & sort", href: "/dashboard/warehouse/receiving" },
  { key: "onShelf", label: "On shelf", hint: "Stored", href: "/dashboard/shelf-map" },
  { key: "readyToRelease", label: "Ready to release", hint: "Cleared for handover", href: "/dashboard/delivery-register" },
  { key: "outForDelivery", label: "Out for delivery", hint: "With a driver", href: "/dashboard/deliveries" },
]

const BOX_LABEL: Record<string, string> = {
  PACKING: "Being packed", PACKED: "Packed, awaiting trip", HANDED_TO_PASSENGER: "With passenger", DEPARTED: "Departed",
  ARRIVED_TZ: "Arrived in TZ", SHELVED: "On shelf", BROKEN_DOWN: "Broken down", LOST: "Lost", DAMAGED: "Damaged",
}
const BOX_ORDER = ["PACKING", "PACKED", "HANDED_TO_PASSENGER", "DEPARTED", "ARRIVED_TZ", "SHELVED", "BROKEN_DOWN", "LOST", "DAMAGED"]

export function WarehouseDashboard() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useDashboardFeed<WarehouseFeed>(api.dashboard.warehouse)
  const firstName = user?.name?.split(" ")[0] || "there"

  const boxMax = Math.max(0, ...BOX_ORDER.map((k) => data?.boxes.byStatus[k] ?? 0))
  const totalBoxes = BOX_ORDER.reduce((s, k) => s + (data?.boxes.byStatus[k] ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <RoleHeader
        title={`Warehouse Control — ${firstName}`}
        description="Follow cargo from Dubai to the customer's hands."
        onRefresh={reload}
        actions={
          <>
            <ActionLink href="/dashboard/consolidation-boxes" icon={Package02Icon} label="Boxes" />
            <ActionLink href="/dashboard/shelf-map" icon={Location01Icon} label="Shelf map" />
            <ActionLink href="/dashboard/dubai-receiving" icon={PackageReceiveIcon} label="Receive cargo" variant="default" />
          </>
        }
      />

      {error && <FeedError message={error} onRetry={reload} />}

      {data && (data.release.awaitingApproval > 0 || data.exceptionsOpen > 0 || data.stages.onHold > 0) && (
        <div className="grid gap-3 md:grid-cols-3">
          {data.release.awaitingApproval > 0 && (
            <Alert
              tone="amber"
              title={`${data.release.awaitingApproval} shipment${data.release.awaitingApproval === 1 ? "" : "s"} held for payment`}
              description="Do not release these until Finance approves the charges."
              href="/dashboard/delivery-register"
              cta="See release queue"
            />
          )}
          {data.exceptionsOpen > 0 && (
            <Alert
              tone="red"
              title={`${data.exceptionsOpen} open exception${data.exceptionsOpen === 1 ? "" : "s"}`}
              description="Damaged, missing or mismatched cargo needs a decision."
              href="/dashboard/exceptions"
              cta="Resolve"
            />
          )}
          {data.stages.onHold > 0 && (
            <Alert
              tone="sky"
              title={`${data.stages.onHold} item${data.stages.onHold === 1 ? "" : "s"} on hold / old stock`}
              description="Cargo parked or unclaimed for a long time."
              href="/dashboard/shipments"
              cta="Review"
            />
          )}
        </div>
      )}

      {/* The cargo journey */}
      <Panel title="Cargo flow" description="Where every piece of cargo is right now — tap a stage to work it">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {PIPELINE.map((stage, i) => (
            <Link
              key={stage.key}
              href={stage.href}
              className="group relative flex flex-col rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Step {i + 1}</span>
              {loading ? (
                <Skeleton className="mt-1.5 h-8 w-12" />
              ) : (
                <span className={cn("mt-1 text-3xl font-semibold tabular-nums", data && data.stages[stage.key] === 0 && "text-muted-foreground/50")}>
                  {formatNumber(data?.stages[stage.key])}
                </span>
              )}
              <span className="mt-1 text-sm font-medium leading-tight">{stage.label}</span>
              <span className="text-xs text-muted-foreground">{stage.hint}</span>
              {i < PIPELINE.length - 1 && (
                <HugeiconsIcon icon={ArrowRight01Icon} className="absolute -right-2.5 top-1/2 hidden size-4 -translate-y-1/2 text-muted-foreground/40 xl:block" />
              )}
            </Link>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Boxes packed today" value={formatNumber(data?.boxes.packedToday)} icon={Package02Icon} loading={loading} hint={`${formatNumber(totalBoxes)} boxes tracked in total`} />
        <MetricCard label="Boxes on shelves" value={formatNumber(data?.shelves.boxesShelved)} icon={WarehouseIcon} loading={loading} hint={`${formatNumber(data?.shelves.locations)} active shelf locations`} />
        <MetricCard label="Held at stations" value={formatNumber(data?.stationInventory.held)} icon={Clock01Icon} loading={loading} hint={`${formatNumber(data?.stationInventory.dispatchedToday)} dispatched today`} />
        <MetricCard label="Awaiting release approval" value={formatNumber(data?.release.awaitingApproval)} icon={Cancel01Icon} loading={loading} positiveIsGood={false} hint="Blocked until Finance decides" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <Panel
          title="Upcoming flights"
          description="Trips still open for boxes"
          padded={false}
          action={<PanelLink href="/dashboard/trip-manifests">Manifests</PanelLink>}
        >
          {loading ? (
            <ListSkeleton />
          ) : !data || data.manifests.upcoming.length === 0 ? (
            <EmptyNote title="No upcoming trips" subtitle="Create a trip manifest to assign packed boxes to a passenger." />
          ) : (
            <ul className="divide-y divide-border/60">
              {data.manifests.upcoming.map((m) => (
                <li key={m.id}>
                  <Row
                    href="/dashboard/trip-manifests"
                    title={
                      <span className="inline-flex items-center gap-2">
                        <HugeiconsIcon icon={Airplane01Icon} className="size-4 text-primary" />
                        {m.airline} {m.flightNumber}
                      </span>
                    }
                    subtitle={`${m.tripNo} · ${m.route}`}
                    right={`${m.boxes} box${m.boxes === 1 ? "" : "es"}`}
                    rightSub={new Date(m.flightDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Deliveries today" description="Last-mile hand-overs created today">
          {loading ? (
            <ListSkeleton rows={2} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Assigned", value: data?.deliveries.assigned, icon: DeliverySent01Icon, tone: "" },
                { label: "On the road", value: data?.deliveries.outForDelivery, icon: TruckIcon, tone: "" },
                { label: "Delivered", value: data?.deliveries.delivered, icon: CheckmarkCircle02Icon, tone: "text-emerald-600" },
                { label: "Failed", value: data?.deliveries.failed, icon: Cancel01Icon, tone: "text-red-600" },
              ].map((d) => (
                <div key={d.label} className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <HugeiconsIcon icon={d.icon} className={cn("size-3.5", d.tone)} />
                    {d.label}
                  </div>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{formatNumber(d.value)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <ActionLink href="/dashboard/delivery-register" icon={DeliverySent01Icon} label="Open delivery register" />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Box status" description="Every consolidation box by stage">
          {loading ? (
            <ListSkeleton rows={4} />
          ) : totalBoxes === 0 ? (
            <EmptyNote title="No boxes yet" subtitle="Boxes appear here once cargo is packed in Dubai." />
          ) : (
            <div className="space-y-3.5">
              {BOX_ORDER.filter((k) => (data?.boxes.byStatus[k] ?? 0) > 0).map((k) => (
                <Bar
                  key={k}
                  label={BOX_LABEL[k] ?? k}
                  value={data?.boxes.byStatus[k] ?? 0}
                  max={boxMax}
                  display={formatNumber(data?.boxes.byStatus[k])}
                  tone={k === "LOST" || k === "DAMAGED" ? "red" : k === "SHELVED" ? "emerald" : "primary"}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Release queue"
          description="Waiting on Finance — oldest first"
          padded={false}
          action={<PanelLink href="/dashboard/delivery-register">Register</PanelLink>}
        >
          {loading ? (
            <ListSkeleton />
          ) : !data || data.release.oldest.length === 0 ? (
            <EmptyNote title="Nothing held" subtitle="All cargo with charges has been cleared for release." />
          ) : (
            <ul className="divide-y divide-border/60">
              {data.release.oldest.map((r) => (
                <li key={r.id}>
                  <Row
                    title={r.trackingNumber || "Shipment"}
                    subtitle={`Waiting ${formatRelative(r.createdAt).replace(" ago", "")}`}
                    right={formatMoney(r.amount, "TZS", { compact: true })}
                    rightSub={<Badge variant="secondary">Held</Badge>}
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
