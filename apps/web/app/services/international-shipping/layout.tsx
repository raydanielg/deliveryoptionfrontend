import type { Metadata } from "next"

const SITE_URL = "https://swg.xerinexpress.com"

export const metadata: Metadata = {
  title: "International Shipping — Cross-border Logistics | Xerin Express",
  description:
    "Cross-border logistics and international shipping from Tanzania to East Africa and beyond. Full customs clearance, door-to-door delivery to Kenya, Uganda, Rwanda, Burundi, Zambia, Malawi, Mozambique, DR Congo, South Sudan, and Ethiopia.",
  alternates: { canonical: `${SITE_URL}/services/international-shipping` },
  openGraph: {
    title: "International Shipping — Cross-border Logistics | Xerin Express",
    description: "Cross-border logistics from Tanzania to East Africa and beyond. Full customs clearance and door-to-door delivery.",
    url: `${SITE_URL}/services/international-shipping`,
    images: [{ url: "/assets/2149095941.jpg", width: 1200, height: 630, alt: "Xerin Express International Shipping" }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
