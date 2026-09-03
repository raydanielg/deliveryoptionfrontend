"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartIcon } from "@hugeicons/core-free-icons"

export default function RatingsPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Support", href: "/dashboard/support" }, { label: "Ratings" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Ratings</h1>
        <p className="text-sm text-muted-foreground">Delivery satisfaction scores and feedback</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={ChartIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Ratings and reviews coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
