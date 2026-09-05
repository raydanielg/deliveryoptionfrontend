export type Role =
  | "SUPER_ADMIN"
  | "OPERATIONS_MANAGER"
  | "SGR_STATION_OFFICER"
  | "DISPATCHER"
  | "FINANCE"
  | "CUSTOMER_SUPPORT"
  | "WAREHOUSE_MANAGER"
  | "CUSTOMS_OFFICER"
  | "PRICING_MANAGER"
  | "REPORT_VIEWER"
  | "CUSTOMER"
  | "DRIVER"

export const ALL_ROLES: Role[] = [
  "SUPER_ADMIN",
  "OPERATIONS_MANAGER",
  "SGR_STATION_OFFICER",
  "DISPATCHER",
  "FINANCE",
  "CUSTOMER_SUPPORT",
  "WAREHOUSE_MANAGER",
  "CUSTOMS_OFFICER",
  "PRICING_MANAGER",
  "REPORT_VIEWER",
  "CUSTOMER",
  "DRIVER",
]

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  OPERATIONS_MANAGER: "Operations Manager",
  SGR_STATION_OFFICER: "SGR Station Officer",
  DISPATCHER: "Dispatcher",
  FINANCE: "Finance",
  CUSTOMER_SUPPORT: "Customer Support",
  WAREHOUSE_MANAGER: "Warehouse Manager",
  CUSTOMS_OFFICER: "Customs Officer",
  PRICING_MANAGER: "Pricing Manager",
  REPORT_VIEWER: "Report Viewer",
  CUSTOMER: "Customer",
  DRIVER: "Driver",
}

export const ROLE_BADGE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  OPERATIONS_MANAGER: "bg-blue-100 text-blue-700",
  SGR_STATION_OFFICER: "bg-emerald-100 text-emerald-700",
  DISPATCHER: "bg-purple-100 text-purple-700",
  FINANCE: "bg-green-100 text-green-700",
  CUSTOMER_SUPPORT: "bg-orange-100 text-orange-700",
  WAREHOUSE_MANAGER: "bg-indigo-100 text-indigo-700",
  CUSTOMS_OFFICER: "bg-teal-100 text-teal-700",
  PRICING_MANAGER: "bg-pink-100 text-pink-700",
  REPORT_VIEWER: "bg-gray-100 text-gray-700",
  CUSTOMER: "bg-cyan-100 text-cyan-700",
  DRIVER: "bg-amber-100 text-amber-700",
}

type NavKey =
  | "dashboard"
  | "administration"
  | "operations"
  | "sgr"
  | "airCargo"
  | "warehouse"
  | "controlTower"
  | "tracking"
  | "fleet"
  | "pricing"
  | "parcelManagement"
  | "international"
  | "payments"
  | "customers"
  | "support"
  | "blog"
  | "exceptions"
  | "settings"

const ALL_NAV_KEYS: NavKey[] = [
  "dashboard",
  "administration",
  "operations",
  "sgr",
  "airCargo",
  "warehouse",
  "controlTower",
  "tracking",
  "fleet",
  "pricing",
  "parcelManagement",
  "international",
  "payments",
  "customers",
  "support",
  "blog",
  "exceptions",
  "settings",
]

export const ROLE_NAV_PERMISSIONS: Record<Role, NavKey[]> = {
  SUPER_ADMIN: ALL_NAV_KEYS,
  OPERATIONS_MANAGER: [
    "dashboard",
    "operations",
    "sgr",
    "airCargo",
    "warehouse",
    "controlTower",
    "tracking",
    "fleet",
    "pricing",
    "parcelManagement",
    "international",
    "customers",
    "support",
    "exceptions",
    "settings",
  ],
  DISPATCHER: [
    "dashboard",
    "operations",
    "sgr",
    "airCargo",
    "controlTower",
    "tracking",
    "fleet",
    "exceptions",
  ],
  FINANCE: [
    "dashboard",
    "pricing",
    "payments",
    "customers",
    "settings",
  ],
  CUSTOMER_SUPPORT: [
    "dashboard",
    "operations",
    "tracking",
    "support",
    "exceptions",
    "customers",
  ],
  WAREHOUSE_MANAGER: [
    "dashboard",
    "warehouse",
    "operations",
    "tracking",
  ],
  CUSTOMS_OFFICER: [
    "dashboard",
    "international",
    "operations",
    "tracking",
  ],
  SGR_STATION_OFFICER: [
    "dashboard",
    "sgr",
    "operations",
    "tracking",
  ],
  PRICING_MANAGER: [
    "dashboard",
    "pricing",
    "parcelManagement",
    "operations",
  ],
  REPORT_VIEWER: [
    "dashboard",
  ],
  CUSTOMER: [
    "dashboard",
    "operations",
    "tracking",
    "payments",
    "support",
  ],
  DRIVER: [
    "dashboard",
    "operations",
    "tracking",
  ],
}

export function getRoleNavKeys(role: string | undefined | null): NavKey[] {
  if (!role) return ["dashboard"]
  const r = role as Role
  return ROLE_NAV_PERMISSIONS[r] ?? ["dashboard"]
}

export function hasNavAccess(role: string | undefined | null, key: NavKey): boolean {
  return getRoleNavKeys(role).includes(key)
}
