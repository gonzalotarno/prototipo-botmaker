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
const DATE = '1 de octubre de 2026'

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
            Si no derivás a WebChat, tus cuentas siguen respondiendo por WhatsApp y <strong>pagan por cada mensaje</strong> desde
            el <strong>{DATE}</strong>.
          </p>

          <div style={{ marginTop: 24, marginBottom: 8, fontSize: 12, fontWeight: 700, color: color.grey500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Ejemplo de factura mensual · estimado
          </div>
          <div style={{ background: color.grey50, border: `1px solid ${color.grey200}`, borderRadius: 12, padding: '4px 16px 12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th()}>Concepto</th>
                  <th style={th('right')}>Antes</th>
                  <th style={th('right')}>Ahora</th>
                </tr>
              </thead>
              <tbody>
                <BillRow concept="Mensajes de plantilla" before="US$1.200" after="US$1.200" />
                <BillRow concept="Mensajes de servicio · respuestas en 24 h" before="Gratis" after="US$560" />
                <BillRow total concept="Total estimado / mes" before="US$1.200" after="US$1.760" afterNote="+US$560 / mes" />
              </tbody>
            </table>
          </div>
          <p style={{ margin: '16px 0 0', fontSize: 12, color: color.grey500 }}>
            Cifras ilustrativas; varían según volumen y mercado.
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

function BillRow({ concept, before, after, afterNote, total }: { concept: string; before: string; after: string; afterNote?: string; total?: boolean }) {
  const base: CSSProperties = { padding: total ? '16px 8px 0' : '12px 8px', borderTop: total ? `2px solid ${color.grey300}` : `1px solid ${color.grey200}`, verticalAlign: 'top' }
  return (
    <tr>
      <td style={{ ...base, fontSize: total ? 16 : 14, fontWeight: total ? 700 : 400, color: total ? color.grey900 : color.grey700 }}>{concept}</td>
      <td style={{ ...base, textAlign: 'right', fontSize: 14, fontWeight: 400, color: color.grey400, whiteSpace: 'nowrap' }}>{before}</td>
      <td style={{ ...base, textAlign: 'right', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: total ? 20 : 14, fontWeight: total ? 800 : 600, color: color.grey900, lineHeight: 1.05, letterSpacing: total ? '-0.4px' : undefined }}>{after}</div>
        {afterNote && <div style={{ fontSize: 12, fontWeight: 600, color: color.grey500, marginTop: 4 }}>{afterNote}</div>}
      </td>
    </tr>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const overlay: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }
const card: CSSProperties = { width: '100%', maxWidth: 500, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', fontFamily: "'Roboto', sans-serif" }
const iconBtn: CSSProperties = { width: 32, height: 32, borderRadius: '50%', border: 'none', background: color.grey100, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
const secondaryBtn: CSSProperties = { padding: '12px 20px', borderRadius: 100, border: `1.5px solid ${INFO}`, background: '#fff', color: INFO, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background .15s' }
const primaryBtn: CSSProperties = { padding: '12px 20px', borderRadius: 100, border: 'none', background: INFO, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }
