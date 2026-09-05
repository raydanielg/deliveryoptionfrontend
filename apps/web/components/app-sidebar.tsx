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
import { useLang } from "@/lib/i18n"
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
    titleKey: "nav.dashboard",
    url: "/dashboard",
    isActive: true,
    icon: <HugeiconsIcon icon={DashboardSpeed01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.overview", url: "/dashboard" },
    ],
  },
  {
    titleKey: "nav.orders",
    url: "/dashboard/orders",
    icon: <HugeiconsIcon icon={ShoppingBag01Icon} className="size-4" />,
    items: [],
  },
  {
    titleKey: "nav.shipments",
    url: "/dashboard/shipments",
    icon: <HugeiconsIcon icon={Package02Icon} className="size-4" />,
    items: [
      { titleKey: "nav.myShipments", url: "/dashboard/shipments" },
      { titleKey: "nav.newShipment", url: "/dashboard/booking" },
    ],
  },
  {
    titleKey: "nav.packages",
    url: "/dashboard/packages",
    icon: <HugeiconsIcon icon={Package02Icon} className="size-4" />,
    items: [],
  },
  {
    titleKey: "nav.deliveries",
    url: "/dashboard/deliveries",
    icon: <HugeiconsIcon icon={DeliverySentIcon} className="size-4" />,
    items: [],
  },
  {
    titleKey: "nav.tracking",
    url: "/dashboard/tracking",
    icon: <HugeiconsIcon icon={Location01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.trackShipment", url: "/dashboard/tracking" },
    ],
  },
  {
    titleKey: "nav.payments",
    url: "/dashboard/payments",
    icon: <HugeiconsIcon icon={CreditCardIcon} className="size-4" />,
    items: [
      { titleKey: "nav.myTransactions", url: "/dashboard/payments" },
      { titleKey: "nav.invoices", url: "/dashboard/payments/invoices" },
    ],
  },
  {
    titleKey: "nav.support",
    url: "/dashboard/support",
    icon: <HugeiconsIcon icon={HeadphonesIcon} className="size-4" />,
    items: [
      { titleKey: "nav.helpCenter", url: "/dashboard/support" },
      { titleKey: "nav.contactUs", url: "/dashboard/support/tickets" },
    ],
  },
]

const CUSTOMER_QUICK_ACCESS = [
  { nameKey: "qa.newShipment", url: "/dashboard/booking", icon: <HugeiconsIcon icon={PlusIcon} className="size-4" /> },
  { nameKey: "qa.trackPackage", url: "/dashboard/tracking", icon: <HugeiconsIcon icon={Search01Icon} className="size-4" /> },
  { nameKey: "qa.myOrders", url: "/dashboard/orders", icon: <HugeiconsIcon icon={ShoppingBag01Icon} className="size-4" /> },
]

/* ---------- Admin nav items (with icons) ---------- */
const ALL_NAV_ITEMS = [
  {
    titleKey: "nav.dashboard",
    navKey: "dashboard",
    url: "/dashboard",
    isActive: true,
    icon: <HugeiconsIcon icon={DashboardSpeed01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.overview", url: "/dashboard" },
      { titleKey: "nav.analytics", url: "/dashboard/analytics" },
      { titleKey: "nav.reports", url: "/dashboard/reports" },
    ],
  },
  {
    titleKey: "nav.administration",
    navKey: "administration",
    url: "/dashboard/admin",
    icon: <HugeiconsIcon icon={UserGroupIcon} className="size-4" />,
    items: [
      { titleKey: "nav.users", url: "/dashboard/users" },
      { titleKey: "nav.rolesPermissions", url: "/dashboard/roles" },
    ],
  },
  {
    titleKey: "nav.operations",
    navKey: "operations",
    url: "/dashboard/operations",
    icon: <HugeiconsIcon icon={TruckIcon} className="size-4" />,
    items: [
      { titleKey: "nav.allOrders", url: "/dashboard/orders" },
      { titleKey: "nav.allShipments", url: "/dashboard/shipments" },
      { titleKey: "nav.allPackages", url: "/dashboard/packages" },
      { titleKey: "nav.allDeliveries", url: "/dashboard/deliveries" },
      { titleKey: "nav.assignments", url: "/dashboard/assignments" },
      { titleKey: "nav.manifests", url: "/dashboard/manifests" },
      { titleKey: "nav.stations", url: "/dashboard/stations" },
    ],
  },
  {
    titleKey: "nav.sgr",
    navKey: "sgr",
    url: "/dashboard/sgr",
    icon: <HugeiconsIcon icon={TrainIcon} className="size-4" />,
    items: [
      { titleKey: "nav.sgrShipments", url: "/dashboard/sgr" },
      { titleKey: "nav.sgrStations", url: "/dashboard/sgr/stations" },
      { titleKey: "nav.dispatchManifests", url: "/dashboard/sgr/dispatch" },
      { titleKey: "nav.capacity", url: "/dashboard/sgr/capacity" },
      { titleKey: "nav.trainCapacity", url: "/dashboard/train-capacity" },
    ],
  },
  {
    titleKey: "nav.airCargo",
    navKey: "airCargo",
    url: "/dashboard/air-cargo",
    icon: <HugeiconsIcon icon={AirplaneIcon} className="size-4" />,
    items: [
      { titleKey: "nav.airCargoShipments", url: "/dashboard/air-cargo" },
      { titleKey: "nav.flightDispatch", url: "/dashboard/air-cargo/dispatch" },
      { titleKey: "nav.airports", url: "/dashboard/air-cargo/airports" },
    ],
  },
  {
    titleKey: "nav.warehouse",
    navKey: "warehouse",
    url: "/dashboard/warehouse",
    icon: <HugeiconsIcon icon={WarehouseIcon} className="size-4" />,
    items: [
      { titleKey: "nav.inventory", url: "/dashboard/warehouse" },
      { titleKey: "nav.receiving", url: "/dashboard/warehouse/receiving" },
      { titleKey: "nav.consolidation", url: "/dashboard/warehouse/consolidation" },
    ],
  },
  {
    titleKey: "nav.booking",
    navKey: "operations",
    url: "/dashboard/booking",
    icon: <HugeiconsIcon icon={PlusIcon} className="size-4" />,
    items: [
      { titleKey: "nav.newBooking", url: "/dashboard/booking" },
    ],
  },
  {
    titleKey: "nav.controlTower",
    navKey: "controlTower",
    url: "/dashboard/control-tower",
    icon: <HugeiconsIcon icon={Radar01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.towerOverview", url: "/dashboard/control-tower" },
      { titleKey: "nav.byMode", url: "/dashboard/control-tower/modes" },
      { titleKey: "nav.towerExceptions", url: "/dashboard/control-tower/exceptions" },
    ],
  },
  {
    titleKey: "nav.tracking",
    navKey: "tracking",
    url: "/dashboard/tracking",
    icon: <HugeiconsIcon icon={Location01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.liveMap", url: "/dashboard/tracking/map" },
      { titleKey: "nav.trackingEvents", url: "/dashboard/tracking/events" },
      { titleKey: "nav.driverLocations", url: "/dashboard/tracking/drivers" },
    ],
  },
  {
    titleKey: "nav.fleet",
    navKey: "fleet",
    url: "/dashboard/fleet",
    icon: <HugeiconsIcon icon={VanIcon} className="size-4" />,
    items: [
      { titleKey: "nav.drivers", url: "/dashboard/drivers" },
      { titleKey: "nav.vehicles", url: "/dashboard/vehicles" },
      { titleKey: "nav.carriers", url: "/dashboard/carriers" },
    ],
  },
  {
    titleKey: "nav.pricing",
    navKey: "pricing",
    url: "/dashboard/pricing",
    icon: <HugeiconsIcon icon={Dollar01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.pricingRules", url: "/dashboard/pricing/rules" },
      { titleKey: "nav.routes", url: "/dashboard/pricing/routes" },
      { titleKey: "nav.zones", url: "/dashboard/pricing/zones" },
      { titleKey: "nav.surcharges", url: "/dashboard/pricing/surcharges" },
      { titleKey: "nav.modePricing", url: "/dashboard/pricing/mode-config" },
      { titleKey: "nav.quotes", url: "/dashboard/pricing/quotes" },
    ],
  },
  {
    titleKey: "nav.parcelManagement",
    navKey: "parcelManagement",
    url: "/dashboard/parcel-categories",
    icon: <HugeiconsIcon icon={Package02Icon} className="size-4" />,
    items: [
      { titleKey: "nav.categories", url: "/dashboard/parcel-categories" },
      { titleKey: "nav.weightTiers", url: "/dashboard/parcel-weights" },
      { titleKey: "nav.fares", url: "/dashboard/parcel-fares" },
      { titleKey: "nav.surgePricing", url: "/dashboard/surge-pricing" },
      { titleKey: "nav.zones", url: "/dashboard/zones" },
    ],
  },
  {
    titleKey: "nav.international",
    navKey: "international",
    url: "/dashboard/international",
    icon: <HugeiconsIcon icon={Globe02Icon} className="size-4" />,
    items: [
      { titleKey: "nav.customs", url: "/dashboard/international/customs" },
      { titleKey: "nav.documents", url: "/dashboard/international/documents" },
      { titleKey: "nav.intlShipments", url: "/dashboard/international/shipments" },
    ],
  },
  {
    titleKey: "nav.payments",
    navKey: "payments",
    url: "/dashboard/payments",
    icon: <HugeiconsIcon icon={CreditCardIcon} className="size-4" />,
    items: [
      { titleKey: "nav.transactions", url: "/dashboard/payments/transactions" },
      { titleKey: "nav.invoices", url: "/dashboard/payments/invoices" },
      { titleKey: "nav.refunds", url: "/dashboard/payments/refunds" },
      { titleKey: "nav.gateways", url: "/dashboard/payment-gateways" },
    ],
  },
  {
    titleKey: "nav.customers",
    navKey: "customers",
    url: "/dashboard/customers",
    icon: <HugeiconsIcon icon={CustomerService01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.allCustomers", url: "/dashboard/customers" },
      { titleKey: "nav.corporateAccounts", url: "/dashboard/customers/corporate" },
    ],
  },
  {
    titleKey: "nav.support",
    navKey: "support",
    url: "/dashboard/support",
    icon: <HugeiconsIcon icon={HeadphonesIcon} className="size-4" />,
    items: [
      { titleKey: "nav.tickets", url: "/dashboard/support/tickets" },
      { titleKey: "nav.ratings", url: "/dashboard/support/ratings" },
    ],
  },
  {
    titleKey: "nav.blog",
    navKey: "blog",
    url: "/dashboard/blog",
    icon: <HugeiconsIcon icon={LogsIcon} className="size-4" />,
    items: [
      { titleKey: "nav.allPosts", url: "/dashboard/blog" },
      { titleKey: "nav.blogCategories", url: "/dashboard/blog/categories" },
    ],
  },
  {
    titleKey: "nav.exceptions",
    navKey: "exceptions",
    url: "/dashboard/exceptions",
    icon: <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />,
    items: [
      { titleKey: "nav.allExceptions", url: "/dashboard/exceptions" },
      { titleKey: "nav.returns", url: "/dashboard/exceptions/returns" },
      { titleKey: "nav.notifications", url: "/dashboard/notifications" },
    ],
  },
  {
    titleKey: "nav.settings",
    navKey: "settings",
    url: "/dashboard/settings",
    icon: <HugeiconsIcon icon={Settings02Icon} className="size-4" />,
    items: [
      { titleKey: "nav.general", url: "/dashboard/settings" },
      { titleKey: "nav.mapApiKeys", url: "/dashboard/settings/map" },
      { titleKey: "nav.team", url: "/dashboard/settings/team" },
      { titleKey: "nav.notifications", url: "/dashboard/settings/notifications" },
    ],
  },
]

const ADMIN_QUICK_ACCESS = [
  { nameKey: "qa.activeDrivers", url: "/dashboard/drivers", icon: <HugeiconsIcon icon={VanIcon} className="size-4" /> },
  { nameKey: "qa.liveShipments", url: "/dashboard/shipments", icon: <HugeiconsIcon icon={TruckIcon} className="size-4" /> },
  { nameKey: "nav.analytics", url: "/dashboard/analytics", icon: <HugeiconsIcon icon={DashboardSpeed01Icon} className="size-4" /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { t } = useLang()
  const isCustomer = user?.role === "CUSTOMER"

  const sidebarUser = {
    name: user?.name || "User",
    email: user?.email || "user@xerinexpress.com",
    avatar: user?.avatar || "",
  }

  let navItems: any[]
  let quickAccess: { name: string; url: string; icon?: React.ReactNode }[]

  if (isCustomer) {
    navItems = CUSTOMER_NAV_ITEMS.map((item) => ({
      ...item,
      title: t(item.titleKey),
      items: item.items.map((sub: any) => ({ ...sub, title: t(sub.titleKey) })),
    }))
    quickAccess = CUSTOMER_QUICK_ACCESS.map((qa) => ({ ...qa, name: t(qa.nameKey) }))
  } else {
    const allowedKeys = getRoleNavKeys(user?.role)
    const filteredNav = ALL_NAV_ITEMS.filter((item) => allowedKeys.includes(item.navKey as never))
    navItems = filteredNav.map(({ navKey, titleKey, ...rest }) => ({
      ...rest,
      title: t(titleKey),
      items: rest.items.map((sub: any) => ({ ...sub, title: t(sub.titleKey) })),
    }))
    quickAccess = ADMIN_QUICK_ACCESS.map((qa) => ({ ...qa, name: t(qa.nameKey) }))
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
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("brand.tagline")}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} label={isCustomer ? t("sidebar.menu") : t("sidebar.platform")} />
        <NavProjects projects={quickAccess} label={t("sidebar.quickAccess")} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
