import { useState } from 'react'
import WorkflowCanvas from './components/WorkflowCanvas'
import type { WorkflowCanvasProps } from './components/WorkflowCanvas'

// ─── Apple KBs ────────────────────────────────────────────────────────────────

const KB_MAC        = { id: 'kb-mac',        type: 'kb' as const, name: 'Mac Lineup 2025',        color: '#3B82F6' }
const KB_IPHONE     = { id: 'kb-iphone',     type: 'kb' as const, name: 'iPhone 16 Specs',         color: '#EF4444' }
const KB_IPAD       = { id: 'kb-ipad',       type: 'kb' as const, name: 'iPad Pro Guide',          color: '#8B5CF6' }
const KB_APPLECARE  = { id: 'kb-applecare',  type: 'kb' as const, name: 'AppleCare+ Coverage',     color: '#10B981' }
const KB_PRICING    = { id: 'kb-pricing',    type: 'kb' as const, name: 'Pricing & Promotions',    color: '#F59E0B' }
const KB_TROUBLE    = { id: 'kb-trouble',    type: 'kb' as const, name: 'Troubleshooting Guides',  color: '#64748B' }
const KB_REPAIR     = { id: 'kb-repair',     type: 'kb' as const, name: 'Repair & Returns Policy', color: '#F97316' }

const MCP_SF        = { id: 'mcp-sf',     type: 'mcp' as const, name: 'Salesforce CRM',    color: '#00A1E0' }
const MCP_JIRA      = { id: 'mcp-jira',   type: 'mcp' as const, name: 'Jira Tickets',      color: '#0052CC' }
const MCP_SLACK     = { id: 'mcp-slack',  type: 'mcp' as const, name: 'Slack Notify',      color: '#4A154B' }
const MCP_SERVICENOW = { id: 'mcp-snow', type: 'mcp' as const, name: 'ServiceNow',         color: '#62D84E' }

// ─── Agent Definitions ────────────────────────────────────────────────────────

const PRIMARY = '#304FFE'
const AMBER   = '#D97706'

type StateResource = { id: string; type: 'kb' | 'mcp'; name: string; color: string }

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

interface AgentDef {
  id: string
  name: string
  emoji: string
  description: string
  kbCount: number
  mcpCount: number
  status: 'active' | 'configuring'
  color: string
  nodes: any[]
  edges: any[]
}

const AGENTS: AgentDef[] = [
  {
    id: 'sales',
    name: 'Sales Agent',
    emoji: '💼',
    description: 'Atiende a usuarios interesados en productos Apple, los califica y cierra oportunidades.',
    kbCount: 5, mcpCount: 1,
    status: 'active',
    color: '#3B82F6',
    nodes: [
      START,
      mk('disc',   'Discovery',        280,  '#3B82F6', 'simple',  ['whatsapp'],              [KB_MAC, KB_IPHONE]),
      mk('qual',   'Qualification',    580,  '#EAB308', 'complex', ['whatsapp', 'sheets'],    [KB_MAC, KB_IPHONE, KB_IPAD, KB_PRICING, MCP_SF]),
      mk('demo',   'Product Demo',     880,  '#9333EA', 'complex', ['gmail', 'calendar'],     [KB_MAC, KB_IPHONE, KB_IPAD, KB_PRICING]),
      mk('prop',   'Proposal Sent',    1180, '#0F766E', 'complex', ['gmail', 'sheets'],       [KB_PRICING, KB_APPLECARE, MCP_SF]),
      mk('won',    'Closed Won',       1480, '#16A34A', 'final',   [],                        [KB_APPLECARE, MCP_SF]),
      mk('lost',   'Closed Lost',      1480, '#DC2626', 'final'),
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
    description: 'Recibe tickets de soporte técnico, los triage y los resuelve con bases de conocimiento.',
    kbCount: 2, mcpCount: 2,
    status: 'active',
    color: '#16A34A',
    nodes: [
      START,
      mk('recv',    'Ticket received',   280,  '#3B82F6', 'simple',  ['whatsapp'],                   [KB_TROUBLE]),
      mk('triage',  'Triage',            580,  '#F59E0B', 'complex', ['slack'],                      [KB_TROUBLE, MCP_JIRA, MCP_SERVICENOW]),
      mk('diag',    'Diagnosis',         880,  '#9333EA', 'complex', ['slack', 'sheets'],             [KB_TROUBLE, MCP_JIRA]),
      mk('low',     'Low priority',      1180, '#94A3B8', 'simple',  [],                             [KB_TROUBLE]),
      mk('high',    'High priority',     1180, '#EF4444', 'complex', ['gmail', 'slack'],             [KB_TROUBLE, MCP_JIRA, MCP_SERVICENOW, MCP_SLACK]),
      mk('resolved','Resolved',          1480, '#16A34A', 'final'),
      mk('escalated','Escalated',        1480, '#9333EA', 'final'),
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
    description: 'Gestiona solicitudes de devolución y reparación, coordina con AppleCare.',
    kbCount: 2, mcpCount: 1,
    status: 'configuring',
    color: '#F97316',
    nodes: [
      START,
      mk('req',    'Return Request',   280,  '#3B82F6', 'simple',  ['whatsapp'],           [KB_REPAIR]),
      mk('assess', 'Assessment',       580,  '#F59E0B', 'complex', ['sheets'],             [KB_REPAIR, KB_APPLECARE]),
      mk('quote',  'Repair Quote',     880,  '#9333EA', 'complex', ['gmail'],              [KB_APPLECARE, KB_PRICING, MCP_SERVICENOW]),
      mk('repair', 'In Repair',        1180, '#EAB308', 'simple',  [],                    [MCP_SERVICENOW]),
      mk('done',   'Returned',         1480, '#16A34A', 'final'),
    ],
    edges: [
      mkE('start', 'req'), mkE('req', 'assess'), mkE('assess', 'quote'),
      mkE('quote', 'repair'), mkE('repair', 'done'),
    ],
  },
]

// ─── Orchestrator banner chip ─────────────────────────────────────────────────

function StatusChip({ status }: { status: 'active' | 'configuring' }) {
  const cfg = status === 'active'
    ? { bg: '#DCFCE7', color: '#15803D', dot: '#22C55E', label: 'Active' }
    : { bg: '#FEF3C7', color: '#B45309', dot: AMBER, label: 'Configuring' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 100, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />{cfg.label}
    </span>
  )
}

function KbBadge({ count, color }: { count: number; color: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: '#64748B' }}>
      <span style={{ width: 14, height: 14, borderRadius: 3, background: color + '22', border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>📚</span>
      {count} KB
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AppleFlow() {
  const [selectedId, setSelectedId] = useState<string>('sales')
  const agent = AGENTS.find(a => a.id === selectedId)!

  return (
    <div style={{ minHeight: '100vh', height: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', fontFamily: 'Roboto, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Orchestrator header ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/" style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', textDecoration: 'none', marginRight: 4 }}>← Volver</a>
          <div style={{ width: 1, height: 20, background: '#E2E8F0' }} />
          {/* Apple logo mock */}
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🍎
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Apple AI Platform</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', background: '#F1F5F9', padding: '2px 8px', borderRadius: 100 }}>Orchestrator</span>
              <StatusChip status="active" />
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              3 AI agents · Support, Sales & Repairs — WhatsApp + Web
            </div>
          </div>
        </div>
      </div>

      {/* ── Agent selector ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 32px', flexShrink: 0, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 0, minWidth: 'max-content' }}>
          {AGENTS.map(ag => {
            const active = ag.id === selectedId
            return (
              <button
                key={ag.id}
                onClick={() => setSelectedId(ag.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 20px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: active ? `2.5px solid ${PRIMARY}` : '2.5px solid transparent',
                  transition: 'border-color 140ms',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F8FAFC' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
              >
                {/* Agent avatar */}
                <div style={{ width: 32, height: 32, borderRadius: 9, background: ag.color + '18', border: `1.5px solid ${ag.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {ag.emoji}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#0F172A' : '#475569' }}>
                    {ag.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <KbBadge count={ag.kbCount} color={ag.color} />
                    <StatusChip status={ag.status} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Agent context bar ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '10px 32px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 18 }}>{agent.emoji}</div>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{agent.name}</span>
          <span style={{ fontSize: 13, color: '#64748B', marginLeft: 10 }}>{agent.description}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <KbBadge count={agent.kbCount} color={agent.color} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: '#6366F122', border: '1px solid #6366F144', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>⚙️</span>
            {agent.mcpCount} MCP
          </span>
          <div style={{ width: 1, height: 16, background: '#E2E8F0', margin: '0 4px' }} />
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, border: `1px solid ${PRIMARY}`, background: 'white', color: PRIMARY, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            ▶ Test agent
          </button>
        </div>
      </div>

      {/* ── Workflow canvas ── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <WorkflowCanvas
          key={agent.id}
          initialVariant="unified"
          agentName={agent.name}
          connectedToOrchestrator={agent.status !== 'configuring'}
          orchestratorName="Apple AI Platform"
          initialNodes={agent.nodes as any}
          initialEdges={agent.edges}
        />
      </div>

    </div>
  )
}
