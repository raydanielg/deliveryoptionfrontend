import { NextResponse, type NextRequest } from "next/server"
import { ROLE_NAV_PERMISSIONS, type Role } from "@/lib/role-nav"

// Maps a /dashboard/* path prefix to the nav permission that gates it, mirroring
// components/app-sidebar.tsx's ALL_NAV_ITEMS. Longest prefix wins, so list more
// specific paths before their parents where a section splits across nav keys.
const PATH_NAV_KEYS: Array<{ prefix: string; navKey: string }> = [
  { prefix: "/dashboard/users", navKey: "administration" },
  { prefix: "/dashboard/roles", navKey: "administration" },
  { prefix: "/dashboard/sgr", navKey: "sgr" },
  { prefix: "/dashboard/train-capacity", navKey: "sgr" },
  { prefix: "/dashboard/air-cargo", navKey: "airCargo" },
  { prefix: "/dashboard/warehouse", navKey: "warehouse" },
  { prefix: "/dashboard/control-tower", navKey: "controlTower" },
  { prefix: "/dashboard/tracking", navKey: "tracking" },
  { prefix: "/dashboard/drivers", navKey: "fleet" },
  { prefix: "/dashboard/vehicles", navKey: "fleet" },
  { prefix: "/dashboard/carriers", navKey: "fleet" },
  { prefix: "/dashboard/fleet", navKey: "fleet" },
  { prefix: "/dashboard/pricing", navKey: "pricing" },
  { prefix: "/dashboard/parcel-categories", navKey: "parcelManagement" },
  { prefix: "/dashboard/parcel-weights", navKey: "parcelManagement" },
  { prefix: "/dashboard/parcel-fares", navKey: "parcelManagement" },
  { prefix: "/dashboard/surge-pricing", navKey: "parcelManagement" },
  { prefix: "/dashboard/zones", navKey: "parcelManagement" },
  { prefix: "/dashboard/international", navKey: "international" },
  { prefix: "/dashboard/payment-gateways", navKey: "payments" },
  { prefix: "/dashboard/payments", navKey: "payments" },
  { prefix: "/dashboard/customers", navKey: "customers" },
  { prefix: "/dashboard/support", navKey: "support" },
  { prefix: "/dashboard/blog", navKey: "blog" },
  { prefix: "/dashboard/exceptions", navKey: "exceptions" },
  { prefix: "/dashboard/settings", navKey: "settings" },
  { prefix: "/dashboard/integrations", navKey: "integrations" },
  { prefix: "/dashboard/orders", navKey: "operations" },
  { prefix: "/dashboard/shipments", navKey: "operations" },
  { prefix: "/dashboard/packages", navKey: "operations" },
  { prefix: "/dashboard/deliveries", navKey: "operations" },
  { prefix: "/dashboard/assignments", navKey: "operations" },
  { prefix: "/dashboard/manifests", navKey: "operations" },
  { prefix: "/dashboard/stations", navKey: "operations" },
  { prefix: "/dashboard/booking", navKey: "operations" },
  { prefix: "/dashboard/operations", navKey: "operations" },
]

function navKeyForPath(pathname: string): string | null {
  let best: { prefix: string; navKey: string } | null = null
  for (const entry of PATH_NAV_KEYS) {
    if (pathname === entry.prefix || pathname.startsWith(entry.prefix + "/")) {
      if (!best || entry.prefix.length > best.prefix.length) best = entry
    }
  }
  return best?.navKey ?? null
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith("/dashboard")) return NextResponse.next()

  const token = req.cookies.get("token")?.value
  const role = req.cookies.get("role")?.value

  // Not signed in (or the cookie mirror is stale/missing) — send to login and remember
  // where they were headed. The actual API calls the page makes will fail closed anyway
  // if this cookie is out of sync; this only smooths the redirect.
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  const navKey = navKeyForPath(pathname)
  if (navKey && role) {
    const allowed = ROLE_NAV_PERMISSIONS[role as Role]
    if (allowed && !allowed.includes(navKey as never)) {
      const url = req.nextUrl.clone()
      url.pathname = "/dashboard"
      url.searchParams.set("denied", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
