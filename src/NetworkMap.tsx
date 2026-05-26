import { useEffect, useRef } from 'react'

const NODE_COLORS = [
  '#627EEA', '#3300ff', '#a0b0ff',
  '#22d3ee', '#8247E5', '#28A0F0', '#61DFFF',
]

interface Node {
  x: number; y: number
  vx: number; vy: number
  wallet: string; color: string; r: number
  pulseT: number
}

interface Msg {
  from: number; to: number
  t: number; speed: number; color: string
}

const SOLANA_BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function rndBase58(len: number) {
  return Array.from({ length: len }, () => SOLANA_BASE58[Math.floor(Math.random() * SOLANA_BASE58.length)]).join('')
}

function rndWallet() {
  return `${rndBase58(6)}…${rndBase58(4)}`
}

export function NetworkMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    let raf: number
    let dead = false

    const COUNT   = 24
    const CONNECT = 170

    let W = 0, H = 0, dpr = 1

    function resize() {
      dpr = window.devicePixelRatio || 1
      W   = cv!.offsetWidth
      H   = cv!.offsetHeight
      cv!.width  = W * dpr
      cv!.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const nodes: Node[] = Array.from({ length: COUNT }, () => ({
      x: 20 + Math.random() * (W - 40),
      y: 20 + Math.random() * (H - 40),
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      wallet: rndWallet(),
      color:  NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
      r:      2.5 + Math.random() * 2,
      pulseT: Math.random() * Math.PI * 2,
    }))

    const msgs: Msg[] = []

    function spawnMsg() {
      if (dead) return
      const pairs: [number, number][] = []
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++)
          if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < CONNECT)
            pairs.push([i, j])
      if (pairs.length) {
        const [f, t] = pairs[Math.floor(Math.random() * pairs.length)]
        msgs.push({ from: f, to: t, t: 0, speed: 0.007 + Math.random() * 0.006, color: nodes[f].color })
      }
      setTimeout(spawnMsg, 600 + Math.random() * 900)
    }
    spawnMsg()

    let frame = 0

    function draw() {
      if (dead) return
      frame++
      ctx.clearRect(0, 0, W, H)

      // connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d  = Math.hypot(dx, dy)
          if (d < CONNECT) {
            const a = (1 - d / CONNECT) * 0.15
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(96,126,234,${a})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }

      // traveling messages
      for (let m = msgs.length - 1; m >= 0; m--) {
        const msg = msgs[m]
        msg.t += msg.speed
        if (msg.t >= 1) { msgs.splice(m, 1); continue }

        const fn = nodes[msg.from], tn = nodes[msg.to]
        const x  = fn.x + (tn.x - fn.x) * msg.t
        const y  = fn.y + (tn.y - fn.y) * msg.t
        // trail
        const tr = ctx.createRadialGradient(x, y, 0, x, y, 10)
        tr.addColorStop(0, msg.color + 'aa')
        tr.addColorStop(1, msg.color + '00')
        ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fillStyle = tr; ctx.fill()

        // bright core
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'; ctx.fill()
      }

      // nodes
      for (const n of nodes) {
        n.pulseT += 0.04
        const pulse = 1 + 0.25 * Math.sin(n.pulseT)

        // outer glow
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6 * pulse)
        g.addColorStop(0, n.color + '44')
        g.addColorStop(1, n.color + '00')
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 6 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill()

        // ring
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 1.5, 0, Math.PI * 2)
        ctx.strokeStyle = n.color + '55'; ctx.lineWidth = 0.8; ctx.stroke()

        // core
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = n.color; ctx.fill()

        // wallet label
        ctx.font = '8.5px ui-monospace, Menlo, monospace'
        ctx.fillStyle = 'rgba(160,180,220,0.38)'
        ctx.fillText(n.wallet, n.x + n.r + 5, n.y + 3)
      }

      // update positions
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy
        if (n.x < 8 || n.x > W - 8)  n.vx *= -1
        if (n.y < 8 || n.y > H - 8)  n.vy *= -1
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    const ro = new ResizeObserver(() => resize())
    ro.observe(cv)

    return () => {
      dead = true
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
