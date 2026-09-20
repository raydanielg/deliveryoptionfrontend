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
import { getRoleNavKeys, getRoleQuickAccess, normalizeRole, type NavKey, type QuickIcon } from "@/lib/role-nav"
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
  PlugSocketIcon,
  Message01Icon,
  Notification01Icon,
  Invoice01Icon,
  Shield01Icon,
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
      { titleKey: "nav.claims", url: "/dashboard/support/claims" },
    ],
  },
]

/* ---------- Staff nav items ---------- */
// Every sub-item names the module (navKey) that gates it. A section appears only when the
// signed-in role has at least one of its sub-items, so each role gets its own menu instead
// of one big menu with sections greyed out.
type SubItem = { titleKey: string; url: string; navKey: NavKey; hideFor?: string[] }

const STAFF_NAV_ITEMS: Array<{
  titleKey: string
  url: string
  isActive?: boolean
  icon: React.ReactNode
  navKey?: NavKey // only for sections without sub-items
  items: SubItem[]
}> = [
  {
    titleKey: "nav.dashboard", url: "/dashboard", icon: <HugeiconsIcon icon={DashboardSpeed01Icon} className="size-4" />, isActive: true,
    items: [
      { titleKey: "nav.overview", url: "/dashboard", navKey: "dashboard" },
      { titleKey: "nav.analytics", url: "/dashboard/analytics", navKey: "analytics" },
      { titleKey: "nav.reports", url: "/dashboard/reports", navKey: "analytics" },
    ],
  },
  {
    titleKey: "nav.administration", url: "/dashboard/users", icon: <HugeiconsIcon icon={UserGroupIcon} className="size-4" />,
    items: [
      { titleKey: "nav.users", url: "/dashboard/users", navKey: "administration" },
      { titleKey: "nav.rolesPermissions", url: "/dashboard/roles", navKey: "administration" },
      { titleKey: "nav.logisticsControl", url: "/dashboard/logistics", navKey: "administration" },
      { titleKey: "nav.branches", url: "/dashboard/branches", navKey: "administration" },
    ],
  },
  {
    titleKey: "nav.operations", url: "/dashboard/shipments", icon: <HugeiconsIcon icon={TruckIcon} className="size-4" />,
    items: [
      { titleKey: "nav.allOrders", url: "/dashboard/orders", navKey: "shipments" },
      { titleKey: "nav.allShipments", url: "/dashboard/shipments", navKey: "shipments" },
      { titleKey: "nav.allPackages", url: "/dashboard/packages", navKey: "packages" },
      { titleKey: "nav.allDeliveries", url: "/dashboard/deliveries", navKey: "deliveries" },
      { titleKey: "nav.assignments", url: "/dashboard/assignments", navKey: "dispatch" },
      { titleKey: "nav.manifests", url: "/dashboard/manifests", navKey: "packages" },
      { titleKey: "nav.stations", url: "/dashboard/stations", navKey: "packages" },
      { titleKey: "nav.deliveryRegister", url: "/dashboard/delivery-register", navKey: "deliveryRegister" },
      { titleKey: "nav.newBooking", url: "/dashboard/booking", navKey: "booking" },
    ],
  },
  {
    titleKey: "nav.controlTower", url: "/dashboard/control-tower", icon: <HugeiconsIcon icon={Radar01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.towerOverview", url: "/dashboard/control-tower", navKey: "dispatch" },
      { titleKey: "nav.dispatch", url: "/dashboard/dispatch", navKey: "dispatch" },
      { titleKey: "nav.trips", url: "/dashboard/trips", navKey: "dispatch" },
    ],
  },
  {
    titleKey: "nav.sgr", url: "/dashboard/sgr", icon: <HugeiconsIcon icon={TrainIcon} className="size-4" />,
    items: [
      { titleKey: "nav.sgrShipments", url: "/dashboard/sgr", navKey: "sgr" },
      { titleKey: "nav.sgrStations", url: "/dashboard/sgr/stations", navKey: "sgr" },
      { titleKey: "nav.dispatchManifests", url: "/dashboard/sgr/dispatch", navKey: "sgr" },
      { titleKey: "nav.capacity", url: "/dashboard/sgr/capacity", navKey: "sgr" },
      { titleKey: "nav.trainCapacity", url: "/dashboard/train-capacity", navKey: "sgr" },
    ],
  },
  {
    titleKey: "nav.airCargo", url: "/dashboard/air-cargo", icon: <HugeiconsIcon icon={AirplaneIcon} className="size-4" />,
    items: [
      { titleKey: "nav.airCargoShipments", url: "/dashboard/air-cargo", navKey: "airCargo" },
      { titleKey: "nav.flightDispatch", url: "/dashboard/air-cargo/dispatch", navKey: "airCargo" },
      { titleKey: "nav.airports", url: "/dashboard/air-cargo/airports", navKey: "airCargo" },
    ],
  },
  {
    titleKey: "nav.warehouse", url: "/dashboard/warehouse", icon: <HugeiconsIcon icon={WarehouseIcon} className="size-4" />,
    items: [
      { titleKey: "nav.inventory", url: "/dashboard/warehouse", navKey: "warehouse" },
      { titleKey: "nav.receiving", url: "/dashboard/warehouse/receiving", navKey: "warehouse" },
      { titleKey: "nav.dubaiReceiving", url: "/dashboard/dubai-receiving", navKey: "warehouse" },
      { titleKey: "nav.consolidationBoxes", url: "/dashboard/consolidation-boxes", navKey: "warehouse" },
      { titleKey: "nav.consolidation", url: "/dashboard/warehouse/consolidation", navKey: "warehouse" },
      { titleKey: "nav.tripManifests", url: "/dashboard/trip-manifests", navKey: "warehouse" },
      { titleKey: "nav.shelfMap", url: "/dashboard/shelf-map", navKey: "warehouse" },
    ],
  },
  {
    titleKey: "nav.tracking", url: "/dashboard/tracking", icon: <HugeiconsIcon icon={Location01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.liveMap", url: "/dashboard/tracking/map", navKey: "tracking" },
      { titleKey: "nav.trackingEvents", url: "/dashboard/tracking/events", navKey: "tracking" },
      { titleKey: "nav.driverLocations", url: "/dashboard/tracking/drivers", navKey: "fleet" },
    ],
  },
  {
    titleKey: "nav.fleet", url: "/dashboard/drivers", icon: <HugeiconsIcon icon={VanIcon} className="size-4" />,
    items: [
      { titleKey: "nav.drivers", url: "/dashboard/drivers", navKey: "fleet" },
      { titleKey: "nav.vehicles", url: "/dashboard/vehicles", navKey: "fleet" },
      { titleKey: "nav.carriers", url: "/dashboard/carriers", navKey: "fleet" },
    ],
  },
  {
    titleKey: "nav.payments", url: "/dashboard/payments", icon: <HugeiconsIcon icon={CreditCardIcon} className="size-4" />,
    items: [
      { titleKey: "nav.paymentApprovals", url: "/dashboard/payment-approvals", navKey: "paymentControl" },
      { titleKey: "nav.transactions", url: "/dashboard/payments/transactions", navKey: "payments" },
      { titleKey: "nav.invoicing", url: "/dashboard/invoicing", navKey: "paymentControl" },
      { titleKey: "nav.refunds", url: "/dashboard/payments/refunds", navKey: "payments" },
      { titleKey: "nav.gateways", url: "/dashboard/payment-gateways", navKey: "paymentControl" },
    ],
  },
  {
    titleKey: "nav.pricing", url: "/dashboard/pricing", icon: <HugeiconsIcon icon={Dollar01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.pricingRules", url: "/dashboard/pricing", navKey: "pricing" },
      { titleKey: "nav.routes", url: "/dashboard/pricing/routes", navKey: "pricing", hideFor: ["FINANCE"] },
      { titleKey: "nav.zones", url: "/dashboard/pricing/zones", navKey: "pricing", hideFor: ["FINANCE"] },
      { titleKey: "nav.surcharges", url: "/dashboard/pricing/surcharges", navKey: "pricing" },
      { titleKey: "nav.modePricing", url: "/dashboard/pricing/mode-config", navKey: "pricing", hideFor: ["FINANCE"] },
      { titleKey: "nav.quotes", url: "/dashboard/pricing/quotes", navKey: "pricing" },
    ],
  },
  {
    titleKey: "nav.parcelManagement", url: "/dashboard/parcel-categories", icon: <HugeiconsIcon icon={Package02Icon} className="size-4" />,
    items: [
      { titleKey: "nav.categories", url: "/dashboard/parcel-categories", navKey: "pricing", hideFor: ["FINANCE"] },
      { titleKey: "nav.weightTiers", url: "/dashboard/parcel-weights", navKey: "pricing", hideFor: ["FINANCE"] },
      { titleKey: "nav.fares", url: "/dashboard/parcel-fares", navKey: "pricing" },
      { titleKey: "nav.surgePricing", url: "/dashboard/surge-pricing", navKey: "pricing" },
      { titleKey: "nav.zones", url: "/dashboard/zones", navKey: "pricing", hideFor: ["FINANCE"] },
    ],
  },
  {
    titleKey: "nav.international", url: "/dashboard/international", icon: <HugeiconsIcon icon={Globe02Icon} className="size-4" />,
    items: [
      { titleKey: "nav.customs", url: "/dashboard/international/customs", navKey: "international" },
      { titleKey: "nav.documents", url: "/dashboard/international/documents", navKey: "international" },
      { titleKey: "nav.intlShipments", url: "/dashboard/international/shipments", navKey: "international" },
    ],
  },
  {
    titleKey: "nav.customers", url: "/dashboard/customers", icon: <HugeiconsIcon icon={CustomerService01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.allCustomers", url: "/dashboard/customers", navKey: "customers" },
      { titleKey: "nav.corporateAccounts", url: "/dashboard/customers/corporate", navKey: "customers" },
    ],
  },
  {
    titleKey: "nav.support", url: "/dashboard/support/tickets", icon: <HugeiconsIcon icon={HeadphonesIcon} className="size-4" />,
    items: [
      { titleKey: "nav.tickets", url: "/dashboard/support/tickets", navKey: "support" },
      { titleKey: "nav.claims", url: "/dashboard/support/claims", navKey: "support" },
      { titleKey: "nav.ratings", url: "/dashboard/support/ratings", navKey: "support" },
    ],
  },
  {
    titleKey: "nav.exceptions", url: "/dashboard/exceptions", icon: <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />,
    items: [
      { titleKey: "nav.allExceptions", url: "/dashboard/exceptions", navKey: "exceptions" },
      { titleKey: "nav.returns", url: "/dashboard/exceptions/returns", navKey: "exceptions" },
    ],
  },
  {
    titleKey: "nav.blog", url: "/dashboard/blog", icon: <HugeiconsIcon icon={LogsIcon} className="size-4" />,
    items: [
      { titleKey: "nav.allPosts", url: "/dashboard/blog", navKey: "blog" },
    ],
  },
  {
    titleKey: "nav.integrations", url: "/dashboard/integrations", icon: <HugeiconsIcon icon={PlugSocketIcon} className="size-4" />,
    navKey: "integrations", items: [],
  },
  {
    titleKey: "nav.whatsapp", url: "/dashboard/whatsapp", icon: <HugeiconsIcon icon={Message01Icon} className="size-4" />,
    items: [
      { titleKey: "nav.whatsappConnections", url: "/dashboard/whatsapp", navKey: "whatsapp" },
      { titleKey: "nav.whatsappTemplates", url: "/dashboard/whatsapp/templates", navKey: "whatsapp" },
      { titleKey: "nav.whatsappCampaigns", url: "/dashboard/whatsapp/campaigns", navKey: "whatsapp" },
      { titleKey: "nav.whatsappMessages", url: "/dashboard/whatsapp/messages", navKey: "whatsapp" },
    ],
  },
  {
    titleKey: "nav.branchWork", url: "/dashboard/branch-work", icon: <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />,
    navKey: "branchWork", items: [],
  },
  {
    titleKey: "nav.notifications", url: "/dashboard/notifications", icon: <HugeiconsIcon icon={Notification01Icon} className="size-4" />,
    navKey: "notifications", items: [],
  },
  {
    titleKey: "nav.settings", url: "/dashboard/settings", icon: <HugeiconsIcon icon={Settings02Icon} className="size-4" />,
    items: [
      { titleKey: "nav.general", url: "/dashboard/settings", navKey: "settings" },
      { titleKey: "nav.mapApiKeys", url: "/dashboard/settings/map", navKey: "settings" },
      { titleKey: "nav.marketplaceIntegrations", url: "/dashboard/settings/marketplace-integrations", navKey: "settings" },
      { titleKey: "nav.team", url: "/dashboard/settings/team", navKey: "settings" },
      { titleKey: "nav.notifications", url: "/dashboard/settings/notifications", navKey: "settings" },
    ],
  },
]

const QUICK_ICONS: Record<QuickIcon, React.ReactNode> = {
  plus: <HugeiconsIcon icon={PlusIcon} className="size-4" />,
  search: <HugeiconsIcon icon={Search01Icon} className="size-4" />,
  orders: <HugeiconsIcon icon={ShoppingBag01Icon} className="size-4" />,
  truck: <HugeiconsIcon icon={TruckIcon} className="size-4" />,
  van: <HugeiconsIcon icon={VanIcon} className="size-4" />,
  chart: <HugeiconsIcon icon={DashboardSpeed01Icon} className="size-4" />,
  users: <HugeiconsIcon icon={UserGroupIcon} className="size-4" />,
  shield: <HugeiconsIcon icon={Shield01Icon} className="size-4" />,
  approve: <HugeiconsIcon icon={Shield01Icon} className="size-4" />,
  coins: <HugeiconsIcon icon={Dollar01Icon} className="size-4" />,
  receipt: <HugeiconsIcon icon={Invoice01Icon} className="size-4" />,
  box: <HugeiconsIcon icon={Package02Icon} className="size-4" />,
  warehouse: <HugeiconsIcon icon={WarehouseIcon} className="size-4" />,
  map: <HugeiconsIcon icon={Location01Icon} className="size-4" />,
  alert: <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />,
  plug: <HugeiconsIcon icon={PlugSocketIcon} className="size-4" />,
  tower: <HugeiconsIcon icon={Radar01Icon} className="size-4" />,
  message: <HugeiconsIcon icon={Message01Icon} className="size-4" />,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const { t } = useLang()
  const role = normalizeRole(user?.role)
  const isCustomer = role === "CUSTOMER"

  const sidebarUser = {
    name: user?.name || "User",
    email: user?.email || "user@xerinexpress.com",
    avatar: user?.avatar || "",
  }

  let navItems: any[]

  if (isCustomer) {
    navItems = CUSTOMER_NAV_ITEMS.map((item) => ({
      ...item,
      title: t(item.titleKey),
      items: item.items.map((sub: any) => ({ ...sub, title: t(sub.titleKey) })),
    }))
  } else {
    const allowed = getRoleNavKeys(role)
    navItems = STAFF_NAV_ITEMS.flatMap((item) => {
      if (item.items.length === 0) {
        return item.navKey && allowed.includes(item.navKey)
          ? [{ title: t(item.titleKey), url: item.url, icon: item.icon, isActive: item.isActive, items: [] }]
          : []
      }
      const visible = item.items.filter((sub: any) => allowed.includes(sub.navKey) && !sub.hideFor?.includes(role))
      if (visible.length === 0) return []
      return [{
        title: t(item.titleKey),
        // Land on the first page this role can actually open.
        url: visible[0]!.url,
        icon: item.icon,
        isActive: item.isActive,
        items: visible.map((sub) => ({ titleKey: sub.titleKey, url: sub.url, title: t(sub.titleKey) })),
      }]
    })
  }

  const quickAccess = getRoleQuickAccess(role).map((qa) => ({
    name: t(qa.nameKey),
    url: qa.url,
    icon: QUICK_ICONS[qa.icon],
  }))

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
