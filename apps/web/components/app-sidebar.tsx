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
import { getRoleNavKeys } from "@/lib/role-nav"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSpeed01Icon,
  UserGroupIcon,
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
  HeadphonesIcon,
  LogsIcon,
  AlertCircleIcon,
  Settings02Icon,
  DeliverySentIcon,
  Search01Icon,
  PlusIcon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons"

/* ---------- Customer-specific nav items ---------- */
const CUSTOMER_NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    isActive: true,
    icon: <HugeiconsIcon icon={DashboardSpeed01Icon} className="size-4" />,
    items: [
      { title: "Overview", url: "/dashboard" },
    ],
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: <HugeiconsIcon icon={ShoppingBag01Icon} className="size-4" />,
    items: [],
  },
  {
    title: "Shipments",
    url: "/dashboard/shipments",
    icon: <HugeiconsIcon icon={Package02Icon} className="size-4" />,
    items: [
      { title: "My Shipments", url: "/dashboard/shipments" },
      { title: "New Shipment", url: "/dashboard/shipments/new" },
    ],
  },
  {
    title: "Packages",
    url: "/dashboard/packages",
    icon: <HugeiconsIcon icon={Package02Icon} className="size-4" />,
    items: [],
  },
  {
    title: "Deliveries",
    url: "/dashboard/deliveries",
    icon: <HugeiconsIcon icon={DeliverySentIcon} className="size-4" />,
    items: [],
  },
  {
    title: "Tracking",
    url: "/dashboard/tracking",
    icon: <HugeiconsIcon icon={Location01Icon} className="size-4" />,
    items: [
      { title: "Track Shipment", url: "/dashboard/tracking" },
    ],
  },
  {
    title: "Payments",
    url: "/dashboard/payments",
    icon: <HugeiconsIcon icon={CreditCardIcon} className="size-4" />,
    items: [
      { title: "My Transactions", url: "/dashboard/payments" },
      { title: "Invoices", url: "/dashboard/payments/invoices" },
    ],
  },
  {
    title: "Support",
    url: "/dashboard/support",
    icon: <HugeiconsIcon icon={HeadphonesIcon} className="size-4" />,
    items: [
      { title: "Help Center", url: "/dashboard/support" },
      { title: "Contact Us", url: "/dashboard/support/tickets" },
    ],
  },
]

const CUSTOMER_QUICK_ACCESS = [
  { name: "New Shipment", url: "/dashboard/shipments/new", icon: <HugeiconsIcon icon={PlusIcon} className="size-4" /> },
  { name: "Track Package", url: "/dashboard/tracking", icon: <HugeiconsIcon icon={Search01Icon} className="size-4" /> },
  { name: "My Orders", url: "/dashboard/orders", icon: <HugeiconsIcon icon={ShoppingBag01Icon} className="size-4" /> },
]

/* ---------- Admin nav items (with icons) ---------- */
const ALL_NAV_ITEMS = [
  {
    title: "Dashboard",
    navKey: "dashboard",
    url: "/dashboard",
    isActive: true,
    icon: <HugeiconsIcon icon={DashboardSpeed01Icon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={UserGroupIcon} className="size-4" />,
    items: [
      { title: "Users", url: "/dashboard/users" },
      { title: "Roles & Permissions", url: "/dashboard/roles" },
    ],
  },
  {
    title: "Operations",
    navKey: "operations",
    url: "/dashboard/operations",
    icon: <HugeiconsIcon icon={TruckIcon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={TrainIcon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={AirplaneIcon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={WarehouseIcon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={Radar01Icon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={Location01Icon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={VanIcon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={Dollar01Icon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={Package02Icon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={Globe02Icon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={CreditCardIcon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={CustomerService01Icon} className="size-4" />,
    items: [
      { title: "All Customers", url: "/dashboard/customers" },
      { title: "Corporate Accounts", url: "/dashboard/customers/corporate" },
    ],
  },
  {
    title: "Support",
    navKey: "support",
    url: "/dashboard/support",
    icon: <HugeiconsIcon icon={HeadphonesIcon} className="size-4" />,
    items: [
      { title: "Tickets", url: "/dashboard/support/tickets" },
      { title: "Ratings", url: "/dashboard/support/ratings" },
    ],
  },
  {
    title: "Blog",
    navKey: "blog",
    url: "/dashboard/blog",
    icon: <HugeiconsIcon icon={LogsIcon} className="size-4" />,
    items: [
      { title: "All Posts", url: "/dashboard/blog" },
      { title: "Categories", url: "/dashboard/blog/categories" },
    ],
  },
  {
    title: "Exceptions",
    navKey: "exceptions",
    url: "/dashboard/exceptions",
    icon: <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />,
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
    icon: <HugeiconsIcon icon={Settings02Icon} className="size-4" />,
    items: [
      { title: "General", url: "/dashboard/settings" },
      { title: "Map & API Keys", url: "/dashboard/settings/map" },
      { title: "Team", url: "/dashboard/settings/team" },
      { title: "Notifications", url: "/dashboard/settings/notifications" },
    ],
  },
]

const ADMIN_QUICK_ACCESS = [
  { name: "Active Drivers", url: "/dashboard/drivers", icon: <HugeiconsIcon icon={VanIcon} className="size-4" /> },
  { name: "Live Shipments", url: "/dashboard/shipments", icon: <HugeiconsIcon icon={TruckIcon} className="size-4" /> },
  { name: "Analytics", url: "/dashboard/analytics", icon: <HugeiconsIcon icon={DashboardSpeed01Icon} className="size-4" /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const isCustomer = user?.role === "CUSTOMER"

  const sidebarUser = {
    name: user?.name || "User",
    email: user?.email || "user@xerinexpress.com",
    avatar: user?.avatar || "",
  }

  let navItems: any[]
  let quickAccess: { name: string; url: string; icon?: React.ReactNode }[]

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
        {/* Collapsed: show favicon logo only */}
        <div className="hidden size-8 items-center justify-center group-data-[collapsible=icon]:flex">
          <img src="/favicon.ico" alt="Xerin Express" className="size-7 rounded-md" />
        </div>
        {/* Expanded: show full logo with text */}
        <div className="flex h-16 items-center gap-3 px-4 group-data-[collapsible=icon]:hidden">
          <img src="/favicon.ico" alt="Xerin Express" className="size-8 rounded-md" />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              Xerin <span className="text-primary">Express</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Logistics &amp; Delivery</span>
          </div>
        </div>
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
