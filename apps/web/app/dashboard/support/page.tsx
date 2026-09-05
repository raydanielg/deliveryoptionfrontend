"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { formatNumber } from "@/lib/format"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CustomerService01Icon, StarIcon, ArrowRight02Icon,
  AlertCircleIcon, CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function SupportPage() {
  const [tickets, setTickets] = React.useState<any[]>([])
  const [ratings, setRatings] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const [tickRes, rateRes] = await Promise.all([
        api.tickets.list().catch(() => ({ data: [] })),
        api.ratings.list().catch(() => ({ data: [] })),
      ])
      const rawTickets = tickRes.data?.tickets || tickRes.data
      setTickets(Array.isArray(rawTickets) ? rawTickets : [])
      const rawRatings = rateRes.data?.ratings || rateRes.data
      setRatings(Array.isArray(rawRatings) ? rawRatings : [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "REOPENED").length
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length
  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + Number(r.rating || 0), 0) / ratings.length) : 0

  const navCards = [
    {
      title: "Tickets",
      href: "/dashboard/support/tickets",
      icon: CustomerService01Icon,
      description: "Manage customer support inquiries and issues",
      stats: [
        { label: "Total", value: formatNumber(tickets.length) },
        { label: "Open", value: formatNumber(openTickets) },
        { label: "Resolved", value: formatNumber(resolvedTickets) },
      ],
    },
    {
      title: "Ratings",
      href: "/dashboard/support/ratings",
      icon: StarIcon,
      description: "Customer delivery satisfaction scores and reviews",
      stats: [
        { label: "Total", value: formatNumber(ratings.length) },
        { label: "Average", value: `${avgRating.toFixed(1)}/5` },
      ],
    },
  ]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Support" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Support"
          icon={<HugeiconsIcon icon={CustomerService01Icon} className="size-6 text-primary" />}
          description="Customer support tickets and delivery ratings — manage inquiries and track satisfaction."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)
          ) : (
            <>
              <MetricCard label="Total Tickets" value={formatNumber(tickets.length)} icon={CustomerService01Icon} hint="All inquiries" />
              <MetricCard label="Open Tickets" value={formatNumber(openTickets)} icon={AlertCircleIcon} hint="Awaiting response" />
              <MetricCard label="Total Ratings" value={formatNumber(ratings.length)} icon={StarIcon} hint="Customer reviews" />
              <MetricCard label="Avg Rating" value={`${avgRating.toFixed(1)}/5`} icon={CheckmarkCircle02Icon} hint="Satisfaction score" />
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
