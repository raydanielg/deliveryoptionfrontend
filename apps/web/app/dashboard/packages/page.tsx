"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { MetricCard } from "@/components/shared/metric-card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Package02Icon,
  Search01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  TruckIcon,
} from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { formatMoney, formatDate, formatNumber } from "@/lib/format"
import { useLang } from "@/lib/i18n"

const STATUS_OPTIONS = [
  { value: "ALL", label: "filter.allStatuses" },
  { value: "BOOKED", label: "filter.booked" },
  { value: "PENDING", label: "filter.pending" },
  { value: "ACCEPTED", label: "filter.accepted" },
  { value: "PICKED_UP", label: "filter.pickedUp" },
  { value: "IN_TRANSIT", label: "filter.inTransit" },
  { value: "DELIVERED", label: "filter.delivered" },
  { value: "CANCELLED", label: "filter.cancelled" },
]

export default function PackagesPage() {
  const { t } = useLang()
  const [shipments, setShipments] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const limit = 20

  React.useEffect(() => { load() }, [page, statusFilter])

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(limit))
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      const [listRes, statsRes] = await Promise.all([
        api.shipments.list(params.toString()),
        api.shipments.stats(),
      ])
      const rawShipments = listRes.data?.shipments || listRes.data
      setShipments(Array.isArray(rawShipments) ? rawShipments : [])
      setTotal(listRes.data?.pagination?.total || listRes.pagination?.total || listRes.total || 0)
      setStats(statsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = shipments.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.trackingNumber?.toLowerCase().includes(q) ||
      s.fromAddress?.city?.toLowerCase().includes(q) ||
      s.toAddress?.city?.toLowerCase().includes(q)
  })

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <DashboardLayout breadcrumbs={[{ label: t("breadcrumb.dashboard"), href: "/dashboard" }, { label: t("page.packages") }]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title={t("page.packages")}
          description={t("page.packagesDesc")}
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label={t("common.totalPackages")}
            value={formatNumber(stats?.total ?? 0)}
            icon={Package02Icon}
            loading={loading}
            hint={t("common.allPackages")}
          />
          <MetricCard
            label={t("common.inTransit")}
            value={formatNumber(stats?.inTransit ?? 0)}
            icon={TruckIcon}
            loading={loading}
            hint={t("common.currentlyMoving")}
          />
          <MetricCard
            label={t("common.delivered")}
            value={formatNumber(stats?.delivered ?? 0)}
            icon={CheckmarkCircle02Icon}
            loading={loading}
            hint={t("common.successfullyDelivered")}
          />
          <MetricCard
            label={t("common.cancelled")}
            value={formatNumber(stats?.cancelled ?? 0)}
            icon={Cancel01Icon}
            loading={loading}
            hint={t("common.cancelledPackages")}
          />
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("common.searchTracking")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "ALL"); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder={t("common.filterStatus")} /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.label)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => { setPage(1); load() }} className="sm:ml-auto">
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
            {t("common.search")}
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.trackingNumber")}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.route")}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.weight")}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.amount")}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.status")}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t("common.date")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <HugeiconsIcon icon={Package02Icon} className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">{t("common.noPackages")}</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/shipments/${s.id}`} className="font-medium text-primary hover:underline">
                          {s.trackingNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.fromAddress?.city || "—"} <span className="text-muted-foreground/50">→</span> {s.toAddress?.city || "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{s.chargeableWeightKg ? `${s.chargeableWeightKg} kg` : "—"}</td>
                      <td className="px-4 py-3 font-medium tabular-nums">{formatMoney(Number(s.totalAmount || 0), s.currency || "TZS", { compact: true })}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(s.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
                {t("common.previous")}
              </Button>
              <span className="text-sm text-muted-foreground">{t("common.page")} {page} {t("common.of")} {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                {t("common.next")}
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
