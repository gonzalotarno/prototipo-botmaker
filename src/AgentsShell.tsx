import { useState, useCallback } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { ChevronRight, Check } from 'lucide-react'
import { DrawerProvider } from './context/DrawerContext'
import AutomationCanvas from './components/AutomationCanvas'
import WebChat from './components/WebChat'
import AgentsSidebar from './components/AgentsSidebar'
import AgentsListSidebar from './components/AgentsListSidebar'
import AgentsTopBar from './components/AgentsTopBar'
import ProjectView from './ProjectView'
import { AGENTS, ORCHESTRATORS, SUB_AGENTS } from './data/agents'

const DEFAULT_SUB_AGENT_ID = 'sub-pedidos-main'

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  active:      { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  configuring: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-600',   dot: 'bg-amber-400'   },
  inactive:    { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-500',   dot: 'bg-slate-400'   },
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Activo',
  configuring: 'Configurando',
  inactive: 'Inactivo',
}

type Mode = 'canvas' | 'project'

// Initial mode is derived from the URL so deep-links to /proyecto land on the
// orchestrator pane; everything else defaults to the sub-agent canvas. Also
// respects `?path=/proyecto` used by the iframe embed mode in main.tsx.
function initialMode(): Mode {
  if (typeof window === 'undefined') return 'canvas'
  const queryPath = new URLSearchParams(window.location.search).get('path')
  const path = queryPath ?? window.location.pathname
  return path === '/proyecto' ? 'project' : 'canvas'
}

export default function AgentsShell() {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [showSidebar, setShowSidebar] = useState(true)
  const [selectedSubAgentId, setSelectedSubAgentIdState] = useState<string | null>(DEFAULT_SUB_AGENT_ID)
  const [saved, setSaved]         = useState(false)
  const [published, setPublished] = useState(false)

  // Selecting a sub-agent always means "show the canvas".
  const selectSubAgent = useCallback((id: string) => {
    setSelectedSubAgentIdState(id)
    setMode('canvas')
    if (typeof window !== 'undefined' && window.location.pathname !== '/agents') {
      window.history.pushState(null, '', '/agents')
    }
  }, [])

  // Clicking an orchestrator switches the right pane to ProjectView without
  // unmounting the sidebar — same all-in-one shell, just a different surface.
  const openOrchestrator = useCallback((_id: string) => {
    setMode('project')
    if (typeof window !== 'undefined' && window.location.pathname !== '/proyecto') {
      window.history.pushState(null, '', '/proyecto')
    }
  }, [])

  const handleSave = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const handlePublish = useCallback(() => {
    setPublished(true)
    setTimeout(() => setPublished(false), 2500)
  }, [])

  const selectedSub   = SUB_AGENTS.find(s => s.id === selectedSubAgentId) ?? null
  const selectedAgent = selectedSub ? (AGENTS.find(a => a.id === selectedSub.agentId) ?? null) : null
  const selectedOrch  = selectedAgent ? (ORCHESTRATORS.find(o => o.id === selectedAgent.orchestratorId) ?? null) : null

  const status = selectedSub?.status ?? 'inactive'
  const chip   = STATUS_COLORS[status]

  const isProject = mode === 'project'

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-[#F0F2FF]">

      {/* ── Top bar (shared with /agente) ───────────────────────────────── */}
      <AgentsTopBar onToggleSidebar={() => setShowSidebar(s => !s)} />

      {/* ── Mode-specific sub-header (only for canvas — orchestrator brings its own) ── */}
      {!isProject && (
        <div className="flex items-center justify-between px-5 py-2 border-b border-[#E2E7FF] bg-white z-10 flex-shrink-0">
          <nav className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400 px-1">Agents</span>
            {selectedOrch && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                <button
                  onClick={() => openOrchestrator(selectedOrch.id)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors px-2 py-1 rounded-md"
                >
                  {selectedOrch.emoji} {selectedOrch.name}
                </button>
              </>
            )}
            {selectedAgent && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                <span className="text-xs font-medium text-slate-500 px-2 py-1">{selectedAgent.name}</span>
              </>
            )}
            {selectedSub && (
              <>
                <ChevronRight size={12} className="text-slate-300" />
                <span className="text-xs font-semibold text-slate-800 px-2 py-1">{selectedSub.name}</span>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {selectedSub && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${chip.bg} ${chip.border} ${chip.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${chip.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
                {STATUS_LABEL[status]}
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5"
              style={saved
                ? { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }
                : { borderColor: '#e2e8f0', color: '#64748b' }
              }
            >
              {saved && <Check size={11} />}
              {saved ? 'Guardado' : 'Guardar'}
            </button>
            <button
              onClick={handlePublish}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              style={{ background: published ? '#16a34a' : '#304FFE', opacity: published ? 0.95 : 1 }}
            >
              {published && <Check size={11} />}
              {published ? 'Publicado ✓' : 'Publicar'}
            </button>
          </div>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {isProject ? (
          <AgentsListSidebar
            collapsed={!showSidebar}
            onToggle={() => setShowSidebar(s => !s)}
            onOrchestratorClick={() => { /* already here */ }}
            onAgentClick={() => { window.location.href = '/agente' }}
          />
        ) : (
          showSidebar && (
            <AgentsSidebar
              selectedSubAgentId={selectedSubAgentId}
              onSelectSubAgent={selectSubAgent}
              onOrchestratorClick={openOrchestrator}
            />
          )
        )}

        <main className="flex-1 overflow-hidden relative">
          {isProject ? (
            <ProjectView embedded />
          ) : (
            <DrawerProvider>
              <ReactFlowProvider>
                <AutomationCanvas />
              </ReactFlowProvider>
              <WebChat />
            </DrawerProvider>
          )}
        </main>
      </div>

      {/* ── Hint bar (canvas-only) ──────────────────────────────────────── */}
      {!isProject && (
        <div className="px-5 py-2 border-t border-[#E2E7FF] bg-white flex items-center gap-4 flex-shrink-0">
          <p className="text-xs text-slate-500">
            Escribí{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-600 text-[11px]">/</kbd>{' '}
            o{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-600 text-[11px]">$</kbd>{' '}
            dentro del prompt de un nodo para agregar integraciones (Google Sheets, WhatsApp, Gmail y más)
          </p>
        </div>
      )}

    </div>
  )
}
