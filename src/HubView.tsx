import { useState } from 'react'
import { Plus, ArrowRight, Settings } from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────

interface AgentChip {
  name:  string
  color: string
}

interface Orchestrator {
  id:          string
  name:        string
  type:        'interno' | 'externo'
  description: string
  status:      'active' | 'configuring'
  channels:    { icon: string; name: string; color: string }[]
  agents:      AgentChip[]
  events:      string[]
  avatar:      { src: string; bg: string }
}

const ORCHESTRATORS: Orchestrator[] = [
  {
    id:          'clientes',
    name:        'Ventas & Pedidos',
    type:        'externo',
    description: 'Atiende a los clientes finales: toma pedidos, informa el menú y resuelve consultas post-venta por WhatsApp e Instagram.',
    status:      'active',
    channels:    [
      { icon: '💬', name: 'WhatsApp',  color: '#25D366' },
      { icon: '📸', name: 'Instagram', color: '#E1306C' },
    ],
    agents: [
      { name: 'Toma de Pedidos',    color: '#304FFE' },
      { name: 'Menú & Promociones', color: '#0891b2' },
      { name: 'Soporte Post Venta', color: '#7c3aed' },
    ],
    events: [
      'Pedido de 2 pizzas napolitanas confirmado para Diego',
      'Consulta de horarios respondida en 2s — WhatsApp',
      'Promoción del día enviada a 34 clientes',
      'Reclamo de entrega tardía escalado a humano',
      'Pedido de empanadas procesado y enviado a cocina',
      'Cliente preguntó por delivery, respondido en 3s',
      'Pago confirmado vía MercadoPago — $6.400',
      'Menú del día enviado automáticamente a consulta entrante',
      'Nueva venta: combo familiar + 1.5L — WhatsApp local Palermo',
    ],
    avatar: { src: '/agent-avatar-nobg.png', bg: 'linear-gradient(170deg,#EEF1FF 0%,#DDE5FF 100%)' },
  },
  {
    id:          'franquiciados',
    name:        'Soporte Franquiciados',
    type:        'interno',
    description: 'Asiste a los franquiciados de la red: responde dudas operativas, onboarding de nuevos locales y entrega reportes de performance.',
    status:      'active',
    channels:    [
      { icon: '💬', name: 'WhatsApp Business', color: '#25D366' },
      { icon: '🌐', name: 'Portal Web',         color: '#304FFE' },
    ],
    agents: [
      { name: 'Consultas Operativas',    color: '#7c3aed' },
      { name: 'Onboarding Franquiciado', color: '#0891b2' },
      { name: 'Métricas & Reportes',     color: '#059669' },
    ],
    events: [
      'Local Córdoba consultó el protocolo de apertura dominical',
      'Nuevo franquiciado Mendoza — inicio de onboarding',
      'Reporte semanal de ventas enviado a 12 franquiciados',
      'Consulta sobre proveedor de mozzarella resuelta',
      'Local Rosario solicitó manual de operaciones — enviado',
      'Alerta de stock bajo notificada al franquiciado de Belgrano',
      'Onboarding completado: local Tucumán ya operativo',
    ],
    avatar: { src: '/agent-avatar-nobg.png', bg: 'linear-gradient(170deg,#f5f3ff 0%,#ede9fe 100%)' },
  },
]

// ── OrchestratorCard ──────────────────────────────────────────────────────────

const TYPE_CFG = {
  externo: { color: '#304FFE', bg: '#E8ECFF', border: '#C7D0FF' },
  interno: { color: '#7c3aed', bg: '#EDE8FF', border: '#DDD6FE' },
}

function OrchestratorCard({ orch, index }: { orch: Orchestrator; index: number }) {
  const [hov, setHov] = useState(false)
  const c = TYPE_CFG[orch.type]

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 26, background: c.bg,
        border: `1.5px solid ${hov ? c.color + '50' : c.border}`,
        overflow: 'hidden', position: 'relative',
        transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: hov ? `0 20px 56px ${c.color}18` : `0 2px 16px ${c.color}0C`,
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        animation: 'cardEntrance 0.6s ease both',
        animationDelay: `${index * 0.18}s`,
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: '28px 32px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: '0 0 5px', fontSize: 10, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: 1.6 }}>
            Orquestador
          </p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a2e', letterSpacing: -0.5 }}>{orch.name}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {orch.status === 'active' ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 100,
              background: 'rgba(240,253,244,0.9)', border: '1px solid #bbf7d0',
              fontSize: 12, fontWeight: 700, color: '#16a34a',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite', boxShadow: '0 0 5px #22c55e' }} />
              En vivo
            </span>
          ) : (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 100,
              background: 'rgba(255,251,235,0.9)', border: '1px solid #fde68a',
              fontSize: 12, fontWeight: 700, color: '#d97706',
            }}>
              <Settings size={11} /> Configurando
            </span>
          )}
          <button
            onClick={() => { window.location.href = '/proyecto' }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: 13, fontWeight: 700, color: c.color,
              fontFamily: 'Roboto, sans-serif', transition: 'opacity 0.2s, gap 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.gap = '11px' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.gap = '7px' }}
          >
            Abrir orquestador <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Body: 3 columns, robot bleeds at bottom ── */}
      <div style={{ display: 'flex', padding: '16px 32px 0', position: 'relative', height: 420 }}>

        {/* LEFT: Channels */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, paddingBottom: 40 }}>
          <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.4, textAlign: 'center' }}>Canales</p>

          {orch.channels.map((ch, i) => (
            <div key={ch.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 18px', borderRadius: 16,
              background: 'white',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              animation: 'itemSlideIn 0.5s ease both',
              animationDelay: `${index * 0.18 + i * 0.08}s`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: ch.color, fontSize: 17,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 10px ${ch.color}55`,
              }}>{ch.icon}</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{ch.name}</span>
            </div>
          ))}

          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 18px', borderRadius: 16,
            border: `1.5px dashed ${c.color}50`, background: 'rgba(255,255,255,0.6)',
            fontSize: 13, fontWeight: 600, color: c.color,
            cursor: 'pointer', fontFamily: 'Roboto, sans-serif', transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'white'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.6)'}
          >
            <Plus size={14} /> Agregar Canal
          </button>
        </div>

        {/* CENTER: Robot — huge, bottom-anchored, bleeds out */}
        <div
          onClick={() => { window.location.href = '/proyecto' }}
          style={{ flex: 1, position: 'relative', cursor: 'pointer' }}
        >
          <p style={{
            margin: 0, textAlign: 'center', paddingTop: 4,
            fontSize: 10, fontWeight: 700, color: c.color,
            textTransform: 'uppercase', letterSpacing: 1.6,
          }}>Orquestador</p>

          {/* Glow under robot */}
          <div style={{
            position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)',
            width: 320, height: 240, borderRadius: '50%',
            background: `radial-gradient(ellipse, ${c.color}1A 0%, transparent 65%)`,
            animation: 'glowPulse 4s ease-in-out infinite',
            animationDelay: `${index * 0.7}s`,
            pointerEvents: 'none',
          }} />

          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            animation: 'floatRobot 4.5s ease-in-out infinite',
            animationDelay: `${index * 0.6}s`,
            willChange: 'transform',
            filter: `drop-shadow(0 16px 40px ${c.color}40)`,
          }}>
            <svg width="160" height="160" viewBox="0 0 24 24" fill={c.color}>
              <circle cx="12" cy="12" r="2.4"/>
              <circle cx="12" cy="3.2" r="2.2"/>
              <circle cx="19.8" cy="7.6" r="2.2"/>
              <circle cx="19.8" cy="16.4" r="2.2"/>
              <circle cx="12" cy="20.8" r="2.2"/>
              <circle cx="4.2" cy="16.4" r="2.2"/>
              <circle cx="4.2" cy="7.6" r="2.2"/>
              <line x1="12" y1="9.6" x2="12" y2="5.4" stroke={c.color} strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="9.6" x2="17.9" y2="9.2" stroke={c.color} strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="13.4" x2="17.9" y2="14.8" stroke={c.color} strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="14.4" x2="12" y2="18.6" stroke={c.color} strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="13.4" x2="6.1" y2="14.8" stroke={c.color} strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="9.6" x2="6.1" y2="9.2" stroke={c.color} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* RIGHT: Agents */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, paddingBottom: 40 }}>
          <p style={{ margin: '0 0 0px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.4 }}>Agentes de IA</p>

          {orch.agents.map((a, i) => (
            <div key={a.name} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              animation: 'itemSlideInRight 0.5s ease both',
              animationDelay: `${index * 0.18 + i * 0.1}s`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: 'rgba(255,255,255,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <img src="/agent-avatar-nobg.png" alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{a.name}</span>
            </div>
          ))}

          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 18px', borderRadius: 16,
            border: `1.5px dashed ${c.color}50`, background: 'rgba(255,255,255,0.6)',
            fontSize: 13, fontWeight: 600, color: c.color,
            cursor: 'pointer', fontFamily: 'Roboto, sans-serif', transition: 'background 0.2s',
            marginTop: 4,
          }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'white'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.6)'}
          >
            <Plus size={14} /> Agregar Agente
          </button>
        </div>
      </div>
    </div>
  )
}

// ── NewOrchestratorModal ───────────────────────────────────────────────────────

const COLOR_SWATCHES = [
  { color: '#304FFE', bg: 'linear-gradient(160deg,#EEF1FF 0%,#DDE5FF 100%)' },
  { color: '#7c3aed', bg: 'linear-gradient(160deg,#f5f3ff 0%,#ede9fe 100%)' },
  { color: '#0891b2', bg: 'linear-gradient(160deg,#ecfeff 0%,#cffafe 100%)' },
  { color: '#059669', bg: 'linear-gradient(160deg,#f0fdf4 0%,#bbf7d0 100%)' },
  { color: '#d97706', bg: 'linear-gradient(160deg,#fffbeb 0%,#fde68a 100%)' },
  { color: '#e11d48', bg: 'linear-gradient(160deg,#fff1f2 0%,#fecdd3 100%)' },
]

function NewOrchestratorModal({ onClose }: { onClose: () => void }) {
  const [name, setName]   = useState('')
  const [desc, setDesc]   = useState('')
  const [color, setColor] = useState(COLOR_SWATCHES[0])
  const [done, setDone]   = useState(false)

  function handleCreate() {
    setDone(true)
    setTimeout(onClose, 2200)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(10,14,40,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 480, borderRadius: 24, overflow: 'hidden',
          background: 'white', boxShadow: '0 32px 80px rgba(48,79,254,0.22)',
          display: 'flex', flexDirection: 'column', animation: 'slideUp 0.25s ease',
        }}
      >
        {/* ── Right: form ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* form header */}
          <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid #F0F2FF' }}>
            <p style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 700, color: '#212121' }}>Nuevo orquestador</p>
            <p style={{ margin: 0, fontSize: 12, color: '#9E9E9E' }}>Big Pizza · Agents by Botmaker</p>
          </div>

          {done ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#212121' }}>¡En construcción! 🚧</p>
              <p style={{ margin: 0, fontSize: 13, color: '#757575', lineHeight: 1.6 }}>
                <strong style={{ color: '#212121' }}>{name}</strong> está siendo armado.<br />En segundos estará listo para configurar.
              </p>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Mini card preview + nombre side by side */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>

                  {/* mini card */}
                  <div style={{
                    width: 90, flexShrink: 0, borderRadius: 14,
                    background: color.bg, overflow: 'hidden',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    border: `2px solid ${color.color}30`,
                    transition: 'background 0.3s, border-color 0.3s',
                    minHeight: 80,
                  }}>
                    <img
                      src="/agent-construction.png"
                      alt=""
                      style={{ height: 76, width: 'auto', objectFit: 'contain', display: 'block' }}
                    />
                  </div>

                  {/* nombre input */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Nombre</label>
                    <input
                      autoFocus
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="ej. Ventas & Pedidos"
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        border: `1.5px solid #E6EAFF`, fontSize: 14, color: '#212121',
                        outline: 'none', fontFamily: 'Roboto, sans-serif',
                        boxSizing: 'border-box', transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.target.style.borderColor = color.color}
                      onBlur={e => e.target.style.borderColor = '#E6EAFF'}
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                    Descripción <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
                  </label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="¿Qué hace este orquestador? ¿A quién atiende?"
                    rows={4}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      border: '1.5px solid #E6EAFF', fontSize: 13, color: '#212121',
                      outline: 'none', fontFamily: 'Roboto, sans-serif', resize: 'none',
                      boxSizing: 'border-box', lineHeight: 1.6, transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.target.style.borderColor = color.color}
                    onBlur={e => e.target.style.borderColor = '#E6EAFF'}
                  />
                </div>

                {/* Color */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {COLOR_SWATCHES.map(s => (
                      <button
                        key={s.color}
                        onClick={() => setColor(s)}
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: s.color, border: 'none', cursor: 'pointer',
                          outline: color.color === s.color ? `3px solid ${s.color}` : '3px solid transparent',
                          outlineOffset: 2, transition: 'outline 0.15s, transform 0.15s',
                          transform: color.color === s.color ? 'scale(1.18)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* footer */}
              <div style={{ padding: '14px 24px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F0F2FF' }}>
                <button
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9E9E9E', padding: '8px 4px', fontFamily: 'Roboto, sans-serif' }}
                >
                  Cancelar
                </button>
                <button
                  disabled={!name.trim()}
                  onClick={handleCreate}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '10px 24px', borderRadius: 100,
                    background: name.trim() ? color.color : '#E6EAFF',
                    color: name.trim() ? 'white' : '#9E9E9E',
                    border: 'none', cursor: name.trim() ? 'pointer' : 'default',
                    fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                    fontFamily: 'Roboto, sans-serif',
                  }}
                >
                  Crear orquestador 🚀
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── HubView ────────────────────────────────────────────────────────────────────

export default function HubView() {
  const [showModal, setShowModal] = useState(false)
  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF', fontFamily: 'Roboto, sans-serif' }}>

      {/* Top bar */}
      <header style={{
        background: 'white', borderBottom: '1px solid #E2E7FF',
        padding: '0 40px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: '0 1px 4px rgba(48,79,254,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Hamburger */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            flexShrink: 0,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ display: 'block', width: 18, height: 2, background: '#304FFE', borderRadius: 2 }} />
            ))}
          </button>

          {/* Big Pizza breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo-bigpizza.jpeg" alt="Big Pizza" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#212121' }}>Big Pizza</span>
            <span style={{ fontSize: 13, color: '#E0E0E0' }}>/</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                background: 'linear-gradient(135deg, #304FFE 0%, #7C5CFC 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: 'white',
              }}>A</div>
              <span style={{ fontSize: 13, color: '#757575' }}>Agents by Botmaker</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 100,
            background: '#304FFE', color: 'white', border: 'none',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          Nuevo orquestador
        </button>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#212121' }}>Orquestadores</h1>
              <p style={{ margin: 0, fontSize: 13, color: '#757575', lineHeight: 1.6, maxWidth: 460 }}>
                Cada orquestador gestiona agentes especializados para atender tus canales, activar el agente correcto y escalar a un humano cuando es necesario.
              </p>
            </div>
          </div>

          {/* Metrics row */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { value: '2',   label: 'Orquestadores activos', color: '#212121' },
              { value: '6',   label: 'Agentes',         color: '#212121' },
              { value: '247', label: 'Mensajes hoy',          color: '#304FFE' },
            ].map(m => (
              <div key={m.label} style={{
                flex: 1, background: 'white', borderRadius: 14,
                border: '1px solid #ECEEFF', padding: '14px 18px',
                boxShadow: '0 2px 8px rgba(48,79,254,0.04)',
              }}>
                <p style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 700, color: m.color }}>{m.value}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#9E9E9E' }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Orchestrator cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {ORCHESTRATORS.map((o, i) => (
            <OrchestratorCard key={o.id} orch={o} index={i} />
          ))}
        </div>

      </main>

      {showModal && <NewOrchestratorModal onClose={() => setShowModal(false)} />}

      <style>{`
        @keyframes pulse            { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes slideUp          { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
        @keyframes floatRobot       { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
        @keyframes glowPulse        { 0%,100%{opacity:0.6;transform:scale(1);} 50%{opacity:1;transform:scale(1.15);} }
        @keyframes cardEntrance     { from{opacity:0;transform:translateY(22px);} to{opacity:1;transform:translateY(0);} }
        @keyframes itemSlideIn      { from{opacity:0;transform:translateX(-14px);} to{opacity:1;transform:translateX(0);} }
        @keyframes itemSlideInRight { from{opacity:0;transform:translateX(14px);}  to{opacity:1;transform:translateX(0);} }
      `}</style>
    </div>
  )
}
