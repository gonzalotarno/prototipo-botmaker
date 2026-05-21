import { useState, useEffect } from 'react'

const GREEN = '#059669'

export default function TaskReminderButton() {
  const [open, setOpen] = useState(false)
  const [inFlow, setInFlow] = useState(() => sessionStorage.getItem('bm-in-flow') === '1')
  const [done, setDone] = useState(() => sessionStorage.getItem('bm-flow-done') === '1')

  useEffect(() => {
    const handler = () => {
      setInFlow(sessionStorage.getItem('bm-in-flow') === '1')
      setDone(sessionStorage.getItem('bm-flow-done') === '1')
    }
    window.addEventListener('bm-flow-change', handler)
    return () => window.removeEventListener('bm-flow-change', handler)
  }, [])

  const tooltipBg = done ? GREEN : '#0F172A'
  const btnBg = done ? GREEN : open ? '#0F172A' : 'white'
  const btnColor = done ? '#FFFFFF' : open ? '#F8FAFC' : '#0F172A'
  const btnBorder = done ? GREEN : '#E2E8F0'

  const label = done ? 'Done ✓' : 'Task'
  const icon = done ? '✅' : '📋'

  const taskCopy = done
    ? <>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
          Task complete ✓
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#FFFFFF' }}>
          You added a flow to the state. The agent will now follow specific steps when handling a lead.
        </p>
      </>
    : inFlow
      ? <>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Your task</div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#F1F5F9' }}>
            You're inside the flow! <strong style={{ color: '#FFFFFF' }}>Edit the Instruction node</strong> to tell the agent what to say — for example: "Ask if they'd like to schedule a demo call."
          </p>
        </>
      : <>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Your task</div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#F1F5F9' }}>
            The agent handles all leads the same way. <strong style={{ color: '#FFFFFF' }}>Add a flow to the state</strong> so it follows specific steps — at least one instruction telling the agent what to do.
          </p>
        </>

  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 999 }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', left: 0,
          width: 280, padding: '14px 16px',
          background: tooltipBg, borderRadius: 12,
          boxShadow: '0 16px 40px -8px rgba(15,23,42,0.40)',
          color: '#F8FAFC',
          fontFamily: 'Roboto, sans-serif',
        }}>
          {taskCopy}
          <div style={{
            position: 'absolute', bottom: -6, left: 20,
            width: 12, height: 12,
            background: tooltipBg,
            transform: 'rotate(45deg)',
          }} />
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 16px', borderRadius: 100,
          background: btnBg,
          border: `1px solid ${btnBorder}`,
          boxShadow: done
            ? `0 8px 20px -6px rgba(5,150,105,0.40), 0 2px 6px rgba(5,150,105,0.20)`
            : '0 8px 20px -6px rgba(15,23,42,0.20), 0 2px 6px rgba(15,23,42,0.06)',
          cursor: 'pointer',
          fontFamily: 'Roboto, sans-serif', fontSize: 12.5, fontWeight: 600,
          color: btnColor,
          transition: 'background 300ms, color 300ms, border-color 300ms, box-shadow 300ms',
        }}
        onMouseEnter={e => { if (!open && !done) e.currentTarget.style.background = '#F8FAFC' }}
        onMouseLeave={e => { if (!open && !done) e.currentTarget.style.background = 'white' }}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
        {label}
      </button>
    </div>
  )
}
