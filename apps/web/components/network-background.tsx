"use client"

import { useEffect, useRef } from "react"

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let nodes: Node[] = []
    const maxDistance = 180
    const nodeCount = 42

    const colors = {
      node: "115, 185, 95",
      nodeAccent: "245, 158, 11",
      line: "115, 185, 95",
    }

    function resize() {
      if (!canvas) return
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.offsetWidth
      const h = parent.offsetHeight
      if (w === 0 || h === 0) return
      canvas.width = w
      canvas.height = h
    }

    function initNodes() {
      if (!canvas || canvas.width === 0) return
      nodes = []
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.8 + 1,
        })
      }
    }

    function draw() {
      if (!ctx || !canvas || canvas.width === 0) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]!
        node.x += node.vx
        node.y += node.vy

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        const isAccent = i % 5 === 0
        const colorStr = isAccent ? colors.nodeAccent : colors.node

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${colorStr}, 0.6)`
        ctx.fill()

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j]!
          const dx = node.x - other.x
          const dy = node.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxDistance) {
            const opacity = (1 - dist / maxDistance) * 0.15
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(${colors.line}, ${opacity})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    const startTimer = setTimeout(() => {
      resize()
      initNodes()
      draw()
    }, 100)

    const ro = new ResizeObserver(() => {
      resize()
      initNodes()
    })
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    return () => {
      clearTimeout(startTimer)
      cancelAnimationFrame(animationId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 size-full"
      aria-hidden="true"
    />
  )
}
