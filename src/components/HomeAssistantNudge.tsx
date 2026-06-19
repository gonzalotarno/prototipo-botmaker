import { useState, useEffect, useId } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// HomeAssistantNudge — la IA "aparece saludando" en la Home para usuarios nuevos.
// Burbuja flotante (bottom-right) que invita a empezar los primeros pasos.
// Se monta sobre /home-c sin tocar Home.tsx. Recuerda si fue descartada.
// ─────────────────────────────────────────────────────────────────────────────

const BRAND = '#304FFE', BRAND400 = '#6272FF', BRAND700 = '#1E34C4', BRANDL = '#EEF1FF'
const INK = '#0A0F1F', INK500 = '#5B6172', INK200 = '#E4E6EC'
const INTER_TIGHT = "'Inter Tight', 'Inter', system-ui, sans-serif"
const FONT = "'Roboto', system-ui, sans-serif"

const ISO_A = 'M57.1384 34.5928C52.5663 34.873 48.3365 36.987 45.2069 39.8396C43.6177 41.2659 42.2729 42.896 41.1238 44.6025C39.9991 46.2581 39.0456 47.99 38.1654 49.722C36.7962 52.4982 35.5982 55.3508 34.6691 58.2544C33.96 60.4449 33.3977 62.6353 32.9576 64.8766C32.6398 66.4558 32.1019 68.3915 30.097 69.0283C28.2877 69.6141 26.1362 68.9009 24.987 67.6783C23.7645 66.3794 23.3 64.7238 22.8354 63.1447C22.2731 61.2344 21.6619 59.3751 21.0017 57.5667C20.9284 57.363 20.855 57.1847 20.7817 56.9809C20.7817 56.9809 20.7817 56.9809 20.7817 56.9555C19.9504 54.7396 18.9968 52.6001 17.8477 50.5116C17.7988 50.4097 17.7499 50.3333 17.701 50.2314C17.6521 50.1295 17.6032 50.0276 17.5299 49.9257C16.3074 47.7353 14.8893 45.5959 13.2023 43.5073C13.1778 43.4564 13.1289 43.4309 13.1045 43.38C13.1045 43.38 13.1045 43.3799 13.08 43.3545C10.1461 39.7377 7.65219 38.0567 5.32947 36.7068C4.57153 36.2738 3.64244 35.8918 2.7867 35.5861C2.7867 35.5861 2.7867 35.5861 2.76225 35.5861C1.31972 35.0767 0.0483398 34.7965 0.0483398 34.7965C0.146139 34.7965 0.708481 34.7201 1.80872 34.4145H1.83317C2.49331 34.2362 3.34905 33.9306 4.37593 33.523C4.71823 33.3957 5.06052 33.2429 5.45172 33.0646C6.03851 32.8099 6.74755 32.4024 7.50549 31.893C9.02137 30.9506 10.6351 29.7025 12.2487 28.0725C12.7622 27.5885 13.1778 27.1046 13.5201 26.6971C13.5446 26.6716 13.569 26.6207 13.5935 26.5952C19.7303 18.6995 20.3171 13.147 22.4443 6.01543C22.9088 4.41081 23.789 2.85714 24.987 1.55817C26.1362 0.335611 28.2877 -0.37753 30.097 0.20828C32.0774 0.845031 32.6398 2.78073 32.9576 4.35987C33.4222 6.60124 33.96 8.79166 34.6691 10.9821C35.6226 13.8857 36.7962 16.7383 38.1654 19.5145C39.1189 21.4248 40.1703 23.3096 41.4172 25.067C42.5174 26.6207 43.7644 28.0725 45.2069 29.3969C48.3365 32.1477 52.5663 34.2872 57.1384 34.5928Z'
const ISO_B = 'M73.8869 35.026C70.2439 35.2553 66.8943 36.9618 64.4005 39.2031C61.9066 41.4445 60.2196 44.2207 58.8015 47.0479C57.7013 49.2638 56.7722 51.5051 56.0142 53.8229C55.4519 55.5549 55.0118 57.3123 54.645 59.0697C54.3761 60.3432 53.9605 61.846 52.3712 62.3808C50.9531 62.8393 49.2172 62.2789 48.3126 61.3111C47.359 60.2923 46.9678 58.9678 46.6011 57.6943C45.2564 53.1862 43.5938 48.7034 41.0999 44.5773C41.0266 44.4499 40.9288 44.3226 40.8554 44.1952C39.9508 42.8199 36.7479 38.4645 32.2002 38.4645C23.8384 38.49 21.0756 56.6501 20.9534 57.4906C20.9534 57.516 20.9534 57.5161 20.9534 57.5161C20.9534 57.5161 20.88 57.3378 20.7333 56.9302C20.3421 55.8096 19.3642 53.339 17.7994 50.4609C17.7505 50.359 17.7016 50.2571 17.6527 50.1807C17.6038 50.0788 17.5549 49.9769 17.4815 49.8751C16.3079 47.7865 14.841 45.4942 13.0561 43.3292C10.3422 40.0691 6.94371 37.1146 2.73836 35.51C1.85818 35.1789 0.953538 34.9242 0.0244498 34.7204C0.0244498 34.7204 0.684591 34.644 1.78483 34.3638C2.51832 34.1855 3.37406 33.8799 4.35204 33.4724C5.30558 33.0648 6.35692 32.5554 7.45715 31.8423C8.97303 30.8999 10.5867 29.6519 12.2004 28.0218C12.6405 27.5633 13.105 27.0794 13.5451 26.5445C16.0634 23.5645 18.4351 19.5148 20.1465 14.0133C20.1465 14.0133 22.0781 30.798 32.0046 30.9254C32.0046 30.9254 35.5743 31.0272 41.3444 24.9908C44.5229 21.6797 45.2808 16.6876 46.5522 12.3577C46.9189 11.0842 47.3101 9.78524 48.2637 8.74097C49.1683 7.77311 50.8798 7.18728 52.3223 7.67121C53.9116 8.18061 54.3272 9.70882 54.5961 10.9823C54.9629 12.7652 55.3785 14.4972 55.9653 16.2291C56.7233 18.5469 57.6524 20.7883 58.7526 23.0042C60.1707 25.8314 61.8577 28.6076 64.3516 30.8489C66.8943 33.1158 70.2439 34.7968 73.8869 35.026Z'
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

export default function HomeAssistantNudge() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(true)

  // Aparece con un pequeño delay para sentirse "vivo"
  useEffect(() => {
    const dismissed = (() => { try { return sessionStorage.getItem('bm_home_nudge_dismissed') === '1' } catch { return false } })()
    if (dismissed) { setVisible(false); return }
    const t = setTimeout(() => setOpen(true), 1100)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    setOpen(false)
    try { sessionStorage.setItem('bm_home_nudge_dismissed', '1') } catch { /* noop */ }
  }

  if (!visible) return null

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, fontFamily: FONT }}>
      {/* Tarjeta de saludo */}
      {open && (
        <div style={{
          width: 320, background: '#fff', borderRadius: 18, border: `1px solid ${INK200}`,
          boxShadow: '0 24px 60px -16px rgba(10,15,31,0.28)', overflow: 'hidden',
          animation: 'bmNudgeIn 360ms cubic-bezier(0.16,1,0.3,1) both',
        }}>
          {/* Header con gradiente */}
          <div style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND700} 100%)`, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 11, position: 'relative' }}>
            <div style={{ animation: 'bmNudgeFloat 3.5s ease-in-out infinite' }}><Orb size={36} /></div>
            <div style={{ color: '#fff' }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, fontFamily: INTER_TIGHT }}>Boti · Asistente de IA</div>
              <div style={{ fontSize: 11.5, opacity: 0.9, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: '#7CFFB0' }} /> En línea
              </div>
            </div>
            <button onClick={dismiss} aria-label="Cerrar" style={{ position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 17 }}>close</span>
            </button>
          </div>
          {/* Cuerpo */}
          <div style={{ padding: '16px 18px 18px' }}>
            <p style={{ margin: '0 0 14px', fontSize: 13.5, lineHeight: 1.55, color: INK }}>
              ¡Hola Gonzalo! 👋 Soy tu asistente. ¿Quieres que te acompañe a poner tu primer agente en marcha? Son unos pocos pasos.
            </p>
            <a href="/onboarding" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              width: '100%', boxSizing: 'border-box', padding: '11px 18px', borderRadius: 999,
              background: BRAND, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600,
            }}>
              Empezar primeros pasos
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_forward</span>
            </a>
            <button onClick={dismiss} style={{ width: '100%', marginTop: 8, padding: '8px', border: 'none', background: 'transparent', color: INK500, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: FONT }}>
              Explorar por mi cuenta
            </button>
          </div>
        </div>
      )}

      {/* Botón flotante (orb) — abre/cierra la tarjeta */}
      <button onClick={() => setOpen(o => !o)} title="Asistente de IA" style={{
        width: 58, height: 58, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
        background: '#fff', boxShadow: '0 10px 28px -6px rgba(48,79,254,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: open ? 'none' : 'bmNudgePulse 2.4s ease-in-out infinite',
      }}>
        <Orb size={44} />
      </button>

      <style>{`
        @keyframes bmNudgeIn { from { opacity: 0; transform: translateY(14px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes bmNudgeFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        @keyframes bmNudgePulse { 0%,100% { box-shadow: 0 10px 28px -6px rgba(48,79,254,0.45) } 50% { box-shadow: 0 10px 28px -6px rgba(48,79,254,0.45), 0 0 0 8px rgba(48,79,254,0.10) } }
      `}</style>
    </div>
  )
}
