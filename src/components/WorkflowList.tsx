import { useState } from 'react'
import { Plus, AlertCircle, Sparkles, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react'

const PRIMARY = '#304FFE'
const COLORS = ['#16A34A', '#3B82F6', '#EAB308', '#9333EA', '#0F766E', '#EC4899', '#F59E0B', '#475569', '#DC2626']

interface WFState {
  id: string
  name: string
  description: string
  color: string
  requiresHuman: boolean
  kind: 'simple' | 'complex' | 'final'
}

const INITIAL: WFState[] = [
  { id: 's1', name: 'Evaluación inicial', description: 'Recopila los datos básicos del cliente antes de avanzar al triage.', color: '#16A34A', requiresHuman: false, kind: 'simple' },
  { id: 's2', name: 'Atención avanzada', description: '', color: '#3B82F6', requiresHuman: true, kind: 'complex' },
  { id: 's3', name: 'Resuelto', description: '', color: '#16A34A', requiresHuman: false, kind: 'final' },
]

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 38, height: 22, borderRadius: 100, flexShrink: 0,
      background: on ? PRIMARY : '#CBD5E1', border: 'none', cursor: 'pointer', padding: 0, position: 'relative',
      transition: 'background 160ms',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.18)', transition: 'left 160ms',
      }} />
    </button>
  )
}

function KindBadge({ kind }: { kind: WFState['kind'] }) {
  const map = {
    simple:  { label: 'Simple',   bg: '#F0F4FF', fg: '#3B4FC8' },
    complex: { label: 'Avanzado', bg: '#EEF0FF', fg: PRIMARY },
    final:   { label: 'Final',    bg: '#DCFCE7', fg: '#15803D' },
  }
  const s = map[kind]
  return (
    <span style={{ padding: '2px 8px', borderRadius: 5, background: s.bg, color: s.fg, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, flexShrink: 0 }}>
      {kind === 'final' ? '🏁 ' : ''}{s.label}
    </span>
  )
}

function Connector({ dashed }: { dashed?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0', gap: 0 }}>
      <div style={{ width: 2, height: 18, background: dashed ? 'transparent' : '#CBD5E1', borderRadius: 1, backgroundImage: dashed ? 'repeating-linear-gradient(to bottom, #CBD5E1 0 4px, transparent 4px 8px)' : 'none' }} />
      {!dashed && <span style={{ fontSize: 9, color: '#94A3B8', lineHeight: 1, marginTop: -1 }}>▼</span>}
    </div>
  )
}

function StateRow({
  state, index, isExpanded, isLast,
  onToggle, onUpdate, onDelete,
}: {
  state: WFState; index: number; isExpanded: boolean; isLast: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<WFState>) => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)

  return (
    <div>
      {/* Row card */}
      <div style={{
        border: `1.5px solid ${isExpanded ? PRIMARY : '#E2E8F0'}`,
        borderRadius: 12, background: '#fff',
        transition: 'border-color 150ms, box-shadow 150ms',
        boxShadow: isExpanded ? '0 0 0 3px rgba(48,79,254,0.08)' : 'none',
      }}>
        {/* Header row */}
        <div
          onClick={() => state.kind !== 'complex' && onToggle()}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px',
            cursor: state.kind !== 'complex' ? 'pointer' : 'default',
          }}
        >
          {/* Step number */}
          <span style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: state.kind === 'final' ? '#DCFCE7' : isExpanded ? '#EEF0FF' : '#F1F5F9',
            color: state.kind === 'final' ? '#15803D' : isExpanded ? PRIMARY : '#64748B',
            fontSize: 10.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{index + 1}</span>

          {/* Color dot */}
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: state.color, flexShrink: 0 }} />

          {/* Name */}
          <span style={{ flex: 1, fontFamily: "'Roboto', sans-serif", fontSize: 14, fontWeight: 600, color: '#0F172A', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{state.name || 'Sin nombre'}</span>

          {/* Badges */}
          <KindBadge kind={state.kind} />
          {state.requiresHuman && (
            <span title="Requiere humano" style={{ width: 18, height: 18, borderRadius: '50%', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={11} />
            </span>
          )}

          {/* Complex: open flow CTA */}
          {state.kind === 'complex' && (
            <button
              onClick={e => { e.stopPropagation(); onToggle() }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
                padding: '4px 10px', borderRadius: 6,
                background: isExpanded ? '#EEF0FF' : 'transparent', border: `1px solid ${isExpanded ? PRIMARY : '#E2E8F0'}`,
                color: PRIMARY, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
              }}
            >{isExpanded ? '← Cerrar' : 'Ver flujo →'}</button>
          )}

          {/* Expand chevron (simple/final) */}
          {state.kind !== 'complex' && (
            <button onClick={e => { e.stopPropagation(); onToggle() }} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94A3B8', flexShrink: 0 }}>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          {/* More menu */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94A3B8' }}>
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 5 }} />
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 10, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: 4, minWidth: 180, boxShadow: '0 8px 24px -6px rgba(0,0,0,0.12)' }}>
                  {state.kind !== 'final' && <button onClick={() => { onUpdate({ kind: 'final' }); setMenuOpen(false) }} style={mItem}>🏁 Marcar como final</button>}
                  {state.kind === 'simple' && <button onClick={() => { onUpdate({ kind: 'complex' }); setMenuOpen(false) }} style={mItem}>⚡ Convertir a avanzado</button>}
                  {state.kind === 'complex' && <button onClick={() => { onUpdate({ kind: 'simple' }); setMenuOpen(false) }} style={mItem}>↩ Convertir a simple</button>}
                  <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />
                  <button onClick={() => { onDelete(); setMenuOpen(false) }} style={{ ...mItem, color: '#DC2626' }}>Eliminar estado</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expanded: config panel */}
        {isExpanded && state.kind !== 'complex' && (
          <div style={{ borderTop: '1px solid #F1F5F9', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Name + color */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748B', marginBottom: 5 }}>Nombre del estado</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button onClick={() => setColorOpen(o => !o)} style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: state.color }} />
                  </button>
                  {colorOpen && (
                    <>
                      <div onClick={() => setColorOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 5 }} />
                      <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 10, padding: 8, background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, minWidth: 160, boxShadow: '0 8px 24px -6px rgba(0,0,0,0.12)' }}>
                        {COLORS.map(c => (
                          <button key={c} onClick={() => { onUpdate({ color: c }); setColorOpen(false) }} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', padding: 0, outline: state.color === c ? `2.5px solid ${PRIMARY}` : 'none', outlineOffset: 2 }} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <input
                  value={state.name}
                  onChange={e => onUpdate({ name: e.target.value })}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontFamily: "'Roboto', sans-serif", fontSize: 14, color: '#0F172A', outline: 'none' }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748B', marginBottom: 5 }}>Descripción</div>
              <textarea
                value={state.description}
                onChange={e => onUpdate({ description: e.target.value })}
                rows={2} placeholder="Describí este estado..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontFamily: "'Roboto', sans-serif", fontSize: 13, color: '#0F172A', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            {/* Requires human */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Requiere confirmación humana</div>
                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>Un agente humano debe confirmar el avance</div>
              </div>
              <Toggle on={state.requiresHuman} onChange={v => onUpdate({ requiresHuman: v })} />
            </div>

            {/* Convert to advanced CTA */}
            {state.kind !== 'final' && (
              <button
                onClick={() => onUpdate({ kind: 'complex' })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: '#EFF0FF', border: '1px solid #C7D2FE', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, background: PRIMARY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={13} />
                  </span>
                  <div>
                    <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, fontWeight: 700, color: '#1E1B4B' }}>Convertir a estado avanzado</div>
                    <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11, color: '#4338CA', marginTop: 1 }}>Agrega condicionales, MCPs y flujos propios</div>
                  </div>
                </div>
                <span style={{ color: PRIMARY, fontWeight: 700, fontFamily: "'Roboto', sans-serif" }}>→</span>
              </button>
            )}
          </div>
        )}

        {/* Expanded: complex state placeholder */}
        {isExpanded && state.kind === 'complex' && (
          <div style={{ borderTop: '1px solid #F1F5F9', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <svg viewBox="0 0 280 56" width="100%" height="44" aria-hidden style={{ display: 'block', opacity: 0.6 }}>
              <path d="M 24 28 H 70" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
              <path d="M 110 28 H 156" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
              <path d="M 196 28 H 232" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
              <path d="M 175 28 V 12 H 232" stroke="#94A3B8" strokeWidth="1.2" fill="none" strokeDasharray="2 3" />
              <rect x="4" y="20" width="20" height="16" rx="4" fill="#FFFFFF" stroke={PRIMARY} strokeWidth="1.2" />
              <rect x="70" y="20" width="40" height="16" rx="4" fill="#FFFFFF" stroke={PRIMARY} strokeWidth="1.2" />
              <rect x="156" y="20" width="40" height="16" rx="4" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" />
              <rect x="232" y="4" width="44" height="16" rx="4" fill="#FFFFFF" stroke="#16A34A" strokeWidth="1.2" />
              <rect x="232" y="36" width="44" height="16" rx="4" fill="#FFFFFF" stroke="#16A34A" strokeWidth="1.2" />
              <circle cx="14" cy="28" r="1.8" fill={PRIMARY} />
              <circle cx="90" cy="28" r="1.8" fill={PRIMARY} />
              <circle cx="176" cy="28" r="1.8" fill="#F59E0B" />
              <circle cx="254" cy="12" r="1.8" fill="#16A34A" />
              <circle cx="254" cy="44" r="1.8" fill="#16A34A" />
            </svg>
            <div style={{ fontSize: 12.5, color: '#64748B', fontFamily: "'Roboto', sans-serif", textAlign: 'center' }}>
              Este estado tiene un flujo avanzado con condicionales y MCPs.
            </div>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: PRIMARY, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Roboto', sans-serif" }}>
              <Sparkles size={13} /> Abrir editor de flujo
            </button>
          </div>
        )}
      </div>

      {/* Connector to next */}
      {!isLast && <Connector />}
    </div>
  )
}

const mItem: React.CSSProperties = {
  display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', borderRadius: 6,
  border: 'none', background: 'transparent', cursor: 'pointer',
  fontFamily: "'Roboto', sans-serif", fontSize: 13, color: '#0F172A',
}

export default function WorkflowList({ onOpenKanban }: { onOpenKanban?: () => void }) {
  const [states, setStates] = useState<WFState[]>(INITIAL)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const update = (id: string, patch: Partial<WFState>) =>
    setStates(ss => ss.map(s => s.id === id ? { ...s, ...patch } : s))
  const remove = (id: string) => { setStates(ss => ss.filter(s => s.id !== id)); if (expandedId === id) setExpandedId(null) }
  const toggle = (id: string) => setExpandedId(p => p === id ? null : id)
  const addState = () => {
    const id = `s_${Date.now()}`
    const palette = ['#3B82F6', '#9333EA', '#EAB308', '#EC4899', '#0F766E']
    setStates(ss => [...ss, { id, name: 'Nuevo estado', description: '', color: palette[ss.length % palette.length], requiresHuman: false, kind: 'simple' }])
    setExpandedId(id)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Roboto', sans-serif", background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: '#fff', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Agente de delivery 🍕</span>
          <span style={{ fontSize: 11.5, color: '#64748B', padding: '3px 9px', borderRadius: 100, background: '#F1F5F9', fontWeight: 500 }}>
            {states.length} estados
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, background: '#fff', border: '1px solid #E2E8F0', fontSize: 12.5, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            <Sparkles size={13} color={PRIMARY} /> Plantillas
          </button>
          <button onClick={onOpenKanban} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, background: PRIMARY, border: 'none', fontSize: 12.5, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
            Ver tablero
          </button>
        </div>
      </div>

      {/* List body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
          {/* Start pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100, background: '#fff', border: '1px solid #E2E8F0', fontSize: 13, color: '#475569', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748B' }} />Inicio
          </div>

          {/* Connector to first state */}
          {states.length > 0 && <Connector />}

          {/* States */}
          {states.map((s, i) => (
            <StateRow
              key={s.id}
              state={s}
              index={i}
              isExpanded={expandedId === s.id}
              isLast={i === states.length - 1}
              onToggle={() => toggle(s.id)}
              onUpdate={patch => update(s.id, patch)}
              onDelete={() => remove(s.id)}
            />
          ))}

          {/* Add state */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: states.length > 0 ? 0 : 8 }}>
            {states.length > 0 && <Connector dashed />}
            <button onClick={addState} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: '#fff', border: '1.5px dashed #CBD5E1', fontSize: 13, fontWeight: 600, color: PRIMARY, cursor: 'pointer' }}>
              <Plus size={14} /> Agregar estado
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
