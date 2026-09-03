"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@workspace/ui/components/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { CustomerService01Icon } from "@hugeicons/core-free-icons"

export default function TicketsPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Support", href: "/dashboard/support" }, { label: "Tickets" }]}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">Customer support inquiries</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={CustomerService01Icon} strokeWidth={2} className="size-8 mx-auto mb-2 opacity-50" />
          Ticket management coming soon
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
