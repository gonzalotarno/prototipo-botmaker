import { useState, type CSSProperties, type ReactNode } from 'react'
import Icon from '../Icon'
import { color } from '../ds'
import { ACCOUNTS } from './accounts'

// ── WhatsApp pricing-change alert ─────────────────────────────────────────────
// Informational (not critical) banner + modal. Communicates Meta's pricing
// changes and offers an optional cost-reduction strategy: deflect conversations
// to the Botmaker WebChat (no per-message cost). Lines can opt out and keep
// running on WhatsApp — a valid choice, not a problem.
//
// Real dates (Meta Business Agent Platform):
//  · 1 oct 2026 → service messages (non-template replies within the 24h window)
//    start being charged per message — affects 3rd-party AI agents like Botmaker.
//  · 1 ago 2026 → Meta Business Agent (Meta's own AI) charged per token.

const INFO_BG = color.infoLight      // #E6EAFF
const INFO = color.information       // #304FFE
const INFO_DARK = color.infoDark     // #0026CA

const WARN_BG = color.warningLight   // #FFF6D6
const WARN = color.warning           // #F5A623
const WARN_DARK = color.warningDark  // #9C6511

const DATE_SERVICE = '1 de octubre de 2026'
const DATE_AGENT = '1 de agosto de 2026'

type Decision = 'pending' | 'accepted' | 'cancelled'

export default function WhatsAppPricingAlert() {
  const [open, setOpen] = useState(false)
  const [decision, setDecision] = useState<Decision>('pending')
  // ids of lines that WILL be deflected to WebChat (default: all)
  const [deflected, setDeflected] = useState<string[]>(ACCOUNTS.map(a => a.id))

  // ── Accepted → compact confirmation strip ──────────────────────────────────
  if (decision === 'accepted') {
    const kept = ACCOUNTS.length - deflected.length
    return (
      <div style={strip(color.successLight, color.success)}>
        <Icon name="check_circle" size={20} color={color.successDark} filled />
        <span style={{ fontSize: 14, color: color.successDark, fontWeight: 500 }}>
          Derivación a WebChat activada en <strong>{deflected.length} de {ACCOUNTS.length}</strong> líneas
          {kept > 0 && <> · {kept} sigue{kept > 1 ? 'n' : ''} en WhatsApp</>}.
        </span>
        <button onClick={() => setOpen(true)} style={linkBtn(color.successDark)}>Revisar</button>
        {open && <ReviewModal {...modalProps()} />}
      </div>
    )
  }

  // ── Banner (pending / cancelled) ───────────────────────────────────────────
  const cancelled = decision === 'cancelled'
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: WARN_BG, marginBottom: 24 }}>
        <span style={{ width: 4, alignSelf: 'stretch', borderRadius: 100, background: WARN, flexShrink: 0 }} />
        <Icon name="campaign" size={22} color={WARN_DARK} filled />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: WARN_DARK }}>Cambios de precios de WhatsApp</span>
          <span style={{ fontSize: 14, color: color.grey800 }}>
            {' · '}
            {cancelled
              ? 'No se aplicó la derivación. Las conversaciones siguen por WhatsApp con su costo por mensaje.'
              : `Desde el ${DATE_SERVICE} las respuestas dentro de la ventana de 24 h pasan a tener costo. Una opción para reducirlo es derivar las conversaciones a WebChat.`}
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, border: 'none', background: WARN_DARK, color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#7d500e')}
          onMouseLeave={e => (e.currentTarget.style.background = WARN_DARK)}
        >
          Revisar cambio
          <Icon name="arrow_forward" size={15} color="#fff" />
        </button>
      </div>
      {open && <ReviewModal {...modalProps()} />}
    </>
  )

  function modalProps() {
    return {
      deflected,
      onToggle: (id: string) =>
        setDeflected(d => (d.includes(id) ? d.filter(x => x !== id) : [...d, id])),
      onSetAll: (all: boolean) => setDeflected(all ? ACCOUNTS.map(a => a.id) : []),
      onClose: () => setOpen(false),
      onAccept: () => { setDecision('accepted'); setOpen(false) },
      onCancel: () => { setDecision('cancelled'); setOpen(false) },
    }
  }
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  deflected: string[]
  onToggle: (id: string) => void
  onSetAll: (all: boolean) => void
  onClose: () => void
  onAccept: () => void
  onCancel: () => void
}

function ReviewModal({ deflected, onToggle, onSetAll, onClose, onAccept, onCancel }: ModalProps) {
  const count = deflected.length
  const allOn = count === ACCOUNTS.length
  const manyLines = ACCOUNTS.length > 5
  const [step, setStep] = useState<'info' | 'lines'>('info')

  return (
    <div onClick={onClose} style={overlay}>
      <style>{`
        .wa-modal-scroll::-webkit-scrollbar { width: 10px; }
        .wa-modal-scroll::-webkit-scrollbar-thumb { background: #C7C7C7; border-radius: 100px; border: 3px solid #fff; }
        .wa-modal-scroll::-webkit-scrollbar-thumb:hover { background: #A8A8A8; }
        .wa-modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .wa-modal-scroll { scrollbar-width: thin; scrollbar-color: #C7C7C7 transparent; }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={card}>

        {/* Floating close */}
        <button onClick={onClose} aria-label="Cerrar" style={{ ...iconBtn, position: 'absolute', top: 14, right: 14, zIndex: 2, background: color.grey100 }}>
          <Icon name="close" size={19} color={color.grey600} />
        </button>

        {step === 'info' ? (
          <>
            {/* ── Step 1 — the announcement ─────────────────────────── */}
            <div className="wa-modal-scroll" style={{ overflowY: 'auto', padding: '24px 28px 28px' }}>
              <Eyebrow color={color.grey500}>Actualización de WhatsApp · octubre 2026</Eyebrow>

              <h2 style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.4px', color: color.grey900, maxWidth: '92%' }}>
                Nuevos precios de WhatsApp
              </h2>
              <p style={{ margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.65, color: color.grey700 }}>
                Desde el <Mark>{DATE_SERVICE}</Mark>, Meta empieza a cobrar por mensaje las respuestas dentro de la
                ventana de 24&nbsp;h —los mensajes de servicio que hoy no tienen costo.
              </p>

              {/* Featured card */}
              <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: color.grey50, border: `1px solid ${color.grey200}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <DateChip month="OCT" day="1" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: color.grey900 }}>Nuevos precios de WhatsApp</div>
                    <div style={{ fontSize: 13, color: color.grey500, marginTop: 2 }}>Los mensajes de servicio pasan a tener costo</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${color.grey200}`, fontSize: 13.5, color: color.grey700 }}>
                  <Icon name="schedule" size={17} color={color.grey500} />
                  <span>Aplica desde el <strong>{DATE_SERVICE}</strong>. Meta Business Agent, por token, desde el {DATE_AGENT}.</span>
                </div>
                <a href="https://business.whatsapp.com/products/platform-pricing" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, padding: '11px', borderRadius: 10, background: '#fff', border: `1px solid ${color.grey300}`, color: color.grey900, fontSize: 13.5, fontWeight: 700, textDecoration: 'none' }}>
                  Ver el detalle de precios de Meta
                  <Icon name="open_in_new" size={15} color={color.grey700} />
                </a>
              </div>

              {/* Strategy */}
              <h3 style={{ margin: '26px 0 0', fontSize: 16, fontWeight: 800, color: color.grey900 }}>Cómo evitar ese costo</h3>
              <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.65, color: color.grey700 }}>
                Derivar las conversaciones a <Mark>WebChat</Mark>, un canal sin costo por mensaje. Lo estamos rediseñando
                para que se sienta como WhatsApp.
              </p>

              <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                <Check>Sin costo por mensaje en cada conversación</Check>
                <Check>Las charlas siguen sin interrupción</Check>
                <Check>Un WebChat con el aspecto de WhatsApp</Check>
              </ul>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 22px', borderTop: `1px solid ${color.grey200}` }}>
              <StepHint current={1} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={onCancel} style={ghostBtn}>Ahora no</button>
                <button onClick={() => setStep('lines')} style={primaryBtn}>
                  Continuar
                  <Icon name="arrow_forward" size={17} color="#fff" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ── Step 2 — choose lines ─────────────────────────────── */}
            <div className="wa-modal-scroll" style={{ overflowY: 'auto', padding: '22px 28px 28px' }}>
              <button onClick={() => setStep('info')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: color.grey600 }}>
                <Icon name="arrow_back" size={16} color={color.grey600} />
                Volver
              </button>

              <h2 style={{ margin: '14px 0 0', fontSize: 22, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.4px', color: color.grey900 }}>
                Elegí en qué líneas aplicarlo
              </h2>
              <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.6, color: color.grey700 }}>
                Derivá las que quieras a WebChat. El resto sigue en WhatsApp y conserva su costo por mensaje —es una opción válida.
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '20px 0 8px' }}>
                <Eyebrow color={color.grey600}>Líneas</Eyebrow>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <button onClick={() => onSetAll(!allOn)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: INFO }}>
                    {allOn ? 'Quitar todas' : 'Activar todas'}
                  </button>
                  <span style={{ fontSize: 12.5, color: color.grey500 }}>{count} de {ACCOUNTS.length}</span>
                </div>
              </div>

              <div
                className="wa-modal-scroll"
                style={{ display: 'flex', flexDirection: 'column', gap: 10, ...(manyLines ? { maxHeight: 320, overflowY: 'auto', paddingRight: 6 } : null) }}
              >
                {ACCOUNTS.map(acc => {
                  const on = deflected.includes(acc.id)
                  return (
                    <div
                      key={acc.id}
                      onClick={() => onToggle(acc.id)}
                      role="switch"
                      aria-checked={on}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, cursor: 'pointer', border: `1.5px solid ${on ? INFO : color.grey200}`, background: on ? '#F5F7FF' : '#fff', transition: 'border-color .15s, background .15s' }}
                    >
                      <IconBox
                        size={40} radius={11} iconSize={20}
                        bg={on ? INFO_BG : color.successLight}
                        glyph={on ? <Icon name="forum" size={20} color={INFO} filled /> : <WAMark size={20} />}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: color.grey900 }}>{acc.alias}</div>
                        <div style={{ fontSize: 12.5, color: color.grey500, marginTop: 1 }}>{acc.phone}</div>
                      </div>
                      <Pill bg={on ? INFO_BG : color.successLight} color={on ? INFO_DARK : color.successDark}>
                        {on ? 'WebChat' : 'WhatsApp'}
                      </Pill>
                      <VisualToggle on={on} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 22px', borderTop: `1px solid ${color.grey200}` }}>
              <StepHint current={2} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setStep('info')} style={ghostBtn}>Atrás</button>
                <button
                  onClick={onAccept}
                  disabled={count === 0}
                  style={{ ...primaryBtn, background: count === 0 ? color.grey300 : primaryBtn.background, cursor: count === 0 ? 'not-allowed' : 'pointer', boxShadow: count === 0 ? 'none' : primaryBtn.boxShadow }}
                >
                  <Icon name="check" size={17} color="#fff" />
                  {count === ACCOUNTS.length ? 'Activar en todas' : count === 0 ? 'Elegí una línea' : `Activar en ${count} línea${count === 1 ? '' : 's'}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Two-step progress hint shown at the footer-left.
function StepHint({ current }: { current: 1 | 2 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {[1, 2].map(n => (
        <span key={n} style={{ width: n === current ? 18 : 7, height: 7, borderRadius: 100, background: n === current ? INFO : color.grey300, transition: 'all .15s' }} />
      ))}
    </div>
  )
}

// ── Visual building blocks ────────────────────────────────────────────────────

// Rounded-square icon container (a "recuadro"). Pass `glyph` for a custom node,
// or `name` for a Material icon.
function IconBox({ name, glyph, bg = INFO_BG, iconColor = INFO, size = 44, radius = 13, iconSize = 22 }: { name?: string; glyph?: ReactNode; bg?: string; iconColor?: string; size?: number; radius?: number; iconSize?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {glyph ?? (name && <Icon name={name} size={iconSize} color={iconColor} filled />)}
    </div>
  )
}

// Small colored badge.
function Pill({ children, bg, color: c }: { children: ReactNode; bg: string; color: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 100, background: bg, color: c, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {children}
    </span>
  )
}

// Tiny uppercase eyebrow label.
function Eyebrow({ children, color: c }: { children: ReactNode; color: string }) {
  return <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: c }}>{children}</span>
}

// Highlighted keyword, like the yellow marks in the ClickUp email.
function Mark({ children }: { children: ReactNode }) {
  return <mark style={{ background: '#FFF1A8', color: 'inherit', padding: '0 3px', borderRadius: 3, fontWeight: 600 }}>{children}</mark>
}

// Calendar-style date chip (month over day).
function DateChip({ month, day }: { month: string; day: string }) {
  return (
    <div style={{ width: 48, borderRadius: 9, overflow: 'hidden', border: `1px solid ${color.grey200}`, textAlign: 'center', flexShrink: 0, background: '#fff' }}>
      <div style={{ background: INFO, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 0' }}>{month}</div>
      <div style={{ fontSize: 21, fontWeight: 800, color: color.grey900, padding: '3px 0 4px', lineHeight: 1 }}>{day}</div>
    </div>
  )
}

// Green-check list item.
function Check({ children }: { children: ReactNode }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <Icon name="check_circle" size={18} color={color.success} filled style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 14, lineHeight: 1.5, color: color.grey800 }}>{children}</span>
    </li>
  )
}

// Presentational toggle (the row card handles the click).
function VisualToggle({ on }: { on: boolean }) {
  return (
    <span style={{ width: 38, height: 22, borderRadius: 100, background: on ? INFO : color.grey400, position: 'relative', flexShrink: 0, transition: 'background 0.15s', pointerEvents: 'none' }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </span>
  )
}

// Small WhatsApp glyph.
function WAMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <path fill="#25D366" d="M16.04 4c-6.6 0-11.96 5.36-11.96 11.96 0 2.11.55 4.17 1.6 5.99L4 28l6.2-1.62a11.9 11.9 0 0 0 5.83 1.49h.01c6.6 0 11.96-5.36 11.96-11.96 0-3.2-1.24-6.2-3.5-8.46A11.86 11.86 0 0 0 16.04 4Zm0 21.9h-.01c-1.8 0-3.56-.48-5.1-1.4l-.36-.22-3.79.99 1.01-3.69-.24-.38a9.94 9.94 0 0 1-1.52-5.29c0-5.48 4.46-9.94 9.95-9.94 2.66 0 5.15 1.04 7.03 2.92a9.86 9.86 0 0 1 2.91 7.03c0 5.49-4.46 9.95-9.95 9.95Zm5.46-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function shortDate(d: string) {
  // "1 de octubre de 2026" → "1 oct 2026"
  const m: Record<string, string> = { enero: 'ene', febrero: 'feb', marzo: 'mar', abril: 'abr', mayo: 'may', junio: 'jun', julio: 'jul', agosto: 'ago', septiembre: 'sep', octubre: 'oct', noviembre: 'nov', diciembre: 'dic' }
  return d.replace(/(\d+) de (\w+) de (\d+)/, (_, n, mes, y) => `${n} ${m[mes] ?? mes} ${y}`)
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const overlay: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }
const card: CSSProperties = { position: 'relative', width: '100%', maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', fontFamily: "'Roboto', sans-serif" }
const iconBtn: CSSProperties = { width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const ghostBtn: CSSProperties = { padding: '10px 20px', borderRadius: 100, border: `1px solid ${color.grey300}`, background: '#fff', color: color.grey700, fontSize: 14, fontWeight: 600, cursor: 'pointer' }
const primaryBtn: CSSProperties = { padding: '11px 22px', borderRadius: 100, border: 'none', background: 'linear-gradient(135deg, #304FFE, #1D2DC4)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(48,79,254,0.3)' }

function strip(bg: string, border: string): CSSProperties {
  return { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: bg, border: `1px solid ${border}`, marginBottom: 24 }
}
function linkBtn(c: string): CSSProperties {
  return { marginLeft: 'auto', background: 'none', border: 'none', color: c, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }
}
