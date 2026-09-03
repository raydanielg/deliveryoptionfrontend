"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { MapIcon } from "@hugeicons/core-free-icons"

export default function PricingZonesPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pricing", href: "/dashboard/pricing" }, { label: "Zones" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Zones</h1>
        <p className="text-sm text-muted-foreground">Delivery zone management</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Zone management coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
