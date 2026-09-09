import type { Metadata } from "next"

const SITE_URL = "https://swg.xerinexpress.com"

export const metadata: Metadata = {
  title: "E-commerce Fulfillment — Warehouse & Order Management | Xerin Express",
  description:
    "Complete e-commerce fulfillment services in Tanzania. Receiving, shelving, consolidation, order management, automated dispatch, and last-mile delivery. Integrated with Selcom and Azampesa payments.",
  alternates: { canonical: `${SITE_URL}/services/ecommerce-fulfillment` },
  openGraph: {
    title: "E-commerce Fulfillment — Warehouse & Order Management | Xerin Express",
    description: "Complete e-commerce fulfillment in Tanzania. Warehousing, order management, automated dispatch, and last-mile delivery.",
    url: `${SITE_URL}/services/ecommerce-fulfillment`,
    images: [{ url: "/assets/2149095941.jpg", width: 1200, height: 630, alt: "Xerin Express E-commerce Fulfillment" }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
