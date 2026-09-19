import { NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone = "", reason = "" } = body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required" },
        { status: 400 }
      )
    }

    if (!API_BASE) {
      return NextResponse.json(
        { success: false, message: "API configuration is missing" },
        { status: 500 }
      )
    }

    const res = await fetch(`${API_BASE}/account-deletion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, reason }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("[account-deletion] proxy error:", error)
    return NextResponse.json(
      { success: false, message: "Unable to process request. Please try again later." },
      { status: 500 }
    )
  }
}
