import { useState, type CSSProperties } from 'react'
import Icon from '../Icon'
import { color } from '../ds'
import AssumeCostModal from './AssumeCostModal'

// ── WebChat derivation alert — 6 graphic layouts ──────────────────────────────
// Same content (derivación a WebChat + nuevos precios de Meta), different visual
// treatments to compare. Switch between them with the header switcher.
//   V1 dos columnas · V2 franja horizontal · V3 acción-primero (setting)
//   V4 apilado · V5 Meta rail izquierdo · V6 mínimo una línea

const INFO = color.information       // #304FFE
const INFO_DARK = color.infoDark     // #0026CA
const WARN = color.warning           // #F5A623
const WARN_BG = color.warningLight   // #FFF6D6
const WARN_DARK = color.warningDark  // #9C6511
const BLUE_BG = '#EEF1FF'
const BLUE_BORDER = '#DCE3FF'

const DATE = '1 de octubre de 2026'
const OPEN_CENTRAL_URL = 'https://www.opencentral.com'
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
  const toggle = () => onSetAll(!on)
  const p = { on, toggle, onSetAll }
  const v = ((variant - 1) % 7) + 1
  return (
    <div style={{ marginBottom: 12 }}>
      {v === 1 && <V1 {...p} />}
      {v === 2 && <V2 {...p} />}
      {v === 3 && <V3 {...p} />}
      {v === 4 && <V4 {...p} />}
      {v === 5 && <V5 {...p} />}
      {v === 6 && <V6 {...p} />}
      {v === 7 && <V7 {...p} />}
    </div>
  )
}

type VP = { on: boolean; toggle: () => void; onSetAll: (all: boolean) => void }

// ── V1 — Meta (alert amarillo arriba) + derivación (blanco, full width) ────────
function V1({ on, onSetAll }: VP) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  // Unchecking (from on) opens the assume-cost modal; only turns off if confirmed.
  const handleCheck = () => (on ? setConfirmOpen(true) : onSetAll(true))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {confirmOpen && (
        <AssumeCostModal
          onKeep={() => setConfirmOpen(false)}
          onAssume={() => { onSetAll(false); setConfirmOpen(false) }}
        />
      )}

      {/* Nuevos precios de Meta — alert amarillo, full width */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: WARN_BG, border: `1px solid #F2E2B8`, borderRadius: 12, padding: '12px 16px' }}>
        <Icon name="sell" size={18} color={WARN_DARK} filled style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: 1.5, color: color.grey800 }}>
          <strong style={{ color: WARN_DARK }}>Nuevos precios de Meta.</strong>{' '}
          A partir del <strong>{DATE}</strong>, responder en WhatsApp pasa a tener costo por mensaje.
        </span>
        <a href={PRICES_URL} target="_blank" rel="noreferrer" style={{ ...link(WARN_DARK), flexShrink: 0 }}>
          Ver nuevos precios<Icon name="open_in_new" size={13} color={WARN_DARK} />
        </a>
      </div>

      {/* Derivación a WebChat — blanco, full width */}
      <div style={{ ...whiteCard, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="forum" size={18} color={color.grey700} filled style={{ flexShrink: 0 }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: color.grey900, letterSpacing: '-0.2px' }}>Derivación a WebChat</h3>
        </div>
        <div style={{ ...colStack, marginTop: 14 }}>
          <CheckboxRow on={on} toggle={handleCheck} label="Quiero derivar a WebChat a partir del 1º de octubre" />
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: color.grey600 }}>
            La primera respuesta en WhatsApp invita a continuar en un WebChat: minimizás los costos y le das al cliente un canal propio de la marca.{' '}
            <strong style={{ color: color.grey900 }}>
              {on ? 'Se aplica a partir del 1 de octubre de 2026.' : 'Sin esto, la conversación sigue en WhatsApp, con costo por mensaje.'}
            </strong>
          </p>
          <div style={{ display: 'flex' }}>
            <a href={HELP_URL} target="_blank" rel="noreferrer" style={link(INFO)}>Conocer más sobre esta experiencia<Icon name="open_in_new" size={13} color={INFO} /></a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── V2 — franja horizontal (todo en una fila) ─────────────────────────────────
function V2({ on, toggle }: VP) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, ...blueCard, padding: '12px 16px' }}>
      <Icon name="forum" size={22} color={INFO} filled style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: color.grey900 }}>Derivación a WebChat</div>
        <div style={{ fontSize: 12, color: color.grey600, marginTop: 2 }}>
          La primera respuesta invita a seguir en un WebChat · minimiza los costos de WhatsApp.
        </div>
        <div style={{ marginTop: 6 }}><Links /></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={labelText}>Derivar</span>
        <Switch on={on} toggle={toggle} />
      </div>
      {/* Meta en su propio recuadro blanco */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, background: '#fff', border: `1px solid ${color.grey200}`, borderRadius: 10, padding: '8px 12px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: color.grey900 }}>
          <Icon name="sell" size={13} color={color.grey400} filled />
          Nuevos precios de Meta
        </span>
        <a href={PRICES_URL} target="_blank" rel="noreferrer" style={link(INFO)}>Ver · desde 1 oct<Icon name="open_in_new" size={12} color={INFO} /></a>
      </div>
    </div>
  )
}

// ── V3 — acción-primero (setting card) ────────────────────────────────────────
function V3({ on, toggle }: VP) {
  return (
    <div style={{ ...whiteCard, padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
        <span style={iconBox(INFO)}><Icon name="forum" size={18} color={INFO} filled /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: color.grey900 }}>Derivación a WebChat</div>
          <p style={{ margin: '4px 0 0', fontSize: 12, lineHeight: 1.5, color: color.grey600 }}>
            La primera respuesta invita a continuar en un WebChat. Minimizás los costos y ofrecés un canal propio de la marca.
          </p>
          <div style={{ marginTop: 8 }}><Links /></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <Switch on={on} toggle={toggle} big />
          <span style={{ fontSize: 12, fontWeight: 600, color: on ? INFO_DARK : color.grey500 }}>{on ? 'Activada' : 'Desactivada'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: `1px solid ${color.grey200}`, background: color.grey50 }}>
        <Icon name="sell" size={15} color={color.grey500} filled />
        <span style={{ fontSize: 12, color: color.grey700 }}>
          <strong style={{ color: color.grey900 }}>Nuevos precios de Meta:</strong> desde el {DATE}, WhatsApp cobra por mensaje.
        </span>
        <a href={PRICES_URL} target="_blank" rel="noreferrer" style={{ ...link(INFO), marginLeft: 'auto' }}>Ver precios<Icon name="open_in_new" size={12} color={INFO} /></a>
      </div>
    </div>
  )
}

// ── V4 — apilado (banner azul + barra de precios) ─────────────────────────────
function V4({ on, toggle }: VP) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, ...blueCard, padding: '12px 16px', borderRadius: '12px 12px 0 0' }}>
        <Icon name="forum" size={18} color={INFO} filled style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: color.grey900 }}>Derivación a WebChat</div>
          <div style={{ fontSize: 12, color: color.grey600, marginTop: 2 }}>Primera respuesta invita a seguir en un WebChat · minimiza costos.</div>
        </div>
        <a href={HELP_URL} target="_blank" rel="noreferrer" style={link(INFO)}>Conocer más<Icon name="open_in_new" size={12} color={INFO} /></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={labelText}>Derivar</span>
          <Switch on={on} toggle={toggle} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${color.grey200}`, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '8px 16px' }}>
        <Icon name={on ? 'check_circle' : 'sell'} size={15} color={on ? INFO : color.grey500} filled />
        <span style={{ fontSize: 12, color: color.grey700 }}>
          {on
            ? <>Activada · se aplica el {DATE}.</>
            : <><strong style={{ color: color.grey900 }}>Nuevos precios de Meta:</strong> desde el {DATE}, WhatsApp cobra por mensaje.</>}
        </span>
        <a href={PRICES_URL} target="_blank" rel="noreferrer" style={{ ...link(INFO), marginLeft: 'auto' }}>Ver precios<Icon name="open_in_new" size={12} color={INFO} /></a>
      </div>
    </div>
  )
}

// ── V5 — derivación (azul, izquierda) + Meta (blanco, derecha) ─────────────────
// WebChat a la izquierda, jerarquía clara y sin recargar (estado dentro del toggle).
function V5({ on, toggle }: VP) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
      <div style={{ flex: 3, minWidth: 0, display: 'flex', gap: 12, ...blueCard }}>
        <Accent />
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* nivel 1 — título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={iconBox(INFO)}><Icon name="forum" size={18} color={INFO} filled /></span>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: color.grey900, letterSpacing: '-0.2px' }}>Derivación a WebChat</h3>
          </div>
          {/* nivel 2 — acción (toggle + estado inline) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <Switch on={on} toggle={toggle} big />
            <span style={{ fontSize: 14, fontWeight: 700, color: on ? INFO_DARK : color.grey600 }}>
              {on ? 'Activada' : 'Desactivada'}
            </span>
            <span style={{ fontSize: 12, color: color.grey500 }}>{on ? '· se aplica el 1 de octubre' : '· sigue en WhatsApp'}</span>
          </div>
          {/* nivel 3 — copy de apoyo */}
          <p style={{ margin: '12px 0 0', fontSize: 12, lineHeight: 1.5, color: color.grey600, maxWidth: 560 }}>
            La primera respuesta invita a continuar en un WebChat: minimizás los costos y le das al cliente un canal propio de la marca.
          </p>
          {/* nivel 4 — links */}
          <div style={{ marginTop: 12 }}><Links /></div>
        </div>
      </div>
      <MetaCard />
    </div>
  )
}

// ── V6 — mínimo, una sola línea ───────────────────────────────────────────────
function V6({ on, toggle }: VP) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, ...blueCard, padding: '10px 16px' }}>
      <Icon name="forum" size={18} color={INFO} filled style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 700, color: color.grey900, flexShrink: 0 }}>Derivar a WebChat</span>
      <Switch on={on} toggle={toggle} />
      <span style={{ fontSize: 12, fontWeight: 600, color: on ? INFO_DARK : WARN_DARK, flexShrink: 0 }}>
        {on ? 'Activada' : 'Sigue en WhatsApp'}
      </span>
      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <a href={HELP_URL} target="_blank" rel="noreferrer" style={link(INFO)}>Conocer más</a>
        <a href={PRICES_URL} target="_blank" rel="noreferrer" style={link(color.grey700)}>Precios de Meta<Icon name="open_in_new" size={12} color={color.grey700} /></a>
      </span>
    </div>
  )
}

// ── V7 — franja azul + Meta afuera a la derecha ───────────────────────────────
function V7({ on, toggle }: VP) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
      {/* Franja azul de derivación */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 16, ...blueCard, padding: '12px 16px' }}>
        <Icon name="forum" size={22} color={INFO} filled style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: color.grey900 }}>Derivación a WebChat</div>
          <div style={{ fontSize: 12, color: color.grey600, marginTop: 2 }}>
            La primera respuesta invita a seguir en un WebChat · minimiza los costos de WhatsApp.
          </div>
          <div style={{ marginTop: 6 }}><Links /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={labelText}>Derivar</span>
          <Switch on={on} toggle={toggle} />
        </div>
      </div>
      {/* Meta AFUERA, a la derecha */}
      <div style={{ flexShrink: 0, width: 220, ...whiteCard, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: color.grey900 }}>
          <Icon name="sell" size={13} color={color.grey400} filled />
          Nuevos precios de Meta
        </span>
        <a href={PRICES_URL} target="_blank" rel="noreferrer" style={{ ...link(INFO), marginTop: 4 }}>Ver · desde 1 oct<Icon name="open_in_new" size={12} color={INFO} /></a>
      </div>
    </div>
  )
}

// ── Shared pieces ─────────────────────────────────────────────────────────────
function Header() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon name="forum" size={16} color={INFO} filled />
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: color.grey900, letterSpacing: '-0.1px' }}>Derivación a WebChat</h3>
    </div>
  )
}

function CheckboxRow({ on, toggle, label }: { on: boolean; toggle: () => void; label: string }) {
  return (
    <button onClick={toggle} style={rowBtn}>
      <Checkbox checked={on} />
      <span style={labelText}>{label}</span>
    </button>
  )
}

function Copy() {
  return (
    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: color.grey600 }}>
      La primera respuesta en WhatsApp invita a continuar en un WebChat: minimizás los costos y le das al cliente un canal propio de la marca.
    </p>
  )
}

function StatusLine({ on }: { on: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 18 }}>
      <Icon name={on ? 'check_circle' : 'warning'} size={14} color={on ? INFO : WARN} filled style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: on ? INFO_DARK : WARN_DARK }}>
        {on ? 'Activada · se aplica el 1 de octubre' : 'Desactivada · la conversación sigue en WhatsApp, con costo'}
      </span>
    </div>
  )
}

function Links() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <a href={HELP_URL} target="_blank" rel="noreferrer" style={link(INFO)}>Conocer más<Icon name="open_in_new" size={13} color={INFO} /></a>
      <a href={OPEN_CENTRAL_URL} target="_blank" rel="noreferrer" style={link(INFO)}>Abrir Open Central<Icon name="open_in_new" size={13} color={INFO} /></a>
    </div>
  )
}

function MetaCard() {
  return (
    <div style={{ flex: 1, minWidth: 190, ...whiteCard, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="sell" size={16} color={color.grey400} filled />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: color.grey900, letterSpacing: '-0.1px' }}>Nuevos precios de Meta</h3>
      </div>
      <p style={{ margin: '8px 0 0', fontSize: 12, lineHeight: 1.5, color: color.grey600 }}>
        Desde el <strong style={{ color: color.grey800 }}>{DATE}</strong>, responder en WhatsApp pasa a tener costo por mensaje.
      </p>
      <a href={PRICES_URL} target="_blank" rel="noreferrer" style={{ ...link(INFO), marginTop: 'auto', paddingTop: 10 }}>
        Ver nuevos precios<Icon name="open_in_new" size={13} color={INFO} />
      </a>
    </div>
  )
}

function Accent() {
  return <span style={{ width: 3, alignSelf: 'stretch', borderRadius: 100, background: INFO, flexShrink: 0 }} />
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1, border: `2px solid ${checked ? INFO : color.grey400}`, background: checked ? INFO : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .12s, border-color .12s' }}>
      {checked && <Icon name="check" size={11} color="#fff" />}
    </span>
  )
}

function Switch({ on, toggle, big }: { on: boolean; toggle: () => void; big?: boolean }) {
  const w = big ? 48 : 40, h = big ? 26 : 22, k = big ? 22 : 18
  return (
    <button onClick={toggle} role="switch" aria-checked={on} style={{ width: w, height: h, borderRadius: 100, border: 'none', background: on ? INFO : color.grey400, cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .15s', padding: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? w - k - 2 : 2, width: k, height: k, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </button>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const blueCard: CSSProperties = { background: BLUE_BG, border: `1px solid ${BLUE_BORDER}`, borderRadius: 12, padding: '14px 16px' }
const whiteCard: CSSProperties = { background: '#fff', border: `1px solid ${color.grey200}`, borderRadius: 12, padding: '14px 16px' }
const colStack: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 }
const rowBtn: CSSProperties = { display: 'inline-flex', alignItems: 'flex-start', gap: 8, textAlign: 'left', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }
const labelText: CSSProperties = { fontSize: 14, fontWeight: 600, color: color.grey900, whiteSpace: 'nowrap' }
function iconBox(c: string): CSSProperties {
  return { width: 36, height: 36, borderRadius: 10, background: '#EEF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: c }
}
function link(c: string): CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: c, textDecoration: 'none' }
}
