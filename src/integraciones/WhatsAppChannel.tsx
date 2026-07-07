import { type ReactNode } from 'react'
import Icon from '../Icon'
import { color } from '../ds'
import { ACCOUNTS, type WaAccount } from './accounts'

// ── WhatsApp channel list ────────────────────────────────────────────────────
// Mirrors the real go.botmaker.com WhatsApp table (Perfil · Línea · WABA ·
// Username · Estado · Calidad · Test · QR · Link). `alert` is rendered between
// the title and the table. With `consent`, a "Derivar a WebChat" checkbox
// column appears (Option 2).

const WA_GREEN = '#25D366'
const INFO = color.information       // #304FFE
const INFO_LIGHT = color.infoLight   // #E6EAFF
const INFO_DARK = color.primaryMidDark
const WARN_DARK = color.warningDark

interface ConsentConfig {
  migrating: string[]
  onToggle: (id: string) => void
  plain?: boolean // V2: sin caja, checkbox + link
}

interface Props {
  alert?: ReactNode
  consent?: ConsentConfig
}

// ── WhatsApp glyph ────────────────────────────────────────────────────────────
function WhatsAppGlyph({ size = 24, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <path fill={color} d="M16.04 4c-6.6 0-11.96 5.36-11.96 11.96 0 2.11.55 4.17 1.6 5.99L4 28l6.2-1.62a11.9 11.9 0 0 0 5.83 1.49h.01c6.6 0 11.96-5.36 11.96-11.96 0-3.2-1.24-6.2-3.5-8.46A11.86 11.86 0 0 0 16.04 4Zm0 21.9h-.01c-1.8 0-3.56-.48-5.1-1.4l-.36-.22-3.79.99 1.01-3.69-.24-.38a9.94 9.94 0 0 1-1.52-5.29c0-5.48 4.46-9.94 9.95-9.94 2.66 0 5.15 1.04 7.03 2.92a9.86 9.86 0 0 1 2.91 7.03c0 5.49-4.46 9.95-9.95 9.95Zm5.46-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  )
}

// ── Avatars ──────────────────────────────────────────────────────────────────
function Avatar({ kind }: { kind: WaAccount['avatar'] }) {
  if (kind === 'botmaker') {
    return (
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: INFO_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 12 L12 3 L21 12 L12 21 Z" fill={color.primary} />
          <circle cx="12" cy="12" r="3" fill="#fff" />
        </svg>
      </div>
    )
  }
  return (
    <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: color.grey200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
        <Icon name="person" size={21} color={color.grey400} />
      </div>
      <div style={{ position: 'absolute', right: -2, bottom: -2, width: 12, height: 12, borderRadius: '50%', background: color.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
        <Icon name="edit" size={7} color="#fff" />
      </div>
    </div>
  )
}

// ── Cells ─────────────────────────────────────────────────────────────────────
function StatusCell({ status }: { status: WaAccount['status'] }) {
  if (status === 'loading') {
    return (
      <span style={{ display: 'inline-flex', width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 15, height: 15, border: `2px solid ${color.primaryLight}`, borderTopColor: color.primary, borderRadius: '50%', display: 'inline-block', animation: 'wa-spin 0.7s linear infinite' }} />
      </span>
    )
  }
  const connected = status === 'connected'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: color.grey800 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? color.success : color.grey400 }} />
      {connected ? 'Conectada' : 'Desconocido'}
      {!connected && <Icon name="info" size={14} color={color.grey400} />}
    </span>
  )
}

function QualityCell({ quality }: { quality: WaAccount['quality'] }) {
  const isAlta = quality === 'alta'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: color.grey800 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: isAlta ? color.success : color.grey400 }} />
      {isAlta ? 'Alta' : 'N/A'}
    </span>
  )
}

// Secondary (blue outlined) button.
function ElegirButton() {
  return (
    <button
      style={{ padding: '4px 16px', borderRadius: 100, border: `1.5px solid ${INFO}`, background: '#fff', color: INFO, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.background = INFO_LIGHT)}
      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
    >
      Elegir
    </button>
  )
}

// Green outlined WhatsApp test button.
function TestButton() {
  return (
    <button
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, border: `1.5px solid ${WA_GREEN}`, background: '#fff', color: WA_GREEN, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F1FCF5')}
      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
    >
      <span style={{ width: 16, height: 16, borderRadius: '50%', background: WA_GREEN, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <WhatsAppGlyph size={11} color="#fff" />
      </span>
      Test
    </button>
  )
}

// Tertiary icon button (no border, light hover).
function IconBtn({ name, tint }: { name: string; tint?: string }) {
  return (
    <button
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, color: tint ?? color.grey600 }}
      onMouseEnter={e => (e.currentTarget.style.background = color.grey100)}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      <Icon name={name} size={16} color={tint ?? color.grey600} />
    </button>
  )
}

// Square checkbox (consent column).
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `2px solid ${checked ? INFO : color.grey400}`, background: checked ? INFO : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
      {checked && <Icon name="check" size={14} color="#fff" />}
    </span>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────
const BASE_COLUMNS = ['Perfil', 'Línea', 'WABA', 'Username', 'Estado', 'Calidad', 'Test de WhatsApp', 'QR', 'Link']
const CENTERED = new Set(['QR', 'Link', 'Username', 'Test de WhatsApp', 'Derivar a WebChat'])

export default function WhatsAppChannel({ alert, consent }: Props) {
  // Consent column goes at the far right (after Link).
  const columns = consent ? [...BASE_COLUMNS, 'Derivar a WebChat'] : BASE_COLUMNS

  const td: React.CSSProperties = { padding: '8px 20px', verticalAlign: 'middle' }

  return (
    <div style={{ flex: 1, overflow: 'auto', background: color.grey100, fontFamily: "'Roboto', sans-serif" }}>
      <style>{`
        @keyframes wa-spin { to { transform: rotate(360deg); } }
        .wa-tip { position: relative; display: inline-flex; align-items: center; }
        .wa-tip-bubble { position: absolute; top: calc(100% + 9px); left: 50%; transform: translateX(-50%); width: 240px; background: #212121; color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 400; line-height: 1.45; text-transform: none; letter-spacing: normal; box-shadow: 0 6px 18px rgba(0,0,0,0.22); opacity: 0; visibility: hidden; transition: opacity .15s; z-index: 30; white-space: normal; text-align: left; }
        .wa-tip:hover .wa-tip-bubble { opacity: 1; visibility: visible; }
        .wa-tip-bubble::after { content: ''; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); border: 5px solid transparent; border-bottom-color: #212121; }
      `}</style>

      <div style={{ maxWidth: 1760, margin: '0 auto', padding: '20px 32px 40px' }}>

        {/* ── Volver ─────────────────────────────────────────────────── */}
        <button
          style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginBottom: 12, padding: '4px 8px 4px 4px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: INFO, fontSize: 12, fontWeight: 600 }}
          onMouseEnter={e => (e.currentTarget.style.background = INFO_LIGHT)}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <Icon name="chevron_left" size={16} color={INFO} />
          Volver
        </button>

        {/* ── Title row ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: WA_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <WhatsAppGlyph size={16} color="#fff" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: color.grey900, margin: 0, letterSpacing: '-0.3px' }}>WhatsApp</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Secondary — outlined blue */}
            <button
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, border: `1.5px solid ${INFO}`, background: '#fff', color: INFO, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = INFO_LIGHT)}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <Icon name="settings" size={16} color={INFO} />
              Configurar menú persistente
            </button>
            {/* Primary — solid blue */}
            <button
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, border: 'none', background: INFO, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = INFO_DARK)}
              onMouseLeave={e => (e.currentTarget.style.background = INFO)}
            >
              <Icon name="add" size={18} color="#fff" />
              Nueva cuenta de WhatsApp
            </button>
          </div>
        </div>

        {/* ── Alert slot ────────────────────────────────────────────── */}
        {alert}

        {/* ── Table ─────────────────────────────────────────────────── */}
        <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', background: '#fff', border: `1px solid ${color.grey200}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: color.grey50, borderBottom: `1px solid ${color.grey200}` }}>
                {columns.map((c, i) => (
                  <th
                    key={c}
                    style={{
                      textAlign: CENTERED.has(c) ? 'center' : 'left',
                      padding: '8px 20px',
                      color: color.grey600,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      ...(i === 0 ? { paddingLeft: 24 } : null),
                    }}
                  >
                    {c === 'Derivar a WebChat' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {c}
                        <span className="wa-tip" style={{ cursor: 'help' }}>
                          <Icon name="info" size={15} color={color.grey400} />
                          <span className="wa-tip-bubble">
                            Las conversaciones de esta cuenta se atienden desde el WebChat de Botmaker, un canal sin costo por mensaje de WhatsApp.
                          </span>
                        </span>
                      </span>
                    ) : c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACCOUNTS.map((acc, idx) => {
                const migrating = consent ? consent.migrating.includes(acc.id) : false
                return (
                  <tr key={acc.id} style={{ borderTop: idx === 0 ? 'none' : `1px solid ${color.grey200}` }}>
                    {/* Perfil */}
                    <td style={{ ...td, paddingLeft: 24 }}><Avatar kind={acc.avatar} /></td>

                    {/* Línea */}
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 14, color: color.grey900, whiteSpace: 'nowrap' }}>{acc.phone}</span>
                        <Icon name="cloud" size={16} color={color.grey400} />
                      </div>
                      <div style={{ fontSize: 12, color: color.grey500, marginTop: 2 }}>{acc.profileName}</div>
                    </td>

                    {/* WABA */}
                    <td style={{ ...td, fontSize: 12, color: color.grey700, whiteSpace: 'nowrap' }}>{acc.waba}</td>

                    {/* Username */}
                    <td style={{ ...td, textAlign: 'center' }}><ElegirButton /></td>

                    {/* Estado */}
                    <td style={td}><StatusCell status={acc.status} /></td>

                    {/* Calidad */}
                    <td style={td}><QualityCell quality={acc.quality} /></td>

                    {/* Test de WhatsApp */}
                    <td style={{ ...td, textAlign: 'center' }}><TestButton /></td>

                    {/* QR */}
                    <td style={{ ...td, textAlign: 'center' }}><IconBtn name="qr_code_2" /></td>

                    {/* Link */}
                    <td style={{ ...td, textAlign: 'center' }}><IconBtn name="link" tint={INFO} /></td>

                    {/* Derivar a WebChat (Option 2) — al final */}
                    {consent && (
                      <td style={{ ...td, textAlign: 'center' }}>
                        {consent.plain ? (
                          /* V2 — sin caja: checkbox + link */
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                            <button onClick={() => consent.onToggle(acc.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                              <Checkbox checked={migrating} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: migrating ? INFO : WARN_DARK, whiteSpace: 'nowrap' }}>
                                {migrating ? 'Derivar' : 'Asume costo'}
                              </span>
                            </button>
                            <button title="Vista previa de la conversación en el WebChat (Open Channel)" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: INFO, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                              <Icon name="visibility" size={14} color={INFO} filled />
                              Ver experiencia
                            </button>
                          </div>
                        ) : (
                          /* V1 — recuadro gris con el checkbox */
                          <button
                            onClick={() => consent.onToggle(acc.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: color.grey50, border: `1px solid ${color.grey200}`, cursor: 'pointer' }}
                          >
                            <Checkbox checked={migrating} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: migrating ? INFO : WARN_DARK, whiteSpace: 'nowrap' }}>
                              {migrating ? 'Derivación activa' : 'Derivación apagada'}
                            </span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
