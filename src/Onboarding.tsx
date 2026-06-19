import { useState, useEffect, useId, useRef, useCallback } from 'react'
import { STEPS, type Step, type StepId, loadDone, saveDone, setOnboardingActive, COMMENT, ANSWERS } from './onboardingData'

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING — el camino ideal del usuario nuevo en Botmaker.
// La IA (Boti) es el copiloto persistente: saluda, guía los primeros pasos y
// acompaña al usuario hacia su primer agente y sus conversaciones en vivo.
// Lenguaje visual de la Home C (mesh aurora, glass topbar, Inter Tight).
// ─────────────────────────────────────────────────────────────────────────────

// ── Design tokens (Botmaker · alineados con Home C y Livechat) ────────────────
const T = {
  brand: '#304FFE', brand400: '#6272FF', brand600: '#2A46E8', brand700: '#1E34C4',
  brandL: '#EEF1FF', brandL2: '#E4E9FF',
  ink900: '#0A0F1F', ink700: '#2A2E3B', ink500: '#5B6172', ink400: '#8990A0',
  ink200: '#E4E6EC', ink100: '#EEF0F4', ink50: '#F7F8FB',
  white: '#FFFFFF', ok: '#16A34A', okBg: '#E9F9EF',
}
const INTER_TIGHT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const FONT = "'Roboto', system-ui, sans-serif"
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

// ── Material Symbol helper ────────────────────────────────────────────────────
function MS({ name, size = 20, color = 'currentColor', fill = 0, weight = 500, style }:
  { name: string; size?: number; color?: string; fill?: 0 | 1; weight?: number; style?: React.CSSProperties }) {
  return (
    <span className="material-symbols-rounded" style={{
      fontSize: size, color, lineHeight: 1, flexShrink: 0,
      fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
      ...style,
    }}>{name}</span>
  )
}

// ── Orb / isotipo del Asistente de IA (mismo que Livechat) ────────────────────
const ISO_A = 'M57.1384 34.5928C52.5663 34.873 48.3365 36.987 45.2069 39.8396C43.6177 41.2659 42.2729 42.896 41.1238 44.6025C39.9991 46.2581 39.0456 47.99 38.1654 49.722C36.7962 52.4982 35.5982 55.3508 34.6691 58.2544C33.96 60.4449 33.3977 62.6353 32.9576 64.8766C32.6398 66.4558 32.1019 68.3915 30.097 69.0283C28.2877 69.6141 26.1362 68.9009 24.987 67.6783C23.7645 66.3794 23.3 64.7238 22.8354 63.1447C22.2731 61.2344 21.6619 59.3751 21.0017 57.5667C20.9284 57.363 20.855 57.1847 20.7817 56.9809C20.7817 56.9809 20.7817 56.9809 20.7817 56.9555C19.9504 54.7396 18.9968 52.6001 17.8477 50.5116C17.7988 50.4097 17.7499 50.3333 17.701 50.2314C17.6521 50.1295 17.6032 50.0276 17.5299 49.9257C16.3074 47.7353 14.8893 45.5959 13.2023 43.5073C13.1778 43.4564 13.1289 43.4309 13.1045 43.38C13.1045 43.38 13.1045 43.3799 13.08 43.3545C10.1461 39.7377 7.65219 38.0567 5.32947 36.7068C4.57153 36.2738 3.64244 35.8918 2.7867 35.5861C2.7867 35.5861 2.7867 35.5861 2.76225 35.5861C1.31972 35.0767 0.0483398 34.7965 0.0483398 34.7965C0.146139 34.7965 0.708481 34.7201 1.80872 34.4145H1.83317C2.49331 34.2362 3.34905 33.9306 4.37593 33.523C4.71823 33.3957 5.06052 33.2429 5.45172 33.0646C6.03851 32.8099 6.74755 32.4024 7.50549 31.893C9.02137 30.9506 10.6351 29.7025 12.2487 28.0725C12.7622 27.5885 13.1778 27.1046 13.5201 26.6971C13.5446 26.6716 13.569 26.6207 13.5935 26.5952C19.7303 18.6995 20.3171 13.147 22.4443 6.01543C22.9088 4.41081 23.789 2.85714 24.987 1.55817C26.1362 0.335611 28.2877 -0.37753 30.097 0.20828C32.0774 0.845031 32.6398 2.78073 32.9576 4.35987C33.4222 6.60124 33.96 8.79166 34.6691 10.9821C35.6226 13.8857 36.7962 16.7383 38.1654 19.5145C39.1189 21.4248 40.1703 23.3096 41.4172 25.067C42.5174 26.6207 43.7644 28.0725 45.2069 29.3969C48.3365 32.1477 52.5663 34.2872 57.1384 34.5928Z'
const ISO_B = 'M73.8869 35.026C70.2439 35.2553 66.8943 36.9618 64.4005 39.2031C61.9066 41.4445 60.2196 44.2207 58.8015 47.0479C57.7013 49.2638 56.7722 51.5051 56.0142 53.8229C55.4519 55.5549 55.0118 57.3123 54.645 59.0697C54.3761 60.3432 53.9605 61.846 52.3712 62.3808C50.9531 62.8393 49.2172 62.2789 48.3126 61.3111C47.359 60.2923 46.9678 58.9678 46.6011 57.6943C45.2564 53.1862 43.5938 48.7034 41.0999 44.5773C41.0266 44.4499 40.9288 44.3226 40.8554 44.1952C39.9508 42.8199 36.7479 38.4645 32.2002 38.4645C23.8384 38.49 21.0756 56.6501 20.9534 57.4906C20.9534 57.516 20.9534 57.5161 20.9534 57.5161C20.9534 57.5161 20.88 57.3378 20.7333 56.9302C20.3421 55.8096 19.3642 53.339 17.7994 50.4609C17.7505 50.359 17.7016 50.2571 17.6527 50.1807C17.6038 50.0788 17.5549 49.9769 17.4815 49.8751C16.3079 47.7865 14.841 45.4942 13.0561 43.3292C10.3422 40.0691 6.94371 37.1146 2.73836 35.51C1.85818 35.1789 0.953538 34.9242 0.0244498 34.7204C0.0244498 34.7204 0.684591 34.644 1.78483 34.3638C2.51832 34.1855 3.37406 33.8799 4.35204 33.4724C5.30558 33.0648 6.35692 32.5554 7.45715 31.8423C8.97303 30.8999 10.5867 29.6519 12.2004 28.0218C12.6405 27.5633 13.105 27.0794 13.5451 26.5445C16.0634 23.5645 18.4351 19.5148 20.1465 14.0133C20.1465 14.0133 22.0781 30.798 32.0046 30.9254C32.0046 30.9254 35.5743 31.0272 41.3444 24.9908C44.5229 21.6797 45.2808 16.6876 46.5522 12.3577C46.9189 11.0842 47.3101 9.78524 48.2637 8.74097C49.1683 7.77311 50.8798 7.18728 52.3223 7.67121C53.9116 8.18061 54.3272 9.70882 54.5961 10.9823C54.9629 12.7652 55.3785 14.4972 55.9653 16.2291C56.7233 18.5469 57.6524 20.7883 58.7526 23.0042C60.1707 25.8314 61.8577 28.6076 64.3516 30.8489C66.8943 33.1158 70.2439 34.7968 73.8869 35.026Z'
function Orb({ size = 36, radius }: { size?: number; radius?: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <div style={{ width: size, height: size, borderRadius: radius ?? 999, background: T.brandL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 74 70" fill="none">
        <defs><radialGradient id={id} cx="0.3" cy="0.2" r="1"><stop offset="0" stopColor={T.brand400} /><stop offset="1" stopColor={T.brand700} /></radialGradient></defs>
        <path d={ISO_A} fill={`url(#${id})`} />
        <path d={ISO_B} fill={`url(#${id})`} />
      </svg>
    </div>
  )
}

// ── Canales (paso 2 inline) ───────────────────────────────────────────────────
const CHANNELS = [
  { id: 'whatsapp', name: 'WhatsApp', color: '#25D366', icon: 'chat' },
  { id: 'instagram', name: 'Instagram', color: '#E1306C', icon: 'photo_camera' },
  { id: 'web', name: 'Sitio web', color: '#304FFE', icon: 'language' },
]

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const [done, setDone] = useState<StepId[]>(() => loadDone() as StepId[])
  const [phase, setPhase] = useState<'welcome' | 'steps'>(() => loadDone().length > 0 ? 'steps' : 'welcome')

  const markDone = useCallback((id: StepId) => {
    setDone(prev => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      saveDone(next)
      return next
    })
  }, [])

  const reset = () => { saveDone([]); setDone([]); setPhase('welcome') }

  const allDone = done.length === STEPS.length

  return (
    <div style={{
      minHeight: '100vh', background: T.ink50, color: T.ink900,
      fontFamily: FONT, WebkitFontSmoothing: 'antialiased',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      <Mesh />
      <TopBar onReset={reset} />

      <main style={{ flex: 1, width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1, display: 'flex', minHeight: 0 }}>
        {/* ── Zona principal: hero + pasos ── */}
        <div className="bm-ob-main" style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 28px 64px' }}>
            <Hero allDone={allDone} doneCount={done.length} />
            <StepsList done={done} markDone={markDone} />
            {allDone && <CompletionCard onReset={reset} />}
          </div>
        </div>

        {/* ── Copiloto IA (panel derecho persistente) ── */}
        <AssistantPanel phase={phase} done={done} onStart={() => setPhase('steps')} allDone={allDone} />
      </main>

      <KeyFrames />
    </div>
  )
}

// ── Hero editorial (estilo Home C) ────────────────────────────────────────────
function Hero({ allDone, doneCount }: { allDone: boolean; doneCount: number }) {
  const hour = new Date().getHours()
  const part = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px 5px 8px', borderRadius: 999, background: T.brandL, border: `1px solid ${T.brandL2}`, marginBottom: 16, animation: `obFadeUp 600ms ${EASE} both` }}>
        <Orb size={20} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: T.brand }}>Te damos la bienvenida a Botmaker</span>
      </div>
      <h1 style={{
        margin: 0, fontFamily: INTER_TIGHT, fontWeight: 600,
        fontSize: 'clamp(28px, 3.4vw, 40px)', lineHeight: 1.08, letterSpacing: '-0.03em', color: T.ink900,
        animation: `obFadeUp 700ms ${EASE} 80ms both`,
      }}>
        {part}, Gonzalo.
      </h1>
      <p style={{
        margin: '6px 0 0', fontFamily: INTER_TIGHT, fontWeight: 600,
        fontSize: 'clamp(22px, 2.6vw, 30px)', lineHeight: 1.15, letterSpacing: '-0.025em',
        animation: `obFadeUp 700ms ${EASE} 140ms both`,
      }}>
        <span style={{ background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brand400} 50%, ${T.brand700} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {allDone ? '¡Tu agente está listo!' : 'Pongamos tu primer agente en marcha.'}
        </span>
      </p>
      <p style={{ margin: '14px 0 0', maxWidth: 540, fontSize: 14.5, lineHeight: 1.55, color: T.ink500, animation: `obFadeUp 700ms ${EASE} 200ms both` }}>
        {allDone
          ? 'Completaste los primeros pasos. Tu asistente sigue disponible en todo momento para ayudarte a mejorar y operar.'
          : 'Cuatro pasos cortos, con tu asistente al lado en cada uno. En menos de 10 minutos tienes un agente atendiendo.'}
      </p>
      {/* Progreso */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22, animation: `obFadeUp 700ms ${EASE} 260ms both` }}>
        <div style={{ flex: 1, maxWidth: 280, height: 7, borderRadius: 999, background: T.ink100, overflow: 'hidden' }}>
          <div style={{ width: `${(doneCount / STEPS.length) * 100}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${T.brand}, ${T.brand400})`, transition: `width 500ms ${EASE}` }} />
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink500 }}>{doneCount} de {STEPS.length} pasos</span>
      </div>
    </section>
  )
}

// ── Lista de pasos ────────────────────────────────────────────────────────────
function StepsList({ done, markDone }: { done: StepId[]; markDone: (id: StepId) => void }) {
  // El paso activo = el primero no completado
  const activeIdx = STEPS.findIndex(s => !done.includes(s.id))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {STEPS.map((step, i) => (
        <StepCard
          key={step.id}
          step={step}
          state={done.includes(step.id) ? 'done' : i === activeIdx ? 'active' : 'todo'}
          delay={300 + i * 70}
          markDone={markDone}
        />
      ))}
    </div>
  )
}

function StepCard({ step, state, delay, markDone }: { step: Step; state: 'done' | 'active' | 'todo'; delay: number; markDone: (id: StepId) => void }) {
  const [expanded, setExpanded] = useState(false)
  const isDone = state === 'done'
  const isActive = state === 'active'

  const onAction = () => {
    if (step.href) {
      markDone(step.id)               // marca como visitado y navega
      setOnboardingActive(true)
      window.location.href = step.href
    } else if (step.inline) {
      setExpanded(e => !e)
    }
  }

  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${isActive ? T.brandL2 : T.ink200}`,
      background: isDone ? T.ink50 : T.white,
      boxShadow: isActive ? '0 12px 32px -12px rgba(48,79,254,0.22)' : '0 1px 2px rgba(10,15,31,0.03)',
      padding: '18px 20px', opacity: state === 'todo' ? 0.7 : 1,
      transition: `box-shadow 300ms ${EASE}, opacity 300ms ${EASE}, border-color 300ms ${EASE}`,
      animation: `obFadeUp 600ms ${EASE} ${delay}ms both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Indicador */}
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isDone ? T.okBg : isActive ? T.brand : T.ink100,
          transition: `background 300ms ${EASE}`,
        }}>
          {isDone
            ? <MS name="check" size={22} color={T.ok} weight={600} />
            : <MS name={step.icon} size={22} color={isActive ? '#fff' : T.ink400} fill={isActive ? 1 : 0} />}
        </div>
        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? T.brand : T.ink400, letterSpacing: 0.3 }}>PASO {step.num}</span>
            <span style={{ fontSize: 11, color: T.ink400 }}>·</span>
            <span style={{ fontSize: 11, color: T.ink400, display: 'inline-flex', alignItems: 'center', gap: 3 }}><MS name="schedule" size={12} color={T.ink400} /> {step.minutes}</span>
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: isDone ? T.ink500 : T.ink900, fontFamily: INTER_TIGHT, letterSpacing: '-0.01em', marginTop: 2, textDecoration: isDone ? 'none' : 'none' }}>{step.title}</div>
          {(isActive || expanded) && <div style={{ fontSize: 13, color: T.ink500, lineHeight: 1.5, marginTop: 4 }}>{step.desc}</div>}
        </div>
        {/* CTA */}
        {isDone ? (
          step.href && (
            <button onClick={() => { window.location.href = step.href! }} style={ghostBtn()}>Abrir de nuevo</button>
          )
        ) : isActive ? (
          <button onClick={onAction} style={primaryBtn()}
            onMouseEnter={e => { e.currentTarget.style.background = T.brand600; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = T.brand; e.currentTarget.style.transform = 'translateY(0)' }}>
            {step.cta} <MS name="arrow_forward" size={16} color="#fff" />
          </button>
        ) : (
          <MS name="lock" size={18} color={T.ink400} />
        )}
      </div>

      {/* Expansión inline (canal / probar) */}
      {expanded && step.id === 'canal' && <ChannelPicker onDone={() => { setExpanded(false); markDone('canal') }} />}
      {expanded && step.id === 'probar' && <TestSandbox onDone={() => { setExpanded(false); markDone('probar') }} />}
    </div>
  )
}

// ── Paso 2 inline: elegir canal ───────────────────────────────────────────────
function ChannelPicker({ onDone }: { onDone: () => void }) {
  const [sel, setSel] = useState<string | null>(null)
  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.ink100}`, animation: `obExpand 300ms ${EASE} both` }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {CHANNELS.map(ch => {
          const on = sel === ch.id
          return (
            <button key={ch.id} onClick={() => setSel(ch.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px',
              borderRadius: 12, cursor: 'pointer', fontFamily: FONT,
              border: `2px solid ${on ? T.brand : T.ink200}`, background: on ? T.brandL : T.white,
              transition: `all 150ms ${EASE}`,
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: ch.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MS name={ch.icon} size={20} color={ch.color} fill={1} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: on ? T.brand : T.ink900 }}>{ch.name}</span>
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <button onClick={onDone} disabled={!sel} style={{ ...primaryBtn(), opacity: sel ? 1 : 0.45, cursor: sel ? 'pointer' : 'default' }}>
          Conectar canal <MS name="check" size={16} color="#fff" />
        </button>
      </div>
    </div>
  )
}

// ── Paso 3 inline: probar el agente (mini chat) ───────────────────────────────
function TestSandbox({ onDone }: { onDone: () => void }) {
  const [msgs, setMsgs] = useState<{ from: 'user' | 'bot'; text: string }[]>([
    { from: 'bot', text: '¡Hola! Soy tu nuevo agente. ¿En qué puedo ayudarte hoy?' },
  ])
  const [input, setInput] = useState('')
  const [sent, setSent] = useState(false)
  const send = () => {
    if (!input.trim()) return
    const q = input.trim()
    setMsgs(m => [...m, { from: 'user', text: q }])
    setInput('')
    setTimeout(() => {
      setMsgs(m => [...m, { from: 'bot', text: 'Perfecto, ya tomé nota. Un agente real respondería usando el contexto que configuraste. 🎯' }])
      setSent(true)
    }, 600)
  }
  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.ink100}`, animation: `obExpand 300ms ${EASE} both` }}>
      <div style={{ background: T.ink50, borderRadius: 12, border: `1px solid ${T.ink100}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '78%', padding: '9px 13px', borderRadius: m.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: m.from === 'user' ? T.brand : T.white, color: m.from === 'user' ? '#fff' : T.ink900, fontSize: 13, lineHeight: 1.45, border: m.from === 'user' ? 'none' : `1px solid ${T.ink200}`, animation: `obFadeUp 250ms ${EASE} both` }}>
            {m.text}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }} placeholder="Escribe un mensaje de prueba…" style={{ flex: 1, height: 40, padding: '0 14px', borderRadius: 10, border: `1px solid ${T.ink200}`, fontSize: 13, fontFamily: FONT, color: T.ink900, outline: 'none', background: T.white }} />
        <button onClick={send} style={{ ...primaryBtn(), padding: '0 16px' }}><MS name="send" size={16} color="#fff" /></button>
      </div>
      {sent && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onDone} style={primaryBtn()}>Funciona, continuar <MS name="check" size={16} color="#fff" /></button>
        </div>
      )}
    </div>
  )
}

// ── Card de finalización ──────────────────────────────────────────────────────
function CompletionCard({ onReset }: { onReset: () => void }) {
  return (
    <div style={{ marginTop: 20, borderRadius: 18, padding: '28px 26px', background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brand700} 100%)`, color: '#fff', animation: `obFadeUp 600ms ${EASE} both`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <MS name="celebration" size={26} color="#fff" fill={1} />
        <span style={{ fontFamily: INTER_TIGHT, fontWeight: 600, fontSize: 22, letterSpacing: '-0.02em' }}>¡Listo, terminaste el onboarding!</span>
      </div>
      <p style={{ margin: '0 0 18px', fontSize: 14.5, lineHeight: 1.55, opacity: 0.92, maxWidth: 520 }}>
        Tu agente está configurado y conectado. Desde aquí puedes gestionar todo, y tu asistente sigue disponible en cada superficie para ayudarte.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a href="/chats-diferente" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 20px', borderRadius: 999, background: '#fff', color: T.brand, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          <MS name="forum" size={17} color={T.brand} /> Ir a conversaciones
        </a>
        <a href="/home-c" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 20px', borderRadius: 999, background: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
          <MS name="home" size={17} color="#fff" /> Ir al inicio
        </a>
        <button onClick={onReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 18px', borderRadius: 999, background: 'transparent', color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: 13.5, border: 'none', cursor: 'pointer', fontFamily: FONT }}>
          <MS name="restart_alt" size={16} color="rgba(255,255,255,0.85)" /> Reiniciar demo
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ASISTENTE — copiloto persistente (panel derecho)
// ─────────────────────────────────────────────────────────────────────────────
function AssistantPanel({ phase, done, onStart, allDone }: { phase: 'welcome' | 'steps'; done: StepId[]; onStart: () => void; allDone: boolean }) {
  const [thread, setThread] = useState<{ role: 'ai' | 'user'; text: string }[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const greetedRef = useRef(false)

  const streamWords = useCallback((text: string, onFinish?: () => void) => {
    const words = text.split(' '); let i = 0; let built = ''
    setStreaming(true); setStreamText('')
    const tick = () => {
      if (i >= words.length) { setStreaming(false); onFinish?.(); return }
      built += (i > 0 ? ' ' : '') + words[i++]
      setStreamText(built)
      streamRef.current = setTimeout(tick, 30 + Math.random() * 26)
    }
    tick()
  }, [])

  const pushAI = useCallback((text: string) => {
    setThread(t => [...t, { role: 'ai', text: '' }])
    streamWords(text, () => {
      setThread(t => { const c = [...t]; c[c.length - 1] = { role: 'ai', text }; return c })
      setStreamText('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
    })
  }, [streamWords])

  // Saludo inicial (una sola vez)
  useEffect(() => {
    if (greetedRef.current) return
    greetedRef.current = true
    const greeting = done.length > 0
      ? 'Seguimos donde lo dejamos. Te marco el próximo paso a la derecha — cualquier duda, pregúntame.'
      : 'Hola, soy Boti, tu asistente. Te voy a acompañar en cada paso para que pongas tu primer agente a atender. ¿Empezamos?'
    setTimeout(() => pushAI(greeting), 400)
    return () => { if (streamRef.current) clearTimeout(streamRef.current) }
  }, []) // eslint-disable-line

  // Comentar progreso cuando cambia `done`
  const prevDone = useRef(done.length)
  useEffect(() => {
    if (done.length > prevDone.current) {
      prevDone.current = done.length
      const last = done[done.length - 1]
      const msg = allDone
        ? '¡Excelente! Completaste todos los pasos. Tu agente ya puede atender. Voy a estar en cada pantalla por si necesitás una mano.'
        : COMMENT[last] ?? '¡Genial! Vamos por el siguiente.'
      setTimeout(() => pushAI(msg), 300)
    }
  }, [done, allDone, pushAI])

  const suggestions = allDone
    ? ['¿Cómo mido los resultados?', '¿Puedo agregar otro canal?']
    : phase === 'welcome'
    ? ['¿Qué es un agente de IA?', '¿Cuánto tarda?']
    : ['¿Qué hace este paso?', 'Dame un ejemplo']

  const ask = (q: string) => {
    setThread(t => [...t, { role: 'user', text: q }])
    setTimeout(() => pushAI(ANSWERS[q] ?? 'Buena pregunta. En el producto real te respondo con el contexto de tu cuenta; acá es una demo del acompañamiento.'), 350)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }

  return (
    <aside className="bm-ob-aside" style={{
      width: 380, flexShrink: 0, background: T.white, borderLeft: `1px solid ${T.ink200}`,
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: `1px solid ${T.ink100}`, flexShrink: 0 }}>
        <div style={{ animation: 'obFloat 3.5s ease-in-out infinite', display: 'flex' }}><Orb size={38} radius={12} /></div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: T.ink900, fontFamily: INTER_TIGHT }}>Boti · Asistente de IA</div>
          <div style={{ fontSize: 11.5, color: T.ok, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: T.ok }} /> En línea · te acompaña
          </div>
        </div>
      </div>

      {/* Thread */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {thread.map((m, i) => {
          const isLastAI = i === thread.length - 1 && m.role === 'ai' && streaming
          const text = isLastAI ? streamText : m.text
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', animation: `obFadeUp 280ms ${EASE} both` }}>
              {m.role === 'ai' && <div style={{ marginTop: 2 }}><Orb size={26} radius={8} /></div>}
              <div style={{
                maxWidth: '82%', padding: '10px 13px', fontSize: 13.5, lineHeight: 1.5,
                borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                background: m.role === 'user' ? T.brand : T.ink50,
                color: m.role === 'user' ? '#fff' : T.ink900,
                border: m.role === 'user' ? 'none' : `1px solid ${T.ink100}`,
              }}>
                {text}{isLastAI && <span style={{ display: 'inline-block', width: 6, height: 14, marginLeft: 2, background: T.brand, borderRadius: 2, animation: 'obBlink 1s step-end infinite', verticalAlign: 'middle' }} />}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* CTA principal en welcome */}
      {phase === 'welcome' && !streaming && thread.length > 0 && (
        <div style={{ padding: '0 18px 14px', flexShrink: 0 }}>
          <button onClick={onStart} style={{ width: '100%', ...primaryBtn(), justifyContent: 'center', height: 46, fontSize: 15 }}
            onMouseEnter={e => { e.currentTarget.style.background = T.brand600 }}
            onMouseLeave={e => { e.currentTarget.style.background = T.brand }}>
            Empecemos <MS name="arrow_forward" size={18} color="#fff" />
          </button>
        </div>
      )}

      {/* Sugerencias + input */}
      <div style={{ padding: '12px 18px 18px', borderTop: `1px solid ${T.ink100}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => ask(s)} style={{ padding: '6px 12px', borderRadius: 999, border: `1px solid ${T.ink200}`, background: T.white, color: T.ink700, fontSize: 12, fontFamily: FONT, cursor: 'pointer', transition: `all 150ms ${EASE}` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.brand }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.ink200; e.currentTarget.style.color = T.ink700 }}>
              {s}
            </button>
          ))}
        </div>
        <AssistantInput onSend={ask} />
      </div>
    </aside>
  )
}

function AssistantInput({ onSend }: { onSend: (q: string) => void }) {
  const [v, setV] = useState('')
  const send = () => { if (!v.trim()) return; onSend(v.trim()); setV('') }
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: T.ink50, border: `1px solid ${T.ink200}`, borderRadius: 12, padding: '4px 4px 4px 14px' }}>
      <input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }} placeholder="Pregúntale a Boti…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, fontFamily: FONT, color: T.ink900 }} />
      <button onClick={send} style={{ width: 34, height: 34, borderRadius: 9, border: 'none', background: T.brand, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <MS name="arrow_upward" size={18} color="#fff" />
      </button>
    </div>
  )
}

// ── Topbar glass (estilo Home C) ──────────────────────────────────────────────
function TopBar({ onReset }: { onReset: () => void }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(247,248,251,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${T.ink200}70`, padding: '0 20px', height: 58,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Orb size={30} radius={9} />
        <span style={{ fontFamily: INTER_TIGHT, fontSize: 15, fontWeight: 600, color: T.ink900, letterSpacing: '-0.01em' }}>Primeros pasos</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={onReset} title="Reiniciar demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, border: `1px solid ${T.ink200}`, background: 'rgba(255,255,255,0.7)', color: T.ink500, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: FONT }}>
          <MS name="restart_alt" size={15} color={T.ink500} /> Reiniciar
        </button>
        <a href="/home-c" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, border: `1px solid ${T.ink200}`, background: 'rgba(255,255,255,0.7)', color: T.ink700, fontSize: 12.5, fontWeight: 500, textDecoration: 'none' }}>
          <MS name="home" size={15} color={T.ink700} /> Inicio
        </a>
      </div>
    </header>
  )
}

// ── Mesh aurora (idéntico a Home C) ───────────────────────────────────────────
function Mesh() {
  return (
    <>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, top: 0, height: 720,
        backgroundImage: [
          'radial-gradient(60% 40% at 20% 10%, rgba(48, 79, 254, 0.16) 0%, transparent 60%)',
          'radial-gradient(40% 30% at 80% 0%, rgba(98, 114, 255, 0.20) 0%, transparent 70%)',
          'radial-gradient(50% 40% at 50% 100%, rgba(48, 79, 254, 0.07) 0%, transparent 70%)',
        ].join(', '),
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div aria-hidden style={{
        position: 'absolute', inset: 0, top: 0, height: 720,
        backgroundImage: [
          'linear-gradient(to right, rgba(10,15,31,0.035) 1px, transparent 1px)',
          'linear-gradient(to bottom, rgba(10,15,31,0.035) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '48px 48px',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 80%)',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 80%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
    </>
  )
}

// ── Botones ───────────────────────────────────────────────────────────────────
function primaryBtn(): React.CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 999, background: T.brand, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', transition: `all 200ms ${EASE}`, flexShrink: 0 }
}
function ghostBtn(): React.CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, background: T.white, color: T.ink500, border: `1px solid ${T.ink200}`, cursor: 'pointer', fontFamily: FONT, fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }
}

// ── Animaciones + responsive ──────────────────────────────────────────────────
function KeyFrames() {
  return (
    <style>{`
      @keyframes obFadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      @keyframes obFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
      @keyframes obBlink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
      @keyframes obExpand { from { opacity: 0; max-height: 0 } to { opacity: 1; max-height: 600px } }
      @media (max-width: 900px) {
        .bm-ob-aside { display: none !important; }
      }
    `}</style>
  )
}
