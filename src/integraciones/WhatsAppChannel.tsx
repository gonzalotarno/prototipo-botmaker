import Icon from '../Icon'
import { color } from '../ds'
import WhatsAppPricingAlert from './WhatsAppPricingAlert'
import { ACCOUNTS, type Status, type Quality } from './accounts'

// ── WhatsApp channel list ────────────────────────────────────────────────────
// Recreates the "Canales e Integraciones › Canales › WhatsApp" account table.
// Pure presentational demo data — the goal is a faithful UI to iterate on.

const WA_GREEN = '#25D366'

// Official WhatsApp glyph (speech bubble + handset). Single path, recolorable.
function WhatsAppGlyph({ size = 24, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
      <path
        fill={color}
        d="M16.04 4c-6.6 0-11.96 5.36-11.96 11.96 0 2.11.55 4.17 1.6 5.99L4 28l6.2-1.62a11.9 11.9 0 0 0 5.83 1.49h.01c6.6 0 11.96-5.36 11.96-11.96 0-3.2-1.24-6.2-3.5-8.46A11.86 11.86 0 0 0 16.04 4Zm0 21.9h-.01c-1.8 0-3.56-.48-5.1-1.4l-.36-.22-3.79.99 1.01-3.69-.24-.38a9.94 9.94 0 0 1-1.52-5.29c0-5.48 4.46-9.94 9.95-9.94 2.66 0 5.15 1.04 7.03 2.92a9.86 9.86 0 0 1 2.91 7.03c0 5.49-4.46 9.95-9.95 9.95Zm5.46-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z"
      />
    </svg>
  )
}

// ── Avatars ──────────────────────────────────────────────────────────────────
function BotmakerAvatar() {
  return (
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E6EAFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M3 12 L12 3 L21 12 L12 21 Z" fill={color.primary} />
        <circle cx="12" cy="12" r="3.2" fill="#fff" />
      </svg>
    </div>
  )
}

function PlaceholderAvatar() {
  return (
    <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: color.grey200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
        <Icon name="person" size={34} color={color.grey400} />
      </div>
      <div style={{ position: 'absolute', right: -2, bottom: -2, width: 16, height: 16, borderRadius: '50%', background: color.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
        <Icon name="edit" size={9} color="#fff" />
      </div>
    </div>
  )
}

// ── Status / quality cells ────────────────────────────────────────────────────
function StatusCell({ status }: { status: Status }) {
  if (status === 'loading') {
    return (
      <span style={{ display: 'inline-flex', width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 18, height: 18, border: `2px solid ${color.primaryLight}`, borderTopColor: color.primary, borderRadius: '50%', display: 'inline-block', animation: 'wa-spin 0.7s linear infinite' }} />
      </span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, color: color.grey900 }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: color.success }} />
      Conectada
    </span>
  )
}

function QualityCell({ quality }: { quality: Quality }) {
  const isAlta = quality === 'alta'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, color: color.grey900 }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: isAlta ? color.success : color.grey500 }} />
      {isAlta ? 'Alta' : 'N/A'}
    </span>
  )
}

// ── Buttons ───────────────────────────────────────────────────────────────────
function ChatButton() {
  return (
    <button
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 100, border: `1.5px solid ${WA_GREEN}`, background: '#fff', color: WA_GREEN, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F1FCF5')}
      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
    >
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: WA_GREEN, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <WhatsAppGlyph size={14} color="#fff" />
      </span>
      Chat
    </button>
  )
}

function WebhooksButton() {
  return (
    <button
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 100, border: `1.5px solid ${color.primary}`, background: '#fff', color: color.primary, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)}
      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
    >
      <Icon name="account_tree" size={16} color={color.primary} />
      Ir a Webhooks
    </button>
  )
}

function CopyButton() {
  return (
    <button
      title="Copiar"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', color: color.grey700, borderRadius: 6, padding: 0 }}
      onMouseEnter={e => (e.currentTarget.style.background = color.grey100)}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      <Icon name="content_copy" size={17} />
    </button>
  )
}

// ── Header cells ──────────────────────────────────────────────────────────────
const COLUMNS = ['Perfil', 'Teléfono', 'Estado', 'Calidad', 'Type', 'Test WhatsApp', 'Agregar webhooks', 'Alias', '+Info']

export default function WhatsAppChannel() {
  return (
    <div style={{ flex: 1, overflow: 'auto', background: color.grey100, fontFamily: "'Roboto', sans-serif" }}>
      <style>{`@keyframes wa-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: 1960, margin: '0 auto', padding: '36px 48px 64px' }}>

        {/* ── Title row ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button
              aria-label="Volver"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', color: color.primary, borderRadius: 8 }}
              onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <Icon name="chevron_left" size={26} />
            </button>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: WA_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <WhatsAppGlyph size={30} color="#fff" />
            </div>
            <h1 style={{ fontSize: 38, fontWeight: 700, color: color.grey900, margin: 0, letterSpacing: '-0.5px' }}>WhatsApp</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '11px 22px', borderRadius: 100, border: 'none', background: color.primary, color: '#fff', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = color.primaryMidDark)}
              onMouseLeave={e => (e.currentTarget.style.background = color.primary)}
            >
              <Icon name="settings" size={18} color="#fff" />
              Configurar menú persistente
            </button>
            <button
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 100, border: 'none', background: color.primary, color: '#fff', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = color.primaryMidDark)}
              onMouseLeave={e => (e.currentTarget.style.background = color.primary)}
            >
              <Icon name="add" size={20} color="#fff" />
              Nueva cuenta de WhatsApp
            </button>
          </div>
        </div>

        {/* ── Pricing-change alert (between title and table) ────────── */}
        <WhatsAppPricingAlert />

        {/* ── Table ─────────────────────────────────────────────────── */}
        <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: color.primary }}>
                {COLUMNS.map((c, i) => (
                  <th
                    key={c}
                    style={{
                      textAlign: c === '+Info' ? 'center' : 'left',
                      padding: '20px 24px',
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      ...(i === 0 ? { paddingLeft: 32 } : null),
                    }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACCOUNTS.map((acc, idx) => (
                <tr key={acc.id} style={{ borderTop: idx === 0 ? 'none' : `1px solid ${color.grey200}` }}>
                  {/* Perfil */}
                  <td style={{ padding: '18px 24px 18px 32px' }}>
                    {acc.avatar === 'botmaker' ? <BotmakerAvatar /> : <PlaceholderAvatar />}
                  </td>
                  {/* Teléfono */}
                  <td style={{ padding: '18px 24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, color: color.grey900, whiteSpace: 'nowrap' }}>
                      {acc.phone}
                      <CopyButton />
                    </span>
                  </td>
                  {/* Estado */}
                  <td style={{ padding: '18px 24px' }}><StatusCell status={acc.status} /></td>
                  {/* Calidad */}
                  <td style={{ padding: '18px 24px' }}><QualityCell quality={acc.quality} /></td>
                  {/* Type */}
                  <td style={{ padding: '18px 24px', fontSize: 15, color: color.grey900 }}>{acc.type}</td>
                  {/* Test WhatsApp */}
                  <td style={{ padding: '18px 24px' }}><ChatButton /></td>
                  {/* Agregar webhooks */}
                  <td style={{ padding: '18px 24px' }}><WebhooksButton /></td>
                  {/* Alias */}
                  <td style={{ padding: '18px 24px', minWidth: 200 }}>
                    <input
                      defaultValue={acc.alias}
                      style={{ width: '100%', minWidth: 170, border: 'none', borderBottom: `1px solid ${color.grey300}`, fontSize: 15, color: color.grey900, padding: '4px 2px', outline: 'none', background: 'transparent', fontFamily: 'inherit' }}
                      onFocus={e => (e.currentTarget.style.borderBottomColor = color.primary)}
                      onBlur={e => (e.currentTarget.style.borderBottomColor = color.grey300)}
                    />
                  </td>
                  {/* +Info */}
                  <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                    <button
                      aria-label="Más opciones"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', color: color.grey700, borderRadius: '50%' }}
                      onMouseEnter={e => (e.currentTarget.style.background = color.grey100)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <Icon name="more_vert" size={22} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
