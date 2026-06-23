import { useState, useEffect, useId, useRef, useCallback } from 'react'
import { STEPS, type StepId, loadDone, saveDone, setOnboardingActive, isOnboardingActive, COMMENT, ANSWERS } from '../onboardingData'

// ─────────────────────────────────────────────────────────────────────────────
// GlobalAssistant — asistente asistente que está EN TODAS LAS SUPERFICIES.
// · ABIERTO: drawer grande a la derecha (como livechat) con la CHECKLIST adentro
//   (primeros pasos) + chat de asistente (saludo, comentarios, Q&A).
// · CERRADO: orb (bottom-right) y, arriba, burbujas de comentarios proactivos
//   ("Sigue completando tu agente", "Conecta un canal"…) que vas viendo.
// El progreso vive en sessionStorage, así asistente sigue al usuario por todas las pantallas.
// ─────────────────────────────────────────────────────────────────────────────

const BRAND = '#304FFE', BRAND400 = '#6272FF', BRAND600 = '#2A46E8', BRAND700 = '#1E34C4', BRANDL = '#EEF1FF', BRANDL2 = '#E4E9FF'
const INK = '#0A0F1F', INK500 = '#5B6172', INK400 = '#8990A0', INK200 = '#E4E6EC', INK100 = '#EEF0F4', INK50 = '#F7F8FB'
const OK = '#16A34A'
const INTER_TIGHT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const FONT = "'Roboto', system-ui, sans-serif"
const EASE = 'cubic-bezier(0.16,1,0.3,1)'

const ISO_A = 'M57.1384 34.5928C52.5663 34.873 48.3365 36.987 45.2069 39.8396C43.6177 41.2659 42.2729 42.896 41.1238 44.6025C39.9991 46.2581 39.0456 47.99 38.1654 49.722C36.7962 52.4982 35.5982 55.3508 34.6691 58.2544C33.96 60.4449 33.3977 62.6353 32.9576 64.8766C32.6398 66.4558 32.1019 68.3915 30.097 69.0283C28.2877 69.6141 26.1362 68.9009 24.987 67.6783C23.7645 66.3794 23.3 64.7238 22.8354 63.1447C22.2731 61.2344 21.6619 59.3751 21.0017 57.5667C20.9284 57.363 20.855 57.1847 20.7817 56.9809C20.7817 56.9809 20.7817 56.9809 20.7817 56.9555C19.9504 54.7396 18.9968 52.6001 17.8477 50.5116C17.7988 50.4097 17.7499 50.3333 17.701 50.2314C17.6521 50.1295 17.6032 50.0276 17.5299 49.9257C16.3074 47.7353 14.8893 45.5959 13.2023 43.5073C13.1778 43.4564 13.1289 43.4309 13.1045 43.38C13.1045 43.38 13.1045 43.3799 13.08 43.3545C10.1461 39.7377 7.65219 38.0567 5.32947 36.7068C4.57153 36.2738 3.64244 35.8918 2.7867 35.5861C2.7867 35.5861 2.7867 35.5861 2.76225 35.5861C1.31972 35.0767 0.0483398 34.7965 0.0483398 34.7965C0.146139 34.7965 0.708481 34.7201 1.80872 34.4145H1.83317C2.49331 34.2362 3.34905 33.9306 4.37593 33.523C4.71823 33.3957 5.06052 33.2429 5.45172 33.0646C6.03851 32.8099 6.74755 32.4024 7.50549 31.893C9.02137 30.9506 10.6351 29.7025 12.2487 28.0725C12.7622 27.5885 13.1778 27.1046 13.5201 26.6971C13.5446 26.6716 13.569 26.6207 13.5935 26.5952C19.7303 18.6995 20.3171 13.147 22.4443 6.01543C22.9088 4.41081 23.789 2.85714 24.987 1.55817C26.1362 0.335611 28.2877 -0.37753 30.097 0.20828C32.0774 0.845031 32.6398 2.78073 32.9576 4.35987C33.4222 6.60124 33.96 8.79166 34.6691 10.9821C35.6226 13.8857 36.7962 16.7383 38.1654 19.5145C39.1189 21.4248 40.1703 23.3096 41.4172 25.067C42.5174 26.6207 43.7644 28.0725 45.2069 29.3969C48.3365 32.1477 52.5663 34.2872 57.1384 34.5928Z'
const ISO_B = 'M73.8869 35.026C70.2439 35.2553 66.8943 36.9618 64.4005 39.2031C61.9066 41.4445 60.2196 44.2207 58.8015 47.0479C57.7013 49.2638 56.7722 51.5051 56.0142 53.8229C55.4519 55.5549 55.0118 57.3123 54.645 59.0697C54.3761 60.3432 53.9605 61.846 52.3712 62.3808C50.9531 62.8393 49.2172 62.2789 48.3126 61.3111C47.359 60.2923 46.9678 58.9678 46.6011 57.6943C45.2564 53.1862 43.5938 48.7034 41.0999 44.5773C41.0266 44.4499 40.9288 44.3226 40.8554 44.1952C39.9508 42.8199 36.7479 38.4645 32.2002 38.4645C23.8384 38.49 21.0756 56.6501 20.9534 57.4906C20.9534 57.516 20.9534 57.5161 20.9534 57.5161C20.9534 57.5161 20.88 57.3378 20.7333 56.9302C20.3421 55.8096 19.3642 53.339 17.7994 50.4609C17.7505 50.359 17.7016 50.2571 17.6527 50.1807C17.6038 50.0788 17.5549 49.9769 17.4815 49.8751C16.3079 47.7865 14.841 45.4942 13.0561 43.3292C10.3422 40.0691 6.94371 37.1146 2.73836 35.51C1.85818 35.1789 0.953538 34.9242 0.0244498 34.7204C0.0244498 34.7204 0.684591 34.644 1.78483 34.3638C2.51832 34.1855 3.37406 33.8799 4.35204 33.4724C5.30558 33.0648 6.35692 32.5554 7.45715 31.8423C8.97303 30.8999 10.5867 29.6519 12.2004 28.0218C12.6405 27.5633 13.105 27.0794 13.5451 26.5445C16.0634 23.5645 18.4351 19.5148 20.1465 14.0133C20.1465 14.0133 22.0781 30.798 32.0046 30.9254C32.0046 30.9254 35.5743 31.0272 41.3444 24.9908C44.5229 21.6797 45.2808 16.6876 46.5522 12.3577C46.9189 11.0842 47.3101 9.78524 48.2637 8.74097C49.1683 7.77311 50.8798 7.18728 52.3223 7.67121C53.9116 8.18061 54.3272 9.70882 54.5961 10.9823C54.9629 12.7652 55.3785 14.4972 55.9653 16.2291C56.7233 18.5469 57.6524 20.7883 58.7526 23.0042C60.1707 25.8314 61.8577 28.6076 64.3516 30.8489C66.8943 33.1158 70.2439 34.7968 73.8869 35.026Z'
function MS({ name, size = 20, color = 'currentColor', fill = 0, weight = 500 }: { name: string; size?: number; color?: string; fill?: 0 | 1; weight?: number }) {
  return <span className="material-symbols-rounded" style={{ fontSize: size, color, lineHeight: 1, flexShrink: 0, fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}` }}>{name}</span>
}
function Orb({ size = 36 }: { size?: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: BRANDL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 74 70" fill="none">
        <defs><radialGradient id={id} cx="0.3" cy="0.2" r="1"><stop offset="0" stopColor={BRAND400} /><stop offset="1" stopColor={BRAND700} /></radialGradient></defs>
        <path d={ISO_A} fill={`url(#${id})`} /><path d={ISO_B} fill={`url(#${id})`} />
      </svg>
    </div>
  )
}

// Nudges proactivos (burbujas arriba del orb) según el próximo paso
const NUDGE: Record<StepId, string> = {
  agente: 'Empecemos: crea tu primer agente 🚀',
  canal: 'Buen avance. Ahora conecta un canal 🔌',
  probar: 'Probá tu agente como un cliente 💬',
  chats: 'Último paso: mira tus conversaciones 📥',
}

export default function GlobalAssistant() {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState<StepId[]>(() => loadDone())
  const [thread, setThread] = useState<{ role: 'ai' | 'user'; text: string }[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [bubbleDismissed, setBubbleDismissed] = useState(false)
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const greetedRef = useRef(false)
  const prevDone = useRef(done.length)

  const onboardingActive = isOnboardingActive()
  const activeIdx = STEPS.findIndex(s => !done.includes(s.id))
  const allDone = done.length === STEPS.length
  const activeStep = activeIdx >= 0 ? STEPS[activeIdx] : null

  const streamWords = useCallback((text: string, onFinish?: () => void) => {
    const words = text.split(' '); let i = 0; let built = ''
    setStreaming(true); setStreamText('')
    const tick = () => {
      if (i >= words.length) { setStreaming(false); onFinish?.(); return }
      built += (i > 0 ? ' ' : '') + words[i++]
      setStreamText(built)
      streamRef.current = setTimeout(tick, 26 + Math.random() * 22)
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

  // Saludo inicial (se siembra una vez, así al abrir el drawer ves el historial)
  useEffect(() => {
    if (greetedRef.current) return
    greetedRef.current = true
    const greeting = allDone
      ? '¡Listo! Completaste los primeros pasos. Estoy en cada pantalla por si necesitás una mano.'
      : onboardingActive
      ? 'Seguimos con tu configuración. Acá abajo tenés tus primeros pasos — el próximo está resaltado.'
      : 'Hola, soy tu asistente de IA. Te acompaño en todas las pantallas. Empecemos por tus primeros pasos 👇'
    setTimeout(() => pushAI(greeting), 300)
    return () => { if (streamRef.current) clearTimeout(streamRef.current) }
  }, []) // eslint-disable-line

  // Al completar un paso: comentario en el chat + reaparece la burbuja
  useEffect(() => {
    if (done.length > prevDone.current) {
      prevDone.current = done.length
      const last = done[done.length - 1]
      const msg = allDone
        ? '¡Excelente! Completaste todos los pasos. Tu agente ya puede atender 🎉'
        : COMMENT[last] ?? '¡Genial! Vamos por el siguiente.'
      setTimeout(() => pushAI(msg), 250)
      setBubbleDismissed(false)
    }
  }, [done, allDone, pushAI])

  const goStep = (id: StepId) => {
    const step = STEPS.find(s => s.id === id)!
    setOnboardingActive(true)
    if (step.href) {
      const next = done.includes(id) ? done : [...done, id]
      saveDone(next); setDone(next)
      window.location.href = step.href
    } else {
      window.location.href = '/onboarding'
    }
  }

  const ask = (q: string) => {
    setThread(t => [...t, { role: 'user', text: q }])
    setTimeout(() => pushAI(ANSWERS[q] ?? 'Buena pregunta. En el producto real te respondo con el contexto de tu cuenta; acá es una demo del acompañamiento.'), 300)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }

  const suggestions = allDone
    ? ['¿Cómo mido los resultados?', '¿Puedo agregar otro canal?']
    : ['¿Qué es un agente de IA?', 'Dame un ejemplo']

  const pct = Math.round((done.length / STEPS.length) * 100)

  return (
    <>
      {/* ══════ DRAWER (abierto) ══════════════════════════════════════════ */}
      {open && (
        <div role="dialog" aria-label="Asistente de IA" style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 100000,
          width: 412, maxWidth: '94vw', background: '#fff', borderLeft: `1px solid ${INK200}`,
          boxShadow: '-16px 0 48px -16px rgba(10,15,31,0.30)', display: 'flex', flexDirection: 'column',
          fontFamily: FONT, animation: `bmGaDrawer 300ms ${EASE} both`,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: `1px solid ${INK100}`, flexShrink: 0 }}>
            <div style={{ animation: 'bmGaFloat 3.5s ease-in-out infinite' }}><Orb size={40} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: INK, fontFamily: INTER_TIGHT }}>Asistente de IA</div>
              <div style={{ fontSize: 11.5, color: OK, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: OK }} /> En línea · te acompaña
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar" style={{ width: 34, height: 34, borderRadius: 999, border: 'none', background: INK50, color: INK500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MS name="close" size={20} color={INK500} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {/* ── CHECKLIST adentro del asistente ── */}
            <div style={{ padding: '16px 18px' }}>
              <div style={{ borderRadius: 14, border: `1px solid ${INK100}`, background: INK50, padding: '14px 14px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: INK, fontFamily: INTER_TIGHT }}>{allDone ? '¡Todo listo! 🎉' : 'Primeros pasos'}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: INK500 }}>{done.length}/{STEPS.length}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                  <span style={{ fontSize: 14 }}>{allDone ? '🎉' : '👏'}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 999, background: INK100, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${BRAND}, ${BRAND400})`, transition: `width 500ms ${EASE}` }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: INK500, minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {STEPS.map((step, i) => {
                    const isDone = done.includes(step.id)
                    const isActive = !allDone && i === activeIdx
                    const clickable = isDone || isActive
                    return (
                      <button key={step.id} onClick={() => clickable && goStep(step.id)} disabled={!clickable} style={{
                        display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
                        padding: '9px 9px', borderRadius: 10, border: 'none',
                        background: isActive ? '#fff' : 'transparent',
                        boxShadow: isActive ? `0 2px 10px -4px ${BRAND}40` : 'none',
                        cursor: clickable ? 'pointer' : 'default', fontFamily: FONT, transition: `all 150ms ${EASE}`,
                      }}
                        onMouseEnter={e => { if (clickable && !isActive) e.currentTarget.style.background = '#fff' }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? '#fff' : isActive ? BRAND : INK100, border: isDone ? `1.5px solid ${OK}` : 'none' }}>
                          {isDone ? <MS name="check" size={16} color={OK} weight={700} /> : <MS name={step.icon} size={15} color={isActive ? '#fff' : INK400} fill={isActive ? 1 : 0} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: isDone ? INK400 : INK, textDecoration: isDone ? 'line-through' : 'none', textDecorationColor: INK200 }}>{step.title}</div>
                          {isActive && <div style={{ fontSize: 11, color: BRAND600, fontWeight: 600, marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}>{step.cta} <MS name="arrow_forward" size={12} color={BRAND600} /></div>}
                        </div>
                        {!clickable && <MS name="lock" size={14} color={INK400} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: INK100, margin: '0 18px' }} />

            {/* ── Chat de asistente ── */}
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {thread.map((m, i) => {
                const isLastAI = i === thread.length - 1 && m.role === 'ai' && streaming
                const text = isLastAI ? streamText : m.text
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', animation: `bmGaUp 260ms ${EASE} both` }}>
                    {m.role === 'ai' && <div style={{ marginTop: 2 }}><Orb size={26} /></div>}
                    <div style={{
                      maxWidth: '82%', padding: '10px 13px', fontSize: 13.5, lineHeight: 1.5,
                      borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                      background: m.role === 'user' ? BRAND : INK50,
                      color: m.role === 'user' ? '#fff' : INK,
                      border: m.role === 'user' ? 'none' : `1px solid ${INK100}`,
                    }}>
                      {text}{isLastAI && <span style={{ display: 'inline-block', width: 5, height: 14, marginLeft: 2, background: BRAND, borderRadius: 2, animation: 'bmGaBlink 1s step-end infinite', verticalAlign: 'middle' }} />}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Sugerencias + input */}
          <div style={{ padding: '12px 18px 18px', borderTop: `1px solid ${INK100}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => ask(s)} style={{ padding: '6px 12px', borderRadius: 999, border: `1px solid ${INK200}`, background: '#fff', color: INK500, fontSize: 12, fontFamily: FONT, cursor: 'pointer', transition: `all 150ms ${EASE}` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.color = BRAND }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = INK200; e.currentTarget.style.color = INK500 }}>
                  {s}
                </button>
              ))}
            </div>
            <Input onSend={ask} />
          </div>
        </div>
      )}

      {/* ══════ CERRADO (orb + burbujas de comentarios arriba) ════════════ */}
      {!open && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, fontFamily: FONT }}>
          {/* Burbuja proactiva */}
          {!bubbleDismissed && (activeStep || allDone) && (
            <div style={{
              position: 'relative', maxWidth: 268, background: '#fff', borderRadius: '16px 16px 4px 16px',
              border: `1px solid ${INK200}`, boxShadow: '0 14px 34px -12px rgba(10,15,31,0.24)',
              padding: '12px 32px 12px 14px', animation: `bmGaBubble 360ms ${EASE} both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <Orb size={18} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: INK500 }}>Asistente de IA</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: INK }}>
                {allDone ? '¡Tu agente ya puede atender! 🎉 Tocá para ver más.' : NUDGE[activeStep!.id]}
              </p>
              <button onClick={e => { e.stopPropagation(); setBubbleDismissed(true) }} aria-label="Descartar" style={{ position: 'absolute', top: 7, right: 7, width: 22, height: 22, borderRadius: 999, border: 'none', background: 'transparent', color: INK400, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MS name="close" size={15} color={INK400} />
              </button>
              {/* CTA: abrir y continuar */}
              {!allDone && (
                <button onClick={() => { setBubbleDismissed(false); setOpen(true) }} style={{ marginTop: 9, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 999, border: 'none', background: BRAND, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
                  {activeStep!.cta} <MS name="arrow_forward" size={13} color="#fff" />
                </button>
              )}
            </div>
          )}

          {/* Orb launcher */}
          <button onClick={() => setOpen(true)} title="Asistente de IA" style={{
            position: 'relative', width: 58, height: 58, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
            background: '#fff', boxShadow: '0 10px 28px -6px rgba(48,79,254,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'bmGaPulse 2.6s ease-in-out infinite',
          }}>
            <Orb size={44} />
            {!allDone && (
              <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 20, height: 20, padding: '0 5px', borderRadius: 999, background: BRAND, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                {STEPS.length - done.length}
              </span>
            )}
          </button>
        </div>
      )}

      <style>{`
        @keyframes bmGaDrawer { from { opacity: 0; transform: translateX(28px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes bmGaBubble { from { opacity: 0; transform: translateY(10px) scale(0.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes bmGaUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes bmGaFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        @keyframes bmGaBlink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
        @keyframes bmGaPulse { 0%,100% { box-shadow: 0 10px 28px -6px rgba(48,79,254,0.45) } 50% { box-shadow: 0 10px 28px -6px rgba(48,79,254,0.45), 0 0 0 8px rgba(48,79,254,0.10) } }
      `}</style>
    </>
  )
}

function Input({ onSend }: { onSend: (q: string) => void }) {
  const [v, setV] = useState('')
  const send = () => { if (!v.trim()) return; onSend(v.trim()); setV('') }
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: INK50, border: `1px solid ${INK200}`, borderRadius: 12, padding: '4px 4px 4px 14px' }}>
      <input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send() }} placeholder="Escribe tu pregunta…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, fontFamily: FONT, color: INK }} />
      <button onClick={send} style={{ width: 34, height: 34, borderRadius: 9, border: 'none', background: BRAND, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <MS name="arrow_upward" size={18} color="#fff" />
      </button>
    </div>
  )
}
