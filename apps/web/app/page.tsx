import type { Metadata } from "next"
import {
  LandingHeader,
  Hero,
  TrustMarquee,
  Services,
  Coverage,
  HowItWorks,
  WhyChooseUs,
  CTASection,
  LandingFooter,
} from "@/components/landing-sections"

const SITE_URL = "https://swg.xerinexpress.com"

export const metadata: Metadata = {
  title: "Xerin Express — Logistics & Delivery Platform | Tanzania & East Africa",
  description:
    "Book road, SGR rail, air cargo, and international shipping with Xerin Express. Track shipments in real-time with OTP-verified delivery. Tanzania's leading logistics platform serving Dar es Salaam, Nairobi, Kampala, Kigali & beyond.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Xerin Express — Logistics & Delivery Platform | Tanzania & East Africa",
    description:
      "Book road, SGR rail, air cargo, and international shipping. Track shipments in real-time with OTP-verified delivery across East Africa.",
    url: SITE_URL,
    images: [
      {
        url: "/assets/2149095941.jpg",
        width: 1200,
        height: 630,
        alt: "Xerin Express — Logistics & Delivery Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xerin Express — Logistics & Delivery Platform | Tanzania & East Africa",
    description:
      "Book road, SGR rail, air cargo, and international shipping. Track shipments in real-time with OTP-verified delivery across East Africa.",
    images: ["/assets/2149095941.jpg"],
  },
}

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <TrustMarquee />
        <Services />
        <Coverage />
        <HowItWorks />
        <WhyChooseUs />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
