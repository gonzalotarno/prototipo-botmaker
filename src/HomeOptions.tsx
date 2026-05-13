import { useEffect } from 'react'
import { ArrowRight, Sparkles, Layers, Grid3x3 } from 'lucide-react'

// ── HomeOptions — landing screen to compare A vs B home variants ─────────────
// Matches the visual language used in both home variants: white surfaces,
// hairline borders, Inter UI, indigo accents rationed.

const T = {
  surface:    '#FFFFFF',
  canvas:     '#F7F8FC',
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
} as const

const INTER = "'Inter', 'Roboto', system-ui, -apple-system, sans-serif"

function useInter() {
  useEffect(() => {
    const id = 'bm-home-inter'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
  }, [])
}

export default function HomeOptions() {
  useInter()
  return (
    <div style={{
      minHeight: '100vh', background: T.canvas, color: T.fg,
      fontFamily: INTER, WebkitFontSmoothing: 'antialiased',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Atmosphere */}
      <div aria-hidden style={{
        position: 'absolute', top: -260, right: -200, width: 880, height: 880,
        background: 'radial-gradient(circle at center, rgba(48,79,254,0.10) 0%, rgba(48,79,254,0.05) 35%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: -300, left: -260, width: 760, height: 760,
        background: 'radial-gradient(circle at center, rgba(98,114,255,0.06) 0%, rgba(48,79,254,0.03) 40%, transparent 75%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <main style={{
        flex: 1, width: '100%', maxWidth: 1100, margin: '0 auto',
        padding: '88px 28px 80px', boxSizing: 'border-box',
        position: 'relative', zIndex: 1,
      }}>
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 11px', borderRadius: 100,
          border: `1px solid ${T.hair}`, background: T.surface,
          fontSize: 11.5, color: T.fg2, fontWeight: 500, marginBottom: 22,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 100, background: T.accent }} />
          Iteración · 4 versiones para revisar
        </div>

        {/* Heading */}
        <h1 style={{
          margin: 0, fontFamily: INTER, fontWeight: 600,
          fontSize: 'clamp(34px, 4vw, 46px)', lineHeight: 1.05, letterSpacing: '-0.03em',
          color: T.fg, maxWidth: 760,
        }}>
          Nueva home de Botmaker.
        </h1>
        <p style={{
          margin: '14px 0 0', maxWidth: 700, fontSize: 16, lineHeight: 1.55,
          color: T.fg3, fontWeight: 400,
        }}>
          Cuatro estructuras candidatas. A es clean elevada con craft Linear/Framer.
          B agrupa los surfaces de diseño en grilla. C combina hero estilo web-redesign
          arriba con el contenido original abajo. D es banner azul promo + cards simples.
        </p>

        {/* Options */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 44 }}>
          <OptionCard
            letter="A"
            tag="Clean grid"
            title="4 hero CTAs equal-width"
            blurb="Estructura del mock del equipo elevada: Inter, hairlines, indigo rationed, hover glow en Agentes IA. Conservador."
            bullets={['4 cards iguales', 'Glow indigo solo Agentes IA', 'Tabs Explora abajo']}
            preview={<MockA />}
            href="/home-a"
          />
          <OptionCard
            letter="B"
            tag="Grid 4 + 2"
            title="Diseñar (4) + Operar/Comunicar (2)"
            blurb="Grid 4-col con Agentes IA + Chatbots + MailBots + Callbots. Abajo Atender + Notificaciones. Plano y simétrico."
            bullets={['Agentes IA en grid (no separado)', '4 surfaces diseño + 2 operar', 'Section headers Diseñar/Operar']}
            preview={<MockB />}
            href="/home-b"
          />
          <OptionCard
            letter="C"
            tag="Web-redesign + clásico"
            title="Hero editorial + contenido original"
            blurb="Hero estilo web redesign (mesh aurora, gradient text, pill buttons) arriba. Abajo container blanco con el contenido original de Botmaker + card de Agentes IA."
            bullets={['Mesh aurora + Inter Tight', '4 cards + Mis bots + Canales', 'Agenda + Ayuda + App']}
            preview={<MockC />}
            href="/home-c"
            featured
          />
          <OptionCard
            letter="D"
            tag="Banner promo"
            title="Banner azul + simple cards"
            blurb="Banner gradient azul oscuro arriba con CTA «Prueba los nuevos agentes de IA». Abajo, 6 cards simples icon+label tipo featured topics."
            bullets={['Banner azul + ilustración bot', 'Carrusel dots + 2 CTAs', 'Cards simples 6-col']}
            preview={<MockD />}
            href="/home-d"
          />
        </section>

        {/* Footer note */}
        <p style={{
          margin: '36px 0 0', fontSize: 12.5, color: T.fg3, lineHeight: 1.5, maxWidth: 620,
        }}>
          Datos mockeados. Cada versión es una ruta directa — puedes volver a esta
          página con el botón flotante de "Volver al inicio" en cualquier vista.
        </p>
      </main>
    </div>
  )
}

interface OptionCardProps {
  letter: 'A' | 'B' | 'C' | 'D'
  tag: string
  title: string
  blurb: string
  bullets: string[]
  preview: React.ReactNode
  href: string
  featured?: boolean
}

function OptionCard({ letter, tag, title, blurb, bullets, preview, href, featured }: OptionCardProps) {
  return (
    <a
      href={href}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 16,
        textDecoration: 'none', color: T.fg,
        transition: 'border-color 200ms ease-out, transform 200ms ease-out, box-shadow 200ms ease-out',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        if (featured) {
          e.currentTarget.style.borderColor = T.accent
          e.currentTarget.style.boxShadow = `0 18px 44px -12px rgba(48,79,254,0.32), 0 0 0 4px ${T.accentRing}`
        } else {
          e.currentTarget.style.borderColor = T.hairStrong
          e.currentTarget.style.boxShadow = '0 14px 36px -16px rgba(15,23,42,0.18)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = T.hair
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Preview area */}
      <div style={{ position: 'relative', height: 220, background: T.subtle, borderBottom: `1px solid ${T.hair}`, overflow: 'hidden' }}>
        {preview}
      </div>

      {/* Body */}
      <div style={{ padding: '24px 26px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Tag row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 7,
            background: featured ? T.accent : T.fg,
            color: T.surface, fontFamily: INTER, fontSize: 12.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.02em',
          }}>{letter}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', borderRadius: 6,
            background: featured ? T.accentSoft : T.subtle,
            color: featured ? T.accent : T.fg2,
            border: `1px solid ${featured ? 'transparent' : T.hair}`,
            fontFamily: INTER, fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
          }}>
            {featured && <Sparkles size={10} />} {tag}
          </span>
        </div>

        <h3 style={{
          margin: 0, fontFamily: INTER, fontSize: 18, fontWeight: 600,
          color: T.fg, letterSpacing: '-0.015em', lineHeight: 1.25,
        }}>{title}</h3>

        <p style={{ margin: 0, fontSize: 13.5, color: T.fg3, lineHeight: 1.55, fontWeight: 400 }}>
          {blurb}
        </p>

        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bullets.map(b => (
            <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: T.fg2 }}>
              <span style={{
                width: 14, height: 14, marginTop: 2, borderRadius: 4,
                background: featured ? T.accentSoft : T.subtle,
                color: featured ? T.accent : T.fg3,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, flexShrink: 0,
              }}>✓</span>
              {b}
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 9,
            background: featured ? T.accent : T.fg,
            color: T.surface,
            fontFamily: INTER, fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
          }}>
            Abrir versión {letter} <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </a>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock previews — abstract SVG mockups, no actual screenshots
// ─────────────────────────────────────────────────────────────────────────────
function MockA() {
  return (
    <svg viewBox="0 0 480 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {/* Topbar */}
      <rect x="24" y="20" width="432" height="22" rx="4" fill="white" stroke={T.hair} />
      <circle cx="36" cy="31" r="2.5" fill={T.fg3} />
      <rect x="44" y="28" width="28" height="6" rx="2" fill={T.fg3} />
      <circle cx="436" cy="31" r="6" fill={T.fg} />
      {/* Greeting */}
      <rect x="24" y="56" width="180" height="10" rx="3" fill={T.fg} />
      <rect x="208" y="58" width="80" height="6" rx="2" fill={T.fg3} />
      {/* 4 hero cards */}
      {[0,1,2,3].map(i => {
        const isFirst = i === 0
        const x = 24 + i * 110
        return (
          <g key={i}>
            <rect x={x} y="76" width="100" height="80" rx="6" fill="white" stroke={isFirst ? T.accent : T.hair} strokeWidth={isFirst ? 1.5 : 1} />
            {isFirst && <rect x={x} y="76" width="100" height="2" rx="1" fill={T.accent} />}
            <rect x={x + 10} y={86} width="14" height="14" rx="3" fill={isFirst ? T.accentSoft : T.subtle} stroke={isFirst ? 'transparent' : T.hair} />
            <rect x={x + 10} y={108} width="70" height="6" rx="2" fill={T.fg} />
            <rect x={x + 10} y={120} width="56" height="4" rx="2" fill={T.fg3} />
            <rect x={x + 10} y={134} width="44" height="12" rx="3" fill={isFirst ? T.accent : 'white'} stroke={isFirst ? 'transparent' : T.hair} />
          </g>
        )
      })}
      {/* Tabs */}
      <rect x="24" y="172" width="160" height="14" rx="4" fill={T.subtle} stroke={T.hair} />
      <rect x="28" y="175" width="36" height="8" rx="2" fill="white" />
      {/* Lists */}
      <rect x="24" y="194" width="270" height="18" rx="4" fill="white" stroke={T.hair} />
      <rect x="304" y="194" width="152" height="18" rx="4" fill="white" stroke={T.hair} />
    </svg>
  )
}

function MockB() {
  // Grid mockup: greeting → featured banner → 3-col Chatbots/MailBots/Callbots → 2-col Atender + Notif
  const acc = T.accent
  return (
    <svg viewBox="0 0 480 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {/* Topbar */}
      <rect x="24" y="20" width="432" height="22" rx="4" fill="white" stroke={T.hair} />
      <circle cx="36" cy="31" r="2.5" fill={T.fg3} />
      <rect x="44" y="28" width="28" height="6" rx="2" fill={T.fg3} />
      <circle cx="436" cy="31" r="6" fill={T.fg} />

      {/* Editorial greeting */}
      <rect x="24" y="56" width="220" height="11" rx="3" fill={T.fg} />
      <rect x="24" y="73" width="160" height="4" rx="2" fill={T.fg3} />

      {/* Row 1: Featured Agentes IA banner — full width with indigo top stripe */}
      <rect x="24" y="92" width="432" height="36" rx="6" fill="white" stroke={acc} strokeWidth="1.2" />
      <rect x="24" y="92" width="432" height="2" rx="1" fill={acc} />
      <rect x="32" y="100" width="20" height="20" rx="4" fill={T.accentSoft} />
      <rect x="58" y="103" width="80" height="5" rx="2" fill={T.fg} />
      <rect x="142" y="103" width="22" height="5" rx="2" fill={T.accentSoft} />
      <rect x="58" y="114" width="160" height="3" rx="1.5" fill={T.fg3} />
      <rect x="404" y="103" width="44" height="16" rx="4" fill={acc} />

      {/* Row 2 label */}
      <rect x="24" y="138" width="120" height="3" rx="1.5" fill={T.fg3} />
      {/* Row 2: Bots cluster — 3 cards */}
      {[0, 1, 2].map(i => {
        const x = 24 + i * 144
        return (
          <g key={i}>
            <rect x={x} y="146" width="136" height="44" rx="6" fill="white" stroke={T.hair} />
            <rect x={x + 10} y={154} width="14" height="14" rx="3" fill={T.subtle} stroke={T.hair} />
            <rect x={x + 10} y={174} width="56" height="4" rx="2" fill={T.fg} />
            <rect x={x + 10} y={183} width="80" height="3" rx="1.5" fill={T.fg3} />
          </g>
        )
      })}

      {/* Row 3: Operar + Comunicar — 2 cards */}
      {[0, 1].map(i => {
        const x = 24 + i * 220
        return (
          <g key={i}>
            <rect x={x} y="196" width="212" height="20" rx="6" fill="white" stroke={T.hair} />
            <rect x={x + 8} y={202} width="8" height="8" rx="2" fill={T.subtle} stroke={T.hair} />
            <rect x={x + 22} y={203} width="60" height="3" rx="1.5" fill={T.fg} />
            <rect x={x + 22} y={209} width="84" height="3" rx="1.5" fill={T.fg3} />
            {i === 0 && (
              <>
                <rect x={x + 130} y="203" width="22" height="9" rx="2" fill="white" stroke={T.hair} />
                <rect x={x + 156} y="203" width="22" height="9" rx="2" fill="white" stroke={T.hair} />
                <rect x={x + 182} y="203" width="22" height="9" rx="2" fill="white" stroke={T.hair} />
              </>
            )}
            {i === 1 && (
              <rect x={x + 158} y="203" width="46" height="9" rx="2" fill="white" stroke={T.hair} />
            )}
          </g>
        )
      })}
    </svg>
  )
}


function MockC() {
  // Web-redesign style mockup: aurora hero + bento with featured Agentes IA 2x2
  const acc = T.accent
  return (
    <svg viewBox="0 0 480 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="cAurora1" cx="20%" cy="10%" r="50%">
          <stop offset="0%" stopColor="rgba(48,79,254,0.18)" />
          <stop offset="100%" stopColor="rgba(48,79,254,0)" />
        </radialGradient>
        <radialGradient id="cAurora2" cx="80%" cy="0%" r="40%">
          <stop offset="0%" stopColor="rgba(98,114,255,0.22)" />
          <stop offset="100%" stopColor="rgba(48,79,254,0)" />
        </radialGradient>
        <linearGradient id="cFeatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="rgba(235,238,255,1)" />
        </linearGradient>
      </defs>
      {/* Mesh aurora bg */}
      <rect x="0" y="0" width="480" height="220" fill="#F7F8FB" />
      <rect x="0" y="0" width="480" height="220" fill="url(#cAurora1)" />
      <rect x="0" y="0" width="480" height="220" fill="url(#cAurora2)" />
      {/* Topbar (glassmorphic) */}
      <rect x="24" y="20" width="432" height="20" rx="4" fill="rgba(255,255,255,0.6)" stroke={T.hair} />
      {/* Hero — eyebrow pill */}
      <rect x="36" y="52" width="80" height="11" rx="6" fill="rgba(255,255,255,0.7)" stroke={T.hair} />
      <circle cx="44" cy="58" r="2" fill={acc} />
      {/* Hero — display heading 2 lines */}
      <rect x="36" y="72" width="220" height="11" rx="3" fill={T.fg} />
      <rect x="36" y="88" width="120" height="11" rx="3" fill={T.fg} />
      <rect x="160" y="88" width="60" height="11" rx="3" fill={acc} />
      <rect x="36" y="106" width="180" height="5" rx="2" fill={T.fg3} />
      {/* Hero — pill buttons */}
      <rect x="36" y="120" width="64" height="14" rx="7" fill={acc} />
      <rect x="106" y="120" width="80" height="14" rx="7" fill="rgba(255,255,255,0.7)" stroke={T.hair} />
      {/* Bento — featured 2x2 + 4 cells */}
      {/* Featured Agentes IA */}
      <rect x="280" y="52" width="160" height="86" rx="14" fill="url(#cFeatGrad)" stroke={acc} strokeWidth="1" />
      <rect x="290" y="60" width="20" height="20" rx="6" fill={acc} />
      <rect x="290" y="86" width="80" height="6" rx="2" fill={T.fg} />
      <rect x="290" y="96" width="100" height="4" rx="2" fill={T.fg3} />
      <rect x="290" y="116" width="50" height="14" rx="7" fill={acc} />
      {/* Small cards row */}
      <rect x="36"  y="148" width="100" height="58" rx="10" fill="white" stroke={T.hair} />
      <rect x="44" y="156" width="14" height="14" rx="3" fill={T.subtle} stroke={T.hair} />
      <rect x="44" y="178" width="56" height="5" rx="2" fill={T.fg} />
      <rect x="44" y="188" width="80" height="3" rx="1.5" fill={T.fg3} />
      <rect x="144" y="148" width="100" height="58" rx="10" fill="white" stroke={T.hair} />
      <rect x="152" y="156" width="14" height="14" rx="3" fill={T.subtle} stroke={T.hair} />
      <rect x="152" y="178" width="56" height="5" rx="2" fill={T.fg} />
      <rect x="252" y="148" width="100" height="58" rx="10" fill="white" stroke={T.hair} />
      <rect x="260" y="156" width="14" height="14" rx="3" fill={T.subtle} stroke={T.hair} />
      <rect x="260" y="178" width="56" height="5" rx="2" fill={T.fg} />
      <rect x="360" y="148" width="80" height="58" rx="10" fill="white" stroke={T.hair} />
      <rect x="368" y="156" width="14" height="14" rx="3" fill={T.accentSoft} />
      <rect x="368" y="178" width="40" height="5" rx="2" fill={T.fg} />
    </svg>
  )
}

function MockD() {
  // Banner azul gradient + simple cards row
  const acc = T.accent
  return (
    <svg viewBox="0 0 480 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="dBannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A1342" />
          <stop offset="50%" stopColor="#1D31AA" />
          <stop offset="100%" stopColor="#304FFE" />
        </linearGradient>
      </defs>
      {/* Topbar */}
      <rect x="24" y="20" width="432" height="20" rx="4" fill="white" stroke={T.hair} />
      {/* Blue banner */}
      <rect x="24" y="50" width="432" height="84" rx="12" fill="url(#dBannerGrad)" />
      {/* Banner — eyebrow pill */}
      <rect x="40" y="62" width="44" height="9" rx="4.5" fill="rgba(255,255,255,0.2)" />
      <rect x="40" y="78" width="200" height="11" rx="3" fill="white" />
      <rect x="40" y="92" width="160" height="5" rx="2" fill="rgba(255,255,255,0.65)" />
      <rect x="40" y="108" width="58" height="14" rx="7" fill="white" />
      <rect x="104" y="108" width="76" height="14" rx="7" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.32)" />
      {/* Bot illustration on right */}
      <circle cx="380" cy="92" r="32" fill="rgba(255,255,255,0.18)" />
      <rect x="362" y="78" width="36" height="30" rx="9" fill="white" />
      <circle cx="372" cy="91" r="3" fill="#0F1A4D" />
      <circle cx="386" cy="91" r="3" fill="#0F1A4D" />
      <path d="M370 100 Q380 105 388 100" stroke="#0F1A4D" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Carousel dots */}
      <rect x="40" y="128" width="14" height="2" rx="1" fill="white" />
      <rect x="58" y="128" width="6" height="2" rx="1" fill="rgba(255,255,255,0.32)" />
      <rect x="68" y="128" width="6" height="2" rx="1" fill="rgba(255,255,255,0.32)" />
      {/* Section header */}
      <rect x="24" y="148" width="80" height="6" rx="2" fill={T.fg} />
      {/* Simple cards row */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const x = 24 + i * 74
        const isFeat = i === 0
        return (
          <g key={i}>
            <rect x={x} y="162" width="66" height="48" rx="8" fill="white" stroke={isFeat ? acc : T.hair} strokeWidth={isFeat ? 1.4 : 1} />
            <rect x={x + 24} y={170} width="18" height="18" rx="4" fill={isFeat ? T.accentSoft : T.subtle} stroke={isFeat ? 'transparent' : T.hair} />
            <rect x={x + 14} y={194} width="38" height="4" rx="2" fill={T.fg} />
            {isFeat && <rect x={x + 22} y={202} width="22" height="3" rx="1.5" fill={acc} />}
          </g>
        )
      })}
    </svg>
  )
}
