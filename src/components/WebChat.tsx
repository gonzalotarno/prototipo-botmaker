import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, HelpCircle, ArrowLeft } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `Sos un asistente experto en la herramienta de automatización de flows de Botmaker.
Tu rol es ayudar a los usuarios a entender cómo usar el canvas de automatización.

La herramienta permite crear flujos de conversación con 3 tipos de nodos:
- **Instrucción**: Define qué debe hacer el agente en ese paso. Puede tener integraciones (Google Sheets, Gmail, Google Calendar, WhatsApp, Slack, MercadoPago, Stripe, OpenAI, Airtable, PostgreSQL, Fetch MCP, Brave Search). Tiene salida de éxito y de error cuando tiene integraciones activas.
- **Condicional**: Evalúa una condición y bifurca el flujo (Sí/No).
- **Loop**: Itera sobre una lista de elementos.

Para agregar integraciones en un nodo de Instrucción:
- Escribí "/" o "$" en el prompt del nodo para abrir el selector de integraciones
- Seleccioná la integración y se insertará como un chip inline en el texto
- Hacé click en el icono ⚙️ de la fila de integración para configurar cuenta, conexión y acciones habilitadas

Las integraciones funcionan como toolkits MCP: todas las acciones están habilitadas por defecto y podés desactivar las que no querés permitir.

Respondé siempre en español, de forma concisa y útil.`

const ONBOARDING_STEPS = [
  {
    title: 'Creá tus nodos',
    description: 'Agregá nodos al canvas: Instrucción para definir una tarea del agente, Condicional para bifurcar el flujo, o Loop para iterar sobre una lista.',
  },
  {
    title: 'Escribí el prompt de cada paso',
    description: 'En cada nodo de Instrucción describí qué debe hacer el agente. Sé específico: el agente ejecuta exactamente lo que le indicás.',
  },
  {
    title: 'Conectá integraciones',
    description: 'Usá "/" o "$" dentro del prompt para insertar integraciones como chips (Google Sheets, Gmail, WhatsApp y más). Hacé click en la fila de la integración para configurar cuenta y acciones.',
  },
  {
    title: 'Conectá los nodos entre sí',
    description: 'Arrastrá desde los handles de salida de un nodo hacia la entrada del siguiente para definir el orden del flujo. Los nodos con integración tienen salida de éxito y de error.',
  },
]

type View = 'chat' | 'help'

export default function WebChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<View>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '¡Hola! Soy tu asistente para el canvas de automatización. ¿En qué puedo ayudarte?',
      }])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && view === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, view])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
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
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const reply = data.content?.[0]?.text ?? 'No pude obtener una respuesta.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error al conectar con el asistente. Verificá la API key en el archivo .env.',
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-5 z-50 flex flex-col bg-white rounded-2xl overflow-hidden"
          style={{
            width: 360,
            height: 520,
            boxShadow: '0 8px 40px rgba(48,79,254,0.18), 0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid #E2E7FF',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: '#304FFE' }}
          >
            <div className="flex items-center gap-2.5">
              {view === 'help' && (
                <button
                  onClick={() => setView('chat')}
                  className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-all -ml-1 mr-0.5"
                >
                  <ArrowLeft size={15} />
                </button>
              )}
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  {view === 'help' ? 'Primeros pasos' : 'Asistente'}
                </p>
                <p className="text-[10px] text-blue-200 leading-tight">Canvas de automatización</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {view === 'chat' && (
                <button
                  onClick={() => setView('help')}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-all"
                  title="Primeros pasos"
                >
                  <HelpCircle size={15} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-all"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── Help view ── */}
          {view === 'help' && (
            <div className="flex-1 overflow-y-auto">
              {/* Intro */}
              <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-800 leading-snug">
                  Cómo usar el canvas ✨
                </h2>
                <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
                  Seguí estos pasos para armar tu primer flujo de automatización.
                </p>
              </div>

              {/* Steps */}
              <div className="px-5 py-5">
                {ONBOARDING_STEPS.map((step, i) => {
                  const isLast = i === ONBOARDING_STEPS.length - 1
                  return (
                    <div key={i} className="flex gap-4">
                      {/* Number + line */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: '#304FFE', color: 'white' }}
                        >
                          {i + 1}
                        </div>
                        {!isLast && (
                          <div
                            className="w-px flex-1 mt-2 mb-2"
                            style={{ background: '#E2E7FF', minHeight: 24 }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`pb-${isLast ? '0' : '5'} pt-1 min-w-0`} style={{ paddingBottom: isLast ? 0 : 20 }}>
                        <p className="text-sm font-semibold text-slate-800 leading-tight">
                          {step.title}
                        </p>
                        <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => setView('chat')}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#304FFE' }}
                >
                  Tengo una pregunta →
                </button>
              </div>
            </div>
          )}

          {/* ── Chat view ── */}
          {view === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                        style={{ background: '#304FFE' }}
                      >
                        <Bot size={12} className="text-white" />
                      </div>
                    )}
                    <div
                      className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                      style={
                        msg.role === 'user'
                          ? { background: '#304FFE', color: 'white', borderBottomRightRadius: 4 }
                          : { background: '#F0F2FF', color: '#1e293b', borderBottomLeftRadius: 4 }
                      }
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                      style={{ background: '#304FFE' }}
                    >
                      <Bot size={12} className="text-white" />
                    </div>
                    <div
                      className="px-3.5 py-2.5 rounded-2xl text-sm"
                      style={{ background: '#F0F2FF', borderBottomLeftRadius: 4 }}
                    >
                      <span className="flex gap-1 items-center h-5">
                        {[0, 1, 2].map(j => (
                          <span
                            key={j}
                            className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                            style={{ animationDelay: `${j * 0.15}s` }}
                          />
                        ))}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t border-slate-100 flex-shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribí tu pregunta…"
                    rows={1}
                    className="flex-1 resize-none rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#304FFE]/50 focus:bg-white transition-colors"
                    style={{ maxHeight: 100, overflowY: 'auto' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: input.trim() && !isLoading ? '#304FFE' : '#e2e8f0',
                      color: input.trim() && !isLoading ? 'white' : '#94a3b8',
                    }}
                  >
                    <Send size={15} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-300 mt-1.5 text-center">
                  Enter para enviar · Shift+Enter nueva línea
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB button — offset to avoid overlapping ReactFlow MiniMap */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-5 right-[220px] z-50 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          width: 52,
          height: 52,
          background: '#304FFE',
          boxShadow: '0 4px 20px rgba(48,79,254,0.4)',
        }}
      >
        {isOpen
          ? <X size={20} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
      </button>
    </>
  )
}
