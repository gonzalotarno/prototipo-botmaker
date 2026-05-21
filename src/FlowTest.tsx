import { useState } from 'react'
import AgentDetail from './AgentDetail'

const LANGS = {
  pt: {
    version: 'Versão em português',
    badge: 'Teste de protótipo · ~5 min',
    heading: 'Você é PM na NovaSales.',
    p1: 'Sua equipe de vendas usa um agente de IA no WhatsApp para fazer follow-up com novos leads. Está no ar — algumas centenas de leads passaram por ele essa semana.',
    p2: <>Agora ele trata todos os leads da <strong style={{ color: '#0F172A' }}>mesma forma — sem passos personalizados</strong>, sem lógica específica por situação.</>,
    p3: <>Sua tarefa: <strong style={{ color: '#0F172A' }}>adicionar um fluxo ao estado</strong> para que o agente siga uma sequência específica de passos ao atender um lead.</>,
    cta: 'Abrir agente →',
    disclaimer: 'Isso é um protótipo — algumas seções podem mostrar dados de exemplo.',
  },
  es: {
    version: 'Versión en español',
    badge: 'Test de prototipo · ~5 min',
    heading: 'Sos PM en NovaSales.',
    p1: 'Tu equipo de ventas usa un agente de IA en WhatsApp para hacer seguimiento de nuevos leads. Está activo — algunos cientos de leads pasaron por él esta semana.',
    p2: <>Ahora atiende a todos los leads de la <strong style={{ color: '#0F172A' }}>misma manera — sin pasos personalizados</strong>, sin lógica específica por situación.</>,
    p3: <>Tu tarea: <strong style={{ color: '#0F172A' }}>agregar un flujo al estado</strong> para que el agente siga una secuencia específica de pasos al atender un lead.</>,
    cta: 'Abrir agente →',
    disclaimer: 'Esto es un prototipo — algunas secciones pueden mostrar datos de ejemplo.',
  },
}

const PRIMARY = '#304FFE'

export default function FlowTest() {
  sessionStorage.setItem('testMode', '1')
  const [started, setStarted] = useState(false)
  const [lang, setLang] = useState<'pt' | 'es' | null>(null)

  if (started) return <AgentDetail initialTab="estados" variant="v2" />

  if (!lang) return (
    <div style={{
      minHeight: '100vh', background: '#F8FAFC',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Roboto, sans-serif', WebkitFontSmoothing: 'antialiased',
    }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Selecione o idioma · Elegí el idioma
        </h2>
        {(['pt', 'es'] as const).map(l => (
          <button
            key={l}
            onClick={() => { sessionStorage.setItem('bm-lang', l); setLang(l) }}
            style={{
              padding: '16px 20px', borderRadius: 12, border: '1.5px solid #E2E8F0',
              background: '#FFFFFF', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Roboto, sans-serif',
              boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
              transition: 'border-color 140ms, box-shadow 140ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(48,79,254,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)' }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{LANGS[l].version}</div>
          </button>
        ))}
      </div>
    </div>
  )

  const t = LANGS[lang]

  return (
    <div style={{
      minHeight: '100vh', background: '#F8FAFC',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Roboto, sans-serif', WebkitFontSmoothing: 'antialiased',
    }}>
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 12px', borderRadius: 100,
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          fontSize: 12, fontWeight: 600, color: '#64748B', width: 'fit-content',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
          {t.badge}
        </div>

        {/* Heading */}
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            {t.heading}
          </h1>
          <p style={{ margin: '16px 0 0', fontSize: 15.5, lineHeight: 1.65, color: '#475569' }}>{t.p1}</p>
          <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.65, color: '#475569' }}>{t.p2}</p>
          <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.65, color: '#475569' }}>{t.p3}</p>
        </div>

        {/* Agent card */}
        <div style={{
          padding: '16px 18px',
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: PRIMARY,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>🛒</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Lead Follow-up Agent</div>
            <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>WhatsApp · 312 leads this week</div>
          </div>
          <div style={{
            padding: '3px 10px', borderRadius: 100,
            background: '#DCFCE7', color: '#15803D',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.3, flexShrink: 0,
          }}>● Active</div>
        </div>

        {/* CTA */}
        <button
          onClick={() => setStarted(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 12,
            background: PRIMARY, border: 'none',
            color: '#FFFFFF', fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 24px -8px rgba(48,79,254,0.45)',
            transition: 'opacity 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {t.cta}
        </button>

        <p style={{ margin: 0, fontSize: 11.5, color: '#94A3B8', lineHeight: 1.5 }}>{t.disclaimer}</p>

      </div>
    </div>
  )
}
