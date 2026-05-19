import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

const T = {
  surface:    '#FFFFFF',
  canvas:     '#F7F8FC',
  fg:         '#0A0A0F',
  fg2:        '#52525B',
  fg3:        '#8A8F98',
  hair:       '#E8E9ED',
  accent:     '#304FFE',
  accentSoft: '#EBEEFF',
  ok:         '#10B981',
} as const

const INTER = "'Inter', 'Roboto', system-ui, -apple-system, sans-serif"

function useInter() {
  useEffect(() => {
    const id = 'bm-estados-inter'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id; link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
  }, [])
}

// SVG preview: canvas with nodes
function CanvasPreview() {
  return (
    <svg viewBox="0 0 400 200" width="100%" style={{ display: 'block', borderRadius: 10 }}>
      <rect width="400" height="200" fill="#F8FAFC" />
      {/* Dot grid */}
      {Array.from({ length: 8 }, (_, i) => Array.from({ length: 5 }, (_, j) => (
        <circle key={`${i}-${j}`} cx={20 + i * 50} cy={20 + j * 44} r="1.2" fill="#CBD5E1" />
      )))}
      {/* Edges */}
      <path d="M 58 100 H 88" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
      <path d="M 195 100 H 215" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
      <path d="M 322 100 H 342" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
      {/* Start pill */}
      <rect x="8" y="88" width="50" height="24" rx="12" fill="#fff" stroke="#E2E8F0" strokeWidth="1.5" />
      <text x="33" y="104" textAnchor="middle" fontSize="9" fill="#475569" fontFamily="Roboto, sans-serif" fontWeight="600">Inicio</text>
      {/* State node 1 — simple */}
      <rect x="88" y="72" width="127" height="56" rx="10" fill="#fff" stroke="#E2E8F0" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="5" fill="#16A34A" />
      <rect x="110" y="93" width="80" height="7" rx="3.5" fill="#E2E8F0" />
      <rect x="110" y="105" width="55" height="5" rx="2.5" fill="#F1F5F9" />
      {/* State node 2 — complex */}
      <rect x="215" y="65" width="127" height="70" rx="10" fill="#fff" stroke="#304FFE" strokeWidth="1.5" />
      <circle cx="227" cy="93" r="5" fill="#3B82F6" />
      <rect x="237" y="86" width="70" height="7" rx="3.5" fill="#E2E8F0" />
      <rect x="237" y="99" width="90" height="22" rx="6" fill="#FAFBFD" stroke="#E2E8F0" strokeWidth="1" />
      <line x1="246" y1="114" x2="298" y2="114" stroke="#94A3B8" strokeWidth="1" />
      {/* Mini nodes inside complex */}
      <rect x="244" y="106" width="12" height="8" rx="2" fill="#fff" stroke={T.accent} strokeWidth="0.8" />
      <rect x="261" y="106" width="12" height="8" rx="2" fill="#fff" stroke="#EAB308" strokeWidth="0.8" />
      <rect x="278" y="106" width="12" height="8" rx="2" fill="#fff" stroke="#16A34A" strokeWidth="0.8" />
      <rect x="237" y="123" width="46" height="8" rx="4" fill="#EEF0FF" />
      <text x="260" y="130" textAnchor="middle" fontSize="5.5" fill={T.accent} fontFamily="Roboto, sans-serif" fontWeight="700">AVANZADO</text>
      {/* Final state */}
      <rect x="342" y="88" width="52" height="24" rx="12" fill="#fff" stroke="#16A34A" strokeWidth="1.5" />
      <circle cx="352" cy="100" r="4" fill="#16A34A" />
      <text x="367" y="104" textAnchor="middle" fontSize="8" fill="#15803D" fontFamily="Roboto, sans-serif" fontWeight="700">Final</text>
    </svg>
  )
}

// SVG preview: vertical list
function ListPreview() {
  const states = [
    { name: 'Evaluación inicial', color: '#16A34A', badge: 'Simple', badgeBg: '#F0F4FF', badgeFg: '#3B4FC8', y: 10 },
    { name: 'Atención avanzada',  color: '#3B82F6', badge: 'Avanzado', badgeBg: '#EEF0FF', badgeFg: '#304FFE', y: 78 },
    { name: 'Resuelto',           color: '#16A34A', badge: 'Final', badgeBg: '#DCFCE7', badgeFg: '#15803D', y: 150 },
  ]
  return (
    <svg viewBox="0 0 400 220" width="100%" style={{ display: 'block', borderRadius: 10 }}>
      <rect width="400" height="220" fill="#F8FAFC" />
      {/* Centered column */}
      {/* Start pill */}
      <rect x="140" y="0" width="120" height="22" rx="11" fill="#fff" stroke="#E2E8F0" strokeWidth="1.5" />
      <circle cx="153" cy="11" r="3.5" fill="#64748B" />
      <text x="200" y="15" textAnchor="middle" fontSize="9" fill="#475569" fontFamily="Roboto, sans-serif" fontWeight="600">Inicio</text>
      {/* Connectors + state rows */}
      {states.map((s, i) => (
        <g key={i}>
          {/* Connector above */}
          <line x1="200" y1={i === 0 ? 22 : s.y - 4} x2="200" y2={s.y} stroke="#CBD5E1" strokeWidth="1.5" />
          {i < states.length - 1 && <polygon points={`198,${s.y + 56},202,${s.y + 56},200,${s.y + 60}`} fill="#CBD5E1" />}
          {/* State card */}
          <rect x="60" y={s.y} width="280" height="54" rx="9" fill="#fff" stroke={s.badge === 'Avanzado' ? '#304FFE' : '#E2E8F0'} strokeWidth={s.badge === 'Avanzado' ? 1.5 : 1.2} />
          {/* Step number */}
          <circle cx="76" cy={s.y + 27} r="9" fill={s.badge === 'Final' ? '#DCFCE7' : '#F1F5F9'} />
          <text x="76" y={s.y + 31} textAnchor="middle" fontSize="7.5" fill={s.badge === 'Final' ? '#15803D' : '#64748B'} fontFamily="Roboto, sans-serif" fontWeight="700">{i + 1}</text>
          {/* Color dot */}
          <circle cx="92" cy={s.y + 27} r="4.5" fill={s.color} />
          {/* Name */}
          <text x="103" y={s.y + 31} fontSize="9.5" fill="#0F172A" fontFamily="Roboto, sans-serif" fontWeight="600">{s.name}</text>
          {/* Badge */}
          <rect x="270" y={s.y + 20} width="52" height="14" rx="3" fill={s.badgeBg} />
          <text x="296" y={s.y + 30} textAnchor="middle" fontSize="6.5" fill={s.badgeFg} fontFamily="Roboto, sans-serif" fontWeight="700">{s.badge.toUpperCase()}</text>
          {/* Chevron */}
          <text x="325" y={s.y + 31} fontSize="10" fill="#94A3B8">›</text>
        </g>
      ))}
    </svg>
  )
}

interface Proposal {
  id: string
  href: string
  label: string
  title: string
  blurb: string
  bullets: string[]
  preview: React.ReactNode
  tag: string
}

const PROPOSALS: Proposal[] = [
  {
    id: 'a', href: '/estados-a', label: 'A',
    tag: 'Canvas visual',
    title: 'Editor de flujo con nodos',
    blurb: 'Los estados son nodos arrastrables en un canvas. Se conectan con edges, soportan ramas y flujos paralelos. Los estados avanzados tienen su propio sub-flow embebido.',
    bullets: ['Nodos arrastrables y conectables', 'Estados simples + avanzados con sub-flow', 'Ramas y flujos no lineales', 'Templates predefinidos'],
    preview: <CanvasPreview />,
  },
  {
    id: 'b', href: '/estados-b', label: 'B',
    tag: 'Lista de pasos',
    title: 'Editor secuencial en lista',
    blurb: 'Los estados son filas en una lista vertical ordenada. Hacés click para expandir y configurar inline. Sin canvas, sin zoom. Ideal para flujos lineales.',
    bullets: ['Lista ordenada, edición inline', 'Configuración sin drawer ni modal', 'Sin canvas ni conceptos de nodos', 'Más simple para equipos no técnicos'],
    preview: <ListPreview />,
  },
]

function ProposalCard({ p }: { p: Proposal }) {
  return (
    <a
      href={p.href}
      style={{
        display: 'flex', flexDirection: 'column',
        background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 20,
        textDecoration: 'none', color: T.fg,
        overflow: 'hidden',
        transition: 'box-shadow 180ms, border-color 180ms',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.boxShadow = '0 12px 40px -12px rgba(48,79,254,0.18)'
        el.style.borderColor = T.accent
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.boxShadow = 'none'
        el.style.borderColor = T.hair
      }}
    >
      {/* Preview area */}
      <div style={{ padding: 20, background: T.canvas, borderBottom: `1px solid ${T.hair}` }}>
        {p.preview}
      </div>

      {/* Content */}
      <div style={{ padding: '24px 24px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8, background: T.accent, color: '#fff',
            fontFamily: INTER, fontSize: 12, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>{p.label}</span>
          <span style={{ fontFamily: INTER, fontSize: 12.5, fontWeight: 600, color: T.fg2, background: T.canvas, padding: '3px 10px', borderRadius: 100, border: `1px solid ${T.hair}` }}>{p.tag}</span>
        </div>
        <h3 style={{ margin: '0 0 8px', fontFamily: INTER, fontSize: 18, fontWeight: 600, color: T.fg, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{p.title}</h3>
        <p style={{ margin: '0 0 16px', fontFamily: INTER, fontSize: 13.5, color: T.fg3, lineHeight: 1.55 }}>{p.blurb}</p>
        <ul style={{ margin: '0 0 20px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {p.bullets.map(b => (
            <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: INTER, fontSize: 12.5, color: T.fg2 }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: T.accentSoft, color: T.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9 }}>✓</span>
              {b}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontFamily: INTER, fontSize: 13, fontWeight: 600, color: T.accent }}>
          Abrir propuesta {p.label} <ArrowRight size={14} />
        </div>
      </div>
    </a>
  )
}

export default function EstadosOptions() {
  useInter()
  return (
    <div style={{
      minHeight: '100vh', background: T.canvas, color: T.fg,
      fontFamily: INTER, WebkitFontSmoothing: 'antialiased',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      {/* Atmosphere */}
      <div aria-hidden style={{ position: 'absolute', top: -260, right: -200, width: 880, height: 880, background: 'radial-gradient(circle at center, rgba(48,79,254,0.10) 0%, rgba(48,79,254,0.05) 35%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <main style={{ flex: 1, width: '100%', maxWidth: 1000, margin: '0 auto', padding: '88px 28px 80px', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 100, border: `1px solid ${T.hair}`, background: T.surface, fontSize: 11.5, color: T.fg2, fontWeight: 500, marginBottom: 22 }}>
          <span style={{ width: 6, height: 6, borderRadius: 100, background: T.accent }} />
          Workflows / Estados · 2 propuestas para evaluar
        </div>

        <h1 style={{ margin: 0, fontFamily: INTER, fontWeight: 600, fontSize: 'clamp(30px, 4vw, 42px)', lineHeight: 1.05, letterSpacing: '-0.03em', color: T.fg, maxWidth: 720 }}>
          ¿Cómo querés editar los workflows?
        </h1>
        <p style={{ margin: '14px 0 0', maxWidth: 640, fontSize: 15, lineHeight: 1.55, color: T.fg3, fontWeight: 400 }}>
          Dos enfoques distintos para crear y configurar los estados del agente. Entrá a cada uno e interactuá para evaluar cuál se adapta mejor.
        </p>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 44 }}>
          {PROPOSALS.map(p => <ProposalCard key={p.id} p={p} />)}
        </div>

        <p style={{ margin: '32px 0 0', fontSize: 12.5, color: T.fg3, lineHeight: 1.5 }}>
          Datos mockeados · podés interactuar con ambas propuestas · usá el botón flotante para volver al inicio
        </p>
      </main>
    </div>
  )
}
