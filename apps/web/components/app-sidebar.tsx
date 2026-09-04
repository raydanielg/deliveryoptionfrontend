"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { useAuth } from "@/lib/use-auth"
import { getRoleNavKeys, ROLE_LABELS, ROLE_BADGE_COLORS } from "@/lib/role-nav"

/* ---------- Customer-specific nav items ---------- */
const CUSTOMER_NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    isActive: true,
    items: [
      { title: "Overview", url: "/dashboard" },
    ],
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    items: [],
  },
  {
    title: "Shipments",
    url: "/dashboard/shipments",
    items: [
      { title: "My Shipments", url: "/dashboard/shipments" },
      { title: "New Shipment", url: "/dashboard/shipments/new" },
    ],
  },
  {
    title: "Packages",
    url: "/dashboard/packages",
    items: [],
  },
  {
    title: "Deliveries",
    url: "/dashboard/deliveries",
    items: [],
  },
  {
    title: "Tracking",
    url: "/dashboard/tracking",
    items: [
      { title: "Track Shipment", url: "/dashboard/tracking" },
    ],
  },
  {
    title: "Payments",
    url: "/dashboard/payments",
    items: [
      { title: "My Transactions", url: "/dashboard/payments" },
      { title: "Invoices", url: "/dashboard/payments/invoices" },
    ],
  },
  {
    title: "Support",
    url: "/dashboard/support",
    items: [
      { title: "Help Center", url: "/dashboard/support" },
      { title: "Contact Us", url: "/dashboard/support/tickets" },
    ],
  },
]

const CUSTOMER_QUICK_ACCESS = [
  { name: "New Shipment", url: "/dashboard/shipments/new" },
  { name: "Track Package", url: "/dashboard/tracking" },
  { name: "My Orders", url: "/dashboard/orders" },
]

/* ---------- Admin nav items (with icons) ---------- */
const ALL_NAV_ITEMS = [
  {
    title: "Dashboard",
    navKey: "dashboard",
    url: "/dashboard",
    isActive: true,
    items: [
      { title: "Overview", url: "/dashboard" },
      { title: "Analytics", url: "/dashboard/analytics" },
      { title: "Reports", url: "/dashboard/reports" },
    ],
  },
  {
    title: "Administration",
    navKey: "administration",
    url: "/dashboard/admin",
    items: [
      { title: "Users", url: "/dashboard/users" },
      { title: "Roles & Permissions", url: "/dashboard/roles" },
    ],
  },
  {
    title: "Operations",
    navKey: "operations",
    url: "/dashboard/operations",
    items: [
      { title: "Orders", url: "/dashboard/orders" },
      { title: "Shipments", url: "/dashboard/shipments" },
      { title: "Packages", url: "/dashboard/packages" },
      { title: "Deliveries", url: "/dashboard/deliveries" },
      { title: "Assignments", url: "/dashboard/assignments" },
      { title: "Manifests", url: "/dashboard/manifests" },
      { title: "Stations", url: "/dashboard/stations" },
    ],
  },
  {
    title: "SGR Parcel Service",
    navKey: "sgr",
    url: "/dashboard/sgr",
    items: [
      { title: "SGR Shipments", url: "/dashboard/sgr" },
      { title: "Stations", url: "/dashboard/sgr/stations" },
      { title: "Dispatch & Manifests", url: "/dashboard/sgr/dispatch" },
      { title: "Capacity", url: "/dashboard/sgr/capacity" },
    ],
  },
  {
    title: "Air Cargo",
    navKey: "airCargo",
    url: "/dashboard/air-cargo",
    items: [
      { title: "Air Cargo Shipments", url: "/dashboard/air-cargo" },
      { title: "Flight Dispatch", url: "/dashboard/air-cargo/dispatch" },
      { title: "Airports", url: "/dashboard/air-cargo/airports" },
    ],
  },
  {
    title: "Warehouse",
    navKey: "warehouse",
    url: "/dashboard/warehouse",
    items: [
      { title: "Inventory", url: "/dashboard/warehouse" },
      { title: "Receiving", url: "/dashboard/warehouse/receiving" },
      { title: "Consolidation", url: "/dashboard/warehouse/consolidation" },
    ],
  },
  {
    title: "Control Tower",
    navKey: "controlTower",
    url: "/dashboard/control-tower",
    items: [
      { title: "Overview", url: "/dashboard/control-tower" },
      { title: "By Mode", url: "/dashboard/control-tower/modes" },
      { title: "Exceptions", url: "/dashboard/control-tower/exceptions" },
    ],
  },
  {
    title: "Tracking",
    navKey: "tracking",
    url: "/dashboard/tracking",
    items: [
      { title: "Live Map", url: "/dashboard/tracking/map" },
      { title: "Tracking Events", url: "/dashboard/tracking/events" },
      { title: "Driver Locations", url: "/dashboard/tracking/drivers" },
    ],
  },
  {
    title: "Fleet",
    navKey: "fleet",
    url: "/dashboard/fleet",
    items: [
      { title: "Drivers", url: "/dashboard/drivers" },
      { title: "Vehicles", url: "/dashboard/vehicles" },
      { title: "Carriers", url: "/dashboard/carriers" },
    ],
  },
  {
    title: "Pricing",
    navKey: "pricing",
    url: "/dashboard/pricing",
    items: [
      { title: "Pricing Rules", url: "/dashboard/pricing/rules" },
      { title: "Routes", url: "/dashboard/pricing/routes" },
      { title: "Zones", url: "/dashboard/pricing/zones" },
      { title: "Surcharges", url: "/dashboard/pricing/surcharges" },
      { title: "Mode Pricing", url: "/dashboard/pricing/mode-config" },
      { title: "Quotes", url: "/dashboard/pricing/quotes" },
    ],
  },
  {
    title: "Parcel Management",
    navKey: "parcelManagement",
    url: "/dashboard/parcel-categories",
    items: [
      { title: "Categories", url: "/dashboard/parcel-categories" },
      { title: "Weight Tiers", url: "/dashboard/parcel-weights" },
      { title: "Fares", url: "/dashboard/parcel-fares" },
      { title: "Surge Pricing", url: "/dashboard/surge-pricing" },
      { title: "Zones", url: "/dashboard/zones" },
    ],
  },
  {
    title: "International",
    navKey: "international",
    url: "/dashboard/international",
    items: [
      { title: "Customs", url: "/dashboard/international/customs" },
      { title: "Documents", url: "/dashboard/international/documents" },
      { title: "Int'l Shipments", url: "/dashboard/international/shipments" },
    ],
  },
  {
    title: "Payments",
    navKey: "payments",
    url: "/dashboard/payments",
    items: [
      { title: "Transactions", url: "/dashboard/payments/transactions" },
      { title: "Invoices", url: "/dashboard/payments/invoices" },
      { title: "Refunds", url: "/dashboard/payments/refunds" },
      { title: "Gateways", url: "/dashboard/payment-gateways" },
    ],
  },
  {
    title: "Customers",
    navKey: "customers",
    url: "/dashboard/customers",
    items: [
      { title: "All Customers", url: "/dashboard/customers" },
      { title: "Corporate Accounts", url: "/dashboard/customers/corporate" },
    ],
  },
  {
    title: "Support",
    navKey: "support",
    url: "/dashboard/support",
    items: [
      { title: "Tickets", url: "/dashboard/support/tickets" },
      { title: "Ratings", url: "/dashboard/support/ratings" },
    ],
  },
  {
    title: "Blog",
    navKey: "blog",
    url: "/dashboard/blog",
    items: [
      { title: "All Posts", url: "/dashboard/blog" },
      { title: "Categories", url: "/dashboard/blog/categories" },
    ],
  },
  {
    title: "Exceptions",
    navKey: "exceptions",
    url: "/dashboard/exceptions",
    items: [
      { title: "All Exceptions", url: "/dashboard/exceptions" },
      { title: "Returns", url: "/dashboard/exceptions/returns" },
      { title: "Notifications", url: "/dashboard/notifications" },
    ],
  },
  {
    title: "Settings",
    navKey: "settings",
    url: "/dashboard/settings",
    items: [
      { title: "General", url: "/dashboard/settings" },
      { title: "Map & API Keys", url: "/dashboard/settings/map" },
      { title: "Team", url: "/dashboard/settings/team" },
      { title: "Notifications", url: "/dashboard/settings/notifications" },
    ],
  },
]

const ADMIN_QUICK_ACCESS = [
  { name: "Active Drivers", url: "/dashboard/drivers" },
  { name: "Live Shipments", url: "/dashboard/shipments" },
  { name: "Analytics", url: "/dashboard/analytics" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const isCustomer = user?.role === "CUSTOMER"

  const sidebarUser = {
    name: user?.name || "User",
    email: user?.email || "user@xerindelivery.com",
    avatar: user?.avatar || "",
  }

  const roleLabel = user?.role ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] : null
  const roleColor = user?.role ? ROLE_BADGE_COLORS[user.role as keyof typeof ROLE_BADGE_COLORS] : null

  let navItems: any[]
  let quickAccess: { name: string; url: string }[]

  if (isCustomer) {
    navItems = CUSTOMER_NAV_ITEMS
    quickAccess = CUSTOMER_QUICK_ACCESS
  } else {
    const allowedKeys = getRoleNavKeys(user?.role)
    const filteredNav = ALL_NAV_ITEMS.filter((item) => allowedKeys.includes(item.navKey as never))
    navItems = filteredNav.map(({ navKey, ...rest }) => rest)
    quickAccess = ADMIN_QUICK_ACCESS
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              Xerin <span className="text-primary">Express</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Logistics &amp; Delivery</span>
          </div>
        </div>
        {roleLabel && (
          <div className="px-4 pb-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} label={isCustomer ? "Menu" : "Platform"} />
        <NavProjects projects={quickAccess} label="Quick Access" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
