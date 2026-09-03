"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Package02Icon } from "@hugeicons/core-free-icons"

export default function PackagesPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Operations", href: "/dashboard/operations" }, { label: "Packages" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Packages</h1>
        <p className="text-sm text-muted-foreground">Individual package tracking and management</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={Package02Icon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Packages view coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
