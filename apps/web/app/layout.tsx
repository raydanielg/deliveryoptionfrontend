import type { Viewport } from "next"
import { Geist, Geist_Mono, Inter, Roboto } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/i18n"
import { cn } from "@workspace/ui/lib/utils";

const robotoHeading = Roboto({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const SITE_URL = "https://swg.xerinexpress.com"

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Xerin Express — Logistics & Delivery Platform | Tanzania & East Africa",
    template: "%s — Xerin Express",
  },
  description:
    "Xerin Express is Tanzania's leading logistics & delivery platform. Book road, SGR rail, air cargo, and international shipping. Track shipments in real-time with OTP-verified delivery across East Africa.",
  keywords: [
    "Xerin Express",
    "logistics Tanzania",
    "delivery service Tanzania",
    "parcel delivery Dar es Salaam",
    "shipment tracking Tanzania",
    "freight forwarding East Africa",
    "SGR parcel service",
    "air cargo Tanzania",
    "courier service Tanzania",
    "international shipping Tanzania",
    "road delivery Tanzania",
    "warehouse fulfillment Tanzania",
    "boda boda delivery",
    "last mile delivery Tanzania",
    "cross-border logistics Africa",
  ],
  authors: [{ name: "Xerin Express", url: SITE_URL }],
  creator: "Xerin Express",
  publisher: "Xerin Express",
  applicationName: "Xerin Express",
  formatDetection: {
    telephone: true,
    address: false,
    email: true,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en": SITE_URL,
      "sw": `${SITE_URL}/?lang=sw`,
      "x-default": SITE_URL,
    },
  },
  icons: {
    icon: [
      { url: "/assets/favicon.png", sizes: "any", type: "image/png" },
      { url: "/assets/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/assets/favicon.png",
    apple: [
      { url: "/assets/favicon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/assets/favicon.png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["sw_TZ"],
    url: SITE_URL,
    siteName: "Xerin Express",
    title: "Xerin Express — Logistics & Delivery Platform | Tanzania & East Africa",
    description:
      "Tanzania's leading logistics & delivery platform. Book road, SGR rail, air cargo, and international shipping. Track shipments in real-time with OTP-verified delivery.",
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
      "Tanzania's leading logistics & delivery platform. Book road, SGR rail, air cargo, and international shipping. Track shipments in real-time.",
    images: ["/assets/2149095941.jpg"],
    creator: "@xerinexpress",
    site: "@xerinexpress",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "",
  },
  category: "logistics",
  other: {
    "geo.region": "TZ",
    "geo.placename": "Dar es Salaam",
    "geo.position": "-6.79;39.28",
    "ICBM": "-6.79, 39.28",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": "Xerin Express",
      "url": SITE_URL,
      "logo": `${SITE_URL}/assets/favicon.png`,
      "image": `${SITE_URL}/assets/2149095941.jpg`,
      "description": "Tanzania's leading logistics & delivery platform. Book road, SGR rail, air cargo, and international shipping.",
      "telephone": "+255792810292",
      "email": "info@xerinexpress.co.tz",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dar es Salaam",
        "addressCountry": "TZ",
      },
      "areaServed": ["Tanzania", "Kenya", "Uganda", "Rwanda", "Burundi", "Zambia", "Malawi", "Mozambique", "DR Congo", "South Sudan", "Ethiopia"],
      "sameAs": [
        "https://www.facebook.com/xerinexpress",
        "https://twitter.com/xerinexpress",
        "https://www.instagram.com/xerinexpress",
        "https://www.linkedin.com/company/xerinexpress",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": "Xerin Express — Logistics & Delivery Platform",
      "publisher": { "@id": `${SITE_URL}/#organization` },
      "inLanguage": ["en", "sw"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${SITE_URL}/track?number={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Service",
      "name": "Logistics & Delivery Services",
      "provider": { "@id": `${SITE_URL}/#organization` },
      "areaServed": "East Africa",
      "serviceType": "Logistics, Delivery, Freight Forwarding, Parcel Delivery, SGR Rail Parcel, Air Cargo, International Shipping",
      "url": SITE_URL,
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, robotoHeading.variable)}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider><LanguageProvider>{children}</LanguageProvider></ThemeProvider>
      </body>
    </html>
  )
}
