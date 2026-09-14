"use client"

import * as React from "react"
import QRCode from "qrcode"

interface QrCodeProps {
  value: string
  size?: number
  className?: string
}

export function QrCode({ value, size = 120, className = "" }: QrCodeProps) {
  const [imgSrc, setImgSrc] = React.useState<string>("")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!value) return
    let cancelled = false
    setLoading(true)
    getQrCodeUrl(value, size)
      .then((url) => {
        if (!cancelled) setImgSrc(url)
      })
      .catch(() => {
        if (!cancelled) setImgSrc("")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (loading) {
    return <div style={{ width: size, height: size }} className={`animate-pulse rounded-lg bg-muted/40 ${className}`} />
  }

  return (
    <img
      src={imgSrc}
      alt={`QR Code: ${value}`}
      width={size}
      height={size}
      className={`rounded-lg border border-border ${className}`}
    />
  )
}

/**
 * Generates a QR code locally (no third-party image service) as a data: URI.
 * Now async since it renders client-side — call sites should `await` it or resolve
 * it inside an effect, same as the QrCode component above does.
 */
export function getQrCodeUrl(value: string, size = 200): Promise<string> {
  return QRCode.toDataURL(value, { width: size, margin: 1 })
}
