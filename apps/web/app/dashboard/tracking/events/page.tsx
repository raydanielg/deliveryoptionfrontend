"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { MapIcon } from "@hugeicons/core-free-icons"

export default function TrackingEventsPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tracking", href: "/dashboard/tracking" }, { label: "Events" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tracking Events</h1>
        <p className="text-sm text-muted-foreground">All tracking events across shipments</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={MapIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Tracking events log coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
