import { Handle, Position } from '@xyflow/react'

interface OrchestratorData {
  name: string
  emoji: string
  agentCount: number
}

export default function OrchestratorNode({ data }: { data: OrchestratorData }) {
  return (
    <div style={{ position: 'relative' }}>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />

      <div style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid #E2E7FF',
        boxShadow: '0 2px 12px rgba(48,79,254,0.07), 0 1px 3px rgba(0,0,0,0.04)',
        padding: '20px 28px',
        textAlign: 'center',
        minWidth: 220,
        userSelect: 'none',
      }}>
        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: '#EEF1FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, margin: '0 auto 10px',
        }}>
          {data.emoji}
        </div>

        {/* Label */}
        <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
          Gran Agente
        </p>

        {/* Name */}
        <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: 10 }}>
          {data.name}
        </p>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 100,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            fontSize: 11, fontWeight: 500, color: '#16a34a',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Activo
          </span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {data.agentCount} Sub-agentes
          </span>
        </div>
      </div>
    </div>
  )
}
