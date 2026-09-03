"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { CoinsIcon } from "@hugeicons/core-free-icons"

export default function RefundsPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Payments", href: "/dashboard/payments" }, { label: "Refunds" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Refunds</h1>
        <p className="text-sm text-muted-foreground">Process and track refunds</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Refund management coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
