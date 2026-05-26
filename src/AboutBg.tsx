import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  pulse: number
  pulseSpeed: number
}

const COLORS = ['#818cf8', '#a78bfa', '#c084fc', '#34d399', '#38bdf8', '#6366f1']

function randBetween(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function hexAlpha(alpha: number) {
  return Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16).padStart(2, '0')
}

export default function AboutBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let W = 0, H = 0
    const MAX_DIST  = 200
    const COUNT     = 90

    const particles: Particle[] = []

    function resize() {
      W = canvas!.offsetWidth  || window.innerWidth
      H = canvas!.offsetHeight || window.innerHeight
      canvas!.width  = W
      canvas!.height = H
    }

    function spawn(): Particle {
      return {
        x:          randBetween(0, W),
        y:          randBetween(0, H),
        vx:         randBetween(-0.25, 0.25),
        vy:         randBetween(-0.25, 0.25),
        radius:     randBetween(1.8, 3.5),
        color:      COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha:      randBetween(0.7, 1.0),
        pulse:      Math.random() * Math.PI * 2,
        pulseSpeed: randBetween(0.012, 0.028),
      }
    }

    resize()
    for (let i = 0; i < COUNT; i++) particles.push(spawn())

    function draw() {
      ctx!.clearRect(0, 0, W, H)

      // move + wrap
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.pulse += p.pulseSpeed
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10
      }

      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > MAX_DIST) continue

          const t = 1 - dist / MAX_DIST
          const lineAlpha = t * t * 0.55
          const grad = ctx!.createLinearGradient(a.x, a.y, b.x, b.y)
          grad.addColorStop(0, a.color + hexAlpha(lineAlpha))
          grad.addColorStop(1, b.color + hexAlpha(lineAlpha))
          ctx!.beginPath()
          ctx!.moveTo(a.x, a.y)
          ctx!.lineTo(b.x, b.y)
          ctx!.strokeStyle = grad
          ctx!.lineWidth = 0.8 + t * 0.6
          ctx!.stroke()
        }
      }

      // particles
      for (const p of particles) {
        const pulse = 0.7 + 0.3 * Math.sin(p.pulse)
        const r     = p.radius * (0.9 + 0.25 * Math.sin(p.pulse))
        const alpha = p.alpha * pulse

        // glow halo
        const glowR = r * 6
        const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR)
        glow.addColorStop(0,   p.color + hexAlpha(alpha * 0.55))
        glow.addColorStop(0.4, p.color + hexAlpha(alpha * 0.18))
        glow.addColorStop(1,   p.color + '00')
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, glowR, 0, Math.PI * 2)
        ctx!.fillStyle = glow
        ctx!.fill()

        // core
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx!.fillStyle = p.color + hexAlpha(alpha)
        ctx!.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  )
}
