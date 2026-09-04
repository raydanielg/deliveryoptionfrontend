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
import { HugeiconsIcon } from "@hugeicons/react"
import { TruckIcon, BikeIcon, Store02Icon, DashboardSquare02Icon, Package02Icon, MapIcon, Settings05Icon, UsersIcon, ChartIcon, Route02Icon, BoxIcon, UserGroupIcon, CoinsIcon, File02Icon, Globe02Icon, CustomerService01Icon, PackageReceiveIcon, AlertCircleIcon, BellIcon, BloggerIcon, Train01Icon, Airplane01Icon, WarehouseIcon, Radar02Icon, ContainerIcon, CallIcon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/lib/use-auth"
import { getRoleNavKeys, ROLE_LABELS, ROLE_BADGE_COLORS } from "@/lib/role-nav"

const ALL_NAV_ITEMS = [
  {
    title: "Dashboard",
    navKey: "dashboard",
    url: "/dashboard",
    icon: (
      <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={2} />
    ),
    isActive: true,
    items: [
      {
        title: "Overview",
        url: "/dashboard",
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
      },
      {
        title: "Reports",
        url: "/dashboard/reports",
      },
    ],
  },
  {
    title: "Administration",
    navKey: "administration",
    url: "/dashboard/admin",
    icon: (
      <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Users",
        url: "/dashboard/users",
      },
      {
        title: "Roles & Permissions",
        url: "/dashboard/roles",
      },
    ],
  },
  {
    title: "Operations",
    navKey: "operations",
    url: "/dashboard/operations",
    icon: (
      <HugeiconsIcon icon={Package02Icon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Orders",
        url: "/dashboard/orders",
      },
      {
        title: "Shipments",
        url: "/dashboard/shipments",
      },
      {
        title: "Packages",
        url: "/dashboard/packages",
      },
      {
        title: "Deliveries",
        url: "/dashboard/deliveries",
      },
      {
        title: "Assignments",
        url: "/dashboard/assignments",
      },
      {
        title: "Manifests",
        url: "/dashboard/manifests",
      },
      {
        title: "Stations",
        url: "/dashboard/stations",
      },
    ],
  },
  {
    title: "SGR Parcel Service",
    navKey: "sgr",
    url: "/dashboard/sgr",
    icon: (
      <HugeiconsIcon icon={Train01Icon} strokeWidth={2} />
    ),
    items: [
      {
        title: "SGR Shipments",
        url: "/dashboard/sgr",
      },
      {
        title: "Stations",
        url: "/dashboard/sgr/stations",
      },
      {
        title: "Dispatch & Manifests",
        url: "/dashboard/sgr/dispatch",
      },
      {
        title: "Capacity",
        url: "/dashboard/sgr/capacity",
      },
    ],
  },
  {
    title: "Air Cargo",
    navKey: "airCargo",
    url: "/dashboard/air-cargo",
    icon: (
      <HugeiconsIcon icon={Airplane01Icon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Air Cargo Shipments",
        url: "/dashboard/air-cargo",
      },
      {
        title: "Flight Dispatch",
        url: "/dashboard/air-cargo/dispatch",
      },
      {
        title: "Airports",
        url: "/dashboard/air-cargo/airports",
      },
    ],
  },
  {
    title: "Warehouse",
    navKey: "warehouse",
    url: "/dashboard/warehouse",
    icon: (
      <HugeiconsIcon icon={WarehouseIcon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Inventory",
        url: "/dashboard/warehouse",
      },
      {
        title: "Receiving",
        url: "/dashboard/warehouse/receiving",
      },
      {
        title: "Consolidation",
        url: "/dashboard/warehouse/consolidation",
      },
    ],
  },
  {
    title: "Control Tower",
    navKey: "controlTower",
    url: "/dashboard/control-tower",
    icon: (
      <HugeiconsIcon icon={Radar02Icon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Overview",
        url: "/dashboard/control-tower",
      },
      {
        title: "By Mode",
        url: "/dashboard/control-tower/modes",
      },
      {
        title: "Exceptions",
        url: "/dashboard/control-tower/exceptions",
      },
    ],
  },
  {
    title: "Tracking",
    navKey: "tracking",
    url: "/dashboard/tracking",
    icon: (
      <HugeiconsIcon icon={MapIcon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Live Map",
        url: "/dashboard/tracking/map",
      },
      {
        title: "Tracking Events",
        url: "/dashboard/tracking/events",
      },
      {
        title: "Driver Locations",
        url: "/dashboard/tracking/drivers",
      },
    ],
  },
  {
    title: "Fleet",
    navKey: "fleet",
    url: "/dashboard/fleet",
    icon: (
      <HugeiconsIcon icon={TruckIcon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Drivers",
        url: "/dashboard/drivers",
      },
      {
        title: "Vehicles",
        url: "/dashboard/vehicles",
      },
      {
        title: "Carriers",
        url: "/dashboard/carriers",
      },
    ],
  },
  {
    title: "Pricing",
    navKey: "pricing",
    url: "/dashboard/pricing",
    icon: (
      <HugeiconsIcon icon={CoinsIcon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Pricing Rules",
        url: "/dashboard/pricing/rules",
      },
      {
        title: "Routes",
        url: "/dashboard/pricing/routes",
      },
      {
        title: "Zones",
        url: "/dashboard/pricing/zones",
      },
      {
        title: "Surcharges",
        url: "/dashboard/pricing/surcharges",
      },
      {
        title: "Mode Pricing",
        url: "/dashboard/pricing/mode-config",
      },
      {
        title: "Quotes",
        url: "/dashboard/pricing/quotes",
      },
    ],
  },
  {
    title: "Parcel Management",
    navKey: "parcelManagement",
    url: "/dashboard/parcel-categories",
    icon: (
      <HugeiconsIcon icon={PackageReceiveIcon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Categories",
        url: "/dashboard/parcel-categories",
      },
      {
        title: "Weight Tiers",
        url: "/dashboard/parcel-weights",
      },
      {
        title: "Fares",
        url: "/dashboard/parcel-fares",
      },
      {
        title: "Surge Pricing",
        url: "/dashboard/surge-pricing",
      },
      {
        title: "Zones",
        url: "/dashboard/zones",
      },
    ],
  },
  {
    title: "International",
    navKey: "international",
    url: "/dashboard/international",
    icon: (
      <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Customs",
        url: "/dashboard/international/customs",
      },
      {
        title: "Documents",
        url: "/dashboard/international/documents",
      },
      {
        title: "Int'l Shipments",
        url: "/dashboard/international/shipments",
      },
    ],
  },
  {
    title: "Payments",
    navKey: "payments",
    url: "/dashboard/payments",
    icon: (
      <HugeiconsIcon icon={File02Icon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Transactions",
        url: "/dashboard/payments/transactions",
      },
      {
        title: "Invoices",
        url: "/dashboard/payments/invoices",
      },
      {
        title: "Refunds",
        url: "/dashboard/payments/refunds",
      },
      {
        title: "Gateways",
        url: "/dashboard/payment-gateways",
      },
    ],
  },
  {
    title: "Customers",
    navKey: "customers",
    url: "/dashboard/customers",
    icon: (
      <HugeiconsIcon icon={UsersIcon} strokeWidth={2} />
    ),
    items: [
      {
        title: "All Customers",
        url: "/dashboard/customers",
      },
      {
        title: "Corporate Accounts",
        url: "/dashboard/customers/corporate",
      },
    ],
  },
  {
    title: "Support",
    navKey: "support",
    url: "/dashboard/support",
    icon: (
      <HugeiconsIcon icon={CustomerService01Icon} strokeWidth={2} />
    ),
    items: [
      {
        title: "Tickets",
        url: "/dashboard/support/tickets",
      },
      {
        title: "Ratings",
        url: "/dashboard/support/ratings",
      },
    ],
  },
  {
    title: "Blog",
    navKey: "blog",
    url: "/dashboard/blog",
    icon: (
      <HugeiconsIcon icon={BloggerIcon} strokeWidth={2} />
    ),
    items: [
      {
        title: "All Posts",
        url: "/dashboard/blog",
      },
      {
        title: "Categories",
        url: "/dashboard/blog/categories",
      },
    ],
  },
  {
    title: "Exceptions",
    navKey: "exceptions",
    url: "/dashboard/exceptions",
    icon: (
      <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
    ),
    items: [
      {
        title: "All Exceptions",
        url: "/dashboard/exceptions",
      },
      {
        title: "Returns",
        url: "/dashboard/exceptions/returns",
      },
      {
        title: "Notifications",
        url: "/dashboard/notifications",
      },
    ],
  },
  {
    title: "Settings",
    navKey: "settings",
    url: "/dashboard/settings",
    icon: (
      <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />
    ),
    items: [
      {
        title: "General",
        url: "/dashboard/settings",
      },
      {
        title: "Map & API Keys",
        url: "/dashboard/settings/map",
      },
      {
        title: "Team",
        url: "/dashboard/settings/team",
      },
      {
        title: "Notifications",
        url: "/dashboard/settings/notifications",
      },
    ],
  },
]

const ALL_PROJECTS = [
  {
    name: "Active Drivers",
    url: "/dashboard/drivers",
    icon: (
      <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
    ),
  },
  {
    name: "Live Shipments",
    url: "/dashboard/shipments",
    icon: (
      <HugeiconsIcon icon={BoxIcon} strokeWidth={2} />
    ),
  },
  {
    name: "Analytics",
    url: "/dashboard/analytics",
    icon: (
      <HugeiconsIcon icon={ChartIcon} strokeWidth={2} />
    ),
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const allowedKeys = getRoleNavKeys(user?.role)
  const filteredNav = ALL_NAV_ITEMS.filter((item) => allowedKeys.includes(item.navKey as never))
  const navItems = filteredNav.map(({ navKey, ...rest }) => rest)

  const sidebarUser = {
    name: user?.name || "User",
    email: user?.email || "user@xerindelivery.com",
    avatar: user?.avatar || "",
  }

  const roleLabel = user?.role ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] : null
  const roleColor = user?.role ? ROLE_BADGE_COLORS[user.role as keyof typeof ROLE_BADGE_COLORS] : null

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
        <NavMain items={navItems} />
        <NavProjects projects={ALL_PROJECTS} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
