import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Zap, X, Play, Check, Pencil, ChevronDown, Bot, Plug, Sliders, AlertTriangle, Pencil as PencilIcon, PlusCircle, MinusCircle, RotateCcw, History } from 'lucide-react'
import OrchestratorTestChat from './components/OrchestratorTestChat'
import Icon from './Icon'
import { color, spacing, radius } from './ds'

// ── Types ──────────────────────────────────────────────────────────────────────

type AgentStatus = 'active' | 'inactive' | 'configuring' | 'building'

// ── Mock data ──────────────────────────────────────────────────────────────────

const PROJECT = {
  name: 'Big Pizza',
  emoji: '🍕',
  owner: 'Lucía Fernández',
  ownerRole: 'directora de operaciones',
  orchestratorName: 'Ventas & Pedidos',
}

interface Channel { id: string; name: string; icon: string }
interface Agent   { id: string; name: string; color: string; icon: string; status: AgentStatus; description: string; connected: boolean }

const INITIAL_CHANNELS: Channel[] = [
  { id: 'wa',  name: 'WhatsApp',  icon: '💬' },
  { id: 'ig',  name: 'Instagram', icon: '📸' },
]

const AVAILABLE_CHANNELS: Channel[] = [
  { id: 'web',      name: 'Web Chat',  icon: '🌐' },
  { id: 'telegram', name: 'Telegram',  icon: '✈️' },
  { id: 'slack',    name: 'Slack',     icon: '💼' },
  { id: 'email',    name: 'Email',     icon: '📧' },
]

const INITIAL_AGENTS: Agent[] = [
  { id: 'a1', name: 'Toma de Pedidos',    color: '#304FFE', icon: 'cart',       status: 'active',      description: 'Gestiona pedidos de punta a punta',        connected: true },
  { id: 'a2', name: 'Soporte al Cliente', color: '#7c3aed', icon: 'headphones', status: 'active',      description: 'Responde consultas frecuentes del negocio', connected: true },
  { id: 'a3', name: 'Menú & Promociones', color: '#0891b2', icon: 'megaphone',  status: 'configuring', description: 'Informa el menú del día y promociones',     connected: true },
]

const INITIAL_TRIGGERS = [
  { id: 't1', name: 'Envío de menú diario',       schedule: 'Todos los días a las 12:00pm', active: true  },
  { id: 't2', name: 'Reporte semanal de pedidos', schedule: 'Lunes a las 9:00am',           active: true  },
  { id: 't3', name: 'Alerta de stock bajo',        schedule: 'Cuando stock < 10 unidades',   active: false },
]

const INITIAL_RESTRICTIONS = [
  'No dar precios sin verificar la lista actualizada',
  'No prometer tiempos de entrega menores a 30 minutos',
  'Escalar a humano si el cliente menciona una queja grave',
  'No aceptar pedidos fuera del horario de atención',
]

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<AgentStatus, { label: string; bg: string; border: string; color: string; dot?: string; pulse?: boolean }> = {
  active:      { label: 'Activo',        bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a', dot: '#22c55e', pulse: true  },
  inactive:    { label: 'Inactivo',      bg: '#f8fafc', border: '#e2e8f0', color: '#757575', dot: '#94a3b8'               },
  configuring: { label: 'Configurando',  bg: '#fffbeb', border: '#fde68a', color: '#d97706', dot: '#fbbf24'               },
  building:    { label: 'En construcción', bg: '#faf5ff', border: '#e9d5ff', color: '#7c3aed', dot: '#a78bfa'             },
}

function StatusChip({ status }: { status: AgentStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      background: c.bg, border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 600, color: c.color,
    }}>
      {c.dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: c.dot,
          display: 'inline-block',
          animation: c.pulse ? 'pulse 2s infinite' : undefined,
        }} />
      )}
      {c.label}
    </span>
  )
}

// ── Principal Tab ──────────────────────────────────────────────────────────────

// ── Version data ───────────────────────────────────────────────────────────────

const AGENT_VERSIONS: Record<string, { id: string; label: string; date: string; note: string }[]> = {
  a1: [
    { id: 'latest', label: 'v3 — latest', date: 'Hoy, 14:32',   note: 'Mejora en el flujo de confirmación' },
    { id: 'v2',     label: 'v2',          date: 'Hace 3 días',  note: 'Soporte para pagos con QR' },
    { id: 'v1',     label: 'v1',          date: 'Hace 2 sem.',  note: 'Versión inicial' },
  ],
  a2: [
    { id: 'latest', label: 'v2 — latest', date: 'Ayer, 10:15',  note: 'Nuevo tono más amigable' },
    { id: 'v1',     label: 'v1',          date: 'Hace 1 sem.',  note: 'Versión inicial' },
  ],
  a3: [
    { id: 'latest', label: 'v4 — latest', date: 'Hace 2 horas', note: 'Promos de temporada agregadas' },
    { id: 'v3',     label: 'v3',          date: 'Hace 5 días',  note: 'Rediseño del menú visual' },
    { id: 'v2',     label: 'v2',          date: 'Hace 2 sem.',  note: 'Soporte horario nocturno' },
    { id: 'v1',     label: 'v1',          date: 'Hace 1 mes',   note: 'Versión inicial' },
  ],
}

// ── Version selector ────────────────────────────────────────────────────────────

function VersionSelector({ agentId }: { agentId: string }) {
  const versions = AGENT_VERSIONS[agentId] ?? [{ id: 'latest', label: 'v1 — latest', date: 'Hoy', note: '' }]
  const [selected, setSelected] = useState(versions[0].id)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = versions.find(v => v.id === selected) ?? versions[0]
  const isLatest = selected === versions[0].id

  return (
    <div ref={ref} style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: 100,
          background: isLatest ? '#EEF1FF' : '#FFF8E7',
          border: `1px solid ${isLatest ? '#C7D0FF' : '#FDE68A'}`,
          fontSize: 10, fontWeight: 600,
          color: isLatest ? '#304FFE' : '#B45309',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {current.label}
        <ChevronDown size={10} style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
          background: 'white', borderRadius: 12, border: '1px solid #E2E7FF',
          boxShadow: '0 8px 24px rgba(48,79,254,0.12)', overflow: 'hidden',
          minWidth: 200,
        }}>
          <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid #F0F2FF' }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Versión activa
            </p>
          </div>
          {versions.map((v, i) => {
            const isSel = v.id === selected
            const isFirst = i === 0
            return (
              <button
                key={v.id}
                onClick={() => { setSelected(v.id); setOpen(false) }}
                style={{
                  width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  padding: '9px 12px', border: 'none', background: isSel ? '#F5F7FF' : 'white',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                  borderLeft: isSel ? '3px solid #304FFE' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#FAFBFF' }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'white' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isSel ? '#304FFE' : '#212121' }}>
                    {isFirst ? v.label.replace(' — latest', '') : v.label}
                  </span>
                  {isFirst && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100,
                      background: '#304FFE', color: 'white',
                    }}>latest</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#9E9E9E' }}>{v.date}</span>
                  {v.note && <span style={{ fontSize: 10, color: '#BDBDBD' }}>· {v.note}</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Routing diagram ────────────────────────────────────────────────────────────

function AnimatedLine({ delay = 0 }: { delay?: number }) {
  return (
    <div style={{ position: 'relative', flex: 1, height: 2, overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(90deg,#304FFE 0,#304FFE 5px,transparent 5px,transparent 11px)', opacity: 0.25 }} />
      <div style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        width: 8, height: 8, borderRadius: '50%', background: '#304FFE',
        animation: `flowDot 1.8s ${delay}s linear infinite`,
        boxShadow: '0 0 6px #304FFE88',
      }} />
    </div>
  )
}

function PrincipalTab() {
  const [channels, setChannels]           = useState(INITIAL_CHANNELS)
  const [agents, setAgents]               = useState(INITIAL_AGENTS.filter(a => a.connected))
  const [showChannelPicker, setShowChannelPicker] = useState(false)

  const availableToAdd = AVAILABLE_CHANNELS.filter(c => !channels.find(ch => ch.id === c.id))
  const removeChannel  = (id: string) => setChannels(prev => prev.filter(c => c.id !== id))
  const addChannel     = (c: Channel) => { setChannels(prev => [...prev, c]); setShowChannelPicker(false) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Routing diagram ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>

          {/* Left: Channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 154, flexShrink: 0 }}>
            {channels.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 12px', borderRadius: 12,
                background: '#F0F4FF', border: '1px solid #DDE5FF',
                fontSize: 12, fontWeight: 600, color: '#304FFE',
              }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>{c.icon}</span>
                <span style={{ flex: 1 }}>{c.name}</span>
                <button
                  onClick={() => removeChannel(c.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a5b4fc', padding: 0, display: 'flex', opacity: 0.6 }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#f87171' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.color = '#a5b4fc' }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}

            {/* Add channel */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowChannelPicker(v => !v)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, width: '100%',
                  padding: '8px 12px', borderRadius: 12,
                  border: '1px dashed #C7D0FF', background: 'transparent',
                  fontSize: 12, fontWeight: 500, color: '#304FFE', cursor: 'pointer',
                }}
              >
                <Plus size={12} /> Canal
              </button>
              {showChannelPicker && availableToAdd.length > 0 && (
                <div style={{
                  position: 'absolute', top: '110%', left: 0, zIndex: 20,
                  background: 'white', borderRadius: 10, border: '1px solid #E2E7FF',
                  boxShadow: '0 8px 24px rgba(48,79,254,0.12)', overflow: 'hidden', minWidth: 160,
                }}>
                  {availableToAdd.map(c => (
                    <button key={c.id} onClick={() => addChannel(c)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '9px 14px', border: 'none', background: 'transparent',
                      fontSize: 13, color: '#424242', cursor: 'pointer', textAlign: 'left',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F0F2FF')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Connector: channels → orchestrator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 56, flexShrink: 0, paddingTop: channels.length > 1 ? 0 : 0 }}>
            {channels.map((_, i) => (
              <div key={i} style={{ height: 38, display: 'flex', alignItems: 'center', paddingLeft: 6, paddingRight: 6 }}>
                <AnimatedLine delay={i * 0.4} />
              </div>
            ))}
          </div>

          {/* Orchestrator brain node */}
          <div style={{
            width: 130, flexShrink: 0,
            background: 'white',
            borderRadius: 18, padding: '20px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            boxShadow: '0 2px 16px rgba(48,79,254,0.10)',
            border: '1.5px solid #E2E7FF',
            position: 'relative',
          }}>
            {/* Pulse ring */}
            <div style={{
              position: 'absolute', inset: -4, borderRadius: 22,
              border: '2px solid #304FFE',
              animation: 'orchPulse 2.5s ease-in-out infinite',
              opacity: 0,
            }} />
            <svg width="44" height="44" viewBox="0 0 24 24" fill="#304FFE">
              <circle cx="12" cy="12" r="2.2"/>
              <circle cx="12" cy="3.5" r="2"/>
              <circle cx="19.5" cy="7.5" r="2"/>
              <circle cx="19.5" cy="16.5" r="2"/>
              <circle cx="12" cy="20.5" r="2"/>
              <circle cx="4.5" cy="16.5" r="2"/>
              <circle cx="4.5" cy="7.5" r="2"/>
              <line x1="12" y1="10" x2="12" y2="5.5" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="12" y1="10" x2="17.9" y2="9" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="12" y1="13" x2="17.9" y2="15" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="12" y1="14" x2="12" y2="18.5" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="12" y1="13" x2="6.1" y2="15" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="12" y1="10" x2="6.1" y2="9" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#304FFE', lineHeight: 1.2 }}>{PROJECT.orchestratorName}</p>
              <p style={{ margin: '4px 0 0', fontSize: 9, fontWeight: 600, color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 0.8 }}>Orquestador</p>
            </div>
          </div>

          {/* Connector: orchestrator → agents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 56, flexShrink: 0 }}>
            {agents.map((_, i) => (
              <div key={i} style={{ height: 60, display: 'flex', alignItems: 'center', paddingLeft: 6, paddingRight: 6 }}>
                <AnimatedLine delay={i * 0.3 + 0.2} />
              </div>
            ))}
          </div>

          {/* Right: Agents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
            {agents.map(a => (
              <div
                key={a.id}
                onClick={() => { window.location.href = '/flow-test-agent' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 14,
                  background: '#FAFBFF', border: '1px solid #ECEEFF',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ADB8FF'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(48,79,254,0.10)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#ECEEFF'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: '#E8EEFF', border: '1px solid #D0D8FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src="/avatar-ai.svg" style={{ width: 20, height: 20, filter: 'brightness(0) saturate(100%) invert(23%) sepia(93%) saturate(7484%) hue-rotate(234deg) brightness(101%) contrast(101%)' }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                    <VersionSelector agentId={a.id} />
                  </div>
                  <p style={{ margin: 0, fontSize: 10, color: '#9E9E9E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description}</p>
                </div>
              </div>
            ))}

            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 14px', borderRadius: 100,
              border: '1px dashed #C7D0FF', background: 'transparent',
              fontSize: 12, fontWeight: 500, color: '#304FFE', cursor: 'pointer',
            }}>
              <Plus size={12} /> Agregar agente
            </button>
          </div>
      </div>

    </div>
  )
}

// ── Triggers Tab ───────────────────────────────────────────────────────────────

function TriggersTab() {
  const [triggers, setTriggers] = useState(INITIAL_TRIGGERS)
  const toggle = (id: string) => setTriggers(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {triggers.map(t => (
        <div key={t.id} style={{
          background: 'white', borderRadius: 14, border: '1px solid #ECEEFF',
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
          opacity: t.active ? 1 : 0.5, transition: 'opacity 0.2s',
        }}>
          <Zap size={16} style={{ color: t.active ? '#304FFE' : '#94a3b8', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#212121' }}>{t.name}</p>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9E9E9E' }}>{t.schedule}</p>
          </div>
          <button onClick={() => toggle(t.id)} style={{
            width: 40, height: 22, borderRadius: 11,
            background: t.active ? '#304FFE' : '#e2e8f0',
            border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          }}>
            <span style={{
              position: 'absolute', top: 3, left: t.active ? 21 : 3,
              width: 16, height: 16, borderRadius: '50%', background: 'white',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
      ))}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 100,
        border: '1px dashed #C7D0FF', background: 'transparent',
        fontSize: 13, fontWeight: 500, color: '#304FFE', cursor: 'pointer',
      }}>
        <Plus size={14} /> Nuevo trigger
      </button>
    </div>
  )
}

// ── Tono Tab ───────────────────────────────────────────────────────────────────

function TonoTab() {
  const [prompt, setPrompt] = useState(
    'Sos un asistente amable y eficiente de Bella Italia, una pizzería familiar italiana. Hablás en español rioplatense, de manera cálida pero profesional. Tu objetivo es ayudar a los clientes a hacer sus pedidos de forma rápida y agradable.'
  )

  return (
    <textarea
      value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
      style={{
        width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10,
        border: '1px solid #E2E7FF', background: '#FAFBFF', fontSize: 13, color: '#424242',
        lineHeight: 1.6, resize: 'vertical', fontFamily: 'Roboto, sans-serif', outline: 'none',
      }}
      onFocus={e => (e.target.style.borderColor = '#304FFE')}
      onBlur={e => (e.target.style.borderColor = '#E2E7FF')}
    />
  )
}

// ── Restricciones Tab ──────────────────────────────────────────────────────────

function RestriccionesTab() {
  const [items, setItems] = useState(INITIAL_RESTRICTIONS)
  const [newItem, setNewItem] = useState('')
  const add = () => { if (!newItem.trim()) return; setItems(p => [...p, newItem.trim()]); setNewItem('') }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'white', borderRadius: 12, border: '1px solid #ECEEFF', padding: '12px 16px',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, color: '#424242' }}>{item}</span>
          <button onClick={() => setItems(p => p.filter((_, j) => j !== i))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 4, display: 'flex' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10 }}>
        <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Agregar restricción..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E7FF',
            background: 'white', fontSize: 13, color: '#424242', outline: 'none', fontFamily: 'Roboto, sans-serif',
          }}
          onFocus={e => (e.target.style.borderColor = '#304FFE')}
          onBlur={e => (e.target.style.borderColor = '#E2E7FF')}
        />
        <button onClick={add} style={{
          padding: '10px 18px', borderRadius: 100, background: '#304FFE',
          border: 'none', fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer',
        }}>Agregar</button>
      </div>
    </div>
  )
}

// ── Publish system ─────────────────────────────────────────────────────────────

type ChangeType = 'added' | 'modified' | 'removed'

interface PendingChange {
  type: ChangeType
  label: string
  author: string
  authorInitials: string
  authorColor: string
  time: string
}

interface ChangeGroup {
  category: string
  Icon: React.ElementType
  items: PendingChange[]
}

const PENDING_CHANGES: ChangeGroup[] = [
  {
    category: 'Agentes', Icon: Bot,
    items: [
      { type: 'modified', label: '"Toma de Pedidos" — instrucciones actualizadas', author: 'Lucía F.',   authorInitials: 'LF', authorColor: '#7c3aed', time: 'hace 2h'  },
      { type: 'added',    label: '"Soporte Nocturno" — agente nuevo',              author: 'Matías R.',  authorInitials: 'MR', authorColor: '#0891b2', time: 'hace 45m' },
    ],
  },
  {
    category: 'Canales', Icon: Plug,
    items: [
      { type: 'added',    label: 'Instagram — canal conectado',                    author: 'Gonzalo P.', authorInitials: 'GP', authorColor: '#304FFE', time: 'hace 1h'  },
    ],
  },
  {
    category: 'Orquestador', Icon: Sliders,
    items: [
      { type: 'modified', label: 'Prompt del orquestador modificado',              author: 'Lucía F.',   authorInitials: 'LF', authorColor: '#7c3aed', time: 'hace 3h'  },
    ],
  },
]

const CHANGE_CFG: Record<ChangeType, { color: string; bg: string; label: string }> = {
  added:    { color: '#16a34a', bg: '#f0fdf4', label: 'Nuevo'      },
  modified: { color: '#d97706', bg: '#fffbeb', label: 'Modificado' },
  removed:  { color: '#dc2626', bg: '#fef2f2', label: 'Eliminado'  },
}

const totalChanges = PENDING_CHANGES.reduce((sum, g) => sum + g.items.length, 0)
const uniqueAuthors = [...new Set(PENDING_CHANGES.flatMap(g => g.items.map(i => i.author)))]

// ── PublishModal ────────────────────────────────────────────────────────────────

function PublishModal({ onClose, onPublish }: { onClose: () => void; onPublish: (name: string, desc: string) => void }) {
  const [versionName, setVersionName] = useState('')
  const [description, setDescription] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(PENDING_CHANGES.map(g => g.category))
  )
  const toggleGroup = (cat: string) =>
    setExpandedGroups(prev => { const s = new Set(prev); s.has(cat) ? s.delete(cat) : s.add(cat); return s })

  const today = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 560, background: 'white', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '90vh' }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '24px 24px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Publicar cambios</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              {/* Author avatars */}
              <div style={{ display: 'flex' }}>
                {uniqueAuthors.map((a, i) => {
                  const item = PENDING_CHANGES.flatMap(g => g.items).find(it => it.author === a)!
                  return (
                    <div key={a} title={a} style={{
                      width: 22, height: 22, borderRadius: '50%', border: '2px solid white',
                      background: item.authorColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, fontWeight: 700, color: 'white', marginLeft: i > 0 ? -6 : 0, flexShrink: 0,
                    }}>
                      {item.authorInitials}
                    </div>
                  )
                })}
              </div>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                {totalChanges} {totalChanges === 1 ? 'cambio' : 'cambios'} · {uniqueAuthors.length} {uniqueAuthors.length === 1 ? 'colaborador' : 'colaboradores'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, display: 'flex' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>

          {/* Version name */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Nombre de versión <span style={{ fontWeight: 400, color: '#94a3b8' }}>(opcional)</span>
            </label>
            <input
              value={versionName}
              onChange={e => setVersionName(e.target.value)}
              placeholder={`ej: v5 · ${today} — Soporte nocturno + Instagram`}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #e2e8f0', fontSize: 13, color: '#374151',
                outline: 'none', fontFamily: 'Roboto, sans-serif', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#304FFE')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Descripción <span style={{ fontWeight: 400, color: '#94a3b8' }}>(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describí qué cambia en esta versión y por qué. Útil para el equipo al revisar el historial."
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #e2e8f0', fontSize: 13, color: '#374151', lineHeight: 1.6,
                outline: 'none', resize: 'vertical', fontFamily: 'Roboto, sans-serif', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#304FFE')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* Change list */}
          <div>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#374151' }}>Cambios incluidos</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PENDING_CHANGES.map(group => {
                const expanded = expandedGroups.has(group.category)
                const GroupIcon = group.Icon
                return (
                  <div key={group.category} style={{ border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
                    {/* Group row */}
                    <button
                      onClick={() => toggleGroup(group.category)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: 'none', background: '#fafafa', cursor: 'pointer', textAlign: 'left' }}
                    >
                      {group.category === 'Agentes'
                        ? <img src="/ai-agent-icon.png" style={{ width: 14, height: 14, objectFit: 'contain', flexShrink: 0 }} />
                        : <GroupIcon size={13} color="#64748b" />
                      }
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#374151' }}>{group.category}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', marginRight: 4 }}>{group.items.length}</span>
                      <ChevronDown size={12} color="#94a3b8" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                    </button>

                    {expanded && group.items.map((item, i) => {
                      const cfg = CHANGE_CFG[item.type]
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderTop: '1px solid #f8fafc', background: 'white' }}>
                          {/* Type chip */}
                          <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '2px 7px', borderRadius: 100, flexShrink: 0 }}>
                            {cfg.label}
                          </span>
                          {/* Label */}
                          <span style={{ flex: 1, fontSize: 12, color: '#374151' }}>{item.label}</span>
                          {/* Author + time */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%', background: item.authorColor,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 7, fontWeight: 700, color: 'white',
                            }}>{item.authorInitials}</div>
                            <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{item.author} · {item.time}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Impact warning */}
          <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a' }}>
            <AlertTriangle size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
              Esto afectará las <strong>nuevas conversaciones</strong> en WhatsApp e Instagram.
              Las conversaciones activas terminarán con la versión actual.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: 100, border: '1px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
          >
            Cancelar
          </button>
          <button
            onClick={() => onPublish(versionName, description)}
            style={{
              padding: '8px 22px', borderRadius: 100, border: 'none',
              background: '#ea580c', fontSize: 13, fontWeight: 700, color: 'white',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(234,88,12,0.30)',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Publicar ahora
          </button>
        </div>
      </div>
    </div>
  )
}

// ── PublishToast ────────────────────────────────────────────────────────────────

function PublishToast({ onUndo, onDismiss }: { onUndo: () => void; onDismiss: () => void }) {
  const [seconds, setSeconds] = useState(10)
  useEffect(() => {
    const iv = setInterval(() => setSeconds(s => {
      if (s <= 1) { clearInterval(iv); onDismiss(); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(iv)
  }, [onDismiss])

  const pct = (seconds / 10) * 100

  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, background: '#0f172a', borderRadius: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', minWidth: 340,
      animation: 'slideUpToast 0.25s ease',
    }}>
      {/* Progress ring */}
      <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
        <svg width="28" height="28" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="14" cy="14" r="11" fill="none" stroke="#334155" strokeWidth="2.5" />
          <circle cx="14" cy="14" r="11" fill="none" stroke="#22c55e" strokeWidth="2.5"
            strokeDasharray={`${2 * Math.PI * 11}`}
            strokeDashoffset={`${2 * Math.PI * 11 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: '#94a3b8',
        }}>{seconds}</span>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'white' }}>Cambios publicados</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>Los usuarios ven la nueva versión</p>
      </div>

      <button
        onClick={onUndo}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 8,
          border: '1px solid #334155', background: 'transparent',
          fontSize: 12, fontWeight: 600, color: '#e2e8f0', cursor: 'pointer',
          transition: 'all 0.12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.borderColor = '#475569' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#334155' }}
      >
        <RotateCcw size={11} /> Deshacer
      </button>
    </div>
  )
}

// ── SectionTitle ───────────────────────────────────────────────────────────────

function SectionTitle({ children, description }: { children: React.ReactNode; description?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 1 }}>
        {children}
      </h2>
      {description && (
        <p style={{ margin: '5px 0 0', fontSize: 13, color: '#757575', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
    </div>
  )
}

// ── Published Versions Panel ───────────────────────────────────────────────────

interface PublishedVersion {
  id: string; version: string; name: string | null
  date: string; author: string; authorInitials: string; authorColor: string
  isLive: boolean; changes: number
}

const PUBLISHED_VERSIONS_DATA: PublishedVersion[] = [
  { id: 'pub5', version: 'v5', name: 'Soporte nocturno + Instagram', date: '31 mar, 14:32', author: 'Lucía F.',   authorInitials: 'LF', authorColor: '#7c3aed', isLive: true,  changes: 4 },
  { id: 'pub4', version: 'v4', name: null,                           date: '28 mar, 11:20', author: 'Matías R.', authorInitials: 'MR', authorColor: '#0891b2', isLive: false, changes: 2 },
  { id: 'pub3', version: 'v3', name: 'Ajuste de tono',              date: '25 mar, 09:05', author: 'Lucía F.',   authorInitials: 'LF', authorColor: '#7c3aed', isLive: false, changes: 1 },
  { id: 'pub2', version: 'v2', name: 'Canal WhatsApp Business',     date: '18 mar, 16:44', author: 'Gonzalo P.', authorInitials: 'GP', authorColor: '#304FFE', isLive: false, changes: 3 },
  { id: 'pub1', version: 'v1', name: 'Lanzamiento inicial',         date: '10 mar, 10:00', author: 'Gonzalo P.', authorInitials: 'GP', authorColor: '#304FFE', isLive: false, changes: 7 },
]

function PublishedVersionsPanel({ onClose }: { onClose: () => void }) {
  const [versions, setVersions] = useState<PublishedVersion[]>(PUBLISHED_VERSIONS_DATA)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [restoredId, setRestoredId] = useState<string | null>(null)

  const handleRollback = (id: string) => {
    setVersions(prev => prev.map(v => ({ ...v, isLive: v.id === id })))
    setRestoredId(id)
    setTimeout(() => setRestoredId(null), 2500)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
      background: 'white', boxShadow: '-2px 0 24px rgba(0,0,0,0.12)',
      zIndex: 50, display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.22s ease',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Versiones publicadas</p>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>
            {versions.length} versiones · solo afectan conversaciones nuevas
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, display: 'flex', marginTop: 2 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          <X size={18} />
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {versions.map((v, idx) => {
          const isLast = idx === versions.length - 1
          const isHovered = hoveredId === v.id
          return (
            <div
              key={v.id}
              onMouseEnter={() => setHoveredId(v.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ display: 'flex', padding: '0 20px', background: isHovered && !v.isLive ? '#fafafa' : 'transparent', transition: 'background 0.12s' }}
            >
              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 14, paddingTop: 20 }}>
                <div style={{
                  width: v.isLive ? 13 : 9, height: v.isLive ? 13 : 9,
                  borderRadius: '50%', flexShrink: 0,
                  background: v.isLive ? '#16a34a' : '#d1d5db',
                  boxShadow: v.isLive ? '0 0 0 3px #dcfce780' : 'none',
                }} />
                {!isLast && <div style={{ width: 1.5, flex: 1, background: '#e2e8f0', minHeight: 20, marginTop: 5 }} />}
              </div>

              {/* Content */}
              <div style={{ flex: 1, padding: '14px 0 16px', borderBottom: isLast ? 'none' : '1px solid #f8fafc' }}>
                {/* Row 1: tag + name + badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: v.isLive ? '#16a34a' : '#475569',
                    background: v.isLive ? '#f0fdf4' : '#f1f5f9',
                    border: `1px solid ${v.isLive ? '#bbf7d0' : '#e2e8f0'}`,
                    padding: '1px 8px', borderRadius: 100, flexShrink: 0,
                  }}>{v.version}</span>
                  {v.name && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', flex: 1, minWidth: 0 }}>{v.name}</span>
                  )}
                  {v.isLive && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 9px', borderRadius: 100, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                      En vivo
                    </span>
                  )}
                  {restoredId === v.id && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '2px 9px', borderRadius: 100, flexShrink: 0 }}>
                      ✓ Restaurada
                    </span>
                  )}
                </div>
                {/* Row 2: date + author + changes */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{v.date}</span>
                  <span style={{ fontSize: 12, color: '#cbd5e1' }}>·</span>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: v.authorColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {v.authorInitials}
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{v.author}</span>
                  <span style={{ fontSize: 12, color: '#cbd5e1' }}>·</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{v.changes} {v.changes === 1 ? 'cambio' : 'cambios'}</span>
                </div>
                {/* Rollback button on hover */}
                {!v.isLive && isHovered && (
                  <button
                    onClick={() => handleRollback(v.id)}
                    style={{
                      marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', borderRadius: 8,
                      border: '1.5px solid #e2e8f0', background: 'white',
                      fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#304FFE'; e.currentTarget.style.color = '#304FFE' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151' }}
                  >
                    <RotateCcw size={11} /> Restaurar esta versión
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── AI Model selector (same catalogue as ConfiguracionTab in AgentDetail) ──────

interface LLM { id: string; name: string; provider: 'Anthropic' | 'OpenAI' | 'Google'; features: string[]; recommendation?: string; costPer1M: number; recommended?: boolean }

const ORCH_LLMS: LLM[] = [
  { id: 'claude-sonnet-4-7', name: 'Claude Sonnet 4.7', provider: 'Anthropic', features: ['Razonamiento balanceado', 'Análisis de código y texto largo'], recommendation: 'Mejor relación entre calidad, latencia y costo.', costPer1M: 3.0, recommended: true },
  { id: 'claude-haiku-4-5',  name: 'Claude Haiku 4.5',  provider: 'Anthropic', features: ['Latencia ultra baja', 'Ideal para flujos simples y alto volumen'], recommendation: 'Optimizado para velocidad sobre profundidad.', costPer1M: 1.0 },
  { id: 'gpt-5',             name: 'GPT-5',             provider: 'OpenAI',    features: ['Razonamiento profundo', 'Comprensión de instrucciones complejas'], recommendation: 'Prioridad en calidad de respuesta con coste mayor.', costPer1M: 5.0 },
  { id: 'gemini-2-5-pro',    name: 'Gemini 2.5 Pro',    provider: 'Google',    features: ['Multimodal nativo', 'Imágenes, audio y documentos largos'], recommendation: 'Para casos con inputs no textuales.', costPer1M: 4.0 },
]

const PROVIDER_BG: Record<string, string> = { Anthropic: '#FFF7ED', OpenAI: '#F8FAFC', Google: '#F5F3FF' }

function ProviderIcon({ provider, size = 20 }: { provider: string; size?: number }) {
  if (provider === 'Anthropic') return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" style={{ display: 'block' }}>
      {[0, 45, 90, 135].map(a => <rect key={a} x="-1" y="-10" width="2" height="20" rx="1" fill="#D97706" transform={`rotate(${a})`} />)}
    </svg>
  )
  if (provider === 'OpenAI') return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }} fill="none" stroke="#000" strokeWidth="2">
      <ellipse cx="12" cy="12" rx="9" ry="4" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)" />
    </svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
      <defs><linearGradient id="orchGemGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4285F4" /><stop offset="0.5" stopColor="#7B61FF" /><stop offset="1" stopColor="#9333EA" /></linearGradient></defs>
      <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" fill="url(#orchGemGrad)" />
    </svg>
  )
}

function OrchestratorModelCard({ llm, selected, onSelect }: { llm: LLM; selected: boolean; onSelect: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onSelect} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 14,
      width: '100%', height: '100%', minWidth: 0, textAlign: 'left', padding: '18px 18px 14px',
      borderRadius: radius.lg, border: `1.5px solid ${selected ? color.primary : color.borderDefault}`,
      background: selected ? color.primaryUltraLight : (hov ? color.grey50 : 'white'),
      cursor: 'pointer', transition: 'all 0.12s',
    }}>
      {llm.recommended && (
        <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', padding: '3px 10px', borderRadius: 100, lineHeight: 1.4, background: color.primary, color: 'white' }}>
          Recomendado
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: PROVIDER_BG[llm.provider] ?? '#F8FAFC', border: `1px solid ${color.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ProviderIcon provider={llm.provider} size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: color.grey900, lineHeight: 1.2 }}>{llm.name}</div>
          <div style={{ fontSize: 11.5, color: color.grey500, marginTop: 2 }}>by {llm.provider}</div>
        </div>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {llm.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: color.primaryUltraLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={11} color={color.primary} />
            </span>
            <span style={{ fontSize: 12, color: color.grey700, lineHeight: 1.4 }}>{f}</span>
          </li>
        ))}
      </ul>
      {llm.recommendation && (
        <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: color.primary, lineHeight: 1.45, textAlign: 'center' }}>{llm.recommendation}</p>
      )}
      <div style={{ paddingTop: 10, borderTop: `1px solid ${color.borderSubtle}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11.5, color: color.grey500 }}>Costo</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: color.primary, lineHeight: 1.1 }}>US$ {llm.costPer1M.toFixed(2).replace('.', ',')}</div>
          <div style={{ fontSize: 10, color: color.grey500, marginTop: 2 }}>por 1 millón de tokens</div>
        </div>
      </div>
    </button>
  )
}

// ── ProjectView ────────────────────────────────────────────────────────────────

interface ProjectViewProps {
  // When `true`, ProjectView is rendered inside another shell (e.g. AgentsShell).
  // Skips its own sticky header and lets the parent provide chrome.
  embedded?: boolean
}

export default function ProjectView({ embedded = false }: ProjectViewProps = {}) {
  const [testOpen,        setTestOpen]        = useState(false)
  const [versionsOpen,    setVersionsOpen]    = useState(false)
  const [orchActive,      setOrchActive]      = useState(true)
  const [hasPending,      setHasPending]      = useState(true)   // mock: always starts with pending
  const [modalOpen,       setModalOpen]       = useState(false)
  const [orchModelId,     setOrchModelId]     = useState('claude-sonnet-4-7')
  const [toastVisible,    setToastVisible]    = useState(false)
  const [isUpToDate,      setIsUpToDate]      = useState(false)

  const handlePublish = (note: string) => {
    console.log('Publishing with note:', note)
    setModalOpen(false)
    setHasPending(false)
    setIsUpToDate(true)
    setToastVisible(true)
  }

  const handleUndo = () => {
    setToastVisible(false)
    setHasPending(true)
    setIsUpToDate(false)
  }

  const handleToastDismiss = () => setToastVisible(false)

  return (
    <div style={
      embedded
        ? { height: '100%', overflowY: 'auto', overflowX: 'hidden', background: '#F5F7FF', fontFamily: 'Roboto, sans-serif' }
        : { minHeight: '100vh', background: '#F5F7FF', fontFamily: 'Roboto, sans-serif' }
    }>

      {/* Header — skipped when embedded; the host shell provides one */}
      {!embedded && (
      <header style={{
        background: 'white', borderBottom: '1px solid #E2E7FF', padding: '0 32px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 4px rgba(48,79,254,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Hamburger */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ display: 'block', width: 18, height: 2, background: '#304FFE', borderRadius: 2 }} />
            ))}
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => { window.location.href = '/' }} style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none',
              border: 'none', cursor: 'pointer', padding: 0,
            }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, overflow: 'hidden', flexShrink: 0 }}>
                <img src="/logo-bigpizza.jpeg" alt="Big Pizza" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#212121' }}>{PROJECT.name}</span>
            </button>
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
      </header>
      )}

      {modalOpen     && <PublishModal onClose={() => setModalOpen(false)} onPublish={handlePublish} />}
      {toastVisible  && <PublishToast onUndo={handleUndo} onDismiss={handleToastDismiss} />}
      {versionsOpen  && <PublishedVersionsPanel onClose={() => setVersionsOpen(false)} />}
      <style>{`@keyframes slideUpToast { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }`}</style>

      {/* Layout: when the tester is open, the page splits into editor + tester
          side-by-side instead of overlaying a drawer. Lets the user edit and
          test in parallel without losing context. */}
      <div style={{
        display: 'flex',
        gap: testOpen ? 24 : 0,
        maxWidth: testOpen ? 1340 : 780,
        margin: '0 auto',
        padding: '32px 24px 100px',
        alignItems: 'flex-start',
        transition: 'max-width 0.25s ease, gap 0.25s ease',
      }}>
      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* Page title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left: name + edit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#212121', letterSpacing: '-0.3px' }}>
                {PROJECT.orchestratorName}
              </h1>
              <button style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                color: '#9E9E9E', display: 'flex', alignItems: 'center',
                borderRadius: 6, transition: 'color 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#304FFE' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9E9E9E' }}
              >
                <Pencil size={15} />
              </button>
            </div>

            {/* Right: actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Probar orquestador */}
              <button
                onClick={() => setTestOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 100,
                  border: '1.5px solid #304FFE', background: 'white',
                  fontSize: 12, fontWeight: 600, color: '#304FFE', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EEF1FF' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
              >
                <Play size={11} style={{ fill: '#304FFE' }} /> Probar
              </button>

              {/* Versiones publicadas */}
              <button
                onClick={() => setVersionsOpen(v => !v)}
                title="Versiones publicadas"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 100,
                  border: versionsOpen ? '1.5px solid #304FFE' : '1.5px solid #e2e8f0',
                  background: versionsOpen ? '#EEF1FF' : 'white',
                  fontSize: 12, fontWeight: 600,
                  color: versionsOpen ? '#304FFE' : '#64748b',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!versionsOpen) { e.currentTarget.style.borderColor = '#304FFE'; e.currentTarget.style.color = '#304FFE' } }}
                onMouseLeave={e => { if (!versionsOpen) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' } }}
              >
                <History size={13} /> Versiones
              </button>

              {/* Publicar */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => hasPending ? setModalOpen(true) : undefined}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 16px', borderRadius: 100,
                    fontSize: 12, fontWeight: 700,
                    cursor: hasPending ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    ...(isUpToDate
                      ? { background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#16a34a', boxShadow: 'none' }
                      : hasPending
                        ? { background: '#ea580c', border: '1.5px solid transparent', color: 'white', boxShadow: '0 2px 8px rgba(234,88,12,0.30)' }
                        : { background: '#304FFE', border: '1.5px solid transparent', color: 'white', boxShadow: '0 2px 8px rgba(48,79,254,0.28)' }
                    ),
                  }}
                  onMouseEnter={e => { if (hasPending && !isUpToDate) e.currentTarget.style.opacity = '0.88' }}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {isUpToDate
                    ? <><Check size={11} /> Publicado</>
                    : hasPending
                      ? <>Publicar <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: 100 }}>{totalChanges}</span></>
                      : 'Publicar'
                  }
                </button>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => setOrchActive(v => !v)}
                style={{
                  width: 38, height: 21, borderRadius: 11, flexShrink: 0,
                  background: orchActive ? '#304FFE' : '#E0E0E0',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2.5, left: orchActive ? 19 : 2.5,
                  width: 16, height: 16, borderRadius: '50%', background: 'white',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          </div>

          {[
            {
              title: 'Conexiones del orquestador',
              desc: 'Los canales por donde llegan los mensajes y los agentes que el orquestador activa para responderlos. Podés conectar o desconectar cualquiera en tiempo real.',
              content: <PrincipalTab />,
            },
            {
              title: 'Modelo generativo',
              desc: 'Elegí el LLM que el orquestador usa para razonar y delegar tareas a los agentes. Podés cambiarlo en cualquier momento sin afectar el resto de la configuración.',
              content: (
                <div>
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', overflowY: 'visible', paddingBottom: 8, paddingLeft: 2, paddingRight: 2, scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}>
                    {ORCH_LLMS.map(llm => (
                      <div key={llm.id} style={{ flex: '0 0 260px', scrollSnapAlign: 'start' }}>
                        <OrchestratorModelCard llm={llm} selected={orchModelId === llm.id} onSelect={() => setOrchModelId(llm.id)} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: spacing.xxSm, padding: `${spacing.xSm}px ${spacing.sm}px`, background: color.primaryUltraLight, border: `1px solid ${color.primaryLight}`, borderRadius: radius.md, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Icon name="info" size={16} color={color.primary} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ margin: 0, fontSize: 12, color: color.grey700, lineHeight: 1.55 }}>
                      Botmaker usa un motor de IA propietario con agentes, bases vectoriales y búsquedas indexadas. El modelo que elijas acá impacta el desempeño de esas funcionalidades.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              title: 'Tono & Estilo',
              desc: 'Cómo habla y se presenta el orquestador con tus clientes. Define su personalidad, nivel de formalidad y extensión de las respuestas.',
              content: <TonoTab />,
            },
            {
              title: 'Restricciones',
              desc: 'Límites que el orquestador nunca puede cruzar, sin importar qué le pida el cliente. Útil para proteger precios, promesas y escaladas a humanos.',
              content: <RestriccionesTab />,
            },
          ].map(s => (
            <section key={s.title} style={{
              background: 'white', borderRadius: 20,
              border: '1px solid #ECEEFF',
              boxShadow: '0 2px 8px rgba(48,79,254,0.04)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F0F2FF' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#212121' }}>{s.title}</h2>
                <p style={{ margin: 0, fontSize: 12, color: '#757575', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {s.content}
              </div>
            </section>
          ))}

        </div>
      </main>

      {testOpen && (
        <aside style={{
          width: 460,
          flexShrink: 0,
          // Sticky so the tester stays in view while the editor scrolls.
          // 88px ≈ shell top bar + breathing room.
          position: 'sticky',
          top: 88,
          // Match scroll height to viewport so the inner column can scroll independently.
          height: 'calc(100vh - 120px)',
        }}>
          <OrchestratorTestChat onClose={() => setTestOpen(false)} />
        </aside>
      )}

      </div>

      <style>{`
        @keyframes pulse     { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes flowDot   { 0% { left: -8px; } 100% { left: calc(100% + 2px); } }
        @keyframes orchPulse { 0% { opacity: 0; transform: scale(0.95); } 60% { opacity: 0.4; transform: scale(1.04); } 100% { opacity: 0; transform: scale(1.08); } }
      `}</style>
    </div>
  )
}
