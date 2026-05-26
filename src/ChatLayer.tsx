import { useEffect, useRef } from 'react'

type Node = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hue: number
  pulse: number
  label: string
}

type Packet = {
  from: number
  to: number
  t: number
  speed: number
  born: number
  text: string
}

type Bubble = {
  x: number
  y: number
  w: number
  h: number
  born: number
  ttl: number
  text: string
}

const MSGS = [
  'gm',
  'send proof',
  'meet in #dao-ops',
  'tx confirmed',
  'ping',
  'encrypted ✓',
  'drop hash',
  'ok',
  'ship it',
  'found a new gem',
  'launching in 2 hours',
  'wen launch?',
  'any web dev here?',
  'frontend help needed',
  'who can review PR?',
  'audit passed ✓',
  'deploying now',
  'new proposal live',
  'airdrop soon?',
  'bridge confirmed',
  'gas is low rn',
  'looking for builders',
  'any solidity dev?',
  'join the beta',
]

const SOLANA_BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function rndBase58(len: number) {
  return Array.from({ length: len }, () => SOLANA_BASE58[Math.floor(Math.random() * SOLANA_BASE58.length)]).join('')
}

function rndLabel() {
  return `${rndBase58(6)}…${rndBase58(4)}`
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

export function ChatLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const g = ctx

    let raf = 0
    let dead = false
    const canvas = cv

    let W = 0
    let H = 0
    let dpr = 1

    const COUNT = 20
    const CONNECT = 190

    const nodes: Node[] = []
    const packets: Packet[] = []
    const bubbles: Bubble[] = []

    function resize() {
      dpr = window.devicePixelRatio || 1
      W = canvas.offsetWidth || 800
      H = canvas.offsetHeight || 480
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function init() {
      nodes.length = 0
      for (let i = 0; i < COUNT; i++) {
        nodes.push({
          x: 24 + Math.random() * (W - 48),
          y: 24 + Math.random() * (H - 48),
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: 2.2 + Math.random() * 2.2,
          hue: 220 + Math.random() * 18, // blue family only
          pulse: Math.random() * Math.PI * 2,
          label: rndLabel(),
        })
      }
    }

    function spawnPacket(now: number) {
      if (dead) return

      // pick a nearby pair
      const pairs: [number, number][] = []
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < CONNECT) pairs.push([i, j])
        }
      }
      if (pairs.length) {
        const [a, b] = pairs[(Math.random() * pairs.length) | 0]
        const flip = Math.random() < 0.5
        packets.push({
          from: flip ? a : b,
          to: flip ? b : a,
          t: 0,
          speed: 0.006 + Math.random() * 0.007,
          born: now,
          text: MSGS[(Math.random() * MSGS.length) | 0],
        })
      }

      window.setTimeout(() => spawnPacket(performance.now()), 520 + Math.random() * 780)
    }

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      const rr = Math.min(r, w / 2, h / 2)
      g.beginPath()
      g.moveTo(x + rr, y)
      g.arcTo(x + w, y, x + w, y + h, rr)
      g.arcTo(x + w, y + h, x, y + h, rr)
      g.arcTo(x, y + h, x, y, rr)
      g.arcTo(x, y, x + w, y, rr)
      g.closePath()
    }

    function drawBubble(b: Bubble, now: number) {
      const age = (now - b.born) / b.ttl
      const t = clamp01(age)
      const alpha = t < 0.15 ? t / 0.15 : (t > 0.85 ? (1 - t) / 0.15 : 1)

      const lift = (1 - t) * 4
      const x = b.x
      const y = b.y - lift

      // bubble
      g.save()
      g.globalAlpha = alpha
      roundRect(x, y, b.w, b.h, 10)
      g.fillStyle = 'rgba(3,3,12,0.78)'
      g.fill()
      g.strokeStyle = 'rgba(24,0,204,0.25)'
      g.lineWidth = 1
      g.stroke()

      // tiny tail
      g.beginPath()
      g.moveTo(x + 18, y + b.h)
      g.lineTo(x + 26, y + b.h + 7)
      g.lineTo(x + 34, y + b.h)
      g.closePath()
      g.fillStyle = 'rgba(3,3,12,0.78)'
      g.fill()
      g.strokeStyle = 'rgba(24,0,204,0.25)'
      g.stroke()

      // text
      g.font = '11px "Space Mono", ui-monospace, Menlo, monospace'
      g.fillStyle = 'rgba(255,255,255,0.92)'
      g.fillText(b.text, x + 12, y + 22)

      g.restore()
    }

    function draw(now = performance.now()) {
      if (dead) return
      g.clearRect(0, 0, W, H)

      // connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d > CONNECT) continue
          const t = 1 - d / CONNECT
          const alpha = t * t * 0.18
          g.beginPath()
          g.moveTo(a.x, a.y)
          g.lineTo(b.x, b.y)
          g.strokeStyle = `rgba(24,0,204,${alpha})`
          g.lineWidth = 0.8
          g.stroke()
        }
      }

      // packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i]
        p.t += p.speed
        if (p.t >= 1) {
          // create a bubble near the receiver
          const to = nodes[p.to]
          const w = Math.max(90, Math.min(180, 12 + p.text.length * 9))
          bubbles.push({
            x: Math.max(12, Math.min(W - w - 12, to.x + 10)),
            y: Math.max(12, Math.min(H - 60, to.y - 40)),
            w,
            h: 38,
            born: now,
            ttl: 1500,
            text: p.text,
          })
          packets.splice(i, 1)
          continue
        }

        const a = nodes[p.from]
        const b = nodes[p.to]
        const x = a.x + (b.x - a.x) * p.t
        const y = a.y + (b.y - a.y) * p.t

        // soft trail
        const tr = g.createRadialGradient(x, y, 0, x, y, 14)
        tr.addColorStop(0, 'rgba(199,210,254,0.55)')
        tr.addColorStop(1, 'rgba(199,210,254,0)')
        g.beginPath()
        g.arc(x, y, 14, 0, Math.PI * 2)
        g.fillStyle = tr
        g.fill()

        // core
        g.beginPath()
        g.arc(x, y, 2.1, 0, Math.PI * 2)
        g.fillStyle = 'rgba(255,255,255,0.95)'
        g.fill()
      }

      // nodes
      for (const n of nodes) {
        n.pulse += 0.04
        const pulse = 1 + 0.22 * Math.sin(n.pulse)

        const hue = n.hue
        const blue = `hsla(${hue}, 95%, 62%, `

        // glow
        const gr = g.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 7 * pulse)
        gr.addColorStop(0, blue + '0.22)')
        gr.addColorStop(1, blue + '0)')
        g.beginPath()
        g.arc(n.x, n.y, n.r * 7 * pulse, 0, Math.PI * 2)
        g.fillStyle = gr
        g.fill()

        // ring
        g.beginPath()
        g.arc(n.x, n.y, n.r + 1.6, 0, Math.PI * 2)
        g.strokeStyle = blue + '0.35)'
        g.lineWidth = 0.9
        g.stroke()

        // core
        g.beginPath()
        g.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        g.fillStyle = blue + '0.9)'
        g.fill()

        // label
        g.font = '9px "Space Mono", ui-monospace, Menlo, monospace'
        g.fillStyle = 'rgba(199,210,254,0.33)'
        g.fillText(n.label, n.x + n.r + 6, n.y + 3)
      }

      // bubbles
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]
        if (now - b.born > b.ttl) { bubbles.splice(i, 1); continue }
        drawBubble(b, now)
      }

      // integrate
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 12 || n.x > W - 12) n.vx *= -1
        if (n.y < 12 || n.y > H - 12) n.vy *= -1
      }

      raf = requestAnimationFrame(() => draw(performance.now()))
    }

    resize()
    init()
    spawnPacket(performance.now())
    draw(performance.now())

    const ro = new ResizeObserver(() => {
      resize()
      init()
    })
    ro.observe(canvas)

    return () => {
      dead = true
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

