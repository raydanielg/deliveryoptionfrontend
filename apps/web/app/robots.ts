import type { MetadataRoute } from "next"

const SITE_URL = "https://swg.xerinexpress.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/auth", "/api"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/dashboard", "/auth", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
