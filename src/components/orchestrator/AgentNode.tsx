import { useState, useRef, useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'
import { MoreHorizontal, ArrowUpRight, Trash2 } from 'lucide-react'

interface Integration {
  name: string
  icon: string
}

export interface AgentData {
  name: string
  emoji: string
  color: string
  description: string
  nodeCount: number
  integrations: Integration[]
  onDelete: () => void
  onOpen: () => void
}

export default function AgentNode({ data }: { data: AgentData }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { color, name, emoji, description, nodeCount, integrations } = data

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />

      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid #E2E7FF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: 16,
        width: 220,
        position: 'relative',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            {emoji}
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 100,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            fontSize: 10, fontWeight: 500, color: '#16a34a',
          }}>
            Activo
          </span>
        </div>

        {/* Name */}
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: 5 }}>
          {name}
        </p>

        {/* Description */}
        <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.55, marginBottom: 12 }}>
          {description}
        </p>

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{nodeCount} Nodos</span>

          {/* Dropdown menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                padding: '3px 5px', borderRadius: 6, border: 'none',
                background: menuOpen ? '#f1f5f9' : 'transparent',
                cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center',
              }}
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, bottom: 'calc(100% + 4px)',
                background: 'white', borderRadius: 10,
                border: '1px solid #E2E7FF',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                minWidth: 140, overflow: 'hidden', zIndex: 100,
              }}>
                <button
                  onClick={() => { setMenuOpen(false); data.onOpen() }}
                  style={{ width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#334155', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <ArrowUpRight size={13} /> Ver flujo
                </button>
                <button
                  onClick={() => { setMenuOpen(false); data.onDelete() }}
                  style={{ width: '100%', padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#ef4444', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Integration chips */}
      {integrations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {integrations.map(i => (
              <span
                key={i.name}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 100,
                  border: '1px solid #E2E7FF', background: 'white',
                  fontSize: 11, fontWeight: 500, color: '#475569',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: 13 }}>{i.icon}</span>
                {i.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />
    </div>
  )
}
