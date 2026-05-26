import { useEffect, useRef } from 'react'
import './BioMap.css'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const d3: any
declare const topojson: any

const PHYLUM_COLORS: Record<string, string> = {
  Arthropoda:     '#00ffff',
  Cnidaria:       '#4488ff',
  Myzozoa:        '#00ff88',
  Ctenophora:     '#cc44ff',
  Proteobacteria: '#ffdd00',
  Mollusca:       '#ff6688',
  Annelida:       '#ff8844',
}

const SOLANA_BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'


function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

/* ── Wallet identity helpers ─────────────────────────────────────────── */

/** Deterministic pseudo-random integer from two numbers */
function hash2(a: number, b: number): number {
  let h = ((Math.abs(a * 127 + b * 31) | 0) ^ 0xdeadbeef) >>> 0
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0
  return (h ^ (h >>> 16)) >>> 0
}

/** Stable full wallet address from lat/lng */
function makeWallet(lat: number, lng: number): string {
  const seedA = Math.round(lat * 10000)
  const seedB = Math.round(lng * 10000)
  let state = hash2(seedA, seedB)

  return Array.from({ length: 44 }, (_, i) => {
    state = hash2(state ^ i, seedA + seedB + i * 7919)
    return SOLANA_BASE58[state % SOLANA_BASE58.length]
  }).join('')
}

/** Short display form: 9xQe...E3tK */
function shortWallet(full: string): string {
  return `${full.slice(0, 6)}...${full.slice(-4)}`
}

/** Solana-style handle from scientific name */
function makeHandle(scientificName: string): string {
  if (!scientificName) return 'anon.sol'
  const first = scientificName.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '')
  return `${first.slice(0, 12)}.sol`
}

/** Transaction type labels */
const TX_TYPES = [
  'Transfer', 'Token Swap', 'Contract Call',
  'NFT Mint', 'Bridge', 'Stake', 'Unstake',
  'Approve', 'Deploy', 'Burn',
]

/** Simulated SOL amounts */
const TX_AMOUNTS = [
  '0.0042 SOL', '1.25 SOL', '0.18 SOL', '4.20 SOL',
  '0.72 SOL', '3.20 SOL', '0.91 SOL', '8.8 SOL',
  '0.072 SOL', '5.00 SOL', '1.50 SOL', '0.003 SOL',
]

function pickTxType(seed: number): string {
  return TX_TYPES[seed % TX_TYPES.length]
}

function pickTxAmount(seed: number): string {
  return TX_AMOUNTS[seed % TX_AMOUNTS.length]
}

/** Relative timestamps */
const TIMES = ['just now', '1m ago', '3m ago', '7m ago', '12m ago', '28m ago',
               '1h ago', '2h ago', '5h ago', '14h ago', '1d ago', '2d ago']

function pickTime(seed: number): string {
  return TIMES[seed % TIMES.length]
}

/** Online / away / offline status */
const STATUSES = ['online', 'online', 'online', 'away', 'offline'] as const
type Status = typeof STATUSES[number]

function pickStatus(seed: number): Status {
  return STATUSES[seed % STATUSES.length]
}

const STATUS_COLOR: Record<Status, string> = {
  online:  '#22d3ee',
  away:    '#facc15',
  offline: '#6b7280',
}

/** Solana network + slot info */
const CHAINS = ['SOL']
const BLOCK_BASES = [338_000_000]

function pickChain(seed: number): string {
  return CHAINS[seed % CHAINS.length]
}

function pickBlock(seed: number): string {
  const base   = BLOCK_BASES[seed % BLOCK_BASES.length]
  const offset = (seed * 7919) % 900_000
  return (base + offset).toLocaleString()
}

/** Short tx hash */
function makeTxHash(seed: number): string {
  let state = hash2(seed, 0xc0ffee)
  const part = (len: number) => Array.from({ length: len }, (_, i) => {
    state = hash2(state ^ i, seed + i * 1543)
    return SOLANA_BASE58[state % SOLANA_BASE58.length]
  }).join('')

  return `${part(6)}…${part(6)}`
}

/** Build the full tooltip HTML for a map point */
function buildTooltipHtml(d: any, accentColor: string): string {
  const full   = makeWallet(d.latitude, d.longitude)
  const short  = shortWallet(full)
  const handle = makeHandle(d.scientificName)
  const seed   = hash2(Math.round(d.latitude * 100), Math.round(d.longitude * 100))

  const status   = pickStatus(seed)
  const dot      = STATUS_COLOR[status]
  const time     = pickTime(seed + 7)
  const chain    = pickChain(seed + 11)
  const block    = pickBlock(seed + 5)
  const tx       = makeTxHash(seed + 13)
  const txType   = pickTxType(seed + 17)
  const txAmount = pickTxAmount(seed + 23)

  return `
    <div class="bm-user-card">
      <div class="bm-user-header">
        <div class="bm-avatar" style="border-color:${accentColor}">
          <span class="bm-avatar-initials">${handle.slice(0,2).toUpperCase()}</span>
        </div>
        <div class="bm-user-info">
          <div class="bm-user-name" style="color:${accentColor}">${handle}</div>
          <div class="bm-wallet-addr">${short}</div>
        </div>
        <div class="bm-status-badge">
          <span class="bm-status-dot" style="background:${dot};box-shadow:0 0 5px ${dot}"></span>
          <span class="bm-status-text">${status}</span>
        </div>
      </div>
      <div class="bm-user-divider"></div>
      <div class="bm-last-msg">
        <div class="bm-msg-header">
          <span class="bm-msg-label">last transaction</span>
          <span class="bm-msg-time">${time}</span>
        </div>
        <div class="bm-tx-row">
          <span class="bm-tx-hash">${tx}</span>
          <span class="bm-tx-amount" style="color:${accentColor}">${txAmount}</span>
        </div>
        <span class="bm-tx-type">${txType}</span>
      </div>
      <div class="bm-user-divider"></div>
      <div class="bm-chain-row">
        <div class="bm-chain-item">
          <span class="bm-chain-label">network</span>
          <span class="bm-chain-value" style="color:${accentColor}">${chain}</span>
        </div>
        <div class="bm-chain-item">
          <span class="bm-chain-label">block</span>
          <span class="bm-chain-value">#${block}</span>
        </div>
        <div class="bm-chain-item">
          <span class="bm-chain-label">tx</span>
          <span class="bm-chain-value">${tx}</span>
        </div>
      </div>
    </div>
  `
}

export function BioMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const tooltipRef   = useRef<HTMLDivElement>(null)
  const countRef     = useRef<HTMLDivElement>(null)
  const modalRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    const tooltip   = tooltipRef.current
    if (!container || !canvas || !tooltip) return

    // These are guaranteed non-null past the guard above.
    // We re-assign to non-null typed locals so inner closure functions
    // don't trigger TS strict-null errors.
    const el = container as HTMLDivElement
    const cv  = canvas    as HTMLCanvasElement
    const tip = tooltip   as HTMLDivElement

    const ctx = cv.getContext('2d')!

    let allData: any[]      = []
    let filteredData: any[] = []
    let worldFeatures: any  = null
    let width = 0, height = 0, dpr = 1
    let projection: any, pathGenerator: any, quadtree: any
    let hoveredPoint: any   = null
    let destroyed           = false
    let raf                 = 0
    let animStart           = 0

    function fitScale() {
      return Math.min(width / 5.5, height / 3.1)
    }

    function updateProjection() {
      const base = fitScale()
      projection = d3.geoNaturalEarth1()
        .scale(base)
        .translate([width / 2, height / 2])
      pathGenerator = d3.geoPath().projection(projection).context(ctx)
      for (const d of allData) {
        const p = projection([d.longitude, d.latitude])
        d._px = p ? p[0] : -9999
        d._py = p ? p[1] : -9999
      }
      rebuildQuadtree()
    }

    function resize() {
      if (destroyed) return
      dpr    = window.devicePixelRatio || 1
      width  = el.clientWidth
      height = el.clientHeight
      cv.width  = width * dpr
      cv.height = height * dpr
      cv.style.width  = width  + 'px'
      cv.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      updateProjection()
      // RAF loop is already running; no need to re-start
    }

    function rebuildQuadtree() {
      quadtree = d3.quadtree()
        .x((d: any) => d._px)
        .y((d: any) => d._py)
        .addAll(filteredData.filter((d: any) => d._px > -9000))
    }

    function render(ts = 0) {
      if (destroyed) return
      if (animStart === 0) animStart = ts
      const t = (ts - animStart) / 1000

      ctx.clearRect(0, 0, width, height)

      if (worldFeatures) {
        ctx.beginPath()
        pathGenerator(worldFeatures)
        ctx.fillStyle   = '#060a10'
        ctx.fill()
        ctx.strokeStyle = '#0c1018'
        ctx.lineWidth   = 0.3
        ctx.stroke()
      }

      // ── Split points into dim (batch-drawn) vs lit (~10% at any moment) ──
      // A point is "lit" when its sine wave is in the top 10% of its cycle.
      // Threshold: pulse > 0.90 (sin reaches 0.90 ≈ 9.7% of the time).
      // No shadowBlur anywhere — performance-critical.
      const litByPhylum = new Map<string, { d: any; brightness: number }[]>()
      const dimByPhylum = new Map<string, any[]>()

      for (const d of filteredData) {
        if (d._px < -9000) continue
        const seed  = ((Math.abs(d._px * 7.3 + d._py * 13.1)) % 1000) / 1000
        const freq  = 0.10 + seed * 0.08          // 0.10–0.18 Hz → very slow
        const phase = seed * Math.PI * 2
        const pulse = 0.5 + 0.5 * Math.sin(t * freq * Math.PI * 2 + phase)

        if (pulse > 0.90) {
          const brightness = (pulse - 0.90) / 0.10   // 0→1 as pulse 0.90→1.0
          if (!litByPhylum.has(d.phylum)) litByPhylum.set(d.phylum, [])
          litByPhylum.get(d.phylum)!.push({ d, brightness })
        } else {
          if (!dimByPhylum.has(d.phylum)) dimByPhylum.set(d.phylum, [])
          dimByPhylum.get(d.phylum)!.push(d)
        }
      }

      // Dim points — same colour/size as the original static map
      dimByPhylum.forEach((points, phylum) => {
        const hex = PHYLUM_COLORS[phylum] || '#ffffff'
        const rgb = hexToRgb(hex)
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.5)`
        ctx.beginPath()
        for (const d of points) {
          ctx.moveTo(d._px + 1.2, d._py)
          ctx.arc(d._px, d._py, 1.2, 0, Math.PI * 2)
        }
        ctx.fill()
      })

      // Lit points — slightly brighter, slightly larger, NO blur
      litByPhylum.forEach((items, phylum) => {
        const hex = PHYLUM_COLORS[phylum] || '#ffffff'
        const rgb = hexToRgb(hex)
        for (const { d, brightness } of items) {
          const alpha  = 0.45 + 0.55 * brightness
          const radius = 0.7  + 0.8  * brightness
          ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha.toFixed(2)})`
          ctx.beginPath()
          ctx.arc(d._px, d._py, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Hovered point — bright, no blur
      if (hoveredPoint) {
        const hex = PHYLUM_COLORS[hoveredPoint.phylum] || '#fff'
        ctx.fillStyle = hex
        ctx.beginPath()
        ctx.arc(hoveredPoint._px, hoveredPoint._py, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(render)
    }

    /* ── Hover ───────────────────────────────────────────────────────── */
    function onMouseMove(e: MouseEvent) {
      const rect    = cv.getBoundingClientRect()
      const nearest = quadtree ? quadtree.find(e.clientX - rect.left, e.clientY - rect.top, 10) : null
      if (nearest !== hoveredPoint) {
        hoveredPoint = nearest
        if (hoveredPoint) {
          const hex = PHYLUM_COLORS[hoveredPoint.phylum] || '#fff'
          tip.innerHTML = buildTooltipHtml(hoveredPoint, hex)
          tip.classList.add('visible')
          cv.style.cursor = 'pointer'
        } else {
          tip.classList.remove('visible')
          cv.style.cursor = 'default'
        }
      }
      if (hoveredPoint) {
        let left = e.clientX + 12
        const top  = e.clientY - 12
        if (left + 260 > window.innerWidth) left = e.clientX - 260
        tip.style.left = left + 'px'
        tip.style.top  = top  + 'px'
      }
    }

    function onMouseLeave() {
      hoveredPoint = null
      tip.classList.remove('visible')
      cv.style.cursor = 'default'
    }

    /* ── Touch tap (tooltip only) ────────────────────────────────────── */
    let touchStartPos: { x: number; y: number } | null = null
    let touchStartTime = 0

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        touchStartPos  = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        touchStartTime = Date.now()
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length === 0 && touchStartPos) {
        for (const t of Array.from(e.changedTouches)) {
          const dx = t.clientX - touchStartPos.x
          const dy = t.clientY - touchStartPos.y
          const dt = Date.now() - touchStartTime
          if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && dt < 300) {
            const rect    = cv.getBoundingClientRect()
            const nearest = quadtree ? quadtree.find(t.clientX - rect.left, t.clientY - rect.top, 18) : null
            if (nearest) {
              hoveredPoint = nearest
              const hex = PHYLUM_COLORS[nearest.phylum] || '#fff'
              tip.innerHTML = buildTooltipHtml(nearest, hex)
              tip.classList.add('visible')
            } else {
              hoveredPoint = null
              tip.classList.remove('visible')
            }
          }
        }
        touchStartPos = null
      }
    }

    /* ── Dismiss help on outside click ──────────────────────────────── */
    function onDocClick(e: MouseEvent) {
      const modal = modalRef.current
      const icon  = el.querySelector('.bm-help-icon')
      if (modal?.classList.contains('active') && !modal.contains(e.target as Node) && !icon?.contains(e.target as Node)) {
        modal.classList.remove('active')
      }
    }

    /* ── Attach canvas listeners ─────────────────────────────────────── */
    cv.addEventListener('mousemove',  onMouseMove)
    cv.addEventListener('mouseleave', onMouseLeave)
    cv.addEventListener('touchstart', onTouchStart, { passive: true })
    cv.addEventListener('touchend',   onTouchEnd,   { passive: true })
    document.addEventListener('click',    onDocClick)
    window.addEventListener('resize',     resize)

    /* ── Filter button wiring ────────────────────────────────────────── */
    function wireFilters() {
      function selectPhylum(phylum: string, row: Element) {
        el.querySelectorAll('.bm-filter-btn').forEach(b => b.classList.remove('active'))
        row.querySelector('.bm-filter-btn')?.classList.add('active')
        filteredData = phylum === 'all' ? allData : allData.filter((d: any) => d.phylum === phylum)
        rebuildQuadtree()
        render()
        el.querySelectorAll('.bm-filter-wiki').forEach(w => w.classList.remove('visible'))
        if (phylum !== 'all') row.querySelector('.bm-filter-wiki')?.classList.add('visible')
      }

      el.querySelectorAll('.bm-filter-row').forEach(row => {
        const btn = row.querySelector('.bm-filter-btn') as HTMLButtonElement | null
        if (!btn) return
        const handler = (e: Event) => {
          if ((e.target as Element).closest('.bm-filter-wiki')) return
          e.stopPropagation()
          selectPhylum(btn.dataset.phylum!, row)
        }
        btn.addEventListener('click', handler)
        row.addEventListener('click', handler)
      })
    }

    /* ── Load data ───────────────────────────────────────────────────── */
    Promise.all([
      d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
      d3.json('https://dr.eamer.dev/datavis/data_trove/data/quirky/bioluminescence.json'),
    ]).then(([world, bioData]: [any, any]) => {
      if (destroyed) return
      worldFeatures = topojson.feature(world, world.objects.countries)
      allData       = (bioData as any[]).filter(d => d.latitude && d.longitude)
      filteredData  = allData

      if (countRef.current) {
        countRef.current.textContent = `${allData.length.toLocaleString()} observations`
      }

      wireFilters()
      resize()
      // Kick off the animation loop now that data is ready
      raf = requestAnimationFrame(render)
    }).catch((err: unknown) => console.error('BioMap data load error:', err))

    /* ── Cleanup ─────────────────────────────────────────────────────── */
    return () => {
      destroyed = true
      cancelAnimationFrame(raf)
      cv.removeEventListener('mousemove',  onMouseMove)
      cv.removeEventListener('mouseleave', onMouseLeave)
      cv.removeEventListener('touchstart', onTouchStart)
      cv.removeEventListener('touchend',   onTouchEnd)
      document.removeEventListener('click',    onDocClick)
      window.removeEventListener('resize',     resize)
    }
  }, [])

  const toggleModal = () => modalRef.current?.classList.toggle('active')
  const toggleFullscreen = () =>
    document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()

  return (
    <>
      <div id="bio-map-container" ref={containerRef}>
        <canvas id="bio-map" ref={canvasRef} />

        {/* Help button */}
        <div className="bm-help-icon" onClick={toggleModal} role="button" aria-label="Toggle info">?</div>

        {/* Help modal */}
        <div className="bm-help-modal" ref={modalRef}>
          <div className="bm-count" ref={countRef}>Loading observations…</div>
          <div className="bm-desc">
            Bioluminescent organism sightings from GBIF and OBIS, 1872–2025.
            Filter by phylum to isolate taxonomic groups.
          </div>
          <a href="https://lukesteuber.com" target="_blank" rel="noopener">lukesteuber.com</a>
          <a href="https://dr.eamer.dev"    target="_blank" rel="noopener">dr.eamer.dev</a>
        </div>

        {/* Fullscreen */}
        <div className="bm-fullscreen-btn" onClick={toggleFullscreen} role="button" aria-label="Toggle fullscreen">⛶</div>

      </div>

      {/* Tooltip lives outside the container so it can escape overflow:hidden */}
      <div className="bm-tooltip" ref={tooltipRef} />

    </>
  )
}
