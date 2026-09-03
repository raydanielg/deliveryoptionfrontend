"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon } from "@hugeicons/core-free-icons"

export default function DriverLocationsPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tracking", href: "/dashboard/tracking" }, { label: "Driver Locations" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Driver Locations</h1>
        <p className="text-sm text-muted-foreground">Live GPS tracking of all drivers</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Driver location tracking coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
