"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Switch } from "@workspace/ui/components/switch"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Separator } from "@workspace/ui/components/separator"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Shield01Icon,
  UserGroupIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import {
  ROLE_LABELS,
  ROLE_BADGE_COLORS,
  ROLE_NAV_PERMISSIONS,
  type Role,
} from "@/lib/role-nav"
import { api } from "@/lib/api"
import { formatNumber } from "@/lib/format"
import { toast } from "sonner"

const MODULES = [
  { key: "dashboard", label: "Dashboard", description: "Overview & analytics" },
  { key: "administration", label: "Administration", description: "Users & roles management" },
  { key: "operations", label: "Operations", description: "Shipments & orders" },
  { key: "sgr", label: "SGR Rail", description: "Rail cargo management" },
  { key: "airCargo", label: "Air Cargo", description: "Air freight management" },
  { key: "warehouse", label: "Warehouse", description: "Inventory & storage" },
  { key: "controlTower", label: "Control Tower", description: "Dispatch coordination" },
  { key: "tracking", label: "Tracking", description: "Live tracking & maps" },
  { key: "fleet", label: "Fleet", description: "Vehicles & carriers" },
  { key: "pricing", label: "Pricing", description: "Rules & surcharges" },
  { key: "parcelManagement", label: "Parcel Management", description: "Categories & fares" },
  { key: "international", label: "International", description: "Customs & cross-border" },
  { key: "payments", label: "Payments", description: "Transactions & gateways" },
  { key: "customers", label: "Customers", description: "Customer management" },
  { key: "support", label: "Support", description: "Tickets & help center" },
  { key: "blog", label: "Blog", description: "Content management" },
  { key: "exceptions", label: "Exceptions", description: "Issue management" },
  { key: "settings", label: "Settings", description: "System configuration" },
] as const

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN: "Full system access with all permissions",
  OPERATIONS_MANAGER: "Manage operations, logistics, and fleet",
  DISPATCHER: "Handle dispatch, tracking, and exceptions",
  FINANCE: "Manage pricing, payments, and invoices",
  CUSTOMER_SUPPORT: "Handle customer inquiries and support tickets",
  WAREHOUSE_MANAGER: "Manage warehouse inventory and operations",
  CUSTOMS_OFFICER: "Handle customs and international shipments",
  REPORT_VIEWER: "View reports and analytics only",
  CUSTOMER: "Customer-facing portal access",
  DRIVER: "Driver app delivery management",
}

const ROLE_ICONS: Record<Role, string> = {
  SUPER_ADMIN: "🛡️",
  OPERATIONS_MANAGER: "📋",
  DISPATCHER: "🚚",
  FINANCE: "💰",
  CUSTOMER_SUPPORT: "🎧",
  WAREHOUSE_MANAGER: "📦",
  CUSTOMS_OFFICER: "🛃",
  REPORT_VIEWER: "📊",
  CUSTOMER: "👤",
  DRIVER: "🏍️",
}

export default function RolesPage() {
  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await api.users.list("?page=1&limit=500")
        const data = res.data?.users || res.data || []
        setUsers(Array.isArray(data) ? data : [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const usersByRole = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const u of users) {
      const role = u.role || "CUSTOMER"
      map[role] = (map[role] || 0) + 1
    }
    return map
  }, [users])

  const roles = Object.keys(ROLE_LABELS) as Role[]

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Administration", href: "/dashboard/admin" },
      { label: "Roles & Permissions" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Roles & Permissions"
          description="View role definitions, module access levels, and user distribution across the platform."
        />

        {/* Role Cards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="mt-3 h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-32" />
                <Skeleton className="mt-3 h-6 w-16" />
              </Card>
            ))
          ) : (
            roles.map((role) => {
              const count = usersByRole[role] || 0
              const perms = ROLE_NAV_PERMISSIONS[role] || []
              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                  className={`text-left transition-all ${selectedRole === role ? "ring-2 ring-primary" : ""}`}
                >
                  <Card className={`p-4 transition-all hover:shadow-md ${selectedRole === role ? "border-primary" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{ROLE_ICONS[role]}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                        {formatNumber(count)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold">{ROLE_LABELS[role]}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{ROLE_DESCRIPTIONS[role]}</p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <HugeiconsIcon icon={Shield01Icon} className="size-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{perms.length} modules</span>
                    </div>
                  </Card>
                </button>
              )
            })
          )}
        </div>

        {/* Permissions Matrix */}
        <Card className="overflow-hidden p-0">
          <div className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Settings01Icon} className="size-5 text-muted-foreground" />
              <h2 className="text-base font-semibold">Permissions Matrix</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Module access level for each role</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="sticky left-0 z-10 bg-muted/30 px-4 py-3 font-medium text-muted-foreground">Module</th>
                  {roles.map((role) => (
                    <th key={role} className="px-3 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <span>{ROLE_ICONS[role]}</span>
                        <span className="hidden lg:inline">{ROLE_LABELS[role]}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((mod) => (
                  <tr key={mod.key} className="border-b last:border-0 transition-colors hover:bg-muted/20">
                    <td className="sticky left-0 z-10 bg-background px-4 py-3">
                      <p className="font-medium">{mod.label}</p>
                      <p className="text-xs text-muted-foreground">{mod.description}</p>
                    </td>
                    {roles.map((role) => {
                      const hasAccess = (ROLE_NAV_PERMISSIONS[role] || []).includes(mod.key as any)
                      return (
                        <td key={role} className="px-3 py-3 text-center">
                          {hasAccess ? (
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mx-auto size-4 text-emerald-500" />
                          ) : (
                            <HugeiconsIcon icon={Cancel01Icon} className="mx-auto size-4 text-muted-foreground/30" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Selected Role Detail */}
        {selectedRole && (
          <Card className="p-0">
            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{ROLE_ICONS[selectedRole]}</span>
                  <div>
                    <h2 className="text-base font-semibold">{ROLE_LABELS[selectedRole]}</h2>
                    <p className="text-sm text-muted-foreground">{ROLE_DESCRIPTIONS[selectedRole]}</p>
                  </div>
                </div>
                <Badge className={ROLE_BADGE_COLORS[selectedRole]}>
                  {formatNumber(usersByRole[selectedRole] || 0)} users
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-px bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((mod) => {
                const hasAccess = (ROLE_NAV_PERMISSIONS[selectedRole] || []).includes(mod.key as any)
                return (
                  <div key={mod.key} className="flex items-center justify-between bg-background px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{mod.label}</span>
                      <span className="text-xs text-muted-foreground">{mod.description}</span>
                    </div>
                    {hasAccess ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                        Granted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/50">
                        <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                        No access
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Users by Role Summary */}
        <Card className="p-0">
          <div className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={UserGroupIcon} className="size-5 text-muted-foreground" />
              <h2 className="text-base font-semibold">User Distribution</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Total users assigned to each role</p>
          </div>
          <div className="divide-y">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-12" />
                </div>
              ))
            ) : (
              roles.map((role) => {
                const count = usersByRole[role] || 0
                const total = users.length || 1
                const pct = (count / total) * 100
                return (
                  <div key={role} className="flex items-center gap-4 px-6 py-3.5">
                    <span className="text-lg">{ROLE_ICONS[role]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{ROLE_LABELS[role]}</span>
                        <span className="text-sm tabular-nums text-muted-foreground">{formatNumber(count)}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
