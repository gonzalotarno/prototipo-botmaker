import { useEffect, useState } from 'react'
import {
  Menu, Inbox, HelpCircle, ChevronDown, ChevronRight, ArrowRight,
  Search, MessagesSquare, Megaphone,
  Sparkles, Calendar, Globe, Mail, Phone, Instagram, Bell, Plus,
} from 'lucide-react'

// ── Home — Botmaker Console ──────────────────────────────────────────────────
// Language synthesized from Webflow / Framer / Voiceflow / Relevance AI /
// Profound / Linear research, scoped to what actually exists today:
//   • No AI prompt input (no generator yet).
//   • No workspace tabs (Agents / Orchestrators / Bots are the same surface
//     entered from a single CTA).
//   • No templates section (not shipped).
// What ships: 4 surface CTAs, "Explora Botmaker" navigator, real recent edits,
// real upcoming webinars. Craft applied: white canvas, indigo rationed to the
// launching surface, Inter UI, hairline borders, no shadow at rest, motion
// 140–180ms opacity + 1–2px translate only.

const T = {
  surface:    '#FFFFFF',
  canvas:     '#F7F8FC',     // warm-cool off-white so pure-white cards lift naturally
  subtle:     '#FAFAFA',
  fg:         '#0A0A0F',
  fg2:        '#52525B',
  fg3:        '#8A8F98',
  fg4:        '#A1A1AA',
  hair:       '#E8E9ED',
  hairStrong: '#D4D4D8',
  accent:     '#304FFE',
  accentSoft: '#EBEEFF',
  accentRing: 'rgba(48,79,254,0.18)',
  ok:         '#10B981',
  warn:       '#F59E0B',
  err:        '#EF4444',
} as const

const INTER = "'Inter', 'Roboto', system-ui, -apple-system, sans-serif"

const FONT_LINK_ID = 'bm-home-inter'
function useInter() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return
    const link = document.createElement('link')
    link.id = FONT_LINK_ID
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
  }, [])
}

export default function Home({ variant = 'a' }: { variant?: 'a' | 'b' | 'c' | 'd' } = {}) {
  useInter()
  if (variant === 'd') return <HomeBanner />
  if (variant === 'c') return <HomeWebStyle />
  if (variant === 'b') return <HomeSectioned />
  return (
    <div style={{
      minHeight: '100vh', background: T.canvas, color: T.fg,
      fontFamily: INTER, WebkitFontSmoothing: 'antialiased',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <Atmosphere />
      <TopBar />
      <main style={{ flex: 1, width: '100%', maxWidth: 1180, margin: '0 auto', padding: '44px 28px 80px', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        <Greeting variant={variant} />
        <HeroCards />
        <Explora />
        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 24, marginTop: 24 }}>
          <UltimosMovimientos />
          <ProximosEventos />
        </div>
      </main>
      <Footer />
      <KeyFrames />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Atmosphere — soft aurora orbs + faint dot grid behind everything.
// Keeps the canvas non-flat without breaking the "premium tool" calm.
// ─────────────────────────────────────────────────────────────────────────────
function Atmosphere() {
  return (
    <>
      {/* Aurora top-right — indigo halo */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: -260, right: -200,
          width: 880, height: 880,
          background: 'radial-gradient(circle at center, rgba(48,79,254,0.10) 0%, rgba(48,79,254,0.05) 35%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />
      {/* Aurora bottom-left — cooler, more diffuse */}
      <div
        aria-hidden
        style={{
          position: 'absolute', bottom: -300, left: -260,
          width: 760, height: 760,
          background: 'radial-gradient(circle at center, rgba(98,114,255,0.06) 0%, rgba(48,79,254,0.03) 40%, transparent 75%)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />
      {/* Faint dot grid — masked at center area where content lives */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(10,10,15,0.045) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 35%, transparent 0%, transparent 35%, black 95%)',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 35%, transparent 0%, transparent 35%, black 95%)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TopBar
// ─────────────────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <header style={{
      background: T.surface, borderBottom: `1px solid ${T.hair}`,
      padding: '0 24px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <IconBtn ariaLabel="Toggle menu"><Menu size={18} /></IconBtn>
        <span style={{ fontSize: 13.5, fontWeight: 500, color: T.fg, letterSpacing: '-0.005em' }}>Inicio</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <IconBtn ariaLabel="Search"><Search size={17} /></IconBtn>
        <IconBtn ariaLabel="Inbox"><Inbox size={17} /></IconBtn>
        <IconBtn ariaLabel="Help"><HelpCircle size={17} /></IconBtn>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px',
            borderRadius: 8, border: `1px solid ${T.hair}`, background: T.surface, cursor: 'pointer',
            marginLeft: 6, transition: 'background 140ms ease-out',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = T.subtle)}
          onMouseLeave={e => (e.currentTarget.style.background = T.surface)}
        >
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: T.fg, color: T.surface,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10.5, fontWeight: 600,
          }}>GT</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
            <span style={{ fontSize: 9.5, color: T.fg3, fontWeight: 500, letterSpacing: '0.02em' }}>Estado</span>
            <span style={{ fontSize: 11.5, color: T.fg, fontWeight: 500 }}>En línea</span>
          </div>
          <ChevronDown size={12} style={{ color: T.fg3 }} />
        </button>
      </div>
    </header>
  )
}

function IconBtn({ children, ariaLabel }: { children: React.ReactNode; ariaLabel: string }) {
  return (
    <button
      aria-label={ariaLabel}
      style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: T.fg3, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 140ms ease-out, color 140ms ease-out',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = T.subtle; e.currentTarget.style.color = T.fg }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.fg3 }}
    >{children}</button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Greeting
// ─────────────────────────────────────────────────────────────────────────────
function Greeting({ variant = 'a' }: { variant?: 'a' | 'b' } = {}) {
  const hour = new Date().getHours()
  const partOfDay = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  if (variant === 'b') {
    return (
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          margin: 0, fontFamily: INTER, fontWeight: 600,
          fontSize: 'clamp(34px, 4vw, 44px)', lineHeight: 1.05,
          letterSpacing: '-0.03em', color: T.fg,
        }}>
          {partOfDay}, Gonzalo.
        </h1>
        <p style={{ margin: '10px 0 0', fontSize: 16, color: T.fg3, fontWeight: 400, maxWidth: 560, lineHeight: 1.5 }}>
          Tu hub para construir, atender y comunicar. Comienza por donde te lleve el día.
        </p>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
      <h1 style={{
        margin: 0, fontFamily: INTER,
        fontSize: 28, fontWeight: 600, color: T.fg,
        letterSpacing: '-0.02em',
      }}>
        {partOfDay}, Gonzalo.
      </h1>
      <span style={{ fontSize: 15, color: T.fg3, fontWeight: 400 }}>¿Qué deseas hacer hoy?</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero — 4 surface CTAs. Indigo rationed to the launching surface (Agentes IA).
// ─────────────────────────────────────────────────────────────────────────────
function HeroCards() {
  return (
    <section style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
      marginBottom: 56,
    }}>
      <HeroCard
        kind="featured"
        icon={<AiAgentIcon size={18} />}
        eyebrow="Nuevo"
        title="Diseñar agentes de IA"
        desc="Crea, modifica y administra agentes inteligentes que conversan y resuelven."
        cta={{ label: 'Crear agente', href: '/bienvenida' }}
      />
      <HeroCard
        icon={<ChatbotIcon size={18} />}
        title="Diseñar bots con flujos"
        desc="Crea, modifica y administra bots con flujos determinísticos."
        chips={[
          { label: 'Chatbots', href: '/agents' },
          { label: 'MailBots', href: '#' },
          { label: 'Callbots', href: '#' },
        ]}
      />
      <HeroCard
        icon={<MessagesSquare size={18} />}
        title="Atender usuarios"
        desc="Responde y gestiona conversaciones en tiempo real."
        chips={[
          { label: 'Ir a Chats', href: '#' },
          { label: 'Tickets', href: '#' },
        ]}
      />
      <HeroCard
        icon={<Megaphone size={18} />}
        title="Enviar notificaciones"
        desc="Gestiona campañas y notificaciones masivas."
        cta={{ label: 'Notification engine', href: '#', variant: 'ghost' }}
      />
    </section>
  )
}

interface HeroProps {
  icon: React.ReactNode
  title: string
  desc: string
  cta?: { label: string; href: string; variant?: 'primary' | 'ghost' }
  chips?: { label: string; href: string }[]
  eyebrow?: string
  kind?: 'featured' | 'default'
}

function HeroCard({ icon, title, desc, cta, chips, eyebrow, kind }: HeroProps) {
  const featured = kind === 'featured'
  const previewHover = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('previewHover') === '1' && featured
  const [hoverState, setHover] = useState(false)
  const hover = hoverState || previewHover
  const borderColor = featured && hover
    ? T.accent
    : hover ? T.hairStrong : T.hair
  const boxShadow = featured && hover
    ? `0 18px 44px -12px rgba(48,79,254,0.32), 0 0 0 4px ${T.accentRing}, 0 1px 2px rgba(15,23,42,0.04)`
    : 'none'
  return (
    <a
      href={cta?.href ?? chips?.[0]?.href ?? '#'}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 12,
        padding: '20px 20px 18px',
        background: T.surface,
        border: `1px solid ${borderColor}`,
        borderRadius: 12, textDecoration: 'none', color: T.fg,
        minHeight: 224,
        boxShadow,
        transition: 'border-color 200ms ease-out, transform 200ms ease-out, box-shadow 200ms ease-out',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Featured accent stripe — only on the launching card */}
      {featured && (
        <span aria-hidden style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: T.accent,
        }} />
      )}

      {/* Header: icon box + eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: featured ? T.accentSoft : T.subtle,
          border: `1px solid ${featured ? 'transparent' : T.hair}`,
          color: featured ? T.accent : T.fg2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
        {eyebrow && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6,
            background: T.accentSoft, color: T.accent,
            fontSize: 10.5, fontWeight: 600, letterSpacing: '0.02em',
            fontFamily: INTER,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 100, background: T.accent }} />
            {eyebrow}
          </span>
        )}
      </div>

      {/* Title + desc */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          margin: 0, fontFamily: INTER, fontSize: 14.5, fontWeight: 600,
          color: T.fg, letterSpacing: '-0.005em', lineHeight: 1.3,
        }}>{title}</h3>
        <p style={{
          margin: '6px 0 0', fontSize: 12.5, color: T.fg3,
          lineHeight: 1.5, fontWeight: 400,
        }}>{desc}</p>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        {cta && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            background: cta.variant === 'ghost' ? T.surface : T.accent,
            color: cta.variant === 'ghost' ? T.fg : T.surface,
            border: cta.variant === 'ghost' ? `1px solid ${T.hair}` : 'none',
            fontFamily: INTER, fontSize: 12.5, fontWeight: 500,
            letterSpacing: '-0.005em',
          }}>
            {cta.label}
            {cta.variant !== 'ghost' && <ArrowRight size={13} />}
          </span>
        )}
        {chips?.map(c => (
          <span key={c.label} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '7px 12px', borderRadius: 7,
            background: T.surface, border: `1px solid ${T.hair}`,
            color: T.fg2, fontFamily: INTER, fontSize: 12, fontWeight: 500,
          }}>{c.label}</span>
        ))}
      </div>
    </a>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME SECTIONED (variant B) — categorized surface index. CTAs above the fold,
// grouped by intent (Diseñar / Operar / Comunicar). Bots con Flujos exposes
// Chatbots / MailBots / Callbots as separate destinations.
// ─────────────────────────────────────────────────────────────────────────────
function HomeSectioned() {
  return (
    <div style={{
      minHeight: '100vh', background: T.canvas, color: T.fg,
      fontFamily: INTER, WebkitFontSmoothing: 'antialiased',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <Atmosphere />
      <TopBar />
      <main style={{ flex: 1, width: '100%', maxWidth: 1180, margin: '0 auto', padding: '40px 28px 64px', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        <Greeting variant="b" />

        {/* Row 1: Diseñar — 4-col grid with Agentes IA + 3 bots flujos */}
        <DesignSurfacesGrid />

        {/* Row 2: Atender + Notificaciones — 2-col grid */}
        <OperarComunicarGrid />

        {/* Below: Explora + listas */}
        <div style={{ marginTop: 44 }}>
          <Explora />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 24, marginTop: 24 }}>
          <UltimosMovimientos />
          <ProximosEventos />
        </div>
      </main>
      <Footer />
      <KeyFrames />
    </div>
  )
}

function GridSecHead({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h3 style={{
      margin: '0 0 10px',
      fontFamily: INTER, fontSize: 11, fontWeight: 600, color: T.fg3,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      ...style,
    }}>{children}</h3>
  )
}

// ── Row 1: Design surfaces — 4-col grid (Agentes IA featured + 3 bots) ─────
function DesignSurfacesGrid() {
  return (
    <section style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <GridSecHead style={{ margin: 0 }}>Diseñar</GridSecHead>
        <span style={{ fontSize: 11.5, color: T.fg4 }}>· Elige qué construir</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <DesignSurfaceCard
          featured
          icon={<AiAgentIcon size={18} />}
          title="Agentes de IA"
          desc="Inteligentes — entienden, deciden y resuelven 24/7."
          glyph={<><Globe size={11} /><Phone size={11} /><Instagram size={11} /><Mail size={11} /></>}
          ctaLabel="Crear agente"
          href="/bienvenida"
          eyebrow="NUEVO"
        />
        <DesignSurfaceCard
          icon={<MessagesSquare size={18} />}
          title="Chatbots"
          desc="Conversaciones por chat: web, WhatsApp e Instagram."
          glyph={<><Globe size={11} /><Phone size={11} /><Instagram size={11} /></>}
          ctaLabel="Abrir Chatbots"
          href="/agents"
        />
        <DesignSurfaceCard
          icon={<Mail size={18} />}
          title="MailBots"
          desc="Respuestas automáticas y workflows por email."
          glyph={<Mail size={11} />}
          ctaLabel="Abrir MailBots"
          href="#"
        />
        <DesignSurfaceCard
          icon={<Phone size={18} />}
          title="Callbots"
          desc="Llamadas automatizadas con voz y IVR."
          glyph={<Phone size={11} />}
          ctaLabel="Abrir Callbots"
          href="#"
        />
      </div>
    </section>
  )
}

function DesignSurfaceCard({ icon, title, desc, glyph, ctaLabel, href, featured, eyebrow }: {
  icon: React.ReactNode
  title: string
  desc: string
  glyph: React.ReactNode
  ctaLabel: string
  href: string
  featured?: boolean
  eyebrow?: string
}) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 12,
        padding: '18px 18px 16px',
        background: T.surface,
        border: `1px solid ${featured ? (hover ? T.accent : T.accent) : (hover ? T.hairStrong : T.hair)}`,
        borderRadius: 12,
        textDecoration: 'none', color: T.fg,
        boxShadow: featured && hover
          ? `0 18px 44px -12px rgba(48,79,254,0.32), 0 0 0 4px ${T.accentRing}`
          : 'none',
        transition: 'border-color 200ms ease-out, transform 200ms ease-out, box-shadow 200ms ease-out',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {featured && (
        <span aria-hidden style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: T.accent,
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: featured ? T.accentSoft : T.subtle,
          border: `1px solid ${featured ? 'transparent' : T.hair}`,
          color: featured ? T.accent : T.fg2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
        {eyebrow ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 7px', borderRadius: 5,
            background: T.accentSoft, color: T.accent,
            fontFamily: INTER, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em',
          }}>
            <span style={{ width: 4, height: 4, borderRadius: 100, background: T.accent }} />
            {eyebrow}
          </span>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: T.fg4 }}>
            {glyph}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 600, color: T.fg, letterSpacing: '-0.005em' }}>{title}</div>
        <p style={{ margin: '4px 0 0', fontSize: 12.5, color: T.fg3, lineHeight: 1.5, minHeight: 38 }}>{desc}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 12, fontWeight: featured ? 600 : 500,
          color: featured ? T.accent : (hover ? T.accent : T.fg2),
          transition: 'color 140ms ease-out',
        }}>
          {ctaLabel} <ArrowRight size={11} />
        </span>
        {featured && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: T.fg4 }}>
            {glyph}
          </div>
        )}
      </div>
    </a>
  )
}

// ── (legacy) Featured Agentes IA banner — kept for reference, unused ────────

// ── Row 3: Operar + Comunicar — 2-col grid ──────────────────────────────────
function OperarComunicarGrid() {
  return (
    <section>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SurfaceCardGrid
          icon={<MessagesSquare size={18} />}
          title="Atender usuarios"
          meta="12 esperando"
          desc="Chats, tickets y contactos en tiempo real cuando la IA escala."
          chips={[
            { label: 'Chats', href: '#' },
            { label: 'Tickets', href: '#' },
            { label: 'Contactos', href: '#' },
          ]}
        />
        <SurfaceCardGrid
          icon={<Megaphone size={18} />}
          title="Enviar notificaciones"
          desc="Campañas y notificaciones masivas en WhatsApp, email y otros canales."
          chips={[
            { label: 'Notification engine', href: '#' },
          ]}
        />
      </div>
    </section>
  )
}

function SurfaceCardGrid({ icon, title, meta, desc, chips }: {
  icon: React.ReactNode
  title: string
  meta?: string
  desc: string
  chips: { label: string; href: string }[]
}) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: '44px 1fr', gap: 16,
        padding: '18px 20px',
        background: T.surface,
        border: `1px solid ${hover ? T.hairStrong : T.hair}`,
        borderRadius: 12,
        transition: 'border-color 160ms ease-out',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 11,
        background: T.subtle, border: `1px solid ${T.hair}`, color: T.fg2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h4 style={{ margin: 0, fontFamily: INTER, fontSize: 14.5, fontWeight: 600, color: T.fg, letterSpacing: '-0.01em' }}>{title}</h4>
          {meta && <span style={{ fontSize: 12, color: T.fg3 }}>· {meta}</span>}
        </div>
        <p style={{ margin: '4px 0 12px', fontSize: 12.5, color: T.fg3, lineHeight: 1.5 }}>{desc}</p>
        <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
          {chips.map(c => <SubChip key={c.label} href={c.href}>{c.label}</SubChip>)}
        </div>
      </div>
    </div>
  )
}


function SubChip({ href, children }: { href: string; children: React.ReactNode }) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={e => e.stopPropagation()}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '7px 14px', borderRadius: 8,
        background: hover ? T.subtle : T.surface,
        border: `1px solid ${hover ? T.hairStrong : T.hair}`,
        color: T.fg, fontFamily: INTER, fontSize: 12.5, fontWeight: 500, letterSpacing: '-0.005em',
        textDecoration: 'none',
        transition: 'all 140ms ease-out',
      }}
    >{children}</a>
  )
}

// ── Material Symbols "hub" — used for Orquestadores ─────────────────────────
function OrchestratorIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 -960 960 960" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M155-75q-35-35-35-85t35-85q35-35 85-35 14 0 26 3t23 8l57-71q-28-31-39-70t-5-78l-81-27q-17 25-43 40t-58 15q-50 0-85-35T0-580q0-50 35-85t85-35q50 0 85 35t35 85v8l81 28q20-36 53.5-61t75.5-32v-87q-39-11-64.5-42.5T360-840q0-50 35-85t85-35q50 0 85 35t35 85q0 42-26 73.5T510-724v87q42 7 75.5 32t53.5 61l81-28v-8q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-32 0-58.5-15T739-515l-81 27q6 39-5 77.5T614-340l57 70q11-5 23-7.5t26-2.5q50 0 85 35t35 85q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-20 6.5-38.5T624-232l-57-71q-41 23-87.5 23T392-303l-56 71q11 15 17.5 33.5T360-160q0 50-35 85t-85 35q-50 0-85-35Zm-35-465q17 0 28.5-11.5T160-580q0-17-11.5-28.5T120-620q-17 0-28.5 11.5T80-580q0 17 11.5 28.5T120-540Zm148.5 408.5Q280-143 280-160t-11.5-28.5Q257-200 240-200t-28.5 11.5Q200-177 200-160t11.5 28.5Q223-120 240-120t28.5-11.5Zm240-680Q520-823 520-840t-11.5-28.5Q497-880 480-880t-28.5 11.5Q440-857 440-840t11.5 28.5Q463-800 480-800t28.5-11.5ZM480-360q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm268.5 228.5Q760-143 760-160t-11.5-28.5Q737-200 720-200t-28.5 11.5Q680-177 680-160t11.5 28.5Q703-120 720-120t28.5-11.5Zm120-420Q880-563 880-580t-11.5-28.5Q857-620 840-620t-28.5 11.5Q800-597 800-580t11.5 28.5Q823-540 840-540t28.5-11.5ZM480-840ZM120-580Zm360 120Zm360-120ZM240-160Zm480 0Z"/>
    </svg>
  )
}

// ── Official Botmaker AI agent icon (avatarAI.svg, viewBox 140×140) ────────
function AiAgentIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M99.2461 25.3076C100.22 22.6748 103.944 22.6748 104.918 25.3076C108.282 34.3981 115.128 41.7254 123.879 45.7206L125.308 49.5829L123.879 53.4443C115.128 57.4395 108.282 64.7677 104.918 73.8583C103.974 76.4088 100.45 76.4887 99.3447 74.0976L99.2461 73.8583C95.6855 64.236 88.2246 56.5855 78.7314 52.7753L77.8066 52.4189C75.1738 51.4447 75.1738 47.7212 77.8066 46.747C87.7393 43.0716 95.5707 35.2402 99.2461 25.3076ZM102.082 38.582C99.0812 42.8586 95.3576 46.5822 91.081 49.5829C95.3574 52.5836 99.0813 56.3066 102.082 60.5829C105.083 56.3068 108.806 52.5835 113.082 49.5829C108.806 46.5822 105.083 42.8583 102.082 38.582ZM123.879 45.7206C124.69 46.0908 125.515 46.4354 126.357 46.747C128.99 47.7212 128.99 51.4447 126.357 52.4189C125.515 52.7305 124.69 53.0742 123.879 53.4443L125.308 49.5829L123.879 45.7206Z"/>
      <path d="M23.3327 58.3337C22.9853 58.3337 22.6379 58.5083 22.4642 58.9156L22.0589 60.0212C20.5535 64.0362 17.427 67.2365 13.374 68.7494L12.274 69.1567C11.4634 69.4476 11.4634 70.5532 12.274 70.8441L13.374 71.2514C17.3691 72.7643 20.5535 75.9065 22.0589 79.9796L22.4642 81.0852C22.6379 81.4925 22.9853 81.6671 23.3327 81.6671C23.6801 81.6671 24.0275 81.4925 24.2012 81.0852L24.6065 79.9796C26.1118 75.9647 29.2384 72.7643 33.2913 71.2514L34.3914 70.8441C35.202 70.5532 35.202 69.4476 34.3914 69.1567L33.2913 68.7494C29.2963 67.2365 26.1118 64.0943 24.6065 60.0212L24.2012 58.9156C24.0275 58.5083 23.6801 58.3337 23.3327 58.3337Z"/>
      <path d="M69.9933 83.1248C89.9935 83.1248 107.579 93.4517 117.713 109.044C120.366 113.126 120.014 117.763 117.758 121.243C115.559 124.633 111.621 126.875 107.133 126.875H32.8536C28.3657 126.875 24.4273 124.633 22.2286 121.243C19.9722 117.763 19.6204 113.126 22.2735 109.044C32.4073 93.4518 49.993 83.1248 69.9933 83.1248ZM69.9933 91.8748C53.0781 91.8748 38.1976 100.598 29.6095 113.812C28.972 114.793 29.0569 115.692 29.5694 116.482C30.1398 117.362 31.3028 118.125 32.8536 118.125H107.133C108.684 118.125 109.847 117.362 110.417 116.482C110.93 115.692 111.015 114.793 110.377 113.812C101.789 100.598 86.9084 91.8748 69.9933 91.8748Z"/>
      <path d="M42.2891 46.666C42.2892 31.3634 54.6944 18.9582 69.9971 18.958C75.0367 18.958 79.7745 20.3078 83.8545 22.668C85.946 23.8778 86.661 26.554 85.4512 28.6455C84.2413 30.7369 81.5651 31.4511 79.4736 30.2412C76.6896 28.6307 73.4575 27.708 69.9971 27.708C59.5269 27.7082 51.0392 36.1959 51.0391 46.666C51.0391 57.1363 59.5268 65.6248 69.9971 65.625C71.6404 65.625 73.229 65.4163 74.7402 65.0273C77.0801 64.4252 79.465 65.834 80.0674 68.1738C80.6697 70.5138 79.2609 72.8997 76.9209 73.502C74.7033 74.0727 72.3821 74.375 69.9971 74.375C54.6943 74.3748 42.2891 61.9688 42.2891 46.666Z"/>
    </svg>
  )
}

// ── Chatbot icon (from /Users/gonza/Downloads/Chatbot.svg) ─────────────────
function ChatbotIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M3.1725 7.06695C3.39566 6.83875 3.58641 6.60869 3.76965 6.38766C4.01163 6.0958 4.24052 5.81973 4.5137 5.58463C5.91746 4.37872 7.58303 3.72558 9.37808 3.46374C11.6997 3.1248 14.0214 3.14517 16.295 3.86086C17.9882 4.39326 19.4371 5.27916 20.5048 6.72801C20.5511 6.7913 20.6029 6.85092 20.681 6.94075C20.7231 6.98924 20.7729 7.04649 20.8335 7.11786V5.72574V5.62914C20.8335 5.60934 20.8335 5.58952 20.8334 5.56969C20.8329 5.43071 20.8325 5.29111 20.8554 5.15492C20.9005 4.87999 21.0503 4.67197 21.3456 4.65306C21.654 4.6327 21.8634 4.80435 21.9303 5.10255C21.974 5.30038 21.9813 5.51131 21.9813 5.71642C21.983 7.06141 21.9837 8.02564 21.9843 8.83501C21.9857 10.7541 21.9864 11.8028 21.9987 14.9919C22.0046 16.6342 21.3208 17.8852 19.9986 18.8221C18.477 19.8999 16.7314 20.3363 14.9247 20.5618C12.7762 20.8309 10.6218 20.8149 8.48347 20.476C6.79608 20.2098 5.17266 19.7428 3.79218 18.6577C2.60664 17.7252 1.99422 16.5353 2.00004 15.0065C2.01461 11.7751 2.01504 10.3383 2.01569 8.12855C2.01596 7.2486 2.01626 6.24608 2.0175 4.95889L2.01745 4.92197C2.01779 4.96766 2.02101 5.23471 2.04223 5.0918C2.04871 5.04773 2.0576 5.00536 2.06895 4.96505L3.17187 5.88765C3.17201 5.93114 3.17214 5.98097 3.17228 6.03951C3.17234 6.06755 3.17242 6.09759 3.1725 6.12988L3.17318 6.45282C3.17285 6.42074 3.1725 6.52748 3.1725 7.06695ZM3.17378 6.64789C3.17371 6.59585 3.17345 6.47878 3.17318 6.45282C3.17371 6.68697 3.17384 6.69997 3.17378 6.64789ZM3.17186 5.88544L3.76965 6.38766L3.17187 5.88765C3.17187 5.8869 3.17187 5.88615 3.17186 5.88544ZM3.17186 5.88544L2.0704 4.95999C2.14652 4.69575 2.32969 4.52124 2.63863 4.53757C2.97612 4.55357 3.1405 4.80086 3.15213 5.11943C3.1551 5.20241 3.1576 5.27057 3.15971 5.32821C3.16487 5.46867 3.16774 5.5467 3.16941 5.62475C3.17094 5.69588 3.17148 5.76703 3.17186 5.88544ZM2.0704 4.95999L2.01741 4.91548L2.01745 4.92197L2.06895 4.96505C2.06943 4.96336 2.06991 4.96167 2.0704 4.95999ZM13.4956 16.8431C14.2468 16.8433 14.9979 16.8434 15.7495 16.8452C16.3139 16.8466 16.8521 16.7433 17.3583 16.4902C18.8436 15.744 19.6364 14.058 19.2567 12.4564C18.8508 10.7516 17.5067 9.64458 15.7873 9.62858C14.1072 9.61258 12.4271 9.61112 10.7484 9.6155C10.4537 9.61629 10.1581 9.60904 9.86226 9.60175C9.09339 9.58283 8.3234 9.56388 7.56703 9.68679C5.70215 9.98789 4.5297 11.7058 4.69262 13.77C4.82354 15.4167 6.3771 16.8132 8.14454 16.8408C9.03556 16.8549 9.9273 16.8516 10.8188 16.8481C11.2109 16.8467 11.6031 16.8452 11.995 16.8452L11.9935 16.8423C12.4944 16.8428 12.995 16.843 13.4956 16.8431ZM8.49235 12.1671C9.17314 12.2151 9.69681 12.5439 10.0677 13.0995C10.2636 13.3938 10.0785 13.5096 9.89618 13.6236C9.81985 13.6713 9.74402 13.7187 9.69681 13.7789C9.55424 13.9607 9.3855 14.0058 9.18476 13.7905C8.61888 13.1839 8.36723 13.1752 7.79118 13.773C7.53516 14.0383 7.35217 13.8762 7.19551 13.7373C7.17951 13.7231 7.16376 13.7092 7.14822 13.6959C7.12276 13.6745 7.09389 13.6532 7.06406 13.6313C6.9014 13.5115 6.71196 13.3719 6.91111 13.0879C7.2995 12.5337 7.8101 12.2093 8.4938 12.1656L8.49235 12.1671ZM15.3593 12.1636C14.7065 12.2176 14.1961 12.5667 13.8252 13.1164C13.6443 13.384 13.8203 13.4972 13.9896 13.6062C14.0503 13.6453 14.1102 13.6839 14.1525 13.7288C14.3009 13.8874 14.4682 14.0386 14.714 13.8088C15.3977 13.1702 15.5097 13.1659 16.128 13.7884C16.3626 14.0243 16.5123 13.8817 16.6492 13.7514C16.6735 13.7282 16.6975 13.7054 16.7215 13.6852C16.756 13.656 16.7986 13.6291 16.8421 13.6015C17.0072 13.4971 17.1867 13.3833 17.0037 13.1047C16.6213 12.5231 16.0891 12.2031 15.3593 12.1636Z"/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Explora Botmaker — segmented tabs + content per tab
// ─────────────────────────────────────────────────────────────────────────────
type Tab = 'agentes' | 'orq' | 'bots' | 'canales'

function Explora() {
  const [tab, setTab] = useState<Tab>('agentes')
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'agentes', label: 'Mis agentes',       count: AGENTES_DATA.length },
    { id: 'orq',     label: 'Mis orquestadores', count: ORQ_DATA.length },
    { id: 'bots',    label: 'Mis bots',           count: BOTS_DATA.length },
    { id: 'canales', label: 'Canales',            count: CANALES_DATA.length },
  ]
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontFamily: INTER, fontSize: 20, fontWeight: 600, color: T.fg, letterSpacing: '-0.015em' }}>Explora Botmaker</h2>
        <a href="#" style={{ fontSize: 12.5, fontWeight: 500, color: T.fg3, textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = T.fg)}
          onMouseLeave={e => (e.currentTarget.style.color = T.fg3)}
        >Ver todos →</a>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: 3, borderRadius: 10, background: T.subtle, border: `1px solid ${T.hair}`, marginBottom: 14 }}>
        {tabs.map(t => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 7,
                background: active ? T.surface : 'transparent',
                color: active ? T.fg : T.fg3,
                border: 'none',
                fontFamily: INTER, fontSize: 12.5, fontWeight: active ? 600 : 500, cursor: 'pointer',
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
                transition: 'color 140ms ease-out, background 140ms ease-out',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = T.fg }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = T.fg3 }}
            >
              {t.label}
              <span style={{
                padding: '0 6px', minWidth: 16, height: 15, borderRadius: 4,
                background: active ? T.subtle : 'transparent',
                border: `1px solid ${active ? T.hair : 'transparent'}`,
                color: active ? T.fg2 : T.fg3,
                fontSize: 10, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{t.count}</span>
            </button>
          )
        })}
      </div>
      {tab === 'agentes' && <ResourceList items={AGENTES_DATA} kind="agentes" />}
      {tab === 'orq'     && <ResourceList items={ORQ_DATA}     kind="orq" />}
      {tab === 'bots'    && <ResourceList items={BOTS_DATA}    kind="bots" />}
      {tab === 'canales' && <CanalesGrid />}
    </section>
  )
}

// ── Tab data ────────────────────────────────────────────────────────────────
interface ResourceItem {
  name: string
  meta: string
  channels: ('whatsapp' | 'web' | 'instagram' | 'email' | 'phone')[]
  status: 'activo' | 'borrador' | 'pausado'
  model?: string
}

const AGENTES_DATA: ResourceItem[] = [
  { name: 'Asistente Bella Italia', meta: 'Modificado hace 2 h',  channels: ['whatsapp', 'web'],          status: 'activo',   model: 'GPT-4o' },
  { name: 'Soporte Nivel 1',         meta: 'Modificado ayer',       channels: ['whatsapp', 'email'],        status: 'activo',   model: 'Claude 3.5' },
  { name: 'Lead Qualifier Sales',    meta: 'Modificado hace 3 d',   channels: ['web', 'whatsapp'],          status: 'borrador', model: 'GPT-4o' },
  { name: 'Cobranzas Mensual',       meta: 'Próximo ciclo: 15 may', channels: ['whatsapp'],                 status: 'pausado',  model: 'GPT-4o-mini' },
]

const ORQ_DATA: ResourceItem[] = [
  { name: 'Pizzería Bella Italia',   meta: '3 agentes orquestados', channels: ['whatsapp', 'web'],              status: 'activo' },
  { name: 'Tienda online Marcela',   meta: '4 agentes · 2 escalando', channels: ['whatsapp', 'web', 'instagram'], status: 'activo' },
  { name: 'Inmobiliaria Norte',      meta: '2 agentes',             channels: ['whatsapp', 'email'],            status: 'borrador' },
]

const BOTS_DATA: ResourceItem[] = [
  { name: 'Demo BAX',                meta: 'Chatbot · 12 flujos',     channels: ['whatsapp'],                  status: 'activo' },
  { name: '_MCP con acciones Demo',  meta: 'Chatbot · MCP conectado',  channels: ['whatsapp', 'web'],          status: 'activo' },
  { name: 'Reservas Restaurante',    meta: 'Chatbot · 8 flujos',       channels: ['whatsapp', 'instagram'],    status: 'activo' },
  { name: 'Bot Onboarding',          meta: 'Mailbot · 5 flujos',       channels: ['email', 'web'],             status: 'activo' },
  { name: 'Encuestas NPS',           meta: 'Callbot · IVR + voz',      channels: ['phone'],                    status: 'pausado' },
]

interface CanalItem {
  channel: 'whatsapp' | 'web' | 'instagram' | 'email' | 'phone'
  name: string
  number?: string
  bots: number
  status: 'conectado' | 'desconectado' | 'pendiente'
}

const CANALES_DATA: CanalItem[] = [
  { channel: 'whatsapp',  name: 'WhatsApp Business',     number: '+54 11 5555 1234',         bots: 4, status: 'conectado' },
  { channel: 'whatsapp',  name: 'WhatsApp Soporte',      number: '+54 11 5555 5678',         bots: 1, status: 'conectado' },
  { channel: 'web',       name: 'Chat Web bellaitalia',  number: 'bellaitalia.com.ar',       bots: 2, status: 'conectado' },
  { channel: 'instagram', name: 'Instagram @bellaitalia', number: '12.4k seguidores',        bots: 1, status: 'conectado' },
  { channel: 'email',     name: 'Mailbox ventas',         number: 'ventas@bellaitalia.com.ar', bots: 1, status: 'conectado' },
  { channel: 'phone',     name: 'Línea fija callbot',     number: '+54 11 5555 9999',         bots: 1, status: 'pendiente' },
]

function ResourceList({ items, kind }: { items: ResourceItem[]; kind: Tab }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 12, overflow: 'hidden' }}>
      {items.map((r, i) => <ResourceRow key={i} r={r} kind={kind} divider={i < items.length - 1} />)}
    </div>
  )
}

function ResourceRow({ r, kind, divider }: { r: ResourceItem; kind: Tab; divider: boolean }) {
  const Icon = kind === 'agentes' ? <AiAgentIcon size={15} /> : kind === 'orq' ? <OrchestratorIcon size={15} /> : <ChatbotIcon size={15} />
  return (
    <a
      href="#"
      style={{
        display: 'grid', gridTemplateColumns: '32px 1fr auto auto auto', gap: 14, alignItems: 'center',
        padding: '12px 16px',
        borderBottom: divider ? `1px solid ${T.hair}` : 'none',
        textDecoration: 'none', color: T.fg,
        transition: 'background 140ms ease-out',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = T.subtle)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: T.subtle, border: `1px solid ${T.hair}`, color: T.fg2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{Icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: T.fg }}>{r.name}</span>
          {r.model && <ModelBadge model={r.model} />}
        </div>
        <div style={{ fontSize: 11.5, color: T.fg3, marginTop: 1 }}>{r.meta}</div>
      </div>
      <div style={{ display: 'inline-flex', gap: 4 }}>
        {r.channels.map(c => <ChannelDot key={c} channel={c} />)}
      </div>
      <StatusPill status={r.status} />
      <ChevronRight size={14} color={T.fg4} />
    </a>
  )
}

function ModelBadge({ model }: { model: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '1px 6px', borderRadius: 5,
      background: T.subtle, border: `1px solid ${T.hair}`,
      fontSize: 9.5, color: T.fg2, fontWeight: 600,
      fontFamily: INTER, letterSpacing: '-0.005em',
    }}>
      <Sparkles size={9} color={T.accent} />{model}
    </span>
  )
}

function StatusPill({ status }: { status: ResourceItem['status'] }) {
  const map = {
    activo:   { dot: T.ok,   label: 'Activo'   },
    borrador: { dot: T.fg4,  label: 'Borrador' },
    pausado:  { dot: T.warn, label: 'Pausado'  },
  }
  const s = map[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px 3px 7px', borderRadius: 6,
      background: T.subtle, border: `1px solid ${T.hair}`,
      fontSize: 10.5, color: T.fg2, fontWeight: 600,
      fontFamily: INTER,
    }}>
      <span style={{ position: 'relative', width: 6, height: 6, borderRadius: 100, background: s.dot }}>
        {status === 'activo' && (
          <span style={{ position: 'absolute', inset: 0, borderRadius: 100, background: s.dot, opacity: 0.5, animation: 'bmPulse 1.8s ease-out infinite' }} />
        )}
      </span>
      {s.label}
    </span>
  )
}

function CanalesGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {CANALES_DATA.map((c, i) => <CanalCard key={i} c={c} />)}
    </div>
  )
}

function CanalCard({ c }: { c: CanalItem }) {
  return (
    <a
      href="#"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 12,
        textDecoration: 'none', color: T.fg,
        transition: 'border-color 140ms ease-out, background 140ms ease-out',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.hairStrong; e.currentTarget.style.background = T.subtle }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.hair; e.currentTarget.style.background = T.surface }}
    >
      <ChannelDot channel={c.channel} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
        <div style={{ fontSize: 11, color: T.fg3, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.number}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <StatusPill status={c.status === 'conectado' ? 'activo' : c.status === 'pendiente' ? 'pausado' : 'borrador'} />
        <span style={{ fontSize: 10.5, color: T.fg3 }}>{c.bots} bot{c.bots > 1 ? 's' : ''}</span>
      </div>
    </a>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Últimos movimientos — real list of recent bot edits
// ─────────────────────────────────────────────────────────────────────────────
interface BotItem {
  name: string
  state: 'modificado' | 'lanzado' | 'establecido'
  channel: 'whatsapp' | 'web' | 'instagram' | 'email' | 'phone'
  channelLabel: string
  channelStatus: string
  modifiedLabel: string
}

const MOVIMIENTOS: BotItem[] = [
  { name: 'Demo BAX',             state: 'modificado',  channel: 'whatsapp',  channelLabel: 'Canal WhatsApp',      channelStatus: 'Bot activo',            modifiedLabel: 'Modificado hoy' },
  { name: 'Asistente de Ventas',  state: 'lanzado',     channel: 'instagram', channelLabel: 'Perfil de Instagram', channelStatus: 'Bot en funcionamiento', modifiedLabel: 'Modificado hoy' },
  { name: 'Asistente de Soporte', state: 'establecido', channel: 'web',       channelLabel: 'Chat Web',            channelStatus: 'En desarrollo',         modifiedLabel: 'Modificado ayer' },
  { name: 'Asistente de Soporte', state: 'establecido', channel: 'web',       channelLabel: 'Chat Web',            channelStatus: 'En desarrollo',         modifiedLabel: 'Modificado anteayer' },
  { name: 'Asistente de Soporte', state: 'establecido', channel: 'web',       channelLabel: 'Chat Web',            channelStatus: 'En desarrollo',         modifiedLabel: 'Modificado anteayer' },
  { name: 'Asistente de Soporte', state: 'establecido', channel: 'web',       channelLabel: 'Chat Web',            channelStatus: 'En desarrollo',         modifiedLabel: 'Modificado hace 3 días' },
  { name: 'Asistente de Soporte', state: 'establecido', channel: 'web',       channelLabel: 'Chat Web',            channelStatus: 'En desarrollo',         modifiedLabel: 'Modificado hace 4 días' },
  { name: 'Asistente de Soporte', state: 'establecido', channel: 'web',       channelLabel: 'Chat Web',            channelStatus: 'En desarrollo',         modifiedLabel: 'Modificado hace 6 días' },
]

function UltimosMovimientos() {
  return (
    <section style={{ background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 12, padding: '18px 6px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontFamily: INTER, fontSize: 14, fontWeight: 600, color: T.fg, letterSpacing: '-0.005em' }}>Últimos movimientos</h3>
        <a href="#" style={{ fontSize: 12, fontWeight: 500, color: T.fg3, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}
          onMouseEnter={e => (e.currentTarget.style.color = T.fg)}
          onMouseLeave={e => (e.currentTarget.style.color = T.fg3)}
        >Ver todos <ChevronRight size={12} /></a>
      </div>
      <div>
        {MOVIMIENTOS.map((b, i) => <MovimientoRow key={i} b={b} />)}
      </div>
    </section>
  )
}

function MovimientoRow({ b }: { b: BotItem }) {
  return (
    <a
      href="#"
      style={{
        display: 'grid', gridTemplateColumns: '32px 1fr auto auto', gap: 14, alignItems: 'center',
        padding: '10px 14px', margin: '0 2px', borderRadius: 8,
        textDecoration: 'none', color: T.fg,
        transition: 'background 140ms ease-out',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = T.subtle)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: T.subtle, border: `1px solid ${T.hair}`,
        color: T.fg2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AiAgentIcon size={16} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, lineHeight: 1.3, color: T.fg }}>
          <span style={{ fontWeight: 600 }}>{b.name}</span>
          <span style={{ color: T.fg3, fontWeight: 400 }}> — {b.state}</span>
        </div>
        <div style={{ fontSize: 11.5, color: T.fg3, marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ChannelDot channel={b.channel} />
          <span>{b.channelLabel}</span>
          <span style={{ color: T.hair }}>·</span>
          <span>{b.channelStatus}</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.fg3 }}>{b.modifiedLabel}</div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '5px 12px', borderRadius: 7,
        background: T.surface, border: `1px solid ${T.hair}`,
        color: T.fg, fontSize: 12, fontWeight: 500, fontFamily: INTER,
      }}>Abrir</span>
    </a>
  )
}

function ChannelDot({ channel }: { channel: BotItem['channel'] }) {
  const map = {
    whatsapp:  { c: '#25D366', i: <Phone size={9} /> },
    web:       { c: T.accent,  i: <Globe size={9} /> },
    instagram: { c: '#E1306C', i: <Instagram size={9} /> },
    email:     { c: T.fg3,     i: <Mail size={9} /> },
    phone:     { c: '#A855F7', i: <Phone size={9} /> },
  }
  const m = map[channel]
  return (
    <span style={{
      width: 14, height: 14, borderRadius: 4,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: T.subtle, border: `1px solid ${T.hair}`,
      color: m.c,
    }}>{m.i}</span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Próximos eventos — real webinars
// ─────────────────────────────────────────────────────────────────────────────
interface Evt {
  day: string
  month: string
  title: string
  time: string
  lang?: string
  live?: boolean
}

const EVENTOS: Evt[] = [
  { day: '30', month: 'ABR', title: 'Webinar: Bot Designer', time: 'Miércoles 30/4 9:00AM' },
  { day: '30', month: 'ABR', title: 'Webinar: Bot Designer', time: 'Miércoles 30/4 9:00AM' },
  { day: '21', month: 'ABR', title: 'Webinar: Bot Designer', time: 'Ahora', lang: 'Español', live: true },
  { day: '21', month: 'ABR', title: 'Webinar: Bot Designer', time: 'Ahora', lang: 'Español', live: true },
]

function ProximosEventos() {
  return (
    <section style={{ background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 12, padding: '18px 6px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontFamily: INTER, fontSize: 14, fontWeight: 600, color: T.fg, letterSpacing: '-0.005em' }}>
          Próximos eventos <span style={{ color: T.fg3, fontWeight: 500, marginLeft: 4 }}>{EVENTOS.length}</span>
        </h3>
        <a href="#" style={{ fontSize: 12, fontWeight: 500, color: T.fg3, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}
          onMouseEnter={e => (e.currentTarget.style.color = T.fg)}
          onMouseLeave={e => (e.currentTarget.style.color = T.fg3)}
        >Ver todos <ChevronRight size={12} /></a>
      </div>
      <div>
        {EVENTOS.map((ev, i) => <EventoRow key={i} ev={ev} />)}
      </div>
    </section>
  )
}

function EventoRow({ ev }: { ev: Evt }) {
  return (
    <a
      href="#"
      style={{
        display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 14, alignItems: 'center',
        padding: '10px 14px', margin: '0 2px', borderRadius: 8,
        textDecoration: 'none', color: T.fg,
        transition: 'background 140ms ease-out',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = T.subtle)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 8,
        background: T.subtle, border: `1px solid ${T.hair}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
      }}>
        <div style={{ fontFamily: INTER, fontSize: 17, fontWeight: 600, color: T.fg, letterSpacing: '-0.02em' }}>{ev.day}</div>
        <div style={{ fontSize: 9, fontWeight: 600, color: T.fg3, letterSpacing: '0.08em', marginTop: 2 }}>{ev.month}</div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, lineHeight: 1.3 }}>{ev.title}</div>
        <div style={{ fontSize: 11.5, color: T.fg3, marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {ev.live ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: T.err, fontWeight: 500 }}>
              <span style={{ position: 'relative', width: 6, height: 6 }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: 100, background: T.err }} />
                <span style={{ position: 'absolute', inset: 0, borderRadius: 100, background: T.err, opacity: 0.5, animation: 'bmPulse 1.6s ease-out infinite' }} />
              </span>
              {ev.time}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={11} /> {ev.time}
            </span>
          )}
          {ev.lang && <><span style={{ color: T.hair }}>·</span><span>{ev.lang}</span></>}
        </div>
      </div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '5px 12px', borderRadius: 7,
        background: T.surface, border: `1px solid ${T.hair}`,
        color: T.fg, fontSize: 12, fontWeight: 500, fontFamily: INTER,
      }}>Ingresa ahora</span>
    </a>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${T.hair}`, background: T.surface, padding: '18px 28px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, fontSize: 12, color: T.fg3 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ position: 'relative', width: 6, height: 6 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: 100, background: T.ok }} />
              <span style={{ position: 'absolute', inset: 0, borderRadius: 100, background: T.ok, opacity: 0.5, animation: 'bmPulse 1.8s ease-out infinite' }} />
            </span>
            Todos los servicios operativos
          </span>
          <span style={{ color: T.hair }}>·</span>
          <a href="#" style={{ color: T.fg3, textDecoration: 'none' }}>Centro de ayuda</a>
          <span style={{ color: T.hair }}>·</span>
          <a href="#" style={{ color: T.fg3, textDecoration: 'none' }}>Academy</a>
          <span style={{ color: T.hair }}>·</span>
          <a href="#" style={{ color: T.fg3, textDecoration: 'none' }}>Monitor de servicios</a>
        </div>
        <div style={{ fontSize: 11.5, color: T.fg4 }}>Botmaker · v6.2026.5</div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animations
// ─────────────────────────────────────────────────────────────────────────────
function KeyFrames() {
  return (
    <style>{`
      @keyframes bmPulse {
        0%   { transform: scale(1);   opacity: 0.5; }
        100% { transform: scale(2.4); opacity: 0;   }
      }
      @keyframes bmFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes bmFloat {
        0%, 100% { transform: translateY(0) }
        50%      { transform: translateY(-8px) }
      }
      ::selection { background: ${T.accentRing}; color: ${T.fg}; }

      /* ─── Responsive — variants C & D ──────────────────────────────────── */
      /* Variant C: ClassicPanel — 4 cards row + 2-col bottom */
      @media (max-width: 1024px) {
        .bm-classic-cards    { grid-template-columns: repeat(2, 1fr) !important; }
        .bm-classic-bottom   { grid-template-columns: 1fr !important; gap: 40px !important; }
        .bm-classic-app-row  { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 720px) {
        .bm-classic-wrap     { padding: 18px 14px 56px !important; border-radius: 18px 18px 0 0 !important; margin: 14px 8px 0 !important; max-width: none !important; box-sizing: border-box !important; width: calc(100% - 16px) !important; }
        .bm-classic-hero     { padding: 14px !important; gap: 14px !important; border-radius: 14px !important; }
        .bm-classic-cards    { grid-template-columns: 1fr !important; }
        .bm-classic-app-row  { grid-template-columns: 1fr !important; gap: 40px !important; }
        /* Mobile: flatten 2-col into single column with custom order */
        .bm-classic-bottom   { display: flex !important; flex-direction: column !important; gap: 48px !important; margin-top: 44px !important; }
        .bm-classic-col      { display: contents !important; }
        .bm-col-left  > section:nth-of-type(1) { order: 1; } /* Mis bots */
        .bm-col-right > section:nth-of-type(1) { order: 2; } /* Agenda */
        .bm-col-left  > section:nth-of-type(2) { order: 3; } /* Canales */
        .bm-col-right > .bm-classic-app-row    { order: 4; } /* Ayuda + App */
        /* Canales: stack icons + button vertical */
        .bm-canales-row      { flex-direction: column !important; align-items: stretch !important; gap: 14px !important; }
        .bm-canales-row > button { align-self: flex-start; }
        /* Agenda: stack content + CTA vertical */
        .bm-agenda-row       { grid-template-columns: 44px 1fr !important; gap: 14px !important; padding: 16px 4px !important; }
        .bm-agenda-row > button { grid-column: 1 / -1; justify-self: stretch; margin-top: 4px; }
      }
      /* Variant C: WebHero copy + chrome */
      @media (max-width: 720px) {
        .bm-web-hero            { padding: 10px 0 18px !important; }
        .bm-web-hero h1         { font-size: clamp(26px, 7.5vw, 32px) !important; }
        .bm-web-hero .bm-web-question { font-size: clamp(22px, 6.6vw, 28px) !important; margin-top: 8px !important; }
        .bm-web-hero p          { font-size: 14px !important; margin-top: 14px !important; }
        .bm-web-topbar          { padding: 0 14px !important; }
        .bm-web-main            { padding: 14px 14px 6px !important; }
      }
      /* Variant D: BlueBanner + simple cards + bottom 2-col */
      @media (max-width: 1024px) {
        .bm-d-cards          { grid-template-columns: repeat(3, 1fr) !important; }
        .bm-d-bottom         { grid-template-columns: 1fr !important; gap: 32px !important; }
      }
      @media (max-width: 720px) {
        .bm-d-main           { padding: 16px 14px 48px !important; }
        .bm-d-banner         { grid-template-columns: 1fr !important; padding: 28px 22px 26px !important; min-height: 0 !important; gap: 18px !important; border-radius: 18px !important; }
        .bm-d-banner h2      { font-size: clamp(24px, 7vw, 32px) !important; }
        .bm-d-banner p       { font-size: 14px !important; }
        .bm-d-banner-art     { width: 200px !important; height: 160px !important; margin: 0 auto !important; }
        .bm-d-cards          { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
        .bm-d-card           { min-height: 110px !important; padding: 18px 10px !important; }
        .bm-d-topbar         { padding: 0 16px !important; }
      }
    `}</style>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME WEB-STYLE (variant C) — uses the visual language of the recently
// redesigned Botmaker marketing site (botmaker-web-redesign):
//   • Mesh aurora background, grid overlay, indigo glow accents
//   • Inter Tight display headings with -0.04em tracking + gradient text
//   • Pill buttons (rounded-full) with hover lift + shadow-glow-brand
//   • Card radius 24px, hairline borders at 70% opacity
//   • Eyebrow badges with pulsing dot
//   • Editorial hero followed by bento grid
// ─────────────────────────────────────────────────────────────────────────────
const INTER_TIGHT = "'Inter Tight', 'Inter', system-ui, -apple-system, sans-serif"

function useInterTight() {
  useEffect(() => {
    const id = 'bm-home-inter-tight'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&display=swap'
    document.head.appendChild(link)
  }, [])
}

const WEB = {
  // Web redesign tokens
  brand500: '#304ffe',
  brand600: '#2740d4',
  brand700: '#1d31aa',
  brand400: '#6272ff',
  brand50:  '#f0f3ff',
  ink50:    '#f7f8fb',
  ink100:   '#eef0f6',
  ink200:   '#dde1ec',
  ink300:   '#b4bccf',
  ink500:   '#5f6882',
  ink700:   '#2b3350',
  ink900:   '#0a0f1f',
  ease:     'cubic-bezier(0.16, 1, 0.3, 1)',
  easeQuart:'cubic-bezier(0.25, 1, 0.5, 1)',
} as const

function HomeWebStyle() {
  useInterTight()
  return (
    <div style={{
      minHeight: '100vh', background: WEB.ink50, color: WEB.ink900,
      fontFamily: "'Roboto', system-ui, sans-serif",
      WebkitFontSmoothing: 'antialiased',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <WebMesh />
      <WebTopBar />
      <main style={{ flex: 1, width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        {/* Marketing hero — compact */}
        <div className="bm-web-main" style={{ width: '100%', maxWidth: 1380, margin: '0 auto', padding: '20px 24px 8px' }}>
          <WebHero />
        </div>
        {/* White container with original Botmaker home (+ Agentes IA card) */}
        <ClassicPanel />
      </main>
      <KeyFrames />
    </div>
  )
}

// ── Mesh aurora background (web-redesign hero pattern) ─────────────────────
function WebMesh() {
  return (
    <>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, top: 0, height: 720,
        backgroundImage: [
          'radial-gradient(60% 40% at 20% 10%, rgba(48, 79, 254, 0.18) 0%, transparent 60%)',
          'radial-gradient(40% 30% at 80% 0%, rgba(98, 114, 255, 0.22) 0%, transparent 70%)',
          'radial-gradient(50% 40% at 50% 100%, rgba(48, 79, 254, 0.08) 0%, transparent 70%)',
        ].join(', '),
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden style={{
        position: 'absolute', inset: 0, top: 0, height: 720,
        backgroundImage: [
          'linear-gradient(to right, rgba(10,15,31,0.04) 1px, transparent 1px)',
          'linear-gradient(to bottom, rgba(10,15,31,0.04) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '48px 48px',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 80%)',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 80%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Bottom fade so content "lands" softly */}
      <div aria-hidden style={{
        position: 'absolute', left: 0, right: 0, top: 600, height: 200,
        background: `linear-gradient(to bottom, transparent, ${WEB.ink50})`,
        pointerEvents: 'none', zIndex: 0,
      }} />
    </>
  )
}

// ── Top bar — glassmorphic ─────────────────────────────────────────────────
function WebTopBar() {
  return (
    <header className="bm-web-topbar" style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(247,248,251,0.70)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${WEB.ink200}70`,
      padding: '0 24px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          aria-label="Toggle menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: WEB.brand500, display: 'flex', alignItems: 'center', padding: 6, borderRadius: 100, transition: 'background 140ms ease-out' }}
          onMouseEnter={e => (e.currentTarget.style.background = WEB.brand50)}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <Menu size={20} />
        </button>
        <span style={{ fontFamily: INTER_TIGHT, fontSize: 14.5, fontWeight: 600, color: WEB.ink900, letterSpacing: '-0.01em' }}>Inicio</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <WebIconBtn ariaLabel="Search"><Search size={17} /></WebIconBtn>
        <WebIconBtn ariaLabel="Inbox"><Inbox size={17} /></WebIconBtn>
        <WebIconBtn ariaLabel="Help"><HelpCircle size={17} /></WebIconBtn>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 4px 4px',
          borderRadius: 100, border: `1px solid ${WEB.ink200}`, background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)', cursor: 'pointer', marginLeft: 6,
          transition: 'background 140ms ease-out, border-color 140ms ease-out',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = WEB.ink300 }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = WEB.ink200 }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `linear-gradient(135deg, ${WEB.brand500} 0%, ${WEB.brand400} 100%)`,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: INTER, fontSize: 11, fontWeight: 600,
          }}>GT</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
            <span style={{ fontSize: 9.5, color: WEB.ink500, fontWeight: 500 }}>Estado</span>
            <span style={{ fontSize: 11.5, color: WEB.ink900, fontWeight: 500 }}>En línea</span>
          </div>
          <ChevronDown size={12} style={{ color: WEB.ink500 }} />
        </button>
      </div>
    </header>
  )
}

function WebIconBtn({ children, ariaLabel }: { children: React.ReactNode; ariaLabel: string }) {
  return (
    <button
      aria-label={ariaLabel}
      style={{
        width: 34, height: 34, borderRadius: 100,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: WEB.ink500, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: `background 140ms ease-out, color 140ms ease-out`,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = WEB.ink100; e.currentTarget.style.color = WEB.ink900 }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = WEB.ink500 }}
    >{children}</button>
  )
}

// ── Editorial Hero — display heading with gradient text + 2 CTAs ───────────
function WebHero() {
  const hour = new Date().getHours()
  const partOfDay = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  return (
    <section className="bm-web-hero" style={{ padding: '16px 0 20px', textAlign: 'left', maxWidth: 760 }}>
      {/* Greeting — Buenas tardes, Gonzalo (h1 principal) */}
      <h1 style={{
        margin: 0,
        fontFamily: INTER_TIGHT, fontWeight: 600,
        fontSize: 'clamp(28px, 3.4vw, 40px)', lineHeight: 1.08, letterSpacing: '-0.03em',
        color: WEB.ink900,
        animation: `bmFadeUp 700ms ${WEB.ease} 80ms both`,
      }}>
        {partOfDay}, Gonzalo.
      </h1>
      {/* Pregunta — sub-headline con gradient */}
      <p className="bm-web-question" style={{
        margin: '6px 0 0',
        fontFamily: INTER_TIGHT, fontWeight: 600,
        fontSize: 'clamp(22px, 2.6vw, 30px)', lineHeight: 1.15, letterSpacing: '-0.025em',
        animation: `bmFadeUp 700ms ${WEB.ease} 140ms both`,
      }}>
        <span style={{
          background: `linear-gradient(135deg, ${WEB.brand500} 0%, ${WEB.brand400} 50%, ${WEB.brand700} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>¿Qué quieres hacer hoy?</span>
      </p>
      {/* Descripción */}
      <p style={{
        margin: '14px 0 0', maxWidth: 580,
        fontFamily: 'inherit', fontSize: 14.5, lineHeight: 1.55, color: WEB.ink500, fontWeight: 400,
        animation: `bmFadeUp 700ms ${WEB.ease} 200ms both`,
      }}>
        Un lugar para diseñar agentes inteligentes, bots con flujos,
        atender chats en vivo y enviar campañas masivas.
      </p>
    </section>
  )
}

function PillButton({ href, variant, children }: { href: string; variant: 'primary' | 'ghost' | 'dark'; children: React.ReactNode }) {
  const [hover, setHover] = useState(false)
  const styles = {
    primary: {
      bg: hover ? WEB.brand600 : WEB.brand500,
      color: '#fff',
      border: 'none',
      shadow: hover
        ? '0 0 0 1px rgba(48,79,254,0.15), 0 12px 40px -8px rgba(48,79,254,0.45)'
        : '0 1px 2px rgba(10,15,31,0.04)',
    },
    dark: {
      bg: hover ? WEB.ink700 : WEB.ink900,
      color: '#fff',
      border: 'none',
      shadow: hover ? '0 8px 24px rgba(10,15,31,0.16)' : '0 1px 2px rgba(10,15,31,0.04)',
    },
    ghost: {
      bg: hover ? '#fff' : 'rgba(255,255,255,0.65)',
      color: WEB.ink900,
      border: `1px solid ${hover ? WEB.ink300 : WEB.ink200}`,
      shadow: 'none',
    },
  }[variant]
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '12px 22px', borderRadius: 9999,
        background: styles.bg, color: styles.color, border: styles.border,
        boxShadow: styles.shadow,
        backdropFilter: variant === 'ghost' ? 'blur(8px)' : undefined,
        fontFamily: 'inherit', fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em',
        textDecoration: 'none',
        transform: hover ? 'translateY(-1px)' : 'translateY(0)',
        transition: `all 300ms ${WEB.easeQuart}`,
      }}
    >{children}</a>
  )
}

// ── Bento — Agentes IA featured (2x2) + 5 surfaces ─────────────────────────
function WebBento() {
  return (
    <section id="bento" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'minmax(220px, 1fr) minmax(220px, 1fr)',
      gap: 16, marginBottom: 16,
    }}>
      <WebFeaturedCard />
      <WebSurfaceCard
        gridArea="1 / 3 / 2 / 4"
        icon={<MessagesSquare size={20} />}
        title="Chatbots"
        desc="Web · WhatsApp · IG"
        ctaLabel="Abrir"
        href="/agents"
      />
      <WebSurfaceCard
        gridArea="1 / 4 / 2 / 5"
        icon={<Mail size={20} />}
        title="MailBots"
        desc="Email automatizado"
        ctaLabel="Abrir"
        href="#"
      />
      <WebSurfaceCard
        gridArea="2 / 3 / 3 / 4"
        icon={<Phone size={20} />}
        title="Callbots"
        desc="Llamadas con voz e IVR"
        ctaLabel="Abrir"
        href="#"
      />
      <WebSurfaceCard
        gridArea="2 / 4 / 3 / 5"
        icon={<MessagesSquare size={20} />}
        title="Atender"
        desc="12 chats esperando"
        ctaLabel="Ir"
        href="#"
        accent
      />
    </section>
  )
}

function WebFeaturedCard() {
  const [hover, setHover] = useState(false)
  return (
    <a
      href="/bienvenida"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        gridArea: '1 / 1 / 3 / 3',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        padding: '28px 32px 28px',
        background: '#fff',
        border: `1px solid ${hover ? WEB.brand500 : WEB.ink200 + '90'}`,
        borderRadius: 24,
        textDecoration: 'none', color: WEB.ink900,
        boxShadow: hover
          ? '0 0 0 1px rgba(48,79,254,0.15), 0 12px 40px -8px rgba(48,79,254,0.45)'
          : '0 2px 4px rgba(10,15,31,0.04), 0 8px 24px rgba(10,15,31,0.04)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: `all 320ms ${WEB.easeQuart}`,
      }}
    >
      {/* Inner aurora wash */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: [
          'radial-gradient(70% 60% at 90% 100%, rgba(48,79,254,0.10) 0%, transparent 60%)',
          'radial-gradient(50% 40% at 100% 0%, rgba(98,114,255,0.08) 0%, transparent 70%)',
        ].join(', '),
        pointerEvents: 'none',
      }} />
      {/* Floating bot illustration */}
      <WebFeaturedArtwork />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, maxWidth: '60%' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `linear-gradient(135deg, ${WEB.brand500} 0%, ${WEB.brand400} 100%)`,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 20px -6px rgba(48,79,254,0.40)',
        }}>
          <AiAgentIcon size={22} />
        </div>
        <div style={{ marginTop: 22 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 8px', borderRadius: 6,
            background: '#EBEEFF', color: WEB.brand500,
            fontFamily: INTER, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            marginBottom: 8,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 100, background: WEB.brand500 }} />
            NUEVO
          </span>
          <h3 style={{
            margin: 0, fontFamily: INTER_TIGHT, fontWeight: 600,
            fontSize: 28, lineHeight: 1.1, letterSpacing: '-0.03em', color: WEB.ink900,
          }}>
            Diseñar{' '}
            <span style={{
              background: `linear-gradient(135deg, ${WEB.brand500} 0%, ${WEB.brand400} 50%, ${WEB.brand700} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Agentes de IA</span>
          </h3>
          <p style={{ margin: '10px 0 0', fontSize: 14.5, color: WEB.ink500, lineHeight: 1.55 }}>
            Agentes que entienden, deciden y resuelven 24/7. Conéctalos a tus
            sistemas con MCP y dejá que la IA haga el trabajo pesado.
          </p>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '11px 20px', borderRadius: 9999,
            background: WEB.brand500, color: '#fff',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
            boxShadow: '0 0 0 1px rgba(48,79,254,0.15), 0 8px 28px -6px rgba(48,79,254,0.45)',
          }}>
            Crear agente <ArrowRight size={14} />
          </span>
        </div>
      </div>

      {/* Floating "live" badge */}
      <div style={{
        position: 'absolute', top: 22, right: 22, zIndex: 2,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 11px', borderRadius: 100,
        background: 'rgba(255,255,255,0.85)',
        border: `1px solid ${WEB.ink200}90`,
        backdropFilter: 'blur(8px)',
        fontFamily: INTER, fontSize: 11, fontWeight: 500, color: WEB.ink700,
      }}>
        <span style={{ position: 'relative', width: 6, height: 6 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 100, background: '#10B981' }} />
          <span style={{ position: 'absolute', inset: 0, borderRadius: 100, background: '#10B981', opacity: 0.5, animation: 'bmPulse 1.8s ease-out infinite' }} />
        </span>
        2.847 conversaciones hoy
      </div>
    </a>
  )
}

function WebFeaturedArtwork() {
  return (
    <svg viewBox="0 0 360 320" width="360" height="320" aria-hidden
      style={{ position: 'absolute', right: -8, bottom: -10, opacity: 0.95, pointerEvents: 'none', zIndex: 0, animation: 'bmFloat 7s ease-in-out infinite' }}>
      <defs>
        <linearGradient id="cBotFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#C9D2FF" />
        </linearGradient>
        <linearGradient id="cHalo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(48,79,254,0.18)" />
          <stop offset="100%" stopColor="rgba(98,114,255,0.05)" />
        </linearGradient>
      </defs>
      <ellipse cx="240" cy="180" rx="160" ry="160" fill="none" stroke="rgba(48,79,254,0.10)" strokeWidth="1.2" strokeDasharray="2 6" />
      <ellipse cx="240" cy="180" rx="115" ry="115" fill="none" stroke="rgba(48,79,254,0.14)" strokeWidth="1.2" />
      <g transform="translate(240 180)">
        <circle r="78" fill="url(#cHalo)" />
        <rect x="-52" y="-46" width="104" height="92" rx="26" fill="url(#cBotFace)" stroke="rgba(48,79,254,0.18)" strokeWidth="1" />
        <circle cx="-18" cy="-4" r="7" fill={WEB.brand700} />
        <circle cx="18" cy="-4" r="7" fill={WEB.brand700} />
        <circle cx="-15" cy="-7" r="2" fill="white" />
        <circle cx="21" cy="-7" r="2" fill="white" />
        <path d="M-14 22 Q0 32 14 22" stroke={WEB.brand700} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <line x1="0" y1="-46" x2="0" y2="-66" stroke={WEB.brand500} strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="-72" r="6" fill={WEB.brand500} />
      </g>
    </svg>
  )
}

function WebSurfaceCard({ gridArea, icon, title, desc, ctaLabel, href, accent }: {
  gridArea: string
  icon: React.ReactNode
  title: string
  desc: string
  ctaLabel: string
  href: string
  accent?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        gridArea,
        display: 'flex', flexDirection: 'column',
        padding: '20px 22px',
        background: '#fff',
        border: `1px solid ${hover ? WEB.ink300 : WEB.ink200 + '90'}`,
        borderRadius: 18,
        textDecoration: 'none', color: WEB.ink900,
        boxShadow: hover
          ? '0 8px 16px rgba(10,15,31,0.04), 0 24px 48px rgba(10,15,31,0.08)'
          : '0 1px 2px rgba(10,15,31,0.04)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: `all 280ms ${WEB.easeQuart}`,
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 11,
        background: accent ? '#EBEEFF' : WEB.ink100,
        color: accent ? WEB.brand500 : WEB.ink700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>{icon}</div>
      <h4 style={{ margin: 0, fontFamily: INTER_TIGHT, fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: WEB.ink900 }}>{title}</h4>
      <p style={{ margin: '4px 0 0', fontSize: 13, color: WEB.ink500, lineHeight: 1.5, flex: 1 }}>{desc}</p>
      <span style={{
        marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 13, fontWeight: 500, color: hover ? WEB.brand500 : WEB.ink700,
        transition: 'color 200ms ease-out',
      }}>
        {ctaLabel} <ArrowRight size={12} />
      </span>
    </a>
  )
}

// ── Secondary row: Notificaciones full-width ────────────────────────────────
function WebSecondaryRow() {
  const [hover, setHover] = useState(false)
  return (
    <a
      href="#"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 22, alignItems: 'center',
        padding: '20px 24px',
        background: '#fff',
        border: `1px solid ${hover ? WEB.ink300 : WEB.ink200 + '90'}`,
        borderRadius: 18,
        textDecoration: 'none', color: WEB.ink900,
        boxShadow: hover
          ? '0 8px 16px rgba(10,15,31,0.04), 0 24px 48px rgba(10,15,31,0.08)'
          : '0 1px 2px rgba(10,15,31,0.04)',
        transform: hover ? 'translateY(-1px)' : 'translateY(0)',
        transition: `all 280ms ${WEB.easeQuart}`,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 13,
        background: WEB.ink100, color: WEB.ink700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Megaphone size={20} />
      </div>
      <div>
        <h4 style={{ margin: 0, fontFamily: INTER_TIGHT, fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: WEB.ink900 }}>Enviar notificaciones</h4>
        <p style={{ margin: '4px 0 0', fontSize: 13.5, color: WEB.ink500, lineHeight: 1.5 }}>
          Campañas y notificaciones masivas en WhatsApp, email y otros canales.
        </p>
      </div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '10px 18px', borderRadius: 9999,
        background: WEB.ink900, color: '#fff',
        fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
      }}>
        Notification engine <ArrowRight size={13} />
      </span>
    </a>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Classic panel (variant C) — recreates the original Botmaker home below the
// marketing hero. White container with: indigo-banded 4-card panel + 2-col grid
// (Mis bots + Canales | Agenda + Ayuda + Botmaker App). Adds the new "Agentes
// de IA" card (with Crear agente / Crear orquestador links) as 1st card.
// ─────────────────────────────────────────────────────────────────────────────
function ClassicPanel() {
  return (
    <div className="bm-classic-wrap" style={{
      background: '#FFFFFF',
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      border: `1px solid ${WEB.ink200}`,
      borderBottom: 'none',
      padding: '20px 24px 56px',
      maxWidth: 1380, margin: '8px auto 0',
      boxShadow: '0 -8px 24px -8px rgba(10,15,31,0.06)',
    }}>
      {/* 4-card indigo-banded hero */}
      <ClassicHeroPanel />

      {/* 2-column layout below */}
      <div className="bm-classic-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 56 }}>
        {/* Left col */}
        <div className="bm-classic-col bm-col-left" style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          <MisBotsList />
          <CanalesPanel />
        </div>
        {/* Right col */}
        <div className="bm-classic-col bm-col-right" style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          <AgendaPanel />
          <div className="bm-classic-app-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
            <AyudaPanel />
            <BotmakerAppPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

const PRIMARY = '#304FFE'
const PRIMARY_LIGHT = '#E6EAFF'
const PRIMARY_BG = '#EDEFFC'

// ── 4 hero cards in an indigo-banded panel ─────────────────────────────────
function ClassicHeroPanel() {
  return (
    <div className="bm-classic-hero bm-classic-cards" style={{
      background: PRIMARY_BG,
      borderRadius: 16,
      padding: '24px',
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
    }}>
      <ClassicHeroCard
        icon={<AiAgentIcon size={26} />}
        title="Diseñar agentes de IA"
        subtitle="Crea, modifica y administra agentes y orquestadores"
        badge="Nuevo"
        links={[
          { icon: <Plus size={14} />, label: 'Agente de IA', href: '/bienvenida' },
        ]}
      />
      <ClassicHeroCard
        icon={<ChatbotIcon size={26} />}
        title="Diseñar bots con flujos"
        subtitle="Diseña bots basados en flujos y herramientas generativas"
        links={[
          { icon: <ChatbotIcon size={14} />, label: 'Chatbots', href: '/agents' },
          { icon: <Mail size={14} />, label: 'Mailbots', href: '#' },
          { icon: <Phone size={14} />, label: 'Callbots', href: '#' },
        ]}
      />
      <ClassicHeroCard
        icon={<MessagesSquare size={26} />}
        title="Atender usuarios"
        subtitle="Responde y gestiona conversaciones en tiempo real."
        links={[
          { icon: <PlayIcon />, label: 'Conversaciones', href: '#' },
          { icon: <FileTextIcon />, label: 'Tickets', href: '#' },
        ]}
      />
      <ClassicHeroCard
        icon={<Megaphone size={26} />}
        title="Enviar notificaciones"
        subtitle="Gestiona campañas y notificaciones masivas."
        links={[
          { icon: <Megaphone size={14} />, label: 'Notification engine', href: '#' },
        ]}
      />
    </div>
  )
}

function ClassicHeroCard({ icon, title, subtitle, links, badge }: {
  icon: React.ReactNode
  title: string
  subtitle: string
  links: { icon: React.ReactNode; label: string; href: string }[]
  badge?: string
}) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        background: '#FFFFFF',
        borderRadius: 12,
        padding: '24px 20px 18px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover ? '0 8px 24px -8px rgba(48,79,254,0.18)' : 'none',
      }}
    >
      {/* Badge top-right */}
      {badge && (
        <span style={{
          position: 'absolute', top: 12, right: 12,
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 9px', borderRadius: 100,
          background: PRIMARY, color: '#FFFFFF',
          fontFamily: "'Roboto', sans-serif", fontSize: 10, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          boxShadow: '0 0 0 3px rgba(48,79,254,0.15), 0 4px 10px -2px rgba(48,79,254,0.35)',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 100, background: '#FFFFFF' }} />
          {badge}
        </span>
      )}
      {/* Centered icon circle */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: PRIMARY_LIGHT, color: PRIMARY,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      {/* Title + subtitle */}
      <div>
        <h4 style={{
          margin: 0, fontFamily: "'Roboto', sans-serif", fontWeight: 700,
          fontSize: 16, color: '#212121', lineHeight: 1.3,
        }}>{title}</h4>
        <p style={{
          margin: '4px 0 0', fontFamily: "'Roboto', sans-serif", fontSize: 12.5,
          color: '#757575', lineHeight: 1.5,
        }}>{subtitle}</p>
      </div>
      {/* Links */}
      <div style={{
        marginTop: 'auto', paddingTop: 8,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        {links.map(l => (
          <a key={l.label} href={l.href} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            color: PRIMARY, fontFamily: "'Roboto', sans-serif",
            fontSize: 13, fontWeight: 500, textDecoration: 'none',
          }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            {l.icon} {l.label}
          </a>
        ))}
      </div>
      {/* Indigo accent line at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 16, right: 16, height: 3,
        background: PRIMARY, borderRadius: 100,
      }} />
    </div>
  )
}

// ── Mis construcciones (bots, agentes, orquestadores) ──────────────────────
type ItemKind = 'agent' | 'orq' | 'bot'
const CLASSIC_BOTS: { name: string; date: string; kind: ItemKind; tag: string }[] = [
  { name: 'Asistente Bella Italia',  date: 'hace 2 h',     kind: 'agent', tag: 'Agente IA' },
  { name: 'Pizzería Bella Italia',   date: 'hace 4 h',     kind: 'orq',   tag: 'Orquestador' },
  { name: 'Soporte Nivel 1',         date: 'ayer',         kind: 'agent', tag: 'Agente IA' },
  { name: 'Demo BAX',                date: '24/06/2024',   kind: 'bot',   tag: 'Bot' },
  { name: 'Reservas Restaurante',    date: 'hace 5 d',     kind: 'bot',   tag: 'Bot' },
]

function ItemIcon({ kind }: { kind: ItemKind }) {
  if (kind === 'agent') return <AiAgentIcon size={18} />
  if (kind === 'orq')   return <OrchestratorIcon size={18} />
  return <ChatbotIcon size={18} />
}

function MisBotsList() {
  return (
    <section>
      <h3 style={{
        margin: 0, paddingBottom: 18, borderBottom: '1px solid #EEEEEE',
        fontFamily: "'Roboto', sans-serif", fontSize: 18, fontWeight: 700, color: '#212121',
        letterSpacing: '-0.01em',
      }}>Mis bots, agentes y orquestadores</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
        {CLASSIC_BOTS.map((b, i) => (
          <a
            key={i}
            href="#"
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 4px', borderRadius: 8,
              textDecoration: 'none', color: 'inherit',
              transition: 'background 140ms ease-out',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFD')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#EDEFFC', color: PRIMARY,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ItemIcon kind={b.kind} />
            </span>
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, fontWeight: 700, color: '#212121', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</span>
            <span style={{
              fontFamily: "'Roboto', sans-serif", fontSize: 10.5, fontWeight: 600,
              color: '#616161', background: '#F5F5F5', border: '1px solid #EEEEEE',
              padding: '2px 7px', borderRadius: 5, letterSpacing: '0.02em', flexShrink: 0,
            }}>{b.tag}</span>
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12.5, color: '#9E9E9E', flexShrink: 0 }}>{b.date}</span>
          </a>
        ))}
      </div>
      <a href="#" style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        marginTop: 8, padding: '8px 4px',
        color: PRIMARY, fontFamily: "'Roboto', sans-serif",
        fontSize: 13, fontWeight: 500, textDecoration: 'none',
      }}>
        Ver más <ChevronDown size={14} />
      </a>
    </section>
  )
}

// ── Canales panel ───────────────────────────────────────────────────────────
function CanalesPanel() {
  return (
    <section>
      <h3 style={{
        margin: 0, paddingBottom: 18, borderBottom: '1px solid #EEEEEE',
        fontFamily: "'Roboto', sans-serif", fontSize: 18, fontWeight: 700, color: '#212121',
        letterSpacing: '-0.01em',
      }}>Canales</h3>
      {/* Conectados */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, color: '#616161', marginBottom: 12 }}>Conectados</div>
        <div className="bm-canales-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <ChannelGlyph type="webchat" />
            <ChannelGlyph type="messenger" />
            <ChannelGlyph type="slack" />
            <ChannelGlyph type="mercadolibre" />
            <ChannelGlyph type="whatsapp" />
          </div>
          <SecondaryButton icon={<SettingsIcon />}>Configurar</SecondaryButton>
        </div>
      </div>
      {/* Por conectar */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, color: '#616161', marginBottom: 12 }}>Por conectar</div>
        <div className="bm-canales-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <ChannelGlyph type="teams" />
            <ChannelGlyph type="instagram" />
            <ChannelGlyph type="telegram" />
            <ChannelGlyph type="workplace" />
          </div>
          <SecondaryButton icon={<SettingsIcon />}>Conectar</SecondaryButton>
        </div>
      </div>
    </section>
  )
}

function SecondaryButton({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 18px', borderRadius: 100,
        background: hover ? '#F5F5F5' : '#FFFFFF',
        border: `1px solid ${PRIMARY}`,
        color: PRIMARY,
        fontFamily: "'Roboto', sans-serif", fontSize: 13, fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 140ms ease-out',
      }}
    >{icon}{children}</button>
  )
}

function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}

// ── Agenda de próximos entrenamientos ───────────────────────────────────────
const AGENDA = [
  { day: '13', month: 'MAR', title: 'Webinar: uso de ticketera', live: true,  time: '¡Ahora!',          lang: 'Español', cost: 'Sin costo', cta: 'Ingresar ahora',     ctaPrimary: true },
  { day: '13', month: 'MAR', title: 'Webinar: uso de ticketera', live: false, time: 'Miércoles 13/3 8:00AM', lang: 'Español', cost: 'Sin costo', cta: 'Reenviar invitación', ctaPrimary: false },
  { day: '13', month: 'MAR', title: 'Webinar: uso de ticketera', live: false, time: 'Miércoles 13/3 8:00AM', lang: 'Español', cost: 'Sin costo', cta: 'Agregar a calendario', ctaPrimary: false },
]

function AgendaPanel() {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18, borderBottom: '1px solid #EEEEEE' }}>
        <h3 style={{
          margin: 0, fontFamily: "'Roboto', sans-serif", fontSize: 18, fontWeight: 700, color: '#212121',
          letterSpacing: '-0.01em',
        }}>Agenda de próximos entrenamientos</h3>
        <a href="#" style={{ color: PRIMARY, fontFamily: "'Roboto', sans-serif", fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Ver todas</a>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
        {AGENDA.map((ev, i) => (
          <div key={i} className="bm-agenda-row" style={{
            display: 'grid', gridTemplateColumns: '50px 1fr auto', gap: 14, alignItems: 'center',
            padding: '14px 4px',
          }}>
            {/* Date pill */}
            <div style={{ textAlign: 'center', lineHeight: 1 }}>
              <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 22, fontWeight: 700, color: PRIMARY, letterSpacing: '-0.02em' }}>{ev.day}</div>
              <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11, fontWeight: 700, color: PRIMARY, letterSpacing: '0.06em', marginTop: 2 }}>{ev.month}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, fontWeight: 700, color: '#212121', lineHeight: 1.3 }}>{ev.title}</div>
              <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12.5, color: '#9E9E9E', marginTop: 4, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {ev.live ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#F5A623', fontWeight: 500 }}>
                    <ClockGlyph /> {ev.time}
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <ClockGlyph /> {ev.time}
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Globe size={11} /> {ev.lang}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <DollarGlyph /> {ev.cost}
                </span>
              </div>
            </div>
            <ClassicPill primary={ev.ctaPrimary}>{ev.cta}</ClassicPill>
          </div>
        ))}
      </div>
    </section>
  )
}

function ClassicPill({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '8px 18px', borderRadius: 100,
        background: primary ? (hover ? '#0026CA' : PRIMARY) : (hover ? '#F5F5F5' : '#FFFFFF'),
        color: primary ? '#FFFFFF' : PRIMARY,
        border: primary ? 'none' : `1px solid ${PRIMARY}`,
        fontFamily: "'Roboto', sans-serif", fontSize: 13, fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 140ms ease-out',
        whiteSpace: 'nowrap',
      }}
    >{children}</button>
  )
}

function ClockGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function DollarGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
}

// ── Ayuda + Botmaker App ────────────────────────────────────────────────────
const HELP = [
  { label: 'Primeros pasos', href: '#' },
  { label: 'Centro de ayuda', href: '#' },
  { label: 'Status', href: '#' },
  { label: 'Contacto', href: '#' },
]

function AyudaPanel() {
  return (
    <section>
      <h3 style={{
        margin: 0, paddingBottom: 18, borderBottom: '1px solid #EEEEEE',
        fontFamily: "'Roboto', sans-serif", fontSize: 18, fontWeight: 700, color: '#212121',
        letterSpacing: '-0.01em',
      }}>Ayuda</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
        {HELP.map(h => (
          <a key={h.label} href={h.href} style={{
            padding: '10px 0',
            color: PRIMARY, fontFamily: "'Roboto', sans-serif",
            fontSize: 14, fontWeight: 500, textDecoration: 'none',
          }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >{h.label}</a>
        ))}
      </div>
    </section>
  )
}

function BotmakerAppPanel() {
  return (
    <section>
      <h3 style={{
        margin: 0, paddingBottom: 18, borderBottom: '1px solid #EEEEEE',
        fontFamily: "'Roboto', sans-serif", fontSize: 18, fontWeight: 700, color: '#212121',
        letterSpacing: '-0.01em',
      }}>Botmaker App</h3>
      <p style={{
        margin: '14px 0 14px',
        fontFamily: "'Roboto', sans-serif", fontSize: 13.5, color: '#616161', lineHeight: 1.55,
      }}>Accede y responde a las conversaciones con tus agentes desde tu smartphone.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <AppStoreBadge />
        <GooglePlayBadge />
      </div>
    </section>
  )
}

function AppStoreBadge() {
  return (
    <a href="#" aria-label="Download on the App Store" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '8px 14px', borderRadius: 8,
      background: '#000', color: '#FFF', textDecoration: 'none',
      minWidth: 130,
    }}>
      <svg width="22" height="26" viewBox="0 0 24 28" fill="currentColor" aria-hidden>
        <path d="M17.32 14.74c-.02-2.74 2.24-4.06 2.34-4.13-1.28-1.86-3.27-2.12-3.97-2.15-1.69-.17-3.3 1-4.16 1-.87 0-2.19-.97-3.6-.94-1.85.03-3.55 1.07-4.5 2.72-1.92 3.32-.49 8.23 1.39 10.93.92 1.32 2.02 2.81 3.46 2.76 1.39-.06 1.91-.9 3.59-.9 1.67 0 2.15.9 3.62.87 1.5-.02 2.44-1.34 3.34-2.67 1.06-1.53 1.49-3.02 1.51-3.1-.03-.01-2.9-1.11-2.92-4.39zM14.61 6.62c.74-.94 1.25-2.21 1.11-3.5-1.07.05-2.42.74-3.2 1.66-.69.81-1.31 2.15-1.15 3.39 1.21.09 2.46-.61 3.24-1.55z"/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
        <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 9 }}>Download on the</span>
        <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 15, fontWeight: 600, marginTop: 2 }}>App Store</span>
      </div>
    </a>
  )
}

function GooglePlayBadge() {
  return (
    <a href="#" aria-label="Get it on Google Play" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '8px 14px', borderRadius: 8,
      background: '#000', color: '#FFF', textDecoration: 'none',
      minWidth: 130,
    }}>
      <svg width="22" height="24" viewBox="0 0 24 26" aria-hidden>
        <path d="M3.61 1.81a2.4 2.4 0 0 0-.41 1.36v17.66c0 .51.16.97.41 1.36L13 13 3.61 1.81z" fill="#00C2FF"/>
        <path d="M16.5 16.5L13 13l-9.39 11.19c.42.46 1.07.51 1.79.13l11.1-7.82z" fill="#FF3B30"/>
        <path d="M16.5 9.5l-2.99 5.99 6.43-3.6c.74-.41.74-1.07 0-1.48l-3.44-.91z" fill="#FFC107"/>
        <path d="M3.61 1.81L13 13l3.5-3.5-11.1-7.82c-.72-.38-1.37-.33-1.79.13z" fill="#34A853"/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
        <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 9 }}>GET IT ON</span>
        <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 15, fontWeight: 600, marginTop: 2 }}>Google Play</span>
      </div>
    </a>
  )
}

// ── Channel + bot icons ─────────────────────────────────────────────────────
function ChannelGlyph({ type }: { type: 'whatsapp' | 'webchat' | 'slack' | 'messenger' | 'mercadolibre' | 'teams' | 'instagram' | 'telegram' | 'workplace' }) {
  const map: Record<typeof type, { bg: string; node: React.ReactNode }> = {
    whatsapp:     { bg: '#25D366', node: <span style={{ color: '#FFF', fontSize: 16 }}>✆</span> },
    webchat:      { bg: '#3680FF', node: <MessagesSquare size={15} color="#FFF" /> },
    slack:        { bg: '#611F69', node: <span style={{ color: '#FFF', fontWeight: 700, fontSize: 13 }}>#</span> },
    messenger:    { bg: '#0084FF', node: <MessagesSquare size={15} color="#FFF" /> },
    mercadolibre: { bg: '#FFE600', node: <MessagesSquare size={15} color="#2E3B5C" /> },
    teams:        { bg: '#5059C9', node: <span style={{ color: '#FFF', fontWeight: 700, fontSize: 11 }}>T</span> },
    instagram:    { bg: 'linear-gradient(135deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)', node: <InstagramGlyph /> },
    telegram:     { bg: '#27A8E8', node: <TelegramGlyph /> },
    workplace:    { bg: '#1877F2', node: <span style={{ color: '#FFF', fontWeight: 700, fontSize: 13 }}>W</span> },
  }
  const c = map[type]
  return (
    <span style={{
      width: 32, height: 32, borderRadius: '50%',
      background: c.bg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{c.node}</span>
  )
}

function InstagramGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="white"/>
    </svg>
  )
}
function TelegramGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.24 3.64 11.95c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
    </svg>
  )
}

function ChatBubbleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>
  )
}
function CloudBotIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="cloudG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5B7DFF"/>
          <stop offset="100%" stopColor="#1FCEC8"/>
        </linearGradient>
      </defs>
      <path d="M19 18H6.5a4.5 4.5 0 0 1-.5-8.97 6 6 0 0 1 11.71 1.06A4 4 0 0 1 19 18z" fill="url(#cloudG)"/>
    </svg>
  )
}
function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  )
}
function FileTextIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// HOME BANNER (variant D) — banner azul gradient + simple cards row.
// Inspirado en la referencia Hejrat Foundation: hero banner con CTAs +
// "Featured Topics" como cards simples icon+label.
// ═════════════════════════════════════════════════════════════════════════════
function HomeBanner() {
  return (
    <div style={{
      minHeight: '100vh', background: '#FAFBFD', color: '#212121',
      fontFamily: "'Roboto', system-ui, sans-serif",
      WebkitFontSmoothing: 'antialiased',
      display: 'flex', flexDirection: 'column',
    }}>
      <BannerTopBar />
      <main className="bm-d-main" style={{ flex: 1, width: '100%', maxWidth: 1280, margin: '0 auto', padding: '32px 28px 56px', boxSizing: 'border-box' }}>
        <BlueBanner />
        <SimpleCardsRow />
        <div className="bm-d-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 56 }}>
          <BannerMisBots />
          <BannerAgenda />
        </div>
      </main>
      <KeyFrames />
    </div>
  )
}

function BannerTopBar() {
  return (
    <header className="bm-d-topbar" style={{
      background: '#FFFFFF', borderBottom: '1px solid #EEEEEE',
      padding: '0 24px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button aria-label="Toggle menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: PRIMARY, display: 'flex', alignItems: 'center', padding: 6, borderRadius: 100 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#E6EAFF')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        ><Menu size={20} /></button>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#212121' }}>Inicio</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button aria-label="Search" style={{ width: 34, height: 34, borderRadius: 100, border: 'none', background: 'transparent', cursor: 'pointer', color: '#757575', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F5')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        ><Search size={17} /></button>
        <button aria-label="Inbox" style={{ width: 34, height: 34, borderRadius: 100, border: 'none', background: 'transparent', cursor: 'pointer', color: '#757575', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F5')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        ><Inbox size={17} /></button>
        <button aria-label="Help" style={{ width: 34, height: 34, borderRadius: 100, border: 'none', background: 'transparent', cursor: 'pointer', color: '#757575', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F5')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        ><HelpCircle size={17} /></button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 4px 4px', borderRadius: 100, border: '1px solid #EEEEEE', background: '#FFFFFF', cursor: 'pointer', marginLeft: 6 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F5')}
          onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: PRIMARY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>GT</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
            <span style={{ fontSize: 9.5, color: '#757575', fontWeight: 500 }}>Estado</span>
            <span style={{ fontSize: 11.5, color: '#212121', fontWeight: 500 }}>En línea</span>
          </div>
          <ChevronDown size={12} style={{ color: '#757575' }} />
        </button>
      </div>
    </header>
  )
}

// ── Blue banner with dark gradient + AI agent illustration ─────────────────
function BlueBanner() {
  return (
    <section className="bm-d-banner" style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 24,
      padding: '48px 48px 40px',
      minHeight: 280,
      background: [
        'radial-gradient(circle at 12% 28%, rgba(98,114,255,0.45) 0%, transparent 55%)',
        'radial-gradient(circle at 88% 8%, rgba(48,79,254,0.55) 0%, transparent 55%)',
        'radial-gradient(circle at 70% 100%, rgba(0,38,202,0.55) 0%, transparent 55%)',
        'linear-gradient(135deg, #0A1342 0%, #131F5F 35%, #1D31AA 70%, #304FFE 100%)',
      ].join(', '),
      color: '#FFFFFF',
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center',
      boxShadow: '0 24px 48px -16px rgba(15,26,77,0.30)',
    }}>
      {/* Subtle grid overlay */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: [
          'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px)',
          'linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '52px 52px',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 35% 50%, black 30%, transparent 80%)',
        maskImage: 'radial-gradient(ellipse 90% 70% at 35% 50%, black 30%, transparent 80%)',
      }} />

      {/* Left: copy + CTAs */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 580 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 11px', borderRadius: 100,
          background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)',
          backdropFilter: 'blur(6px)',
          fontFamily: "'Roboto', sans-serif", fontSize: 11, fontWeight: 600,
          color: '#E6EAFF', letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: 18,
        }}>
          <Sparkles size={11} /> Nuevo
        </span>
        <h2 style={{
          margin: 0,
          fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif",
          fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 600,
          lineHeight: 1.1, letterSpacing: '-0.025em', color: '#FFFFFF',
        }}>
          Prueba los nuevos agentes de IA
        </h2>
        <p style={{
          margin: '14px 0 0', maxWidth: 480,
          fontFamily: "'Roboto', sans-serif", fontSize: 15.5, lineHeight: 1.55,
          color: 'rgba(255,255,255,0.78)', fontWeight: 400,
        }}>
          Construye agentes inteligentes que conversan, deciden y resuelven 24/7.
          La nueva forma de automatizar con IA.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
          <BannerCta primary href="/bienvenida">Probar agentes <ArrowRight size={14} /></BannerCta>
          <BannerCta href="#cards">Ver cómo funciona</BannerCta>
        </div>
        {/* Carousel dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 28 }}>
          <span style={{ width: 24, height: 4, borderRadius: 100, background: '#FFFFFF' }} />
          <span style={{ width: 8, height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.32)' }} />
          <span style={{ width: 8, height: 4, borderRadius: 100, background: 'rgba(255,255,255,0.32)' }} />
        </div>
      </div>

      {/* Right: AI agent illustration */}
      <div className="bm-d-banner-art" style={{ position: 'relative', zIndex: 1, width: 320, height: 240 }}>
        <BannerArtwork />
      </div>
    </section>
  )
}

function BannerCta({ children, primary, href }: { children: React.ReactNode; primary?: boolean; href: string }) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '12px 22px', borderRadius: 100,
        background: primary ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
        color: primary ? '#0026CA' : '#FFFFFF',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.28)',
        backdropFilter: primary ? undefined : 'blur(6px)',
        fontFamily: "'Roboto', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em',
        textDecoration: 'none', whiteSpace: 'nowrap',
        boxShadow: primary && hover ? '0 12px 28px -8px rgba(0,0,0,0.30)' : 'none',
        transform: hover ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'transform 220ms ease-out, box-shadow 220ms ease-out, background 220ms ease-out',
      }}
    >{children}</a>
  )
}

function BannerArtwork() {
  return (
    <svg viewBox="0 0 360 280" width="100%" height="100%" aria-hidden style={{ animation: 'bmFloat 7s ease-in-out infinite' }}>
      <defs>
        <linearGradient id="dBotFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#C9D2FF" />
        </linearGradient>
        <linearGradient id="dHalo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.24)" />
          <stop offset="100%" stopColor="rgba(98,114,255,0.06)" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="150" rx="160" ry="160" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.2" strokeDasharray="2 6" />
      <ellipse cx="180" cy="150" rx="118" ry="118" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" />
      <g transform="translate(180 150)">
        <circle r="84" fill="url(#dHalo)" />
        <rect x="-58" y="-50" width="116" height="100" rx="28" fill="url(#dBotFace)" />
        <circle cx="-20" cy="-6" r="8" fill="#0F1A4D" />
        <circle cx="20" cy="-6" r="8" fill="#0F1A4D" />
        <circle cx="-17" cy="-9" r="2.5" fill="#FFFFFF" />
        <circle cx="23" cy="-9" r="2.5" fill="#FFFFFF" />
        <path d="M-16 24 Q0 36 16 24" stroke="#0F1A4D" strokeWidth="4" strokeLinecap="round" fill="none" />
        <line x1="0" y1="-50" x2="0" y2="-72" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="-78" r="6" fill="#FFFFFF" />
      </g>
      {/* Floating chat bubbles */}
      <g opacity="0.85">
        <rect x="40" y="58" width="64" height="22" rx="11" fill="rgba(255,255,255,0.92)" />
        <circle cx="55" cy="69" r="3" fill="#304FFE" />
        <circle cx="66" cy="69" r="3" fill="#304FFE" />
        <circle cx="77" cy="69" r="3" fill="#304FFE" />
      </g>
      <g opacity="0.65">
        <rect x="50" y="220" width="76" height="22" rx="11" fill="rgba(255,255,255,0.55)" />
      </g>
    </svg>
  )
}

// ── Simple CTA cards row ────────────────────────────────────────────────────
function SimpleCardsRow() {
  return (
    <section id="cards" style={{ marginTop: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{
          margin: 0, fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif",
          fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: '#212121',
        }}>¿Qué quieres hacer?</h2>
        <a href="#" style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, fontWeight: 500, color: PRIMARY, textDecoration: 'none' }}>Ver todo →</a>
      </div>
      <div className="bm-d-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        <SimpleCard icon={<AiAgentIcon size={22} />} label="Agentes de IA" href="/bienvenida" featured />
        <SimpleCard icon={<ChatbotIcon size={22} />} label="Chatbots" href="/agents" />
        <SimpleCard icon={<Mail size={22} />} label="Mailbots" href="#" />
        <SimpleCard icon={<Phone size={22} />} label="Callbots" href="#" />
        <SimpleCard icon={<MessagesSquare size={22} />} label="Atender" href="#" />
        <SimpleCard icon={<Megaphone size={22} />} label="Notificaciones" href="#" />
      </div>
    </section>
  )
}

function SimpleCard({ icon, label, href, featured }: { icon: React.ReactNode; label: string; href: string; featured?: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={href}
      className="bm-d-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
        padding: '28px 14px',
        background: '#FFFFFF',
        border: `1px solid ${featured || hover ? '#D6DCFF' : '#EEEEEE'}`,
        borderRadius: 14,
        textDecoration: 'none', color: '#212121',
        cursor: 'pointer', minHeight: 132,
        boxShadow: hover ? '0 8px 24px -8px rgba(48,79,254,0.18)' : 'none',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 200ms ease-out',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: featured ? '#E6EAFF' : '#F5F5F5',
        color: featured ? PRIMARY : '#616161',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div style={{
        fontFamily: "'Roboto', sans-serif", fontSize: 13, fontWeight: 600,
        color: '#212121', textAlign: 'center', letterSpacing: '-0.005em',
      }}>{label}</div>
      {featured && (
        <a href={href} style={{
          fontSize: 11.5, fontWeight: 500, color: PRIMARY,
          textDecoration: 'underline', textUnderlineOffset: 3,
        }}>Ver detalles</a>
      )}
    </a>
  )
}

// ── Mis bots compact for variant D ──────────────────────────────────────────
function BannerMisBots() {
  return (
    <section>
      <h3 style={{
        margin: 0, paddingBottom: 14, borderBottom: '1px solid #EEEEEE',
        fontFamily: "'Inter Tight', 'Inter', sans-serif", fontSize: 18, fontWeight: 600,
        color: '#212121', letterSpacing: '-0.015em',
      }}>Mis bots, agentes y orquestadores</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        {CLASSIC_BOTS.map((b, i) => (
          <a key={i} href="#" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 4px', borderRadius: 8,
            textDecoration: 'none', color: 'inherit',
            transition: 'background 140ms ease-out',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFD')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{
              width: 26, height: 26, borderRadius: 7,
              background: '#EDEFFC', color: PRIMARY,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}><ItemIcon kind={b.kind} /></span>
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13.5, fontWeight: 600, color: '#212121', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</span>
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11, color: '#9E9E9E', flexShrink: 0 }}>{b.date}</span>
          </a>
        ))}
      </div>
      <a href="#" style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        marginTop: 6, padding: '6px 4px',
        color: PRIMARY, fontFamily: "'Roboto', sans-serif",
        fontSize: 13, fontWeight: 500, textDecoration: 'none',
      }}>Ver más <ChevronDown size={14} /></a>
    </section>
  )
}

function BannerAgenda() {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid #EEEEEE' }}>
        <h3 style={{
          margin: 0, fontFamily: "'Inter Tight', 'Inter', sans-serif", fontSize: 18, fontWeight: 600,
          color: '#212121', letterSpacing: '-0.015em',
        }}>Próximos eventos</h3>
        <a href="#" style={{ color: PRIMARY, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Ver todas</a>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        {AGENDA.slice(0, 3).map((ev, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: 14, alignItems: 'center',
            padding: '12px 4px',
          }}>
            <div style={{ textAlign: 'center', lineHeight: 1 }}>
              <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 20, fontWeight: 700, color: PRIMARY, letterSpacing: '-0.02em' }}>{ev.day}</div>
              <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 10.5, fontWeight: 700, color: PRIMARY, letterSpacing: '0.06em', marginTop: 2 }}>{ev.month}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13.5, fontWeight: 600, color: '#212121', lineHeight: 1.3 }}>{ev.title}</div>
              <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: '#9E9E9E', marginTop: 3 }}>
                {ev.live ? <span style={{ color: '#F5A623', fontWeight: 500 }}>● ¡Ahora!</span> : ev.time}
              </div>
            </div>
            <ClassicPill primary={ev.ctaPrimary}>{ev.cta}</ClassicPill>
          </div>
        ))}
      </div>
    </section>
  )
}
