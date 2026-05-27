import { useState } from 'react'
import WorkflowCanvas from './components/WorkflowCanvas'

// ─── Types ────────────────────────────────────────────────────────────────────

type StateResource = { id: string; type: 'kb' | 'mcp'; name: string; color: string }

// ─── Apple resources ──────────────────────────────────────────────────────────

const KB_MAC        : StateResource = { id: 'kb-mac',       type: 'kb',  name: 'Mac Lineup 2025',        color: '#3B82F6' }
const KB_IPHONE     : StateResource = { id: 'kb-iphone',    type: 'kb',  name: 'iPhone 16 Specs',         color: '#EF4444' }
const KB_IPAD       : StateResource = { id: 'kb-ipad',      type: 'kb',  name: 'iPad Pro Guide',          color: '#8B5CF6' }
const KB_APPLECARE  : StateResource = { id: 'kb-applecare', type: 'kb',  name: 'AppleCare+ Coverage',     color: '#10B981' }
const KB_PRICING    : StateResource = { id: 'kb-pricing',   type: 'kb',  name: 'Pricing & Promotions',    color: '#F59E0B' }
const KB_TROUBLE    : StateResource = { id: 'kb-trouble',   type: 'kb',  name: 'Troubleshooting Guides',  color: '#64748B' }
const KB_REPAIR     : StateResource = { id: 'kb-repair',    type: 'kb',  name: 'Repair & Returns Policy', color: '#F97316' }

const MCP_SF        : StateResource = { id: 'mcp-sf',    type: 'mcp', name: 'Salesforce CRM',    color: '#00A1E0' }
const MCP_JIRA      : StateResource = { id: 'mcp-jira',  type: 'mcp', name: 'Jira Tickets',      color: '#0052CC' }
const MCP_SLACK     : StateResource = { id: 'mcp-slack', type: 'mcp', name: 'Slack Notify',      color: '#4A154B' }
const MCP_SNOW      : StateResource = { id: 'mcp-snow',  type: 'mcp', name: 'ServiceNow',         color: '#62D84E' }

// ─── Node/edge builders ───────────────────────────────────────────────────────

function mk(id: string, name: string, x: number, color: string, kind: 'simple' | 'complex' | 'final' = 'simple', flowApps?: string[], resources?: StateResource[]) {
  return {
    id, type: 'stateNode', position: { x, y: 200 },
    data: { name, description: '', color, requiresHuman: false, requiredData: [], kind, flowApps, resources, onEdit: () => {}, onAddNext: () => {} },
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
  color: string
  kbs: StateResource[]
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
    color: '#3B82F6',
    kbs: [KB_MAC, KB_IPHONE, KB_IPAD, KB_PRICING, KB_APPLECARE],
    nodes: [
      START,
      mk('disc',  'Discovery',       280,  '#3B82F6', 'simple',  ['whatsapp'],           [KB_MAC, KB_IPHONE]),
      mk('qual',  'Qualification',   580,  '#EAB308', 'complex', ['whatsapp', 'sheets'], [KB_MAC, KB_IPHONE, KB_IPAD, KB_PRICING, MCP_SF]),
      mk('demo',  'Product Demo',    880,  '#9333EA', 'complex', ['gmail', 'calendar'],  [KB_MAC, KB_IPHONE, KB_IPAD, KB_PRICING]),
      mk('prop',  'Proposal Sent',   1180, '#0F766E', 'complex', ['gmail', 'sheets'],    [KB_PRICING, KB_APPLECARE, MCP_SF]),
      mk('won',   'Closed Won',      1480, '#16A34A', 'final',   [],                     [KB_APPLECARE, MCP_SF]),
      mk('lost',  'Closed Lost',     1480, '#DC2626', 'final'),
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
    color: '#16A34A',
    kbs: [KB_TROUBLE, KB_APPLECARE],
    nodes: [
      START,
      mk('recv',    'Ticket received',  280,  '#3B82F6', 'simple',  ['whatsapp'],           [KB_TROUBLE]),
      mk('triage',  'Triage',           580,  '#F59E0B', 'complex', ['slack'],              [KB_TROUBLE, MCP_JIRA, MCP_SNOW]),
      mk('diag',    'Diagnosis',        880,  '#9333EA', 'complex', ['slack', 'sheets'],    [KB_TROUBLE, MCP_JIRA]),
      mk('low',     'Low priority',     1180, '#94A3B8', 'simple',  [],                    [KB_TROUBLE]),
      mk('high',    'High priority',    1180, '#EF4444', 'complex', ['gmail', 'slack'],    [KB_TROUBLE, MCP_JIRA, MCP_SNOW, MCP_SLACK]),
      mk('resolved','Resolved',         1480, '#16A34A', 'final'),
      mk('escalated','Escalated',       1480, '#9333EA', 'final'),
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
    color: '#F97316',
    kbs: [KB_REPAIR, KB_APPLECARE],
    nodes: [
      START,
      mk('req',    'Return Request',  280,  '#3B82F6', 'simple',  ['whatsapp'],   [KB_REPAIR]),
      mk('assess', 'Assessment',      580,  '#F59E0B', 'complex', ['sheets'],     [KB_REPAIR, KB_APPLECARE]),
      mk('quote',  'Repair Quote',    880,  '#9333EA', 'complex', ['gmail'],      [KB_APPLECARE, KB_PRICING, MCP_SNOW]),
      mk('repair', 'In Repair',       1180, '#EAB308', 'simple',  [],             [MCP_SNOW]),
      mk('done',   'Returned',        1480, '#16A34A', 'final'),
    ],
    edges: [
      mkE('start', 'req'), mkE('req', 'assess'), mkE('assess', 'quote'),
      mkE('quote', 'repair'), mkE('repair', 'done'),
    ],
  },
]

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'workflows' | 'knowledge' | 'mcps' | 'profile'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'workflows', label: 'Workflows', icon: '⬡' },
  { id: 'knowledge', label: 'Knowledge', icon: '📚' },
  { id: 'mcps',      label: 'MCPs',      icon: '⚙️' },
  { id: 'profile',   label: 'Profile',   icon: '🤖' },
]

const PRIMARY = '#304FFE'

// ─── Knowledge tab content ────────────────────────────────────────────────────

function KnowledgeTab({ agent }: { agent: AgentDef }) {
  return (
    <div style={{ padding: '32px 36px', maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#0F172A' }}>Bases de conocimiento</h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748B' }}>
        Fuentes de información que el agente puede consultar durante la conversación.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {agent.kbs.map(kb => (
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
  const agentMcpIds = new Set(agent.nodes.flatMap((n: any) => (n.data?.resources ?? []).filter((r: any) => r.type === 'mcp').map((r: any) => r.id)))
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Nombre</label>
          <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13.5, color: '#0F172A' }}>{agent.name}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Misión del agente</label>
          <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13.5, color: '#0F172A', lineHeight: 1.55 }}>{agent.mission}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Orquestador</label>
          <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13.5, color: PRIMARY, fontWeight: 600 }}>Apple AI Platform</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>¿Cuándo se activa?</label>
          <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13.5, color: '#0F172A' }}>Cuando el orquestador lo asigna según el contexto del usuario</div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AppleFlow() {
  const [selectedId, setSelectedId] = useState<string>('sales')
  const [activeTab, setActiveTab] = useState<Tab>('workflows')
  const agent = AGENTS.find(a => a.id === selectedId)!

  const handleSelectAgent = (id: string) => {
    setSelectedId(id)
    setActiveTab('workflows')
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', fontFamily: 'Roboto, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Left sidebar: orchestrator + agents ── */}
      <aside style={{ width: 240, flexShrink: 0, background: '#FFFFFF', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Orchestrator header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #E2E8F0' }}>
          <a href="/" style={{ fontSize: 11, color: '#94A3B8', textDecoration: 'none', display: 'block', marginBottom: 10, fontWeight: 600 }}>← Volver</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🍎</div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>Apple AI Platform</div>
              <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 500, marginTop: 1 }}>Orchestrator · Active</div>
            </div>
          </div>
        </div>

        {/* Agents list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 8px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.7, padding: '8px 8px 4px' }}>AI Agents</div>
          {AGENTS.map(ag => {
            const active = ag.id === selectedId
            return (
              <button
                key={ag.id}
                onClick={() => handleSelectAgent(ag.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  width: '100%', padding: '8px 10px', borderRadius: 8,
                  border: 'none', background: active ? '#EFF0FF' : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 120ms',
                  marginBottom: 2,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F8FAFC' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{ag.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? '#0F172A' : '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ag.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: ag.status === 'active' ? '#22C55E' : '#F59E0B', flexShrink: 0 }} />
                    <span style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 500 }}>
                      {ag.status === 'active' ? 'Active' : 'Configuring'}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8FAFC' }}>

        {/* Agent header */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{agent.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{agent.name}</span>
            <span style={{ fontSize: 11.5, color: '#64748B' }}>{agent.description}</span>
            {agent.status === 'configuring' && (
              <span style={{ fontSize: 10.5, fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: 100 }}>Configurando</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, border: `1px solid ${PRIMARY}`, background: 'white', color: PRIMARY, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              ▶ Test agent
            </button>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, border: 'none', background: PRIMARY, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Publicar
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 20px', display: 'flex', alignItems: 'center', height: 44, flexShrink: 0, gap: 4 }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 13px', borderRadius: 100,
                  border: 'none', background: active ? '#EFF0FF' : 'transparent',
                  color: active ? PRIMARY : '#64748B',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', transition: 'all 120ms',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#0F172A' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' } }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: activeTab === 'workflows' ? 'hidden' : 'auto' }}>
          {activeTab === 'workflows' && (
            <WorkflowCanvas
              key={agent.id}
              initialVariant="unified"
              agentName={agent.name}
              connectedToOrchestrator={agent.status === 'active'}
              orchestratorName="Apple AI Platform"
              initialNodes={agent.nodes}
              initialEdges={agent.edges}
            />
          )}
          {activeTab === 'knowledge' && <KnowledgeTab agent={agent} />}
          {activeTab === 'mcps'      && <MCPsTab agent={agent} />}
          {activeTab === 'profile'   && <ProfileTab agent={agent} />}
        </div>

      </div>
    </div>
  )
}
