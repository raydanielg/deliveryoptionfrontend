import type { Metadata } from "next"

const SITE_URL = "https://swg.xerinexpress.com"

export const metadata: Metadata = {
  title: "Parcel Express — Fast Parcel Delivery | Xerin Express",
  description:
    "Send parcels fast with Xerin Express. Quick booking, instant quotes, real-time tracking, and OTP-verified delivery. Perfect for documents, small packages, and urgent deliveries across Tanzania.",
  alternates: { canonical: `${SITE_URL}/services/parcel-express` },
  openGraph: {
    title: "Parcel Express — Fast Parcel Delivery | Xerin Express",
    description: "Send parcels fast with quick booking, instant quotes, real-time tracking, and OTP-verified delivery.",
    url: `${SITE_URL}/services/parcel-express`,
    images: [{ url: "/assets/2149095941.jpg", width: 1200, height: 630, alt: "Xerin Express Parcel Express" }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
