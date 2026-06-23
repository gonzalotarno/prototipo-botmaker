import { useState, useId } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// AgentTemplates — punto de partida al crear un agente de IA.
// Plantillas listas (Ventas, Leads, Soporte, Turnos, FAQ) + empezar en blanco.
// Patrón estándar de onboarding: reduce el time-to-value. Al elegir, guarda la
// plantilla y entra al editor (/estados-a). Lenguaje visual de Home C.
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  brand: '#304FFE', brand400: '#6272FF', brand600: '#2A46E8', brand700: '#1E34C4', brandL: '#EEF1FF', brandL2: '#E4E9FF',
  ink900: '#0A0F1F', ink700: '#2A2E3B', ink500: '#5B6172', ink400: '#8990A0', ink200: '#E4E6EC', ink100: '#EEF0F4', ink50: '#F7F8FB',
  white: '#FFFFFF',
}
const INTER_TIGHT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const FONT = "'Roboto', system-ui, sans-serif"
const EASE = 'cubic-bezier(0.16,1,0.3,1)'

function MS({ name, size = 20, color = 'currentColor', fill = 0, weight = 500 }: { name: string; size?: number; color?: string; fill?: 0 | 1; weight?: number }) {
  return <span className="material-symbols-rounded" style={{ fontSize: size, color, lineHeight: 1, flexShrink: 0, fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}` }}>{name}</span>
}

const ISO_A = 'M57.1384 34.5928C52.5663 34.873 48.3365 36.987 45.2069 39.8396C43.6177 41.2659 42.2729 42.896 41.1238 44.6025C39.9991 46.2581 39.0456 47.99 38.1654 49.722C36.7962 52.4982 35.5982 55.3508 34.6691 58.2544C33.96 60.4449 33.3977 62.6353 32.9576 64.8766C32.6398 66.4558 32.1019 68.3915 30.097 69.0283C28.2877 69.6141 26.1362 68.9009 24.987 67.6783C23.7645 66.3794 23.3 64.7238 22.8354 63.1447C22.2731 61.2344 21.6619 59.3751 21.0017 57.5667C20.9284 57.363 20.855 57.1847 20.7817 56.9809C20.7817 56.9809 20.7817 56.9809 20.7817 56.9555C19.9504 54.7396 18.9968 52.6001 17.8477 50.5116C17.7988 50.4097 17.7499 50.3333 17.701 50.2314C17.6521 50.1295 17.6032 50.0276 17.5299 49.9257C16.3074 47.7353 14.8893 45.5959 13.2023 43.5073C13.1778 43.4564 13.1289 43.4309 13.1045 43.38C13.1045 43.38 13.1045 43.3799 13.08 43.3545C10.1461 39.7377 7.65219 38.0567 5.32947 36.7068C4.57153 36.2738 3.64244 35.8918 2.7867 35.5861C2.7867 35.5861 2.7867 35.5861 2.76225 35.5861C1.31972 35.0767 0.0483398 34.7965 0.0483398 34.7965C0.146139 34.7965 0.708481 34.7201 1.80872 34.4145H1.83317C2.49331 34.2362 3.34905 33.9306 4.37593 33.523C4.71823 33.3957 5.06052 33.2429 5.45172 33.0646C6.03851 32.8099 6.74755 32.4024 7.50549 31.893C9.02137 30.9506 10.6351 29.7025 12.2487 28.0725C12.7622 27.5885 13.1778 27.1046 13.5201 26.6971C13.5446 26.6716 13.569 26.6207 13.5935 26.5952C19.7303 18.6995 20.3171 13.147 22.4443 6.01543C22.9088 4.41081 23.789 2.85714 24.987 1.55817C26.1362 0.335611 28.2877 -0.37753 30.097 0.20828C32.0774 0.845031 32.6398 2.78073 32.9576 4.35987C33.4222 6.60124 33.96 8.79166 34.6691 10.9821C35.6226 13.8857 36.7962 16.7383 38.1654 19.5145C39.1189 21.4248 40.1703 23.3096 41.4172 25.067C42.5174 26.6207 43.7644 28.0725 45.2069 29.3969C48.3365 32.1477 52.5663 34.2872 57.1384 34.5928Z'
const ISO_B = 'M73.8869 35.026C70.2439 35.2553 66.8943 36.9618 64.4005 39.2031C61.9066 41.4445 60.2196 44.2207 58.8015 47.0479C57.7013 49.2638 56.7722 51.5051 56.0142 53.8229C55.4519 55.5549 55.0118 57.3123 54.645 59.0697C54.3761 60.3432 53.9605 61.846 52.3712 62.3808C50.9531 62.8393 49.2172 62.2789 48.3126 61.3111C47.359 60.2923 46.9678 58.9678 46.6011 57.6943C45.2564 53.1862 43.5938 48.7034 41.0999 44.5773C41.0266 44.4499 40.9288 44.3226 40.8554 44.1952C39.9508 42.8199 36.7479 38.4645 32.2002 38.4645C23.8384 38.49 21.0756 56.6501 20.9534 57.4906C20.9534 57.516 20.9534 57.5161 20.9534 57.5161C20.9534 57.5161 20.88 57.3378 20.7333 56.9302C20.3421 55.8096 19.3642 53.339 17.7994 50.4609C17.7505 50.359 17.7016 50.2571 17.6527 50.1807C17.6038 50.0788 17.5549 49.9769 17.4815 49.8751C16.3079 47.7865 14.841 45.4942 13.0561 43.3292C10.3422 40.0691 6.94371 37.1146 2.73836 35.51C1.85818 35.1789 0.953538 34.9242 0.0244498 34.7204C0.0244498 34.7204 0.684591 34.644 1.78483 34.3638C2.51832 34.1855 3.37406 33.8799 4.35204 33.4724C5.30558 33.0648 6.35692 32.5554 7.45715 31.8423C8.97303 30.8999 10.5867 29.6519 12.2004 28.0218C12.6405 27.5633 13.105 27.0794 13.5451 26.5445C16.0634 23.5645 18.4351 19.5148 20.1465 14.0133C20.1465 14.0133 22.0781 30.798 32.0046 30.9254C32.0046 30.9254 35.5743 31.0272 41.3444 24.9908C44.5229 21.6797 45.2808 16.6876 46.5522 12.3577C46.9189 11.0842 47.3101 9.78524 48.2637 8.74097C49.1683 7.77311 50.8798 7.18728 52.3223 7.67121C53.9116 8.18061 54.3272 9.70882 54.5961 10.9823C54.9629 12.7652 55.3785 14.4972 55.9653 16.2291C56.7233 18.5469 57.6524 20.7883 58.7526 23.0042C60.1707 25.8314 61.8577 28.6076 64.3516 30.8489C66.8943 33.1158 70.2439 34.7968 73.8869 35.026Z'
function Orb({ size = 30 }: { size?: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: T.brandL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 74 70" fill="none">
        <defs><radialGradient id={id} cx="0.3" cy="0.2" r="1"><stop offset="0" stopColor={T.brand400} /><stop offset="1" stopColor={T.brand700} /></radialGradient></defs>
        <path d={ISO_A} fill={`url(#${id})`} /><path d={ISO_B} fill={`url(#${id})`} />
      </svg>
    </div>
  )
}

// ── Plantillas ────────────────────────────────────────────────────────────────
interface Template {
  id: string
  icon: string
  color: string
  name: string
  tagline: string
  desc: string
  skills: string[]
  channel: string
  popular?: boolean
}
const TEMPLATES: Template[] = [
  {
    id: 'ventas', icon: 'sell', color: '#304FFE', name: 'Agente de Ventas', tagline: 'Convierte interesados en clientes',
    desc: 'Responde consultas de producto, arma cotizaciones y guía la compra hasta el cierre.',
    skills: ['Cotiza', 'Recomienda', 'Cierra'], channel: 'WhatsApp', popular: true,
  },
  {
    id: 'leads', icon: 'filter_alt', color: '#7C3AED', name: 'Calificador de Leads', tagline: 'Captura y califica oportunidades',
    desc: 'Hace las preguntas correctas, detecta intención de compra y deriva los leads calientes a tu equipo.',
    skills: ['Califica', 'Prioriza', 'Deriva'], channel: 'Instagram', popular: true,
  },
  {
    id: 'soporte', icon: 'support_agent', color: '#0D9488', name: 'Agente de Soporte', tagline: 'Resuelve dudas e incidencias',
    desc: 'Responde preguntas frecuentes, resuelve casos comunes y escala a una persona cuando hace falta.',
    skills: ['Responde', 'Resuelve', 'Escala'], channel: 'Web',
  },
  {
    id: 'turnos', icon: 'event_available', color: '#EA580C', name: 'Agendador de Turnos', tagline: 'Coordina citas automáticamente',
    desc: 'Ofrece disponibilidad, agenda turnos y envía recordatorios sin intervención humana.',
    skills: ['Agenda', 'Confirma', 'Recuerda'], channel: 'WhatsApp',
  },
  {
    id: 'faq', icon: 'quiz', color: '#2563EB', name: 'Asistente de FAQ', tagline: 'Responde preguntas frecuentes',
    desc: 'Aprende de tus documentos y responde al instante las dudas más comunes de tus clientes.',
    skills: ['Aprende', 'Responde', 'Cita fuentes'], channel: 'Web',
  },
  {
    id: 'postventa', icon: 'local_shipping', color: '#16A34A', name: 'Postventa y Envíos', tagline: 'Acompaña después de la compra',
    desc: 'Informa estado de pedidos, gestiona cambios y devoluciones, y mantiene al cliente al tanto.',
    skills: ['Rastrea', 'Gestiona', 'Notifica'], channel: 'WhatsApp',
  },
]

export default function AgentTemplates() {
  const [selected, setSelected] = useState<string | null>(null)

  const choose = (id: string) => {
    setSelected(id)
    try { sessionStorage.setItem('bm_agent_template', id) } catch { /* noop */ }
    // pequeña pausa para que se vea la selección y luego entra al editor
    setTimeout(() => { window.location.href = '/estados-a' }, 320)
  }

  return (
    <div style={{ minHeight: '100vh', background: T.ink50, color: T.ink900, fontFamily: FONT, WebkitFontSmoothing: 'antialiased', position: 'relative', overflow: 'hidden' }}>
      {/* Mesh */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, top: 0, height: 600, backgroundImage: ['radial-gradient(60% 40% at 20% 10%, rgba(48,79,254,0.14) 0%, transparent 60%)', 'radial-gradient(40% 30% at 80% 0%, rgba(98,114,255,0.18) 0%, transparent 70%)'].join(', '), pointerEvents: 'none', zIndex: 0 }} />

      {/* Topbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(247,248,251,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: `1px solid ${T.ink200}70`, padding: '0 20px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Orb size={30} />
          <span style={{ fontFamily: INTER_TIGHT, fontSize: 15, fontWeight: 600, color: T.ink900, letterSpacing: '-0.01em' }}>Crear agente</span>
        </div>
        <a href="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, border: `1px solid ${T.ink200}`, background: 'rgba(255,255,255,0.7)', color: T.ink700, fontSize: 12.5, fontWeight: 500, textDecoration: 'none' }}>
          <MS name="arrow_back" size={15} color={T.ink700} /> Primeros pasos
        </a>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 1080, margin: '0 auto', padding: '36px 28px 72px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px 5px 8px', borderRadius: 999, background: T.brandL, border: `1px solid ${T.brandL2}`, marginBottom: 16, animation: `atUp 600ms ${EASE} both` }}>
            <Orb size={20} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: T.brand }}>Paso 1 · Crea tu primer agente</span>
          </div>
          <h1 style={{ margin: 0, fontFamily: INTER_TIGHT, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 38px)', lineHeight: 1.1, letterSpacing: '-0.03em', color: T.ink900, animation: `atUp 700ms ${EASE} 80ms both` }}>
            Elige un punto de partida
          </h1>
          <p style={{ margin: '12px auto 0', maxWidth: 520, fontSize: 14.5, lineHeight: 1.55, color: T.ink500, animation: `atUp 700ms ${EASE} 160ms both` }}>
            Empieza con una plantilla lista para tu caso o desde cero. Puedes ajustar todo después — los pasos, los datos y las instrucciones.
          </p>
        </div>

        {/* Grid de plantillas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {TEMPLATES.map((tpl, i) => (
            <TemplateCard key={tpl.id} tpl={tpl} selected={selected === tpl.id} dimmed={selected !== null && selected !== tpl.id} delay={220 + i * 60} onChoose={() => choose(tpl.id)} />
          ))}
        </div>

        {/* Empezar en blanco */}
        <button onClick={() => choose('blank')} style={{
          display: 'flex', alignItems: 'center', gap: 14, width: '100%', boxSizing: 'border-box', marginTop: 16,
          padding: '18px 22px', borderRadius: 16, border: `1.5px dashed ${T.ink200}`, background: 'transparent',
          cursor: 'pointer', fontFamily: FONT, textAlign: 'left', transition: `all 180ms ${EASE}`,
          opacity: selected && selected !== 'blank' ? 0.5 : 1, animation: `atUp 700ms ${EASE} 580ms both`,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.background = T.white }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.ink200; e.currentTarget.style.background = 'transparent' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: T.ink100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MS name="add" size={24} color={T.ink500} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: T.ink900, fontFamily: INTER_TIGHT }}>Empezar en blanco</div>
            <div style={{ fontSize: 13, color: T.ink500, marginTop: 2 }}>Construye tu agente paso a paso, sin plantilla.</div>
          </div>
          <MS name="arrow_forward" size={20} color={T.ink400} />
        </button>
      </main>

      <style>{`
        @keyframes atUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}

function TemplateCard({ tpl, selected, dimmed, delay, onChoose }: { tpl: Template; selected: boolean; dimmed: boolean; delay: number; onChoose: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onChoose} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      position: 'relative', display: 'flex', flexDirection: 'column', textAlign: 'left', cursor: 'pointer', fontFamily: FONT,
      padding: '20px 20px 18px', borderRadius: 16,
      border: `1.5px solid ${selected ? tpl.color : hover ? T.ink200 : T.ink100}`,
      background: T.white,
      boxShadow: selected ? `0 16px 38px -12px ${tpl.color}55` : hover ? '0 14px 34px -14px rgba(10,15,31,0.18)' : '0 1px 2px rgba(10,15,31,0.03)',
      transform: hover && !selected ? 'translateY(-2px)' : 'translateY(0)',
      opacity: dimmed ? 0.5 : 1,
      transition: `all 200ms ${EASE}`, animation: `atUp 600ms ${EASE} ${delay}ms both`,
    }}>
      {tpl.popular && (
        <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 10.5, fontWeight: 700, color: tpl.color, background: tpl.color + '14', padding: '3px 9px', borderRadius: 999, letterSpacing: 0.3 }}>POPULAR</span>
      )}
      <div style={{ width: 46, height: 46, borderRadius: 13, background: tpl.color + '16', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <MS name={tpl.icon} size={24} color={tpl.color} fill={1} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: T.ink900, fontFamily: INTER_TIGHT, letterSpacing: '-0.01em' }}>{tpl.name}</div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: tpl.color, marginTop: 2 }}>{tpl.tagline}</div>
      <p style={{ margin: '10px 0 14px', fontSize: 13, lineHeight: 1.5, color: T.ink500, flex: 1 }}>{tpl.desc}</p>
      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {tpl.skills.map(s => (
          <span key={s} style={{ fontSize: 11, fontWeight: 500, color: T.ink700, background: T.ink50, border: `1px solid ${T.ink100}`, padding: '3px 9px', borderRadius: 999 }}>{s}</span>
        ))}
      </div>
      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${T.ink100}` }}>
        <span style={{ fontSize: 11.5, color: T.ink400, display: 'inline-flex', alignItems: 'center', gap: 4 }}><MS name="hub" size={13} color={T.ink400} /> {tpl.channel}</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: tpl.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {selected ? 'Creando…' : 'Usar plantilla'} <MS name={selected ? 'progress_activity' : 'arrow_forward'} size={15} color={tpl.color} />
        </span>
      </div>
    </button>
  )
}
