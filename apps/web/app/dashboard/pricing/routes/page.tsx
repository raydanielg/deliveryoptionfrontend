"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Route02Icon } from "@hugeicons/core-free-icons"

export default function PricingRoutesPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pricing", href: "/dashboard/pricing" }, { label: "Routes" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Routes</h1>
        <p className="text-sm text-muted-foreground">Manage delivery routes and distances</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={Route02Icon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Route management coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
