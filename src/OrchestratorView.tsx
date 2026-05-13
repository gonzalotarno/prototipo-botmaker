import { useState, useRef, useEffect, type ReactNode } from 'react'
import {
  Plus, Pencil, Check, X, HelpCircle, ArrowUpRight,
  Trash2, MoreHorizontal, Zap, Users, Link2,
  ExternalLink, ChevronRight, Home, Play, Send, AlignLeft, Sparkles,
} from 'lucide-react'
import IsometricOffice from './components/IsometricOffice'
import { AgentIcon, AGENT_ICONS } from './agentIcons'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Integration { name: string; icon: string }
interface Agent {
  id: string; name: string; icon: string; color: string
  description: string; dailyCount: number; dailyLabel: string; integrations: Integration[]
}

// ── Static data ───────────────────────────────────────────────────────────────
const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-pedidos', name: 'Toma de Pedidos', icon: 'cart', color: '#16a34a',
    description: 'Recibe pedidos, confirma disponibilidad y los registra automáticamente.',
    dailyCount: 48, dailyLabel: 'pedidos hoy',
    integrations: [{ name: 'WhatsApp', icon: '💬' }, { name: 'Sheets', icon: '📊' }],
  },
  {
    id: 'agent-soporte', name: 'Soporte al Cliente', icon: 'headphones', color: '#d97706',
    description: 'Responde consultas frecuentes, quejas y reclamos sin que intervengas.',
    dailyCount: 21, dailyLabel: 'consultas resueltas',
    integrations: [{ name: 'Slack', icon: '🔔' }],
  },
  {
    id: 'agent-menu', name: 'Menú & Promociones', icon: 'megaphone', color: '#9333ea',
    description: 'Comparte el menú del día, precios y promociones vigentes al instante.',
    dailyCount: 34, dailyLabel: 'respuestas enviadas',
    integrations: [{ name: 'Sheets', icon: '📊' }],
  },
]

const CONNECTIONS = [
  { name: 'WhatsApp', icon: '💬', color: '#25D366', status: 'connected' as const, detail: '+54 9 11 4567-8901' },
  { name: 'Instagram', icon: '📸', color: '#E1306C', status: 'connected' as const, detail: '@pizzeria_bella' },
  { name: 'Web Chat', icon: '🌐', color: '#304FFE', status: 'connected' as const, detail: 'bellaitalia.com' },
  { name: 'Slack', icon: '🔔', color: '#4A154B', status: 'available' as const, detail: 'No conectado' },
  { name: 'Telegram', icon: '✈️', color: '#2CA5E0', status: 'available' as const, detail: 'No conectado' },
]

const AUTOMATIONS = [
  { id: 'flow-1', name: 'Toma de Pedidos', emoji: '🍕', trigger: 'cuando llega un pedido por WhatsApp', steps: 8, status: 'active' as const },
  { id: 'flow-2', name: 'Atención de Reclamos', emoji: '🎧', trigger: 'cuando el cliente menciona un problema', steps: 5, status: 'active' as const },
  { id: 'flow-3', name: 'Consulta de Menú', emoji: '📋', trigger: 'cuando piden ver el menú', steps: 3, status: 'draft' as const },
]

const TONES = [
  { id: 'profesional', label: 'Profesional', emoji: '💼', desc: 'Formal, claro y directo' },
  { id: 'amigable', label: 'Amigable', emoji: '😊', desc: 'Cálido, cercano y natural' },
  { id: 'casual', label: 'Casual', emoji: '😎', desc: 'Relajado, como chatear con alguien' },
  { id: 'tecnico', label: 'Preciso', emoji: '🔧', desc: 'Detallado y orientado a datos' },
]

const TONE_PROMPTS: Record<string, string> = {
  profesional: `Respondé de forma profesional y respetuosa. Utilizá lenguaje formal y evitá el tuteo. Sé claro, conciso y siempre orientado a dar soluciones concretas. Mantenés un trato cordial y distante.`,
  amigable: `Respondé de forma amigable y cercana. Tuteá a los clientes, sé cálido y empático. Usá emojis con moderación para hacer las respuestas más expresivas. Siempre ofrecé ayuda adicional al final.`,
  casual: `Respondé de forma relajada y descontracturada, como si chatearas con un amigo. Tuteá, sé breve y usá un tono informal. Está bien usar expresiones coloquiales del español argentino.`,
  tecnico: `Respondé con precisión y detalle técnico. Incluí datos concretos y pasos específicos cuando corresponda. Evitá ambigüedades y sé sistemático. Priorizá la exactitud sobre la simpatía.`,
}

const TONE_PREVIEWS: Record<string, { user: string; bot: string }> = {
  profesional: {
    user: '¿Cuáles son los horarios?',
    bot: 'Nuestros horarios de atención son de lunes a viernes de 9 a 18 hs. ¿En qué más puedo asistirle?',
  },
  amigable: {
    user: '¿Tienen delivery?',
    bot: '¡Hola! 🎉 Sí, hacemos delivery todos los días. ¿A qué dirección te lo enviamos? 🚀',
  },
  casual: {
    user: '¿Qué hay de nuevo?',
    bot: '¡Mucho! 😄 Esta semana lanzamos combos nuevos re buenos. ¿Querés que te cuente?',
  },
  tecnico: {
    user: '¿Cuánto tarda el envío?',
    bot: 'Envío estándar: 3-5 días hábiles. Express: 24-48 hs (+$500 adicional). ¿Cuál preferís?',
  },
}

const BEHAVIOR_OPTIONS = [
  { id: 'emoji', label: '😊 Usa emojis' },
  { id: 'tutear', label: 'Tutea al cliente' },
  { id: 'corto', label: 'Respuestas cortas' },
  { id: 'alternativas', label: 'Ofrece alternativas' },
  { id: 'nombre', label: 'Saluda por nombre' },
]

// ── Chat / routing ────────────────────────────────────────────────────────────
interface ChatMsg {
  id: string
  role: 'user' | 'bot' | 'thinking'
  content: string
  agentId?: string
  thinkingStep?: number // 0=analyzing 1=asking 2=found 3=typing
}

const ROUTING_TABLE = [
  {
    agentId: 'agent-pedidos',
    keywords: ['pizza', 'pedido', 'pedir', 'quiero', 'orden', 'combo', 'delivery', 'llevar', 'empanada', 'fugazza', 'docena', 'mitad'],
    response: '¡Perfecto! 🍕 ¿Cuál pizza te gustaría?\n\n• Mozzarella — $1.500\n• Especial — $2.200\n• Cuatro Quesos — $2.400\n• Fugazza con Queso — $1.900\n\n¿Para llevar o con delivery? 🛵',
  },
  {
    agentId: 'agent-soporte',
    keywords: ['problema', 'reclamo', 'queja', 'tarde', 'frío', 'fria', 'mal', 'error', 'equivocado', 'equivocaron', 'ayuda', 'falló'],
    response: 'Entiendo y lo lamentamos mucho 😔 Tomamos tu caso con prioridad. ¿Me contás qué pasó exactamente? Lo resuelvo de inmediato.',
  },
  {
    agentId: 'agent-menu',
    keywords: ['menú', 'menu', 'precio', 'precios', 'promo', 'promocion', 'oferta', 'carta', 'tienen', 'tienen', 'hay', 'novedades', 'nuevo'],
    response: '📋 ¡Acá va el menú de hoy!\n\n🍕 Pizzas desde $1.500\n🥟 Empanadas $350 c/u\n🍔 Combo Familiar $3.800\n\n✨ Promo hoy: 20% OFF en combos para llevar. ¿Te animas? 😄',
  },
]

const WELCOME_MSG: ChatMsg = {
  id: 'welcome',
  role: 'bot',
  content: '¡Hola! 👋 Soy el orquestador de Pizzería Bella Italia. Probá escribirme como si fueras un cliente y te muestro cómo le asigno la tarea al agente correcto.',
}

function routeMessage(text: string) {
  const lower = text.toLowerCase()
  return ROUTING_TABLE.find(r => r.keywords.some(k => lower.includes(k))) ?? ROUTING_TABLE[1]
}

const _REMOVED_FACE_AVATARS = [
  // removed: replaced with icon selector
  '/agents/Face-Men-1.png',
]
const AGENT_COLORS = ['#304FFE', '#16a34a', '#d97706', '#dc2626', '#9333ea', '#0891b2', '#db2777', '#64748b']

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [v, setV] = useState(false)
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
      onMouseEnter={() => setV(true)}
      onMouseLeave={() => setV(false)}
    >
      <HelpCircle size={13} color="#94a3b8" />
      {v && (
        <span style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e293b', color: 'white',
          padding: '8px 13px', borderRadius: 9, fontSize: 12, lineHeight: 1.55,
          whiteSpace: 'nowrap', zIndex: 1000, maxWidth: 260, whiteSpaceCollapse: 'preserve' as any,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)', pointerEvents: 'none',
        }}>
          {text}
          <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1e293b' }} />
        </span>
      )}
    </span>
  )
}

// ── StatChip ──────────────────────────────────────────────────────────────────
function StatChip({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '7px 14px', borderRadius: 100,
      background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.92)',
      fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    }}>
      <span>{icon}</span>
      <strong style={{ color, fontWeight: 700 }}>{value}</strong>
      <span style={{ color: '#64748b' }}>{label}</span>
    </span>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'white', borderRadius: 20,
      border: '1px solid #E2E7FF',
      boxShadow: '0 2px 16px rgba(48,79,254,0.04)',
      padding: '28px 32px', marginBottom: 20,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, desc, tooltip, action }: {
  icon: ReactNode; title: string; desc: string; tooltip: string; action?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EEF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#304FFE', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h2>
            <Tooltip text={tooltip} />
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3, marginBottom: 0 }}>{desc}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

// ── Team member card ───────────────────────────────────────────────────────────
function AgentCard({ agent, onDelete, onOpen }: { agent: Agent; onDelete: () => void; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '0 0 auto', width: 230,
        background: 'white', borderRadius: 20,
        border: `1.5px solid ${hovered ? agent.color + '55' : '#E2E7FF'}`,
        boxShadow: hovered ? `0 20px 48px ${agent.color}22` : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-8px) scale(1.015)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'hidden', position: 'relative', cursor: 'pointer',
      }}
    >
      {/* Gradient top with icon */}
      <div style={{
        height: 100, background: `linear-gradient(135deg, ${agent.color}18 0%, ${agent.color}08 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <div style={{ boxShadow: `0 4px 20px ${agent.color}30`, borderRadius: '50%', flexShrink: 0 }}>
          <AgentIcon iconKey={agent.icon} color={agent.color} size={72} iconSize={32} />
        </div>
        <span style={{
          position: 'absolute', top: 10, left: 10,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 100,
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          fontSize: 10, fontWeight: 600, color: '#16a34a',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Trabajando
        </span>
        {/* Menu */}
        <div ref={menuRef} style={{ position: 'absolute', top: 8, right: 8 }} onClick={e => e.stopPropagation()}>
          <button onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }} style={{ padding: '4px 5px', borderRadius: 7, border: 'none', background: menuOpen ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)', cursor: 'pointer', color: '#64748b', display: 'flex', backdropFilter: 'blur(4px)' }}>
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: 'white', borderRadius: 10, border: '1px solid #E2E7FF', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 180, overflow: 'hidden', zIndex: 200 }}>
              <button onClick={() => { setMenuOpen(false); onOpen() }} style={{ width: '100%', padding: '9px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#334155', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <ArrowUpRight size={13} /> Abrir agente
              </button>
              <button onClick={e => { e.stopPropagation(); setMenuOpen(false) }} style={{ width: '100%', padding: '9px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#334155', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <ExternalLink size={13} /> Reutilizar en otro orquestador
              </button>
              <button onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete() }} style={{ width: '100%', padding: '9px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#ef4444', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <Trash2 size={13} /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{ marginBottom: 7 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, margin: 0 }}>{agent.name}</p>
        </div>

        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 12 }}>{agent.description}</p>

        {agent.integrations.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {agent.integrations.map(i => (
              <span key={i.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 100, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 10, fontWeight: 500, color: '#475569' }}>
                <span style={{ fontSize: 12 }}>{i.icon}</span> {i.name}
              </span>
            ))}
          </div>
        )}

        {/* Daily stat */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: `${agent.color}08`, border: `1px solid ${agent.color}18` }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>{agent.dailyLabel}</span>
          <strong style={{ fontSize: 18, fontWeight: 800, color: agent.color }}>{agent.dailyCount}</strong>
        </div>
      </div>
    </div>
  )
}

// ── Add team member card ───────────────────────────────────────────────────────
function AddAgentCard({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '0 0 auto', width: 230, minHeight: 280,
        background: hov ? '#F5F7FF' : 'white', borderRadius: 20,
        border: `1.5px dashed ${hov ? '#304FFE' : '#c7d2fe'}`,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        transform: hov ? 'translateY(-5px)' : 'none',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 15, background: hov ? '#304FFE' : '#EEF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
        <Plus size={24} color={hov ? 'white' : '#304FFE'} />
      </div>
      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: hov ? '#304FFE' : '#64748b', marginBottom: 6 }}>Sumar agente</p>
        <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>Creá un agente con una responsabilidad específica dentro del orquestador</p>
      </div>
    </div>
  )
}

// ── RestrictionRow ────────────────────────────────────────────────────────────
function RestrictionRow({ label, defaultActive }: { label: string; defaultActive: boolean }) {
  const [active, setActive] = useState(defaultActive)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(label)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: '1px solid #f1f5f9', background: active ? '#fafbff' : '#f9fafb' }}>
      <Toggle on={active} onChange={setActive} />
      {editing ? (
        <input
          autoFocus value={text} onChange={e => setText(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false) }}
          style={{ flex: 1, fontSize: 13, border: 'none', outline: 'none', background: 'transparent', color: '#0f172a' }}
        />
      ) : (
        <span style={{ flex: 1, fontSize: 13, color: active ? '#0f172a' : '#94a3b8' }}>{text}</span>
      )}
      <button onClick={() => setEditing(true)} style={{ padding: '4px 6px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1', display: 'flex' }} onMouseEnter={e => (e.currentTarget.style.color = '#64748b')} onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}>
        <Pencil size={13} />
      </button>
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', background: on ? '#304FFE' : '#cbd5e1', position: 'relative', transition: 'background 0.25s ease', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', transition: 'left 0.25s ease' }} />
    </button>
  )
}

// ── ThinkingBubble ────────────────────────────────────────────────────────────
function ThinkingBubble({ step, agents, matchedAgentId }: {
  step: number
  agents: Agent[]
  matchedAgentId: string
}) {
  const matched = agents.find(a => a.id === matchedAgentId)

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
        background: 'linear-gradient(135deg, #304FFE 0%, #6366f1 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
        boxShadow: '0 2px 8px rgba(48,79,254,0.3)',
      }}>⚡</div>

      <div style={{
        background: '#EEF2FF', border: '1px solid #c7d2fe',
        borderRadius: '4px 14px 14px 14px',
        padding: '12px 16px', maxWidth: 280, minWidth: 220,
      }}>
        {/* Step 0: analyzing */}
        {step === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
            <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 500 }}>Analizando tu mensaje...</span>
          </div>
        )}

        {/* Step 1: asking agents */}
        {step === 1 && (
          <>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 12, fontWeight: 500 }}>
              Preguntando a los agentes quién puede ayudar...
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {agents.map(a => (
                <div key={a.id} style={{ textAlign: 'center' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <AgentIcon iconKey={a.icon} color={a.color} size={38} iconSize={16} />
                    <span style={{
                      position: 'absolute', bottom: -2, right: -2,
                      background: '#94a3b8', color: 'white',
                      borderRadius: '50%', width: 15, height: 15,
                      fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                    }}>?</span>
                  </div>
                  <p style={{ fontSize: 9, color: '#94a3b8', marginTop: 5, maxWidth: 44, lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {a.name.split(' ')[0]}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 2: agent found */}
        {step === 2 && matched && (
          <>
            <p style={{ fontSize: 11, color: '#16a34a', marginBottom: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ background: '#16a34a', color: 'white', borderRadius: '50%', width: 14, height: 14, fontSize: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
              {matched.name} puede encargarse
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {agents.map(a => {
                const isMatch = a.id === matchedAgentId
                return (
                  <div key={a.id} style={{ textAlign: 'center', opacity: isMatch ? 1 : 0.25, transition: 'opacity 0.4s ease' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <AgentIcon iconKey={a.icon} color={isMatch ? matched.color : '#94a3b8'} size={38} iconSize={16} />
                      {isMatch && (
                        <span style={{
                          position: 'absolute', bottom: -2, right: -2,
                          background: '#22c55e', color: 'white',
                          borderRadius: '50%', width: 15, height: 15,
                          fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                          border: '2px solid white',
                        }}>✓</span>
                      )}
                    </div>
                    <p style={{ fontSize: 9, color: isMatch ? matched.color : '#94a3b8', marginTop: 5, maxWidth: 44, lineHeight: 1.2, fontWeight: isMatch ? 700 : 400, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {a.name.split(' ')[0]}
                    </p>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Step 3: agent typing */}
        {step === 3 && matched && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AgentIcon iconKey={matched.icon} color={matched.color} size={30} iconSize={13} />
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: matched.color, marginBottom: 4 }}>{matched.name}</p>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: matched.color,
                    display: 'inline-block',
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────
interface OrchestratorViewProps {
  embedded?: boolean
  initialName?: string
}

export default function OrchestratorView({ embedded = false, initialName }: OrchestratorViewProps = {}) {
  const [agentList, setAgentList] = useState<Agent[]>(INITIAL_AGENTS)
  const [teamView, setTeamView] = useState<'list' | 'action'>('list')
  const [isActive, setIsActive] = useState(true)
  const [orchName, setOrchName] = useState(initialName ?? 'Pizzería Bella Italia')
  const [orchDesc, setOrchDesc] = useState('Atendemos pedidos, consultas y reclamos de nuestros clientes automáticamente')
  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [tempName, setTempName] = useState(orchName)
  const [tempDesc, setTempDesc] = useState(orchDesc)
  const [selectedTone, setSelectedTone] = useState('amigable')
  const [voicePrompt, setVoicePrompt] = useState(TONE_PROMPTS['amigable'])
  const [behaviors, setBehaviors] = useState<string[]>(['emoji', 'tutear'])
  const [assistantName, setAssistantName] = useState('Bella')

  // Chat / test panel
  const [showChat, setShowChat] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([WELCOME_MSG])
  const [chatInput, setChatInput] = useState('')
  const [chatBusy, setChatBusy] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs])

  const sendChatMessage = () => {
    const text = chatInput.trim()
    if (!text || chatBusy) return
    setChatInput('')
    setChatBusy(true)

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', content: text }
    const thinkId = `t-${Date.now()}`
    const route = routeMessage(text)

    setChatMsgs(prev => [...prev, userMsg, { id: thinkId, role: 'thinking', content: '', agentId: route.agentId, thinkingStep: 0 }])

    // Step 0 → 1 → 2 → 3 → bot message
    const steps = [600, 1100, 800, 700]
    let elapsed = 0
    steps.forEach((delay, i) => {
      elapsed += delay
      setTimeout(() => {
        if (i < 3) {
          setChatMsgs(prev => prev.map(m => m.id === thinkId ? { ...m, thinkingStep: i + 1 } : m))
        } else {
          const agent = agentList.find(a => a.id === route.agentId)
          setChatMsgs(prev => [
            ...prev.filter(m => m.id !== thinkId),
            { id: `b-${Date.now()}`, role: 'bot', content: route.response, agentId: route.agentId },
          ])
          setChatBusy(false)
          void agent // consumed
        }
      }, elapsed)
    })
  }

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('bot')
  const [newColor, setNewColor] = useState('#304FFE')
  const [newDesc, setNewDesc] = useState('')
  const resetModal = () => { setNewName(''); setNewIcon('bot'); setNewColor('#304FFE'); setNewDesc('') }
  const handleAdd = () => {
    if (!newName.trim()) return
    setAgentList(prev => [...prev, { id: `agent-${Date.now()}`, name: newName.trim(), icon: newIcon, color: newColor, description: newDesc.trim(), dailyCount: 0, dailyLabel: 'tareas hoy', integrations: [] }])
    resetModal(); setShowModal(false)
  }

  const totalToday = agentList.reduce((s, a) => s + a.dailyCount, 0)

  return (
    <div style={
      embedded
        ? { height: '100%', overflowY: 'auto', overflowX: 'hidden', background: '#F5F7FF', fontFamily: 'inherit' }
        : { minHeight: '100vh', background: '#F5F7FF', fontFamily: 'inherit' }
    }>

      {/* ── Sticky header (skipped when embedded — host shell provides one) ── */}
      {!embedded && (
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E7FF',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 32px',
        boxShadow: '0 1px 8px rgba(48,79,254,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => { window.location.href = '/' }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, border: 'none', background: 'transparent', color: '#64748b', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Home size={12} /> Inicio
            </button>
            <ChevronRight size={12} color="#cbd5e1" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{orchName}</span>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, background: isActive ? '#f0fdf4' : '#f8fafc', border: `1px solid ${isActive ? '#bbf7d0' : '#e2e8f0'}`, color: isActive ? '#16a34a' : '#64748b', fontSize: 11, fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#22c55e' : '#94a3b8', display: 'inline-block' }} />
            {isActive ? 'Atendiendo ahora' : 'Pausado'}
          </span>
          <button
            onClick={() => setShowChat(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 100, border: 'none', background: '#304FFE', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 10px rgba(48,79,254,0.28)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Play size={12} /> Probar orquestador
          </button>
          <button onClick={() => window.location.href = '/flow'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 100, border: '1px solid #304FFE', background: 'transparent', color: '#304FFE', fontSize: 12, fontWeight: 600, cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = '#EEF1FF')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            Editor de flujos <ExternalLink size={12} />
          </button>
        </div>
      </header>
      )}

      <main style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 24px 100px' }}>

        {/* ── HERO ── */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #EEF2FF 55%, #DDE4FF 100%)',
          borderRadius: 24, border: '1px solid #E2E7FF',
          padding: '40px 48px', marginBottom: 24,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,79,254,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 140, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 32, position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: 22, background: 'linear-gradient(135deg, #304FFE 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0, boxShadow: '0 12px 40px rgba(48,79,254,0.35)' }}>
              ⚡
            </div>
            <div style={{ flex: 1 }}>
              {/* Live badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 100, background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 14 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 0 2px #bbf7d0' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Tu negocio está funcionando ahora mismo</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: 10 }}>
                {orchName}
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20, lineHeight: 1.55, maxWidth: 560 }}>
                El orquestador coordina tus agentes las 24 horas del día, los 7 días de la semana — sin que necesités intervenir.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <StatChip icon="💬" value={String(totalToday)} label="tareas completadas hoy" color="#304FFE" />
                <StatChip icon="⚡" value="8s" label="tiempo de respuesta" color="#16a34a" />
                <StatChip icon="⭐" value="94%" label="clientes satisfechos" color="#d97706" />
                <StatChip icon="🛒" value="87" label="pedidos procesados hoy" color="#9333ea" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 1+2. CANALES → ORQUESTADOR → AGENTES ── */}
        <SectionCard style={{ padding: '28px 32px 32px' }}>
          <SectionHeader
            icon={<Link2 size={18} />}
            title="Canales y agentes"
            desc="Los mensajes de cada canal son recibidos por el orquestador, que detecta la intención y los deriva al agente indicado."
            tooltip="Esta sección muestra de dónde vienen los mensajes y qué agentes los responden. El orquestador actúa como intermediario inteligente."
            action={
              <button
                onClick={() => setShowModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}
              >
                <Plus size={13} /> Sumar agente
              </button>
            }
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr', gap: 0, alignItems: 'stretch' }}>

            {/* ── LEFT: Canales ── */}
            <div style={{ paddingRight: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                Mensajes entrantes
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CONNECTIONS.filter(c => c.status === 'connected').map(conn => (
                  <div key={conn.name}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${conn.color}25`, background: conn.color + '07', cursor: 'pointer', transition: 'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = conn.color + '55'; e.currentTarget.style.background = conn.color + '12' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = conn.color + '25'; e.currentTarget.style.background = conn.color + '07' }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{conn.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{conn.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{conn.detail}</p>
                    </div>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 0 2px #bbf7d080' }} />
                  </div>
                ))}
                {CONNECTIONS.filter(c => c.status === 'available').map(conn => (
                  <div key={conn.name}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: '1.5px dashed #e2e8f0', background: 'white', cursor: 'pointer', opacity: 0.6, transition: 'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = '#c7d2fe' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.borderColor = '#e2e8f0' }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{conn.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>{conn.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>No conectado</p>
                    </div>
                    <Plus size={13} color="#94a3b8" />
                  </div>
                ))}
              </div>
            </div>

            {/* ── CENTER: Orquestador hub ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 4px', position: 'relative' }}>
              {/* Left arrow line */}
              <div style={{ position: 'absolute', left: 0, top: '50%', width: '100%', height: 2, background: 'linear-gradient(to right, #c7d2fe, #304FFE44, #c7d2fe)', transform: 'translateY(-50%)', zIndex: 0 }} />
              {/* Arrowheads left */}
              <ChevronRight size={14} color="#a5b4fc" style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
              {/* Arrowheads right */}
              <ChevronRight size={14} color="#a5b4fc" style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />

              {/* Orchestrator bubble */}
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #304FFE 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 8px 24px rgba(48,79,254,0.3)' }}>⚡</div>
                <div style={{ background: 'white', border: '1px solid #E2E7FF', borderRadius: 8, padding: '4px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#304FFE', margin: 0 }}>Orquestador</p>
                  <p style={{ fontSize: 9, color: '#94a3b8', margin: 0, marginTop: 1 }}>detecta y deriva</p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Agentes ── */}
            <div style={{ paddingLeft: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                Responden los agentes
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {agentList.map(agent => (
                  <div
                    key={agent.id}
                    onClick={() => window.location.href = '/agente'}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${agent.color}25`, background: agent.color + '07', cursor: 'pointer', transition: 'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = agent.color + '55'; e.currentTarget.style.background = agent.color + '12' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = agent.color + '25'; e.currentTarget.style.background = agent.color + '07' }}
                  >
                    <AgentIcon iconKey={agent.icon} color={agent.color} size={32} iconSize={14} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{agent.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{agent.description || 'Agente especializado'}</p>
                    </div>
                    <ChevronRight size={14} color={agent.color} style={{ flexShrink: 0 }} />
                  </div>
                ))}
                {/* Add agent */}
                <div
                  onClick={() => setShowModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: '1.5px dashed #c7d2fe', background: '#f8f9ff', cursor: 'pointer', transition: 'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#304FFE80'; e.currentTarget.style.background = '#EEF1FF' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#f8f9ff' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EEF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Plus size={14} color="#304FFE" />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#304FFE' }}>Sumar agente</p>
                </div>
              </div>
            </div>

          </div>
        </SectionCard>

        {/* ── 3. FLUJOS DE TRABAJO ── */}
        <SectionCard>
          <SectionHeader
            icon={<Zap size={18} />}
            title="Flujos de trabajo"
            desc="Cómo responde cada agente paso a paso ante cada consulta"
            tooltip="Cada flujo define exactamente qué hace tu asistente cuando recibe un mensaje. Podés editarlos visualmente, sin necesidad de saber programar."
            action={
              <button onClick={() => window.location.href = '/flow'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 12, fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                <Plus size={13} /> Nuevo flujo
              </button>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {AUTOMATIONS.map(auto => (
              <div key={auto.id}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 14, border: '1px solid #f1f5f9', background: '#fafbff', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(48,79,254,0.07)'; e.currentTarget.style.background = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#fafbff' }}
              >
                <span style={{ fontSize: 28 }}>{auto.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{auto.name}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8' }}>Se activa {auto.trigger} · {auto.steps} pasos</p>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: auto.status === 'active' ? '#f0fdf4' : '#fafafa', border: `1px solid ${auto.status === 'active' ? '#bbf7d0' : '#e2e8f0'}`, color: auto.status === 'active' ? '#16a34a' : '#94a3b8' }}>
                  {auto.status === 'active' ? 'Activo' : 'Borrador'}
                </span>
                <button onClick={() => window.location.href = '/flow'} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 100, border: 'none', background: '#EEF1FF', color: '#304FFE', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Editar <ArrowUpRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── 5. TONO Y ESTILO ── */}
        <SectionCard>
          <SectionHeader
            icon={<span style={{ fontSize: 18 }}>🎨</span>}
            title="Tono y estilo"
            desc="Definí la personalidad de los agentes del orquestador"
            tooltip="El prompt de personalidad define cómo hablan los agentes en cada conversación. Se aplica a todos los agentes del orquestador."
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
            {/* Prompt textarea */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Prompt de personalidad</label>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={voicePrompt}
                  onChange={e => setVoicePrompt(e.target.value)}
                  rows={7}
                  placeholder="Describí cómo querés que hablen los agentes con los clientes..."
                  style={{ width: '100%', padding: '14px', paddingBottom: 32, borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, color: '#0f172a', outline: 'none', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#304FFE')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
                <span style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 11, color: voicePrompt.length > 280 ? '#ef4444' : '#94a3b8', pointerEvents: 'none' }}>
                  {voicePrompt.length} / 300
                </span>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Vista previa</label>
              <div style={{ borderRadius: 12, border: '1px solid #E2E7FF', background: '#fafbff', padding: '16px 14px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 27px)', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ background: '#304FFE', color: 'white', borderRadius: '12px 12px 3px 12px', padding: '8px 12px', fontSize: 11, maxWidth: '85%', lineHeight: 1.5 }}>
                      ¿Tienen delivery?
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#EEF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🤖</div>
                    <div style={{ background: 'white', border: '1px solid #E2E7FF', borderRadius: '3px 12px 12px 12px', padding: '9px 12px', fontSize: 11, lineHeight: 1.5, color: '#0f172a' }}>
                      <strong style={{ fontSize: 10, color: '#304FFE', display: 'block', marginBottom: 3 }}>Bella</strong>
                      ¡Hola! 🎉 Sí, hacemos delivery todos los días. ¿A qué dirección te lo enviamos? 🚀
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 8, margin: '12px 0 0' }}>
                  Ejemplo ilustrativo
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 4. RESTRICCIONES ── */}
        <SectionCard>
          <SectionHeader
            icon={<span style={{ fontSize: 18 }}>🚧</span>}
            title="Restricciones"
            desc="Definí qué puede y qué no puede hacer el orquestador"
            tooltip="Las restricciones evitan que los agentes respondan temas fuera de tu negocio o compartan información sensible. Se aplican a todos los agentes del orquestador."
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { id: 'r1', label: 'No revelar precios sin consultar disponibilidad primero', active: true },
              { id: 'r2', label: 'No responder preguntas sobre competidores', active: true },
              { id: 'r3', label: 'No compartir datos personales de otros clientes', active: true },
              { id: 'r4', label: 'Derivar reclamos legales a un operador humano', active: false },
            ].map(r => (
              <RestrictionRow key={r.id} label={r.label} defaultActive={r.active} />
            ))}
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 10, border: '1.5px dashed #e2e8f0', background: 'transparent', color: '#64748b', fontSize: 12, fontWeight: 500, cursor: 'pointer', width: 'fit-content', marginTop: 4 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#a5b4fc'; e.currentTarget.style.color = '#304FFE' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
            >
              <Plus size={13} /> Agregar restricción
            </button>
          </div>
        </SectionCard>

      </main>

      {/* ── Chat panel backdrop ── */}
      {showChat && (
        <div onClick={() => setShowChat(false)} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(2px)' }} />
      )}

      {/* ── Chat panel ── */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 90,
        width: 420,
        background: 'white',
        borderLeft: '1px solid #E2E7FF',
        boxShadow: '-8px 0 40px rgba(48,79,254,0.10)',
        display: 'flex', flexDirection: 'column',
        transform: showChat ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Panel header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: 'white', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #304FFE, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: '0 2px 8px rgba(48,79,254,0.3)' }}>⚡</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Probando orquestador</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{orchName}</p>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={14} />
            </button>
          </div>
          {/* How it works tip */}
          <div style={{ background: '#F5F7FF', border: '1px solid #E2E7FF', borderRadius: 10, padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 11, color: '#6366f1', lineHeight: 1.55, margin: 0 }}>
              Escribí como si fueras un cliente. El orquestador elige el agente correcto y te muestra cómo piensa.
            </p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {chatMsgs.map(msg => {
            if (msg.role === 'thinking') {
              return (
                <ThinkingBubble
                  key={msg.id}
                  step={msg.thinkingStep ?? 0}
                  agents={agentList}
                  matchedAgentId={msg.agentId ?? ''}
                />
              )
            }

            if (msg.role === 'user') {
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ background: '#304FFE', color: 'white', borderRadius: '14px 14px 4px 14px', padding: '10px 14px', fontSize: 13, maxWidth: '78%', lineHeight: 1.55 }}>
                    {msg.content}
                  </div>
                </div>
              )
            }

            // bot message
            const agent = agentList.find(a => a.id === msg.agentId)
            return (
              <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #304FFE, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, boxShadow: '0 2px 8px rgba(48,79,254,0.3)' }}>⚡</div>
                <div style={{ maxWidth: '78%' }}>
                  {agent && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 100, background: agent.color + '15', border: `1px solid ${agent.color}30`, marginBottom: 6 }}>
                      <AgentIcon iconKey={agent.icon} color={agent.color} size={14} iconSize={8} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: agent.color }}>vía {agent.name}</span>
                    </div>
                  )}
                  <div style={{ background: '#f8fafc', border: '1px solid #E2E7FF', borderRadius: '4px 14px 14px 14px', padding: '10px 14px', fontSize: 13, lineHeight: 1.65, color: '#0f172a', whiteSpace: 'pre-line' }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested prompts — only if no user message yet */}
        {chatMsgs.length === 1 && (
          <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Quiero una pizza', '¿Qué tienen hoy?', 'Llegó fría la pizza'].map(s => (
              <button
                key={s}
                onClick={() => { setChatInput(s) }}
                style={{ padding: '6px 12px', borderRadius: 100, border: '1px solid #E2E7FF', background: '#F5F7FF', fontSize: 11, fontWeight: 500, color: '#6366f1', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EEF1FF'; e.currentTarget.style.borderColor = '#a5b4fc' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F5F7FF'; e.currentTarget.style.borderColor = '#E2E7FF' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', flexShrink: 0, display: 'flex', gap: 10 }}>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
            placeholder="Escribí un mensaje como cliente..."
            disabled={chatBusy}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: chatBusy ? '#f8fafc' : 'white', fontSize: 13, color: '#0f172a', outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#304FFE')}
            onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
          />
          <button
            onClick={sendChatMessage}
            disabled={chatBusy || !chatInput.trim()}
            style={{ width: 42, height: 42, borderRadius: 100, border: 'none', background: chatBusy || !chatInput.trim() ? '#e2e8f0' : '#304FFE', color: 'white', cursor: chatBusy || !chatInput.trim() ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s', boxShadow: chatBusy || !chatInput.trim() ? 'none' : '0 2px 8px rgba(48,79,254,0.3)' }}
          >
            <Send size={16} color={chatBusy || !chatInput.trim() ? '#94a3b8' : 'white'} />
          </button>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <>
          <div onClick={() => { resetModal(); setShowModal(false) }} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100, width: 500, maxHeight: '88vh', background: 'white', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EEF1FF', border: '2px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={18} color="#304FFE" />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0, flex: 1 }}>Nuevo agente</h2>
              <button onClick={() => { resetModal(); setShowModal(false) }} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
            </div>

            {/* Scrollable body */}
            <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Section 1 — Nombre y descripción */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EEF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlignLeft size={14} color="#304FFE" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Nombre y descripción</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Nombre del agente *</label>
                    <input
                      type="text" value={newName} onChange={e => setNewName(e.target.value)}
                      placeholder="ej: Reservas, Facturación, Delivery…"
                      autoFocus onKeyDown={e => e.key === 'Enter' && handleAdd()}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 14, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#304FFE')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>¿Cuándo se activa este agente?</label>
                    <textarea
                      value={newDesc} onChange={e => setNewDesc(e.target.value)}
                      placeholder="Describí en qué situación el orquestador debe derivar la conversación a este agente. ej: Cuando el usuario quiere hacer un pedido."
                      rows={3}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 13, color: '#1e293b', outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#304FFE')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2 — Ícono */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={14} color="#9333ea" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Ícono del agente</span>
                </div>

                {/* Preview + colors */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: newColor, boxShadow: `0 6px 20px ${newColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                    {(() => { const Icon = AGENT_ICONS.find(i => i.key === newIcon)?.Icon ?? AGENT_ICONS[0].Icon; return <Icon size={24} color="white" /> })()}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {AGENT_COLORS.map(c => (
                      <button key={c} onClick={() => setNewColor(c)} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: c, cursor: 'pointer', outline: newColor === c ? `2.5px solid ${c}` : 'none', outlineOffset: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: newColor === c ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.15s' }}>
                        {newColor === c && <Check size={10} color="white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon grid */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 10px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {AGENT_ICONS.map(({ key, Icon }) => {
                      const sel = newIcon === key
                      return (
                        <button
                          key={key}
                          onClick={() => setNewIcon(key)}
                          style={{
                            width: 36, height: 36, borderRadius: 8, padding: 0, cursor: 'pointer', border: 'none',
                            background: sel ? newColor + '18' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            outline: sel ? `2px solid ${newColor}` : 'none', outlineOffset: 0,
                            transition: 'all 0.12s',
                          }}
                          onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#f1f5f9' }}
                          onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}
                        >
                          <Icon size={17} color={sel ? newColor : '#64748b'} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, flexShrink: 0 }}>
              <button onClick={() => { resetModal(); setShowModal(false) }} style={{ flex: 1, padding: '11px', borderRadius: 100, border: '1px solid #e2e8f0', background: 'transparent', fontSize: 13, fontWeight: 500, color: '#64748b', cursor: 'pointer' }}>Descartar</button>
              <button onClick={handleAdd} disabled={!newName.trim()} style={{ flex: 1, padding: '11px', borderRadius: 100, border: 'none', background: newName.trim() ? '#304FFE' : '#e2e8f0', color: newName.trim() ? 'white' : '#94a3b8', fontSize: 13, fontWeight: 600, cursor: newName.trim() ? 'pointer' : 'default', transition: 'all 0.15s' }}>
                Crear agente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
