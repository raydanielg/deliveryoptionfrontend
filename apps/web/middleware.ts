import { NextResponse, type NextRequest } from "next/server"
import { canAccessPath, normalizeRole } from "@/lib/role-nav"

// Route guard for /dashboard/*. The path -> module -> role rules live in lib/role-nav.ts,
// the same table the sidebar reads, so a menu entry and its page can never disagree.
// This is a UX guard (it smooths the redirect) — every API call is authorized again on
// the server, so a stale or forged role cookie can't reach any data.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith("/dashboard")) return NextResponse.next()

  const token = req.cookies.get("token")?.value
  const roleCookie = req.cookies.get("role")?.value

  // Not signed in (or the cookie mirror is stale/missing) — send to login and remember
  // where they were headed.
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (roleCookie) {
    const role = normalizeRole(roleCookie)
    if (!role || !canAccessPath(role, pathname)) {
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
