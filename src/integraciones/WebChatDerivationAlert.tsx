import { useState, type CSSProperties } from 'react'
import Icon from '../Icon'
import { color } from '../ds'
import AssumeCostModal from './AssumeCostModal'
import WhatsAppPricingModal from './WhatsAppPricingModal'

// ── WebChat derivation alert — V1 y V2 ────────────────────────────────────────
// V1: alert amarillo (con borde) + card de derivación (título 16, copy 12).
// V2: franja amarilla fina + derivación protagonista (más padding, copy 14),
//     y en la tabla la columna "Derivar" va sin caja (ver WhatsAppOptionScreen).

const INFO = color.information       // #304FFE
const WARN = color.warning           // #F5A623
const WARN_BG = color.warningLight   // #FFF6D6
const WARN_DARK = color.warningDark  // #9C6511

const DATE = '1 de octubre de 2026'
const HELP_URL = 'https://help.botmaker.com'
const PRICES_URL = 'https://business.whatsapp.com/products/platform-pricing'

interface Props {
  variant: number
  total: number
  migratingCount: number
  onSetAll: (all: boolean) => void
}

export default function WebChatDerivationAlert({ variant, total, migratingCount, onSetAll }: Props) {
  const on = migratingCount === total
  return (
    <div style={{ marginBottom: 12 }}>
      {variant === 1 ? <V1 on={on} onSetAll={onSetAll} /> : <V2 on={on} onSetAll={onSetAll} />}
    </div>
  )
}

type VP = { on: boolean; onSetAll: (all: boolean) => void }

function useModals(on: boolean, onSetAll: (all: boolean) => void) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)
  const handleCheck = () => (on ? setConfirmOpen(true) : onSetAll(true))
  const modals = (
    <>
      {confirmOpen && <AssumeCostModal onKeep={() => setConfirmOpen(false)} onAssume={() => { onSetAll(false); setConfirmOpen(false) }} />}
      {pricingOpen && <WhatsAppPricingModal onClose={() => setPricingOpen(false)} />}
    </>
  )
  return { modals, handleCheck, openPricing: () => setPricingOpen(true) }
}

// ── V1 — alert amarillo + card de derivación ──────────────────────────────────
function V1({ on, onSetAll }: VP) {
  const { modals, handleCheck } = useModals(on, onSetAll)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {modals}

      {/* Nuevos precios de Meta — alert amarillo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: WARN_BG, border: `1px solid #F2E2B8`, borderRadius: 12, padding: '12px 16px' }}>
        <Icon name="sell" size={18} color={WARN_DARK} filled style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: 1.5, color: color.grey800 }}>
          <strong style={{ color: WARN_DARK }}>Nuevos precios de Meta.</strong>{' '}
          A partir del <strong>{DATE}</strong>, van a empezar a cobrar todos los mensajes enviados a los usuarios, incluyendo los que no son templates.
        </span>
        <a href={PRICES_URL} target="_blank" rel="noreferrer" style={{ ...link(WARN_DARK), flexShrink: 0 }}>
          Ver nuevos precios<Icon name="open_in_new" size={14} color={WARN_DARK} />
        </a>
      </div>

      {/* Derivación a WebChat — blanco */}
      <div style={{ ...whiteCard, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="forum" size={18} color={color.grey700} filled style={{ flexShrink: 0 }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: color.grey900, letterSpacing: '-0.2px' }}>Derivación a WebChat</h3>
        </div>
        <div style={{ ...colStack, marginTop: 12 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: color.grey700 }}>
            La primera respuesta en WhatsApp invita a continuar con un link en un WebChat, con esto minimizas los costos de WhatsApp.{' '}
            <a href={HELP_URL} target="_blank" rel="noreferrer" style={{ color: INFO, fontWeight: 700, textDecoration: 'none' }}>Probar la experiencia de Webchat ↗</a>
          </p>
          <CheckboxRow on={on} toggle={handleCheck} label="Derivar todas mis conversaciones de WhatsApp a Webchat" />
        </div>
      </div>
    </div>
  )
}

// ── V2 — franja amarilla fina + derivación protagonista ───────────────────────
function V2({ on, onSetAll }: VP) {
  const { modals, handleCheck, openPricing } = useModals(on, onSetAll)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {modals}

      {/* Nuevos precios de Meta — franja fina */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: WARN_BG, border: `1px solid #E6C36B`, borderRadius: 12, padding: '8px 14px' }}>
        <Icon name="sell" size={16} color={WARN_DARK} filled style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.45, color: color.grey800 }}>
          <strong style={{ color: WARN_DARK }}>Nuevos precios de Meta.</strong>{' '}
          A partir del <strong>{DATE}</strong>, van a empezar a cobrar los mensajes de utilidad y servicio.
        </span>
        <button onClick={openPricing} style={{ ...link(WARN_DARK), flexShrink: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
          Ver precios<Icon name="chevron_right" size={15} color={WARN_DARK} />
        </button>
      </div>

      {/* Derivación a WebChat — protagonista */}
      <div style={{ ...whiteCard, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="forum" size={20} color={INFO} filled style={{ flexShrink: 0 }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: color.grey900, letterSpacing: '-0.2px' }}>Derivación a WebChat</h3>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.55, color: color.grey700 }}>
          La primera respuesta en WhatsApp invita a continuar en un WebChat: minimizás los costos y le das al cliente un canal propio de la marca.{' '}
          <a href={HELP_URL} target="_blank" rel="noreferrer" style={{ color: INFO, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>Conocer más ↗</a>
        </p>
        <div style={{ marginTop: 14 }}>
          <CheckboxRow on={on} toggle={handleCheck} label="Derivar todas mis conversaciones de WhatsApp a partir del 1º de octubre" />
        </div>
      </div>
    </div>
  )
}

// ── Shared bits ───────────────────────────────────────────────────────────────
function CheckboxRow({ on, toggle, label }: { on: boolean; toggle: () => void; label: string }) {
  return (
    <button onClick={toggle} style={rowBtn}>
      <Checkbox checked={on} />
      <span style={{ fontSize: 14, fontWeight: 600, color: color.grey900 }}>{label}</span>
    </button>
  )
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1, border: `2px solid ${checked ? INFO : color.grey400}`, background: checked ? INFO : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .12s, border-color .12s' }}>
      {checked && <Icon name="check" size={12} color="#fff" />}
    </span>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const whiteCard: CSSProperties = { background: '#fff', border: `1px solid ${color.grey200}`, borderRadius: 12 }
const colStack: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 }
const rowBtn: CSSProperties = { display: 'inline-flex', alignItems: 'flex-start', gap: 8, textAlign: 'left', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }
function link(c: string): CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: c, textDecoration: 'none' }
}
