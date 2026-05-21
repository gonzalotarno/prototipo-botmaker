import { ChevronLeft, ChevronRight, Workflow, Plus, Search } from 'lucide-react'
import { color, font } from '../ds'
import { ORCHESTRATORS } from '../data/agents'

// Flat sidebar shared by /agente (AgentDetail) and /proyecto (orchestrator pane
// inside AgentsShell). Lists Agentes + Orquestadores so the user can navigate
// between them without losing the rail. The 3-level tree variant lives in
// AgentsSidebar and is only used in the sub-agent canvas mode.

const SIDEBAR_AGENTS = [
  'Seguimiento de leads',
  'Atención clientes',
  'Captación de clientes',
  'Gestión de campañas',
  'Soporte técnico 24/7',
  'Toma de pedidos',
]

const W = 256

interface Props {
  // Controlled collapse state. The sidebar is always rendered; when collapsed
  // it slides out (transform) and its wrapper width animates to 0. The floating
  // toggle handle remains visible at the rail boundary so the user can reopen it.
  collapsed:           boolean
  onToggle:            () => void
  selectedAgentName?:  string
  onAgentClick?:       (name: string) => void
  onOrchestratorClick?: (orchestratorId: string) => void
}

export default function AgentsListSidebar({
  collapsed,
  onToggle,
  selectedAgentName = SIDEBAR_AGENTS[0],
  onAgentClick,
  onOrchestratorClick,
}: Props) {
  const handleAgent = (name: string) => {
    if (onAgentClick) return onAgentClick(name)
    window.location.href = '/flow-test-agent'
  }
  const handleOrchestrator = (id: string) => {
    if (onOrchestratorClick) return onOrchestratorClick(id)
    window.location.href = '/flow-test-orquestador'
  }

  return (
    <div
      style={{
        position: 'relative',
        flexShrink: 0,
        width: collapsed ? 0 : W,
        height: '100%',
        transition: 'width 0.22s ease',
      }}
    >
      <aside
        style={{
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: W,
          background: 'white',
          borderRight: `1px solid ${color.borderSubtle}`,
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto', overflowX: 'hidden',
          transform: collapsed ? `translateX(-${W + 1}px)` : 'translateX(0)',
          transition: 'transform 0.22s ease',
        }}
      >
        {/* ── Agentes section ────────────────────────────────────────── */}
        <div style={{ padding: '20px 16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: color.grey900 }}>Agentes</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: color.primary,
                background: color.primaryUltraLight, borderRadius: 100, padding: '2px 8px',
                lineHeight: 1.2,
              }}>{SIDEBAR_AGENTS.length}</span>
            </div>
            <button
              title="Nuevo agente"
              style={{
                width: 26, height: 26, borderRadius: 8, border: 'none',
                background: color.primary, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', transition: 'opacity 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            ><Plus size={14} /></button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} color={color.grey400} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              placeholder="Buscar agentes"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '7px 10px 7px 30px',
                borderRadius: 8, border: `1px solid ${color.borderDefault}`,
                fontSize: 12.5, color: color.grey800, outline: 'none',
                background: color.grey50, fontFamily: font.family,
                transition: 'border-color 0.12s, background 0.12s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = color.primary; e.currentTarget.style.background = 'white' }}
              onBlur={e => { e.currentTarget.style.borderColor = color.borderDefault; e.currentTarget.style.background = color.grey50 }}
            />
          </div>
        </div>

        <div style={{ padding: '4px 8px 12px' }}>
          {SIDEBAR_AGENTS.map(name => {
            const selected = name === selectedAgentName
            return (
              <button
                key={name}
                onClick={() => handleAgent(name)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8, border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  background: selected ? color.primaryUltraLight : 'transparent',
                  color: selected ? color.primary : color.grey800,
                  fontSize: 12.5, fontWeight: selected ? 600 : 500,
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.background = color.grey50 }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  background: selected ? 'white' : color.grey100,
                  border: selected ? `1px solid ${color.primaryLight}` : `1px solid transparent`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img
                    src="/avatar-ai.svg"
                    style={{
                      width: 14, height: 14,
                      filter: selected
                        ? 'brightness(0) saturate(100%) invert(23%) sepia(93%) saturate(7484%) hue-rotate(234deg) brightness(101%) contrast(101%)'
                        : 'brightness(0) saturate(100%) invert(58%) sepia(8%) saturate(283%) hue-rotate(178deg) brightness(91%) contrast(86%)',
                    }}
                  />
                </span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Orquestadores section ──────────────────────────────────── */}
        <div style={{ padding: '16px 16px 8px', borderTop: `1px solid ${color.grey100}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: color.grey900 }}>Orquestadores</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: color.grey700,
                background: color.grey100, borderRadius: 100, padding: '2px 8px',
                lineHeight: 1.2,
              }}>{ORCHESTRATORS.length}</span>
            </div>
            <button
              title="Nuevo orquestador"
              style={{
                width: 26, height: 26, borderRadius: 8, border: 'none',
                background: color.primary, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', transition: 'opacity 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            ><Plus size={14} /></button>
          </div>
        </div>

        <div style={{ padding: '4px 8px 16px' }}>
          {ORCHESTRATORS.map(orch => (
            <button
              key={orch.id}
              onClick={() => handleOrchestrator(orch.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8, border: 'none',
                cursor: 'pointer', textAlign: 'left',
                background: 'transparent', color: color.grey800,
                fontSize: 12.5, fontWeight: 500,
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = color.grey50)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: color.grey100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: color.grey600, lineHeight: 1 }}>hub</span>
              </span>
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {orch.name}
              </span>
              <Workflow size={12} color={color.grey300} style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </aside>

      {/* Floating toggle handle — sits at the rail boundary, half overlapping the canvas */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Abrir menú' : 'Cerrar menú'}
        style={{
          position: 'absolute',
          top: 28,
          left: '100%',
          transform: 'translateX(-50%)',
          width: 26, height: 26, borderRadius: '50%',
          border: `1px solid ${color.borderDefault}`,
          background: 'white',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color.primary,
          boxShadow: '0 2px 6px rgba(15,23,42,0.08)',
          transition: 'background 0.12s, transform 0.12s',
          zIndex: 5,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)}
        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  )
}
