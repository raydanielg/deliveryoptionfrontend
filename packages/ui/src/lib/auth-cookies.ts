// Mirrors the auth state we already keep in localStorage into plain, readable cookies
// so Next.js middleware (which runs before any page JS and has no access to localStorage)
// can make routing decisions — redirect signed-out users away from /dashboard, and route
// signed-in users away from pages their role can't use. This is a UX/defense-in-depth layer
// only: the backend independently enforces permissions on every request regardless of what
// these cookies say, so a tampered cookie can get someone routed to a page, never past the API.
const TOKEN_COOKIE = "token"
const ROLE_COOKIE = "role"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // matches the backend's 7d JWT expiry

export function setAuthCookies(token: string, role?: string) {
  if (typeof document === "undefined") return
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`
  if (role) {
    document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(role)}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`
  }
}

export function clearAuthCookies() {
  if (typeof document === "undefined") return
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`
}
