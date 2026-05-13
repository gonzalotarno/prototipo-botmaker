import { useState } from 'react'
import { Sparkles, ArrowRight, X } from 'lucide-react'
import { color } from './ds'
import AgentsTopBar from './components/AgentsTopBar'

// Icono del agente IA — avatarAI.svg (oficial, viewBox 140×140). Usa currentColor.
function AiAgentIcon({ size = 18, color: c = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M99.2461 25.3076C100.22 22.6748 103.944 22.6748 104.918 25.3076C108.282 34.3981 115.128 41.7254 123.879 45.7206L125.308 49.5829L123.879 53.4443C115.128 57.4395 108.282 64.7677 104.918 73.8583C103.974 76.4088 100.45 76.4887 99.3447 74.0976L99.2461 73.8583C95.6855 64.236 88.2246 56.5855 78.7314 52.7753L77.8066 52.4189C75.1738 51.4447 75.1738 47.7212 77.8066 46.747C87.7393 43.0716 95.5707 35.2402 99.2461 25.3076ZM102.082 38.582C99.0812 42.8586 95.3576 46.5822 91.081 49.5829C95.3574 52.5836 99.0813 56.3066 102.082 60.5829C105.083 56.3068 108.806 52.5835 113.082 49.5829C108.806 46.5822 105.083 42.8583 102.082 38.582ZM123.879 45.7206C124.69 46.0908 125.515 46.4354 126.357 46.747C128.99 47.7212 128.99 51.4447 126.357 52.4189C125.515 52.7305 124.69 53.0742 123.879 53.4443L125.308 49.5829L123.879 45.7206Z" fill={c}/>
      <path d="M23.3327 58.3337C22.9853 58.3337 22.6379 58.5083 22.4642 58.9156L22.0589 60.0212C20.5535 64.0362 17.427 67.2365 13.374 68.7494L12.274 69.1567C11.4634 69.4476 11.4634 70.5532 12.274 70.8441L13.374 71.2514C17.3691 72.7643 20.5535 75.9065 22.0589 79.9796L22.4642 81.0852C22.6379 81.4925 22.9853 81.6671 23.3327 81.6671C23.6801 81.6671 24.0275 81.4925 24.2012 81.0852L24.6065 79.9796C26.1118 75.9647 29.2384 72.7643 33.2913 71.2514L34.3914 70.8441C35.202 70.5532 35.202 69.4476 34.3914 69.1567L33.2913 68.7494C29.2963 67.2365 26.1118 64.0943 24.6065 60.0212L24.2012 58.9156C24.0275 58.5083 23.6801 58.3337 23.3327 58.3337Z" fill={c}/>
      <path d="M69.9933 83.1248C89.9935 83.1248 107.579 93.4517 117.713 109.044C120.366 113.126 120.014 117.763 117.758 121.243C115.559 124.633 111.621 126.875 107.133 126.875H32.8536C28.3657 126.875 24.4273 124.633 22.2286 121.243C19.9722 117.763 19.6204 113.126 22.2735 109.044C32.4073 93.4518 49.993 83.1248 69.9933 83.1248ZM69.9933 91.8748C53.0781 91.8748 38.1976 100.598 29.6095 113.812C28.972 114.793 29.0569 115.692 29.5694 116.482C30.1398 117.362 31.3028 118.125 32.8536 118.125H107.133C108.684 118.125 109.847 117.362 110.417 116.482C110.93 115.692 111.015 114.793 110.377 113.812C101.789 100.598 86.9084 91.8748 69.9933 91.8748Z" fill={c}/>
      <path d="M42.2891 46.666C42.2892 31.3634 54.6944 18.9582 69.9971 18.958C75.0367 18.958 79.7745 20.3078 83.8545 22.668C85.946 23.8778 86.661 26.554 85.4512 28.6455C84.2413 30.7369 81.5651 31.4511 79.4736 30.2412C76.6896 28.6307 73.4575 27.708 69.9971 27.708C59.5269 27.7082 51.0392 36.1959 51.0391 46.666C51.0391 57.1363 59.5268 65.6248 69.9971 65.625C71.6404 65.625 73.229 65.4163 74.7402 65.0273C77.0801 64.4252 79.465 65.834 80.0674 68.1738C80.6697 70.5138 79.2609 72.8997 76.9209 73.502C74.7033 74.0727 72.3821 74.375 69.9971 74.375C54.6943 74.3748 42.2891 61.9688 42.2891 46.666Z" fill={c}/>
    </svg>
  )
}

// Icono del orquestador — Material Symbols "hub" (24×24, viewBox 0 -960 960 960).
function OrchestratorIcon({ size = 18, color: c = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 -960 960 960" fill={c} xmlns="http://www.w3.org/2000/svg">
      <path d="M155-75q-35-35-35-85t35-85q35-35 85-35 14 0 26 3t23 8l57-71q-28-31-39-70t-5-78l-81-27q-17 25-43 40t-58 15q-50 0-85-35T0-580q0-50 35-85t85-35q50 0 85 35t35 85v8l81 28q20-36 53.5-61t75.5-32v-87q-39-11-64.5-42.5T360-840q0-50 35-85t85-35q50 0 85 35t35 85q0 42-26 73.5T510-724v87q42 7 75.5 32t53.5 61l81-28v-8q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-32 0-58.5-15T739-515l-81 27q6 39-5 77.5T614-340l57 70q11-5 23-7.5t26-2.5q50 0 85 35t35 85q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-20 6.5-38.5T624-232l-57-71q-41 23-87.5 23T392-303l-56 71q11 15 17.5 33.5T360-160q0 50-35 85t-85 35q-50 0-85-35Zm-35-465q17 0 28.5-11.5T160-580q0-17-11.5-28.5T120-620q-17 0-28.5 11.5T80-580q0 17 11.5 28.5T120-540Zm148.5 408.5Q280-143 280-160t-11.5-28.5Q257-200 240-200t-28.5 11.5Q200-177 200-160t11.5 28.5Q223-120 240-120t28.5-11.5Zm240-680Q520-823 520-840t-11.5-28.5Q497-880 480-880t-28.5 11.5Q440-857 440-840t11.5 28.5Q463-800 480-800t28.5-11.5ZM480-360q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm268.5 228.5Q760-143 760-160t-11.5-28.5Q737-200 720-200t-28.5 11.5Q680-177 680-160t11.5 28.5Q703-120 720-120t28.5-11.5Zm120-420Q880-563 880-580t-11.5-28.5Q857-620 840-620t-28.5 11.5Q800-597 800-580t11.5 28.5Q823-540 840-540t28.5-11.5ZM480-840ZM120-580Zm360 120Zm360-120ZM240-160Zm480 0Z"/>
    </svg>
  )
}

// First-time state para Agentes IA — primera vez que un usuario entra al feature.
// Estilo: tomado de la web redesign nueva (mesh aurora + grid + headline con
// gradient en palabras clave, cards modernas con hover-lift). Foco vendedor:
// "es LA feature" — empujar a crear el primer agente sin distracciones.

type Modal = null | 'agente' | 'orquestador'

const MESH = {
  backgroundImage: [
    'radial-gradient(60% 40% at 20% 10%, rgba(48, 79, 254, 0.18) 0%, transparent 60%)',
    'radial-gradient(40% 30% at 80% 0%, rgba(98, 114, 255, 0.22) 0%, transparent 70%)',
    'radial-gradient(50% 40% at 50% 100%, rgba(48, 79, 254, 0.08) 0%, transparent 70%)',
  ].join(', '),
}

const GRID = {
  backgroundImage: [
    'linear-gradient(to right, rgba(10, 15, 31, 0.04) 1px, transparent 1px)',
    'linear-gradient(to bottom, rgba(10, 15, 31, 0.04) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: '48px 48px',
  WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 35%, black 40%, transparent 80%)',
  maskImage: 'radial-gradient(ellipse 80% 60% at 50% 35%, black 40%, transparent 80%)',
}

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

export default function AgentesFirstTime() {
  const [modal, setModal] = useState<Modal>(null)

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-white relative">
      <AgentsTopBar onToggleSidebar={() => {}} />

      {/* Layered bg */}
      <div className="absolute inset-0 pointer-events-none -z-0" style={MESH} />
      <div className="absolute inset-0 pointer-events-none -z-0" style={GRID} />
      {/* Bottom fade so cards "land" softly */}
      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none -z-0 bg-gradient-to-b from-transparent to-white" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 pt-12 relative z-10">

        {/* Headline — Inter tight tracking */}
        <h1
          className="text-center font-semibold"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(40px, 6.5vw, 76px)',
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
            color: '#0a0f1f',
            maxWidth: 900,
          }}
        >
          Empieza a crear un{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${color.primary} 0%, #6272ff 40%, ${color.primaryDark} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            agente de IA
          </span>
        </h1>

        {/* Subcopy */}
        <p
          className="mt-6 text-center text-balance"
          style={{
            fontSize: 18,
            lineHeight: 1.5,
            color: '#5f6882',
            maxWidth: 580,
          }}
        >
          Gestiona conversaciones y procesos de manera autónoma con agentes de IA
          que resuelven en canales como WhatsApp, web y más.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-stretch gap-3">
          <button
            onClick={() => setModal('agente')}
            className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-white font-semibold transition-all"
            style={{
              fontSize: 15,
              background: color.primary,
              boxShadow: '0 0 0 1px rgba(48, 79, 254, 0.18), 0 12px 32px -8px rgba(48, 79, 254, 0.5)',
              transition: `all 280ms ${EASE}`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(48, 79, 254, 0.22), 0 16px 40px -8px rgba(48, 79, 254, 0.6)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(48, 79, 254, 0.18), 0 12px 32px -8px rgba(48, 79, 254, 0.5)'
            }}
          >
            <AiAgentIcon size={16} color="white" />
            Crear agente
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={() => setModal('orquestador')}
            className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-semibold border bg-white transition-all"
            style={{
              fontSize: 15,
              color: '#161c35',
              borderColor: '#DDE1EC',
              transition: `all 280ms ${EASE}`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.borderColor = '#B4BCCF'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(10, 15, 31, 0.06)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = '#DDE1EC'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <OrchestratorIcon size={16} color={color.primary} />
            Crear orquestador
          </button>
        </div>

      </main>

      {/* Keyframes */}
      <style>{`
        @keyframes ftPing {
          0%   { transform: scale(1);   opacity: 0.75; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes ftFade {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>

      {/* Modal stub */}
      {modal && <CreationModal kind={modal} onClose={() => setModal(null)} />}
    </div>
  )
}

// ── Modal stub — solo confirma el flow, no crea nada todavía ─────────────────
function CreationModal({ kind, onClose }: { kind: 'agente' | 'orquestador'; onClose: () => void }) {
  const [name, setName] = useState('')
  const isAgente = kind === 'agente'
  const title = isAgente ? 'Crear agente' : 'Crear orquestador'
  const placeholder = isAgente ? 'Ej: Asistente de ventas' : 'Ej: Pizzería Bella Italia'
  const suggestions = isAgente
    ? ['Atención al cliente', 'Ventas y leads', 'Soporte técnico', 'Toma de pedidos']
    : ['Restaurante', 'Tienda online', 'Inmobiliaria']

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(10, 15, 31, 0.45)', backdropFilter: 'blur(4px)', animation: 'ftFade 200ms ease-out' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white overflow-hidden"
        style={{
          boxShadow: '0 24px 60px rgba(10, 15, 31, 0.25)',
          animation: 'ftFade 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header con icono brand grande */}
        <div className="px-7 pt-7 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${color.primaryUltraLight} 0%, ${color.primaryLight} 100%)`,
              }}
            >
              {isAgente
                ? <AiAgentIcon size={22} color={color.primary} />
                : <OrchestratorIcon size={22} color={color.primary} />}
            </div>
            <div>
              <h2 className="font-semibold text-lg tracking-tight" style={{ color: '#0a0f1f' }}>{title}</h2>
              <p className="text-[13px] mt-0.5" style={{ color: '#5f6882' }}>
                Ponéle un nombre. Después configurás todo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-slate-100"
            style={{ color: '#5f6882' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 pb-6">
          <label className="block text-[12px] font-semibold mb-2" style={{ color: '#434b63', letterSpacing: '-0.01em' }}>
            Nombre
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="w-full px-3.5 py-2.5 rounded-xl border bg-white outline-none transition-all"
            style={{
              fontSize: 14,
              borderColor: '#DDE1EC',
              color: '#0a0f1f',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = color.primary
              e.currentTarget.style.boxShadow = `0 0 0 4px rgba(48, 79, 254, 0.12)`
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#DDE1EC'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />

          {/* Suggestions */}
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#8a93ab' }}>
              Sugerencias
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => setName(s)}
                  className="text-[12.5px] px-3 py-1.5 rounded-full border bg-white transition-all"
                  style={{
                    borderColor: '#DDE1EC',
                    color: '#434b63',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = color.primary
                    e.currentTarget.style.color = color.primary
                    e.currentTarget.style.background = color.primaryUltraLight
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#DDE1EC'
                    e.currentTarget.style.color = '#434b63'
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 flex items-center justify-end gap-2 border-t" style={{ borderColor: '#EEF0F6', background: '#FAFBFD' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-[13px] font-medium transition-colors"
            style={{ color: '#5f6882' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#EEF0F6')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (!name.trim()) return
              // Stub: en producción acá se dispara la creación + redirect a /agente
              window.location.href = isAgente ? '/agente-v2' : '/proyecto'
            }}
            disabled={!name.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-semibold text-white transition-all"
            style={{
              background: name.trim() ? color.primary : '#B4BCCF',
              boxShadow: name.trim() ? '0 4px 12px rgba(48, 79, 254, 0.35)' : 'none',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Crear {isAgente ? 'agente' : 'orquestador'}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
