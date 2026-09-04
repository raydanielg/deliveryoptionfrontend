import type { Viewport } from "next"
import { Geist, Geist_Mono, Inter, Roboto } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils";

const robotoHeading = Roboto({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  metadataBase: new URL("https://swg.xerinexpress.com"),
  title: {
    default: "Xerin Express — Logistics & Delivery Platform",
    template: "%s — Xerin Express",
  },
  description:
    "Xerin Express is a multipurpose logistics & delivery management platform for domestic, international, and freight operations. Send parcels, track shipments, and manage deliveries with ease.",
  keywords: [
    "Xerin Express",
    "logistics",
    "delivery",
    "parcel delivery",
    "shipment tracking",
    "freight forwarding",
    "SGR parcel",
    "air cargo",
    "Tanzania logistics",
    "courier service",
  ],
  authors: [{ name: "Xerin Express" }],
  creator: "Xerin Express",
  publisher: "Xerin Express",
  applicationName: "Xerin Express",
  formatDetection: {
    telephone: true,
    address: false,
    email: true,
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
    url: "https://swg.xerinexpress.com",
    siteName: "Xerin Express",
    title: "Xerin Express — Logistics & Delivery Platform",
    description:
      "Multipurpose logistics & delivery management platform for domestic, international, and freight operations. Send parcels, track shipments, and manage deliveries with ease.",
    images: [
      {
        url: "/assets/favicon.png",
        width: 512,
        height: 512,
        alt: "Xerin Express Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xerin Express — Logistics & Delivery Platform",
    description:
      "Multipurpose logistics & delivery management platform for domestic, international, and freight operations.",
    images: ["/assets/favicon.png"],
    creator: "@xerinexpress",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "",
  },
  category: "logistics",
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
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
