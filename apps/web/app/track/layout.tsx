import type { Metadata } from "next"

const SITE_URL = "https://swg.xerinexpress.com"

export const metadata: Metadata = {
  title: "Track Your Shipment — Real-time Tracking | Xerin Express",
  description:
    "Track your shipment in real-time with Xerin Express. Enter your tracking number to see live status updates, delivery progress, and estimated arrival times for parcels, SGR rail cargo, and air freight across Tanzania and East Africa.",
  alternates: { canonical: `${SITE_URL}/track` },
  openGraph: {
    title: "Track Your Shipment — Real-time Tracking | Xerin Express",
    description:
      "Track your shipment in real-time. Enter your tracking number to see live status updates and delivery progress across Tanzania and East Africa.",
    url: `${SITE_URL}/track`,
    images: [{ url: "/assets/2149095941.jpg", width: 1200, height: 630, alt: "Xerin Express Shipment Tracking" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Your Shipment — Real-time Tracking | Xerin Express",
    description: "Track your shipment in real-time across Tanzania and East Africa.",
    images: ["/assets/2149095941.jpg"],
  },
}

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children
}
