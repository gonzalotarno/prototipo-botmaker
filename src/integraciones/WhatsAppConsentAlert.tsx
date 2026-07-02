import { useState, type CSSProperties } from 'react'
import Icon from '../Icon'
import { color } from '../ds'

// ── Option 2 — inverted consent banner ────────────────────────────────────────
// The change is opted-IN by default: by default ALL accounts move to WebChat so
// there are no big WhatsApp charges. The checkbox is the consent. UNchecking it
// opens a confirmation MODAL (the banner never grows) warning that those accounts
// will ASSUME the new WhatsApp cost, with the price table.

const INFO = color.information       // #304FFE
const INFO_BG = color.infoLight      // #E6EAFF
const INFO_DARK = color.infoDark     // #0026CA
const WARN = color.warning           // #F5A623
const WARN_BG = color.warningLight   // #FFF6D6
const WARN_DARK = color.warningDark  // #9C6511

const DATE_SERVICE = '1 de octubre de 2026'

interface Props {
  total: number
  migratingCount: number
  onSetAll: (all: boolean) => void
}

export default function WhatsAppConsentAlert({ total, migratingCount, onSetAll }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const allAgree = migratingCount === total
  const noneAgree = migratingCount === 0
  const assuming = total - migratingCount
  const toneBg = allAgree ? INFO_BG : WARN_BG
  const toneAccent = allAgree ? INFO : WARN
  const toneDark = allAgree ? INFO_DARK : WARN_DARK

  // Clicking the consent: unchecking (from full agreement) asks for confirmation
  // in a modal; re-checking re-applies to all immediately.
  const handleConsentClick = () => {
    if (allAgree) setConfirmOpen(true)
    else onSetAll(true)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '8px 12px', borderRadius: 12, marginBottom: 16, background: toneBg, border: `1px solid ${allAgree ? '#D6DEFF' : '#F2E2B8'}` }}>

      {/* ── Left: icon + text + link ──────────────────────────────── */}
      <span style={{ width: 4, alignSelf: 'stretch', borderRadius: 100, background: toneAccent, flexShrink: 0 }} />
      <Icon name={allAgree ? 'verified_user' : 'warning'} size={22} color={toneDark} filled style={{ flexShrink: 0, marginTop: 2, alignSelf: 'flex-start' }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: toneDark }}>Nueva política de precios de Meta</div>
        <p style={{ margin: '4px 0 0', fontSize: 14, lineHeight: 1.55, color: color.grey800 }}>
          {allAgree ? (
            <>Desde el <strong>{DATE_SERVICE}</strong> responder en WhatsApp tiene costo por mensaje. Para evitar montos
            elevados, vamos a <strong>derivar tus cuentas a WebChat de Botmaker</strong> —un canal sin costo por mensaje.</>
          ) : (
            <><strong>{assuming} {assuming === 1 ? 'cuenta' : 'cuentas'}</strong> {assuming === 1 ? 'va' : 'van'} a
            asumir los nuevos costos de WhatsApp. Volvé a tildar para derivarlas a WebChat y evitar esos montos.</>
          )}
        </p>
        <a href="https://business.whatsapp.com/products/platform-pricing" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 14, fontWeight: 700, color: toneDark, textDecoration: 'none' }}>
          Ver nuevos precios
          <Icon name="open_in_new" size={14} color={toneDark} />
        </a>
      </div>

      {/* ── Right: consent checkbox ───────────────────────────────── */}
      <button
        onClick={handleConsentClick}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${allAgree ? INFO : '#E6C36B'}`, background: allAgree ? '#D6DCFF' : '#FBEAB0', cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 3px rgba(40,30,0,0.12)', transition: 'background .15s, border-color .15s' }}
        onMouseEnter={e => (e.currentTarget.style.background = allAgree ? '#C7CFFF' : '#F7E296')}
        onMouseLeave={e => (e.currentTarget.style.background = allAgree ? '#D6DCFF' : '#FBEAB0')}
      >
        <ConsentBox state={allAgree ? 'all' : noneAgree ? 'none' : 'some'} />
        <span style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: color.grey900, lineHeight: 1.25 }}>
            Derivar a WebChat
          </span>
          <span style={{ display: 'block', fontSize: 12, color: color.grey500, marginTop: 2 }}>
            {migratingCount} de {total} cuentas
          </span>
        </span>
      </button>

      {confirmOpen && (
        <AssumeCostModal
          onKeep={() => setConfirmOpen(false)}
          onAssume={() => { onSetAll(false); setConfirmOpen(false) }}
        />
      )}
    </div>
  )
}

// ── Confirmation modal — shown when unchecking the consent ────────────────────
function AssumeCostModal({ onKeep, onAssume }: { onKeep: () => void; onAssume: () => void }) {
  return (
    <div onClick={onKeep} style={overlay}>
      <div onClick={e => e.stopPropagation()} style={card}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '24px 24px', borderBottom: `1px solid ${color.grey200}` }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: WARN_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="warning" size={22} color={WARN} filled />
          </div>
          <h2 style={{ flex: 1, margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px', color: color.grey900 }}>
            ¿Asumir los nuevos costos de WhatsApp?
          </h2>
          <button onClick={onKeep} aria-label="Cerrar" style={iconBtn}>
            <Icon name="close" size={20} color={color.grey600} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 24px 24px' }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: color.grey700 }}>
            Si no derivás a WebChat, tus cuentas siguen respondiendo por WhatsApp y <strong>pagan por cada mensaje</strong> desde
            el <strong>{DATE_SERVICE}</strong>.
          </p>

          <div style={{ marginTop: 24, marginBottom: 10, fontSize: 12, fontWeight: 700, color: color.grey500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
          <button
            onClick={onAssume}
            style={secondaryBtn}
            onMouseEnter={e => (e.currentTarget.style.background = INFO_BG)}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
          >
            Asumir el costo
          </button>
          <button onClick={onKeep} style={primaryBtn}>
            <Icon name="verified_user" size={17} color="#fff" filled />
            Mantener en WebChat
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Bits ──────────────────────────────────────────────────────────────────────
function ConsentBox({ state }: { state: 'all' | 'some' | 'none' }) {
  const on = state === 'all'
  return (
    <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `2px solid ${state === 'none' ? color.grey400 : INFO}`, background: state === 'none' ? '#fff' : INFO, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {on && <Icon name="check" size={15} color="#fff" />}
      {state === 'some' && <span style={{ width: 10, height: 2.5, borderRadius: 2, background: '#fff' }} />}
    </span>
  )
}

function th(align: 'left' | 'right' = 'left'): CSSProperties {
  return { textAlign: align, padding: '8px 8px', fontSize: 12, fontWeight: 700, color: color.grey500, textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: `1px solid ${color.grey200}` }
}

function BillRow({ concept, before, after, afterNote, total }: { concept: string; before: string; after: string; afterNote?: string; total?: boolean }) {
  const base: CSSProperties = { padding: total ? '16px 8px 0' : '13px 6px', borderTop: total ? `2px solid ${color.grey300}` : `1px solid ${color.grey200}`, verticalAlign: 'top' }
  return (
    <tr>
      <td style={{ ...base, fontSize: total ? 15 : 13.5, fontWeight: total ? 700 : 400, color: total ? color.grey900 : color.grey700 }}>{concept}</td>
      <td style={{ ...base, textAlign: 'right', fontSize: total ? 14 : 13.5, fontWeight: 400, color: color.grey400, whiteSpace: 'nowrap' }}>{before}</td>
      <td style={{ ...base, textAlign: 'right', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: total ? 21 : 14, fontWeight: total ? 800 : 600, color: color.grey900, lineHeight: 1.05, letterSpacing: total ? '-0.4px' : undefined }}>{after}</div>
        {afterNote && <div style={{ fontSize: 12, fontWeight: 600, color: color.grey500, marginTop: 3 }}>{afterNote}</div>}
      </td>
    </tr>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const overlay: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }
const card: CSSProperties = { width: '100%', maxWidth: 500, background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', fontFamily: "'Roboto', sans-serif" }
const iconBtn: CSSProperties = { width: 32, height: 32, borderRadius: '50%', border: 'none', background: color.grey100, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
// Secondary — outlined blue (Botmaker system).
const secondaryBtn: CSSProperties = { padding: '12px 20px', borderRadius: 100, border: `1.5px solid ${INFO}`, background: '#fff', color: INFO, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background .15s' }
// Primary — solid blue.
const primaryBtn: CSSProperties = { padding: '12px 24px', borderRadius: 100, border: 'none', background: INFO, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }
