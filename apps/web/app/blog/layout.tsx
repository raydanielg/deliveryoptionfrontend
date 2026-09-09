import type { Metadata } from "next"

const SITE_URL = "https://swg.xerinexpress.com"

export const metadata: Metadata = {
  title: "Blog — Logistics Insights & Industry News | Xerin Express",
  description:
    "Read the latest logistics insights, shipping tips, and industry news from Xerin Express. Learn about parcel delivery, SGR rail freight, air cargo, and e-commerce fulfillment in Tanzania and East Africa.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Blog — Logistics Insights & Industry News | Xerin Express",
    description:
      "Read the latest logistics insights, shipping tips, and industry news from Xerin Express.",
    url: `${SITE_URL}/blog`,
    images: [{ url: "/assets/2149095941.jpg", width: 1200, height: 630, alt: "Xerin Express Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Logistics Insights & Industry News | Xerin Express",
    description: "Read the latest logistics insights, shipping tips, and industry news from Xerin Express.",
    images: ["/assets/2149095941.jpg"],
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
