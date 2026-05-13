import { useState, useEffect, useRef } from 'react'
import { X, Send } from 'lucide-react'

// Tester for a single Lógica — mirrors OrchestratorTestChat's panel layout but
// drops the routing animation and scenario picker. The conversation goes
// straight to the logic's behavior; the "agent" replying is the logic itself.

interface LogicDef {
  id:          string
  name:        string
  description?: string
  trigger?:    string
}

interface ChatMessage {
  type:    'user' | 'assistant'
  content: string
}

export default function LogicTestChat({ logic, onClose }: { logic: LogicDef; onClose: () => void }) {
  const [messages, setMessages]     = useState<ChatMessage[]>([])
  const [input, setInput]           = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)
  const abortRef       = useRef(false)

  useEffect(() => {
    abortRef.current = false
    setMessages([{
      type: 'assistant',
      content: `¡Hola! Estoy probando la lógica "${logic.name}". Escribime como si fueras un cliente y voy a responder siguiendo este flujo. ${logic.trigger ? `Se activa: ${logic.trigger.split('.')[0]}.` : ''}`.trim(),
    }])
    setTimeout(() => inputRef.current?.focus(), 100)
    return () => { abortRef.current = true }
  }, [logic.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return
    setInput('')
    setMessages(prev => [...prev, { type: 'user', content: trimmed }])
    setIsThinking(true)

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
          system: `Sos un agente que ejecuta la lógica conversacional "${logic.name}"${logic.description ? ` (${logic.description})` : ''}${logic.trigger ? `. Esta lógica se activa: ${logic.trigger}` : ''}. Respondé en español rioplatense, de forma cálida y concisa (máximo 2-3 oraciones), siguiendo estrictamente el flujo conversacional de esta lógica.`,
          messages: [...history, { role: 'user', content: trimmed }],
        }),
      })
      const data  = await res.json()
      const reply = data.content?.[0]?.text ?? 'No pude obtener una respuesta.'
      if (!abortRef.current) setMessages(prev => [...prev, { type: 'assistant', content: reply }])
    } catch {
      if (!abortRef.current) setMessages(prev => [...prev, { type: 'assistant', content: 'Error al conectar. Verificá la API key en .env.' }])
    } finally {
      setIsThinking(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 40,
        background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(2px)',
        animation: 'fadeInBackdrop 0.2s ease',
      }} />

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
        width: 440, background: '#F8F9FF',
        borderLeft: '1px solid #E2E7FF',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(48,79,254,0.12)',
        animation: 'slideInLogicPanel 0.25s ease',
        fontFamily: 'Roboto, sans-serif',
      }}>

        {/* Header */}
        <div style={{
          background: 'white', borderBottom: '1px solid #E2E7FF',
          padding: '0 20px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: '#EEF2FF',
              border: '1px solid #C7D0FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src="/avatar-ai.svg"
                style={{ width: 20, height: 20, filter: 'brightness(0) saturate(100%) invert(23%) sepia(93%) saturate(7484%) hue-rotate(234deg) brightness(101%) contrast(101%)' }}
              />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#212121', lineHeight: 1 }}>Probar lógica</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9E9E9E', lineHeight: 1 }}>{logic.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8, background: '#f1f5f9',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#9E9E9E',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
          >
            <X size={14} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => {
            if (msg.type === 'user') {
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', animation: 'fadeUp 0.2s ease' }}>
                  <div style={{
                    maxWidth: '78%', padding: '10px 14px', borderRadius: '18px 18px 4px 18px',
                    background: '#304FFE', color: 'white', fontSize: 13, lineHeight: 1.5,
                  }}>
                    {msg.content}
                  </div>
                </div>
              )
            }
            return (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', animation: 'fadeUp 0.3s ease' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: '#EEF2FF', border: '1px solid #C7D0FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img
                    src="/avatar-ai.svg"
                    style={{ width: 14, height: 14, filter: 'brightness(0) saturate(100%) invert(23%) sepia(93%) saturate(7484%) hue-rotate(234deg) brightness(101%) contrast(101%)' }}
                  />
                </div>
                <div style={{ maxWidth: '78%' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#304FFE' }}>{logic.name}</p>
                  <div style={{
                    padding: '10px 14px', borderRadius: '18px 18px 18px 4px',
                    background: 'white', border: '1px solid #E2E7FF',
                    fontSize: 13, lineHeight: 1.5, color: '#212121',
                    boxShadow: '0 2px 8px rgba(48,79,254,0.06)',
                  }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}

          {isThinking && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: '#EEF2FF', border: '1px solid #C7D0FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img
                  src="/avatar-ai.svg"
                  style={{ width: 14, height: 14, filter: 'brightness(0) saturate(100%) invert(23%) sepia(93%) saturate(7484%) hue-rotate(234deg) brightness(101%) contrast(101%)' }}
                />
              </div>
              <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'white', border: '1px solid #ECEEFF' }}>
                <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(j => (
                    <span key={j} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#C7D0FF',
                      display: 'inline-block', animation: `bounce 1s ${j * 0.15}s infinite`,
                    }} />
                  ))}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E2E7FF', background: 'white', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
              placeholder="Escribí como si fueras un cliente…"
              rows={1}
              style={{
                flex: 1, resize: 'none', borderRadius: 12,
                background: '#F8F9FF', border: '1px solid #E2E7FF',
                padding: '10px 14px', fontSize: 13, color: '#424242',
                fontFamily: 'Roboto, sans-serif', outline: 'none',
                maxHeight: 100, overflowY: 'auto', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#304FFE')}
              onBlur={e => (e.target.style.borderColor = '#E2E7FF')}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isThinking}
              style={{
                width: 38, height: 38, borderRadius: 100, flexShrink: 0,
                background: input.trim() && !isThinking ? '#304FFE' : '#E0E0E0',
                border: 'none', cursor: input.trim() && !isThinking ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: input.trim() && !isThinking ? 'white' : '#9E9E9E',
                transition: 'background 0.15s',
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInLogicPanel { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </>
  )
}
