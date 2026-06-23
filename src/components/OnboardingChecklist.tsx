import { useState, useEffect } from 'react'
import { STEPS, type StepId, loadDone, saveDone, setOnboardingActive, isChecklistHidden, hideChecklist } from '../onboardingData'

// ─────────────────────────────────────────────────────────────────────────────
// OnboardingChecklist — checklist minimalista flotante (ref: UNUM / Respond).
// Simple, se va marcando, y DESAPARECE cuando lo terminás (o lo descartás).
// Vive en todas las superficies; refleja el progreso guardado en sessionStorage.
// Bottom-left para no chocar con el orb del asistente (bottom-right).
// ─────────────────────────────────────────────────────────────────────────────

const BRAND = '#304FFE', BRAND400 = '#6272FF', BRAND600 = '#2A46E8', BRANDL = '#EEF1FF', BRANDL2 = '#E4E9FF'
const INK = '#0A0F1F', INK500 = '#5B6172', INK400 = '#8990A0', INK200 = '#E4E6EC', INK100 = '#EEF0F4', INK50 = '#F7F8FB'
const OK = '#16A34A'
const INTER_TIGHT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const FONT = "'Roboto', system-ui, sans-serif"
const EASE = 'cubic-bezier(0.16,1,0.3,1)'

function MS({ name, size = 20, color = 'currentColor', fill = 0, weight = 500 }: { name: string; size?: number; color?: string; fill?: 0 | 1; weight?: number }) {
  return <span className="material-symbols-rounded" style={{ fontSize: size, color, lineHeight: 1, flexShrink: 0, fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}` }}>{name}</span>
}

export default function OnboardingChecklist() {
  const [done, setDone] = useState<StepId[]>(() => loadDone())
  const [collapsed, setCollapsed] = useState(false)
  const [hidden, setHidden] = useState(() => isChecklistHidden())

  const total = STEPS.length
  const completed = done.length
  const pct = Math.round((completed / total) * 100)
  const allDone = completed === total
  const activeIdx = STEPS.findIndex(s => !done.includes(s.id))

  // Al completar todo: pequeña celebración y luego se va para siempre
  useEffect(() => {
    if (allDone && !hidden) {
      const t = setTimeout(() => { hideChecklist(); setHidden(true) }, 2600)
      return () => clearTimeout(t)
    }
  }, [allDone, hidden])

  if (hidden) return null

  const go = (id: StepId) => {
    const step = STEPS.find(s => s.id === id)!
    setOnboardingActive(true)
    if (step.href) {
      const next = done.includes(id) ? done : [...done, id]
      saveDone(next); setDone(next)
      window.location.href = step.href
    } else {
      window.location.href = '/onboarding'
    }
  }

  const dismiss = () => { hideChecklist(); setHidden(true) }

  return (
    <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 99998, fontFamily: FONT }}>
      {collapsed ? (
        // ── Pill minimizado ──
        <button onClick={() => setCollapsed(false)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 14px 9px 10px', borderRadius: 999,
          background: '#fff', border: `1px solid ${INK200}`, boxShadow: '0 8px 24px -8px rgba(10,15,31,0.22)',
          cursor: 'pointer', fontFamily: FONT, animation: `bmClIn 280ms ${EASE} both`,
        }}>
          <ProgressRing pct={pct} />
          <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>Primeros pasos</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: INK400 }}>{completed}/{total}</span>
          <MS name="expand_less" size={18} color={INK400} />
        </button>
      ) : (
        // ── Tarjeta expandida ──
        <div style={{
          width: 320, maxWidth: 'calc(100vw - 48px)', background: '#fff', borderRadius: 16,
          border: `1px solid ${INK200}`, boxShadow: '0 24px 60px -16px rgba(10,15,31,0.28)', overflow: 'hidden',
          animation: `bmClIn 320ms ${EASE} both`,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px 12px' }}>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: INK, fontFamily: INTER_TIGHT, letterSpacing: '-0.01em' }}>
              {allDone ? '¡Todo listo! 🎉' : 'Primeros pasos'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button onClick={() => setCollapsed(true)} title="Minimizar" style={iconBtn()}><MS name="remove" size={18} color={INK400} /></button>
              <button onClick={dismiss} title="No mostrar más" style={iconBtn()}><MS name="close" size={18} color={INK400} /></button>
            </div>
          </div>

          {/* Progreso */}
          <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 15 }}>{allDone ? '🎉' : '👏'}</span>
            <div style={{ flex: 1, height: 7, borderRadius: 999, background: INK100, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${BRAND}, ${BRAND400})`, transition: `width 500ms ${EASE}` }} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: INK500, minWidth: 32, textAlign: 'right' }}>{pct}%</span>
          </div>

          {/* Lista */}
          <div style={{ padding: '0 8px 10px' }}>
            {STEPS.map((step, i) => {
              const isDone = done.includes(step.id)
              const isActive = !allDone && i === activeIdx
              const clickable = isDone || isActive
              return (
                <button key={step.id} onClick={() => clickable && go(step.id)} disabled={!clickable} style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                  padding: '10px 10px', borderRadius: 11, border: 'none',
                  background: isActive ? BRANDL : 'transparent',
                  cursor: clickable ? 'pointer' : 'default', fontFamily: FONT,
                  transition: `background 150ms ${EASE}`,
                }}
                  onMouseEnter={e => { if (clickable && !isActive) e.currentTarget.style.background = INK50 }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                  {/* Check / icono */}
                  <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? '#fff' : isActive ? BRAND : INK100, border: isDone ? `1.5px solid ${OK}` : 'none' }}>
                    {isDone ? <MS name="check" size={17} color={OK} weight={700} /> : <MS name={step.icon} size={16} color={isActive ? '#fff' : INK400} fill={isActive ? 1 : 0} />}
                  </div>
                  {/* Texto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isDone ? INK400 : INK, textDecoration: isDone ? 'line-through' : 'none', textDecorationColor: INK200 }}>{step.title}</div>
                    <div style={{ fontSize: 11.5, color: INK400, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.short}</div>
                  </div>
                  {/* Affordance derecha */}
                  {isActive && <MS name="chevron_right" size={20} color={BRAND600} />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bmClIn { from { opacity: 0; transform: translateY(12px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  )
}

// Anillo de progreso para el estado minimizado
function ProgressRing({ pct }: { pct: number }) {
  const r = 9, c = 2 * Math.PI * r, off = c - (pct / 100) * c
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <circle cx={12} cy={12} r={r} fill="none" stroke={INK100} strokeWidth={3} />
      <circle cx={12} cy={12} r={r} fill="none" stroke={BRAND} strokeWidth={3} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 12 12)" style={{ transition: `stroke-dashoffset 500ms ${EASE}` }} />
    </svg>
  )
}

function iconBtn(): React.CSSProperties {
  return { width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
}
