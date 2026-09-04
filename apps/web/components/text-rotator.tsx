"use client"

import { useEffect, useState } from "react"

const phrases = [
  { text: "Domestic Delivery", color: "text-primary" },
  { text: "International Shipping", color: "text-emerald-600" },
  { text: "SGR Parcel Service", color: "text-primary" },
  { text: "Air Cargo", color: "text-emerald-600" },
  { text: "Freight Forwarding", color: "text-primary" },
  { text: "Parcel Express", color: "text-emerald-600" },
  { text: "Last-Mile Delivery", color: "text-primary" },
  { text: "E-commerce Fulfillment", color: "text-emerald-600" },
]

export function TextRotator() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length)
        setVisible(true)
      }, 400)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const current = phrases[index] ?? phrases[0]!

  return (
    <span
      className={`inline-block transition-all duration-400 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      } ${current.color}`}
    >
      {current.text}
    </span>
  )
}
