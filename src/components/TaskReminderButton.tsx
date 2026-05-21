import { useState } from 'react'

export default function TaskReminderButton() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 999 }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', left: 0,
          width: 280, padding: '14px 16px',
          background: '#0F172A', borderRadius: 12,
          boxShadow: '0 16px 40px -8px rgba(15,23,42,0.40)',
          color: '#F8FAFC',
          fontFamily: 'Roboto, sans-serif',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Your task
          </div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#F1F5F9' }}>
            The agent handles all leads the same way. <strong style={{ color: '#FFFFFF' }}>Add a flow to the state</strong> so it follows specific steps — at least one instruction telling the agent what to do.
          </p>
          {/* Arrow */}
          <div style={{
            position: 'absolute', bottom: -6, left: 20,
            width: 12, height: 12,
            background: '#0F172A',
            transform: 'rotate(45deg)',
          }} />
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 16px', borderRadius: 100,
          background: open ? '#0F172A' : 'white',
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 20px -6px rgba(15,23,42,0.20), 0 2px 6px rgba(15,23,42,0.06)',
          cursor: 'pointer',
          fontFamily: 'Roboto, sans-serif', fontSize: 12.5, fontWeight: 600,
          color: open ? '#F8FAFC' : '#0F172A',
          transition: 'background 150ms, color 150ms',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = '#F8FAFC' } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'white' } }}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>📋</span>
        Task
      </button>
    </div>
  )
}
