"use client"

import { useState, useEffect, useCallback } from "react"
import { clearAuthCookies } from "@workspace/ui/lib/auth-cookies"
import { normalizeRole } from "@/lib/role-nav"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  isVerified?: boolean
  isActive?: boolean
  branchId?: string | null
  agentKind?: string | null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }
    const stored = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored)
        // A session saved before the role consolidation may still carry a retired role.
        setUser({ ...parsed, role: normalizeRole(parsed.role) ?? parsed.role })
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [refresh])

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      clearAuthCookies()
      setUser(null)
      window.location.href = "/auth"
    }
  }, [])

  return { user, loading, logout, refresh }
}
