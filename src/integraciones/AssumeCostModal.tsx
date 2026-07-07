import { type CSSProperties } from 'react'
import Icon from '../Icon'
import { color } from '../ds'

// ── Assume-cost confirmation modal ────────────────────────────────────────────
// Shown when the user unchecks the derivation. Warns that accounts will assume
// the new WhatsApp cost, with an illustrative before/after monthly bill.

const INFO = color.information
const INFO_BG = color.infoLight
const WARN = color.warning
const WARN_BG = color.warningLight

export default function AssumeCostModal({ onKeep, onAssume }: { onKeep: () => void; onAssume: () => void }) {
  return (
    <div onClick={onKeep} style={overlay}>
      <div onClick={e => e.stopPropagation()} style={card}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 24, borderBottom: `1px solid ${color.grey200}` }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: WARN_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="warning" size={20} color={WARN} filled />
          </div>
          <h2 style={{ flex: 1, margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px', color: color.grey900 }}>
            ¿Asumir los nuevos costos de WhatsApp?
          </h2>
          <button onClick={onKeep} aria-label="Cerrar" style={iconBtn}>
            <Icon name="close" size={20} color={color.grey600} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: color.grey700 }}>
            Sin la derivación, estas cuentas van a <strong>pagar por cada mensaje</strong> que respondan en WhatsApp. Este es el impacto estimado según tu uso:
          </p>

          <div style={{ marginTop: 20, marginBottom: 8, fontSize: 12, fontWeight: 700, color: color.grey500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Estimado mensual
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: color.grey50 }}>
                <th style={th()}>Mes</th>
                <th style={th('right')}>Cantidad de mensajes</th>
                <th style={th('right')}>Ahora</th>
                <th style={th('right')}>Después del 1 de octubre</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.month} style={{ borderTop: i === 0 ? 'none' : `1px solid ${color.grey200}` }}>
                  <td style={{ ...cell, fontWeight: 600, color: color.grey900 }}>{r.month}</td>
                  <td style={{ ...cell, textAlign: 'right', color: color.grey800 }}>{r.messages}</td>
                  <td style={{ ...cell, textAlign: 'right', color: color.grey400 }}>{r.now}</td>
                  <td style={{ ...cell, textAlign: 'right', fontWeight: 700, color: color.grey900 }}>{r.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ margin: '16px 0 0', fontSize: 12, lineHeight: 1.5, color: color.grey500 }}>
            Los valores son aproximados. Los mensajes generados por BizAI se facturan por uso de tokens, alrededor de US$0,05 por mensaje saliente según Meta.
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 24px', borderTop: `1px solid ${color.grey200}` }}>
          <button onClick={onAssume} style={secondaryBtn} onMouseEnter={e => (e.currentTarget.style.background = INFO_BG)} onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
            Asumir el costo
          </button>
          <button onClick={onKeep} style={primaryBtn}>
            <Icon name="verified_user" size={16} color="#fff" filled />
            Mantener en WebChat
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Bits ──────────────────────────────────────────────────────────────────────
function th(align: 'left' | 'right' = 'left'): CSSProperties {
  return { textAlign: align, padding: 8, fontSize: 12, fontWeight: 700, color: color.grey500, textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: `1px solid ${color.grey200}` }
}

const ROWS = [
  { month: 'Mayo de 2026', messages: '167', now: '0,00 US$', after: '6,78 US$' },
  { month: 'Junio de 2026', messages: '162', now: '0,00 US$', after: '5,32 US$' },
  { month: 'Julio de 2026', messages: '66', now: '0,00 US$', after: '1,59 US$' },
]
const cell: CSSProperties = { padding: '14px 8px', fontSize: 14, color: color.grey700, whiteSpace: 'nowrap' }

// ── Styles ────────────────────────────────────────────────────────────────────
const overlay: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }
const card: CSSProperties = { width: '100%', maxWidth: 600, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', fontFamily: "'Roboto', sans-serif" }
const iconBtn: CSSProperties = { width: 32, height: 32, borderRadius: '50%', border: 'none', background: color.grey100, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
const secondaryBtn: CSSProperties = { padding: '12px 20px', borderRadius: 100, border: `1.5px solid ${INFO}`, background: '#fff', color: INFO, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background .15s' }
const primaryBtn: CSSProperties = { padding: '12px 20px', borderRadius: 100, border: 'none', background: INFO, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }
