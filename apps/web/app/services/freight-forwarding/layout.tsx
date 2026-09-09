import type { Metadata } from "next"

const SITE_URL = "https://swg.xerinexpress.com"

export const metadata: Metadata = {
  title: "Freight Forwarding — Air Cargo & SGR Rail | Xerin Express",
  description:
    "Professional freight forwarding services in Tanzania. Air cargo, SGR rail parcel, and road freight for businesses. Airport-to-airport, door-to-airport, and door-to-door options with customs handling.",
  alternates: { canonical: `${SITE_URL}/services/freight-forwarding` },
  openGraph: {
    title: "Freight Forwarding — Air Cargo & SGR Rail | Xerin Express",
    description: "Professional freight forwarding services in Tanzania. Air cargo, SGR rail parcel, and road freight.",
    url: `${SITE_URL}/services/freight-forwarding`,
    images: [{ url: "/assets/2149095941.jpg", width: 1200, height: 630, alt: "Xerin Express Freight Forwarding" }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
