import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'
import AgentsTopBar from './components/AgentsTopBar'
import WorkflowCanvas from './components/WorkflowCanvas'
import { color, font } from './ds'
import Icon from './Icon'

// ─── Types ────────────────────────────────────────────────────────────────────

type StateResource = { id: string; type: 'mcp' | 'code'; name: string; color: string }
type KbEntry = { id: string; name: string; color: string }

// ─── Apple knowledge bases (agent-level, shown in Knowledge tab only) ─────────

const KB_MAC        : KbEntry = { id: 'kb-mac',       name: 'Mac Lineup 2025',        color: '#3B82F6' }
const KB_IPHONE     : KbEntry = { id: 'kb-iphone',    name: 'iPhone 16 Specs',         color: '#EF4444' }
const KB_IPAD       : KbEntry = { id: 'kb-ipad',      name: 'iPad Pro Guide',          color: '#8B5CF6' }
const KB_APPLECARE  : KbEntry = { id: 'kb-applecare', name: 'AppleCare+ Coverage',     color: '#10B981' }
const KB_PRICING    : KbEntry = { id: 'kb-pricing',   name: 'Pricing & Promotions',    color: '#F59E0B' }
const KB_TROUBLE    : KbEntry = { id: 'kb-trouble',   name: 'Troubleshooting Guides',  color: '#64748B' }
const KB_REPAIR     : KbEntry = { id: 'kb-repair',    name: 'Repair & Returns Policy', color: '#F97316' }

// ─── Apple MCP resources (state-level, attached per node) ─────────────────────

const MCP_SF        : StateResource = { id: 'mcp-sf',    type: 'mcp', name: 'Salesforce CRM',    color: '#00A1E0' }
const MCP_JIRA      : StateResource = { id: 'mcp-jira',  type: 'mcp', name: 'Jira Tickets',      color: '#0052CC' }
const MCP_SLACK     : StateResource = { id: 'mcp-slack', type: 'mcp', name: 'Slack Notify',      color: '#4A154B' }
const MCP_SNOW      : StateResource = { id: 'mcp-snow',  type: 'mcp', name: 'ServiceNow',         color: '#62D84E' }

// ─── Node/edge builders ───────────────────────────────────────────────────────

function mk(id: string, name: string, x: number, c: string, kind: 'simple' | 'complex' | 'final' = 'simple', _flowApps?: string[], resources?: StateResource[]) {
  return {
    id, type: 'stateNode', position: { x, y: 200 },
    data: { name, description: '', color: c, requiresHuman: false, requiredData: [], kind, resources, onEdit: () => {}, onAddNext: () => {} },
  }
}
function mkE(s: string, t: string) {
  return { id: `e-${s}-${t}`, source: s, target: t, type: 'conditionEdge' }
}
const START = { id: 'start', type: 'startNode', position: { x: 80, y: 220 }, data: { onAddNext: () => {} } }

// ─── Agent definitions ────────────────────────────────────────────────────────

interface AgentDef {
  id: string
  name: string
  emoji: string
  description: string
  mission: string
  status: 'active' | 'configuring'
  agentColor: string
  version: string
  pendingChanges: number
  kbs: KbEntry[]
  nodes: any[]
  edges: any[]
}

const AGENTS: AgentDef[] = [
  {
    id: 'sales',
    name: 'Sales Agent',
    emoji: '💼',
    description: 'Ventas · WhatsApp + Web',
    mission: 'Habla con usuarios interesados en productos Apple, los califica y cierra oportunidades de venta. Usa las bases de conocimiento de productos y precios.',
    status: 'active',
    agentColor: '#3B82F6',
    version: 'v2.1',
    pendingChanges: 3,
    kbs: [KB_MAC, KB_IPHONE, KB_IPAD, KB_PRICING, KB_APPLECARE],
    nodes: [
      START,
      mk('disc',  'Discovery',       280,  '#3B82F6', 'simple'),
      mk('qual',  'Qualification',   680,  '#EAB308', 'complex', undefined, [MCP_SF]),
      mk('demo',  'Product Demo',    1080, '#9333EA', 'complex'),
      mk('prop',  'Proposal Sent',   1480, '#0F766E', 'complex', undefined, [MCP_SF]),
      mk('won',   'Closed Won',      1880, '#16A34A', 'final',   undefined, [MCP_SF]),
      mk('lost',  'Closed Lost',     1880, '#DC2626', 'final'),
    ],
    edges: [
      mkE('start', 'disc'), mkE('disc', 'qual'), mkE('qual', 'demo'),
      mkE('demo', 'prop'), mkE('prop', 'won'), mkE('prop', 'lost'),
    ],
  },
  {
    id: 'support',
    name: 'Support Agent',
    emoji: '🎧',
    description: 'Soporte técnico · WhatsApp',
    mission: 'Resuelve tickets de soporte técnico. Hace triage, diagnóstica el problema y lo resuelve usando las guías de troubleshooting. Escala casos críticos a Jira.',
    status: 'active',
    agentColor: '#16A34A',
    version: 'v1.8',
    pendingChanges: 0,
    kbs: [KB_TROUBLE, KB_APPLECARE],
    nodes: [
      START,
      mk('recv',    'Ticket received',  280,  '#3B82F6', 'simple'),
      mk('triage',  'Triage',           680,  '#F59E0B', 'complex', undefined, [MCP_JIRA, MCP_SNOW]),
      mk('diag',    'Diagnosis',        1080, '#9333EA', 'complex', undefined, [MCP_JIRA]),
      mk('low',     'Low priority',     1480, '#94A3B8', 'simple'),
      mk('high',    'High priority',    1480, '#EF4444', 'complex', undefined, [MCP_JIRA, MCP_SNOW, MCP_SLACK]),
      mk('resolved','Resolved',         1880, '#16A34A', 'final'),
      mk('escalated','Escalated',       1880, '#9333EA', 'final'),
    ],
    edges: [
      mkE('start', 'recv'), mkE('recv', 'triage'), mkE('triage', 'diag'),
      mkE('diag', 'low'), mkE('diag', 'high'),
      mkE('low', 'resolved'), mkE('high', 'resolved'), mkE('high', 'escalated'),
    ],
  },
  {
    id: 'repairs',
    name: 'Repairs & Returns',
    emoji: '🔧',
    description: 'Devoluciones · WhatsApp',
    mission: 'Gestiona solicitudes de devolución y reparación. Evalúa el caso, cotiza la reparación y coordina con AppleCare y ServiceNow.',
    status: 'configuring',
    agentColor: '#F97316',
    version: 'v0.9',
    pendingChanges: 0,
    kbs: [KB_REPAIR, KB_APPLECARE],
    nodes: [
      START,
      mk('req',    'Return Request',  280,  '#3B82F6', 'simple'),
      mk('assess', 'Assessment',      680,  '#F59E0B', 'complex'),
      mk('quote',  'Repair Quote',    1080, '#9333EA', 'complex', undefined, [MCP_SNOW]),
      mk('repair', 'In Repair',       1480, '#EAB308', 'simple',  undefined, [MCP_SNOW]),
      mk('done',   'Returned',        1880, '#16A34A', 'final'),
    ],
    edges: [
      mkE('start', 'req'), mkE('req', 'assess'), mkE('assess', 'quote'),
      mkE('quote', 'repair'), mkE('repair', 'done'),
    ],
  },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const SIDEBAR_W = 256

function AppleSidebar({ collapsed, onToggle, selectedId, onSelect, view, onOrchestratorClick }: {
  collapsed: boolean
  onToggle: () => void
  selectedId: string
  onSelect: (id: string) => void
  view: 'agent' | 'orchestrator'
  onOrchestratorClick: () => void
}) {
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: collapsed ? 0 : SIDEBAR_W, height: '100%', transition: 'width 0.22s ease' }}>
      <aside style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_W,
        background: 'white', borderRight: `1px solid ${color.borderSubtle}`,
        display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden',
        transform: collapsed ? `translateX(-${SIDEBAR_W + 1}px)` : 'translateX(0)',
        transition: 'transform 0.22s ease',
      }}>

        {/* ── Agentes section ── */}
        <div style={{ padding: '20px 16px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: color.grey900 }}>Agentes</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: color.primary, background: color.primaryUltraLight, borderRadius: 100, padding: '2px 8px', lineHeight: 1.2 }}>
                {AGENTS.length}
              </span>
            </div>
            <button style={{ width: 26, height: 26, borderRadius: 8, border: 'none', background: color.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'opacity 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            ><Plus size={14} /></button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} color={color.grey400} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input placeholder="Buscar agentes" style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px 7px 30px', borderRadius: 8, border: `1px solid ${color.borderDefault}`, fontSize: 12.5, color: color.grey800, outline: 'none', background: color.grey50, fontFamily: font.family }}
              onFocus={e => { e.currentTarget.style.borderColor = color.primary; e.currentTarget.style.background = 'white' }}
              onBlur={e => { e.currentTarget.style.borderColor = color.borderDefault; e.currentTarget.style.background = color.grey50 }}
            />
          </div>
        </div>

        <div style={{ padding: '4px 8px 12px' }}>
          {AGENTS.map(ag => {
            const selected = ag.id === selectedId
            return (
              <button key={ag.id} onClick={() => onSelect(ag.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', background: selected ? color.primaryUltraLight : 'transparent', color: selected ? color.primary : color.grey800, fontSize: 12.5, fontWeight: selected ? 600 : 500, transition: 'background 0.12s' }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.background = color.grey50 }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: selected ? 'white' : color.grey100, border: selected ? `1px solid ${color.primaryLight}` : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                  {ag.emoji}
                </span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ag.name}</span>
                {ag.status === 'configuring' && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
                )}
              </button>
            )
          })}
        </div>

        {/* ── Orquestadores section ── */}
        <div style={{ padding: '16px 16px 8px', borderTop: `1px solid ${color.grey100}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: color.grey900 }}>Orquestadores</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: color.grey700, background: color.grey100, borderRadius: 100, padding: '2px 8px', lineHeight: 1.2 }}>1</span>
            </div>
            <button style={{ width: 26, height: 26, borderRadius: 8, border: 'none', background: color.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'opacity 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            ><Plus size={14} /></button>
          </div>
        </div>

        <div style={{ padding: '4px 8px 16px' }}>
          <button
            onClick={onOrchestratorClick}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', background: view === 'orchestrator' ? color.primaryUltraLight : 'transparent', color: view === 'orchestrator' ? color.primary : color.grey800, fontSize: 12.5, fontWeight: view === 'orchestrator' ? 600 : 500, transition: 'background 0.12s' }}
            onMouseEnter={e => { if (view !== 'orchestrator') e.currentTarget.style.background = color.grey50 }}
            onMouseLeave={e => { if (view !== 'orchestrator') e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: view === 'orchestrator' ? 'white' : color.grey100, border: view === 'orchestrator' ? `1px solid ${color.primaryLight}` : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🍎</span>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Apple AI Platform</span>
            <span className="material-symbols-outlined" style={{ fontSize: 12, color: view === 'orchestrator' ? color.primary : color.grey300, lineHeight: 1 }}>hub</span>
          </button>
        </div>

      </aside>

      {/* Floating toggle handle */}
      <button onClick={onToggle} title={collapsed ? 'Abrir menú' : 'Cerrar menú'}
        style={{ position: 'absolute', top: 28, left: '100%', transform: 'translateX(-50%)', width: 26, height: 26, borderRadius: '50%', border: `1px solid ${color.borderDefault}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.primary, boxShadow: '0 2px 6px rgba(15,23,42,0.08)', transition: 'background 0.12s', zIndex: 5 }}
        onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)}
        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'perfil' | 'estados' | 'bases' | 'mcps' | 'apps' | 'codigo' | 'automatizaciones'

const TABS: { id: Tab; label: string; icon: string; isMcp?: boolean }[] = [
  { id: 'perfil',           label: 'Profile',            icon: 'ai-agent'    },
  { id: 'estados',          label: 'Workflows',          icon: 'view_kanban' },
  { id: 'bases',            label: 'Knowledge',          icon: 'description' },
  { id: 'mcps',             label: 'Integrations (MCP)', icon: '',           isMcp: true },
  { id: 'apps',             label: 'Apps',               icon: 'apps'        },
  { id: 'codigo',           label: 'Code',               icon: 'code'        },
  { id: 'automatizaciones', label: 'Automations',        icon: 'bolt'        },
]

// ─── Knowledge tab ────────────────────────────────────────────────────────────

function KnowledgeTab({ agent }: { agent: AgentDef }) {
  return (
    <div style={{ padding: '32px 36px', maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#0F172A' }}>Bases de conocimiento</h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748B' }}>
        Fuentes de información que el agente puede consultar durante la conversación.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {agent.kbs.map((kb: KbEntry) => (
          <div key={kb.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#FFFFFF', borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: kb.color + '18', border: `1.5px solid ${kb.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>📗</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>{kb.name}</div>
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 1 }}>Knowledge base · Sincronizada</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: 100 }}>● Active</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MCPsTab({ agent }: { agent: AgentDef }) {
  const allMcps = [MCP_SF, MCP_JIRA, MCP_SLACK, MCP_SNOW]
  const agentMcpIds = new Set(agent.nodes.flatMap((n: any) => (n.data?.resources ?? []).map((r: any) => r.id)))
  return (
    <div style={{ padding: '32px 36px', maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#0F172A' }}>Integraciones MCP</h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748B' }}>
        Herramientas y sistemas externos que el agente puede usar. Se asignan por estado en el workflow.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {allMcps.map(mcp => {
          const active = agentMcpIds.has(mcp.id)
          return (
            <div key={mcp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#FFFFFF', borderRadius: 10, border: '1px solid #E2E8F0', opacity: active ? 1 : 0.45 }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: mcp.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>⚙️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>{mcp.name}</div>
                <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 1 }}>{active ? 'Usado en este agente' : 'No usado en este agente'}</div>
              </div>
              {active && <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: 100 }}>● Active</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProfileTab({ agent }: { agent: AgentDef }) {
  return (
    <div style={{ padding: '32px 36px', maxWidth: 600 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#0F172A' }}>Profile</h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748B' }}>Configuración del agente de IA.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'Nombre', value: agent.name },
          { label: 'Misión del agente', value: agent.mission },
          { label: 'Orquestador', value: 'Apple AI Platform', highlight: true },
          { label: '¿Cuándo se activa?', value: 'Cuando el orquestador lo asigna según el contexto del usuario' },
        ].map(({ label, value, highlight }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>{label}</label>
            <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13.5, color: highlight ? color.primary : '#0F172A', fontWeight: highlight ? 600 : 400, lineHeight: 1.55 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Orchestrator animated line ───────────────────────────────────────────────

function OrcAnimLine({ delay = 0 }: { delay?: number }) {
  return (
    <div style={{ position: 'relative', flex: 1, height: 2, overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(90deg,#304FFE 0,#304FFE 5px,transparent 5px,transparent 11px)', opacity: 0.22 }} />
      <div style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        width: 7, height: 7, borderRadius: '50%', background: '#304FFE',
        animation: `flowDot 1.8s ${delay}s linear infinite`,
        boxShadow: '0 0 5px #304FFE88',
      }} />
    </div>
  )
}

// ─── Orchestrator view ────────────────────────────────────────────────────────

const APPLE_CHANNELS = [
  { id: 'wa',      name: 'WhatsApp',   icon: '💬' },
  { id: 'imsg',    name: 'iMessage',   icon: '🟦' },
  { id: 'web',     name: 'Web Chat',   icon: '🌐' },
  { id: 'app',     name: 'App Store',  icon: '📱' },
]

const APPLE_RESTRICTIONS = [
  'No revelar precios sin confirmar disponibilidad de stock',
  'No comprometer tiempos de reparación menores a 48 horas',
  'Escalar a humano si el cliente menciona una falla de seguridad',
  'No recomendar productos de terceros fuera del ecosistema Apple',
]

function OrchestratorView({ onSelectAgent }: { onSelectAgent: (id: string) => void }) {
  const [channels, setChannels] = useState(APPLE_CHANNELS)
  const [tono, setTono]         = useState('Profesional pero cercano. Habla en primera persona con claridad y precisión técnica. Usa el nombre del usuario cuando esté disponible. Responde en el idioma del usuario.')
  const [restricciones, setRestricciones] = useState(APPLE_RESTRICTIONS)
  const [newRestr, setNewRestr] = useState('')
  const [allowButtons, setAllowButtons] = useState(true)

  const addRestr = () => { if (!newRestr.trim()) return; setRestricciones(p => [...p, newRestr.trim()]); setNewRestr('') }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Fixed header bar ── */}
      <div style={{ background: 'white', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: `1px solid ${color.borderSubtle}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', border: `1.5px solid ${color.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>🍎</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: color.grey900, fontFamily: font.family }}>Apple AI Platform</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', color: color.grey400 }}
            onMouseEnter={e => (e.currentTarget.style.color = color.grey700)} onMouseLeave={e => (e.currentTarget.style.color = color.grey400)}>
            <Icon name="edit" size={14} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 100, border: `1px solid ${color.primary}`, background: 'white', color: color.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: font.family }}
            onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)} onMouseLeave={e => (e.currentTarget.style.background = 'white')}
          ><Icon name="schedule" size={13} /> Ejecuciones</button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 100, border: 'none', background: color.primary, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font.family }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          ><Icon name="play_arrow" size={13} /> Probar</button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 900 }}>

        {/* ── Section: Orquestador ── */}
        <section>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: color.grey900, fontFamily: font.family }}>Orquestador</h3>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: color.grey500, fontFamily: font.family }}>Los canales por donde llegan los mensajes y los agentes que el coordinador activa para responderlos. Podés conectar o desconectar cualquiera en tiempo real.</p>

          {/* Routing diagram */}
          <div style={{ background: 'white', borderRadius: 14, border: `1px solid ${color.borderSubtle}`, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>

              {/* Left: channels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 148, flexShrink: 0 }}>
                {channels.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px', borderRadius: 10, background: '#F0F4FF', border: '1px solid #DDE5FF', fontSize: 12, fontWeight: 600, color: '#304FFE', fontFamily: font.family }}>
                    <span style={{ fontSize: 15, lineHeight: 1 }}>{c.icon}</span>
                    <span style={{ flex: 1 }}>{c.name}</span>
                    <button onClick={() => setChannels(p => p.filter(ch => ch.id !== c.id))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a5b4fc', padding: 0, display: 'flex', opacity: 0.7 }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#f87171' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.color = '#a5b4fc' }}
                    ><Icon name="close" size={11} /></button>
                  </div>
                ))}
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px dashed #C7D0FF', background: 'transparent', fontSize: 12, fontWeight: 500, color: '#304FFE', cursor: 'pointer', fontFamily: font.family }}>
                  <Plus size={12} /> Agregar canal
                </button>
              </div>

              {/* Lines channels → orchestrator */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 52, flexShrink: 0 }}>
                {channels.map((_, i) => (
                  <div key={i} style={{ height: 38, display: 'flex', alignItems: 'center', paddingLeft: 4, paddingRight: 4 }}>
                    <OrcAnimLine delay={i * 0.4} />
                  </div>
                ))}
              </div>

              {/* Orchestrator brain node */}
              <div style={{ width: 120, flexShrink: 0, background: 'white', borderRadius: 16, padding: '18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: '0 2px 14px rgba(48,79,254,0.10)', border: '1.5px solid #E2E7FF', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -4, borderRadius: 20, border: '2px solid #304FFE', animation: 'orchPulse 2.5s ease-in-out infinite', opacity: 0 }} />
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#304FFE">
                  <circle cx="12" cy="12" r="2.2"/>
                  <circle cx="12" cy="3.5" r="2"/><circle cx="19.5" cy="7.5" r="2"/>
                  <circle cx="19.5" cy="16.5" r="2"/><circle cx="12" cy="20.5" r="2"/>
                  <circle cx="4.5" cy="16.5" r="2"/><circle cx="4.5" cy="7.5" r="2"/>
                  <line x1="12" y1="10" x2="12" y2="5.5" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="12" y1="10" x2="17.9" y2="9" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="12" y1="13" x2="17.9" y2="15" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="12" y1="14" x2="12" y2="18.5" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="12" y1="13" x2="6.1" y2="15" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="12" y1="10" x2="6.1" y2="9" stroke="#304FFE" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: '#304FFE', lineHeight: 1.2, fontFamily: font.family }}>Apple AI Platform</p>
                  <p style={{ margin: '3px 0 0', fontSize: 9, fontWeight: 600, color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: font.family }}>Orquestador</p>
                </div>
              </div>

              {/* Lines orchestrator → agents */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 52, flexShrink: 0 }}>
                {AGENTS.map((_, i) => (
                  <div key={i} style={{ height: 58, display: 'flex', alignItems: 'center', paddingLeft: 4, paddingRight: 4 }}>
                    <OrcAnimLine delay={i * 0.3 + 0.2} />
                  </div>
                ))}
              </div>

              {/* Right: agents */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
                {AGENTS.map(ag => (
                  <div key={ag.id}
                    onClick={() => onSelectAgent(ag.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: '#FAFBFF', border: '1px solid #ECEEFF', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ADB8FF'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(48,79,254,0.10)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#ECEEFF'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <span style={{ width: 32, height: 32, borderRadius: 9, background: '#E8EEFF', border: '1px solid #D0D8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{ag.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: font.family }}>{ag.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: '#EEF1FF', color: '#304FFE', flexShrink: 0, fontFamily: font.family }}>{ag.version}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 10.5, color: '#9E9E9E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: font.family }}>{ag.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: color.grey400, display: 'flex' }}
                        onMouseEnter={e => (e.currentTarget.style.color = color.grey700)} onMouseLeave={e => (e.currentTarget.style.color = color.grey400)}>
                        <Icon name="open_in_new" size={13} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: color.grey400, display: 'flex' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#f87171')} onMouseLeave={e => (e.currentTarget.style.color = color.grey400)}>
                        <Icon name="close" size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 100, border: '1px dashed #C7D0FF', background: 'transparent', fontSize: 12, fontWeight: 500, color: '#304FFE', cursor: 'pointer', fontFamily: font.family }}>
                  <Plus size={12} /> Agregar agente
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* ── Section: Tono y estilo ── */}
        <section>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: color.grey900, fontFamily: font.family }}>Tono y estilo</h3>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: color.grey500, fontFamily: font.family }}>Define el tono y estilo que el orquestador utilizará para dirigir las conversaciones a los agentes correctos.</p>
          <textarea
            value={tono} onChange={e => setTono(e.target.value)} rows={5}
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E7FF', background: '#FAFBFF', fontSize: 13, color: '#424242', lineHeight: 1.6, resize: 'vertical', fontFamily: font.family, outline: 'none' }}
            onFocus={e => (e.target.style.borderColor = '#304FFE')} onBlur={e => (e.target.style.borderColor = '#E2E7FF')}
          />
        </section>

        {/* ── Section: Restricciones ── */}
        <section>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: color.grey900, fontFamily: font.family }}>Restricciones</h3>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: color.grey500, fontFamily: font.family }}>Define las restricciones y limitaciones que el orquestador debe respetar al interactuar con los usuarios.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {restricciones.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'white', borderRadius: 10, border: '1px solid #ECEEFF', padding: '12px 16px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', flexShrink: 0, marginTop: 6 }} />
                <span style={{ flex: 1, fontSize: 13, color: '#424242', lineHeight: 1.55, fontFamily: font.family }}>{i + 1}. {item}</span>
                <button onClick={() => setRestricciones(p => p.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 3, display: 'flex', flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f87171')} onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}
                ><Icon name="delete" size={14} /></button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newRestr} onChange={e => setNewRestr(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRestr()}
                placeholder="Agregar restricción..."
                style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1px solid #E2E7FF', background: 'white', fontSize: 13, color: '#424242', outline: 'none', fontFamily: font.family }}
                onFocus={e => (e.target.style.borderColor = '#304FFE')} onBlur={e => (e.target.style.borderColor = '#E2E7FF')}
              />
              <button onClick={addRestr} style={{ padding: '9px 16px', borderRadius: 100, background: '#304FFE', border: 'none', fontSize: 12.5, fontWeight: 600, color: 'white', cursor: 'pointer', fontFamily: font.family }}>Agregar</button>
            </div>
          </div>
        </section>

        {/* ── Section: Permitir botones ── */}
        <section style={{ background: 'white', borderRadius: 12, border: `1px solid ${color.borderSubtle}`, padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: color.grey900, fontFamily: font.family }}>Permitir botones en conversaciones</div>
              <div style={{ fontSize: 12.5, color: color.grey500, marginTop: 3, fontFamily: font.family }}>Permite que el orquestador cree botones interactivos dentro de las conversaciones para guiar al usuario.</div>
            </div>
            <button onClick={() => setAllowButtons(v => !v)} style={{ width: 44, height: 24, borderRadius: 12, background: allowButtons ? '#304FFE' : '#e2e8f0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <span style={{ position: 'absolute', top: 4, left: allowButtons ? 23 : 4, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
        </section>

        {/* ── Section: Eliminar orquestador ── */}
        <section style={{ background: 'white', borderRadius: 12, border: `1px solid ${color.borderSubtle}`, padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: color.grey900, fontFamily: font.family }}>Eliminar orquestador</div>
              <div style={{ fontSize: 12.5, color: color.grey500, marginTop: 3, fontFamily: font.family }}>Esta acción es permanente y no se puede deshacer.</div>
            </div>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, border: '1px solid #FCA5A5', background: 'white', color: '#DC2626', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: font.family, flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#DC2626' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#FCA5A5' }}
            ><Icon name="delete" size={14} /> Eliminar</button>
          </div>
        </section>

        <div style={{ height: 40 }} />

      </div>
    </div>
  )
}

// ─── Empty-state banner for placeholder tabs ─────────────────────────────────

function TabComingSoon({ icon, title, hint }: { icon: string; title: string; hint: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 16 }}>
      <div style={{ width: 80, height: 80, borderRadius: 22, background: color.primaryUltraLight, border: `1.5px solid ${color.primaryLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={38} color={color.primary} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: color.grey900, fontFamily: font.family, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: color.grey500, fontFamily: font.family, lineHeight: 1.55, maxWidth: 320 }}>{hint}</div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AppleFlow() {
  const [selectedId, setSelectedId]   = useState<string>('sales')
  const [activeTab, setActiveTab]     = useState<Tab>('estados')
  const [showSidebar, setShowSidebar] = useState(true)
  const [view, setView]               = useState<'agent' | 'orchestrator'>('agent')

  const agent = AGENTS.find(a => a.id === selectedId)!

  const handleSelectAgent = (id: string) => {
    setSelectedId(id)
    setActiveTab('estados')
    setView('agent')
  }

  return (
    <div style={{ height: '100vh', background: color.bgAI, fontFamily: font.family, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Top menu (real component with hamburger + icons + avatar) ── */}
      <AgentsTopBar onToggleSidebar={() => setShowSidebar(s => !s)} />

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar with Apple agents ── */}
        <AppleSidebar
          collapsed={!showSidebar}
          onToggle={() => setShowSidebar(s => !s)}
          selectedId={selectedId}
          onSelect={handleSelectAgent}
          view={view}
          onOrchestratorClick={() => setView('orchestrator')}
        />

        {/* ── Right panel ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {view === 'orchestrator' ? (
            <OrchestratorView onSelectAgent={handleSelectAgent} />
          ) : (
            <>
              {/* ── Agent header ── */}
              <div style={{ background: 'white', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: `1px solid ${color.borderSubtle}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: color.primaryUltraLight, border: `1.5px solid ${color.primaryLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {agent.emoji}
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: color.grey900 }}>{agent.name}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: color.grey500, background: color.grey100, padding: '2px 8px', borderRadius: 100 }}>{agent.version}</span>
                  {agent.status === 'configuring' && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: 100 }}>Configurando</span>
                  )}
                  {agent.pendingChanges > 0 && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: 100 }}>{agent.pendingChanges} cambios pendientes</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, border: `1px solid ${color.primary}`, background: 'white', color: color.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)} onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                  ><Icon name="schedule" size={13} /> Historial</button>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, border: 'none', background: color.primary, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  ><Icon name="upload" size={13} /> Publicar</button>
                </div>
              </div>

              {/* ── Tab bar ── */}
              <div style={{ background: 'white', borderBottom: `1px solid ${color.borderSubtle}`, height: 44, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 4, flexShrink: 0, zIndex: 9 }}>
                {TABS.map(tab => {
                  const active = activeTab === tab.id
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 100, border: 'none', cursor: 'pointer', background: active ? color.primaryUltraLight : 'transparent', color: active ? color.primary : color.grey600, fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all 0.12s' }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = color.grey50; e.currentTarget.style.color = color.grey800 } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color.grey600 } }}
                    >
                      {tab.isMcp
                        ? <img src="/mcp-logo.png" style={{ width: 16, height: 16, objectFit: 'contain', opacity: active ? 1 : 0.5 }} />
                        : tab.icon === 'ai-agent'
                          ? <img src="/avatar-ai.svg" style={{ width: 16, height: 16, opacity: active ? 1 : 0.5, filter: active ? 'brightness(0) saturate(100%) invert(23%) sepia(93%) saturate(7484%) hue-rotate(234deg) brightness(101%) contrast(101%)' : undefined }} />
                          : <Icon name={tab.icon} size={16} />
                      }
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* ── Tab content ── */}
              <main style={{ flex: 1, overflow: activeTab === 'estados' ? 'hidden' : 'auto', background: activeTab === 'estados' ? '#F8FAFC' : 'transparent', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'estados' && (
                  <WorkflowCanvas
                    key={agent.id}
                    initialVariant="unified"
                    agentName={agent.name}
                    connectedToOrchestrator={agent.status === 'active'}
                    orchestratorName="Apple AI Platform"
                    initialNodes={agent.nodes}
                    initialEdges={agent.edges}
                    onToggleSidebar={() => setShowSidebar(s => !s)}
                  />
                )}
                {activeTab === 'perfil'           && <ProfileTab agent={agent} />}
                {activeTab === 'bases'            && <KnowledgeTab agent={agent} />}
                {activeTab === 'mcps'             && <MCPsTab agent={agent} />}
                {activeTab === 'apps'             && <TabComingSoon icon="apps" title="Apps" hint="Conectá aplicaciones externas y herramientas de productividad que el agente puede usar durante las conversaciones." />}
                {activeTab === 'codigo'           && <TabComingSoon icon="code" title="Code" hint="Ejecutá funciones personalizadas escritas en JavaScript o Python directamente desde los estados del workflow." />}
                {activeTab === 'automatizaciones' && <TabComingSoon icon="bolt" title="Automations" hint="Configurá disparadores automáticos para que el agente actúe sin necesidad de intervención manual." />}
              </main>
            </>
          )}

        </div>{/* end right panel */}
      </div>{/* end body */}
    </div>
  )
}
