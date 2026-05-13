import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { ORCHESTRATORS, AGENTS, SUB_AGENTS, SubAgent } from '../data/agents'
import AgentsLogo from './AgentsLogo'

interface Props {
  selectedSubAgentId: string | null
  onSelectSubAgent: (subAgentId: string) => void
  // Click on an orchestrator row navigates somewhere (e.g. /proyecto).
  // It is intentionally NOT a selection — the right pane only shows sub-agent canvases.
  onOrchestratorClick: (orchestratorId: string) => void
}

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  active:      { dot: '#22c55e', label: 'Activo',  chip: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  inactive:    { dot: '#9ca3af', label: 'Inactivo', chip: 'bg-slate-50 text-slate-400 border-slate-200'       },
  configuring: { dot: '#f59e0b', label: 'Config.',  chip: 'bg-amber-50 text-amber-600 border-amber-200'       },
} as const

// ── SubAgentRow ────────────────────────────────────────────────────────────────
function SubAgentRow({
  sub,
  isSelected,
  onClick,
}: {
  sub: SubAgent
  isSelected: boolean
  onClick: () => void
}) {
  const cfg = STATUS_CFG[sub.status]

  return (
    <button
      onClick={onClick}
      className={[
        'group w-full flex items-center gap-2 py-[6px] pr-3 text-left',
        'transition-colors duration-150',
        'border-l-2',
        isSelected
          ? 'border-[#304FFE] bg-[#F0F2FF]'
          : 'border-transparent hover:bg-[#F8F9FF]',
      ].join(' ')}
      // 52px = 13px (orch chevron) + 13px (orch emoji) + 13px (agent chevron) + 13px (agent icon) padding
      style={{ paddingLeft: 52 }}
    >
      {/* Status dot */}
      <span className="relative flex-shrink-0 flex items-center justify-center w-2 h-2">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: cfg.dot }}
        />
        {sub.status === 'active' && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-60"
            style={{ background: cfg.dot }}
          />
        )}
      </span>

      {/* Sub-agent name */}
      <span
        className={[
          'text-xs truncate flex-1 leading-none transition-colors duration-150',
          isSelected
            ? 'font-semibold text-[#304FFE]'
            : 'font-normal text-slate-500 group-hover:text-slate-700',
        ].join(' ')}
      >
        {sub.name}
      </span>

      {/* Status chip — only for non-active or when selected */}
      {(sub.status !== 'active' || isSelected) && (
        <span
          className={[
            'flex-shrink-0 text-[9px] font-semibold leading-none px-1.5 py-0.5',
            'rounded-full border',
            cfg.chip,
          ].join(' ')}
        >
          {cfg.label}
        </span>
      )}
    </button>
  )
}

// ── AgentsSidebar ─────────────────────────────────────────────────────────────
export default function AgentsSidebar({
  selectedSubAgentId,
  onSelectSubAgent,
  onOrchestratorClick,
}: Props) {
  const [collapsedOrch, setCollapsedOrch]   = useState<Record<string, boolean>>({})
  const [collapsedAgent, setCollapsedAgent] = useState<Record<string, boolean>>({})

  function toggleOrchestrator(orchId: string) {
    setCollapsedOrch(prev => ({ ...prev, [orchId]: !prev[orchId] }))
  }

  function toggleAgent(agentId: string) {
    setCollapsedAgent(prev => ({ ...prev, [agentId]: !prev[agentId] }))
  }

  return (
    <aside
      className="flex flex-col bg-white border-r border-[#E2E7FF] flex-shrink-0 overflow-hidden"
      style={{ width: 240 }}
    >
      {/* Brand lockup */}
      <AgentsLogo />

      {/* Three-level tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {ORCHESTRATORS.map(orch => {
          const orchAgents    = AGENTS.filter(a => a.orchestratorId === orch.id)
          const isOrchCollapsed = collapsedOrch[orch.id] ?? false

          // Count active sub-agents under this orchestrator for the badge
          const activeSubCount = orchAgents.reduce((acc, agent) => {
            return acc + SUB_AGENTS.filter(s => s.agentId === agent.id && s.status === 'active').length
          }, 0)

          return (
            <div key={orch.id} className="mb-1">

              {/* ── Level 1: Orquestador ── */}
              {/* Row: chevron toggles collapse, name navigates to /proyecto. */}
              <div className="group w-full flex items-center gap-2 pr-3 text-left transition-colors duration-150 border-l-2 border-transparent hover:bg-[#F8F9FF]">
                <button
                  onClick={() => toggleOrchestrator(orch.id)}
                  className="flex-shrink-0 flex items-center justify-center w-5 h-8 -mr-1 hover:bg-[#E8ECFF] rounded transition-colors"
                  style={{ marginLeft: 6 }}
                  aria-label={isOrchCollapsed ? 'Expandir' : 'Colapsar'}
                >
                  {isOrchCollapsed
                    ? <ChevronRight size={12} className="text-slate-400 flex-shrink-0" />
                    : <ChevronDown  size={12} className="text-slate-400 flex-shrink-0" />
                  }
                </button>
                <button
                  onClick={() => onOrchestratorClick(orch.id)}
                  className="flex-1 min-w-0 flex items-center gap-2 py-2 pr-1 text-left"
                  title="Abrir orquestador"
                >
                  <span className="text-sm leading-none flex-shrink-0">{orch.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold truncate block text-slate-600 group-hover:text-slate-800 transition-colors duration-150">
                      {orch.name}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-none">
                      {orch.dailyMessages} mensajes hoy
                    </span>
                  </div>
                </button>
                {activeSubCount > 0 && (
                  <span
                    className="flex-shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold leading-none px-1"
                    style={{ background: 'linear-gradient(135deg, #304FFE 0%, #5B6EF5 100%)', color: 'white' }}
                  >
                    {activeSubCount}
                  </span>
                )}
              </div>

              {/* ── Level 2: Agentes ── */}
              {!isOrchCollapsed && (
                <div>
                  {orchAgents.map(agent => {
                    const agentSubs      = SUB_AGENTS.filter(s => s.agentId === agent.id)
                    const isAgentCollapsed = collapsedAgent[agent.id] ?? false

                    return (
                      <div key={agent.id}>
                        <button
                          onClick={() => toggleAgent(agent.id)}
                          className="group w-full flex items-center gap-2 py-[7px] pr-3 text-left hover:bg-[#F8F9FF] transition-colors duration-150"
                          style={{ paddingLeft: 26 }}
                        >
                          {isAgentCollapsed
                            ? <ChevronRight size={11} className="text-slate-300 flex-shrink-0" />
                            : <ChevronDown  size={11} className="text-slate-300 flex-shrink-0" />
                          }
                          <span className="text-[13px] leading-none flex-shrink-0">🤖</span>
                          <span className="text-[11px] font-medium text-slate-600 truncate flex-1 group-hover:text-slate-800 transition-colors duration-150">
                            {agent.name}
                          </span>
                        </button>

                        {/* ── Level 3: Sub-agentes ── */}
                        {!isAgentCollapsed && (
                          <div>
                            {agentSubs.map(sub => (
                              <SubAgentRow
                                key={sub.id}
                                sub={sub}
                                isSelected={sub.id === selectedSubAgentId}
                                onClick={() => onSelectSubAgent(sub.id)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Stats strip */}
      <div className="border-t border-[#E2E7FF] px-4 py-3 flex items-center justify-between">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800">
            {SUB_AGENTS.filter(s => s.status === 'active').length}
          </p>
          <p className="text-[10px] text-slate-400 leading-none">activos</p>
        </div>
        <div className="w-px h-6 bg-[#E2E7FF]" />
        <div className="text-center">
          <p className="text-sm font-bold text-[#304FFE]">
            {ORCHESTRATORS.reduce((sum, o) => sum + o.dailyMessages, 0)}
          </p>
          <p className="text-[10px] text-slate-400 leading-none">mensajes hoy</p>
        </div>
        <div className="w-px h-6 bg-[#E2E7FF]" />
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800">{ORCHESTRATORS.length}</p>
          <p className="text-[10px] text-slate-400 leading-none">empresas</p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-3 pb-3">
        <button
          className={[
            'w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs font-medium',
            'text-slate-400 border border-dashed border-slate-200',
            'hover:text-[#304FFE] hover:border-[#B8C4FF] hover:bg-[#F0F2FF]',
            'transition-colors duration-150',
          ].join(' ')}
        >
          <Plus size={13} />
          Nuevo orquestador
        </button>
      </div>
    </aside>
  )
}
