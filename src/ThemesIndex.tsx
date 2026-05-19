import { useEffect } from 'react'
import { ArrowRight, Layers, Workflow, Sparkles } from 'lucide-react'

// ── ThemesIndex — landing de temas en evaluación ─────────────────────────────
// Lista los experimentos de UX/producto que estamos evaluando con el equipo.
// Cada tema lleva a su propia subpágina (que a su vez puede tener variantes A/B/...).

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
    const id = 'bm-themes-inter'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
  }, [])
}

interface Theme {
  id: string
  href: string
  status: 'active' | 'next' | 'soon'
  eyebrow: string
  title: string
  blurb: string
  bullets: string[]
  preview: React.ReactNode
  icon: React.ReactNode
}

const THEMES: Theme[] = [
  {
    id: 'home',
    href: '/home',
    status: 'active',
    eyebrow: 'Nueva home',
    title: 'Home de Botmaker',
    blurb: 'Rediseño de la home para el lanzamiento del Diseñador de Agentes de IA. 4 variantes (A · B · C · D) para revisar con líderes.',
    bullets: ['4 estructuras candidatas', 'Opción C elegida', 'Lista en Figma + dev'],
    preview: <HomePreview />,
    icon: <Layers size={16} />,
  },
  {
    id: 'workflows',
    href: '/estados',
    status: 'next',
    eyebrow: 'En evaluación · 2 propuestas',
    title: 'Workflows / Estados',
    blurb: 'Dos propuestas para crear y configurar el workflow del agente: canvas visual con nodos (A) vs lista secuencial de pasos (B).',
    bullets: ['Propuesta A: canvas con nodos arrastrables', 'Propuesta B: lista de pasos con edición inline', 'Estados simples, avanzados y finales'],
    preview: <WorkflowsPreview />,
    icon: <Workflow size={16} />,
  },
  {
    id: 'soon',
    href: '#',
    status: 'soon',
    eyebrow: 'Próximamente',
    title: 'Más temas en camino',
    blurb: 'Los próximos experimentos que vayamos evaluando con el equipo aparecen acá. Sumate cuando pinta una idea para iterar.',
    bullets: ['Orquestadores', 'Bases de conocimiento', 'Métricas de agentes'],
    preview: <SoonPreview />,
    icon: <Sparkles size={16} />,
  },
]

export default function ThemesIndex() {
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
        flex: 1, width: '100%', maxWidth: 1180, margin: '0 auto',
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
          Prototipo Botmaker · temas en evaluación
        </div>

        {/* Heading */}
        <h1 style={{
          margin: 0, fontFamily: INTER, fontWeight: 600,
          fontSize: 'clamp(34px, 4vw, 46px)', lineHeight: 1.05, letterSpacing: '-0.03em',
          color: T.fg, maxWidth: 760,
        }}>
          ¿Qué tema querés revisar?
        </h1>
        <p style={{
          margin: '14px 0 0', maxWidth: 720, fontSize: 16, lineHeight: 1.55,
          color: T.fg3, fontWeight: 400,
        }}>
          Cada tema es un experimento de UX/producto que estamos iterando. Entrá a uno
          para ver las variantes y dejar feedback al equipo.
        </p>

        {/* Themes grid */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 44 }}>
          {THEMES.map(t => <ThemeCard key={t.id} theme={t} />)}
        </section>

        {/* Footer */}
        <p style={{
          margin: '36px 0 0', fontSize: 12.5, color: T.fg3, lineHeight: 1.5, maxWidth: 640,
        }}>
          Datos mockeados. Cada tema vive en su propia ruta — podés volver a esta página
          con el botón flotante "Volver al inicio" en cualquier vista.
        </p>
      </main>
    </div>
  )
}

function ThemeCard({ theme }: { theme: Theme }) {
  const isSoon = theme.status === 'soon'
  const isNext = theme.status === 'next'
  return (
    <a
      href={isSoon ? undefined : theme.href}
      onClick={isSoon ? (e: React.MouseEvent) => e.preventDefault() : undefined}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 16,
        textDecoration: 'none', color: T.fg,
        opacity: isSoon ? 0.7 : 1,
        cursor: isSoon ? 'default' : 'pointer',
        transition: 'border-color 200ms ease-out, transform 200ms ease-out, box-shadow 200ms ease-out',
      }}
      onMouseEnter={e => {
        if (isSoon) return
        e.currentTarget.style.transform = 'translateY(-2px)'
        if (isNext) {
          e.currentTarget.style.borderColor = T.accent
          e.currentTarget.style.boxShadow = `0 18px 44px -12px rgba(48,79,254,0.32), 0 0 0 4px ${T.accentRing}`
        } else {
          e.currentTarget.style.borderColor = T.hairStrong
          e.currentTarget.style.boxShadow = '0 14px 36px -16px rgba(15,23,42,0.18)'
        }
      }}
      onMouseLeave={e => {
        if (isSoon) return
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = T.hair
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Preview area */}
      <div style={{ position: 'relative', height: 168, background: T.subtle, borderBottom: `1px solid ${T.hair}`, overflow: 'hidden' }}>
        {theme.preview}
      </div>

      {/* Body */}
      <div style={{ padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Tag row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 7,
            background: isNext ? T.accent : isSoon ? T.fg4 : T.fg,
            color: T.surface,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{theme.icon}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', borderRadius: 6,
            background: isNext ? T.accentSoft : T.subtle,
            color: isNext ? T.accent : T.fg2,
            border: `1px solid ${isNext ? 'transparent' : T.hair}`,
            fontFamily: INTER, fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
          }}>
            {isNext && <Sparkles size={10} />} {theme.eyebrow}
          </span>
        </div>

        <h3 style={{
          margin: 0, fontFamily: INTER, fontSize: 18, fontWeight: 600,
          color: T.fg, letterSpacing: '-0.015em', lineHeight: 1.25,
        }}>{theme.title}</h3>

        <p style={{ margin: 0, fontSize: 13.5, color: T.fg3, lineHeight: 1.55, fontWeight: 400 }}>
          {theme.blurb}
        </p>

        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {theme.bullets.map(b => (
            <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: T.fg2 }}>
              <span style={{
                width: 14, height: 14, marginTop: 2, borderRadius: 4,
                background: isNext ? T.accentSoft : T.subtle,
                color: isNext ? T.accent : T.fg3,
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
            background: isSoon ? T.subtle : isNext ? T.accent : T.fg,
            color: isSoon ? T.fg3 : T.surface,
            border: isSoon ? `1px solid ${T.hair}` : 'none',
            fontFamily: INTER, fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
          }}>
            {isSoon ? 'Próximamente' : <>Entrar al tema <ArrowRight size={13} /></>}
          </span>
        </div>
      </div>
    </a>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme previews — abstract SVGs (kept consistent with HomeOptions style)
// ─────────────────────────────────────────────────────────────────────────────

function HomePreview() {
  const acc = T.accent
  return (
    <svg viewBox="0 0 360 168" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="thHomeAurora" cx="20%" cy="10%" r="60%">
          <stop offset="0%" stopColor="rgba(48,79,254,0.16)" />
          <stop offset="100%" stopColor="rgba(48,79,254,0)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="360" height="168" fill="#F7F8FB" />
      <rect x="0" y="0" width="360" height="168" fill="url(#thHomeAurora)" />
      {/* Topbar */}
      <rect x="14" y="12" width="332" height="16" rx="4" fill="white" stroke={T.hair} />
      {/* Hero pill */}
      <rect x="22" y="38" width="60" height="9" rx="4.5" fill="rgba(255,255,255,0.85)" stroke={T.hair} />
      <circle cx="30" cy="42.5" r="2" fill={acc} />
      {/* Hero heading */}
      <rect x="22" y="54" width="170" height="9" rx="3" fill={T.fg} />
      <rect x="22" y="68" width="90" height="9" rx="3" fill={T.fg} />
      <rect x="118" y="68" width="50" height="9" rx="3" fill={acc} />
      <rect x="22" y="84" width="140" height="4" rx="2" fill={T.fg3} />
      <rect x="22" y="96" width="50" height="12" rx="6" fill={acc} />
      <rect x="78" y="96" width="60" height="12" rx="6" fill="white" stroke={T.hair} />
      {/* Featured 2x2 right side */}
      <rect x="208" y="38" width="130" height="74" rx="10" fill="white" stroke={acc} strokeWidth="1" />
      <rect x="216" y="46" width="16" height="16" rx="4" fill={T.accentSoft} />
      <rect x="216" y="68" width="76" height="5" rx="2" fill={T.fg} />
      <rect x="216" y="78" width="100" height="3" rx="1.5" fill={T.fg3} />
      <rect x="216" y="94" width="44" height="12" rx="6" fill={acc} />
      {/* Bottom cards row */}
      {[0, 1, 2].map(i => {
        const x = 22 + i * 78
        return (
          <g key={i}>
            <rect x={x} y="120" width="70" height="40" rx="8" fill="white" stroke={T.hair} />
            <rect x={x + 8} y="128" width="12" height="12" rx="3" fill={T.subtle} stroke={T.hair} />
            <rect x={x + 8} y="146" width="44" height="4" rx="2" fill={T.fg} />
            <rect x={x + 8} y="153" width="34" height="3" rx="1.5" fill={T.fg3} />
          </g>
        )
      })}
    </svg>
  )
}

function WorkflowsPreview() {
  const acc = T.accent
  return (
    <svg viewBox="0 0 360 168" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect x="0" y="0" width="360" height="168" fill="#F7F8FB" />
      {/* Dot grid */}
      {Array.from({ length: 14 }).map((_, r) =>
        Array.from({ length: 30 }).map((_, c) => (
          <circle key={`${r}-${c}`} cx={12 + c * 12} cy={14 + r * 12} r="0.6" fill="#CBD5E1" />
        ))
      )}
      {/* Topbar */}
      <rect x="14" y="12" width="332" height="14" rx="4" fill="white" stroke={T.hair} />
      <rect x="280" y="15" width="28" height="8" rx="2" fill={T.subtle} stroke={T.hair} />
      <rect x="312" y="15" width="28" height="8" rx="2" fill={acc} />

      {/* Inicio pill */}
      <rect x="20" y="78" width="34" height="16" rx="8" fill="white" stroke={acc} strokeWidth="1.2" />
      <circle cx="28" cy="86" r="1.6" fill={acc} />
      <rect x="32" y="84" width="18" height="4" rx="1.5" fill={acc} />

      {/* Edge 1 */}
      <line x1="54" y1="86" x2="70" y2="86" stroke="#94A3B8" strokeWidth="1" />
      {/* Edge label chip */}
      <rect x="56" y="80" width="14" height="6" rx="2" fill="white" stroke={T.hair} />

      {/* Simple state */}
      <rect x="70" y="64" width="80" height="44" rx="6" fill="white" stroke={T.hair} />
      <circle cx="80" cy="76" r="2" fill="#16A34A" />
      <rect x="86" y="74" width="50" height="4" rx="1.5" fill={T.fg} />
      <rect x="78" y="84" width="64" height="3" rx="1.5" fill={T.fg3} />
      <rect x="78" y="90" width="50" height="3" rx="1.5" fill={T.fg3} />

      {/* Edge 2 */}
      <line x1="150" y1="86" x2="166" y2="86" stroke="#94A3B8" strokeWidth="1" />

      {/* Complex state with AVZ chip + mini flow */}
      <rect x="166" y="56" width="92" height="60" rx="6" fill="white" stroke={acc} strokeWidth="1.4" />
      <circle cx="174" cy="66" r="2" fill="#3B82F6" />
      <rect x="180" y="64" width="42" height="4" rx="1.5" fill={T.fg} />
      <rect x="232" y="63" width="20" height="6" rx="2" fill={T.accentSoft} />
      {/* Mini-flow inside */}
      <rect x="172" y="76" width="80" height="22" rx="4" fill="#FAFBFD" stroke={T.hair} strokeDasharray="2 2" />
      <rect x="176" y="84" width="10" height="6" rx="1.5" fill="white" stroke="#3B82F6" />
      <line x1="186" y1="87" x2="194" y2="87" stroke="#94A3B8" strokeWidth="0.7" />
      <rect x="194" y="84" width="16" height="6" rx="1.5" fill="white" stroke={acc} />
      <line x1="210" y1="87" x2="218" y2="87" stroke="#94A3B8" strokeWidth="0.7" />
      <rect x="218" y="84" width="14" height="6" rx="1.5" fill="white" stroke="#F59E0B" />
      <line x1="232" y1="87" x2="240" y2="87" stroke="#94A3B8" strokeWidth="0.7" />
      <rect x="240" y="84" width="10" height="6" rx="1.5" fill="white" stroke="#16A34A" />
      <rect x="172" y="102" width="40" height="3" rx="1.5" fill={acc} />

      {/* Edge 3 */}
      <line x1="258" y1="86" x2="274" y2="86" stroke="#94A3B8" strokeWidth="1" />

      {/* Final pill */}
      <rect x="274" y="78" width="60" height="16" rx="8" fill="white" stroke="#16A34A" strokeWidth="1.2" />
      <circle cx="284" cy="86" r="1.6" fill="#16A34A" />
      <rect x="289" y="84" width="32" height="4" rx="1.5" fill="#15803D" />
      <rect x="324" y="83" width="10" height="6" rx="2" fill="#DCFCE7" />

      {/* AI FAB */}
      <circle cx="338" cy="148" r="10" fill={acc} />
    </svg>
  )
}

function SoonPreview() {
  return (
    <svg viewBox="0 0 360 168" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect x="0" y="0" width="360" height="168" fill="#F7F8FB" />
      {/* Empty bento placeholders */}
      {[
        { x: 22, y: 24, w: 150, h: 60 },
        { x: 178, y: 24, w: 160, h: 60 },
        { x: 22, y: 90, w: 100, h: 56 },
        { x: 128, y: 90, w: 100, h: 56 },
        { x: 234, y: 90, w: 104, h: 56 },
      ].map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="10" fill="white" stroke={T.hair} strokeDasharray="3 3" />
          <rect x={r.x + 12} y={r.y + r.h / 2 - 3} width={r.w - 24} height="2" rx="1" fill={T.hair} />
        </g>
      ))}
    </svg>
  )
}
