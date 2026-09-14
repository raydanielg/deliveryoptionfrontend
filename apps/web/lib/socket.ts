"use client"

import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

/**
 * Lazily creates (or reuses) a single Socket.IO connection authenticated with the
 * same bearer token used for REST calls (see lib/api.ts). Returns null on the server
 * or when the user isn't logged in yet — callers should guard against that.
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem("token")
  if (!token) return null

  if (!socket) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
    const origin = apiUrl.replace(/\/api\/v1\/?$/, "")
    socket = io(origin, {
      auth: { token },
      transports: ["websocket", "polling"],
    })
  }

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
