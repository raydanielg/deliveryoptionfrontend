"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { TruckIcon } from "@hugeicons/core-free-icons"

export default function DeliveriesPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Operations", href: "/dashboard/operations" }, { label: "Deliveries" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
        <p className="text-sm text-muted-foreground">Active and completed deliveries</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={TruckIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Deliveries view coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
