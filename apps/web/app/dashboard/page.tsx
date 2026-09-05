"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { RoleDashboard } from "@/components/role-dashboards"

export default function Page() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }, { label: "Overview" }]}>
      <RoleDashboard />
    </DashboardLayout>
  )
}
