"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { TruckIcon, BikeIcon, Store02Icon, DashboardSquare02Icon, Package02Icon, MapIcon, Settings05Icon, UsersIcon, ChartIcon, Route02Icon, BoxIcon, UserGroupIcon, CoinsIcon, File02Icon, Globe02Icon, CustomerService01Icon, PackageReceiveIcon, AlertCircleIcon, BellIcon, BloggerIcon, Train01Icon, Airplane01Icon, WarehouseIcon, Radar02Icon, ContainerIcon, CallIcon } from "@hugeicons/core-free-icons"
import Image from "next/image"

const data = {
  teams: [
    {
      name: "Xerin Delivery Express",
      logo: (
        <Image src="/assets/m%20app2.png" alt="Xerin" width={20} height={20} className="rounded-sm object-cover" />
      ),
      plan: "Admin",
    },
    {
      name: "Operations",
      logo: (
        <HugeiconsIcon icon={Route02Icon} strokeWidth={2} />
      ),
      plan: "Manager",
    },
    {
      name: "Fleet Hub",
      logo: (
        <HugeiconsIcon icon={TruckIcon} strokeWidth={2} />
      ),
      plan: "Staff",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
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
      url: "/dashboard/sgr",
      icon: (
        <HugeiconsIcon icon={CallIcon} strokeWidth={2} />
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
          title: "Quotes",
          url: "/dashboard/pricing/quotes",
        },
      ],
    },
    {
      title: "Parcel Management",
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
  ],
  projects: [
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState({
    name: "User",
    email: "user@xerindelivery.com",
    avatar: "",
  })

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setUser({
            name: parsed.name || "User",
            email: parsed.email || "",
            avatar: parsed.avatar || "",
          })
        } catch {}
      }
    }
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
