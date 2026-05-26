import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BioMap } from './BioMap'
import AboutBg from './AboutBg'
import { ChatLayer } from './ChatLayer'

/* ─── Icon primitives ──────────────────────────────────────────────────── */

function Icon({ d, size = 20, stroke = '#67e8f9' }: { d: string; size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  lock:    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  link:    'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  key:     'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
  zap:     'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  globe:   'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  shield:  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  cpu:     'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  users:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 2c0-2.67-1.33-5-4-6',
  code:    'M16 18l6-6-6-6M8 6l-6 6 6 6',
  chevron: 'M9 18l6-6-6-6',
  check:   'M20 6L9 17l-5-5',
  arrow:   'M5 12h14M12 5l7 7-7 7',
} as const

const X_PROFILE_URL = 'https://x.com/evm_chat'
const TOKEN_CONTRACT_ADDRESS = 'CA coming soon'
const HAS_TOKEN_CONTRACT_ADDRESS = TOKEN_CONTRACT_ADDRESS !== 'CA coming soon'
const LOGO_SRC = `${import.meta.env.BASE_URL}brand/blockchat-mark.png`

/* ─── Shared primitives ────────────────────────────────────────────────── */

function Btn({
  href = '#',
  variant = 'primary',
  children,
  className = '',
  target,
  rel,
}: {
  href?: string
  variant?: 'primary' | 'ghost' | 'outline'
  children: ReactNode
  className?: string
  target?: string
  rel?: string
}) {
  const base = 'inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[white]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#00000a]'
  const v = {
    primary: 'btn-shine bg-gradient-to-r from-[#1800cc] via-[#2b00ff] to-[#374151] text-white shadow-[0_0_24px_rgba(24,0,204,0.35)] hover:shadow-[0_0_40px_rgba(24,0,204,0.55)] hover:brightness-110',
    ghost:   'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/8 hover:border-white/15',
    outline: 'border border-[#1800cc]/50 text-[#a0b0ff] hover:bg-[#1800cc]/10 hover:border-[#3300ff]/60',
  }
  return <a href={href} target={target} rel={rel} className={`${base} ${v[variant]} ${className}`}>{children}</a>
}


/* ─── Marquee strip ────────────────────────────────────────────────────── */


/* ─── Futuristic feature card ──────────────────────────────────────────── */

function FeatureCard({
  num, icon, title, body, accent = '#a0b0ff', children, className = '',
}: {
  num: string; icon: string; title: string; body: string
  accent?: string; children?: ReactNode; className?: string
}) {
  return (
    <div
      className={`anim-border2 relative overflow-hidden rounded-2xl p-6 ${className}`}
    >
      {/* left glow bar */}
      <div className="absolute left-0 top-0 h-full w-[2px] rounded-l-2xl opacity-70" style={{ background: `linear-gradient(to bottom, transparent, ${accent}, transparent)` }} />
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/4">
          <Icon d={icon} size={16} stroke={accent} />
        </div>
        <span className="font-mono text-xs text-zinc-700">{num}</span>
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-white">{body}</p>
      {children}
    </div>
  )
}

/* ─── Main App ─────────────────────────────────────────────────────────── */

export default function App() {
  const [copiedCa, setCopiedCa] = useState(false)
  const [liveChatStep, setLiveChatStep] = useState(0)
  const [liveChatTyping, setLiveChatTyping] = useState<null | { who: string; side: 'left' | 'right'; accent?: string }>(null)
  const [liveChatMsgs, setLiveChatMsgs] = useState<Array<{ id: string; who: string; msg: string; side: 'left' | 'right'; time: string; accent?: string }>>([
    { id: 'm1', who: '9xQeWv…E3tK', msg: 'Proposal #42 passed ✓', time: '12:01', side: 'left' },
    { id: 'm2', who: '7GgPqS…Vw2m', msg: 'Treasury tx confirmed on BASE', time: '12:02', side: 'left', accent: '#22d3ee' },
    { id: 'm3', who: 'you', msg: 'proof anchored · block #14,220,811', time: '12:03', side: 'right' },
    { id: 'm4', who: '9xQeWv…E3tK', msg: 'gm — channel is token-gated 🔒', time: '12:04', side: 'left' },
  ])
  const liveChatScrollRef = useRef<HTMLDivElement | null>(null)

  const LIVE_CHAT_POOL = useMemo(() => ([
    { who: '9xQeWv…E3tK', accent: '#a0b0ff', side: 'left' as const, msgs: ['any web dev here?', 'found a new gem', 'launching in 2 hours', 'who can review PR?', 'new proposal live'] },
    { who: '7GgPqS…Vw2m', accent: '#22d3ee', side: 'left' as const, msgs: ['audit passed ✓', 'bridge confirmed', 'gas is low rn', 'deploying now', 'drop hash'] },
    { who: 'you',         accent: '#6366f1', side: 'right' as const, msgs: ['ok', 'ship it', 'send proof', 'ping', 'meet in #dao-ops'] },
  ]), [])

  const copyContractAddress = async () => {
    if (!HAS_TOKEN_CONTRACT_ADDRESS) return

    await navigator.clipboard.writeText(TOKEN_CONTRACT_ADDRESS)
    setCopiedCa(true)
    window.setTimeout(() => setCopiedCa(false), 1600)
  }

  useEffect(() => {
    const id = window.setInterval(() => setLiveChatStep(s => (s + 1) % 1000000), 3200)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    // simulate a conversation: show typing for a moment, then append a message
    const speaker = LIVE_CHAT_POOL[liveChatStep % LIVE_CHAT_POOL.length]
    const full = speaker.msgs[(Math.random() * speaker.msgs.length) | 0]
    setLiveChatTyping({ who: speaker.who, side: speaker.side, accent: speaker.accent })

    const typingMs = 900 + (liveChatStep % 3) * 220
    const timeout = window.setTimeout(() => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')

      setLiveChatMsgs(prev => {
        const id = `m_${Date.now()}_${Math.random().toString(16).slice(2)}`
        const next = [...prev, { id, who: speaker.who, msg: full, time: `${hh}:${mm}`, side: speaker.side, accent: speaker.accent }]
        return next.slice(-8)
      })
      setLiveChatTyping(null)
    }, typingMs)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [LIVE_CHAT_POOL, liveChatStep])

  useEffect(() => {
    // keep latest message visible
    const el = liveChatScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [liveChatMsgs, liveChatTyping])

  useEffect(() => {
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0
      document.documentElement.style.setProperty('--scroll-progress', String(Math.max(0, Math.min(1, progress))))
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  useEffect(() => {
    const selectors = [
      'main > section:not(:first-child)',
      'main > section:not(:first-child) > div',
      'main > section:not(:first-child) h2',
      'main > section:not(:first-child) .anim-border2',
      'main > section:not(:first-child) .grid > div',
      'main > section:not(:first-child) [class*="rounded-3xl"]',
      'main > section:not(:first-child) [class*="rounded-2xl"][class*="border"]',
    ].join(',')
    const targets = Array.from(new Set(Array.from(document.querySelectorAll<HTMLElement>(selectors))))

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(el => el.classList.add('is-visible'))
      return
    }

    targets.forEach((el, index) => {
      el.classList.add('scroll-reveal')
      el.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 45}ms`)
    })

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.14,
    })

    targets.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#00000a] text-slate-200">
      <div className="scroll-progress" aria-hidden />
      {/* ── Global background (below-the-fold sections) ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-lines bg-radial-fade opacity-50" />
        {/* banner-style centered blue glow */}
        <div className="orb absolute top-[15%] left-[30%] h-[700px] w-[800px] animate-aurora bg-gradient-to-br from-[#1800cc]/22 via-[#3300ff]/14 to-[#5500aa]/8 [animation-duration:22s]" />
        <div className="orb absolute -bottom-80 right-[-15%] h-[500px] w-[560px] animate-aurora bg-gradient-to-r from-[#1800cc]/12 to-[#3300ff]/8 [animation-duration:18s]" />
      </div>

      {/* ════════════════════════════════════════════════════════════════
          NAV
      ════════════════════════════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-4">
          {/* nav pill — fully centered */}
          <div className="flex items-center gap-8 rounded-2xl border border-white/8 bg-[#05060f]/80 px-5 py-2.5 backdrop-blur-2xl shadow-[0_4px_32px_rgba(0,0,0,0.45)]">
            <a href="#top" className="flex items-center gap-2.5" aria-label="EVM Chat">
              <img
                src={LOGO_SRC}
                alt="EVM Chat"
                className="size-8 rounded-xl"
                width={160}
                height={160}
                loading="eager"
              />
              <span className="text-sm font-bold tracking-wide text-white">EVM Chat</span>
            </a>
            <nav className="hidden items-center gap-7 md:flex">
              {[
                ['#about',    'About'],
                ['#features', 'Features'],
                ['#security', 'Security'],
                ['#roadmap',  'Roadmap'],
                ['#tokenomics', 'Tokenomics'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="text-xs font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Btn href={X_PROFILE_URL} variant="ghost" target="_blank" rel="noopener noreferrer">X</Btn>
              <Btn href="#cta">Dapp coming soon
                <Icon d={ICONS.arrow} size={14} stroke="currentColor" />
              </Btn>
            </div>
          </div>
        </div>
      </header>

      <main id="top" className="relative">

        {/* ════════════════════════════════════════════════════════════════
            HERO — bioluminescence map background
        ════════════════════════════════════════════════════════════════ */}
        <section className="relative h-screen w-full overflow-hidden">

          {/* ── Map fills the entire hero viewport ── */}
          <div className="absolute inset-0">
            <BioMap />
          </div>

          {/* ── Gradient fade at the bottom so the next section blends in ── */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
            style={{ background: 'linear-gradient(to bottom, transparent, #00000a)' }}
          />

          {/* ── Centered Blockchat overlay ── */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            {/* subtle dark backdrop so text stays legible over the map */}
            <div className="pointer-events-auto rounded-3xl bg-[#000010]/60 px-8 py-8 backdrop-blur-sm">
              <div className="badge badge-indigo pointer-events-auto mb-5 inline-flex items-center animate-fade-up text-white">
                <span className="animate-pulse2 inline-block size-1.5 shrink-0 rounded-full bg-white" style={{ marginBottom: '1.5px' }} />
                Private Conversations · Public Infrastructure
              </div>

              <h1 className="animate-fade-up text-balance text-[clamp(2.4rem,6vw,4.8rem)] font-bold leading-[1.06] tracking-[-0.02em] [animation-delay:0.08s]">
                <span className="gradient-text">Messaging built</span><br />
                <span className="gradient-text">for the onchain era.</span>
              </h1>

              <p className="animate-fade-up mx-auto mt-4 max-w-lg text-pretty text-sm leading-7 text-white [animation-delay:0.15s]">
                End-to-end encrypted conversations anchored by blockchain integrity proofs —
                every message is private, every proof is public.
              </p>

              <div className="animate-fade-up pointer-events-auto mt-7 flex flex-wrap items-center justify-center gap-3 [animation-delay:0.22s]">
                <Btn href="#cta">
                  Dapp Coming soon
                  <Icon d={ICONS.arrow} size={14} stroke="currentColor" />
                </Btn>
                <Btn href="#features" variant="ghost">Explore the protocol</Btn>
              </div>

              <div className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-5 text-white [animation-delay:0.3s]">
                {[
                  { icon: ICONS.lock,   label: 'E2E encrypted' },
                  { icon: ICONS.shield, label: 'Integrity proofs' },
                  { icon: ICONS.key,    label: 'Wallet identity' },
                  { icon: ICONS.globe,  label: 'Open infrastructure' },
                ].map(({ icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-xs font-medium">
                    <Icon d={icon} size={13} stroke="white" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Scroll cue ── */}
          <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.6" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            ABOUT
        ════════════════════════════════════════════════════════════════ */}
        <section id="about" className="relative overflow-hidden border-b border-white/5 py-32">

          {/* ── Animated background ── */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            {/* base */}
            <div className="absolute inset-0" style={{ background: '#020209' }} />
            {/* deep aurora blobs */}
            <div className="absolute -top-80 -left-80 h-[900px] w-[900px] animate-aurora [animation-duration:24s]"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.30) 0%, transparent 58%)', filter: 'blur(100px)' }} />
            <div className="absolute -bottom-60 right-[-20%] h-[750px] w-[750px] animate-aurora [animation-duration:28s] [animation-delay:-11s]"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.24) 0%, transparent 58%)', filter: 'blur(100px)' }} />
            {/* particle network canvas — on top of blobs */}
            <AboutBg />
            {/* top/bottom fade */}
            <div className="absolute inset-x-0 top-0 h-48 pointer-events-none" style={{ background: 'linear-gradient(180deg, #020209, transparent)' }} />
            <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none" style={{ background: 'linear-gradient(0deg, #020209, transparent)' }} />
          </div>

          <div className="mx-auto max-w-6xl px-6">

            {/* ── Section label ── */}
            <div className="mb-20 flex items-center gap-4">
              <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, #6366f1)' }} />
              <span className="label-mono text-zinc-500">// about evm chat</span>
            </div>

            {/* ── Top headline — full width ── */}
            <div className="mb-12 max-w-3xl">
              <h2 className="text-6xl font-bold leading-[1.05] tracking-tight text-white">
                Messaging<br />
                <span className="gradient-text">reimagined</span>
                <span className="text-white">.</span>
              </h2>
              <p className="mt-5 text-xl font-medium text-zinc-400">Built for a trustless world — encrypted by design, verified by the chain.</p>
              {/* glow underline */}
              <div
                className="relative mt-6 h-px w-full max-w-[44rem] overflow-hidden rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(99,102,241,0.35), rgba(192,132,252,0.18), transparent)',
                  boxShadow: '0 0 16px rgba(99,102,241,0.45)',
                }}
              >
                {/* moving highlight */}
                <div
                  className="absolute inset-y-0 -left-1/3 w-1/3 animate-shimmer"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(199,210,254,0.95), rgba(99,102,241,0.9), transparent)',
                    filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.9))',
                  }}
                />
              </div>
            </div>

            {/* ── Body — 3 col on desktop ── */}
            <div className="grid -mt-2 gap-16 lg:grid-cols-3">

              {/* Col 1 — paragraph copy */}
              <div className="lg:col-span-2">
                <p className="text-base leading-8 text-white">
                  EVM Chat encrypts every message client-side using your wallet keypair.
                  Only you and your recipient can ever read it — the platform sees nothing but ciphertext.
                  Proof-of-delivery hashes are anchored onchain, giving every conversation
                  a tamper-evident, publicly verifiable audit trail without ever exposing content.
                </p>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  No company holds your keys. No server reads your words. No algorithm curates your channels.
                  EVM Chat is a communication primitive — open infrastructure that developers
                  can build on, communities can govern, and users can verify.
                </p>
                {/* live pill */}
                <div className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399]" style={{ boxShadow: '0 0 6px #34d399' }} />
                  <span className="font-mono text-[9px] tracking-widest text-[#34d399]">PROTOCOL LIVE · EVM-NATIVE</span>
                </div>
              </div>

              {/* Col 3 — live chat widget */}
              <div className="border-l border-white/5 pl-8 -mt-12 lg:-mt-44">
                <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#030308]">
                  {/* header bar */}
                  <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[#34d399]" style={{ boxShadow: '0 0 10px rgba(52,211,153,0.9)' }} />
                      <span className="font-mono text-[10px] tracking-widest text-zinc-500">#dao-ops · 3</span>
                    </div>
                    <span className="font-mono text-[10px] tracking-widest text-zinc-700">evmchat://</span>
                  </div>

                  {/* message list (compact) */}
                  <div className="flex-1 px-4 py-4 overflow-hidden">
                    <div className="h-full flex flex-col justify-end gap-4">
                      {liveChatMsgs.slice(-5).map((m) => (
                        <div
                          key={`about-${m.id}`}
                          className={`flex ${m.side === 'right' ? 'justify-end' : 'justify-start'} gap-2`}
                          style={{ animation: 'chat-in 280ms ease both' }}
                        >
                          {m.side === 'left' && (
                            <div className="mt-1.5 h-5 w-5 rounded-full bg-white/8" />
                          )}
                          <div className={`max-w-[240px] ${m.side === 'right' ? 'text-right' : ''}`}>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="font-mono" style={{ color: m.side === 'right' ? '#6366f1' : (m.accent || '#a0b0ff') }}>{m.who}</span>
                              <span className="font-mono text-zinc-700">{m.time}</span>
                            </div>
                            <div
                              className={`mt-1 rounded-2xl px-3 py-2 font-mono text-[12px] leading-6 ${
                                m.side === 'right'
                                  ? 'bg-[#1800cc]/20 text-white'
                                  : 'bg-black/35 text-zinc-100'
                              }`}
                              style={m.side === 'right' ? { boxShadow: '0 0 0 1px rgba(24,0,204,0.20) inset' } : { boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }}
                            >
                              {m.msg}
                            </div>
                          </div>
                          {m.side === 'right' && (
                            <div className="mt-1.5 h-5 w-5 rounded-full bg-[#1800cc]/35" />
                          )}
                        </div>
                      ))}

                      {liveChatTyping && (
                        <div
                          className={`flex ${liveChatTyping.side === 'right' ? 'justify-end' : 'justify-start'} gap-2`}
                          style={{ animation: 'chat-in 220ms ease both' }}
                        >
                          {liveChatTyping.side === 'left' && (
                            <div className="mt-1.5 h-5 w-5 rounded-full bg-white/8" />
                          )}
                          <div className={`max-w-[240px] ${liveChatTyping.side === 'right' ? 'text-right' : ''}`}>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span
                                className="font-mono"
                                style={{ color: liveChatTyping.side === 'right' ? '#6366f1' : (liveChatTyping.accent || '#a0b0ff') }}
                              >
                                {liveChatTyping.who}
                              </span>
                              <span className="font-mono text-zinc-700">now</span>
                            </div>
                            <div
                              className={`mt-1 inline-flex items-center gap-2 rounded-2xl px-3 py-2 font-mono text-[12px] text-zinc-200 ${
                                liveChatTyping.side === 'right' ? 'bg-[#1800cc]/16' : 'bg-black/35'
                              }`}
                              style={liveChatTyping.side === 'right'
                                ? { boxShadow: '0 0 0 1px rgba(24,0,204,0.18) inset' }
                                : { boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }
                              }
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <span className="typing-dot h-2 w-2 rounded-full bg-white/80" style={{ animationDelay: '0ms' }} />
                                <span className="typing-dot h-2 w-2 rounded-full bg-white/80" style={{ animationDelay: '140ms' }} />
                                <span className="typing-dot h-2 w-2 rounded-full bg-white/80" style={{ animationDelay: '280ms' }} />
                              </span>
                            </div>
                          </div>
                          {liveChatTyping.side === 'right' && (
                            <div className="mt-1.5 h-5 w-5 rounded-full bg-[#1800cc]/35" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* input bar (compact) */}
                  <div className="flex items-center gap-2 border-t border-white/5 px-4 py-3">
                    <div className="flex-1 rounded-xl border border-white/5 bg-black/30 px-3 py-2 font-mono text-[11px] text-zinc-600">
                      encrypt + send…
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-[#1800cc]/18">
                      <span className="text-white">→</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Bottom stats strip ── */}
            <div className="mt-20 flex flex-wrap items-center gap-0 overflow-hidden rounded-2xl"
              style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,6,15,0.8)' }}>
              {[
                { value: '100%',     label: 'Client-side encrypted',    color: '#818cf8', icon: ICONS.lock   },
                { value: 'Zero',     label: 'Plaintext ever stored',     color: '#34d399', icon: ICONS.shield },
                { value: 'EVM',      label: 'Chain-native by design',    color: '#c084fc', icon: ICONS.globe  },
                { value: 'Open',     label: 'Source & composable',       color: '#38bdf8', icon: ICONS.code   },
              ].map(({ value, label, color, icon }, i) => (
                <div key={label}
                  className="group flex flex-1 items-center gap-4 px-7 py-6 transition-all duration-300 hover:brightness-110"
                  style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105"
                    style={{ background: color + '14', border: `1px solid ${color}35` }}>
                    <Icon d={icon} size={16} stroke={color} />
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold leading-none" style={{ color, textShadow: `0 0 20px ${color}60` }}>{value}</div>
                    <div className="mt-1 font-mono text-[9px] tracking-widest text-zinc-600 uppercase">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags row removed */}

          </div>
        </section>


        {/* ════════════════════════════════════════════════════════════════
            FEATURES
        ════════════════════════════════════════════════════════════════ */}
        <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-10">
            <div className="label-mono mb-2 text-zinc-600">// core capabilities</div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Built for the <span className="gradient-text">next generation</span> of messaging
            </h2>
          </div>

          {/* Main 2-col split */}
          <div className="grid gap-3 lg:grid-cols-5">
            {/* Large left card with mock chat */}
            <div
              className="anim-border2 relative overflow-hidden rounded-2xl p-6 lg:col-span-3"
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#1800cc]/10 blur-2xl" />
              <div className="label-mono mb-1 text-zinc-600">01</div>
              <div className="mb-1 flex items-center gap-2">
                <Icon d={ICONS.lock} size={14} stroke="#a0b0ff" />
                <span className="text-sm font-semibold text-white">End-to-End Encrypted</span>
              </div>
              <p className="mb-5 text-xs leading-5 text-white">Every message is encrypted client-side before leaving the device. Keys are user-owned — the server sees only ciphertext.</p>
              {/* mock chat UI */}
              <div className="space-y-2 rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-[11px]">
                <div className="flex items-end gap-2">
                  <div className="h-5 w-5 shrink-0 rounded-full bg-[#1800cc]/60" />
                  <div className="rounded-lg rounded-bl-none bg-[#1800cc]/20 px-3 py-1.5 text-zinc-200">9xQeWv…E3tK: <span className="text-[#a0b0ff]">gm ser 🔐</span></div>
                </div>
                <div className="flex items-end justify-end gap-2">
                  <div className="rounded-lg rounded-br-none bg-white/6 px-3 py-1.5 text-zinc-400">proof anchored ✓ <span className="text-zinc-600">block #21,847,221</span></div>
                  <div className="h-5 w-5 shrink-0 rounded-full bg-[#3300ff]/60" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="h-5 w-5 shrink-0 rounded-full bg-[#1800cc]/60" />
                  <div className="rounded-lg rounded-bl-none bg-[#1800cc]/20 px-3 py-1.5 text-zinc-200">new channel: <span className="text-[#a0b0ff]">#dao-ops 🔏</span></div>
                </div>
              </div>
            </div>

            {/* Right column of 2 cards */}
            <div className="flex flex-col gap-3 lg:col-span-2">
              <FeatureCard num="02" icon={ICONS.link} title="Onchain Integrity Proofs" accent="#22d3ee"
                body="A tamper-evident proof for each message is anchored to the chain — verifiable by anyone, readable by no one." />
              <FeatureCard num="03" icon={ICONS.key} title="Wallet-Native Identity" accent="#a78bfa"
                body="Your wallet IS your identity. No usernames, no email — just a keypair. Portable, self-sovereign, and recoverable." />
            </div>
          </div>

          {/* 3-col bottom row */}
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <FeatureCard num="04" icon={ICONS.users} title="Token-Gated Channels" accent="#34d399"
              body="Rooms locked by NFT ownership, token balance, or on-chain role. Every gate is cryptographic — not admin-level." />
            <FeatureCard num="05" icon={ICONS.zap} title="Selective Disclosure" accent="#c7d2fe"
              body="Reveal timestamps, receipts, or proofs on demand. Nothing else leaves the encrypted envelope without your consent." />
            <FeatureCard num="06" icon={ICONS.code} title="Composable SDK" accent="#60a5fa"
              body="Embed encrypted messaging into any dApp. Clean API surface for bots, automation, and DAO tooling." />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            NETWORK CONNECTIONS — animated mesh
        ════════════════════════════════════════════════════════════════ */}
        <section id="network" className="border-y border-white/5 bg-[#00000a] py-24">
          <div className="mx-auto max-w-6xl px-6">
            {/* header */}
            <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="label-mono mb-2 text-zinc-600">// live network</div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  A global mesh of{' '}
                  <span className="gradient-text">encrypted connections</span>
                </h2>
                <p className="mt-2 text-xs text-white max-w-md">
                  Every node is a wallet. Every line is a verified channel.
                  Every moving dot is an encrypted message in transit.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-[#05060f] px-4 py-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399]" style={{ boxShadow: '0 0 6px #34d399' }} />
                <span className="font-mono text-[10px] text-zinc-500">network active</span>
              </div>
            </div>

            {/* canvas */}
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black" style={{ height: '480px' }}>
              <ChatLayer />
              {/* corner labels */}
              <div className="pointer-events-none absolute inset-0 p-4">
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] text-zinc-700">evmchat://mesh/v1</span>
                  <span className="font-mono text-[9px] text-zinc-700">e2e · encrypted · verified</span>
                </div>
              </div>
            </div>

            {/* bottom stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Nodes Online',         value: '24',     color: '#627EEA' },
                { label: 'Active Channels',      value: '138+',   color: '#22d3ee' },
                { label: 'Messages in Transit',  value: 'live',   color: '#34d399' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-white/5 bg-[#05060f] px-4 py-3 text-center">
                  <div className="font-mono text-lg font-bold" style={{ color }}>{value}</div>
                  <div className="mt-0.5 font-mono text-[9px] text-zinc-600 uppercase tracking-widest">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            LIVE CHAT — channel preview
        ════════════════════════════════════════════════════════════════ */}
        <section id="livechat" className="border-b border-white/5 bg-[#00000a] py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="label-mono mb-2 text-zinc-600">// live chat</div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  See what <span className="gradient-text">encrypted chat</span> feels like.
                </h2>
                <p className="mt-2 max-w-md text-xs text-white">
                  A lightweight channel preview — wallet identities, proofs, and token-gated rooms.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#030308]">
              {/* header bar */}
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#34d399]" style={{ boxShadow: '0 0 10px rgba(52,211,153,0.9)' }} />
                  <span className="font-mono text-[10px] tracking-widest text-zinc-500">#dao-ops · 3 members</span>
                </div>
                <span className="font-mono text-[10px] tracking-widest text-zinc-700">evmchat://channel/9xQeWv</span>
              </div>

              {/* message list */}
              <div ref={liveChatScrollRef} className="px-5 py-5 max-h-[420px] overflow-hidden">
                <div className="space-y-5">
                  {liveChatMsgs.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.side === 'right' ? 'justify-end' : 'justify-start'} gap-3`}
                      style={{ animation: 'chat-in 280ms ease both' }}
                    >
                      {m.side === 'left' && (
                        <div className="mt-1.5 h-6 w-6 rounded-full bg-white/8" />
                      )}

                      <div className={`max-w-[520px] ${m.side === 'right' ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="font-mono" style={{ color: m.side === 'right' ? '#6366f1' : (m.accent || '#a0b0ff') }}>{m.who}</span>
                          <span className="font-mono text-zinc-700">{m.time}</span>
                        </div>
                        <div
                          className={`mt-1 rounded-2xl px-4 py-3 font-mono text-[12px] leading-6 ${
                            m.side === 'right'
                              ? 'bg-[#1800cc]/20 text-white'
                              : 'bg-black/35 text-zinc-100'
                          }`}
                          style={m.side === 'right' ? { boxShadow: '0 0 0 1px rgba(24,0,204,0.20) inset' } : { boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }}
                        >
                          {m.msg}
                        </div>
                      </div>

                      {m.side === 'right' && (
                        <div className="mt-1.5 h-6 w-6 rounded-full bg-[#1800cc]/35" />
                      )}
                    </div>
                  ))}

                  {/* typing line (animated) */}
                  {liveChatTyping && (
                    <div
                      className={`flex ${liveChatTyping.side === 'right' ? 'justify-end' : 'justify-start'} gap-3`}
                      style={{ animation: 'chat-in 220ms ease both' }}
                    >
                      {liveChatTyping.side === 'left' && (
                        <div className="mt-1.5 h-6 w-6 rounded-full bg-white/8" />
                      )}
                      <div className="max-w-[520px]">
                        <div className="flex items-center gap-2 text-[10px]">
                          <span
                            className="font-mono"
                            style={{ color: liveChatTyping.side === 'right' ? '#6366f1' : (liveChatTyping.accent || '#a0b0ff') }}
                          >
                            {liveChatTyping.who}
                          </span>
                          <span className="font-mono text-zinc-700">now</span>
                        </div>
                        <div
                          className={`mt-1 inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-mono text-[12px] text-zinc-200 ${
                            liveChatTyping.side === 'right' ? 'bg-[#1800cc]/16' : 'bg-black/35'
                          }`}
                          style={liveChatTyping.side === 'right'
                            ? { boxShadow: '0 0 0 1px rgba(24,0,204,0.18) inset' }
                            : { boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }
                          }
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/60" style={{ animationDelay: '0ms' }} />
                            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/60" style={{ animationDelay: '140ms' }} />
                            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/60" style={{ animationDelay: '280ms' }} />
                          </span>
                        </div>
                      </div>
                      {liveChatTyping.side === 'right' && (
                        <div className="mt-1.5 h-6 w-6 rounded-full bg-[#1800cc]/35" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* input bar */}
              <div className="flex items-center gap-3 border-t border-white/5 px-5 py-4">
                <div className="flex-1 rounded-xl border border-white/5 bg-black/30 px-4 py-3 font-mono text-[12px] text-zinc-500">
                  encrypt + send…
                </div>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-[#1800cc]/18 transition-transform active:scale-[0.98]"
                  aria-label="Send"
                >
                  <span className="text-white">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            HOW IT WORKS — animated message lifecycle
        ════════════════════════════════════════════════════════════════ */}

        {/* ════════════════════════════════════════════════════════════════
            SECURITY — next-gen audit panel
        ════════════════════════════════════════════════════════════════ */}
        <section id="security" className="relative overflow-hidden border-y border-white/5 py-24">
          {/* ── Animated gradient background ── */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            {/* base dark */}
            <div className="absolute inset-0" style={{ background: '#00000f' }} />
            {/* slow-moving aurora blobs */}
            <div className="orb absolute -top-40 -left-40 h-[520px] w-[520px] animate-aurora opacity-60 [animation-duration:18s]"
              style={{ background: 'radial-gradient(circle, rgba(24,0,204,0.22) 0%, transparent 70%)' }} />
            <div className="orb absolute top-1/3 left-1/2 h-[400px] w-[600px] -translate-x-1/2 animate-aurora opacity-40 [animation-duration:24s] [animation-delay:-8s]"
              style={{ background: 'radial-gradient(ellipse, rgba(51,0,255,0.15) 0%, transparent 65%)' }} />
            <div className="orb absolute -bottom-32 right-[-10%] h-[480px] w-[480px] animate-aurora opacity-50 [animation-duration:20s] [animation-delay:-4s]"
              style={{ background: 'radial-gradient(circle, rgba(34,211,153,0.10) 0%, transparent 68%)' }} />
            {/* subtle grid overlay */}
            <div className="absolute inset-0 bg-lines opacity-20" />
          </div>

          <div className="mx-auto max-w-6xl px-6">
            {/* Header row */}
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="label-mono mb-2 text-zinc-600">// security model</div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  A model you can<br />
                  <span className="gradient-text">actually explain.</span>
                </h2>
                <p className="mt-3 max-w-sm text-xs leading-6 text-white">
                  No fuzzy "military-grade" marketing. E2E encryption, onchain proofs, and a trustless relay — verifiable by anyone.
                </p>
              </div>
              {/* Live score badge */}
              <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-[#34d399]/30 px-5 py-4"
                style={{ background: 'rgba(52,211,153,0.06)', boxShadow: '0 0 32px rgba(52,211,153,0.08) inset' }}>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.2em] text-[#34d399]">THREAT LEVEL</div>
                  <div className="mt-0.5 font-mono text-3xl font-bold leading-none text-white">
                    0<span className="text-sm text-zinc-600"> / CVEs</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#34d399]/40 bg-[#34d399]/10 animate-pulse"
                  style={{ boxShadow: '0 0 24px rgba(52,211,153,0.25)' }}>
                  <Icon d={ICONS.shield} size={20} stroke="#34d399" />
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="grid gap-4 lg:grid-cols-5">

              {/* ── Shield visualization ── */}
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/5 py-10 lg:col-span-2"
                style={{ background: 'rgba(3,3,8,0.85)', backdropFilter: 'blur(12px)' }}>

                {/* scanning beam */}
                <div className="pointer-events-none absolute inset-x-0 h-[2px] animate-scanline opacity-20"
                  style={{ background: 'linear-gradient(90deg, transparent, #a0b0ff, transparent)' }} />

                {/* corner labels */}
                <div className="pointer-events-none absolute inset-0 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] text-zinc-700">SYS::SHIELD</span>
                    <span className="flex items-center gap-1.5 font-mono text-[8px] text-[#34d399]">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399]" />
                      ACTIVE
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                    <span className="font-mono text-[7px] text-zinc-800">v2.4.1</span>
                    <span className="font-mono text-[7px] text-zinc-800">AES·ZK·EVM</span>
                  </div>
                </div>

                {/* rings */}
                <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
                  {/* outermost slow spin */}
                  <div className="absolute inset-0 animate-spin rounded-full border border-dashed border-[#1800cc]/25"
                    style={{ animationDuration: '28s' }} />
                  {/* outer glow pulse ring */}
                  <div className="absolute inset-[8px] animate-pulse rounded-full border border-[#3300ff]/10"
                    style={{ animationDuration: '4s' }} />
                  {/* counter-rotating mid */}
                  <div className="absolute animate-spin rounded-full border border-[#3300ff]/20"
                    style={{ inset: 22, animationDuration: '16s', animationDirection: 'reverse' }} />
                  {/* inner ring */}
                  <div className="absolute rounded-full border border-[#1800cc]/25" style={{ inset: 40 }} />
                  {/* center glow */}
                  <div className="absolute rounded-full"
                    style={{ inset: 54, background: 'radial-gradient(circle, rgba(24,0,204,0.35) 0%, transparent 70%)' }} />
                  {/* center icon circle */}
                  <div className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full border border-[#1800cc]/60 bg-[#1800cc]/14"
                    style={{ boxShadow: '0 0 40px rgba(24,0,204,0.5), 0 0 0 1px rgba(24,0,204,0.2)' }}>
                    <Icon d={ICONS.shield} size={32} stroke="#a0b0ff" />
                  </div>
                  {/* orbit dots */}
                  {[
                    { angle: -90, color: '#a0b0ff', label: 'E2E'    },
                    { angle:   0, color: '#22d3ee', label: 'CHAIN'  },
                    { angle:  90, color: '#34d399', label: 'WALLET' },
                    { angle: 180, color: '#8b5cf6', label: 'RELAY'  },
                  ].map(({ angle, color, label }) => {
                    const rad = angle * Math.PI / 180
                    const r   = 44
                    return (
                      <div key={label} className="absolute flex flex-col items-center gap-1"
                        style={{ top: `${50 - r * Math.cos(rad)}%`, left: `${50 + r * Math.sin(rad)}%`, transform: 'translate(-50%,-50%)' }}>
                        <div className="h-2.5 w-2.5 animate-pulse rounded-full"
                          style={{ background: color, boxShadow: `0 0 10px ${color}`, animationDuration: `${2 + Math.random() * 2}s` }} />
                        <span className="font-mono text-[7px] tracking-wider" style={{ color }}>{label}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-5 font-mono text-[9px] tracking-[0.2em] text-zinc-600">ZERO-TRUST ARCHITECTURE</div>
              </div>

              {/* ── Audit terminal ── */}
              <div className="overflow-hidden rounded-2xl border border-white/5 lg:col-span-3"
                style={{ background: 'rgba(3,3,8,0.85)', backdropFilter: 'blur(12px)' }}>
                {/* animated top border */}
                <div className="h-px w-full"
                  style={{ background: 'linear-gradient(90deg, transparent, #1800cc, #34d399, #1800cc, transparent)', backgroundSize: '200% 100%', animation: 'border-flow 3s linear infinite' }} />

                {/* terminal titlebar */}
                <div className="flex items-center gap-2 border-b border-white/5 bg-black/30 px-5 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#34d399]" style={{ boxShadow: '0 0 6px #34d399' }} />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <span className="ml-3 font-mono text-[10px] text-zinc-500">evmchat --audit --vectors=all</span>
                  <span className="ml-auto font-mono text-[9px] text-zinc-700">exit: 0</span>
                </div>

                <div className="p-5">
                  {/* scan progress bar */}
                  <div className="mb-5 rounded-xl border border-white/5 bg-black/50 p-3.5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[9px] tracking-widest text-zinc-600">SCANNING ATTACK SURFACE</span>
                      <span className="font-mono text-[9px] text-[#34d399]">100% — CLEAN</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1800cc] via-[#3300ff] to-[#34d399]"
                        style={{ width: '100%', boxShadow: '0 0 12px #34d399, 0 0 4px #34d399' }} />
                    </div>
                  </div>

                  {/* audit checks — staggered slide-in */}
                  <div className="space-y-2">
                    {[
                      { text: 'Content encrypted before any network transit',  tag: 'AES-256-GCM',  color: '#34d399', delay: '0ms'   },
                      { text: 'Keys are user-owned — platform access is zero', tag: 'ZERO-CUSTODY', color: '#34d399', delay: '80ms'  },
                      { text: 'Onchain proofs tamper-evident, content-free',   tag: 'PROOF-HASH',   color: '#34d399', delay: '160ms' },
                      { text: 'Relay nodes cannot read or modify messages',    tag: 'TRUSTLESS',    color: '#34d399', delay: '240ms' },
                      { text: 'Membership proofs are cryptographic, not ACL',  tag: 'ZK-READY',     color: '#34d399', delay: '320ms' },
                    ].map(({ text, tag, color, delay }) => (
                      <div
                        key={tag}
                        className="relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 animate-check-in"
                        style={{ animationDelay: delay, animationFillMode: 'both', background: 'rgba(0,0,0,0.18)' }}
                      >
                        {/* left accent */}
                        <div className="absolute left-0 top-2 bottom-2 w-px" style={{ background: `linear-gradient(180deg, transparent, ${color}AA, transparent)` }} />

                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                          style={{ background: color + '1a', border: `1px solid ${color}44`, color }}
                        >
                          ✓
                        </span>

                        <span className="flex-1 font-mono text-[10px] leading-5 text-white">{text}</span>

                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[8px] tracking-widest"
                          style={{ color, background: color + '10', border: `1px solid ${color}22` }}
                        >
                          {tag}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* result line */}
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#34d399]/25 px-4 py-3"
                    style={{ background: 'rgba(52,211,153,0.06)', boxShadow: '0 0 20px rgba(52,211,153,0.05) inset' }}>
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399]" style={{ boxShadow: '0 0 8px #34d399' }} />
                    <span className="font-mono text-[10px] text-[#34d399]">All attack vectors audited — zero vulnerabilities detected.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security property strip */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: 'INTEGRITY',    value: 'Tamper-evident',      desc: 'Onchain proof anchoring',    accent: '#22d3ee', icon: ICONS.shield },
                { label: 'PRIVACY',      value: 'Client-side keys',    desc: 'Zero platform knowledge',    accent: '#a78bfa', icon: ICONS.lock   },
                { label: 'IDENTITY',     value: 'Wallet-native',       desc: 'No passwords or accounts',   accent: '#a0b0ff', icon: ICONS.key    },
                { label: 'TRUST',        value: 'Relay-minimized',     desc: 'Node cannot decrypt',        accent: '#34d399', icon: ICONS.globe  },
                { label: 'DISCLOSURE',   value: 'Selective design',    desc: 'Share only what you choose', accent: '#f472b6', icon: ICONS.zap    },
                { label: 'AUDITABILITY', value: 'Public proof layer',  desc: 'Open & verifiable',          accent: '#60a5fa', icon: ICONS.link   },
              ].map(({ label, value, desc, accent, icon }) => (
                <div key={label}
                  className="group rounded-xl border border-white/5 p-4 transition-all duration-300 hover:border-white/10"
                  style={{ background: 'rgba(3,3,8,0.8)', backdropFilter: 'blur(8px)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px ${accent}18` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}>
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300 group-hover:scale-110"
                    style={{ borderColor: accent + '35', background: accent + '12' }}>
                    <Icon d={icon} size={15} stroke={accent} />
                  </div>
                  <div className="font-mono text-[8px] tracking-widest" style={{ color: accent }}>{label}</div>
                  <div className="mt-0.5 text-[11px] font-bold text-white">{value}</div>
                  <div className="mt-1 text-[9px] leading-4 text-white">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            ROADMAP — release log
        ════════════════════════════════════════════════════════════════ */}
        <section id="roadmap" className="border-t border-white/5 bg-[#030308] py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-14">
              <div className="label-mono mb-2 text-zinc-600">// changelog</div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Building in phases.</h2>
              <p className="mt-2 text-xs text-white">A focused path from core utility to open platform.</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  version: 'v1.0',
                  status: 'LIVE',
                  statusColor: '#34d399',
                  title: 'Core Messaging',
                  desc: 'Foundational encrypted messaging infrastructure.',
                  items: ['Channel & DM messaging', 'AES-256 E2E encryption', 'Multi-device sync', 'Onchain integrity proof anchoring'],
                },
                {
                  version: 'v2.0',
                  status: 'BUILDING',
                  statusColor: '#3300ff',
                  title: 'Communities & Roles',
                  desc: 'Permissioned group infrastructure for onchain communities.',
                  items: ['Token / NFT gated rooms', 'Role-based permissions', 'Moderation tooling', 'Selective disclosure & receipts'],
                },
                {
                  version: 'v3.0',
                  status: 'PLANNED',
                  statusColor: '#374151',
                  title: 'SDK & Integrations',
                  desc: 'Open developer platform for embedding messaging anywhere.',
                  items: ['Developer SDK & docs', 'Webhooks & automation bots', 'Composable API primitives', 'Embedded messaging for dApps'],
                },
              ].map(({ version, status, statusColor, title, desc, items }) => (
                <div key={version} className="group flex gap-5 rounded-2xl border border-white/5 bg-[#05060f] p-5 transition-all hover:border-white/10">
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <span className="font-mono text-xs font-bold text-white">{version}</span>
                    <div className="h-full w-px bg-white/5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: statusColor }}>◆ {status}</span>
                      <h3 className="text-sm font-semibold text-white">{title}</h3>
                    </div>
                    <p className="mb-3 text-xs text-white">{desc}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1">
                      {items.map(item => (
                        <span key={item} className="flex items-center gap-1.5 font-mono text-[10px] text-white">
                          <span style={{ color: statusColor }}>→</span> {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            TOKENOMICS
        ════════════════════════════════════════════════════════════════ */}
        <section id="tokenomics" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="label-mono mb-2 text-zinc-600">// tokenomics</div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Built for a <span className="gradient-text">fair Solana launch.</span>
              </h2>
              <p className="mt-2 max-w-md text-xs leading-6 text-white">
                Fixed supply, no buy or sell tax, renounced ownership, and burned liquidity.
              </p>
            </div>
            <button
              type="button"
              onClick={copyContractAddress}
              disabled={!HAS_TOKEN_CONTRACT_ADDRESS}
              className="inline-flex items-center justify-center rounded-2xl border border-[#34d399]/30 bg-[#34d399]/10 px-5 py-2.5 font-mono text-xs font-semibold text-[#34d399] transition-all hover:bg-[#34d399]/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copiedCa ? 'Copied CA' : HAS_TOKEN_CONTRACT_ADDRESS ? 'Copy CA' : 'CA coming soon'}
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="anim-border2 relative overflow-hidden rounded-2xl p-6 lg:col-span-2">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#1800cc]/20 blur-3xl" />
              <div className="relative">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#34d399]/25 bg-[#34d399]/8 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399]" style={{ boxShadow: '0 0 6px #34d399' }} />
                  <span className="font-mono text-[9px] tracking-widest text-[#34d399]">PUMP.FUN LAUNCH</span>
                </div>

                <div className="label-mono mb-2 text-zinc-600">Name</div>
                <h3 className="text-4xl font-bold tracking-tight text-white">EVM Chat</h3>
                <div className="mt-3 font-mono text-xl font-bold text-[#a0b0ff]">$EVM</div>

                <div className="mt-7 rounded-2xl border border-white/5 bg-black/35 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">Contract address</span>
                    <button
                      type="button"
                      onClick={copyContractAddress}
                      disabled={!HAS_TOKEN_CONTRACT_ADDRESS}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[9px] font-semibold text-zinc-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {copiedCa ? 'Copied' : HAS_TOKEN_CONTRACT_ADDRESS ? 'Copy' : 'Soon'}
                    </button>
                  </div>
                  <div className="break-all font-mono text-xs leading-5 text-zinc-400">{TOKEN_CONTRACT_ADDRESS}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-3">
              {[
                { label: 'Total Supply', value: '1.000.000.000', accent: '#a0b0ff' },
                { label: 'Chain', value: 'Solana', accent: '#22d3ee' },
                { label: 'Launch', value: 'pump.fun', accent: '#34d399' },
                { label: 'Tax', value: '0/0', accent: '#c084fc' },
                { label: 'Ownership', value: 'Renounced', accent: '#60a5fa' },
                { label: 'Liquidity', value: 'LP burned', accent: '#f472b6' },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  className="group rounded-2xl border border-white/5 bg-[#05060f] p-5 transition-all hover:border-white/10"
                  style={{ boxShadow: `0 0 0 1px ${accent}08 inset` }}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border transition-transform group-hover:scale-105"
                    style={{ borderColor: accent + '35', background: accent + '12' }}>
                    <Icon d={ICONS.check} size={16} stroke={accent} />
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">{label}</div>
                  <div className="mt-1 text-lg font-bold text-white" style={{ color: accent }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/5 bg-[#030308] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">Dev buy</div>
                <div className="mt-1 text-xl font-bold text-white">1 SOL</div>
              </div>
              <div className="max-w-xl font-mono text-xs leading-6 text-zinc-400">
                A simple launch profile for the EVM Chat community: Solana speed, pump.fun distribution, and no tax friction.
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            CTA — with mock chat preview
        ════════════════════════════════════════════════════════════════ */}
        <section id="cta" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="rule-glow mb-6" />
          <div className="relative overflow-hidden rounded-3xl border border-[#1800cc]/20 bg-[#030308] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.7)] lg:p-12">
            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#1800cc]/12 blur-3xl" />

            <div className="relative grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="badge badge-brand mb-5 inline-flex">
                  <span className="animate-pulse2 h-1.5 w-1.5 rounded-full bg-[#3300ff]" />
                  Solana messaging layer
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
                  Join the messaging<br />
                  <span className="gradient-text">layer of Web3.</span>
                </h2>
                <p className="mt-4 text-xs leading-6 text-white">
                  Be among the first builders and communities to ship private,
                  verifiable messaging on open infrastructure.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Btn href="#">
                    Dapp coming soon
                    <Icon d={ICONS.arrow} size={14} stroke="currentColor" />
                  </Btn>
                  <Btn href={X_PROFILE_URL} variant="ghost" target="_blank" rel="noopener noreferrer">Follow us on X</Btn>
                </div>
              </div>

              {/* mock messaging interface */}
              <div className="rounded-2xl border border-white/6 bg-black/60 overflow-hidden font-mono text-xs">
                {/* titlebar */}
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#34d399]" style={{ boxShadow: '0 0 6px #34d399' }} />
                    <span className="text-[10px] text-zinc-500">#dao-ops · 3 members</span>
                  </div>
                  <span className="text-[10px] text-zinc-700">evmchat://channel/9xQeWv</span>
                </div>
                {/* messages */}
                <div className="space-y-3 p-4">
                  {[
                    { addr: '9xQeWv…E3tK', msg: 'Proposal #42 passed ✓', time: '12:01', self: false, color: '#a0b0ff' },
                    { addr: '7GgPqS…Vw2m', msg: 'Treasury tx confirmed on BASE', time: '12:02', self: false, color: '#22d3ee' },
                    { addr: 'you',         msg: 'proof anchored · block #14,220,811', time: '12:03', self: true,  color: '#3300ff' },
                    { addr: '9xQeWv…E3tK', msg: 'gm — channel is token-gated 🔐', time: '12:04', self: false, color: '#a0b0ff' },
                  ].map(({ addr, msg, time, self, color }) => (
                    <div key={time} className={`flex items-end gap-2 ${self ? 'flex-row-reverse' : ''}`}>
                      <div className="h-5 w-5 shrink-0 rounded-full" style={{ background: `${color}50` }} />
                      <div className={`max-w-[75%] rounded-lg px-3 py-1.5 ${self ? 'rounded-br-none bg-[#1800cc]/25' : 'rounded-bl-none bg-white/4'}`}>
                        <div className="mb-0.5 text-[9px]" style={{ color }}>{addr}</div>
                        <div className="text-zinc-300">{msg}</div>
                        <div className="mt-0.5 text-right text-[9px] text-zinc-700">{time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* input bar */}
                <div className="flex items-center gap-2 border-t border-white/5 px-4 py-2.5">
                  <div className="flex-1 rounded-lg border border-white/5 bg-white/3 px-3 py-1.5 text-zinc-600">encrypt + send…</div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1800cc]/30">
                    <Icon d={ICONS.arrow} size={12} stroke="#a0b0ff" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════════════════ */}
        <footer className="border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={LOGO_SRC}
                  alt="EVM Chat"
                  className="size-9 rounded-xl"
                  width={160}
                  height={160}
                  loading="lazy"
                />
                <div>
                  <div className="text-sm font-bold text-white">EVM Chat</div>
                  <div className="label-mono mt-0.5">Private Conversations · Public Infrastructure</div>
                </div>
              </div>

              <nav className="flex flex-wrap gap-5">
                {[
                  ['#features', 'Features'],
                  ['#how', 'Protocol'],
                  ['#security', 'Security'],
                  ['#roadmap', 'Roadmap'],
                  ['#tokenomics', 'Tokenomics'],
                ].map(([href, label]) => (
                  <a key={href} href={href} className="font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-300">
                    {label}
                  </a>
                ))}
                <a href={X_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-300">
                  X
                </a>
              </nav>
            </div>

            <div className="rule-glow mt-8 mb-5" />
            <div className="label-mono text-zinc-600">
              © {new Date().getFullYear()} EVM Chat · All rights reserved
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
