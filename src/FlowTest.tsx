import { useState } from 'react'
import AgentDetail from './AgentDetail'

export default function FlowTest() {
  sessionStorage.setItem('testMode', '1')
  const [started, setStarted] = useState(false)

  if (started) return <AgentDetail initialTab="estados" variant="v2" />

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Roboto, sans-serif',
      WebkitFontSmoothing: 'antialiased',
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
          Prototype test · ~5 min
        </div>

        {/* Heading */}
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            You're a PM at NovaSales.
          </h1>
          <p style={{ margin: '16px 0 0', fontSize: 15.5, lineHeight: 1.65, color: '#475569' }}>
            Your sales team uses an AI agent on WhatsApp to follow up with new leads.
            It's already live — a few hundred leads have gone through it this week.
          </p>
          <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.65, color: '#475569' }}>
            Right now the agent only has <strong style={{ color: '#0F172A' }}>one conversation state</strong>. Your task is to <strong style={{ color: '#0F172A' }}>add at least one more state</strong> to better handle different types of leads.
          </p>
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
            background: '#304FFE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>🛒</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Lead Follow-up Agent</div>
            <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
              WhatsApp · 312 leads this week
            </div>
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
            background: '#304FFE', border: 'none',
            color: '#FFFFFF', fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 24px -8px rgba(48,79,254,0.45)',
            transition: 'opacity 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Open agent →
        </button>

        <p style={{ margin: 0, fontSize: 11.5, color: '#94A3B8', lineHeight: 1.5 }}>
          This is a prototype — some sections may show placeholder data.
        </p>

      </div>
    </div>
  )
}
