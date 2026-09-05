"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { formatMoney, formatNumber } from "@/lib/format"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Globe02Icon, File02Icon, TruckIcon, ArrowRight02Icon,
  CheckmarkCircle02Icon, ClockIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function InternationalPage() {
  const [customs, setCustoms] = React.useState<any[]>([])
  const [shipments, setShipments] = React.useState<any[]>([])
  const [documents, setDocuments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const [customsRes, shipRes, docRes] = await Promise.all([
        api.customs.get("").catch(() => ({ data: [] })),
        api.shipments.list("category=INTERNATIONAL").catch(() => ({ data: [] })),
        api.documents.list().catch(() => ({ data: [] })),
      ])
      setCustoms(customsRes.data || [])
      setShipments(shipRes.data || [])
      setDocuments(docRes.data || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const pendingCustoms = customs.filter((c) => c.status === "PENDING" || c.status === "UNDER_REVIEW").length
  const clearedCustoms = customs.filter((c) => c.status === "CLEARED").length
  const inTransit = shipments.filter((s) => s.status === "IN_TRANSIT" || s.status === "ONGOING" || s.status === "OUT_FOR_DELIVERY").length
  const delivered = shipments.filter((s) => s.status === "DELIVERED" || s.status === "COMPLETED").length
  const pendingDocs = documents.filter((d) => d.status === "PENDING").length
  const verifiedDocs = documents.filter((d) => d.status === "VERIFIED").length

  const navCards = [
    {
      title: "Customs",
      href: "/dashboard/international/customs",
      icon: Globe02Icon,
      description: "Declarations, clearance status, and duty calculations",
      stats: [
        { label: "Total", value: formatNumber(customs.length) },
        { label: "Pending", value: formatNumber(pendingCustoms) },
        { label: "Cleared", value: formatNumber(clearedCustoms) },
      ],
    },
    {
      title: "Documents",
      href: "/dashboard/international/documents",
      icon: File02Icon,
      description: "Commercial invoices, packing lists, certificates",
      stats: [
        { label: "Total", value: formatNumber(documents.length) },
        { label: "Pending", value: formatNumber(pendingDocs) },
        { label: "Verified", value: formatNumber(verifiedDocs) },
      ],
    },
    {
      title: "Int'l Shipments",
      href: "/dashboard/international/shipments",
      icon: TruckIcon,
      description: "Cross-border deliveries — air, sea, and road",
      stats: [
        { label: "Total", value: formatNumber(shipments.length) },
        { label: "In Transit", value: formatNumber(inTransit) },
        { label: "Delivered", value: formatNumber(delivered) },
      ],
    },
  ]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "International" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="🌍 International"
          description="Cross-border logistics — customs declarations, shipping documents, and international shipment tracking."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)
          ) : (
            <>
              <MetricCard label="Customs Declarations" value={formatNumber(customs.length)} icon={Globe02Icon} hint={`${pendingCustoms} pending`} />
              <MetricCard label="Documents" value={formatNumber(documents.length)} icon={File02Icon} hint={`${pendingDocs} pending`} />
              <MetricCard label="In Transit" value={formatNumber(inTransit)} icon={TruckIcon} hint="Moving shipments" />
              <MetricCard label="Delivered" value={formatNumber(delivered)} icon={CheckmarkCircle02Icon} hint="Completed" />
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {navCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-lg border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HugeiconsIcon icon={card.icon} className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{card.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{card.description}</p>
                  </div>
                </div>
                <HugeiconsIcon icon={ArrowRight02Icon} className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <div className="flex items-center gap-4 border-t pt-3">
                {card.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold tabular-nums">{stat.value}</p>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
