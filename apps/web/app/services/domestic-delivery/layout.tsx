import type { Metadata } from "next"

const SITE_URL = "https://swg.xerinexpress.com"

export const metadata: Metadata = {
  title: "Domestic Delivery Service — Boda Boda, Van, Truck | Xerin Express",
  description:
    "Fast and reliable domestic delivery across Tanzania. Book boda boda for quick parcels, vans for medium cargo, or trucks for heavy freight. Real-time tracking and OTP-verified delivery in Dar es Salaam, Dodoma, Arusha, Mwanza, and more.",
  alternates: { canonical: `${SITE_URL}/services/domestic-delivery` },
  openGraph: {
    title: "Domestic Delivery Service — Boda Boda, Van, Truck | Xerin Express",
    description: "Fast and reliable domestic delivery across Tanzania. Book boda boda, van, or truck with real-time tracking.",
    url: `${SITE_URL}/services/domestic-delivery`,
    images: [{ url: "/assets/2149095941.jpg", width: 1200, height: 630, alt: "Xerin Express Domestic Delivery" }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
