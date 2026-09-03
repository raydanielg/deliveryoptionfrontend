"use client"

import { useState, useEffect } from "react"

const authImages = [
  "/assets/2149095908.jpg",
  "/assets/2149095941.jpg",
  "/assets/41714.jpg",
]

export function AuthBackground() {
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % authImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {authImages.map((src, idx) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{
            opacity: idx === bgIndex ? 1 : 0,
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-black/65 to-slate-900/45 backdrop-blur-[2px]" />
    </div>
  )
}
