// ============================================================
// XERIN EXPRESS — ROLE MODEL (web)
// ============================================================
// Four staff roles plus the two external user types. Mirrors back/src/utils/roles.js.
//
//   SUPER_ADMIN         Main admin — sees everything.
//   OPERATIONS_MANAGER  Operations / IT — carries Super Admin privileges.
//   FINANCE             Payments, invoicing, approvals, pricing, reports.
//   WAREHOUSE_MANAGER   Warehouse, receiving, consolidation, SGR station cargo.
//   BRANCH_MANAGER      Runs one branch — sees that branch only.
//   AGENT               Clearing / forwarding / receiving partner — sees only shipments they hold a task on.
//   CUSTOMER / DRIVER   External users.
// ============================================================

export type Role =
  | "SUPER_ADMIN"
  | "OPERATIONS_MANAGER"
  | "FINANCE"
  | "WAREHOUSE_MANAGER"
  | "BRANCH_MANAGER"
  | "AGENT"
  | "CUSTOMER"
  | "DRIVER"

export const STAFF_ROLES: Role[] = ["SUPER_ADMIN", "OPERATIONS_MANAGER", "FINANCE", "WAREHOUSE_MANAGER", "BRANCH_MANAGER"]
export const ALL_ROLES: Role[] = [...STAFF_ROLES, "AGENT", "CUSTOMER", "DRIVER"]
export const BRANCH_BOUND_ROLES: Role[] = ["BRANCH_MANAGER", "AGENT"]
export const AGENT_KINDS = [
  { value: "CLEARING", label: "Clearing" },
  { value: "FORWARDING", label: "Forwarding" },
  { value: "RECEIVING", label: "Receiving" },
]

// Roles retired in the consolidation. A browser that logged in before the change still has
// one of these in localStorage/cookies until it signs in again — map it forward so the
// menu, dashboard and route guards keep working instead of showing an empty shell.
const LEGACY_ROLE_MAP: Record<string, Role> = {
  DISPATCHER: "OPERATIONS_MANAGER",
  CUSTOMER_SUPPORT: "OPERATIONS_MANAGER",
  CUSTOMS_OFFICER: "OPERATIONS_MANAGER",
  SGR_STATION_OFFICER: "WAREHOUSE_MANAGER",
  DUBAI_RECEIVING_OFFICER: "WAREHOUSE_MANAGER",
  CONSOLIDATION_OFFICER: "WAREHOUSE_MANAGER",
  TRIP_COORDINATOR: "WAREHOUSE_MANAGER",
  TZ_RECEIVING_OFFICER: "WAREHOUSE_MANAGER",
  WAREHOUSE_OFFICER: "WAREHOUSE_MANAGER",
  PRICING_MANAGER: "FINANCE",
  REPORT_VIEWER: "FINANCE",
  ACCOUNTANT: "FINANCE",
  FINANCE_APPROVER: "FINANCE",
}

export function normalizeRole(role: string | undefined | null): Role | undefined {
  if (!role) return undefined
  if ((ALL_ROLES as string[]).includes(role)) return role as Role
  return LEGACY_ROLE_MAP[role]
}

export function isSuperUser(role: string | undefined | null): boolean {
  const r = normalizeRole(role)
  return r === "SUPER_ADMIN" || r === "OPERATIONS_MANAGER"
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  OPERATIONS_MANAGER: "Operations (IT)",
  FINANCE: "Finance",
  WAREHOUSE_MANAGER: "Warehouse",
  BRANCH_MANAGER: "Branch Manager",
  AGENT: "Agent",
  CUSTOMER: "Customer",
  DRIVER: "Driver",
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN: "Main admin — full visibility of the business and every module",
  OPERATIONS_MANAGER: "Operations & IT — Super Admin privileges: dispatch, fleet, users, integrations, system health",
  FINANCE: "Payments, invoicing, payment approvals, pricing, and financial reports",
  WAREHOUSE_MANAGER: "Warehouse, cargo receiving, consolidation, shelves, SGR station cargo and release",
  BRANCH_MANAGER: "Runs one branch — its shipments, its agents' tasks and emergencies",
  AGENT: "Clearing / forwarding / receiving partner — works the shipments assigned to them",
  CUSTOMER: "Customer portal — book, pay, and track own shipments",
  DRIVER: "Driver — assigned jobs, pickup and delivery proof",
}

export const ROLE_BADGE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  OPERATIONS_MANAGER: "bg-blue-100 text-blue-700",
  FINANCE: "bg-green-100 text-green-700",
  WAREHOUSE_MANAGER: "bg-indigo-100 text-indigo-700",
  BRANCH_MANAGER: "bg-teal-100 text-teal-700",
  AGENT: "bg-orange-100 text-orange-700",
  CUSTOMER: "bg-cyan-100 text-cyan-700",
  DRIVER: "bg-amber-100 text-amber-700",
}

// ------------------------------------------------------------
// Modules — the unit of access. A role either has a module or it doesn't.
// ------------------------------------------------------------
export type NavKey =
  | "dashboard"
  | "analytics"
  | "administration"
  | "shipments"
  | "booking"
  | "packages"
  | "deliveries"
  | "dispatch"
  | "fleet"
  | "tracking"
  | "sgr"
  | "airCargo"
  | "warehouse"
  | "international"
  | "pricing"
  | "payments"
  | "paymentControl"
  | "deliveryRegister"
  | "customers"
  | "support"
  | "exceptions"
  | "blog"
  | "integrations"
  | "whatsapp"
  | "broadcast"
  | "settings"
  | "notifications"
  | "branchWork"

export const ALL_NAV_KEYS: NavKey[] = [
  "dashboard", "analytics", "administration", "shipments", "booking", "packages", "deliveries",
  "dispatch", "fleet", "tracking", "sgr", "airCargo", "warehouse", "international", "pricing",
  "payments", "paymentControl", "deliveryRegister", "customers", "support", "exceptions", "blog",
  "integrations", "whatsapp", "broadcast", "settings", "notifications", "branchWork",
]

export const ROLE_NAV_PERMISSIONS: Record<Role, NavKey[]> = {
  SUPER_ADMIN: ALL_NAV_KEYS,
  // Operations (IT) carries Super Admin privileges.
  OPERATIONS_MANAGER: ALL_NAV_KEYS,
  FINANCE: [
    "dashboard", "analytics", "pricing", "payments", "paymentControl", "customers", "notifications",
  ],
  WAREHOUSE_MANAGER: [
    "dashboard", "shipments", "packages", "deliveries", "tracking", "sgr", "airCargo",
    "warehouse", "deliveryRegister", "exceptions", "notifications", "branchWork",
  ],
  BRANCH_MANAGER: ["dashboard", "shipments", "tracking", "branchWork", "notifications"],
  AGENT: ["dashboard", "shipments", "tracking", "branchWork", "notifications"],
  CUSTOMER: [
    "dashboard", "shipments", "booking", "packages", "deliveries", "tracking", "payments",
    "support", "notifications",
  ],
  DRIVER: ["dashboard", "shipments", "deliveries", "tracking", "notifications"],
}

// /dashboard/* path prefix -> the module that gates it. Longest prefix wins, so a more
// specific path can belong to a different module than its parent.
export const PATH_NAV_KEYS: Array<{ prefix: string; navKey: NavKey }> = [
  { prefix: "/dashboard/analytics", navKey: "analytics" },
  { prefix: "/dashboard/reports", navKey: "analytics" },
  { prefix: "/dashboard/notifications", navKey: "notifications" },
  { prefix: "/dashboard/users", navKey: "administration" },
  { prefix: "/dashboard/roles", navKey: "administration" },
  { prefix: "/dashboard/admin", navKey: "administration" },
  { prefix: "/dashboard/branches", navKey: "administration" },
  { prefix: "/dashboard/branch-work", navKey: "branchWork" },
  { prefix: "/dashboard/logistics", navKey: "administration" },
  { prefix: "/dashboard/orders", navKey: "shipments" },
  { prefix: "/dashboard/shipments", navKey: "shipments" },
  { prefix: "/dashboard/booking", navKey: "booking" },
  { prefix: "/dashboard/packages", navKey: "packages" },
  { prefix: "/dashboard/manifests", navKey: "packages" },
  { prefix: "/dashboard/stations", navKey: "packages" },
  { prefix: "/dashboard/deliveries", navKey: "deliveries" },
  { prefix: "/dashboard/assignments", navKey: "dispatch" },
  { prefix: "/dashboard/dispatch", navKey: "dispatch" },
  { prefix: "/dashboard/trips", navKey: "dispatch" },
  { prefix: "/dashboard/control-tower", navKey: "dispatch" },
  { prefix: "/dashboard/operations", navKey: "dispatch" },
  { prefix: "/dashboard/drivers", navKey: "fleet" },
  { prefix: "/dashboard/vehicles", navKey: "fleet" },
  { prefix: "/dashboard/carriers", navKey: "fleet" },
  { prefix: "/dashboard/fleet", navKey: "fleet" },
  { prefix: "/dashboard/tracking", navKey: "tracking" },
  { prefix: "/dashboard/tracking/drivers", navKey: "fleet" },
  { prefix: "/dashboard/sgr", navKey: "sgr" },
  { prefix: "/dashboard/train-capacity", navKey: "sgr" },
  { prefix: "/dashboard/air-cargo", navKey: "airCargo" },
  { prefix: "/dashboard/warehouse", navKey: "warehouse" },
  { prefix: "/dashboard/shelf-map", navKey: "warehouse" },
  { prefix: "/dashboard/dubai-receiving", navKey: "warehouse" },
  { prefix: "/dashboard/consolidation-boxes", navKey: "warehouse" },
  { prefix: "/dashboard/trip-manifests", navKey: "warehouse" },
  { prefix: "/dashboard/international", navKey: "international" },
  { prefix: "/dashboard/pricing", navKey: "pricing" },
  { prefix: "/dashboard/parcel-categories", navKey: "pricing" },
  { prefix: "/dashboard/parcel-weights", navKey: "pricing" },
  { prefix: "/dashboard/parcel-fares", navKey: "pricing" },
  { prefix: "/dashboard/surge-pricing", navKey: "pricing" },
  { prefix: "/dashboard/zones", navKey: "pricing" },
  { prefix: "/dashboard/payments", navKey: "payments" },
  { prefix: "/dashboard/payment-gateways", navKey: "paymentControl" },
  { prefix: "/dashboard/invoicing", navKey: "paymentControl" },
  { prefix: "/dashboard/payment-approvals", navKey: "paymentControl" },
  { prefix: "/dashboard/delivery-register", navKey: "deliveryRegister" },
  { prefix: "/dashboard/customers", navKey: "customers" },
  { prefix: "/dashboard/support", navKey: "support" },
  { prefix: "/dashboard/exceptions", navKey: "exceptions" },
  { prefix: "/dashboard/blog", navKey: "blog" },
  { prefix: "/dashboard/integrations", navKey: "integrations" },
  { prefix: "/dashboard/whatsapp", navKey: "whatsapp" },
  { prefix: "/dashboard/broadcast", navKey: "broadcast" },
  { prefix: "/dashboard/settings", navKey: "settings" },
]

export function navKeyForPath(pathname: string): NavKey | null {
  let best: { prefix: string; navKey: NavKey } | null = null
  for (const entry of PATH_NAV_KEYS) {
    if (pathname === entry.prefix || pathname.startsWith(entry.prefix + "/")) {
      if (!best || entry.prefix.length > best.prefix.length) best = entry
    }
  }
  return best?.navKey ?? null
}

export function getRoleNavKeys(role: string | undefined | null): NavKey[] {
  const r = normalizeRole(role)
  return r ? ROLE_NAV_PERMISSIONS[r] : ["dashboard"]
}

export function hasNavAccess(role: string | undefined | null, key: NavKey): boolean {
  return getRoleNavKeys(role).includes(key)
}

// Fail closed: a /dashboard page nobody mapped to a module is admin-only, so a page added
// later can never silently open up to Finance / Warehouse / Customer users.
export function canAccessPath(role: string | undefined | null, pathname: string): boolean {
  if (pathname === "/dashboard") return true
  const key = navKeyForPath(pathname)
  if (!key) return isSuperUser(role)
  return hasNavAccess(role, key)
}

// ------------------------------------------------------------
// Sidebar quick access — different for every role, so each person lands one click
// from the three or four things they actually do all day.
// ------------------------------------------------------------
export type QuickIcon =
  | "plus" | "search" | "orders" | "truck" | "van" | "chart" | "users" | "shield" | "approve"
  | "coins" | "receipt" | "box" | "warehouse" | "map" | "alert" | "plug" | "tower" | "message"

export interface QuickLink {
  nameKey: string
  url: string
  icon: QuickIcon
}

export const ROLE_QUICK_ACCESS: Record<Role, QuickLink[]> = {
  SUPER_ADMIN: [
    { nameKey: "qa.controlTower", url: "/dashboard/control-tower", icon: "tower" },
    { nameKey: "qa.reports", url: "/dashboard/reports", icon: "chart" },
    { nameKey: "qa.approvePayments", url: "/dashboard/payment-approvals", icon: "approve" },
    { nameKey: "qa.users", url: "/dashboard/users", icon: "users" },
    { nameKey: "qa.liveShipments", url: "/dashboard/shipments", icon: "truck" },
  ],
  OPERATIONS_MANAGER: [
    { nameKey: "qa.controlTower", url: "/dashboard/control-tower", icon: "tower" },
    { nameKey: "qa.dispatch", url: "/dashboard/dispatch", icon: "truck" },
    { nameKey: "qa.activeDrivers", url: "/dashboard/drivers", icon: "van" },
    { nameKey: "qa.integrations", url: "/dashboard/integrations", icon: "plug" },
    { nameKey: "qa.users", url: "/dashboard/users", icon: "users" },
  ],
  FINANCE: [
    { nameKey: "qa.approvePayments", url: "/dashboard/payment-approvals", icon: "approve" },
    { nameKey: "qa.transactions", url: "/dashboard/payments/transactions", icon: "coins" },
    { nameKey: "qa.invoicing", url: "/dashboard/invoicing", icon: "receipt" },
    { nameKey: "qa.pricingRules", url: "/dashboard/pricing", icon: "coins" },
    { nameKey: "qa.reports", url: "/dashboard/reports", icon: "chart" },
  ],
  BRANCH_MANAGER: [
    { nameKey: "qa.branchShipments", url: "/dashboard/shipments", icon: "truck" },
    { nameKey: "qa.branchTasks", url: "/dashboard/branch-work", icon: "box" },
    { nameKey: "qa.raiseEmergency", url: "/dashboard/branch-work?tab=emergencies", icon: "alert" },
    { nameKey: "qa.trackPackage", url: "/dashboard/tracking", icon: "search" },
  ],
  AGENT: [
    { nameKey: "qa.myTasks", url: "/dashboard/branch-work", icon: "box" },
    { nameKey: "qa.raiseEmergency", url: "/dashboard/branch-work?tab=emergencies", icon: "alert" },
    { nameKey: "qa.trackPackage", url: "/dashboard/tracking", icon: "search" },
  ],
  WAREHOUSE_MANAGER: [
    { nameKey: "qa.receiveCargo", url: "/dashboard/dubai-receiving", icon: "box" },
    { nameKey: "qa.consolidationBoxes", url: "/dashboard/consolidation-boxes", icon: "box" },
    { nameKey: "qa.shelfMap", url: "/dashboard/shelf-map", icon: "warehouse" },
    { nameKey: "qa.tripManifests", url: "/dashboard/trip-manifests", icon: "map" },
    { nameKey: "qa.exceptions", url: "/dashboard/exceptions", icon: "alert" },
  ],
  CUSTOMER: [
    { nameKey: "qa.newShipment", url: "/dashboard/booking", icon: "plus" },
    { nameKey: "qa.trackPackage", url: "/dashboard/tracking", icon: "search" },
    { nameKey: "qa.myOrders", url: "/dashboard/orders", icon: "orders" },
  ],
  DRIVER: [
    { nameKey: "qa.myJobs", url: "/dashboard/shipments", icon: "truck" },
    { nameKey: "qa.trackPackage", url: "/dashboard/tracking", icon: "search" },
  ],
}

export function getRoleQuickAccess(role: string | undefined | null): QuickLink[] {
  const r = normalizeRole(role)
  return r ? ROLE_QUICK_ACCESS[r] : []
}
