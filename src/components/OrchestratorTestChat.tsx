import { useState, useRef, useEffect } from 'react'
import { X, Send, Paperclip, ChevronUp, ChevronDown, Check } from 'lucide-react'

// ── Agents (used for the routing heuristic + debug metadata) ─────────────────

type EventKind = 'MCP' | 'Base' | 'Tool' | 'Code'
interface AgentEvent { kind: EventKind; name: string; durationMs: number }

interface AgentDef {
  id:       string
  name:     string
  keywords: string[]
  intent:   string
  flow:     string
  events:   AgentEvent[]
}

const AGENTS: AgentDef[] = [
  {
    id: 'orchestrator', name: 'Orquestador',
    keywords: [],
    intent: 'Saludo / Triage',
    flow:   '—',
    events: [
      { kind: 'Tool', name: 'detectIntent',          durationMs: 110 },
    ],
  },
  {
    id: 'pedidos', name: 'Tomador de Pedidos',
    keywords: ['pedir', 'pedido', 'pizza', 'empanada', 'comida', 'quiero', 'llevar', 'delivery', 'menú', 'menu', 'orden', 'ordenar', 'precio', 'cuánto', 'docena'],
    intent: 'Pedidos',
    flow:   'Flujo de compra de empanadas',
    events: [
      { kind: 'MCP',  name: 'Catálogo · searchProduct',     durationMs: 320 },
      { kind: 'MCP',  name: 'Catálogo · getProductDetails', durationMs: 180 },
      { kind: 'Base', name: 'Menú del restaurante',         durationMs:  90 },
      { kind: 'Tool', name: 'calculatePriceWithDiscount',   durationMs:  45 },
    ],
  },
  {
    id: 'soporte', name: 'Soporte al Cliente',
    keywords: ['problema', 'queja', 'error', 'ayuda', 'consulta', 'horario', 'reclamo', 'tardó', 'tarde', 'no llegó', 'mal', 'frío', 'frio', 'faltaban'],
    intent: 'Soporte',
    flow:   'Flujo de atención al cliente',
    events: [
      { kind: 'Base', name: 'FAQ General',                 durationMs: 140 },
      { kind: 'Base', name: 'Políticas internas',          durationMs:  95 },
      { kind: 'Tool', name: 'escalateToHuman',             durationMs:  30 },
    ],
  },
  {
    id: 'menu', name: 'Menú & Promociones',
    keywords: ['promo', 'promoción', 'oferta', 'descuento', 'combo', 'especial', 'novedades', 'recomendás', 'opciones', 'vegano'],
    intent: 'Promociones',
    flow:   'Flujo de novedades y combos',
    events: [
      { kind: 'Base', name: 'Catálogo de Productos',       durationMs: 210 },
      { kind: 'Code', name: 'filterActivePromotions.js',   durationMs:  60 },
    ],
  },
]

function routeMessage(text: string): AgentDef {
  const lower = text.toLowerCase()
  let best = AGENTS[1], bestScore = 0   // default to "Tomador de Pedidos"
  for (const agent of AGENTS) {
    const score = agent.keywords.filter(k => lower.includes(k)).length
    if (score > bestScore) { bestScore = score; best = agent }
  }
  return best
}

// ── Bot avatar ───────────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: '#EEF2FF', border: '1px solid #C7D0FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src="/avatar-ai.svg"
          style={{ width: 18, height: 18, filter: 'brightness(0) saturate(100%) invert(23%) sepia(93%) saturate(7484%) hue-rotate(234deg) brightness(101%) contrast(101%)' }}
        />
      </div>
      <span style={{
        position: 'absolute', right: 0, bottom: 0,
        width: 10, height: 10, borderRadius: '50%',
        background: '#22c55e', border: '2px solid white',
      }} />
    </div>
  )
}

// ── Orchestrator icon (the spoked star) ──────────────────────────────────────

function OrchestratorMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#304FFE">
        <circle cx="12" cy="12" r="2.4"/>
        <circle cx="12" cy="3.5" r="2"/>
        <circle cx="20.5" cy="12" r="2"/>
        <circle cx="12" cy="20.5" r="2"/>
        <circle cx="3.5" cy="12" r="2"/>
        <circle cx="18" cy="6" r="1.8"/>
        <circle cx="18" cy="18" r="1.8"/>
        <circle cx="6" cy="18" r="1.8"/>
        <circle cx="6" cy="6" r="1.8"/>
      </svg>
    </div>
  )
}

// ── Messages ─────────────────────────────────────────────────────────────────

interface AssistantDebug {
  intent: string
  flow: string
  responseTimeMs: number
  events: AgentEvent[]
}

interface ChatMessage {
  type:    'user' | 'assistant'
  content: string
  agent?:  string         // assistant only
  debug?:  AssistantDebug // assistant only
}

// Starter cards shown in the empty state — one per agent the orchestrator
// can route to. Click sends the sample prompt as the user's first message.
interface Suggestion { emoji: string; label: string; prompt: string }
const SUGGESTIONS: Suggestion[] = [
  { emoji: '🍕', label: 'Hacer un pedido',     prompt: 'Quiero pedir 2 docenas de empanadas para esta noche' },
  { emoji: '🎧', label: 'Reclamo o consulta',  prompt: 'Hola, mi pedido llegó frío y faltaban dos empanadas' },
  { emoji: '✨', label: 'Ver promos del día',  prompt: '¿Qué promociones tienen hoy? Soy vegano' },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function OrchestratorTestChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages]     = useState<ChatMessage[]>([])
  const [input, setInput]           = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [debugView, setDebugView]   = useState(true)
  // Per-message expanded state for the agent label disclosure
  const [openAgentDebug, setOpenAgentDebug] = useState<Record<number, boolean>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)
  const abortRef       = useRef(false)

  useEffect(() => {
    abortRef.current = false
    setMessages([])
    setOpenAgentDebug({})
    setTimeout(() => inputRef.current?.focus(), 100)
    return () => { abortRef.current = true }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return
    setInput('')
    setMessages(prev => [...prev, { type: 'user', content: trimmed }])
    setIsThinking(true)

    const agent = routeMessage(trimmed)
    const startedAt = performance.now()

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
      const history = messages
        .filter(m => m.type === 'user' || m.type === 'assistant')
        .map(m => ({ role: m.type as 'user' | 'assistant', content: m.content }))

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 256,
          system: `Sos ${agent.name} de Big Pizza. Respondé en español rioplatense, de forma cálida y concisa (máximo 2-3 oraciones).`,
          messages: [...history, { role: 'user', content: trimmed }],
        }),
      })
      const data  = await res.json()
      const reply = data.content?.[0]?.text ?? 'No pude obtener una respuesta.'
      const elapsed = Math.round(performance.now() - startedAt)
      if (!abortRef.current) {
        setMessages(prev => [...prev, {
          type: 'assistant',
          agent: agent.name,
          content: reply,
          debug: { intent: agent.intent, flow: agent.flow, responseTimeMs: elapsed, events: agent.events },
        }])
      }
    } catch {
      if (!abortRef.current) {
        setMessages(prev => [...prev, {
          type: 'assistant',
          agent: agent.name,
          content: 'Error al conectar. Verificá la API key en .env.',
          debug: { intent: agent.intent, flow: agent.flow, responseTimeMs: 0, events: agent.events },
        }])
      }
    } finally {
      setIsThinking(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  return (
    <>
      <div style={{
        height: '100%', width: '100%',
        background: 'white',
        border: '1px solid #E2E7FF',
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 4px 16px rgba(48,79,254,0.06)',
        animation: 'fadeInOrch 0.18s ease',
        fontFamily: 'Roboto, sans-serif',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid #E2E7FF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <OrchestratorMark />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Ventas &amp; Pedidos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Debug View</span>
            <button
              onClick={() => setDebugView(v => !v)}
              aria-pressed={debugView}
              style={{
                position: 'relative', width: 40, height: 22, borderRadius: 100,
                border: 'none', cursor: 'pointer', flexShrink: 0,
                background: debugView ? '#304FFE' : '#cbd5e1',
                transition: 'background 0.15s',
              }}
            >
              <span style={{
                position: 'absolute', top: 2,
                left: debugView ? 20 : 2,
                width: 18, height: 18, borderRadius: '50%',
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'left 0.15s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}>
                {debugView && <Check size={11} color="#304FFE" />}
              </span>
            </button>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 8, border: 'none',
                background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Empty state — shown when no messages yet, centered ChatGPT-style. */}
          {messages.length === 0 && !isThinking && (
            <div style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 24, padding: '32px 8px',
            }}>
              {/* Big orchestrator icon */}
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: '#EEF2FF', border: '1px solid #C7D0FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(48,79,254,0.12)',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="#304FFE">
                  <circle cx="12" cy="12" r="2.4"/>
                  <circle cx="12" cy="3.5" r="2"/>
                  <circle cx="20.5" cy="12" r="2"/>
                  <circle cx="12" cy="20.5" r="2"/>
                  <circle cx="3.5" cy="12" r="2"/>
                  <circle cx="18" cy="6" r="1.8"/>
                  <circle cx="18" cy="18" r="1.8"/>
                  <circle cx="6" cy="18" r="1.8"/>
                  <circle cx="6" cy="6" r="1.8"/>
                </svg>
              </div>
              {/* Title + subtitle */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  Ventas &amp; Pedidos
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#64748b', lineHeight: 1.5, maxWidth: 340 }}>
                  Probá tu orquestador como si fueras un cliente. Empezá con una sugerencia o escribí tu propio mensaje.
                </p>
              </div>
              {/* Suggestion chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 380 }}>
                {SUGGESTIONS.map(sug => (
                  <button
                    key={sug.label}
                    onClick={() => send(sug.prompt)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 100,
                      border: '1px solid #E2E7FF', background: 'white',
                      cursor: 'pointer',
                      fontSize: 12.5, fontWeight: 600, color: '#0f172a',
                      lineHeight: 1.2,
                      transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#304FFE'
                      e.currentTarget.style.background  = '#F0F2FF'
                      e.currentTarget.style.color       = '#304FFE'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#E2E7FF'
                      e.currentTarget.style.background  = 'white'
                      e.currentTarget.style.color       = '#0f172a'
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{sug.emoji}</span>
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            if (msg.type === 'user') {
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    maxWidth: '80%', padding: '12px 18px', borderRadius: 22,
                    background: '#304FFE', color: 'white',
                    fontSize: 14, lineHeight: 1.45,
                  }}>
                    {msg.content}
                  </div>
                </div>
              )
            }

            const isOpen = openAgentDebug[i] ?? true

            return (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <BotAvatar />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    padding: '12px 18px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 16,
                    background: 'white',
                    fontSize: 14, lineHeight: 1.5, color: '#0f172a',
                  }}>
                    {msg.content}
                  </div>

                  {/* Agent label + collapsible debug */}
                  <div style={{ marginTop: 8 }}>
                    <button
                      onClick={() => setOpenAgentDebug(prev => ({ ...prev, [i]: !(prev[i] ?? true) }))}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: 0, border: 'none', background: 'transparent',
                        cursor: 'pointer', color: '#64748b', fontSize: 13,
                      }}
                    >
                      <span>Agent: <span style={{ color: '#0f172a' }}>{msg.agent}</span></span>
                      {debugView && msg.debug && (
                        isOpen ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />
                      )}
                    </button>

                    {debugView && msg.debug && isOpen && (
                      <ul style={{
                        listStyle: 'none', margin: '10px 0 0', padding: '0 0 0 16px',
                        borderLeft: '1px solid #E5E7EB',
                        display: 'flex', flexDirection: 'column', gap: 12,
                      }}>
                        <DebugItem label="Intención" value={msg.debug.intent} />
                        <DebugItem label="Flujo detectado" value={msg.debug.flow} />
                        <DebugItem label="Response Time" value={`${msg.debug.responseTimeMs}ms`} />
                        {msg.debug.events.length > 0 && (
                          <li style={{ position: 'relative', paddingLeft: 18 }}>
                            <span style={{
                              position: 'absolute', left: -4, top: 4,
                              width: 8, height: 8, borderRadius: '50%',
                              background: '#CBD5E1',
                            }} />
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                              Eventos <span style={{ color: '#94a3b8', fontWeight: 500 }}>({msg.debug.events.length})</span>
                            </div>
                            <ul style={{ listStyle: 'none', margin: '6px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {msg.debug.events.map((ev, k) => (
                                <li key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                                  <KindChip kind={ev.kind} />
                                  <span style={{ color: '#0f172a' }}>{ev.name}</span>
                                  <span style={{ color: '#94a3b8', marginLeft: 'auto' }}>{ev.durationMs}ms</span>
                                </li>
                              ))}
                            </ul>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {isThinking && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <BotAvatar />
              <div style={{ padding: '14px 18px', border: '1px solid #E5E7EB', borderRadius: 16, background: 'white' }}>
                <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(j => (
                    <span key={j} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#C7D0FF',
                      display: 'inline-block', animation: `orchBounce 1s ${j * 0.15}s infinite`,
                    }} />
                  ))}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px 16px', borderTop: '1px solid #F1F5F9', background: 'white', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 4px 4px 16px', background: '#F8FAFC',
            border: '1px solid #E2E8F0', borderRadius: 16,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
              placeholder="Envia un mensaje.."
              rows={1}
              style={{
                flex: 1, resize: 'none', border: 'none', background: 'transparent',
                padding: '10px 0', fontSize: 14, color: '#0f172a',
                fontFamily: 'Roboto, sans-serif', outline: 'none',
                maxHeight: 100, overflowY: 'auto',
              }}
            />
            <button
              style={{
                width: 36, height: 36, borderRadius: 100, border: 'none',
                background: 'transparent', cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8',
              }}
              title="Adjuntar"
            >
              <Paperclip size={16} />
            </button>
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isThinking}
              style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: input.trim() && !isThinking ? '#304FFE' : '#CBD5E1',
                border: 'none', cursor: input.trim() && !isThinking ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
                transition: 'background 0.15s',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInOrch   { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes orchBounce   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </>
  )
}

// ── Debug bullet ─────────────────────────────────────────────────────────────

// Color-coded chip for the event source (MCP, Base, Tool, Code).
const KIND_STYLES: Record<EventKind, { bg: string; fg: string }> = {
  MCP:  { bg: '#EEF2FF', fg: '#4338CA' },   // indigo
  Base: { bg: '#FEF3C7', fg: '#92400E' },   // amber
  Tool: { bg: '#DCFCE7', fg: '#166534' },   // green
  Code: { bg: '#F1F5F9', fg: '#475569' },   // slate
}

function KindChip({ kind }: { kind: EventKind }) {
  const s = KIND_STYLES[kind]
  return (
    <span style={{
      flexShrink: 0,
      padding: '2px 7px', borderRadius: 100,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
      background: s.bg, color: s.fg,
    }}>
      {kind.toUpperCase()}
    </span>
  )
}

function DebugItem({ label, value }: { label: string; value: string }) {
  return (
    <li style={{ position: 'relative', paddingLeft: 18 }}>
      <span style={{
        position: 'absolute', left: -4, top: 4,
        width: 8, height: 8, borderRadius: '50%',
        background: '#CBD5E1',
      }} />
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{label}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{value}</div>
    </li>
  )
}
