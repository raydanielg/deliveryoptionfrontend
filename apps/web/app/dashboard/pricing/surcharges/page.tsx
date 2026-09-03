"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { CoinsIcon } from "@hugeicons/core-free-icons"

export default function SurchargesPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pricing", href: "/dashboard/pricing" }, { label: "Surcharges" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Surcharges</h1>
        <p className="text-sm text-muted-foreground">Additional fee configuration</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Surcharge management coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
