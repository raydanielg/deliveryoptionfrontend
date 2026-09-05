"use client"

import * as React from "react"

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
    setLoading(true)
    const encoded = encodeURIComponent(value)
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=0f172a&margin=8`
    setImgSrc(url)
    setLoading(false)
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

export function getQrCodeUrl(value: string, size = 200) {
  const encoded = encodeURIComponent(value)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=0f172a&margin=8`
}
