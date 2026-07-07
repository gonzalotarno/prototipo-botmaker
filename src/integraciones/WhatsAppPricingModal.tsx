import { type CSSProperties } from 'react'
import Icon from '../Icon'
import { color } from '../ds'

// ── "Nuevos precios de WhatsApp" — modal informativo ──────────────────────────
// Versión en español + estilo Botmaker del modal del co-founder: estima el costo
// adicional mensual según el uso reciente (con y sin BizAI).

const INFO = color.information

interface Row {
  month: string
  messages: string
  now: string
  after: string
}

const ROWS: Row[] = [
  { month: 'Mayo de 2026', messages: '167', now: '0,00 US$', after: '6,78 US$' },
  { month: 'Junio de 2026', messages: '162', now: '0,00 US$', after: '5,32 US$' },
  { month: 'Julio de 2026', messages: '66', now: '0,00 US$', after: '1,59 US$' },
]

export default function WhatsAppPricingModal({ onClose }: { onClose: () => void }) {
  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={e => e.stopPropagation()} style={card}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 24, borderBottom: `1px solid ${color.grey200}` }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: color.infoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="receipt_long" size={20} color={INFO} filled />
          </div>
          <h2 style={{ flex: 1, margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px', color: color.grey900 }}>
            Nuevos precios de WhatsApp
          </h2>
          <button onClick={onClose} aria-label="Cerrar" style={iconBtn}>
            <Icon name="close" size={20} color={color.grey600} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: color.grey700 }}>
            A partir de <strong>octubre de 2026</strong>, WhatsApp va a cobrar por cada mensaje saliente enviado a tus usuarios,
            ya sea enviado por un agente o un bot. La tabla muestra el <strong>costo adicional estimado</strong> que pagarías cada
            mes, según tu uso reciente.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
            <thead>
              <tr style={{ background: color.grey50 }}>
                <Th>Mes</Th>
                <Th right>Cantidad de mensajes</Th>
                <Th right>Ahora</Th>
                <Th right>Después del 1 de octubre</Th>
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
            Los valores son aproximados. Los mensajes generados por BizAI se facturan por uso de tokens, alrededor de
            US$0,05 por mensaje saliente según Meta.
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: `1px solid ${color.grey200}` }}>
          <button onClick={onClose} style={primaryBtn}>Entendido</button>
        </div>
      </div>
    </div>
  )
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th style={{ textAlign: right ? 'right' : 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: color.grey500, textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: `1px solid ${color.grey200}`, whiteSpace: 'nowrap' }}>
      {children}
    </th>
  )
}

const cell: CSSProperties = { padding: '14px 12px', fontSize: 14, color: color.grey700, whiteSpace: 'nowrap' }

const overlay: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }
const card: CSSProperties = { width: '100%', maxWidth: 720, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', fontFamily: "'Roboto', sans-serif" }
const iconBtn: CSSProperties = { width: 32, height: 32, borderRadius: '50%', border: 'none', background: color.grey100, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
const primaryBtn: CSSProperties = { padding: '10px 24px', borderRadius: 100, border: 'none', background: INFO, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }
