"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@workspace/ui/components/sheet"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { formatNumber, formatDate } from "@/lib/format"
import { exportToPDF } from "@/lib/pdf-export"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  StarIcon, Search01Icon, Download01Icon, CheckmarkCircle02Icon,
  AlertCircleIcon, CustomerService01Icon, TruckIcon,
} from "@hugeicons/core-free-icons"

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const starSize = size === "lg" ? "size-5" : size === "md" ? "size-4" : "size-3.5"
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <HugeiconsIcon
          key={i}
          icon={StarIcon}
          className={`${starSize} ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  )
}

export default function RatingsPage() {
  const [ratings, setRatings] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState<string>("ALL")
  const [selected, setSelected] = React.useState<any | null>(null)

  React.useEffect(() => { load() }, [])

  async function load() {
    try {
      const result = await api.ratings.list()
      setRatings(result.data || [])
    } catch {
      setRatings([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = ratings.filter((r) => {
    if (ratingFilter !== "ALL") {
      const min = Number(ratingFilter)
      if (r.rating < min) return false
    }
    if (!search) return true
    const q = search.toLowerCase()
    return r.customer?.name?.toLowerCase().includes(q) ||
      r.driver?.name?.toLowerCase().includes(q) ||
      r.shipment?.trackingNumber?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
  })

  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + Number(r.rating || 0), 0) / ratings.length) : 0
  const fiveStarCount = ratings.filter((r) => r.rating === 5).length
  const oneStarCount = ratings.filter((r) => r.rating <= 2).length
  const totalReviews = ratings.length

  function handleExportPDF() {
    exportToPDF({
      title: "Customer Ratings Report",
      subtitle: "Delivery satisfaction scores and customer feedback",
      columns: [
        { header: "Customer", key: "customer" },
        { header: "Driver", key: "driver" },
        { header: "Shipment", key: "shipment" },
        { header: "Rating", key: "rating" },
        { header: "Comment", key: "comment" },
        { header: "Date", key: "date" },
      ],
      rows: filtered.map((r) => ({
        customer: r.customer?.name || "—",
        driver: r.driver?.name || "—",
        shipment: r.shipment?.trackingNumber || "—",
        rating: `${r.rating}/5`,
        comment: r.comment || "—",
        date: r.createdAt ? formatDate(r.createdAt) : "—",
      })),
      meta: [
        { label: "Total Reviews", value: String(totalReviews) },
        { label: "Average Rating", value: `${avgRating.toFixed(1)}/5` },
        { label: "5-Star Reviews", value: String(fiveStarCount) },
      ],
    })
  }

  const ratingFilters = [
    { label: "All", value: "ALL" },
    { label: "5 Stars", value: "5" },
    { label: "4+ Stars", value: "4" },
    { label: "3+ Stars", value: "3" },
    { label: "Below 3", value: "1" },
  ]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Support", href: "/dashboard/support" },
      { label: "Ratings" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="⭐ Ratings"
          description="Customer delivery ratings and reviews — track satisfaction and feedback."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
              Export PDF
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Reviews" value={formatNumber(totalReviews)} icon={StarIcon} hint="All ratings" />
          <MetricCard label="Average Rating" value={`${avgRating.toFixed(1)}/5`} icon={StarIcon} hint="Overall satisfaction" />
          <MetricCard label="5-Star Reviews" value={formatNumber(fiveStarCount)} icon={CheckmarkCircle02Icon} hint="Excellent service" />
          <MetricCard label="Low Ratings" value={formatNumber(oneStarCount)} icon={AlertCircleIcon} hint="Needs attention" />
        </div>

        {/* Average rating banner */}
        {!loading && totalReviews > 0 && (
          <div className="flex items-center gap-4 rounded-lg border bg-gradient-to-r from-yellow-500/5 to-orange-500/5 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10">
              <HugeiconsIcon icon={StarIcon} className="size-7 text-yellow-500 fill-yellow-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Overall Customer Satisfaction</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
                <StarRating rating={Math.round(avgRating)} size="md" />
                <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customer, driver, shipment..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ratingFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setRatingFilter(f.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  ratingFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card py-12 text-center">
            <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No ratings found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Driver</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Shipment</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Rating</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Comment</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer transition-colors hover:bg-muted/20"
                      onClick={() => setSelected(r)}
                    >
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {r.customer?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium">{r.customer?.name || "—"}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{r.driver?.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{r.shipment?.trackingNumber || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={r.rating || 0} />
                          <span className="text-xs font-medium tabular-nums">{r.rating || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{r.comment || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.createdAt ? formatDate(r.createdAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {selected.customer?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  {selected.customer?.name || "Customer"}
                </SheetTitle>
                <SheetDescription>
                  {selected.shipment?.trackingNumber || "No shipment"} — {selected.createdAt ? formatDate(selected.createdAt) : ""}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-6">
                {/* Rating display */}
                <div className="flex flex-col items-center rounded-lg border bg-gradient-to-r from-yellow-500/5 to-orange-500/5 p-5">
                  <p className="text-3xl font-bold mb-1">{selected.rating || 0}<span className="text-lg text-muted-foreground">/5</span></p>
                  <StarRating rating={selected.rating || 0} size="lg" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="mt-1 text-sm font-medium">{selected.customer?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Driver</p>
                    <p className="mt-1 text-sm font-medium">{selected.driver?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Shipment</p>
                    <p className="mt-1 text-sm font-medium tabular-nums">{selected.shipment?.trackingNumber || "—"}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="mt-1 text-sm font-medium">{selected.createdAt ? formatDate(selected.createdAt) : "—"}</p>
                  </div>
                </div>

                {selected.comment && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Comment</p>
                    <p className="text-sm leading-relaxed">{selected.comment}</p>
                  </div>
                )}

                {selected.shipment?.origin && selected.shipment?.destination && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Route</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{selected.shipment.origin}</span>
                      <HugeiconsIcon icon={TruckIcon} className="size-4 text-muted-foreground" />
                      <span className="font-medium">{selected.shipment.destination}</span>
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
