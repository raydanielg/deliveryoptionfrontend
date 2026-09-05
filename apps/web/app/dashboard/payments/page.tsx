"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { api } from "@/lib/api"
import { formatMoney, formatNumber } from "@/lib/format"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CoinsIcon, File02Icon, CreditCardIcon, ArrowRight02Icon,
  CheckmarkCircle02Icon, ClockIcon, ArrowUpRight02Icon, ArrowDownRight02Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState<any[]>([])
  const [invoices, setInvoices] = React.useState<any[]>([])
  const [refunds, setRefunds] = React.useState<any[]>([])
  const [gateways, setGateways] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      const [payRes, invRes, refRes, gwRes] = await Promise.all([
        api.payments.list().catch(() => ({ data: [] })),
        api.invoices.list().catch(() => ({ data: [] })),
        api.refunds.list().catch(() => ({ data: [] })),
        api.paymentGateways.list().catch(() => ({ data: [] })),
      ])
      const rawPays = payRes.data?.payments || payRes.data
      setPayments(Array.isArray(rawPays) ? rawPays : [])
      const rawInvs = invRes.data?.invoices || invRes.data
      setInvoices(Array.isArray(rawInvs) ? rawInvs : [])
      const rawRefs = refRes.data?.refunds || refRes.data
      setRefunds(Array.isArray(rawRefs) ? rawRefs : [])
      const rawGws = gwRes.data?.gateways || gwRes.data
      setGateways(Array.isArray(rawGws) ? rawGws : [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = payments.filter((p) => p.status === "PAID" || p.status === "COMPLETED").reduce((s, p) => s + Number(p.amount || 0), 0)
  const pendingInvoices = invoices.filter((i) => i.status === "PENDING" || i.status === "DRAFT").length
  const pendingRefunds = refunds.filter((r) => r.status === "PENDING" || r.status === "REQUESTED").length
  const activeGateways = gateways.filter((g) => g.isActive).length
  const totalRefunded = refunds.filter((r) => r.status === "APPROVED" || r.status === "COMPLETED").reduce((s, r) => s + Number(r.amount || 0), 0)

  const navCards = [
    {
      title: "Transactions",
      href: "/dashboard/payments/transactions",
      icon: CoinsIcon,
      description: "All payment transactions and settlement status",
      stats: [
        { label: "Total", value: formatNumber(payments.length) },
        { label: "Revenue", value: formatMoney(totalRevenue, undefined, { compact: true }) },
      ],
    },
    {
      title: "Invoices",
      href: "/dashboard/payments/invoices",
      icon: File02Icon,
      description: "Customer invoices and payment tracking",
      stats: [
        { label: "Total", value: formatNumber(invoices.length) },
        { label: "Pending", value: formatNumber(pendingInvoices) },
      ],
    },
    {
      title: "Refunds",
      href: "/dashboard/payments/refunds",
      icon: ArrowDownRight02Icon,
      description: "Process and track refund requests",
      stats: [
        { label: "Total", value: formatNumber(refunds.length) },
        { label: "Pending", value: formatNumber(pendingRefunds) },
        { label: "Refunded", value: formatMoney(totalRefunded, undefined, { compact: true }) },
      ],
    },
    {
      title: "Gateways",
      href: "/dashboard/payment-gateways",
      icon: CreditCardIcon,
      description: "Configure Selcom, Azampesa, and other providers",
      stats: [
        { label: "Total", value: formatNumber(gateways.length) },
        { label: "Active", value: formatNumber(activeGateways) },
      ],
    },
  ]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Payments" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Payments"
          icon={<HugeiconsIcon icon={CoinsIcon} className="size-6 text-primary" />}
          description="Manage transactions, invoices, refunds, and payment gateway configurations."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)
          ) : (
            <>
              <MetricCard label="Total Revenue" value={formatMoney(totalRevenue, undefined, { compact: true })} icon={ArrowUpRight02Icon} hint="From paid transactions" />
              <MetricCard label="Pending Invoices" value={formatNumber(pendingInvoices)} icon={ClockIcon} hint="Awaiting payment" />
              <MetricCard label="Pending Refunds" value={formatNumber(pendingRefunds)} icon={ArrowDownRight02Icon} hint="Awaiting review" />
              <MetricCard label="Active Gateways" value={formatNumber(activeGateways)} icon={CreditCardIcon} hint="Enabled providers" />
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
