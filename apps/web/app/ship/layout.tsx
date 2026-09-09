import type { Metadata } from "next"

const SITE_URL = "https://swg.xerinexpress.com"

export const metadata: Metadata = {
  title: "Book a Shipment — Road, SGR Rail, Air Cargo | Xerin Express",
  description:
    "Book a shipment with Xerin Express. Choose road delivery (boda boda, van, truck), SGR rail parcel, air cargo, or international shipping. Get instant quotes, pay online, and track your delivery in real-time across Tanzania and East Africa.",
  alternates: { canonical: `${SITE_URL}/ship` },
  openGraph: {
    title: "Book a Shipment — Road, SGR Rail, Air Cargo | Xerin Express",
    description:
      "Book a shipment with Xerin Express. Choose road, SGR rail, air cargo, or international shipping. Get instant quotes and track your delivery in real-time.",
    url: `${SITE_URL}/ship`,
    images: [{ url: "/assets/2149095941.jpg", width: 1200, height: 630, alt: "Xerin Express Book a Shipment" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Shipment — Road, SGR Rail, Air Cargo | Xerin Express",
    description: "Book road, SGR rail, air cargo, or international shipping. Get instant quotes and real-time tracking.",
    images: ["/assets/2149095941.jpg"],
  },
}

export default function ShipLayout({ children }: { children: React.ReactNode }) {
  return children
}
