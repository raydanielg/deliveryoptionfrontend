"use client"

import * as React from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

/**
 * Renders an image served by an endpoint that requires the bearer Authorization header
 * (so a plain <img src=...> can't hit it directly). Fetches the bytes with the token and
 * hands the browser an object URL instead. `fetcher` should resolve to an object URL —
 * see api.consolidationBoxes.fetchLabelBlobUrl for the pattern.
 */
export function AuthorizedImage({
  fetcher,
  alt,
  className,
  width,
  height,
}: {
  fetcher: () => Promise<string>
  alt: string
  className?: string
  width?: number
  height?: number
}) {
  const [src, setSrc] = React.useState<string>("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    setLoading(true)
    setError(false)
    fetcher()
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        objectUrl = url
        setSrc(url)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <Skeleton className={cn("rounded-lg", className)} style={{ width, height }} />
  }

  if (error || !src) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground", className)}
        style={{ width, height }}
      >
        Failed to load
      </div>
    )
  }

  return <img src={src} alt={alt} width={width} height={height} className={cn("rounded-lg border border-border", className)} />
}
