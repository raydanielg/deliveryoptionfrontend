"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Separator } from "@workspace/ui/components/separator"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Shield01Icon,
  UserGroupIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Settings01Icon,
  Edit01Icon,
  DashboardSpeed01Icon,
  TruckIcon,
  TrainIcon,
  AirplaneIcon,
  WarehouseIcon,
  Radar01Icon,
  Location01Icon,
  VanIcon,
  Dollar01Icon,
  Package02Icon,
  Globe02Icon,
  CreditCardIcon,
  CustomerService01Icon,
  LogsIcon,
  AlertCircleIcon,
  Settings02Icon,
  UserCircleIcon,
  DeliverySentIcon,
  HeadphonesIcon,
  BarChartIcon,
  UserIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@workspace/ui/components/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
  { key: "dashboard", label: "Dashboard", description: "Overview & analytics", icon: DashboardSpeed01Icon },
  { key: "administration", label: "Administration", description: "Users & roles management", icon: UserGroupIcon },
  { key: "operations", label: "Operations", description: "Shipments & orders", icon: TruckIcon },
  { key: "sgr", label: "SGR Rail", description: "Rail cargo management", icon: TrainIcon },
  { key: "airCargo", label: "Air Cargo", description: "Air freight management", icon: AirplaneIcon },
  { key: "warehouse", label: "Warehouse", description: "Inventory & storage", icon: WarehouseIcon },
  { key: "controlTower", label: "Control Tower", description: "Dispatch coordination", icon: Radar01Icon },
  { key: "tracking", label: "Tracking", description: "Live tracking & maps", icon: Location01Icon },
  { key: "fleet", label: "Fleet", description: "Vehicles & carriers", icon: VanIcon },
  { key: "pricing", label: "Pricing", description: "Rules & surcharges", icon: Dollar01Icon },
  { key: "parcelManagement", label: "Parcel Management", description: "Categories & fares", icon: Package02Icon },
  { key: "international", label: "International", description: "Customs & cross-border", icon: Globe02Icon },
  { key: "payments", label: "Payments", description: "Transactions & gateways", icon: CreditCardIcon },
  { key: "customers", label: "Customers", description: "Customer management", icon: CustomerService01Icon },
  { key: "support", label: "Support", description: "Tickets & help center", icon: HeadphonesIcon },
  { key: "blog", label: "Blog", description: "Content management", icon: LogsIcon },
  { key: "exceptions", label: "Exceptions", description: "Issue management", icon: AlertCircleIcon },
  { key: "settings", label: "Settings", description: "System configuration", icon: Settings02Icon },
] as const

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN: "Full system access with all permissions",
  OPERATIONS_MANAGER: "Manage operations, logistics, and fleet",
  SGR_STATION_OFFICER: "Manage SGR rail station operations",
  DISPATCHER: "Handle dispatch, tracking, and exceptions",
  FINANCE: "Manage pricing, payments, and invoices",
  CUSTOMER_SUPPORT: "Handle customer inquiries and support tickets",
  WAREHOUSE_MANAGER: "Manage warehouse inventory and operations",
  CUSTOMS_OFFICER: "Handle customs and international shipments",
  PRICING_MANAGER: "Manage pricing rules and parcel fares",
  REPORT_VIEWER: "View reports and analytics only",
  CUSTOMER: "Customer-facing portal access",
  DRIVER: "Driver app delivery management",
}

const ROLE_ICONS: Record<Role, IconSvgElement> = {
  SUPER_ADMIN: Shield01Icon,
  OPERATIONS_MANAGER: Settings01Icon,
  SGR_STATION_OFFICER: TrainIcon,
  DISPATCHER: TruckIcon,
  FINANCE: Dollar01Icon,
  CUSTOMER_SUPPORT: HeadphonesIcon,
  WAREHOUSE_MANAGER: WarehouseIcon,
  CUSTOMS_OFFICER: Globe02Icon,
  PRICING_MANAGER: Dollar01Icon,
  REPORT_VIEWER: BarChartIcon,
  CUSTOMER: UserCircleIcon,
  DRIVER: DeliverySentIcon,
}

export default function RolesPage() {
  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [sheetRole, setSheetRole] = React.useState<Role | null>(null)
  const [searchInRole, setSearchInRole] = React.useState("")
  const [editingUser, setEditingUser] = React.useState<any>(null)
  const [newRole, setNewRole] = React.useState<string>("")
  const [saving, setSaving] = React.useState(false)

  async function loadUsers() {
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

  React.useEffect(() => { loadUsers() }, [])

  const usersByRole = React.useMemo(() => {
    const map: Record<string, number> = {}
    for (const u of users) {
      const role = u.role || "CUSTOMER"
      map[role] = (map[role] || 0) + 1
    }
    return map
  }, [users])

  const roles = Object.keys(ROLE_LABELS) as Role[]

  function openRoleSheet(role: Role) {
    setSheetRole(role)
    setSheetOpen(true)
    setSearchInRole("")
    setEditingUser(null)
  }

  function startEditUser(user: any) {
    setEditingUser(user)
    setNewRole(user.role)
  }

  async function saveRoleChange() {
    if (!editingUser || !newRole) return
    try {
      setSaving(true)
      await api.users.changeRole(editingUser.id, newRole)
      toast.success(`${editingUser.name}'s role updated to ${ROLE_LABELS[newRole as Role]}`)
      setEditingUser(null)
      loadUsers()
    } catch (err: any) {
      toast.error(err.message || "Failed to update role")
    } finally {
      setSaving(false)
    }
  }

  const sheetUsers = React.useMemo(() => {
    if (!sheetRole) return []
    return users
      .filter((u) => u.role === sheetRole)
      .filter((u) => {
        if (!searchInRole) return true
        const q = searchInRole.toLowerCase()
        return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
      })
  }, [users, sheetRole, searchInRole])

  return (
    <DashboardLayout breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Administration", href: "/dashboard/admin" },
      { label: "Roles & Permissions" },
    ]}>
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        <PageHeader
          title="Roles & Permissions"
          description="View role definitions, module access levels, and manage user assignments."
        />

        {/* Role Cards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="size-10 rounded-lg" />
                <Skeleton className="mt-3 h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-32" />
                <Skeleton className="mt-3 h-6 w-16" />
              </Card>
            ))
          ) : (
            roles.map((role) => {
              const count = usersByRole[role] || 0
              const perms = ROLE_NAV_PERMISSIONS[role] || []
              const isSelected = selectedRole === role
              return (
                <Card
                  key={role}
                  className={`group p-4 transition-all hover:shadow-md ${isSelected ? "border-primary ring-1 ring-primary" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted/50">
                      <HugeiconsIcon icon={ROLE_ICONS[role]} className="size-5 text-muted-foreground" />
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                      {formatNumber(count)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{ROLE_LABELS[role]}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{ROLE_DESCRIPTIONS[role]}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={Shield01Icon} className="size-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{perms.length} modules</span>
                    </div>
                    <button
                      onClick={() => openRoleSheet(role)}
                      className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
                      Manage
                    </button>
                  </div>
                </Card>
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
                      <span className="inline-flex items-center gap-1.5">
                        <HugeiconsIcon icon={ROLE_ICONS[role]} className="size-4" />
                        <span className="hidden xl:inline">{ROLE_LABELS[role]}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((mod) => (
                  <tr key={mod.key} className="border-b last:border-0 transition-colors hover:bg-muted/20">
                    <td className="sticky left-0 z-10 bg-background px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <HugeiconsIcon icon={mod.icon} className="size-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{mod.label}</p>
                          <p className="text-xs text-muted-foreground">{mod.description}</p>
                        </div>
                      </div>
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
                  <div className="flex size-11 items-center justify-center rounded-lg bg-muted/50">
                    <HugeiconsIcon icon={ROLE_ICONS[selectedRole]} className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">{ROLE_LABELS[selectedRole]}</h2>
                    <p className="text-sm text-muted-foreground">{ROLE_DESCRIPTIONS[selectedRole]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={ROLE_BADGE_COLORS[selectedRole]}>
                    {formatNumber(usersByRole[selectedRole] || 0)} users
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => openRoleSheet(selectedRole)}>
                    <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
                    Manage Users
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-px bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((mod) => {
                const hasAccess = (ROLE_NAV_PERMISSIONS[selectedRole] || []).includes(mod.key as any)
                return (
                  <div key={mod.key} className="flex items-center justify-between bg-background px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <HugeiconsIcon icon={mod.icon} className="size-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{mod.label}</span>
                        <span className="text-xs text-muted-foreground">{mod.description}</span>
                      </div>
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

        {/* User Distribution */}
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
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted/40">
                      <HugeiconsIcon icon={ROLE_ICONS[role]} className="size-4 text-muted-foreground" />
                    </div>
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

      {/* Role Users Sheet Drawer (left side) */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full sm:max-w-lg p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="flex items-center gap-2.5 text-lg">
              {sheetRole && (
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50">
                  <HugeiconsIcon icon={ROLE_ICONS[sheetRole]} className="size-4 text-muted-foreground" />
                </div>
              )}
              {sheetRole ? ROLE_LABELS[sheetRole] : ""}
            </SheetTitle>
            <SheetDescription>
              {sheetRole ? ROLE_DESCRIPTIONS[sheetRole] : ""} — {sheetRole ? formatNumber(usersByRole[sheetRole] || 0) : 0} users assigned
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Search */}
            <div className="border-b px-6 py-3">
              <div className="relative">
                <HugeiconsIcon icon={Search01Icon} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchInRole}
                  onChange={(e) => setSearchInRole(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Users list */}
            <div className="flex-1 overflow-y-auto">
              {sheetUsers.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <HugeiconsIcon icon={UserIcon} className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {sheetUsers.map((u) => (
                    <div key={u.id} className="px-6 py-3.5">
                      {editingUser?.id === u.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-full bg-muted/50">
                              <HugeiconsIcon icon={UserIcon} className="size-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{u.name}</p>
                              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Change role to:</p>
                            <Select value={newRole} onValueChange={(v: string | null) => setNewRole((v as string) || "")}>
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {roles.map((r) => (
                                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>Cancel</Button>
                            <Button size="sm" onClick={saveRoleChange} disabled={saving || newRole === u.role}>
                              {saving ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-full bg-muted/50">
                            <HugeiconsIcon icon={UserIcon} className="size-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{u.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={u.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                            <Button variant="ghost" size="sm" onClick={() => startEditUser(u)}>
                              <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="border-t px-6 py-3">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>Close</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}
