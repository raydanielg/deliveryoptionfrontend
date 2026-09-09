import type { MetadataRoute } from "next"

const SITE_URL = "https://swg.xerinexpress.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/ship`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/track`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/auth`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/auth/sign-up`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  const servicePages = [
    "road-delivery",
    "sgr-parcel",
    "air-cargo",
    "international-shipping",
    "warehouse",
    "ecommerce-fulfillment",
  ].map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  const legalPages = ["privacy-policy", "terms-of-service"].map((slug) => ({
    url: `${SITE_URL}/legal/${slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }))

  return [...staticPages, ...servicePages, ...legalPages]
}
