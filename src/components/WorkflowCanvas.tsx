import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SuccessModal from './SuccessModal'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  BaseEdge,
  getSmoothStepPath,
  type Connection,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Plus, Trash2, Settings, LayoutGrid, Maximize2, Sparkles, MoreVertical, Braces, ChevronDown, ChevronRight, MessageSquare, GitBranch, RotateCcw, Play, Search, MousePointer2, Hand, Undo2, Redo2, Map as MapIcon, X, AlertCircle, UserCog, BookOpen, Cpu, TriangleAlert, List, Zap, Pencil, Check, Info, User, Users } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type FieldType = 'text' | 'email' | 'number' | 'date' | 'phone' | 'url' | 'enum'

interface RequiredField {
  id: string
  name: string
  description: string
  optional?: boolean
  type?: FieldType
  maxLength?: number
  pattern?: string
  enumValues?: string[]
}

interface FlowItem {
  id: string
  name: string
}

const FIELD_TYPES: { id: FieldType; label: string }[] = [
  { id: 'text',   label: 'Texto' },
  { id: 'email',  label: 'Email' },
  { id: 'number', label: 'Número' },
  { id: 'date',   label: 'Fecha' },
  { id: 'phone',  label: 'Teléfono' },
  { id: 'url',    label: 'URL' },
  { id: 'enum',   label: 'Lista de opciones' },
]

interface StateResource {
  id: string
  type: 'mcp' | 'code'
  name: string
  color: string
}

type HandledBy = 'ia' | 'human'

type StateNodeData = Record<string, unknown> & {
  name: string
  description: string
  color: string
  requiresHuman: boolean
  handledBy?: HandledBy
  assignee?: string
  prompt?: string
  requiredData: RequiredField[]
  kind: 'simple' | 'complex' | 'final'
  flowApps?: string[]
  resources?: StateResource[]
  isDisconnected?: boolean
  isEditing?: boolean
  variant?: 'classic' | 'unified'
  onEdit: (id: string) => void
  onAddNext: (id: string) => void
  onOpenAdvanced?: (id: string) => void
}
type StartNodeData = Record<string, unknown> & { onAddNext: (id: string) => void }
type AddNodeData = Record<string, unknown> & { fromId: string; onAdd: (fromId: string) => void }

type AnyNode = Node<StateNodeData | StartNodeData | AddNodeData>

// ─── Palette ───────────────────────────────────────────────────────────────────

const COLORS = [
  '#16A34A', // green
  '#3B82F6', // blue
  '#EAB308', // yellow
  '#9333EA', // purple
  '#0F766E', // teal
  '#EC4899', // pink
  '#F59E0B', // orange
  '#475569', // slate
  '#DC2626', // red
  '#0F172A', // ink
]

const PRIMARY = '#304FFE'

const FLOW_APPS: Record<string, { label: string; color: string; letter: string; img?: string }> = {
  gmail:     { label: 'Gmail',           color: '#EA4335', letter: 'G', img: '/logos/gmail.png' },
  whatsapp:  { label: 'WhatsApp',        color: '#25D366', letter: 'W', img: '/logos/whatsapp.webp' },
  sheets:    { label: 'Google Sheets',   color: '#34A853', letter: 'S', img: '/logos/google-sheets.png' },
  slack:     { label: 'Slack',           color: '#4A154B', letter: 'S' },
  webhook:   { label: 'Webhook',         color: '#6366F1', letter: 'W' },
  calendar:  { label: 'Google Calendar', color: '#4285F4', letter: 'C', img: '/logos/google-calendar.webp' },
  notion:    { label: 'Notion',          color: '#000000', letter: 'N' },
  hubspot:   { label: 'HubSpot',         color: '#FF7A59', letter: 'H' },
}


// ─── Initial data ──────────────────────────────────────────────────────────────

const INITIAL_NODES: AnyNode[] = [
  { id: 'start',  type: 'startNode', position: { x: 80,  y: 220 }, data: { onAddNext: () => {} } as any },
  { id: 's_todo', type: 'stateNode', position: { x: 280, y: 195 }, data: { name: 'Lead Follow-up', description: 'Follow up with new leads via WhatsApp to qualify their interest.', color: '#16A34A', requiresHuman: false, requiredData: [], kind: 'complex', flowApps: ['whatsapp', 'gmail', 'sheets'], onEdit: () => {}, onAddNext: () => {} } as any },
]

// ─── Workflow Templates ────────────────────────────────────────────────────────

interface Template {
  id: string
  name: string
  emoji: string
  description: string
  build: () => { nodes: AnyNode[]; edges: Edge[] }
}

function mkState(id: string, name: string, x: number, color: string, kind: 'simple' | 'complex' | 'final' = 'simple', flowApps?: string[], resources?: StateResource[]): AnyNode {
  return {
    id, type: 'stateNode', position: { x, y: 200 },
    data: { name, description: '', color, requiresHuman: false, requiredData: [], kind, flowApps, resources, onEdit: () => {}, onAddNext: () => {} } as any,
  }
}
function mkEdge(source: string, target: string): Edge {
  return { id: `e-${source}-${target}`, source, target, type: 'conditionEdge' }
}

const START_NODE: AnyNode = { id: 'start', type: 'startNode', position: { x: 80, y: 220 }, data: { onAddNext: () => {} } as any }

// Auto-generate a short description for a stage based on its name
function describeStage(name: string): string {
  const n = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const rules: [RegExp, string][] = [
    [/captac|nuevo.lead|primer.contacto|entrada|inicio|bienvenid/,     'El agente recibe y registra el nuevo contacto'],
    [/calific|evalua|evaluac|prospect|interés|interes|scoring/,         'El agente evalúa el interés y el perfil del contacto'],
    [/demo|presentac|pitch|muestra/,                                    'El agente presenta el producto o servicio'],
    [/propuesta|cotizac|presupuesto|oferta/,                            'El agente envía y hace seguimiento de la propuesta'],
    [/negociac|acuerdo|tratativ/,                                       'El agente gestiona la negociación y condiciones'],
    [/cierr|venta.cerrada|ganado|won/,                                  'El agente confirma y cierra el acuerdo'],
    [/recepcion|recepció|solicitud|ingreso|nuevo.ticket/,               'El agente recibe la solicitud y registra los datos'],
    [/diagnostic|análisis|analisis|identificac|triage/,                 'El agente identifica el problema o necesidad'],
    [/resolucion|resolució|solución|solucion|respuesta/,                'El agente resuelve o escala la consulta'],
    [/confirmac|verificac|aprobac|validac/,                             'El agente confirma los datos y da el visto bueno'],
    [/preparac|procesando|en.proceso|armado/,                           'El agente coordina la preparación interna'],
    [/entrega|despacho|envío|envio|delivery/,                           'El agente coordina y confirma la entrega'],
    [/cobr|pago|facturac|deuda/,                                        'El agente gestiona el cobro o acuerdo de pago'],
    [/recordatorio|seguimiento|follow.up|re.contact/,                  'El agente hace el seguimiento y recordatorio'],
    [/seleccion|selección|horario|turno|slot/,                          'El agente ayuda a seleccionar fecha y horario'],
    [/onboard|incorporac|bienvenid|activac/,                            'El agente guía el proceso de incorporación'],
    [/soporte|support|asistencia|ayuda/,                                'El agente brinda asistencia al usuario'],
    [/finaliz|cierre.de|cerrado|completado|done|final/,                 'El proceso concluye y se registra el resultado'],
  ]
  for (const [re, desc] of rules) {
    if (re.test(n)) return desc
  }
  return `El agente gestiona la etapa de ${name.toLowerCase()}`
}

// Build a funnel (start → stages → final) from a list of stage names
function buildFromStages(names: string[]): { nodes: AnyNode[]; edges: Edge[] } {
  const palette = ['#3B82F6', '#EAB308', '#9333EA', '#F59E0B', '#0F766E', '#EC4899']
  const clean = names.map(n => n.trim()).filter(Boolean)
  const nodes: AnyNode[] = [START_NODE]
  const edges: Edge[] = []
  let prev = 'start'
  clean.forEach((name, i) => {
    const id = `s_${i}`
    const isLast = i === clean.length - 1
    const color = isLast ? '#16A34A' : palette[i % palette.length]
    const node = mkState(id, name, 280 + i * 300, color, isLast ? 'final' : 'simple')
    ;(node.data as any).description = describeStage(name)
    nodes.push(node)
    edges.push(mkEdge(prev, id))
    prev = id
  })
  return { nodes, edges }
}

const TEMPLATES: Template[] = [
  {
    id: 'blank', name: 'Start from scratch', emoji: '✨',
    description: 'An empty workflow with Start + Todo + Done',
    build: () => ({
      nodes: [START_NODE, mkState('s1', 'Todo', 280, '#3B82F6'), mkState('s2', 'Done', 680, '#16A34A', 'final')],
      edges: [mkEdge('start', 's1'), mkEdge('s1', 's2')],
    }),
  },
  {
    id: 'soporte', name: 'Support Triage', emoji: '🎧',
    description: 'Initial assessment → triage → priority-based support',
    build: () => ({
      nodes: [
        START_NODE,
        mkState('eval', 'Initial Assessment', 280, '#16A34A', 'simple', ['whatsapp']),
        mkState('triage', 'Triage in progress', 680, '#3B82F6', 'complex', ['slack', 'sheets']),
        mkState('baja', 'Low priority', 1080, '#EAB308'),
        mkState('media', 'Medium priority', 1080, '#9333EA', 'complex', ['gmail']),
        mkState('alta', 'High priority', 1080, '#0F766E', 'complex', ['gmail', 'slack', 'hubspot', 'sheets']),
        mkState('atendido', 'Resolved', 1480, '#EC4899', 'final'),
      ],
      edges: [
        mkEdge('start', 'eval'),
        mkEdge('eval', 'triage'),
        mkEdge('triage', 'baja'),
        mkEdge('triage', 'media'),
        mkEdge('triage', 'alta'),
        mkEdge('baja', 'atendido'),
        mkEdge('media', 'atendido'),
        mkEdge('alta', 'atendido'),
      ],
    }),
  },
  {
    id: 'ventas', name: 'Sales Funnel', emoji: '💼',
    description: 'Lead → qualified → demo → proposal → close',
    build: () => ({
      nodes: [
        START_NODE,
        mkState('lead', 'New lead', 280, '#3B82F6', 'simple', ['whatsapp']),
        mkState('qual', 'Qualified', 680, '#EAB308', 'complex', ['whatsapp', 'sheets']),
        mkState('demo', 'Demo scheduled', 1080, '#9333EA', 'complex', ['gmail', 'calendar']),
        mkState('prop', 'Proposal sent', 1480, '#0F766E', 'complex', ['gmail', 'sheets', 'hubspot']),
        mkState('won', 'Won', 1880, '#16A34A', 'final'),
        mkState('lost', 'Lost', 1880, '#DC2626', 'final'),
      ],
      edges: [
        mkEdge('start', 'lead'),
        mkEdge('lead', 'qual'),
        mkEdge('qual', 'demo'),
        mkEdge('demo', 'prop'),
        mkEdge('prop', 'won'),
        mkEdge('prop', 'lost'),
      ],
    }),
  },
  {
    id: 'cobranzas', name: 'Collections', emoji: '💳',
    description: 'Escalating reminders until payment agreement',
    build: () => ({
      nodes: [
        START_NODE,
        mkState('aviso', 'Friendly notice', 280, '#3B82F6'),
        mkState('r1', 'Reminder 1', 680, '#EAB308'),
        mkState('r2', 'Reminder 2', 1080, '#F59E0B'),
        mkState('plan', 'Payment plan', 1480, '#9333EA'),
        mkState('pagado', 'Paid', 1880, '#16A34A', 'final'),
      ],
      edges: [
        mkEdge('start', 'aviso'),
        mkEdge('aviso', 'r1'),
        mkEdge('r1', 'r2'),
        mkEdge('r2', 'plan'),
        mkEdge('plan', 'pagado'),
      ],
    }),
  },
  {
    id: 'pedidos', name: 'Order Taking', emoji: '🍕',
    description: 'Order → confirmation → preparation → delivery',
    build: () => ({
      nodes: [
        START_NODE,
        mkState('orden', 'Order received', 280, '#3B82F6'),
        mkState('pago', 'Payment confirmed', 680, '#EAB308'),
        mkState('coc', 'In preparation', 1080, '#F59E0B'),
        mkState('cam', 'On the way', 1480, '#9333EA'),
        mkState('ent', 'Delivered', 1880, '#16A34A', 'final'),
      ],
      edges: [
        mkEdge('start', 'orden'),
        mkEdge('orden', 'pago'),
        mkEdge('pago', 'coc'),
        mkEdge('coc', 'cam'),
        mkEdge('cam', 'ent'),
      ],
    }),
  },
  {
    id: 'onboarding', name: 'Customer Onboarding', emoji: '🎯',
    description: 'Welcome → setup → first value → activated',
    build: () => ({
      nodes: [
        START_NODE,
        mkState('bien', 'Welcome', 280, '#3B82F6'),
        mkState('setup', 'Initial setup', 680, '#EAB308'),
        mkState('valor', 'First value', 1080, '#9333EA'),
        mkState('act', 'Customer activated', 1480, '#16A34A', 'final'),
      ],
      edges: [
        mkEdge('start', 'bien'),
        mkEdge('bien', 'setup'),
        mkEdge('setup', 'valor'),
        mkEdge('valor', 'act'),
      ],
    }),
  },
]

type EdgeData = Record<string, unknown>

const INITIAL_EDGES: Edge[] = [
  { id: 'e-start-todo', source: 'start', target: 's_todo', type: 'conditionEdge' },
]

// ─── Start Node ────────────────────────────────────────────────────────────────

function StartNode() {
  return (
    <div style={{
      padding: '12px 28px',
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: 100,
      fontFamily: 'Roboto, sans-serif',
      fontSize: 14, color: '#0F172A',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      cursor: 'default',
      position: 'relative',
    }}>
      Start
      <Handle type="source" position={Position.Right} style={{ background: PRIMARY, width: 12, height: 12, border: 'none' }} />
    </div>
  )
}

// ─── Node badge with styled tooltip ───────────────────────────────────────────

function NodeBadge({ tip, children }: { tip: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <span
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      {children}
      {show && (
        <span style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#0F172A', color: 'white',
          fontSize: 11, fontWeight: 500, lineHeight: 1.4,
          padding: '4px 9px', borderRadius: 6,
          whiteSpace: 'nowrap', zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
        }}>
          {tip}
          <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #0F172A' }} />
        </span>
      )}
    </span>
  )
}

// ─── State Node (the main card) ────────────────────────────────────────────────

function StateNode({ id, data, selected }: NodeProps<Node<StateNodeData>>) {
  const { name, description, color: dotColor, isDisconnected, isEditing, requiresHuman, handledBy, kind, requiredData, onEdit } = data
  const isHuman = (handledBy as string) === 'human'
  const showHitl = !isHuman && (requiresHuman || (handledBy as string) === 'hitl')
  const hasFlow = kind === 'complex'
  const isFinal = kind === 'final'
  const dataCount = requiredData?.length ?? 0
  const hasData = dataCount > 0
  const active = isEditing || selected
  const borderColor = isDisconnected ? '#F59E0B' : active ? PRIMARY : '#E2E8F0'

  return (
    <div
      onClick={() => onEdit(id)}
      style={{
        width: 300,
        padding: '12px 16px',
        background: '#FFFFFF',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 10,
        boxShadow: active
          ? `0 0 0 3px rgba(48,79,254,0.18), 0 16px 40px -8px rgba(15,23,42,0.20)`
          : '0 1px 2px rgba(15,23,42,0.04)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'box-shadow 200ms ease-out, border-color 150ms ease',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(15,23,42,0.14)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)' }}
    >
      <Handle type="target" position={Position.Left} style={{ background: PRIMARY, width: 12, height: 12, border: 'none' }} />

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
        {isFinal && (
          <span style={{ padding: '1px 5px', borderRadius: 4, background: '#F0FDF4', color: '#16A34A', fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: 0.3, flexShrink: 0 }}>
            🏁
          </span>
        )}
      </div>

      {/* Instructions preview */}
      {description && (
        <p style={{ margin: '6px 0 0', fontFamily: 'Roboto, sans-serif', fontSize: 12, lineHeight: 1.45, color: '#64748B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {description}
        </p>
      )}

      {/* Badges row — bottom */}
      {(isHuman || showHitl) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
          {isHuman ? (
            <NodeBadge tip="Conversa un agente humano">
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                height: 20, padding: '0 7px', borderRadius: 5, cursor: 'default',
                background: '#F1F5F9',
              }}>
                <img src="/hitl-user.svg" style={{ width: 11, height: 11, filter: 'brightness(0) saturate(100%) invert(58%) sepia(8%) saturate(283%) hue-rotate(178deg) brightness(91%) contrast(86%)' }} />
                <span style={{ fontSize: 9.5, fontWeight: 600, lineHeight: 1, color: '#64748B' }}>Humano</span>
              </span>
            </NodeBadge>
          ) : showHitl && (
            <NodeBadge tip="La IA actúa, pero un humano confirma antes de avanzar">
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                height: 20, padding: '0 7px', borderRadius: 5, cursor: 'default',
                background: '#F1F5F9',
              }}>
                <img src="/hitl-user.svg" style={{ width: 11, height: 11, filter: 'brightness(0) saturate(100%) invert(58%) sepia(8%) saturate(283%) hue-rotate(178deg) brightness(91%) contrast(86%)' }} />
                <span style={{ fontSize: 9.5, fontWeight: 600, lineHeight: 1, color: '#64748B' }}>HITL</span>
              </span>
            </NodeBadge>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Right} style={{ background: PRIMARY, width: 12, height: 12, border: 'none' }} />

      {/* + button to add next state */}
      <button
        onClick={e => { e.stopPropagation(); data.onAddNext(id) }}
        title="Add next state"
        style={{
          position: 'absolute', right: -36, top: '50%', transform: 'translateY(-50%)',
          width: 22, height: 22, borderRadius: '50%',
          background: '#EFF6FF', border: '1.5px dashed #BFDBFE',
          color: PRIMARY,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#DBEAFE'; e.currentTarget.style.borderStyle = 'solid' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderStyle = 'dashed' }}
      >
        <Plus size={12} />
      </button>
    </div>
  )
}

// ─── Custom edge defaults ──────────────────────────────────────────────────────

const edgeDefaults = {
  type: 'conditionEdge',
  style: { stroke: '#94A3B8', strokeWidth: 1.5 },
}

// ─── Mini Flow Preview (used in complex state cards) ───────────────────────────

function MiniFlowPreview() {
  return (
    <svg viewBox="0 0 280 56" width="100%" height="44" aria-hidden style={{ display: 'block' }}>
      {/* Edges */}
      <path d="M 24 28 H 70" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
      <path d="M 110 28 H 156" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
      <path d="M 196 28 H 232" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
      <path d="M 175 28 V 12 H 232" stroke="#94A3B8" strokeWidth="1.2" fill="none" strokeDasharray="2 3" />
      {/* Nodes */}
      <rect x="4"   y="20" width="20" height="16" rx="4" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.2" />
      <rect x="70"  y="20" width="40" height="16" rx="4" fill="#FFFFFF" stroke={PRIMARY} strokeWidth="1.2" />
      <rect x="156" y="20" width="40" height="16" rx="4" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" />
      <rect x="232" y="4"  width="44" height="16" rx="4" fill="#FFFFFF" stroke="#16A34A" strokeWidth="1.2" />
      <rect x="232" y="36" width="44" height="16" rx="4" fill="#FFFFFF" stroke="#16A34A" strokeWidth="1.2" />
      {/* Tiny dots inside nodes */}
      <circle cx="14"  cy="28" r="1.8" fill="#3B82F6" />
      <circle cx="90"  cy="28" r="1.8" fill={PRIMARY} />
      <circle cx="176" cy="28" r="1.8" fill="#F59E0B" />
      <circle cx="254" cy="12" r="1.8" fill="#16A34A" />
      <circle cx="254" cy="44" r="1.8" fill="#16A34A" />
    </svg>
  )
}

// ─── Custom edge (no label, just a smooth-step line) ───────────────────────────

function ConditionEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd }: EdgeProps<Edge<EdgeData>>) {
  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 8,
  })
  return <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ stroke: '#94A3B8', strokeWidth: 1.5 }} />
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────

type DrawerMode = 'simple' | 'steps' | 'full' | 'mix'
const DRAWER_WIDTH: Record<DrawerMode, number> = { simple: 860, steps: 600, full: 780, mix: 820 }

// Equipos y personas de atención (mock)
const ATTENTION_TEAMS = ['Equipo de Ventas', 'Equipo de Soporte', 'Cobranzas', 'Onboarding']
const ATTENTION_PEOPLE = ['María González', 'Juan Pérez', 'Lucía Fernández', 'Carlos Ruiz']

function AssigneeSelect({ value, onChange, placeholder }: { value?: string; onChange: (v: string) => void; placeholder: string }) {
  const [open, setOpen] = useState(false)
  const isTeam = value ? ATTENTION_TEAMS.includes(value) : false
  return (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 9, width: '100%',
          padding: '9px 12px', borderRadius: 9, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
          border: `1.5px solid ${open ? PRIMARY : '#E2E8F0'}`, background: 'white', transition: 'border-color 0.15s',
        }}
      >
        {value ? (
          <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: isTeam ? '#EEF0FF' : '#F0FDF4', color: isTeam ? PRIMARY : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
            {isTeam ? <Cpu size={12} /> : value.split(' ').map(w => w[0]).slice(0, 2).join('')}
          </span>
        ) : (
          <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={13} color="#94A3B8" />
          </span>
        )}
        <span style={{ flex: 1, fontSize: 13, fontWeight: value ? 600 : 500, color: value ? '#0F172A' : '#94A3B8' }}>{value || placeholder}</span>
        <ChevronDown size={15} color="#94A3B8" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{ marginTop: 6, background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 8px 20px -10px rgba(15,23,42,0.15)', overflow: 'hidden', animation: 'wfFadeUp 0.18s ease-out' }}>
          {([['Equipos', ATTENTION_TEAMS, true], ['Personas', ATTENTION_PEOPLE, false]] as const).map(([label, list]) => (
            <div key={label}>
              <div style={{ padding: '8px 12px 4px', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
              {list.map(name => {
                const sel = value === name
                const team = ATTENTION_TEAMS.includes(name)
                return (
                  <button key={name} onClick={() => { onChange(name); setOpen(false) }} style={{
                    display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 12px',
                    border: 'none', background: sel ? 'rgba(48,79,254,0.06)' : 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#F8FAFC' }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: team ? '#EEF0FF' : '#F0FDF4', color: team ? PRIMARY : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                      {team ? <Cpu size={12} /> : name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{name}</span>
                    {sel && <Check size={13} color={PRIMARY} strokeWidth={2.5} />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EditStateDrawer({
  node, onClose, onSave, onDelete, onOpenAdvanced, onMakeFinal, drawerMode, setDrawerMode, isCreating,
}: {
  node: Node<StateNodeData>
  onClose: () => void
  onSave: (id: string, patch: Partial<StateNodeData>) => void
  onDelete: (id: string) => void
  onOpenAdvanced: (id: string) => void
  onMakeFinal: (id: string) => void
  drawerMode: DrawerMode
  setDrawerMode: (m: DrawerMode) => void
  isCreating?: boolean
}) {
  const [name, setName] = useState(node.data.name)
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [description, setDescription] = useState(node.data.description)
  const [color, setColor] = useState(node.data.color)
  const [requiresHuman, setRequiresHuman] = useState(node.data.requiresHuman || (node.data.handledBy as string) === 'hitl')
  const [handledBy, setHandledBy] = useState<HandledBy>((node.data.handledBy as string) === 'human' ? 'human' : 'ia')
  const [requiredData, setRequiredData] = useState<RequiredField[]>(node.data.requiredData ?? [])
  const [resources, setResources] = useState<StateResource[]>(node.data.resources ?? [])
  const [assignee, setAssignee] = useState<string | undefined>(node.data.assignee)
  const [prompt, setPrompt] = useState(node.data.prompt ?? '')
  const [colorOpen, setColorOpen] = useState(false)
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 4
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(true)
  const [focusedSection, setFocusedSection] = useState<'identify' | 'desc' | 'assign' | 'data' | 'advanced'>('identify')
  // Modo creación: activeStep = paso expandido actualmente, maxStep = hasta dónde llegó (para los ✓)
  const [activeStep, setActiveStep] = useState(isCreating ? 1 : 99)
  const [maxStep, setMaxStep] = useState(isCreating ? 1 : 99)

  useEffect(() => {
    setName(node.data.name)
    setDescription(node.data.description)
    setColor(node.data.color)
    setRequiresHuman(node.data.requiresHuman || (node.data.handledBy as string) === 'hitl')
    setHandledBy((node.data.handledBy as string) === 'human' ? 'human' : 'ia')
    setRequiredData(node.data.requiredData ?? [])
    setResources(node.data.resources ?? [])
    setAssignee(node.data.assignee)
    setPrompt(node.data.prompt ?? '')
    setStep(1)
    setActiveStep(isCreating ? 1 : 99)
    setMaxStep(isCreating ? 1 : 99)
  }, [node.id]) // eslint-disable-line

  const handleHandledBy = (v: HandledBy) => {
    setHandledBy(v)
  }

  // Descripción: límite de 15 palabras (no es un prompt)
  const MAX_CHARS = 120
  const handleDescChange = (val: string) => {
    setDescription(val.slice(0, MAX_CHARS))
  }

  useEffect(() => {
    // HITL (requiresHuman) sólo aplica cuando conversa la IA
    onSave(node.id, { name, description, color, requiresHuman: handledBy === 'ia' ? requiresHuman : false, handledBy, assignee, prompt, requiredData, resources })
  }, [name, description, color, requiresHuman, handledBy, assignee, prompt, // eslint-disable-line
    requiredData.map(f => f.id + f.name + f.description + String(f.optional)).join(),
    resources.map(r => r.id).join()])

  const hasFlow = node.data.kind === 'complex'

  const handleOpenFlow = () => {
    if (!hasFlow) {
      onSave(node.id, { name, description, color, requiresHuman, requiredData, kind: 'complex' })
    }
    onOpenAdvanced(node.id)
  }

  // Reusable sub-components for form sections (shared between modes)
  const DescriptionField = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <textarea
        value={description}
        onChange={e => handleDescChange(e.target.value)}
        maxLength={MAX_CHARS}
        rows={3}
        placeholder='Ej: Califica leads de Meta Ads y detecta intención de compra'
        style={{
          width: '100%', boxSizing: 'border-box', resize: 'none',
          padding: '12px 14px', borderRadius: 10,
          border: '1.5px solid #E2E8F0', outline: 'none',
          fontFamily: 'Roboto, sans-serif', fontSize: 13.5, lineHeight: 1.6,
          color: '#0F172A', background: '#F8FAFC',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onFocus={e => { setFocusedSection('desc'); e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = 'white' }}
        onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#CBD5E1' }}>
          Para identificar el paso en el funnel, de un vistazo
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: description.length >= MAX_CHARS * 0.85 ? '#F59E0B' : '#CBD5E1', flexShrink: 0 }}>
          {description.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  )

  // Acordeón: cada opción es una card; la seleccionada se expande mostrando su sub-config adentro
  // Modo de conversación derivado de (handledBy, requiresHuman)
  const convMode: 'ia' | 'hitl' | 'human' = handledBy === 'human' ? 'human' : (requiresHuman ? 'hitl' : 'ia')
  const setConvMode = (m: 'ia' | 'hitl' | 'human') => {
    if (m === 'ia')   { setHandledBy('ia');    setRequiresHuman(false) }
    if (m === 'hitl') { setHandledBy('ia');    setRequiresHuman(true)  }
    if (m === 'human'){ setHandledBy('human'); setRequiresHuman(false) }
  }

  const CONV_TABS: { key: 'ia' | 'hitl' | 'human'; label: string }[] = [
    { key: 'ia',    label: 'Agente IA'     },
    { key: 'hitl',  label: 'IA + Humano'   },
    { key: 'human', label: 'Agente humano' },
  ]
  const convTabIcon = (key: 'ia' | 'hitl' | 'human', sel: boolean) => {
    const activeFilter  = 'brightness(0) saturate(100%) invert(23%) sepia(93%) saturate(7484%) hue-rotate(234deg) brightness(101%) contrast(101%)'
    const mutedFilter   = 'brightness(0) saturate(100%) invert(58%) sepia(8%) saturate(283%) hue-rotate(178deg) brightness(91%) contrast(86%)'
    if (key === 'ia')    return <img src="/ai-agent.svg" style={{ width: 18, height: 18, filter: sel ? activeFilter : mutedFilter }} />
    if (key === 'hitl')  return <Users size={18} strokeWidth={2} color={sel ? PRIMARY : '#64748B'} />
    return <User  size={18} strokeWidth={2} color={sel ? PRIMARY : '#64748B'} />
  }

  const AssignCards = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {CONV_TABS.map(tab => {
          const sel = convMode === tab.key
          const descriptions: Record<string, string> = {
            ia: 'La IA responde sola, de forma autónoma y entendiendo el contexto.',
            hitl: 'La IA responde, pero una persona revisa y aprueba antes de avanzar.',
            human: 'La conversación se deriva a un operador, que la maneja por completo.',
          }
          return (
            <button key={tab.key} onClick={() => setConvMode(tab.key)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              padding: '16px 14px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
              border: `2.5px solid ${sel ? PRIMARY : '#E2E8F0'}`,
              background: sel ? 'rgba(48,79,254,0.05)' : 'white',
              transition: 'all 0.15s',
            }}>
              {convTabIcon(tab.key, sel)}
              <span style={{ fontSize: 13, fontWeight: 700, color: sel ? PRIMARY : '#0F172A', textAlign: 'center' }}>{tab.label}</span>
              <span style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.4, textAlign: 'center' }}>{descriptions[tab.key]}</span>
            </button>
          )
        })}
      </div>

      {/* Conditional config (only for modes that need it) */}
      {convMode === 'hitl' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>¿Quién revisa?</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, color: PRIMARY, fontWeight: 600, padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}><UserCog size={12} /> Personalizar</button>
          </div>
          <AssigneeSelect value={assignee} onChange={setAssignee} placeholder="Elegir una persona o equipo" />
        </div>
      )}
      {convMode === 'human' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>¿Quién atiende?</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, color: PRIMARY, fontWeight: 600, padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}><UserCog size={12} /> Personalizar</button>
          </div>
          <AssigneeSelect value={assignee} onChange={setAssignee} placeholder="Elegir una persona o equipo" />
        </div>
      )}
    </div>
  )

  // Contenido "Avanzado": sólo las instrucciones del agente (el "prompt")
  const renderAdvanced = (rich = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.55 }}>
        Escribí cómo debe comportarse el agente: cómo saludar, qué preguntar, qué tono usar, qué evitar.<br />
        <span style={{ color: '#94A3B8' }}>Es opcional — podés dejarlo vacío y el agente actúa con el contexto del paso.</span>
      </div>
      {rich ? (
        <InstructionsTextarea value={prompt} onChange={setPrompt} />
      ) : (
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={5}
          placeholder={'Ej: Saludá al usuario por su nombre si lo tenés.\nPreguntá por el tipo de consulta antes de ofrecer soluciones.\nUsá un tono cercano. Si mencionan presupuesto, registralo.'}
          style={{
            width: '100%', boxSizing: 'border-box', resize: 'vertical',
            padding: '12px 14px', borderRadius: 10,
            border: '1.5px solid #E2E8F0', outline: 'none',
            fontFamily: 'Roboto, sans-serif', fontSize: 13, lineHeight: 1.6,
            color: '#0F172A', background: '#F8FAFC', transition: 'border-color 0.15s, background 0.15s',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = 'white' }}
          onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC' }}
        />
      )}
    </div>
  )

  const HELP: Record<'identify' | 'desc' | 'assign' | 'data' | 'advanced', React.ReactNode> = {
    identify: (
      <>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>📌 Identificar el paso</div>
        <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: '0 0 12px' }}>
          Dale un nombre claro a este paso y explicá en pocas palabras qué sucede acá. Así tu equipo entiende el flujo de un vistazo.
        </p>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Ejemplo</div>
        <div style={{ fontSize: 11.5, color: '#475569', background: 'white', borderRadius: 8, padding: '10px 12px', border: '1px solid #E2E8F0', lineHeight: 1.55 }}>
          Nombre: "Calificar leads"<br />Propósito: "Detectar intención de compra"
        </div>
      </>
    ),
    desc: (
      <>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>💡 ¿Para qué sirve esto?</div>
        <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: '0 0 12px' }}>
          Es un título corto del paso —máx. 15 palabras— para que el equipo pueda entender el funnel de un vistazo. <strong style={{ color: '#475569' }}>No son instrucciones</strong> para el agente (eso va en la sección 4).
        </p>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Ejemplo</div>
        <div style={{ fontSize: 11.5, color: '#475569', background: 'white', borderRadius: 8, padding: '10px 12px', border: '1px solid #E2E8F0', lineHeight: 1.55 }}>
          "Califica leads de Meta Ads y detecta intención de compra"
        </div>
      </>
    ),
    assign: (
      <>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>🤖 Agente IA</div>
        <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: '0 0 14px' }}>
          La IA conversa sola y entiende el contexto. Podés sumarle <strong style={{ color: '#475569' }}>confirmación humana (HITL)</strong> para que un operador apruebe antes de avanzar, y definir su <strong style={{ color: '#475569' }}>prompt y herramientas</strong>.
        </p>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>👤 Agente humano</div>
        <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
          Para estados sensibles —reclamos, negociaciones, aprobaciones— donde querés que una persona maneje toda la conversación.
        </p>
      </>
    ),
    data: (
      <>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>📋 Datos a recolectar</div>
        <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: '0 0 14px' }}>
          Son los campos que el agente obtiene del usuario en este estado. Quedan guardados y disponibles para los siguientes estados.
        </p>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Ejemplos</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['Nombre completo', 'Email', 'Empresa', 'Presupuesto estimado'].map(ex => (
            <div key={ex} style={{ fontSize: 11.5, color: '#475569', background: 'white', borderRadius: 6, padding: '6px 10px', border: '1px solid #E2E8F0' }}>{ex}</div>
          ))}
        </div>
      </>
    ),
    advanced: (
      <>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>📝 Instrucciones para el agente</div>
        <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: '0 0 14px' }}>
          Acá le explicás al agente, con tus palabras, qué querés que haga en este paso. Es lo que <strong style={{ color: '#475569' }}>realmente sigue</strong> al conversar.
        </p>
        <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
          La descripción de arriba, en cambio, es sólo un rótulo corto para que el equipo entienda el funnel.
        </p>
      </>
    ),
  }

  const secStyle = (sec: 'identify' | 'desc' | 'assign' | 'data' | 'advanced') => ({
    padding: '22px 24px',
    borderBottom: '1px solid #F1F5F9',
    cursor: 'pointer',
    borderLeft: `3px solid ${focusedSection === sec ? PRIMARY : 'transparent'}`,
    background: focusedSection === sec ? 'rgba(48,79,254,0.02)' : 'white',
    transition: 'border-color 0.15s, background 0.15s',
  } as React.CSSProperties)

  const SectionHeader = (sec: 'identify' | 'desc' | 'assign' | 'data' | 'advanced', num: number, label: string, tag?: string, alwaysActive?: boolean) => {
    const on = focusedSection === sec || alwaysActive
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700,
          background: on ? PRIMARY : '#E2E8F0', color: on ? 'white' : '#94A3B8',
          transition: 'background 0.15s, color 0.15s',
        }}>{num}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: on ? '#0F172A' : '#475569', transition: 'color 0.15s' }}>{label}</span>
        {tag && <span style={{ fontSize: 11.5, fontWeight: 500, color: '#CBD5E1' }}>· {tag}</span>}
      </div>
    )
  }

  return (
    <aside
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', top: 16, left: 16, bottom: 16, zIndex: 30,
        width: DRAWER_WIDTH[drawerMode],
        background: '#FFFFFF',
        borderRadius: 14,
        border: '1px solid #E2E8F0',
        boxShadow: '24px 24px 60px -12px rgba(15,23,42,0.22), 0 4px 12px -2px rgba(15,23,42,0.08)',
        fontFamily: 'Roboto, sans-serif',
        display: 'flex', flexDirection: 'column',
        animation: 'wfDrawerSlide 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
        transition: 'width 0.22s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <style>{`
        @keyframes wfDrawerSlide{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes wfFadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes wfPop{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
        @keyframes wfStepIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes wfHelpIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes wfStoryIn{from{opacity:0;transform:translateY(8px) scale(0.99)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes wfExpand{from{opacity:0;max-height:0}to{opacity:1;max-height:600px}}
      `}</style>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '14px 18px' }}>
          {/* Color picker — solo en otros modos (en mix está en Paso 1) */}
          {drawerMode !== 'mix' && (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setColorOpen(o => !o)} title="Color del paso" style={{ width: 14, height: 14, borderRadius: '50%', background: color, border: '2px solid rgba(0,0,0,0.08)', cursor: 'pointer', padding: 0, display: 'block' }} />
              {colorOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 50, padding: 10, background: '#FFFFFF', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 12px 28px -8px rgba(15,23,42,0.18)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, minWidth: 180 }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => { setColor(c); setColorOpen(false) }} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', padding: 0, outline: color === c ? `2px solid ${PRIMARY}` : 'none', outlineOffset: 2 }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Nombre — solo en otros modos (en mix está en Paso 1) */}
          {drawerMode !== 'mix' ? (
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input autoFocus value={draftName} onChange={e => setDraftName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { setName(draftName.trim() || name); setEditingName(false) } if (e.key === 'Escape') { setEditingName(false) } }}
                    style={{ flex: 1, fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#0F172A', border: 'none', outline: 'none', background: 'transparent', borderBottom: `1.5px solid ${PRIMARY}`, padding: '0 0 1px' }}
                  />
                  <button onMouseDown={e => { e.preventDefault(); setName(draftName.trim() || name); setEditingName(false) }} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer', flexShrink: 0, background: PRIMARY, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Check size={13} strokeWidth={3} /></button>
                  <button onMouseDown={e => { e.preventDefault(); setEditingName(false) }} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #E2E8F0', cursor: 'pointer', flexShrink: 0, background: 'white', color: '#64748B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} strokeWidth={2.5} /></button>
                </div>
              ) : (
                <button onClick={() => { setDraftName(name); setEditingName(true) }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{name || 'Sin nombre'}</span>
                  <Pencil size={12} color="#94A3B8" />
                </button>
              )}
            </div>
          ) : (
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#64748B', flex: 1 }}>{name.trim() ? name : 'Nuevo paso'}</span>
          )}

          {/* Acciones: Ayuda + cerrar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {drawerMode === 'mix' && (
              <button onClick={() => setHelpOpen(o => !o)} title={helpOpen ? 'Ocultar ayuda' : 'Mostrar ayuda'} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%',
                border: '1px solid #E2E8F0', background: helpOpen ? '#F1F5F9' : 'white',
                color: '#64748B', cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
              }}>
                <Info size={16} strokeWidth={2} />
              </button>
            )}
            <button onClick={onClose} title="Cerrar" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >✕</button>
          </div>
        </div>
      </div>

      {/* ══════ MODE C: Simple / guiado (lenguaje natural) ════════ */}
      {drawerMode === 'simple' && (() => {
        const hl = (txt: string) => <strong style={{ color: PRIMARY, fontWeight: 700, background: 'rgba(48,79,254,0.07)', borderRadius: 5, padding: '1px 6px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>{txt}</strong>
        const dataNames = requiredData.map(f => f.name).filter(Boolean)
        const Q = (n: number, q: string, sub?: string) => (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 12 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: PRIMARY, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginTop: 1 }}>{n}</span>
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>{q}</div>
              {sub && <div style={{ fontSize: 12.5, color: '#94A3B8', lineHeight: 1.45, marginTop: 2 }}>{sub}</div>}
            </div>
          </div>
        )
        return (
          <>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            {/* ── Left: guided plain-language questions ── */}
            <div style={{ flex: 1, overflow: 'auto', minWidth: 0, padding: '24px 28px 28px' }}>

              {/* Q1 — qué hace */}
              <div style={{ marginBottom: 28 }}>
                {Q(1, '¿Qué hace el agente en este paso?', 'Contalo como si se lo explicaras a un compañero. En pocas palabras.')}
                {DescriptionField}
              </div>

              {/* Q2 — quién atiende */}
              <div style={{ marginBottom: 28 }}>
                {Q(2, '¿Quién atiende a la persona?')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {([['ia', '/ai-agent.svg', 'La IA', 'Responde sola, al instante'], ['human', '/hitl-user.svg', 'Una persona', 'Alguien del equipo responde']] as const).map(([mode, icon, title, sub]) => {
                    const sel = handledBy === mode
                    return (
                      <button key={mode} onClick={() => handleHandledBy(mode)} style={{
                        padding: '16px 16px', borderRadius: 14, textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit',
                        border: `2px solid ${sel ? PRIMARY : '#E2E8F0'}`,
                        background: sel ? 'rgba(48,79,254,0.05)' : 'white',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        transition: 'border-color 0.15s, background 0.15s, transform 0.12s',
                        transform: sel ? 'translateY(-1px)' : 'none',
                      }}
                        onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = '#CBD5E1' }}
                        onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = '#E2E8F0' }}
                      >
                        <span style={{ width: 44, height: 44, borderRadius: 12, background: sel ? 'rgba(48,79,254,0.10)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                          <img src={icon} style={{ width: 22, height: 22, filter: sel ? 'brightness(0) saturate(100%) invert(23%) sepia(93%) saturate(7484%) hue-rotate(234deg) brightness(101%) contrast(101%)' : 'brightness(0) saturate(100%) invert(58%) sepia(8%) saturate(283%) hue-rotate(178deg) brightness(91%) contrast(86%)' }} />
                        </span>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: sel ? PRIMARY : '#0F172A' }}>{title}</span>
                        <span style={{ fontSize: 12, color: '#64748B', lineHeight: 1.35 }}>{sub}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Sub-pregunta IA → revisión humana, en Sí/No plano */}
                {handledBy === 'ia' && (
                  <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', animation: 'wfFadeUp 0.22s ease-out' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', marginBottom: 3 }}>¿Querés que una persona revise antes de continuar?</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.45, marginBottom: 11 }}>Recomendado para casos delicados: aprobaciones, reclamos o pagos.</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {([['No', false], ['Sí, que alguien revise', true]] as const).map(([label, val]) => {
                        const sel = requiresHuman === val
                        return (
                          <button key={label} onClick={() => setRequiresHuman(val)} style={{
                            flex: 1, padding: '9px 12px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: 13, fontWeight: 600,
                            border: `1.5px solid ${sel ? PRIMARY : '#E2E8F0'}`,
                            background: sel ? PRIMARY : 'white',
                            color: sel ? 'white' : '#64748B',
                            transition: 'all 0.13s',
                          }}>{label}</button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Q3 — datos */}
              <div style={{ marginBottom: 24 }}>
                {Q(3, '¿Hay que guardar algún dato?', 'Opcional. Por ejemplo el nombre, el email o el motivo de la consulta.')}
                <RequiredDataSection fields={requiredData} onChange={setRequiredData} hideHeader />
              </div>

              {/* Opciones técnicas — colapsadas, claramente salteables */}
              <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: 16 }}>
                <button onClick={() => setAdvancedOpen(o => !o)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
                }}>
                  <span style={{ transform: advancedOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.18s', display: 'inline-flex' }}>
                    <ChevronRight size={15} color="#94A3B8" />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Instrucciones para el agente</span>
                  <span style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 500 }}>· opcional</span>
                </button>
                {advancedOpen && (
                  <div style={{ marginTop: 14, animation: 'wfFadeUp 0.2s ease-out' }}>
                    {renderAdvanced()}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: live plain-language "story" ── */}
            <div style={{ width: 300, flexShrink: 0, background: 'linear-gradient(180deg, #F8FAFF 0%, #F8FAFC 100%)', borderLeft: '1px solid #E2E8F0', overflow: 'auto', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>
                  <Sparkles size={12} /> En resumen
                </div>
                <p key={`${name}-${handledBy}-${requiresHuman}-${description}-${assignee}-${dataNames.join()}`} style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: '#334155', animation: 'wfStoryIn 0.3s ease-out' }}>
                  Cuando alguien llega a {hl(name || 'este paso')}, lo atiende{' '}
                  {handledBy === 'ia' ? hl('🤖 la IA') : hl(assignee ? `🧑 ${assignee}` : '🧑 una persona del equipo')}.{' '}
                  {description
                    ? <>Su tarea es {hl(description)}. </>
                    : <span style={{ color: '#CBD5E1' }}>(Todavía falta contar qué hace.) </span>}
                  {handledBy === 'ia' && requiresHuman && <>Antes de continuar, {hl(assignee ? `${assignee} lo revisa` : 'alguien del equipo lo revisa')}. </>}
                  {dataNames.length > 0 && <>Y guarda {hl(dataNames.join(', '))}.</>}
                </p>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-start', gap: 9, padding: '12px 13px', borderRadius: 10, background: 'rgba(48,79,254,0.05)', border: '1px solid rgba(48,79,254,0.10)' }}>
                <Info size={14} color={PRIMARY} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.5 }}>No se necesita conocimiento técnico. Responder las 3 preguntas es suficiente para configurar el estado.</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderTop: '1px solid #E2E8F0', background: '#FAFBFD', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, flexShrink: 0 }}>
            <button onClick={() => { onDelete(node.id); onClose() }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, background: '#FFFFFF', border: '1px solid #FECACA', color: '#DC2626', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}><Trash2 size={14} /> Eliminar</button>
            <button onClick={onClose} style={{ padding: '8px 24px', borderRadius: 100, background: PRIMARY, border: 'none', color: 'white', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Listo ✓</button>
          </div>
          </>
        )
      })()}

      {/* ══════ MODE A: Step by step ══════════════════════════════ */}
      {drawerMode === 'steps' && (
        <>
          {/* Progress steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '16px 18px 14px', flexShrink: 0 }}>
            {([['Identificar estado', 1], ['¿Quién responde?', 2], ['Datos', 3], ['Instrucciones', 4]] as const).map(([label, s], i) => {
              const done = s < step, current = s === step
              return (
                <Fragment key={s}>
                  <button onClick={() => setStep(s)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                    <span style={{
                      width: 21, height: 21, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10.5, fontWeight: 700,
                      background: done || current ? PRIMARY : '#E2E8F0',
                      color: done || current ? 'white' : '#94A3B8',
                      transition: 'background 0.25s, color 0.25s',
                    }}>
                      {done ? <Check size={11} strokeWidth={3} /> : s}
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: current ? 700 : 500, color: current ? '#0F172A' : '#94A3B8', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{label}</span>
                  </button>
                  {i < 3 && <span style={{ flex: 1, height: 2, margin: '0 7px', borderRadius: 2, background: s < step ? PRIMARY : '#E2E8F0', transition: 'background 0.3s' }} />}
                </Fragment>
              )
            })}
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            <div key={step} style={{ animation: 'wfStepIn 0.26s cubic-bezier(0.16,1,0.3,1) both' }}>
              {step === 1 && (
                <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Identificar el paso</span>
                    <span style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>Contale a tu equipo qué sucede en este paso del flujo. El nombre y propósito son obligatorios.</span>
                  </div>
                  {/* Nombre */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>Nombre del estado</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ej: Calificar leads"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '12px 14px', borderRadius: 10,
                        border: '1.5px solid #E2E8F0', outline: 'none',
                        fontFamily: 'Roboto, sans-serif', fontSize: 13.5, lineHeight: 1.6,
                        color: '#0F172A', background: '#F8FAFC',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = 'white' }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC' }}
                    />
                  </div>
                  {/* ¿Para qué sirve? */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>¿Para qué sirve este paso?</label>
                    {DescriptionField}
                  </div>
                </div>
              )}
              {step === 2 && (
                <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>¿Quién resuelve en este paso?</span>
                    <span style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>Elegí si conversa la IA sola, la IA con revisión humana, o un agente humano.</span>
                  </div>
                  {AssignCards}
                </div>
              )}
              {step === 3 && (
                <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>¿Qué datos deben completarse? <span style={{ fontSize: 12, fontWeight: 500, color: '#CBD5E1' }}>· Opcional</span></span>
                    <span style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>Definí qué información debe quedar guardada cuando el usuario pasa por acá. El agente se encarga de obtenerla.</span>
                  </div>
                  <RequiredDataSection fields={requiredData} onChange={setRequiredData} hideHeader />
                </div>
              )}
              {step === 4 && (
                <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Instrucciones para el agente <span style={{ fontSize: 12, fontWeight: 500, color: '#CBD5E1' }}>· Opcional</span></span>
                  </div>
                  {renderAdvanced()}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderTop: '1px solid #E2E8F0', background: '#FAFBFD', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, flexShrink: 0 }}>
            {step === 1 ? (
              <button onClick={() => { onDelete(node.id); onClose() }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: '#FFFFFF', border: '1px solid #FECACA', color: '#DC2626', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}><Trash2 size={14} /> Eliminar</button>
            ) : (
              <div />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)} style={{ padding: '8px 20px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.color = PRIMARY; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
                >Anterior</button>
              )}
              {step < TOTAL_STEPS ? (
                <button onClick={() => setStep(s => s + 1)} style={{ padding: '8px 20px', borderRadius: 8, background: PRIMARY, border: 'none', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>Siguiente</button>
              ) : (
                <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, background: PRIMARY, border: 'none', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>Listo ✓</button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ══════ MODE B: Full + contextual help ════════════════════ */}
      {drawerMode === 'full' && (
        <>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            {/* Left: all sections */}
            <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>

              {/* Descripción */}
              <div style={secStyle('desc')} onClick={() => setFocusedSection('desc')}>
                {SectionHeader('desc', 1, '¿Para qué sirve este paso?')}
                {DescriptionField}
              </div>

              {/* Asignación */}
              <div style={secStyle('assign')} onClick={() => setFocusedSection('assign')}>
                {SectionHeader('assign', 2, '¿Quién conversa con el usuario?')}
                {AssignCards}
              </div>

              {/* Datos */}
              <div style={secStyle('data')} onClick={() => setFocusedSection('data')}>
                {SectionHeader('data', 3, 'Datos a completar', 'Opcional')}
                <RequiredDataSection fields={requiredData} onChange={setRequiredData} hideHeader />
              </div>

              {/* Instrucciones y herramientas */}
              <div style={{ ...secStyle('advanced'), borderBottom: 'none' }} onClick={() => setFocusedSection('advanced')}>
                {SectionHeader('advanced', 4, 'Instrucciones para el agente')}
                {renderAdvanced()}
              </div>
            </div>

            {/* Right: contextual help (cross-fade) */}
            <div style={{ width: 224, flexShrink: 0, background: '#F8FAFC', borderLeft: '1px solid #E2E8F0', overflow: 'auto', padding: '20px 16px' }}>
              <div key={focusedSection} style={{ animation: 'wfHelpIn 0.24s ease-out both' }}>
                {HELP[focusedSection]}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderTop: '1px solid #E2E8F0', background: '#FAFBFD', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, flexShrink: 0 }}>
            <button onClick={() => { onDelete(node.id); onClose() }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, background: '#FFFFFF', border: '1px solid #FECACA', color: '#DC2626', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}><Trash2 size={14} /> Eliminar</button>
            <button onClick={onClose} style={{ padding: '7px 20px', borderRadius: 100, background: PRIMARY, border: 'none', color: 'white', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Listo ✓</button>
          </div>
        </>
      )}

      {/* ══════ MODE D: creación guiada / edición completa ═════ */}
      {drawerMode === 'mix' && (() => {
        // Paso 1: Identificar (nombre + descripción) — OBLIGATORIO
        // Pasos 2+: assign, data?, advanced?
        // Humano: solo assign (sin datos ni instrucciones)
        const isHumanMode = convMode === 'human'
        const hasAdvanced = !isHumanMode
        const sectionKeys = isHumanMode
          ? ['identify', 'assign']
          : ['identify', 'assign', 'data', 'advanced']
        const totalSteps = sectionKeys.length
        const descMissing = !description.trim()
        const nameMissing = !name.trim()
        // advance: avanza activo + actualiza máximo alcanzado
        const advance = () => {
          if (activeStep >= totalSteps) { onClose(); return }
          const next = activeStep + 1
          setActiveStep(next)
          setMaxStep(s => Math.max(s, next))
        }

        return (
        <>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', position: 'relative' }}>
            <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>

              {/* Secciones — en creación: activa expandida, resto colapsadas (visible pero compactas). En edición: todas expandidas */}
              {(() => {
                // Activo = el paso expandido actualmente
                const isActive = (idx: number) => !isCreating || activeStep === idx + 1
                // Done = ya se llegó a ese paso (o más adelante) — mantiene ✓ aunque se vuelva atrás
                const isDone = (idx: number) => isCreating && maxStep > idx + 1

                // Inline Next button — aparece al final de la sección activa
                const InlineNext = ({ secKey, secIdx }: { secKey: string; secIdx: number }) => {
                  if (!isCreating || !isActive(secIdx)) return null
                  const isSecLast = secIdx + 1 >= totalSteps
                  const isSecOptional = secKey === 'data' || secKey === 'advanced'
                  // El último paso bloquea el Listo si faltan campos obligatorios
                  const isBlocked = isSecLast && (nameMissing || descMissing)
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14 }}>
                      <div />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isSecOptional && (
                          <button onClick={e => { e.stopPropagation(); advance() }} style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: 'none', color: '#64748B', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Omitir</button>
                        )}
                        {/* Atrás — visible en pasos 2+ */}
                        {secIdx > 0 && (
                          <button onClick={e => { e.stopPropagation(); setActiveStep(s => s - 1) }} style={{ padding: '8px 20px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.color = PRIMARY; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
                          >Atrás</button>
                        )}
                        {/* Siguiente/Listo */}
                        <button
                          onClick={e => { e.stopPropagation(); if (!isBlocked) advance() }}
                          disabled={isBlocked}
                          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: isBlocked ? 'default' : 'pointer', background: isBlocked ? '#E2E8F0' : PRIMARY, color: isBlocked ? '#94A3B8' : 'white', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, transition: 'background 0.15s' }}
                        >{isSecLast ? 'Listo ✓' : 'Siguiente'}</button>
                      </div>
                    </div>
                  )
                }

                // Collapsed section header — solo visible en modo creación para pasos no activos
                // Resumen compacto del contenido de cada paso (para el estado colapsado)
                const summaryFor = (key: string): string | null => {
                  if (key === 'identify') return name.trim() || null
                  if (key === 'desc')     return description.trim() || null
                  if (key === 'assign') {
                    if (convMode === 'ia')    return assignee ? `Agente IA · revisa ${assignee}` : 'Agente IA'
                    if (convMode === 'hitl')  return assignee ? `IA + Humano · revisa ${assignee}` : 'IA + Humano'
                    return assignee ? `Agente humano · ${assignee}` : 'Agente humano'
                  }
                  if (key === 'data') {
                    if (requiredData.length === 0) return null
                    const names = requiredData.map(f => f.name).filter(Boolean)
                    return names.length > 0 ? names.slice(0, 3).join(', ') + (names.length > 3 ? ` +${names.length - 3}` : '') : null
                  }
                  if (key === 'advanced') return prompt.trim() ? prompt.trim().slice(0, 60) + (prompt.trim().length > 60 ? '…' : '') : null
                  return null
                }

                const CollapsedSection = ({ num, label, secIdx, secKey, tag }: { num: number; label: string; secIdx: number; secKey: string; tag?: string }) => {
                  if (!isCreating) return null
                  const done = isDone(secIdx)
                  const future = !isActive(secIdx) && !done
                  const summary = done ? summaryFor(secKey) : null
                  return (
                    <div onClick={done ? () => setActiveStep(secIdx + 1) : undefined} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 9,
                      padding: '13px 24px', borderBottom: '1px solid #F1F5F9',
                      opacity: future ? 0.45 : 1,
                      cursor: done ? 'pointer' : 'default',
                      transition: 'background 0.12s',
                    }}
                      onMouseEnter={e => { if (done) e.currentTarget.style.background = '#F8FAFC' }}
                      onMouseLeave={e => { if (done) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        background: done ? '#DCFCE7' : '#E2E8F0',
                        color: done ? '#16A34A' : '#94A3B8',
                        transition: 'background 0.2s',
                      }}>
                        {done ? <Check size={12} strokeWidth={3} color="#16A34A" /> : num}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: done ? '#475569' : '#94A3B8' }}>{label}</span>
                          {tag && !summary && <span style={{ fontSize: 11.5, fontWeight: 500, color: '#CBD5E1' }}>· {tag}</span>}
                          {done && <Pencil size={12} color="#CBD5E1" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                        </div>
                        {summary && (
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</div>
                        )}
                      </div>
                    </div>
                  )
                }

                const sections = [
                  { key: 'identify', idx: 0, label: 'Identificar el paso',                 tag: undefined,   always: true },
                  { key: 'assign',   idx: 1, label: '¿Quién resuelve en este paso?',        tag: undefined,   always: true },
                  { key: 'data',     idx: 2, label: '¿Qué datos se guardan en este paso?', tag: 'Opcional',  always: !isHumanMode },
                  { key: 'advanced', idx: 3, label: 'Instrucciones para el agente',          tag: 'Opcional',  always: hasAdvanced },
                ]

                return (
                  <>
                    {sections.map(sec => {
                      if (!sec.always) return null
                      const active = isActive(sec.idx)
                      const done   = isDone(sec.idx)

                      // Collapsed: show only the header row
                      if (isCreating && !active) {
                        return <CollapsedSection key={sec.key} num={sec.idx + 1} label={sec.label} secIdx={sec.idx} secKey={sec.key} tag={sec.tag} />
                      }

                      // Expanded: full section
                      return (
                        <div key={sec.key} style={{ ...secStyle(sec.key as any), animation: (isCreating && active && sec.idx > 0) ? 'wfFadeUp 0.22s ease-out' : undefined }} onClick={() => setFocusedSection(sec.key as any)}>
                          {SectionHeader(sec.key as any, sec.idx + 1, sec.label, sec.tag, true)}
                          {sec.key === 'identify' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 0 14px' }}>
                              {/* Nombre + Color picker */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B', marginBottom: 2 }}>Nombre del paso</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  {/* Color picker — a la izquierda */}
                                  <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <button onClick={() => setColorOpen(o => !o)} title="Color del paso" style={{ width: 18, height: 18, borderRadius: '50%', background: color, border: '2px solid rgba(0,0,0,0.08)', cursor: 'pointer', padding: 0, display: 'block', transition: 'transform 0.15s' }}
                                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)' }}
                                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                                    />
                                    {colorOpen && (
                                      <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 50, padding: 10, background: '#FFFFFF', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 12px 28px -8px rgba(15,23,42,0.18)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, minWidth: 180 }}>
                                        {COLORS.map(c => (
                                          <button key={c} onClick={() => { setColor(c); setColorOpen(false) }} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', padding: 0, outline: color === c ? `2px solid ${PRIMARY}` : 'none', outlineOffset: 2 }} />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {/* Input */}
                                  <input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ej: Calificar leads"
                                    autoFocus
                                    style={{
                                      flex: 1, boxSizing: 'border-box',
                                      padding: '12px 14px', borderRadius: 10,
                                      border: '1.5px solid #E2E8F0', outline: 'none',
                                      fontFamily: 'Roboto, sans-serif', fontSize: 13.5, lineHeight: 1.6,
                                      color: '#0F172A', background: '#F8FAFC',
                                      transition: 'border-color 0.15s, background 0.15s',
                                    }}
                                    onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = 'white' }}
                                    onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC' }}
                                  />
                                </div>
                              </div>
                              {/* ¿Para qué sirve? */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>¿Para qué sirve este paso?</label>
                                {DescriptionField}
                              </div>
                            </div>
                          )}
                          {sec.key === 'desc'     && DescriptionField}
                          {sec.key === 'assign'   && AssignCards}
                          {sec.key === 'data'     && <RequiredDataSection fields={requiredData} onChange={setRequiredData} hideHeader />}
                          {sec.key === 'advanced' && renderAdvanced(true)}
                          <InlineNext secKey={sec.key} secIdx={sec.idx} />
                        </div>
                      )
                    })}
                  </>
                )
              })()}
            </div>

            {/* Right: panel de ayuda */}
            {helpOpen && (
              <div style={{ width: 240, flexShrink: 0, background: '#F8FAFC', borderLeft: '1px solid #E2E8F0', overflow: 'auto', padding: '16px', animation: 'wfFadeUp 0.2s ease-out' }}>
                <div key={focusedSection} style={{ animation: 'wfHelpIn 0.24s ease-out both' }}>
                  {HELP[focusedSection]}
                </div>
              </div>
            )}
          </div>

          {/* Footer — solo en edición; en creación el Siguiente/Listo vive dentro de cada sección */}
          {!isCreating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderTop: '1px solid #E2E8F0', background: '#FAFBFD', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, flexShrink: 0 }}>
              <button onClick={() => { onDelete(node.id); onClose() }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, background: '#FFFFFF', border: '1px solid #FECACA', color: '#DC2626', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}><Trash2 size={14} /> Eliminar</button>
              <button onClick={() => { if (!nameMissing && !descMissing) onClose() }} disabled={nameMissing || descMissing} title={nameMissing || descMissing ? 'Completá el nombre y descripción del estado para continuar' : ''} style={{ padding: '8px 24px', borderRadius: 100, border: 'none', background: (nameMissing || descMissing) ? '#E2E8F0' : PRIMARY, color: (nameMissing || descMissing) ? '#94A3B8' : 'white', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: (nameMissing || descMissing) ? 'default' : 'pointer' }}>Listo ✓</button>
            </div>
          )}
        </>
        )
      })()}

    </aside>
  )
}

// ─── State Resources Panel ────────────────────────────────────────────────────

const RESOURCE_CATALOG: { section: string; items: StateResource[] }[] = [
  {
    section: 'MCP',
    items: [
      { id: 'mcp-sf',      type: 'mcp', name: 'Salesforce CRM',      color: '#00A1E0' },
      { id: 'mcp-slack',   type: 'mcp', name: 'Slack',               color: '#611F69' },
      { id: 'mcp-sheets',  type: 'mcp', name: 'Google Sheets',       color: '#34A853' },
      { id: 'mcp-hubspot', type: 'mcp', name: 'HubSpot',             color: '#FF5C35' },
      { id: 'mcp-jira',    type: 'mcp', name: 'Jira',                color: '#0052CC' },
      { id: 'mcp-snow',    type: 'mcp', name: 'ServiceNow',          color: '#81B5A1' },
    ],
  },
  {
    section: 'MCP Código',
    items: [
      { id: 'code-calc',   type: 'code', name: 'Price calculator',    color: '#F59E0B' },
      { id: 'code-notify', type: 'code', name: 'Notification sender', color: '#8B5CF6' },
      { id: 'code-score',  type: 'code', name: 'Lead scorer',         color: '#3B82F6' },
      { id: 'code-valid',  type: 'code', name: 'Data validator',      color: '#10B981' },
    ],
  },
]

function StateResourcesPanel({
  stateName: _stateName, resources, onChange, hasFlow, onOpenFlow,
}: {
  stateName: string
  resources: StateResource[]
  onChange: (r: StateResource[]) => void
  hasFlow: boolean
  onOpenFlow: () => void
}) {
  const toggle = (item: StateResource) => {
    const exists = resources.some(r => r.id === item.id)
    onChange(exists ? resources.filter(r => r.id !== item.id) : [...resources, item])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Flow section ── */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Flujo del paso</div>
        <button
          onClick={onOpenFlow}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: '12px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
            background: hasFlow ? '#EFF0FF' : 'white',
            border: `1px solid ${hasFlow ? '#C7D2FE' : '#E2E8F0'}`,
            transition: 'all 140ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EFF0FF'; e.currentTarget.style.borderColor = '#C7D2FE' }}
          onMouseLeave={e => { e.currentTarget.style.background = hasFlow ? '#EFF0FF' : 'white'; e.currentTarget.style.borderColor = hasFlow ? '#C7D2FE' : '#E2E8F0' }}
        >
          <span style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: hasFlow ? PRIMARY : '#F1F5F9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GitBranch size={15} strokeWidth={2} color={hasFlow ? 'white' : '#94A3B8'} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>
              {hasFlow ? 'Ver flujo' : '+ Agregar flujo'}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748B' }}>
              {hasFlow ? 'Ver y editar los pasos del estado' : 'Definir pasos, condicionales y acciones'}
            </div>
          </div>
          <span style={{ fontSize: 13, color: hasFlow ? PRIMARY : '#CBD5E1', fontWeight: 700, flexShrink: 0 }}>→</span>
        </button>
      </div>

      {/* ── MCP + Código sections ── */}
      {RESOURCE_CATALOG.map((cat, ci) => (
        <div key={cat.section} style={{ marginBottom: ci < RESOURCE_CATALOG.length - 1 ? 0 : 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{cat.section}</div>
          <div style={{ borderRadius: 10, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {cat.items.map((item, idx) => {
              const active = resources.some(r => r.id === item.id)
              const isLast = idx === cat.items.length - 1
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
                    background: active ? '#EFF0FF' : 'white',
                    border: 'none',
                    borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = active ? '#E0E7FF' : '#F8FAFC' }}
                  onMouseLeave={e => { e.currentTarget.style.background = active ? '#EFF0FF' : 'white' }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: active ? '#E0E7FF' : '#F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 120ms',
                  }}>
                    {item.type === 'code'
                      ? <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 800, color: active ? PRIMARY : '#94A3B8', lineHeight: 1 }}>{'{}'}</span>
                      : <Cpu size={13} strokeWidth={2} color={active ? PRIMARY : '#94A3B8'} />
                    }
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: active ? '#0F172A' : '#475569', flex: 1 }}>{item.name}</span>
                  {active ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px', borderRadius: 100,
                      background: '#EFF0FF', color: PRIMARY,
                      fontSize: 11, fontWeight: 700,
                    }}>
                      <span style={{ fontSize: 9 }}>✓</span> Activo
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#CBD5E1' }}>Agregar</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

    </div>
  )
}

// ─── Required Data ──────────────────────────────────────────────────────────────

const VARIABLE_GROUPS = {
  ticket: {
    label: 'Datos del ticket',
    vars: ['pedido', 'monto', 'producto', 'descuento', 'fecha', 'canal', 'prioridad', 'estado', 'motivo', 'descripcion', 'comentario'],
  },
  usuario: {
    label: 'Datos del usuario',
    vars: ['nombre', 'apellido', 'email', 'telefono', 'pais', 'ciudad', 'empresa', 'cargo', 'edad', 'documento', 'direccion'],
  },
} as const

type VarGroup = keyof typeof VARIABLE_GROUPS

function VariablePicker({
  query, setQuery, existing, onSelect,
}: {
  query: string
  setQuery: (q: string) => void
  existing: string[]
  onSelect: (v: string) => void
}) {
  const [group, setGroup] = useState<VarGroup>('ticket')

  const pool = VARIABLE_GROUPS[group].vars
  const filtered = pool.filter(
    v => !existing.includes(v) && v.toLowerCase().includes(query.toLowerCase())
  )
  const exactMatch = filtered.some(v => v === query.toLowerCase().trim())
  const showCreate = query.trim().length > 0 && !exactMatch && filtered.length === 0

  return (
    <div
      style={{
        position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
        width: 248, background: '#FFFFFF', borderRadius: 10,
        border: '1px solid #E2E8F0',
        boxShadow: '0 12px 28px -8px rgba(15,23,42,0.18)',
        overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Category tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #F1F5F9' }}>
        {(Object.keys(VARIABLE_GROUPS) as VarGroup[]).map(g => (
          <button
            key={g}
            onClick={() => { setGroup(g); setQuery('') }}
            style={{
              flex: 1, padding: '9px 6px', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              background: 'transparent',
              color: group === g ? PRIMARY : '#94A3B8',
              borderBottom: group === g ? `2px solid ${PRIMARY}` : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.12s',
            }}
          >
            {VARIABLE_GROUPS[g].label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9' }}>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar variable..."
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '6px 10px', borderRadius: 7,
            border: '1.5px solid #E2E8F0', outline: 'none',
            fontFamily: 'inherit', fontSize: 12.5, color: '#0F172A',
            background: '#F8FAFC',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = 'white' }}
          onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC' }}
        />
      </div>

      {/* Results */}
      {filtered.length > 0 && (
        <div style={{ maxHeight: 192, overflowY: 'auto', padding: '4px' }}>
          {filtered.map(v => (
            <button
              key={v}
              onClick={() => onSelect(v)}
              style={{
                display: 'block', width: '100%', padding: '7px 10px', borderRadius: 6,
                border: 'none', background: 'transparent',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                fontSize: 13, color: '#0F172A', fontWeight: 500,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {v}
            </button>
          ))}
        </div>
      )}
      {showCreate && (
        <div style={{ padding: '14px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>
            No encontramos <strong style={{ color: '#64748B' }}>"{query}"</strong>
          </div>
          <button
            onClick={() => onSelect(query.trim().toLowerCase().replace(/\s+/g, '_'))}
            style={{
              padding: '7px 14px', borderRadius: 8,
              background: 'rgba(48,79,254,0.08)', border: '1.5px solid rgba(48,79,254,0.20)',
              color: PRIMARY, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Crear "{query.trim()}"
          </button>
        </div>
      )}
      {filtered.length === 0 && !showCreate && (
        <div style={{ padding: '14px 12px', textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>
          {query ? 'Sin resultados' : 'Escribe para buscar'}
        </div>
      )}
    </div>
  )
}

function FlowItemCard({
  flow, onOpen, onRemove,
}: {
  flow: FlowItem
  onOpen: () => void
  onRemove: () => void
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 10,
      background: '#EFF0FF', border: '1px solid #C7D2FE',
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <GitBranch size={13} strokeWidth={2} color="white" />
      </span>
      <span
        style={{
          flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: '#0F172A',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: 'Roboto, sans-serif',
        }}
      >
        {flow.name}
      </span>
      {confirming ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11.5, color: '#64748B', fontFamily: 'Roboto, sans-serif' }}>¿Eliminar?</span>
          <button
            onClick={onRemove}
            style={{ padding: '2px 8px', borderRadius: 5, border: 'none', cursor: 'pointer', background: '#FEE2E2', color: '#DC2626', fontSize: 11.5, fontWeight: 700 }}
          >Sí</button>
          <button
            onClick={() => setConfirming(false)}
            style={{ padding: '2px 8px', borderRadius: 5, border: 'none', cursor: 'pointer', background: '#F1F5F9', color: '#64748B', fontSize: 11.5, fontWeight: 700 }}
          >No</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            onClick={onOpen}
            style={{
              padding: '3px 10px', borderRadius: 6, border: `1px solid ${PRIMARY}`, cursor: 'pointer',
              background: 'white', color: PRIMARY, fontSize: 11.5, fontWeight: 700,
              fontFamily: 'Roboto, sans-serif',
            }}
          >Ver →</button>
          <button
            onClick={() => setConfirming(true)}
            title="Eliminar flujo"
            style={{
              width: 26, height: 26, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
          ><Trash2 size={13} /></button>
        </div>
      )}
    </div>
  )
}

function RequiredDataSection({
  fields, onChange, hideHeader,
}: {
  fields: RequiredField[]
  onChange: (fields: RequiredField[]) => void
  hideHeader?: boolean
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [query, setQuery] = useState('')

  const update = (id: string, patch: Partial<RequiredField>) =>
    onChange(fields.map(f => f.id === id ? { ...f, ...patch } : f))
  const remove = (id: string) => onChange(fields.filter(f => f.id !== id))

  const handleSelect = (varName: string) => {
    onChange([...fields, { id: `f_${Date.now()}`, name: varName, description: '' }])
    setPickerOpen(false)
    setQuery('')
  }

  return (
    <div>
      {!hideHeader && <>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Datos del estado</div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 12 }}>Datos que el agente debe recolectar en este estado</div>
      </>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fields.map(field => (
          <RequiredDataCard key={field.id} field={field} onUpdate={update} onRemove={remove} />
        ))}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setPickerOpen(o => !o); setQuery('') }}
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 10,
              background: 'transparent', border: '1.5px dashed #CBD5E1',
              color: PRIMARY, fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', textAlign: 'left', transition: 'border-color 120ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = PRIMARY)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
          >
            + Agregar dato
          </button>
          {pickerOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => { setPickerOpen(false); setQuery('') }} />
              <VariablePicker query={query} setQuery={setQuery} existing={fields.map(f => f.name)} onSelect={handleSelect} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const TOKEN_VIOLET = '#7C3AED'
const TOKEN_BG = 'rgba(124,58,237,0.10)'

function tokenize(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let last = 0
  const re = /\$\{[^}]*\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <span key={m.index} style={{ background: TOKEN_BG, color: TOKEN_VIOLET, borderRadius: 3, fontWeight: 700 }}>
        {m[0]}
      </span>
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function RequiredDataCard({
  field, onUpdate, onRemove,
}: {
  field: RequiredField
  onUpdate: (id: string, patch: Partial<RequiredField>) => void
  onRemove: (id: string) => void
}) {
  const [varMenuOpen, setVarMenuOpen] = useState(false)
  const [varQuery, setVarQuery] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const displayName = field.name
    ? field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/_/g, ' ')
    : 'Variable'

  return (
    <div style={{ borderRadius: 10, background: '#FFFFFF', border: '1px solid #E2E8F0', overflow: 'visible' }}>

      {/* Row 1: Variable + Requerido checkbox + trash */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', flexShrink: 0, width: 60 }}>Variable</span>
        {/* Variable picker */}
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => { setVarMenuOpen(o => !o); setVarQuery('') }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 8,
              background: varMenuOpen ? '#F0F4FF' : '#F1F5F9',
              border: `1.5px solid ${varMenuOpen ? 'rgba(48,79,254,0.25)' : '#E2E8F0'}`,
              color: varMenuOpen ? PRIMARY : '#0F172A',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 120ms', maxWidth: '100%',
            }}
            onMouseEnter={e => { if (!varMenuOpen) { e.currentTarget.style.background = '#F0F4FF'; e.currentTarget.style.borderColor = 'rgba(48,79,254,0.25)' } }}
            onMouseLeave={e => { if (!varMenuOpen) { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#E2E8F0' } }}
          >
            {displayName}
            <ChevronDown size={11} />
          </button>
          {varMenuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => { setVarMenuOpen(false); setVarQuery('') }} />
              <VariablePicker query={varQuery} setQuery={setVarQuery} existing={[]} onSelect={v => { onUpdate(field.id, { name: v }); setVarMenuOpen(false); setVarQuery('') }} />
            </>
          )}
        </div>

        {/* Requerido checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}>
          <input
            type="checkbox"
            checked={!field.optional}
            onChange={e => onUpdate(field.id, { optional: !e.target.checked })}
            style={{ width: 14, height: 14, accentColor: PRIMARY, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>Requerido</span>
        </label>

        {/* Trash */}
        {confirmingDelete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 11.5, color: '#EF4444', fontWeight: 600 }}>¿Eliminar?</span>
            <button onClick={() => onRemove(field.id)} style={{ padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#FEE2E2', color: '#EF4444', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>Sí</button>
            <button onClick={() => setConfirmingDelete(false)} style={{ padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: '#F1F5F9', color: '#64748B', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>No</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: 'none', background: 'transparent', color: '#CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 120ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
            onMouseLeave={e => (e.currentTarget.style.color = '#CBD5E1')}
          ><Trash2 size={13} /></button>
        )}
      </div>

      <div style={{ height: 1, background: '#F1F5F9', marginLeft: 12, marginRight: 12 }} />

      {/* Row 2: Cómo lo obtiene */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', flexShrink: 0, width: 108, paddingTop: 2 }}>Cómo lo obtiene</span>
        <input
          value={field.description}
          onChange={e => onUpdate(field.id, { description: e.target.value })}
          placeholder="Ej: pregunta al usuario, lee del CRM…"
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 13, color: '#475569', padding: 0 }}
        />
      </div>
    </div>
  )
}

const menuItem: React.CSSProperties = {
  display: 'block', width: '100%', textAlign: 'left',
  padding: '7px 12px', borderRadius: 6,
  border: 'none', background: 'transparent', cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 13, color: '#0F172A',
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: 8, borderRadius: 8,
  background: '#FFFFFF', border: '1px solid #E2E8F0',
  fontFamily: 'inherit', fontSize: 14, color: '#0F172A',
  outline: 'none',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{label}</div>
      {children}
    </label>
  )
}

function FloatingInput({ label, value, onChange, autoFocus }: {
  label: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0
  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .fl-input { transition: border-color 0.15s; }
        .fl-input:focus { outline: none; border-color: ${PRIMARY} !important; background: white !important; }
      `}</style>
      <input
        className="fl-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          display: 'block', width: '100%', boxSizing: 'border-box',
          padding: floated ? '22px 12px 8px' : '15px 12px',
          borderRadius: 10, border: `1.5px solid ${focused ? PRIMARY : '#E2E8F0'}`,
          background: focused ? 'white' : '#F8FAFC',
          fontFamily: 'inherit', fontSize: 14, color: '#0F172A',
        }}
      />
      <span style={{
        position: 'absolute', left: 13, pointerEvents: 'none',
        top: floated ? 7 : '50%',
        transform: floated ? 'none' : 'translateY(-50%)',
        fontSize: floated ? 10.5 : 14,
        fontWeight: floated ? 700 : 400,
        color: focused ? PRIMARY : floated ? '#94A3B8' : '#94A3B8',
        transition: 'all 0.15s',
        letterSpacing: floated ? 0.4 : 0,
      }}>
        {label}
      </span>
    </div>
  )
}

function FloatingTextarea({ label, value, onChange, rows = 3 }: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0
  return (
    <div style={{ position: 'relative' }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          display: 'block', width: '100%', boxSizing: 'border-box',
          padding: floated ? '22px 12px 10px' : '15px 12px',
          borderRadius: 10, border: `1.5px solid ${focused ? PRIMARY : '#E2E8F0'}`,
          background: focused ? 'white' : '#F8FAFC',
          fontFamily: 'inherit', fontSize: 13.5, color: '#0F172A',
          resize: 'vertical', minHeight: 90, lineHeight: 1.5,
          outline: 'none', transition: 'border-color 0.15s, background 0.15s',
        }}
      />
      <span style={{
        position: 'absolute', left: 13, top: 10, pointerEvents: 'none',
        fontSize: floated ? 10.5 : 13.5,
        fontWeight: floated ? 700 : 400,
        color: focused ? PRIMARY : '#94A3B8',
        transition: 'all 0.15s',
        letterSpacing: floated ? 0.4 : 0,
      }}>
        {label}
      </span>
    </div>
  )
}

// ── Chip kinds config ─────────────────────────────────────────────────────────
const CHIP_KINDS = {
  var:  { bg: 'rgba(124,58,237,0.10)', color: '#7C3AED', tag: '$'     },
  mcp:  { bg: '#EFF0FF',               color: '#304FFE', tag: 'MCP'   },
  know: { bg: '#EFF0FF',               color: '#304FFE', tag: 'BASE'  },
  auto: { bg: '#FEF3C7',               color: '#D97706', tag: 'AUTO'  },
  flow: { bg: '#EFF0FF',               color: '#304FFE', tag: 'FLUJO' },
} as const
type ChipKind = keyof typeof CHIP_KINDS

const KNOWLEDGE_SOURCES = [
  { id: 'k-manual',    name: 'Manual de producto' },
  { id: 'k-faq',       name: 'Preguntas frecuentes' },
  { id: 'k-politicas', name: 'Políticas de la empresa' },
  { id: 'k-precios',   name: 'Catálogo de precios' },
]
const AUTOMATION_ACTIONS = [
  { id: 'auto-email', name: 'Enviar email' },
  { id: 'auto-ticket', name: 'Crear ticket' },
  { id: 'auto-notif',  name: 'Notificar al equipo' },
  { id: 'auto-crm',    name: 'Actualizar CRM' },
  { id: 'auto-call',   name: 'Agendar llamada' },
]
const FLOWS_CATALOG = [
  { id: 'flow-checkout',  name: 'Checkout de pedido' },
  { id: 'flow-cotizacion', name: 'Solicitud de cotización' },
  { id: 'flow-escalado',  name: 'Escalado a humano' },
  { id: 'flow-encuesta',  name: 'Encuesta de satisfacción' },
]

// ── InstructionsTextarea — contenteditable with chip toolbar ──────────────────
function InstructionsTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused]       = useState(false)
  const [activePicker, setActivePicker] = useState<ChipKind | 'vars' | null>(null)
  const [varGroup, setVarGroup]     = useState<VarGroup>('ticket')
  const [mcpFilter, setMcpFilter]   = useState('')

  // Serialize contenteditable → string (chips become [kind:name])
  const serialize = (el: HTMLDivElement): string => {
    let out = ''
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        out += node.textContent ?? ''
      } else if (node instanceof HTMLElement && node.dataset.chip) {
        out += `[${node.dataset.chip}:${node.dataset.chipName}]`
      } else if (node instanceof HTMLElement) {
        out += node.textContent ?? ''
      }
    }
    return out
  }

  // Build DOM from serialized string (only on mount)
  const buildDOM = (el: HTMLDivElement, src: string) => {
    el.innerHTML = ''
    const regex = /\[(\w+):([^\]]+)\]/g
    let last = 0; let m: RegExpExecArray | null
    while ((m = regex.exec(src)) !== null) {
      if (m.index > last) el.appendChild(document.createTextNode(src.slice(last, m.index)))
      const kind = m[1] as ChipKind
      if (CHIP_KINDS[kind]) el.appendChild(makeChipEl(kind, m[2], () => {
        const chip = el.querySelector(`[data-chip="${kind}"][data-chip-name="${m![2]}"]`)
        chip?.remove()
        onChange(serialize(el))
      }))
      else el.appendChild(document.createTextNode(m[0]))
      last = m.index + m[0].length
    }
    if (last < src.length) el.appendChild(document.createTextNode(src.slice(last)))
  }

  // Create a chip DOM element
  const makeChipEl = (kind: ChipKind, name: string, onRemove: () => void): HTMLSpanElement => {
    const cfg = CHIP_KINDS[kind]
    const span = document.createElement('span')
    span.contentEditable = 'false'
    span.dataset.chip = kind
    span.dataset.chipName = name
    span.style.cssText = `display:inline-flex;align-items:center;gap:3px;padding:1px 6px 1px 5px;border-radius:4px;background:${cfg.bg};color:${cfg.color};font-size:12px;font-weight:700;font-family:inherit;vertical-align:middle;cursor:default;margin:0 1px;user-select:none;`
    span.innerHTML = `<span style="font-size:10px;opacity:0.7">${cfg.tag}</span><span>${name}</span><span data-del style="margin-left:3px;opacity:0.55;font-size:10px;cursor:pointer">✕</span>`
    const del = span.querySelector('[data-del]') as HTMLSpanElement
    del.addEventListener('mousedown', e => { e.preventDefault(); span.remove(); onRemove() })
    return span
  }

  // Insert chip at current cursor position
  const insertChip = (kind: ChipKind, name: string) => {
    const el = editorRef.current
    if (!el) return
    el.focus()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) {
      el.appendChild(makeChipEl(kind, name, () => onChange(serialize(el))))
    } else {
      const range = sel.getRangeAt(0)
      range.deleteContents()
      const chip = makeChipEl(kind, name, () => { el.focus(); onChange(serialize(el)) })
      range.insertNode(chip)
      range.setStartAfter(chip)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    }
    el.appendChild(document.createTextNode('​'))
    onChange(serialize(el))
    setActivePicker(null)
  }

  // Init DOM from value on mount
  useEffect(() => {
    const el = editorRef.current
    if (el) buildDOM(el, value)
  }, []) // eslint-disable-line

  const closePicker = () => setActivePicker(null)

  const allMcps = RESOURCE_CATALOG.flatMap(s => s.items)
  const filteredMcps = mcpFilter ? allMcps.filter(m => m.name.toLowerCase().includes(mcpFilter.toLowerCase())) : allMcps
  const filteredVars = VARIABLE_GROUPS[varGroup].vars.filter(v => !mcpFilter || v.includes(mcpFilter.toLowerCase()))

  const TOOLBAR_ITEMS: { key: ChipKind | 'vars'; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'vars', label: 'Variables',       icon: <Braces size={13} strokeWidth={2} />,   color: TOKEN_VIOLET },
    { key: 'mcp',  label: 'Integración MCP', icon: <Cpu size={13} strokeWidth={2} />,       color: PRIMARY },
    { key: 'know', label: 'Bases',           icon: <BookOpen size={13} strokeWidth={2} />,  color: PRIMARY },
    { key: 'flow', label: 'Flujos',          icon: <GitBranch size={13} strokeWidth={2} />, color: PRIMARY },
  ]

  const showPlaceholder = !value || value === '​' || value.replace(/\[.*?\]/g, '').trim() === ''

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        borderRadius: 10, border: `1.5px solid ${focused ? PRIMARY : '#E2E8F0'}`,
        background: focused ? 'white' : '#F8FAFC',
        transition: 'border-color 0.15s, background 0.15s',
        overflow: 'visible',
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          padding: '5px 8px', borderBottom: `1px solid ${focused ? '#D0D9FF' : '#E2E8F0'}`,
          background: focused ? 'white' : '#F8FAFC',
          borderRadius: '9px 9px 0 0',
          transition: 'background 0.15s',
        }}>
          <span style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 500, paddingRight: 8, whiteSpace: 'nowrap' }}>Insertá →</span>
          {TOOLBAR_ITEMS.map((item, i) => {
            const isActive = activePicker === item.key
            return (
              <button
                key={item.key}
                onMouseDown={e => {
                  e.preventDefault()
                  setMcpFilter('')
                  setActivePicker(isActive ? null : item.key)
                  if (item.key === 'vars') setVarGroup('ticket')
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700,
                  background: isActive ? `${item.color}15` : 'transparent',
                  color: isActive ? item.color : '#94A3B8',
                  transition: 'all 0.1s',
                  marginRight: i === TOOLBAR_ITEMS.length - 1 ? 0 : 0,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = item.color; e.currentTarget.style.background = `${item.color}10` } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' } }}
              >
                {item.icon} {item.label}
              </button>
            )
          })}
          {/* Divider + list bullet */}
          <div style={{ width: 1, height: 16, background: '#E2E8F0', margin: '0 4px' }} />
          <button
            onMouseDown={e => {
              e.preventDefault()
              const el = editorRef.current
              if (!el) return
              el.focus()
              const sel = window.getSelection()
              if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0)
                range.insertNode(document.createTextNode('• '))
                range.collapse(false)
              } else {
                el.appendChild(document.createTextNode('• '))
              }
              onChange(serialize(el))
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700,
              background: 'transparent', color: '#94A3B8', transition: 'all 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.background = '#F1F5F9' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}
          >
            <List size={13} strokeWidth={2} /> Lista
          </button>
        </div>

        {/* Editor area */}
        <div style={{ position: 'relative' }}>
          {showPlaceholder && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              padding: '11px 14px', pointerEvents: 'none', zIndex: 1,
              fontSize: 13.5, color: '#94A3B8', lineHeight: 1.6,
            }}>
              Ej: Saludá al usuario por su nombre si lo tenés. Preguntá por el tipo de consulta antes de ofrecer soluciones. Usá un tono cercano y no des precios todavía…
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setTimeout(closePicker, 150) }}
            onInput={() => {
              const el = editorRef.current
              if (el) onChange(serialize(el))
            }}
            style={{
              minHeight: 120, padding: '11px 14px',
              fontFamily: 'Roboto, sans-serif', fontSize: 13.5, lineHeight: 1.6,
              color: '#0F172A', outline: 'none',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              position: 'relative', zIndex: 2,
            }}
          />
        </div>
      </div>

      {/* Picker dropdown — en flujo (no se recorta dentro de columnas con scroll) */}
      {activePicker && (
        <div style={{
          marginTop: 4,
          background: '#FFFFFF', borderRadius: 10,
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 28px -8px rgba(15,23,42,0.22)',
          overflow: 'hidden', fontFamily: 'inherit',
          animation: 'wfFadeUp 0.18s ease-out',
        }}>
          {activePicker === 'vars' && (
            <>
              <div style={{ display: 'flex', borderBottom: '1px solid #F1F5F9', padding: '6px 8px 0' }}>
                {(Object.keys(VARIABLE_GROUPS) as VarGroup[]).map(g => (
                  <button key={g} onMouseDown={e => { e.preventDefault(); setVarGroup(g); setMcpFilter('') }} style={{
                    padding: '4px 10px', border: 'none', cursor: 'pointer', background: 'none',
                    fontSize: 11.5, fontWeight: 700, fontFamily: 'inherit',
                    color: varGroup === g ? TOKEN_VIOLET : '#94A3B8',
                    borderBottom: `2px solid ${varGroup === g ? TOKEN_VIOLET : 'transparent'}`,
                    marginBottom: -1, transition: 'color 0.1s',
                  }}>{VARIABLE_GROUPS[g].label}</button>
                ))}
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {filteredVars.map(v => (
                  <button key={v} onMouseDown={e => { e.preventDefault(); insertChip('var', v) }} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', textAlign: 'left', padding: '7px 12px',
                    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ padding: '2px 6px', borderRadius: 4, background: TOKEN_BG, color: TOKEN_VIOLET, fontSize: 10.5, fontWeight: 700, fontFamily: 'monospace', flexShrink: 0 }}>{v}</span>
                    <span style={{ color: '#475569' }}>{v}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {activePicker === 'mcp' && (
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {filteredMcps.map(item => (
                <button key={item.id} onMouseDown={e => { e.preventDefault(); insertChip('mcp', item.name) }} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', textAlign: 'left', padding: '8px 12px',
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: '#EFF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={13} color={PRIMARY} />
                  </span>
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <span style={{ fontSize: 10.5, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>{item.type}</span>
                </button>
              ))}
            </div>
          )}
          {activePicker === 'know' && (
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {KNOWLEDGE_SOURCES.map(item => (
                <button key={item.id} onMouseDown={e => { e.preventDefault(); insertChip('know', item.name) }} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', textAlign: 'left', padding: '8px 12px',
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={13} color="#16A34A" />
                  </span>
                  {item.name}
                </button>
              ))}
            </div>
          )}
          {activePicker === 'auto' && (
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {AUTOMATION_ACTIONS.map(item => (
                <button key={item.id} onMouseDown={e => { e.preventDefault(); insertChip('auto', item.name) }} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', textAlign: 'left', padding: '8px 12px',
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={13} color="#D97706" />
                  </span>
                  {item.name}
                </button>
              ))}
            </div>
          )}
          {activePicker === 'flow' && (
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {FLOWS_CATALOG.map(item => (
                <button key={item.id} onMouseDown={e => { e.preventDefault(); insertChip('flow', item.name) }} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', textAlign: 'left', padding: '8px 12px',
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GitBranch size={13} color="#0284C7" />
                  </span>
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 38, height: 22, borderRadius: 100,
        background: on ? PRIMARY : '#CBD5E1',
        border: 'none', cursor: 'pointer', padding: 0, position: 'relative',
        transition: 'background 160ms ease-out',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 18, height: 18, borderRadius: '50%', background: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
        transition: 'left 160ms ease-out',
      }} />
    </button>
  )
}

// ─── Main Canvas component ─────────────────────────────────────────────────────

function WorkflowCanvasInner({
  variant, onOpenKanban, onChangeVariant, onToggleSidebar, agentName, connectedToOrchestrator, orchestratorName, seedNodes, seedEdges, onReconfigure,
}: {
  variant: 'classic' | 'unified'
  onOpenKanban?: () => void
  onChangeVariant: () => void
  onToggleSidebar?: () => void
  agentName?: string
  connectedToOrchestrator?: boolean
  orchestratorName?: string
  seedNodes?: AnyNode[]
  seedEdges?: Edge[]
  onReconfigure?: () => void
}) {
  const _demoParam = new URLSearchParams(window.location.search).get('demo')
  const [editingId, setEditingId] = useState<string | null>(_demoParam === 'drawer' ? 's_todo' : null)
  const [creatingId, setCreatingId] = useState<string | null>(null)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('mix')
  const [advancedId, setAdvancedId] = useState<string | null>(_demoParam === 'flow' ? 's_doing' : null)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [workflowSettingsOpen, setWorkflowSettingsOpen] = useState(false)
  const [datosOpen, setDatosOpen] = useState(false)
  const [orchBannerDismissed, setOrchBannerDismissed] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState<AnyNode>((seedNodes ?? INITIAL_NODES) as any)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(seedEdges ?? INITIAL_EDGES)
  const { setCenter } = useReactFlow()

  // Auto-pan: when a state is selected (or the panel width changes), bring the node into view to the right of the left panel
  useEffect(() => {
    if (!editingId) return
    const node = nodes.find(n => n.id === editingId)
    if (!node || !node.position) return
    // Offset by the actual panel width so the node never hides under the panel
    const panelWidth = DRAWER_WIDTH[drawerMode] + 16
    const nodeCenterX = node.position.x + 150
    const nodeCenterY = node.position.y + 50
    setCenter(nodeCenterX - panelWidth / 2, nodeCenterY, { zoom: 1, duration: 450 })
  }, [editingId, drawerMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const applyTemplate = (tpl: Template) => {
    const { nodes: tNodes, edges: tEdges } = tpl.build()
    setNodes(tNodes)
    setEdges(tEdges)
    setTemplatesOpen(false)
  }

  // Compute reachability from start to mark disconnected state nodes
  const reachable = useMemo(() => {
    const set = new Set<string>(['start'])
    let changed = true
    while (changed) {
      changed = false
      for (const e of edges) {
        if (set.has(e.source) && !set.has(e.target)) { set.add(e.target); changed = true }
      }
    }
    return set
  }, [edges])

  // Inject handlers + disconnected flag into node data
  // All states open the drawer first — "Agregar/Editar flujo" inside the drawer opens the advanced editor
  const decoratedNodes = useMemo(() => nodes.map(n => {
    if (n.type === 'stateNode') {
      const isDisconnected = !reachable.has(n.id)
      return {
        ...n,
        data: { ...n.data, isDisconnected, isEditing: n.id === editingId, onEdit: setEditingId, onAddNext: handleAddNext, onOpenAdvanced: setAdvancedId },
      }
    }
    return n
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [nodes, reachable, editingId])

  const nodeTypes = useMemo(() => ({
    startNode: StartNode,
    stateNode: StateNode,
  }), [])

  const edgeTypes = useMemo(() => ({
    conditionEdge: ConditionEdge,
  }), [])

  const onConnect = useCallback((params: Connection) =>
    setEdges(eds => addEdge({ ...params, ...edgeDefaults }, eds)), [setEdges])

  function onConnectEnd(_event: MouseEvent | TouchEvent, cs: { isValid: boolean | null; fromNode: { id: string } | null }) {
    if (!cs?.fromNode || cs.isValid === true) return
    handleAddNext(cs.fromNode.id)
  }

  function handleAddNext(fromId: string) {
    const src = nodes.find(n => n.id === fromId)
    if (!src) return
    const newId = `s_${Date.now()}`
    const newNode: AnyNode = {
      id: newId, type: 'stateNode',
      position: { x: (src.position.x ?? 0) + 400, y: (src.position.y ?? 0) },
      data: { name: 'New step', description: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], requiresHuman: false, requiredData: [], kind: 'simple', onEdit: () => {}, onAddNext: () => {} } as any,
    }
    setNodes(ns => [...ns, newNode])
    setEdges(es => [...es, { id: `e-${fromId}-${newId}`, source: fromId, target: newId, ...edgeDefaults }])
    // Abrir el drawer en modo creación (pasos guiados)
    setCreatingId(newId)
    setEditingId(newId)
  }

  const editingNode = useMemo(
    () => editingId ? decoratedNodes.find(n => n.id === editingId) as Node<StateNodeData> | undefined : undefined,
    [editingId, decoratedNodes]
  )

  const updateState = (id: string, patch: Partial<StateNodeData>) => {
    setNodes(ns => ns.map(n => n.id === id ? ({ ...n, data: { ...n.data, ...patch } } as any) : n))
  }

  const deleteState = (id: string) => {
    setNodes(ns => ns.filter(n => n.id !== id))
    setEdges(es => es.filter(e => e.source !== id && e.target !== id))
  }

  const deleteField = (nodeId: string, fieldId: string) => {
    setNodes(ns => ns.map(n => n.id === nodeId
      ? { ...n, data: { ...n.data, requiredData: (n.data as StateNodeData).requiredData.filter((f: RequiredField) => f.id !== fieldId) } } as any
      : n
    ))
  }

  const showOrchBanner = connectedToOrchestrator === false && !orchBannerDismissed

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 600 }}>
      <style>{`.react-flow__node:focus,.react-flow__node:focus-visible,.react-flow__node.selected{outline:none!important}.react-flow__node.selected>div{outline:none!important}`}</style>

      {/* Orchestrator connection warning banner */}
      {showOrchBanner && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          background: '#FFFBEB', borderBottom: '1px solid #FDE68A',
        }}>
          <TriangleAlert size={15} color="#D97706" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#92400E', fontFamily: 'Roboto, sans-serif' }}>
            Este agente <strong>no está conectado a ningún orquestador</strong> — no va a funcionar en producción.{' '}
            {orchestratorName && <span>Conectá «{orchestratorName}» para activarlo.</span>}
          </span>
          <button
            onClick={() => setOrchBannerDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B45309', fontSize: 11, fontWeight: 600, fontFamily: 'Roboto, sans-serif', padding: '4px 8px', borderRadius: 6 }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FEF3C7')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >Entendido ×</button>
        </div>
      )}

      {/* Top-right toolbar */}
      <div style={{
        position: 'absolute', top: showOrchBanner ? 48 : 16, right: 16, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {onReconfigure && (
          <ToolbarBtn icon={<RotateCcw size={14} />} onClick={onReconfigure}>Reconfigurar</ToolbarBtn>
        )}
        <DatosToolbarBtn
          totalFields={decoratedNodes.filter(n => n.type === 'stateNode').reduce((acc, n) => acc + ((n.data as StateNodeData).requiredData?.length ?? 0), 0)}
          onClick={() => setDatosOpen(true)}
        />
        <ToolbarBtn icon={<Settings size={14} />} onClick={() => setWorkflowSettingsOpen(true)}>Configuración</ToolbarBtn>
        <ToolbarBtn icon={<LayoutGrid size={14} />} primary>View board</ToolbarBtn>
        <ToolbarBtn icon={<Maximize2 size={14} />} square />
      </div>

      {/* Empty state — cuando no hay estados todavía */}
      {decoratedNodes.filter(n => n.type === 'stateNode').length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            padding: '40px 48px', borderRadius: 20,
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
            border: '1px solid #E2E8F0', boxShadow: '0 4px 32px -8px rgba(15,23,42,0.10)',
            pointerEvents: 'auto', maxWidth: 360, textAlign: 'center',
          }}>
            {/* Mini funnel illustration */}
            <svg width="56" height="40" viewBox="0 0 56 40" fill="none">
              <rect x="1" y="10" width="16" height="20" rx="5" fill="#EEF0FF" stroke={PRIMARY} strokeWidth="1.5"/>
              <line x1="17" y1="20" x2="23" y2="20" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 2"/>
              <rect x="23" y="5" width="10" height="30" rx="5" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 3"/>
              <line x1="33" y1="20" x2="39" y2="20" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 2"/>
              <rect x="39" y="5" width="10" height="30" rx="5" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 3"/>
              <circle cx="28" cy="20" r="4" fill="#CBD5E1"/>
              <line x1="26" y1="20" x2="30" y2="20" stroke="white" strokeWidth="1.5"/>
              <line x1="28" y1="18" x2="28" y2="22" stroke="white" strokeWidth="1.5"/>
            </svg>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 5 }}>El embudo no tiene estados</div>
              <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>Hacé clic en el <strong style={{ color: '#0F172A' }}>+</strong> junto al nodo de inicio para agregar el primer estado.</div>
            </div>
            <button
              onClick={() => {
                const startNode = nodes.find(n => n.id === 'start')
                if (startNode) handleAddNext('start')
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 20px', borderRadius: 100, border: 'none',
                background: PRIMARY, color: 'white',
                fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 14px -4px rgba(48,79,254,0.4)',
              }}
            >
              <Plus size={14} /> Agregar primer estado
            </button>
          </div>
        </div>
      )}

      {/* Toggle sidebar pin (left edge, decorative) */}
      <div style={{
        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
        width: 18, height: 32, borderRadius: '0 8px 8px 0',
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderLeft: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        color: '#94A3B8',
      }}>›</div>

      <ReactFlow
        nodes={decoratedNodes as any}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd as any}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={edgeDefaults}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable
        elementsSelectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#CBD5E1" />
      </ReactFlow>

      {/* Shift-click hint */}
      <div style={{
        position: 'absolute', left: 16, bottom: 60, zIndex: 10,
        padding: '5px 10px', background: '#FFFFFF',
        border: '1px solid #E2E8F0', borderRadius: 8,
        fontSize: 11.5, color: '#64748B', fontFamily: 'Roboto, sans-serif',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        pointerEvents: 'none',
      }}>
        Hold <strong>Shift</strong> to select multiple nodes
      </div>

      {/* Bottom-left zoom controls */}
      <div style={{
        position: 'absolute', left: 16, bottom: 16, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 0,
        padding: '4px 6px', background: '#FFFFFF',
        border: '1px solid #E2E8F0', borderRadius: 100,
        fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#475569',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}>
        <ZoomBtn>⊕</ZoomBtn>
        <span style={{ padding: '0 8px' }}>100%</span>
        <ZoomBtn>⊖</ZoomBtn>
        <span style={{ width: 1, height: 16, background: '#E2E8F0', margin: '0 6px' }} />
        <ZoomBtn><Maximize2 size={12} /></ZoomBtn>
      </div>

      {/* AI sparkle FAB */}
      <button style={{
        position: 'absolute', right: 16, bottom: 16, zIndex: 10,
        width: 44, height: 44, borderRadius: '50%',
        background: 'linear-gradient(135deg, #304FFE, #6272FF)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white',
        boxShadow: '0 8px 24px -6px rgba(48,79,254,0.45)',
      }}>
        <Sparkles size={18} />
      </button>

      {/* Edit drawer */}
      {editingNode && (
        <EditStateDrawer
          key={editingNode.id}
          node={editingNode}
          isCreating={creatingId === editingNode.id}
          onClose={() => { setEditingId(null); setCreatingId(null) }}
          onSave={updateState}
          onDelete={deleteState}
          onMakeFinal={(id) => updateState(id, { kind: 'final' })}
          onOpenAdvanced={(id) => { setEditingId(null); setAdvancedId(id) }}
          drawerMode={drawerMode}
          setDrawerMode={setDrawerMode}
        />
      )}

      {/* Templates picker */}
      {templatesOpen && (
        <TemplatesModal onClose={() => setTemplatesOpen(false)} onPick={applyTemplate} />
      )}

      {/* Workflow settings drawer */}
      {workflowSettingsOpen && (
        <WorkflowSettingsDrawer
          onClose={() => setWorkflowSettingsOpen(false)}
          stateNodes={decoratedNodes.filter(n => n.type === 'stateNode') as Node<StateNodeData>[]}
          onDeleteField={deleteField}
        />
      )}

      {/* Datos drawer */}
      {datosOpen && (
        <DatosDrawer
          onClose={() => setDatosOpen(false)}
          stateNodes={decoratedNodes.filter(n => n.type === 'stateNode') as Node<StateNodeData>[]}
          onEditState={(id) => { setDatosOpen(false); setEditingId(id) }}
          onDeleteField={deleteField}
        />
      )}

      {/* Advanced editor overlay */}
      {advancedId && (() => {
        const adv = decoratedNodes.find(n => n.id === advancedId) as Node<StateNodeData> | undefined
        if (!adv) return null
        return (
          <AdvancedEditorOverlay
            node={adv}
            pinSettings={variant === 'unified'}
            onClose={() => setAdvancedId(null)}
            onSave={updateState}
            onConvertToSimple={(id) => {
              updateState(id, { kind: 'simple' })
              setAdvancedId(null)
            }}
            onToggleSidebar={onToggleSidebar}
            agentName={agentName}
          />
        )
      })()}
    </div>
  )
}

// ─── Advanced Editor Overlay (Lógica editor) ───────────────────────────────────

function AdvancedEditorOverlay({
  node, onClose, onSave, onConvertToSimple, pinSettings, onToggleSidebar, agentName,
}: {
  node: Node<StateNodeData>
  onClose: () => void
  onSave: (id: string, patch: Partial<StateNodeData>) => void
  onConvertToSimple: (id: string) => void
  pinSettings?: boolean
  onToggleSidebar?: () => void
  agentName?: string
}) {
  const [name, setName] = useState(node.data.name)
  const [color, setColor] = useState(node.data.color)
  const [description, setDescription] = useState(node.data.description ?? '')
  const [requiresHuman, setRequiresHuman] = useState(node.data.requiresHuman)
  const [requiredData, setRequiredData] = useState<RequiredField[]>(node.data.requiredData ?? [])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)

  useEffect(() => {
    onSave(node.id, { name, color, description, requiresHuman, requiredData })
  }, [name, color, description, requiresHuman, // eslint-disable-line
    requiredData.map(f => f.id + f.name + f.description + String(f.optional)).join()])

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      animation: 'wfSlide 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
    }}>
      <style>{`@keyframes wfSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {/* Collapse left sidebar button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title="Hide/show left panel"
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'transparent', border: '1px solid #E2E8F0',
                color: '#94A3B8', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >☰</button>
          )}
          {/* Back arrow icon */}
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'transparent', border: '1px solid #E2E8F0',
              color: '#475569', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
            title="Back to workflow"
            onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >←</button>
          {/* Breadcrumb context */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Roboto, sans-serif', fontSize: 12.5, color: '#94A3B8' }}>
            {agentName && <span style={{ fontWeight: 500 }}>{agentName}</span>}
            {agentName && <span>/</span>}
            <span style={{ fontWeight: 500 }}>Workflows</span>
            <span>/</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>Flow: {name || node.data.name}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onConvertToSimple(node.id)}
            style={{
              padding: '8px 14px', borderRadius: 10,
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              color: '#475569', fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            }}
          >Back to simple</button>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10,
            background: '#FFFFFF', border: `1px solid ${PRIMARY}`,
            color: PRIMARY, fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          }}><Play size={13} /> Test flow</button>
          {!pinSettings && (
            <button
              onClick={() => setSettingsOpen(true)}
              title="State settings"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10,
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                color: '#475569', fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF' }}
            ><Settings size={13} /> Settings</button>
          )}
          {/* Search input */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10,
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            minWidth: 180,
          }}>
            <Search size={14} color="#94A3B8" />
            <input
              placeholder="Search ..."
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#0F172A',
              }}
            />
          </div>
        </div>
      </header>

      {/* Body: canvas (and optionally a permanent right-side settings panel) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#F8FAFC' }}>
        <AdvancedFlow stateName={name} stateId={node.id} />

        {/* Bottom-left: mini-map placeholder + zoom controls row */}
        <div style={{
          position: 'absolute', left: 16, bottom: 16, zIndex: 10,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* Mini-map */}
          <div style={{
            width: 180, height: 90,
            background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10,
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Tiny mini-map indication */}
            <div style={{
              position: 'absolute', left: 12, top: 32, width: 24, height: 4, borderRadius: 2,
              background: '#CBD5E1',
            }} />
            <div style={{
              position: 'absolute', left: 44, top: 30, width: 38, height: 8, borderRadius: 2,
              background: '#C7D2FE',
            }} />
          </div>
          {/* Zoom controls */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 0,
            padding: 4, background: '#FFFFFF',
            border: '1px solid #E2E8F0', borderRadius: 10,
            fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#475569',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          }}>
            <ZoomBtn>⊕</ZoomBtn>
            <span style={{ padding: '0 8px' }}>81%</span>
            <ZoomBtn>⊖</ZoomBtn>
            <span style={{ width: 1, height: 16, background: '#E2E8F0', margin: '0 4px' }} />
            <ZoomBtn><GitBranch size={13} /></ZoomBtn>
            <span style={{
              padding: '4px 8px', background: PRIMARY, color: '#FFFFFF', borderRadius: 6,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}><MapIcon size={13} /></span>
            <ZoomBtn><Maximize2 size={12} /></ZoomBtn>
          </div>
        </div>

        {/* Bottom-center: cursor + pan + undo/redo */}
        <div style={{
          position: 'absolute', left: '50%', bottom: 16, transform: 'translateX(-50%)', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            display: 'inline-flex', gap: 0,
            padding: 4, background: '#FFFFFF',
            border: '1px solid #E2E8F0', borderRadius: 10,
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          }}>
            <span style={{
              padding: '6px 12px', background: PRIMARY, color: '#FFFFFF', borderRadius: 6,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}><MousePointer2 size={14} /></span>
            <ZoomBtn><Hand size={14} /></ZoomBtn>
          </div>
          <div style={{
            display: 'inline-flex', gap: 0,
            padding: 4, background: '#FFFFFF',
            border: '1px solid #E2E8F0', borderRadius: 10,
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          }}>
            <ZoomBtn><Undo2 size={14} /></ZoomBtn>
            <ZoomBtn><Redo2 size={14} /></ZoomBtn>
          </div>
        </div>

        {/* AI sparkle FAB bottom-right */}
        <button style={{
          position: 'absolute', right: 16, bottom: 16, zIndex: 10,
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #304FFE, #6272FF)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
          boxShadow: '0 8px 24px -6px rgba(48,79,254,0.45)',
        }}>
          <Sparkles size={18} />
        </button>
      </div>

        {/* Permanent right-side settings panel (Unified mode) */}
        {pinSettings && (
          <aside style={{
            width: panelOpen ? 340 : 0, flexShrink: 0,
            background: '#FFFFFF',
            borderLeft: '1px solid #E2E8F0',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            transition: 'width 200ms ease',
          }}>
            {panelOpen && (
              <div style={{ width: 340, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                {/* Panel header with collapse button */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderBottom: '1px solid #E2E8F0', flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>State settings</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ padding: '2px 7px', borderRadius: 5, background: '#EEF0FF', color: PRIMARY, fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Unified</span>
                    <button
                      onClick={() => setPanelOpen(false)}
                      title="Hide panel"
                      style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid #E2E8F0', background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >›</button>
                  </div>
                </div>

                {/* Scrollable content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Name */}
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', marginBottom: 6, fontFamily: 'Roboto, sans-serif', textTransform: 'uppercase', letterSpacing: 0.4 }}>State name</div>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#0F172A', outline: 'none', background: '#FAFBFD' }}
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', marginBottom: 6, fontFamily: 'Roboto, sans-serif', textTransform: 'uppercase', letterSpacing: 0.4 }}>State instructions</div>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="What should the agent do in this state?"
                      rows={3}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#475569', outline: 'none', resize: 'vertical', background: '#FAFBFD', lineHeight: 1.5 }}
                    />
                  </div>

                  {/* Requires human */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', fontFamily: 'Roboto, sans-serif' }}>Human confirmation</div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Before changing the workflow</div>
                    </div>
                    <Toggle on={requiresHuman} onChange={setRequiresHuman} />
                  </div>

                  {/* Required data */}
                  <RequiredDataSection fields={requiredData} onChange={setRequiredData} />
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Settings drawer (Classic only — pinSettings renders the inline panel instead) */}
      {settingsOpen && !pinSettings && (
        <SettingsDrawer
          requiresHuman={requiresHuman}
          setRequiresHuman={setRequiresHuman}
          requiredData={requiredData}
          setRequiredData={setRequiredData}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}

function PaletteCard({ label, icon, color }: { label: string; icon: React.ReactNode; color: string }) {
  return (
    <button
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 16px', borderRadius: 10,
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        cursor: 'grab',
        fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: '#0F172A',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        minWidth: 150,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = '0 4px 12px -4px rgba(15,23,42,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)' }}
    >
      <span style={{ color }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function SettingsDrawer({
  requiresHuman, setRequiresHuman, requiredData, setRequiredData, onClose,
}: {
  requiresHuman: boolean
  setRequiresHuman: (v: boolean) => void
  requiredData: RequiredField[]
  setRequiredData: (f: RequiredField[]) => void
  onClose: () => void
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 20,
        background: 'rgba(15,23,42,0.32)',
      }}
    >
      <aside
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 420, background: '#FFFFFF',
          borderLeft: '1px solid #E2E8F0',
          boxShadow: '-12px 0 30px -10px rgba(15,23,42,0.18)',
          padding: '20px 22px',
          overflow: 'auto',
          display: 'flex', flexDirection: 'column', gap: 18,
          animation: 'wfDrawer 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <style>{`@keyframes wfDrawer{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontFamily: 'Roboto, sans-serif', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>State settings</h3>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Roboto, sans-serif' }}>Requires human confirmation</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Before changing the workflow</div>
          </div>
          <Toggle on={requiresHuman} onChange={setRequiresHuman} />
        </div>

        <RequiredDataSection fields={requiredData} onChange={setRequiredData} />
      </aside>
    </div>
  )
}

// ── Advanced flow nodes (match Image #18: Inicio pill + Instrucción rich card) ──

type InicioAdvData = Record<string, unknown> & { stateName?: string }

function InicioAdvNode({ data }: NodeProps<Node<InicioAdvData>>) {
  const label = data.stateName ? `When entering "${data.stateName}"` : 'State start'
  return (
    <div style={{
      padding: '10px 18px',
      background: '#FFFFFF',
      border: `1.5px solid ${PRIMARY}`,
      borderRadius: 100,
      fontFamily: 'Roboto, sans-serif', fontSize: 12.5, fontWeight: 600, color: PRIMARY,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      position: 'relative',
      whiteSpace: 'nowrap',
    }}>
      <MessageSquare size={13} />
      {label}
      <Handle type="source" position={Position.Right} style={{ background: PRIMARY, width: 12, height: 12, border: 'none' }} />
    </div>
  )
}

const TICKET_FIELDS = [
  { label: 'Estado',               key: 'estado' },
  { label: 'Fecha de creación',    key: 'fecha_creacion' },
  { label: 'Asignado',             key: 'asignado' },
  { label: 'Nombre del contacto',  key: 'nombre_contacto' },
  { label: 'Email',                key: 'email' },
  { label: 'Teléfono',             key: 'telefono' },
  { label: 'Plataforma',           key: 'plataforma' },
  { label: 'Equipo de soporte',    key: 'equipo_soporte' },
  { label: 'Canal',                key: 'canal' },
  { label: 'Última modificación',  key: 'ultima_modificacion' },
]

type InstAdvData = Record<string, unknown> & { title: string; description: string; warning?: string }

function InstructionAdvNode({ id, data }: NodeProps<Node<InstAdvData>>) {
  const [text, setText] = useState(data.description || '')
  const [showPicker, setShowPicker] = useState(false)
  const [pickerFilter, setPickerFilter] = useState('')
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 })
  const [triggerStart, setTriggerStart] = useState(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { setNodes } = useReactFlow()

  const commitText = (val: string) => {
    setText(val)
    setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, description: val } } : n))
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    commitText(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPicker) {
      if (e.key === 'Escape') { setShowPicker(false); return }
      if (e.key === 'Enter') { e.preventDefault(); return }
    }
    if (e.key === '$') {
      const ta = e.currentTarget
      const pos = ta.getBoundingClientRect()
      setPickerPos({ top: pos.bottom + 4, left: pos.left })
      setPickerFilter('')
      setTriggerStart(ta.selectionStart)
      setShowPicker(true)
    }
  }

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    if (!showPicker) return
    const ta = e.currentTarget
    const cursor = ta.selectionStart
    const fragment = ta.value.slice(triggerStart + 1, cursor)
    setPickerFilter(fragment.toLowerCase())
  }

  const insertField = (field: { label: string; key: string }) => {
    const ta = textareaRef.current
    if (!ta) { setShowPicker(false); return }
    const before = text.slice(0, triggerStart)
    const after = text.slice(ta.selectionStart)
    const inserted = `\${${field.key}}`
    const newVal = before + inserted + after
    commitText(newVal)
    setShowPicker(false)
    setTimeout(() => {
      ta.focus()
      const pos = triggerStart + inserted.length
      ta.setSelectionRange(pos, pos)
    }, 0)
  }

  const filteredFields = pickerFilter
    ? TICKET_FIELDS.filter(f => f.label.toLowerCase().includes(pickerFilter) || f.key.includes(pickerFilter))
    : TICKET_FIELDS

  return (
    <div style={{ width: 380, position: 'relative' }}>
      <Handle type="target" position={Position.Left} style={{ background: PRIMARY, width: 12, height: 12, border: 'none' }} />
      {/* Floating type tab */}
      <div style={{
        position: 'absolute', left: 0, top: -32,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8,
        background: 'rgba(48,79,254,0.08)', color: PRIMARY,
        fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700,
      }}>
        <MessageSquare size={12} />
        Instruction
        <ChevronDown size={11} />
      </div>
      {/* Card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        overflow: 'hidden',
      }}>
        {/* Title row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 8px',
        }}>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            {data.title}
          </span>
          <button style={{
            width: 24, height: 24, borderRadius: 6,
            border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}><MoreVertical size={14} /></button>
        </div>
        {/* Editable prompt area */}
        <div style={{ padding: '0 16px 12px', position: 'relative' }}>
          <div style={{ position: 'relative', minHeight: 40 }}>
            {/* Highlight backdrop */}
            <div aria-hidden style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              fontFamily: 'Roboto, sans-serif', fontSize: 13, lineHeight: 1.55,
              padding: '4px 0', color: '#0F172A',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              pointerEvents: 'none',
            }}>
              {tokenize(text)}
              {'\n'}
            </div>
            <textarea
              ref={textareaRef}
              className="nodrag nopan"
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              onBlur={() => setTimeout(() => setShowPicker(false), 150)}
              placeholder="Write what you want the agent to do..."
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                border: 'none', outline: 'none', resize: 'none',
                background: 'transparent',
                fontFamily: 'Roboto, sans-serif', fontSize: 13, lineHeight: 1.55,
                padding: '4px 0', minHeight: 40,
                color: text ? 'transparent' : '#0F172A',
                caretColor: '#0F172A',
                position: 'relative',
              }}
            />
          </div>
          <div style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 11.5, color: '#94A3B8',
            paddingTop: 6, borderTop: '1px dashed #E2E8F0', marginTop: 2,
          }}>
            Type <strong>$</strong> to insert ticket data fields
          </div>
          {/* Ticket field picker */}
          {showPicker && (
            <div
              className="nodrag nopan"
              style={{
                position: 'absolute', left: 0, bottom: '100%', marginBottom: 4, zIndex: 999,
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                boxShadow: '0 8px 24px -8px rgba(15,23,42,0.18)',
                overflow: 'hidden',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              <div style={{
                padding: '8px 10px 4px',
                fontSize: 10.5, fontWeight: 700, color: '#94A3B8',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                Datos del ticket
              </div>
              {filteredFields.length === 0 ? (
                <div style={{ padding: '8px 12px', fontSize: 12.5, color: '#94A3B8' }}>No matches</div>
              ) : filteredFields.map(f => (
                <button
                  key={f.key}
                  onMouseDown={e => { e.preventDefault(); insertField(f) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', textAlign: 'left',
                    padding: '8px 12px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#0F172A',
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{
                    padding: '2px 6px', borderRadius: 4,
                    background: TOKEN_BG, color: TOKEN_VIOLET,
                    fontSize: 10.5, fontWeight: 700, fontFamily: 'monospace',
                    flexShrink: 0,
                  }}>
                    {'${' + f.key + '}'}
                  </span>
                  <span style={{ color: '#475569' }}>{f.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Warning */}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: PRIMARY, width: 12, height: 12, border: 'none', top: 'calc(50% + 12px)' }} />
    </div>
  )
}

// Module-level ref so AddNodeButton can call back into AdvancedFlow without prop drilling
const _advAddFn = { current: (_type: string) => {} }

const ADV_NODE_ITEMS = [
  { type: 'instAdv', label: 'Instruction', color: PRIMARY,    icon: <MessageSquare size={13} /> },
  { type: 'condAdv', label: 'Conditional', color: '#F97316',  icon: <GitBranch size={13} /> },
  { type: 'loopAdv', label: 'Loop',        color: '#16A34A',  icon: <RotateCcw size={13} /> },
]

function AddNodeButton({ }: NodeProps) {
  const [open, setOpen] = useState(false)
  const items = ADV_NODE_ITEMS
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0, pointerEvents: 'none' }} />
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #94A3B8',
          background: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, fontWeight: 300, color: '#64748B',
          boxShadow: '0 2px 8px rgba(15,23,42,0.12)', transition: 'all 140ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.color = PRIMARY; e.currentTarget.style.boxShadow = `0 2px 12px rgba(48,79,254,0.25)` }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#64748B'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.12)' }}
      >+</button>
      {open && (
        <div style={{
          position: 'absolute', left: 36, top: -6, zIndex: 100,
          background: 'white', borderRadius: 10, border: '1px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(15,23,42,0.14)', padding: 6, minWidth: 150,
        }} onClick={e => e.stopPropagation()}>
          {items.map(item => (
            <button key={item.type}
              onClick={() => { _advAddFn.current(item.type); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                width: '100%', padding: '8px 12px', borderRadius: 7,
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600,
                color: item.color, textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >{item.icon}{item.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}

function ConditionalAdvNode({ }: NodeProps) {
  const [conditions, setConditions] = useState([''])
  return (
    <div style={{ width: 340, position: 'relative' }}>
      <Handle type="target" position={Position.Left} style={{ background: '#F97316', width: 12, height: 12, border: 'none' }} />
      <div style={{ position: 'absolute', left: 0, top: -32, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: '#FFF7ED', color: '#F97316', fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700 }}>
        <GitBranch size={12} /> Conditional
      </div>
      <div style={{ background: 'white', border: '1.5px solid #FFEDD5', borderRadius: 12, boxShadow: '0 1px 2px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px' }}>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Conditional node</span>
          <button style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MoreVertical size={14} /></button>
        </div>
        <div style={{ padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {conditions.map((cond, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Roboto, sans-serif', marginBottom: 4 }}>If true</div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 8, background: 'white', overflow: 'hidden' }}>
                <input className="nodrag nopan" value={cond} onChange={e => { const nc = [...conditions]; nc[i] = e.target.value; setConditions(nc) }}
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '9px 10px', fontFamily: 'Roboto, sans-serif', fontSize: 13, background: 'transparent', color: '#0F172A' }} />
                <button onClick={() => setConditions(conditions.filter((_, ci) => ci !== i))}
                  style={{ flexShrink: 0, width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer', color: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={12} />
                </button>
              </div>
              <Handle type="source" position={Position.Right} id={`c${i}`} style={{ background: '#F97316', width: 12, height: 12, border: 'none', top: '70%' }} />
            </div>
          ))}
          <button onClick={() => setConditions([...conditions, ''])} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0 8px', fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
            <Plus size={14} /> Add condition
          </button>
        </div>
        <div style={{ height: 1, background: '#F1F5F9', margin: '0 0' }} />
        <div style={{ position: 'relative', padding: '10px 16px 12px' }}>
          <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Roboto, sans-serif', marginBottom: 2 }}>Otherwise</div>
          <div style={{ fontSize: 14, color: '#0F172A', fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}>None matched</div>
          <Handle type="source" position={Position.Right} id="else" style={{ background: '#94A3B8', width: 12, height: 12, border: 'none' }} />
        </div>
      </div>
    </div>
  )
}

function LoopAdvNode({ }: NodeProps) {
  const [instruction, setInstruction] = useState('')
  return (
    <div style={{ width: 380, position: 'relative' }}>
      <Handle type="target" position={Position.Left} style={{ background: '#16A34A', width: 12, height: 12, border: 'none' }} />
      <div style={{ position: 'absolute', left: 0, top: -32, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: '#F0FDF4', color: '#16A34A', fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700 }}>
        <RotateCcw size={12} /> While loop
      </div>
      <div style={{ background: 'white', border: '1.5px solid #DCFCE7', borderRadius: 12, boxShadow: '0 1px 2px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 8px' }}>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Loop</span>
          <button style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MoreVertical size={14} /></button>
        </div>
        <div style={{ padding: '0 16px 12px' }}>
          <textarea className="nodrag nopan" value={instruction} onChange={e => setInstruction(e.target.value)}
            placeholder="Write what you want the agent to do..."
            rows={2}
            style={{ width: '100%', boxSizing: 'border-box', border: 'none', borderRadius: 8, padding: '8px 10px', background: '#F8FAFC', fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#0F172A', resize: 'none', outline: 'none', lineHeight: 1.5 }}
          />
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}>
            Type <strong>$</strong> to insert datos del ticket
          </div>
        </div>
        <div style={{ height: 1, background: '#F1F5F9' }} />
        <div style={{ position: 'relative', padding: '10px 16px 12px' }}>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 500, color: '#0F172A' }}>When done</span>
          <Handle type="source" position={Position.Right} style={{ background: '#16A34A', width: 12, height: 12, border: 'none' }} />
        </div>
      </div>
    </div>
  )
}

function AdvancedFlow({ stateName, stateId }: { stateName?: string; stateId?: string }) {
  const storageKey = `bm-adv-flow-${stateId ?? 'default'}`

  const makeInitialNodes = (): Node[] => [
    { id: 'a-start',  type: 'inicioAdv', position: { x: 60, y: 200 },  data: { stateName } },
    { id: 'a-inst-0', type: 'instAdv',   position: { x: 360, y: 150 }, data: { title: 'Instruction', description: "Ask the lead if they'd like to schedule a demo call to learn more about the product." } },
    { id: 'a-add-0',  type: 'addAdv',    position: { x: 820, y: 172 }, data: {} },
  ]
  const makeInitialEdges = (): Edge[] => [
    { id: 'ae-0', source: 'a-start',  target: 'a-inst-0', type: 'smoothstep' },
    { id: 'ae-1', source: 'a-inst-0', target: 'a-add-0',  type: 'smoothstep' },
  ]

  const loadSaved = (): { nodes: Node[]; edges: Edge[] } | null => {
    try { const s = localStorage.getItem(storageKey); return s ? JSON.parse(s) : null } catch { return null }
  }
  const saved = loadSaved()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(saved?.nodes ?? makeInitialNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(saved?.edges ?? makeInitialEdges())
  const [dropMenuPos, setDropMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [savedToast, setSavedToast] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const mountedRef = useRef(false)

  // Keep refs fresh to avoid stale closures in _advAddFn
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  useEffect(() => { nodesRef.current = nodes }, [nodes])
  useEffect(() => { edgesRef.current = edges }, [edges])

  // Signal TaskReminderButton that user is inside a flow editor,
  // then mark task complete after 1.5s and show feedback modal after 2.5s
  useEffect(() => {
    sessionStorage.setItem('bm-in-flow', '1')
    window.dispatchEvent(new CustomEvent('bm-flow-change'))
    const doneTimer = setTimeout(() => {
      sessionStorage.setItem('bm-flow-done', '1')
      window.dispatchEvent(new CustomEvent('bm-flow-change'))
    }, 1500)
    const modalTimer = setTimeout(() => setShowSuccess(true), 2500)
    return () => {
      clearTimeout(doneTimer)
      clearTimeout(modalTimer)
      sessionStorage.removeItem('bm-in-flow')
      window.dispatchEvent(new CustomEvent('bm-flow-change'))
    }
  }, [])

  // Persist on change + show saved toast (skip initial mount)
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ nodes, edges })) } catch {}
    if (!mountedRef.current) { mountedRef.current = true; return }
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    setSavedToast(true)
    savedTimerRef.current = setTimeout(() => setSavedToast(false), 2200)
  }, [nodes, edges, storageKey])

  // Register the add-node handler so AddNodeButton can call it
  _advAddFn.current = (type: string) => {
    const cur = nodesRef.current
    const curE = edgesRef.current
    const addBtn = cur.find(n => n.type === 'addAdv')
    const addBtnId = addBtn?.id ?? ''
    const pos = addBtn?.position ?? { x: 320, y: 222 }
    const srcEdge = curE.find(e => e.target === addBtnId)
    const srcId = srcEdge?.source ?? 'a-start'
    const newId = `node-${Date.now()}`
    const newAddId = `add-${newId}`
    const defData: Record<string, unknown> =
      type === 'instAdv' ? { title: 'New instruction', description: '' } : {}
    setNodes([
      ...cur.filter(n => n.id !== addBtnId),
      { id: newId, type, position: pos, data: defData },
      { id: newAddId, type: 'addAdv', position: { x: pos.x + 440, y: pos.y }, data: {} },
    ])
    setEdges([
      ...curE.filter(e => e.target !== addBtnId),
      { id: `e-${srcId}-${newId}`, source: srcId, target: newId, type: 'smoothstep' },
      { id: `e-${newId}-${newAddId}`, source: newId, target: newAddId, type: 'smoothstep' },
    ])
  }

  const advNodeTypes = useMemo(() => ({
    inicioAdv: InicioAdvNode,
    instAdv:   InstructionAdvNode,
    condAdv:   ConditionalAdvNode,
    loopAdv:   LoopAdvNode,
    addAdv:    AddNodeButton,
  }), [])

  const onConnect = useCallback((p: Connection) => setEdges(es => addEdge({ ...p, type: 'smoothstep' }, es)), [setEdges])

  function onAdvConnectEnd(event: MouseEvent | TouchEvent, cs: { isValid: boolean | null; fromNode: { id: string } | null }) {
    if (!cs?.fromNode || cs.isValid === true) return
    const e = 'clientX' in event ? event : (event as TouchEvent).changedTouches[0]
    setDropMenuPos({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes} edges={edges}
          nodeTypes={advNodeTypes}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onAdvConnectEnd as any}
          defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#94A3B8', strokeWidth: 1.5 } }}
          fitView fitViewOptions={{ padding: 0.35 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#CBD5E1" />
        </ReactFlow>
      </ReactFlowProvider>
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
      {savedToast && (
        <div style={{
          position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, pointerEvents: 'none',
          background: '#0F172A', color: '#F8FAFC',
          padding: '8px 18px', borderRadius: 100,
          fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 7,
          boxShadow: '0 4px 20px rgba(15,23,42,0.25)',
          animation: 'toastIn 200ms ease both',
        }}>
          <span style={{ color: '#34D399', fontSize: 15 }}>✓</span> Flow saved
        </div>
      )}
      {dropMenuPos && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={() => setDropMenuPos(null)}
          />
          <div
            style={{
              position: 'fixed',
              left: dropMenuPos.x,
              top: dropMenuPos.y,
              zIndex: 9999,
              background: 'white',
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15,23,42,0.14)',
              padding: 6,
              minWidth: 150,
              fontFamily: 'Roboto, sans-serif',
            }}
            onClick={e => e.stopPropagation()}
          >
            {ADV_NODE_ITEMS.map(item => (
              <button key={item.type}
                onClick={() => { _advAddFn.current(item.type); setDropMenuPos(null) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  width: '100%', padding: '8px 12px', borderRadius: 7,
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600,
                  color: item.color, textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >{item.icon}{item.label}</button>
            ))}
          </div>
        </>
      )}
    </>
  )
}

// ─── Templates Modal ──────────────────────────────────────────────────────────

function TemplatesModal({ onClose, onPick }: { onClose: () => void; onPick: (tpl: Template) => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15,23,42,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 760, maxHeight: '90vh', overflow: 'auto',
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 24px 60px -12px rgba(15,23,42,0.25)',
          fontFamily: 'Roboto, sans-serif',
          padding: '24px 26px',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
              Templates
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B', lineHeight: 1.5, maxWidth: 520 }}>
              Empezá con una estructura común y adaptala a tu caso. Esto va a reemplazar el funnel actual.
            </p>
          </div>
          <button onClick={onClose} title="Close" style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >✕</button>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
        }}>
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => onPick(tpl)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '16px 18px', borderRadius: 12,
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                cursor: 'pointer', textAlign: 'left',
                transition: 'border-color 140ms ease-out, background 140ms ease-out, transform 140ms ease-out',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = '#FAFBFD'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{tpl.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{tpl.name}</div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2, lineHeight: 1.45 }}>{tpl.description}</div>
              </div>
            </button>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 11.5, color: '#94A3B8', lineHeight: 1.5 }}>
          Templates are a starting point — you can always add, modify, or remove states later.
        </p>
      </div>
    </div>
  )
}

function WorkflowSettingsDrawer({ onClose, stateNodes, onDeleteField }: {
  onClose: () => void
  stateNodes: Node<StateNodeData>[]
  onDeleteField?: (nodeId: string, fieldId: string) => void
}) {
  const [goal, setGoal] = useState('Leads')
  const [desc, setDesc] = useState('')
  const [activeTab, setActiveTab] = useState<'general' | 'datos'>('general')
  const MAX = 1500

  const statesWithData = stateNodes.filter(n => n.data.requiredData && n.data.requiredData.length > 0)
  const totalFields = statesWithData.reduce((acc, n) => acc + n.data.requiredData.length, 0)

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
      <aside
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 400, background: '#FFFFFF',
          borderLeft: '1px solid #E2E8F0',
          boxShadow: '-12px 0 30px -10px rgba(15,23,42,0.18)',
          display: 'flex', flexDirection: 'column',
          animation: 'wfDrawer 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px 16px', flexShrink: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', fontFamily: 'Roboto, sans-serif' }}>Configuración del funnel</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#475569')} onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}>
            <X size={18} />
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, padding: '0 22px', flexShrink: 0, borderBottom: '1px solid #E2E8F0' }}>
          {(['general', 'datos'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer',
                fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600,
                color: activeTab === tab ? PRIMARY : '#64748B',
                borderBottom: activeTab === tab ? `2px solid ${PRIMARY}` : '2px solid transparent',
                marginBottom: -1, transition: 'color 120ms',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {tab === 'general' ? 'General' : (
                <>
                  Datos del funnel
                  {totalFields > 0 && (
                    <span style={{
                      padding: '1px 6px', borderRadius: 10,
                      background: activeTab === 'datos' ? PRIMARY : '#E2E8F0',
                      color: activeTab === 'datos' ? '#fff' : '#475569',
                      fontSize: 10.5, fontWeight: 700,
                    }}>{totalFields}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeTab === 'general' ? (
            <>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.65, fontFamily: 'Roboto, sans-serif' }}>
                Lo que el agente gestiona y cómo lo hace. Definí los objetos del negocio que va a manejar y describí cómo combina lógicas, MCPs, bases y código para cumplir el objetivo.
              </p>

              {/* Goal input */}
              <div style={{ position: 'relative', border: '1.5px solid #CBD5E1', borderRadius: 10 }}>
                <label style={{ position: 'absolute', top: -9, left: 12, background: 'white', padding: '0 4px', fontSize: 11, color: '#64748B', fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}>
                  ¿Qué deseas gestionar en el workflow?
                </label>
                <input
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px', border: 'none', borderRadius: 10, outline: 'none', fontSize: 14, color: '#0F172A', fontFamily: 'Roboto, sans-serif', background: 'transparent' }}
                />
              </div>

              {/* Desc textarea */}
              <div style={{ position: 'relative', border: '1.5px solid #CBD5E1', borderRadius: 10 }}>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value.slice(0, MAX))}
                  placeholder="Describe cómo el agente utiliza las herramientas para cumplir ..."
                  rows={5}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px 30px', border: 'none', borderRadius: 10, outline: 'none', fontSize: 13.5, color: '#0F172A', fontFamily: 'Roboto, sans-serif', resize: 'none', background: 'transparent', lineHeight: 1.55 }}
                />
                <span style={{ position: 'absolute', bottom: 10, right: 14, fontSize: 11, color: '#94A3B8', fontFamily: 'Roboto, sans-serif' }}>{desc.length}/{MAX}</span>
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.65, fontFamily: 'Roboto, sans-serif' }}>
                Datos que el agente debe recolectar en cada estado del workflow. Podés editarlos desde cada estado.
              </p>
              {statesWithData.length === 0 ? (
                <div style={{
                  padding: '24px 16px', borderRadius: 10, border: '1.5px dashed #E2E8F0',
                  textAlign: 'center', fontFamily: 'Roboto, sans-serif',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>📋</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>Sin datos requeridos</div>
                  <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>
                    Abrí un estado y agregá los datos que el agente debe pedir.
                  </div>
                </div>
              ) : statesWithData.map(node => (
                <div key={node.id} style={{
                  border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden',
                }}>
                  {/* State header */}
                  <div style={{
                    padding: '10px 14px', background: '#F8FAFC',
                    display: 'flex', alignItems: 'center', gap: 8,
                    borderBottom: '1px solid #E2E8F0',
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: node.data.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#0F172A', flex: 1 }}>
                      {node.data.name}
                    </span>
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                      {node.data.requiredData.length} campo{node.data.requiredData.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {/* Fields list */}
                  <div style={{ padding: '8px 0' }}>
                    {node.data.requiredData.map((field, i) => (
                      <div key={field.id} style={{
                        padding: '7px 14px',
                        display: 'flex', alignItems: 'center', gap: 8,
                        borderTop: i > 0 ? '1px solid #F1F5F9' : undefined,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12.5, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {field.name}
                          </div>
                          {field.description && (
                            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11.5, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {field.description}
                            </div>
                          )}
                        </div>
                        <span style={{
                          padding: '2px 7px', borderRadius: 5,
                          background: field.optional ? '#FEF9C3' : '#EEF0FF',
                          color: field.optional ? '#B45309' : PRIMARY,
                          fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
                          fontFamily: 'Roboto, sans-serif',
                          flexShrink: 0, textTransform: 'uppercase' as const,
                        }}>{field.optional ? 'Opcional' : 'Obligatorio'}</span>
                        {onDeleteField && (
                          <button
                            onClick={() => onDeleteField(node.id, field.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, borderRadius: 5, color: '#CBD5E1', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#CBD5E1')}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* AI button — bottom right of drawer */}
        <div style={{ padding: '12px 20px 20px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button style={{
            width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(48,79,254,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 140ms',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(48,79,254,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(48,79,254,0.12)')}
          >
            <Sparkles size={20} color={PRIMARY} />
          </button>
        </div>
      </aside>
    </div>
  )
}

function DatosToolbarBtn({ totalFields, onClick }: { totalFields: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 100,
        background: totalFields > 0 ? 'rgba(48,79,254,0.06)' : '#FFFFFF',
        border: `1px solid ${totalFields > 0 ? 'rgba(48,79,254,0.25)' : '#E2E8F0'}`,
        color: totalFields > 0 ? PRIMARY : '#0F172A',
        fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        transition: 'background 140ms ease-out',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = totalFields > 0 ? 'rgba(48,79,254,0.10)' : '#F8FAFC')}
      onMouseLeave={e => (e.currentTarget.style.background = totalFields > 0 ? 'rgba(48,79,254,0.06)' : '#FFFFFF')}
    >
      <Braces size={14} />
      Datos del funnel
      {totalFields > 0 && (
        <span style={{
          minWidth: 18, height: 18, borderRadius: 9,
          background: PRIMARY, color: '#fff',
          fontSize: 10.5, fontWeight: 700, lineHeight: '18px',
          textAlign: 'center', padding: '0 5px',
        }}>{totalFields}</span>
      )}
    </button>
  )
}

function DatosDrawer({ onClose, stateNodes, onEditState, onDeleteField }: {
  onClose: () => void
  stateNodes: Node<StateNodeData>[]
  onEditState: (id: string) => void
  onDeleteField?: (nodeId: string, fieldId: string) => void
}) {
  const statesWithData = stateNodes.filter(n => n.data.requiredData && n.data.requiredData.length > 0)
  const totalFields = statesWithData.reduce((acc, n) => acc + n.data.requiredData.length, 0)
  const statesWithout = stateNodes.filter(n => !n.data.requiredData || n.data.requiredData.length === 0)

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
      <style>{`@keyframes datosDrawer { from { opacity:0; transform:translateX(24px) } to { opacity:1; transform:translateX(0) } }`}</style>
      <aside
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 380, background: '#FFFFFF',
          borderLeft: '1px solid #E2E8F0',
          boxShadow: '-12px 0 30px -10px rgba(15,23,42,0.18)',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'Roboto, sans-serif',
          animation: 'datosDrawer 240ms cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', flexShrink: 0, borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Braces size={16} color={PRIMARY} />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', flex: 1 }}>Datos del funnel</span>
            {totalFields > 0 && (
              <span style={{ padding: '2px 8px', borderRadius: 10, background: '#EEF0FF', color: PRIMARY, fontSize: 11, fontWeight: 700 }}>
                {totalFields} campo{totalFields !== 1 ? 's' : ''}
              </span>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, color: '#94A3B8', display: 'flex' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#475569')} onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}>
              <X size={17} />
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', lineHeight: 1.55 }}>
            Datos que el agente recolecta en cada estado. Hacé clic en un estado para editarlos.
          </p>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stateNodes.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>Sin estados todavía</div>
              <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>Creá estados en el canvas para empezar a definir datos.</div>
            </div>
          ) : (
            <>
              {statesWithData.map(node => (
                <div key={node.id} style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
                  {/* State header — clickable to edit */}
                  <button
                    onClick={() => onEditState(node.id)}
                    style={{
                      width: '100%', padding: '9px 14px',
                      background: '#F8FAFC', border: 'none', borderBottom: '1px solid #E2E8F0',
                      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: node.data.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', flex: 1 }}>{node.data.name}</span>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                      {node.data.requiredData.length} campo{node.data.requiredData.length !== 1 ? 's' : ''}
                    </span>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>›</span>
                  </button>
                  {/* Fields */}
                  <div style={{ padding: '4px 0' }}>
                    {node.data.requiredData.map((field, i) => (
                      <div key={field.id} style={{
                        padding: '8px 14px',
                        display: 'flex', alignItems: 'center', gap: 8,
                        borderTop: i > 0 ? '1px solid #F8FAFC' : undefined,
                      }}>
                        {/* State color indicator on each row */}
                        <span style={{ width: 3, height: 32, borderRadius: 2, background: node.data.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Token + chip row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {field.name ? (
                              <span style={{
                                fontSize: 12, fontWeight: 700, color: TOKEN_VIOLET,
                                fontFamily: 'monospace', background: TOKEN_BG,
                                padding: '1px 6px', borderRadius: 4,
                              }}>{`\${${field.name}}`}</span>
                            ) : (
                              <span style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>Sin dato seleccionado</span>
                            )}
                            <span style={{
                              padding: '1px 6px', borderRadius: 4,
                              background: field.optional ? '#FEF9C3' : '#EEF0FF',
                              color: field.optional ? '#B45309' : PRIMARY,
                              fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' as const,
                            }}>{field.optional ? 'Opcional' : 'Obligatorio'}</span>
                          </div>
                          {field.description && (
                            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {field.description}
                            </div>
                          )}
                        </div>
                        {onDeleteField && (
                          <button
                            onClick={() => onDeleteField(node.id, field.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#CBD5E1', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#CBD5E1')}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* States without data */}
              {statesWithout.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                    Sin datos definidos
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {statesWithout.map(node => (
                      <button
                        key={node.id}
                        onClick={() => onEditState(node.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '9px 14px', borderRadius: 8,
                          border: '1.5px dashed #E2E8F0', background: 'none', cursor: 'pointer',
                          textAlign: 'left', width: '100%',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: node.data.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#475569', flex: 1 }}>{node.data.name}</span>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>+ Agregar datos</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  )
}

function ToolbarBtn({ children, icon, primary, square, onClick }: {
  children?: React.ReactNode; icon?: React.ReactNode; primary?: boolean; square?: boolean; onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: square ? '8px' : '8px 16px', borderRadius: square ? 8 : 100,
        background: '#FFFFFF',
        border: `1px solid ${primary ? PRIMARY : '#E2E8F0'}`,
        color: primary ? PRIMARY : '#0F172A',
        fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        transition: 'background 140ms ease-out',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
      onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
    >
      {icon}{children}
    </button>
  )
}

function ZoomBtn({ children }: { children: React.ReactNode }) {
  return (
    <button style={{
      width: 22, height: 22, borderRadius: '50%',
      border: 'none', background: 'transparent', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, color: '#475569',
    }}>{children}</button>
  )
}

// ─── Mindset screen ───────────────────────────────────────────────────────────

const MINDSET_DATA: Record<string, { good: { label: string; color: string }[]; bad: string[] }> = {
  leads: {
    good: [
      { label: 'Captación',    color: '#3B82F6' },
      { label: 'Calificación', color: '#EAB308' },
      { label: 'Demo',         color: '#9333EA' },
      { label: 'Propuesta',    color: '#F59E0B' },
      { label: 'Cierre',       color: '#16A34A' },
    ],
    bad: ['Pedir nombre', 'Validar email', 'Preguntar empresa', 'Detectar intención', 'Si calificado →', 'Si no →', 'Enviar folleto', 'Agendar demo', 'Confirmar hora', 'Recordatorio 1', 'Recordatorio 2', '…'],
  },
  pedidos: {
    good: [
      { label: 'Recepción',    color: '#3B82F6' },
      { label: 'Confirmación', color: '#EAB308' },
      { label: 'Preparación',  color: '#9333EA' },
      { label: 'Entrega',      color: '#16A34A' },
    ],
    bad: ['Saludar', 'Pedir menú', 'Registrar items', 'Confirmar items', 'Preguntar dirección', 'Validar zona', 'Si zona OK →', 'Calcular total', 'Pedir pago', 'Confirmar pago', 'Avisar a cocina', '…'],
  },
  soporte: {
    good: [
      { label: 'Recepción',    color: '#3B82F6' },
      { label: 'Diagnóstico',  color: '#EAB308' },
      { label: 'Resolución',   color: '#9333EA' },
      { label: 'Cierre',       color: '#16A34A' },
    ],
    bad: ['Saludar', 'Preguntar motivo', 'Registrar tipo', 'Buscar en FAQ', 'Si resuelto →', 'Si no →', 'Escalar a agente', 'Verificar cuenta', 'Pedir número de ticket', 'Confirmar resolución', '…'],
  },
  cobranzas: {
    good: [
      { label: 'Contacto',     color: '#3B82F6' },
      { label: 'Negociación',  color: '#EAB308' },
      { label: 'Acuerdo',      color: '#9333EA' },
      { label: 'Confirmación', color: '#16A34A' },
    ],
    bad: ['Identificar deuda', 'Primer contacto', 'Si contesta →', 'Si no contesta →', 'Recordatorio', 'Proponer cuota', 'Validar propuesta', 'Registrar acuerdo', 'Enviar comprobante', '…'],
  },
  agenda: {
    good: [
      { label: 'Solicitud',       color: '#3B82F6' },
      { label: 'Selección',       color: '#EAB308' },
      { label: 'Confirmación',    color: '#9333EA' },
      { label: 'Recordatorio',    color: '#16A34A' },
    ],
    bad: ['Saludar', 'Preguntar servicio', 'Mostrar horarios', 'Registrar preferencia', 'Verificar disponibilidad', 'Si disponible →', 'Si no →', 'Confirmar reserva', 'Pedir datos', 'Enviar confirmación', '…'],
  },
  otro: {
    good: [
      { label: 'Inicio',       color: '#3B82F6' },
      { label: 'Proceso',      color: '#EAB308' },
      { label: 'Validación',   color: '#9333EA' },
      { label: 'Cierre',       color: '#16A34A' },
    ],
    bad: ['Paso 1', 'Paso 2', 'Paso 3', 'Si condición A →', 'Si condición B →', 'Paso 4', 'Paso 5', 'Validar', 'Confirmar', 'Notificar', 'Registrar', '…'],
  },
}

function MindsetScreen({ processId, onContinue }: { processId: string; onContinue: () => void }) {
  const data = MINDSET_DATA[processId] ?? MINDSET_DATA.otro
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t) }, [])

  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 600,
      background: '#F8FAFC', fontFamily: 'Roboto, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', boxSizing: 'border-box', overflow: 'auto',
    }}>
      <style>{`
        @keyframes msIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes msSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      <div style={{ maxWidth: 860, width: '100%', opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}>

        {/* Eyebrow */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 100, background: 'rgba(48,79,254,0.08)', marginBottom: 18, animation: 'msIn 0.4s ease-out' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIMARY, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, letterSpacing: 0.3 }}>Antes de empezar</span>
        </div>

        {/* Title */}
        <h2 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.15, animation: 'msIn 0.5s ease-out' }}>
          Un funnel no es un flujo paso a paso.
        </h2>
        <p style={{ margin: '0 0 36px', fontSize: 15, color: '#64748B', lineHeight: 1.6, maxWidth: 560, animation: 'msIn 0.55s ease-out' }}>
          La diferencia entre estos dos enfoques define si el agente funciona bien o se convierte en un script rígido que nadie puede mantener.
        </p>

        {/* Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 36, animation: 'msIn 0.6s ease-out' }}>

          {/* ── Wrong way ── */}
          <div style={{ borderRadius: 14, border: '1.5px solid #FECACA', background: '#FFF8F8', padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✕</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>Así no</div>
                <div style={{ fontSize: 11.5, color: '#94A3B8' }}>Un estado para cada acción técnica</div>
              </div>
            </div>
            {/* Bad steps grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {data.bad.map((b, i) => (
                <span key={i} style={{
                  padding: '4px 9px', borderRadius: 6,
                  background: 'white', border: '1px solid #FECACA',
                  fontSize: 11.5, color: '#DC2626', fontWeight: 500,
                  opacity: i > 7 ? 0.5 : 1,
                }}>{b}</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
              Difícil de mantener. Si algo cambia, hay que reprogramar todo.
            </div>
          </div>

          {/* ── Right way ── */}
          <div style={{ borderRadius: 14, border: '1.5px solid #BBF7D0', background: '#F0FFF4', padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✓</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#16A34A' }}>Así sí</div>
                <div style={{ fontSize: 11.5, color: '#94A3B8' }}>Una etapa para cada fase del proceso</div>
              </div>
            </div>
            {/* Good stages pipeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
              {data.good.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, animation: `msSlide ${0.6 + i * 0.06}s ease-out both` }}>
                  {i > 0 && <div style={{ position: 'absolute' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '8px 12px', borderRadius: 9, background: 'white', border: `1.5px solid ${s.color}22`, boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{s.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10.5, color: '#CBD5E1', fontWeight: 500 }}>El agente lo maneja →</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
              El agente entiende el contexto y actúa en cada etapa. Vos solo definís las fases.
            </div>
          </div>
        </div>

        {/* 3 key principles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 36, animation: 'msIn 0.7s ease-out' }}>
          {[
            { icon: '🤖', title: 'El agente maneja el adentro', body: 'Preguntas, validaciones, respuestas — todo lo que pasa dentro de una etapa lo resuelve el agente solo.' },
            { icon: '📋', title: 'Los estados son etapas, no pasos', body: 'Cada estado representa una fase del proceso, como en un Kanban de ventas. No un mensaje ni una acción.' },
            { icon: '⚙️', title: '¿Lógica técnica? Flujo avanzado', body: 'Si necesitás condiciones o acciones complejas, podés agregarlas dentro de cada estado con el flujo avanzado.' },
          ].map(p => (
            <div key={p.title} style={{ padding: '16px 18px', borderRadius: 12, background: 'white', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{p.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 5 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.55 }}>{p.body}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, animation: 'msIn 0.75s ease-out' }}>
          <button
            onClick={onContinue}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              padding: '13px 28px', borderRadius: 100,
              background: PRIMARY, border: 'none', color: 'white',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', letterSpacing: 0.1,
              boxShadow: '0 4px 20px -4px rgba(48,79,254,0.45)',
              transition: 'transform 0.12s, box-shadow 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(48,79,254,0.50)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px -4px rgba(48,79,254,0.45)' }}
          >
            Entendido, crear mi funnel →
          </button>
          <span style={{ fontSize: 12, color: '#CBD5E1' }}>Podés volver a ver esto desde el menú de ayuda</span>
        </div>

      </div>
    </div>
  )
}

// ─── Funnel builder (AI-assisted, replaces templates) ─────────────────────────

const FUNNEL_SUGGESTIONS: { id: string; emoji: string; label: string; keywords: string[]; stages: string[] }[] = [
  { id: 'leads',     emoji: '🎯', label: 'Vender / calificar leads', keywords: ['vend', 'lead', 'venta', 'calific', 'demo', 'comercial', 'prospect', 'cierre', 'oportunidad'], stages: ['Captación', 'Calificación', 'Demo', 'Cierre'] },
  { id: 'soporte',   emoji: '🎧', label: 'Atención al cliente',      keywords: ['soporte', 'ayuda', 'problema', 'ticket', 'consulta', 'atenci', 'reclam', 'resol'], stages: ['Recepción', 'Diagnóstico', 'Resolución', 'Cierre'] },
  { id: 'pedidos',   emoji: '🍕', label: 'Tomar pedidos',            keywords: ['pedido', 'orden', 'compra', 'menú', 'menu', 'delivery', 'envío', 'envio', 'comida'], stages: ['Recepción', 'Confirmación', 'Preparación', 'Entrega'] },
  { id: 'cobranzas', emoji: '💳', label: 'Gestionar cobranzas',      keywords: ['cobr', 'pago', 'deuda', 'factura', 'mora', 'vencim'], stages: ['Contacto', 'Negociación', 'Acuerdo', 'Confirmación'] },
  { id: 'agenda',    emoji: '📅', label: 'Agendar turnos',           keywords: ['turno', 'reserva', 'agenda', 'cita', 'horario', 'reservar'], stages: ['Solicitud', 'Selección', 'Confirmación', 'Recordatorio'] },
]
const GENERIC_STAGES = ['Inicio', 'En proceso', 'Validación', 'Cierre']

function inferStages(text: string): string[] {
  const t = text.toLowerCase()
  let best: { hits: number; stages: string[] } = { hits: 0, stages: [] }
  for (const s of FUNNEL_SUGGESTIONS) {
    const hits = s.keywords.reduce((acc, k) => acc + (t.includes(k) ? 1 : 0), 0)
    if (hits > best.hits) best = { hits, stages: s.stages }
  }
  return best.hits > 0 ? best.stages : GENERIC_STAGES
}

const STAGE_DOT = ['#3B82F6', '#EAB308', '#9333EA', '#F59E0B', '#0F766E', '#EC4899']

function FunnelBuilderScreen({ onCreate }: { onCreate: (stages: string[]) => void }) {
  const [version, setVersion] = useState<'A' | 'B'>('A')
  const [text, setText] = useState('')
  const [stages, setStages] = useState<string[]>([])
  const [thinking, setThinking] = useState(false)
  const [generated, setGenerated] = useState(false)
  const lastInputRef = useRef<HTMLInputElement>(null)
  const pendingFocus = useRef(false)

  // Reset state when switching versions
  const switchVersion = (v: 'A' | 'B') => {
    setVersion(v)
    setThinking(false)
    setGenerated(false)
    setStages([])
  }

  const propose = (fromText?: string) => {
    const src = fromText ?? text
    if (!src.trim()) return
    setThinking(true)
    setGenerated(false)
    setTimeout(() => {
      setStages(inferStages(src))
      setThinking(false)
      setGenerated(true)
    }, 650)
  }

  // V2: propose + immediately go to canvas
  const createDirect = (fromText?: string) => {
    const src = (fromText ?? text).trim()
    if (!src) return
    setThinking(true)
    setTimeout(() => { onCreate(inferStages(src)) }, 700)
  }

  const pickPill = (s: { label: string; stages: string[] }) => {
    setText(s.label)
    if (version === 'B') {
      setThinking(true)
      setTimeout(() => onCreate([...s.stages]), 600)
      return
    }
    setThinking(true)
    setGenerated(false)
    setTimeout(() => { setStages([...s.stages]); setThinking(false); setGenerated(true) }, 500)
  }

  const updateStage = (i: number, v: string) => setStages(prev => prev.map((s, idx) => idx === i ? v : s))
  const removeStage = (i: number) => setStages(prev => prev.filter((_, idx) => idx !== i))
  const addStage = () => { pendingFocus.current = true; setStages(prev => [...prev, '']) }
  useEffect(() => { if (pendingFocus.current) { lastInputRef.current?.focus(); pendingFocus.current = false } }, [stages.length])

  const valid = stages.filter(s => s.trim()).length
  const tooMany = valid > 6

  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 600, background: '#F8FAFC',
      fontFamily: 'Roboto, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', boxSizing: 'border-box', overflow: 'auto',
    }}>
      <style>{`
        @keyframes fbIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fbChip{from{opacity:0;transform:translateY(8px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fbDot{0%,80%,100%{opacity:0.3;transform:scale(0.8)}40%{opacity:1;transform:scale(1)}}
      `}</style>

      <div style={{ maxWidth: 720, width: '100%' }}>
        {/* Top row: eyebrow + version switch */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, animation: 'fbIn 0.4s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 100, background: 'rgba(48,79,254,0.08)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIMARY }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, letterSpacing: 0.3 }}>Nuevo funnel</span>
          </div>
          {/* Version switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Modo:</span>
            <div style={{ display: 'flex', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              {(['A', 'B'] as const).map((v, i) => (
                <button key={v} onClick={() => switchVersion(v)} style={{
                  padding: '5px 14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 700,
                  background: version === v ? PRIMARY : 'white',
                  color: version === v ? 'white' : '#94A3B8',
                  borderLeft: i === 1 ? '1px solid #E2E8F0' : 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
                  title={v === 'A' ? 'Guiado: revisar etapas antes de crear' : 'Directo: crear el funnel de una vez'}
                >{v === 'A' ? 'Guiado' : 'Directo'}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Title + teaching subtitle */}
        <h2 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.15, animation: 'fbIn 0.5s ease-out' }}>
          ¿Qué proceso va a gestionar el agente?
        </h2>
        <p style={{ margin: '0 0 26px', fontSize: 15, color: '#64748B', lineHeight: 1.6, maxWidth: 560, animation: 'fbIn 0.55s ease-out' }}>
          {version === 'A'
            ? <>Describilo en una frase y el sistema propone las <strong style={{ color: '#475569' }}>etapas</strong>. Revisalas antes de crear el funnel.</>
            : <>Describilo en una frase y el funnel se crea directamente con las <strong style={{ color: '#475569' }}>etapas</strong> listas en el canvas.</>}
        </p>

        {/* Input + action button */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, animation: 'fbIn 0.6s ease-out' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Sparkles size={16} color={PRIMARY} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') version === 'A' ? propose() : createDirect() }}
              placeholder="Ej: Atiendo consultas, resuelvo problemas y escalo los casos complejos"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '13px 14px 13px 40px',
                borderRadius: 11, border: '1.5px solid #E2E8F0', outline: 'none',
                fontFamily: 'inherit', fontSize: 14, color: '#0F172A', background: 'white',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = PRIMARY}
              onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
            />
          </div>
          <button
            onClick={() => version === 'A' ? propose() : createDirect()}
            disabled={!text.trim() || thinking}
            style={{
              padding: '0 20px', borderRadius: 11, border: 'none', flexShrink: 0,
              background: !text.trim() || thinking ? '#E2E8F0' : PRIMARY,
              color: !text.trim() || thinking ? '#94A3B8' : 'white',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
              cursor: !text.trim() || thinking ? 'default' : 'pointer', transition: 'background 0.15s',
            }}
          >
            {version === 'A' ? 'Proponer etapas' : 'Crear funnel'}
          </button>
        </div>

        {/* Quick-start pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 30, animation: 'fbIn 0.65s ease-out' }}>
          <span style={{ fontSize: 12.5, color: '#94A3B8' }}>o empezar con:</span>
          {FUNNEL_SUGGESTIONS.map(s => (
            <button key={s.id} onClick={() => pickPill(s)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 100,
              border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12.5, fontWeight: 500, color: '#475569', transition: 'all 0.13s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.background = 'rgba(48,79,254,0.03)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'white' }}
            >
              <span>{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>

        {/* Thinking state */}
        {thinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: '#94A3B8', fontSize: 13.5, animation: 'fbIn 0.2s ease-out' }}>
            <span style={{ display: 'inline-flex', gap: 4 }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: PRIMARY, animation: `fbDot 1.2s ${i * 0.15}s infinite` }} />)}
            </span>
            {version === 'A' ? 'Generando etapas…' : 'Creando el funnel…'}
          </div>
        )}

        {/* Editable stages pipeline */}
        {generated && !thinking && (
          <div style={{ animation: 'fbIn 0.4s ease-out' }}>
            {/* Funnel preview — un mini-canvas contenido, conecta con lo que viene */}
            <div style={{ borderRadius: 16, border: '1px solid #E2E8F0', background: 'linear-gradient(180deg,#FBFCFE 0%,#F8FAFC 100%)', padding: '16px 18px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.7 }}>El funnel · editar las etapas</span>
                <span style={{ fontSize: 11.5, color: '#CBD5E1' }}>{valid} {valid === 1 ? 'etapa' : 'etapas'}</span>
              </div>

              {/* Pipeline horizontal (sin wrap, scrollea) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 6 }}>
                {/* Start */}
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 100, background: 'white', border: '1px solid #E2E8F0', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
                    <Play size={11} fill="#CBD5E1" color="#CBD5E1" /> Inicio
                  </span>
                  <span style={{ width: 22, height: 2, background: '#E2E8F0', flexShrink: 0 }} />
                </div>

                {stages.map((s, i) => {
                  const isLast = i === stages.length - 1
                  const dot = isLast ? '#16A34A' : STAGE_DOT[i % STAGE_DOT.length]
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0, animation: `fbChip ${0.2 + i * 0.07}s ease-out both` }}>
                      <div style={{
                        position: 'relative', minWidth: 150, padding: '12px 13px', borderRadius: 12,
                        background: 'white', border: '1.5px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
                      }}
                        onMouseEnter={e => { const x = e.currentTarget.querySelector('[data-del]') as HTMLElement; if (x) x.style.opacity = '1' }}
                        onMouseLeave={e => { const x = e.currentTarget.querySelector('[data-del]') as HTMLElement; if (x) x.style.opacity = '0' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ width: 9, height: 9, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                          <input
                            ref={isLast ? lastInputRef : undefined}
                            value={s}
                            onChange={e => updateStage(i, e.target.value)}
                            placeholder="Etapa"
                            style={{ flex: 1, minWidth: 0, width: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, color: '#0F172A', padding: 0 }}
                          />
                        </div>
                        <div style={{ fontSize: 10.5, color: '#CBD5E1', marginTop: 5, fontWeight: 500 }}>
                          {isLast ? 'Estado final' : 'El agente lo maneja'}
                        </div>
                        <button data-del onClick={() => removeStage(i)} title="Quitar etapa" style={{
                          position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%',
                          border: '1px solid #FECACA', background: 'white', cursor: 'pointer', color: '#DC2626',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.12s',
                          boxShadow: '0 2px 6px -1px rgba(15,23,42,0.15)',
                        }}><X size={11} strokeWidth={2.5} /></button>
                      </div>
                      <span style={{ width: 22, height: 2, background: '#E2E8F0', flexShrink: 0 }} />
                    </div>
                  )
                })}

                {/* Add stage */}
                <button onClick={addStage} title="Agregar etapa" style={{
                  flexShrink: 0, minWidth: 110, height: 64, borderRadius: 12, border: '1.5px dashed #CBD5E1', background: 'transparent',
                  cursor: 'pointer', color: PRIMARY, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.background = 'rgba(48,79,254,0.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = 'transparent' }}
                ><Plus size={16} /> Etapa</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, paddingTop: 12, borderTop: '1px solid #EDF1F7' }}>
                <Info size={13} color="#CBD5E1" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>Cada etapa es una fase del proceso. Las preguntas, respuestas y validaciones las resuelve el agente dentro de cada una.</span>
              </div>
            </div>

            {/* Guardrail */}
            {tooMany && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 14px', borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: 16, animation: 'fbIn 0.3s ease-out' }}>
                <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.2 }}>💡</span>
                <span style={{ fontSize: 12.5, color: '#92400E', lineHeight: 1.5 }}>
                  Este funnel tiene {valid} etapas. La mayoría de los procesos se resuelven con <strong>3 a 5</strong>. Si hay pasos como "preguntar nombre" o "validar dato", el agente los maneja dentro de cada etapa — no es necesaria una etapa por acción.
                </span>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => onCreate(stages)}
              disabled={valid === 0}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9, padding: '13px 28px', borderRadius: 100,
                background: valid === 0 ? '#E2E8F0' : PRIMARY, border: 'none', color: valid === 0 ? '#94A3B8' : 'white',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: valid === 0 ? 'default' : 'pointer',
                boxShadow: valid === 0 ? 'none' : '0 4px 20px -4px rgba(48,79,254,0.45)', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (valid > 0) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Crear funnel con {valid} {valid === 1 ? 'etapa' : 'etapas'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Process type onboarding ──────────────────────────────────────────────────

const PROCESS_TYPES = [
  { id: 'leads',     emoji: '🎯', label: 'Seguimiento de leads',   desc: 'Calificación, demos y cierre de oportunidades' },
  { id: 'pedidos',   emoji: '🍕', label: 'Toma de pedidos',        desc: 'Recepcionar, confirmar y entregar pedidos' },
  { id: 'soporte',   emoji: '🎧', label: 'Soporte al cliente',     desc: 'Triage, diagnóstico y resolución de tickets' },
  { id: 'cobranzas', emoji: '💳', label: 'Cobranzas',              desc: 'Recordatorios y acuerdos de pago' },
  { id: 'agenda',    emoji: '📅', label: 'Agendamiento',           desc: 'Reservas, confirmaciones y recordatorios' },
  { id: 'otro',      emoji: '✨', label: 'Otro proceso',           desc: 'Empezar desde cero con un canvas vacío' },
]

const PROCESS_TEMPLATES: Record<string, () => { nodes: AnyNode[]; edges: Edge[] }> = {
  leads:     () => TEMPLATES.find(t => t.id === 'ventas')!.build(),
  pedidos:   () => TEMPLATES.find(t => t.id === 'pedidos')!.build(),
  soporte:   () => TEMPLATES.find(t => t.id === 'soporte')!.build(),
  cobranzas: () => TEMPLATES.find(t => t.id === 'cobranzas')!.build(),
  agenda:    () => ({
    nodes: [
      { id: 'start', type: 'startNode', position: { x: 80, y: 220 }, data: { onAddNext: () => {} } as any },
      mkState('req',  'Request received',  280,  '#3B82F6', 'simple', ['whatsapp']),
      mkState('slot', 'Slot selection',    580,  '#EAB308', 'complex', ['calendar']),
      mkState('conf', 'Confirmed',         880,  '#9333EA', 'complex', ['gmail', 'whatsapp']),
      mkState('done', 'Attended',          1180, '#16A34A', 'final'),
    ],
    edges: [mkEdge('start', 'req'), mkEdge('req', 'slot'), mkEdge('slot', 'conf'), mkEdge('conf', 'done')],
  }),
  otro: () => TEMPLATES.find(t => t.id === 'blank')!.build(),
}

function ProcessTypePicker({ onPick }: { onPick: (ptId: string, tpl: { nodes: AnyNode[]; edges: Edge[] }) => void }) {
  return (
    <div style={{
      width: '100%', minHeight: 600, height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40, background: '#F8FAFC',
      fontFamily: 'Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 680, width: '100%' }}>
        <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Nuevo funnel
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          ¿Qué proceso de negocio querés gestionar?
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#64748B' }}>
          El agente va a mover a los usuarios por los estados de este proceso automáticamente.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {PROCESS_TYPES.map(pt => (
            <button
              key={pt.id}
              onClick={() => onPick(pt.id, PROCESS_TEMPLATES[pt.id]())}
              style={{
                textAlign: 'left', cursor: 'pointer', padding: '16px 18px',
                borderRadius: 12, background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                transition: 'border-color 140ms, box-shadow 200ms, transform 140ms',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.boxShadow = `0 8px 24px -8px rgba(48,79,254,0.20)`; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{ fontSize: 24 }}>{pt.emoji}</span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{pt.label}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 3, lineHeight: 1.45 }}>{pt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Variant chooser ───────────────────────────────────────────────────────────

function VariantChooser({ onPick }: { onPick: (v: 'classic' | 'unified') => void }) {
  return (
    <div style={{
      width: '100%', minHeight: 600, height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40, background: '#F8FAFC',
      fontFamily: 'Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 980, width: '100%' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Choose how you want to view the workflow</h2>
        <p style={{ margin: '6px 0 28px', fontSize: 14, color: '#64748B', maxWidth: 640 }}>
          Two different views of the same agent. Try them and keep the one that works best for your team.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Classic */}
          <button
            onClick={() => onPick('classic')}
            style={{
              textAlign: 'left', cursor: 'pointer',
              padding: 22, borderRadius: 14,
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
              transition: 'border-color 140ms, box-shadow 240ms, transform 140ms',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(48,79,254,0.20)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                padding: '2px 7px', borderRadius: 5,
                background: '#F1F5F9', color: '#475569',
                fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>Option 1</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Classic view</span>
            </div>
            {/* Visual preview */}
            <div style={{
              padding: 14, background: '#F8FAFC', borderRadius: 10,
              border: '1px dashed #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}>
              <div style={{
                width: 78, padding: '8px 10px', background: '#FFFFFF', borderRadius: 6,
                border: '1px solid #E2E8F0', fontSize: 10, fontWeight: 700, color: '#0F172A',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', marginBottom: 4 }} />
                Simple
              </div>
              <span style={{ color: '#94A3B8' }}>→</span>
              <div style={{
                width: 92, padding: '8px 10px', background: '#FFFFFF', borderRadius: 6,
                border: `1.5px solid ${PRIMARY}`, fontSize: 10, fontWeight: 700, color: '#0F172A',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
                  <span style={{
                    padding: '1px 4px', borderRadius: 3,
                    background: '#EEF0FF', color: PRIMARY,
                    fontSize: 7.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
                  }}>Adv</span>
                </div>
                <div style={{ marginTop: 4 }}>Advanced</div>
              </div>
              <span style={{ color: '#94A3B8' }}>→</span>
              <div style={{
                padding: '6px 12px', background: '#FFFFFF', borderRadius: 100,
                border: '1.5px solid #16A34A', fontSize: 10, fontWeight: 700, color: '#15803D',
              }}>Final</div>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#475569' }}>
              <strong>Simple</strong> and <strong>advanced</strong> states coexist and look different. Advanced ones show a mini-flow and open the logic editor.
            </p>
            <div style={{
              alignSelf: 'flex-start',
              padding: '8px 14px', borderRadius: 8,
              background: PRIMARY, color: '#FFFFFF',
              fontSize: 13, fontWeight: 700,
            }}>Use classic view →</div>
          </button>

          {/* Unified */}
          <button
            onClick={() => onPick('unified')}
            style={{
              textAlign: 'left', cursor: 'pointer',
              padding: 22, borderRadius: 14,
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
              transition: 'border-color 140ms, box-shadow 240ms, transform 140ms',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(48,79,254,0.20)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                padding: '2px 7px', borderRadius: 5,
                background: '#F1F5F9', color: '#475569',
                fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>Option 2</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Unified view</span>
            </div>
            {/* Visual preview */}
            <div style={{
              padding: 14, background: '#F8FAFC', borderRadius: 10,
              border: '1px dashed #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}>
              <div style={{
                width: 78, padding: '8px 10px', background: '#FFFFFF', borderRadius: 6,
                border: '1px solid #E2E8F0', fontSize: 10, fontWeight: 700, color: '#0F172A',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', marginBottom: 4 }} />
                State
              </div>
              <span style={{ color: '#94A3B8' }}>→</span>
              <div style={{
                width: 78, padding: '8px 10px', background: '#FFFFFF', borderRadius: 6,
                border: '1px solid #E2E8F0', fontSize: 10, fontWeight: 700, color: '#0F172A',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', marginBottom: 4 }} />
                State
              </div>
              <span style={{ color: '#94A3B8' }}>→</span>
              <div style={{
                padding: '6px 12px', background: '#FFFFFF', borderRadius: 100,
                border: '1.5px solid #16A34A', fontSize: 10, fontWeight: 700, color: '#15803D',
              }}>Final</div>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#475569' }}>
              All states look <strong>the same</strong>. When you enter one, you see the state logic and a fixed settings panel on the right.
            </p>
            <div style={{
              alignSelf: 'flex-start',
              padding: '8px 14px', borderRadius: 8,
              background: PRIMARY, color: '#FFFFFF',
              fontSize: 13, fontWeight: 700,
            }}>Use unified view →</div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Exported wrapper ──────────────────────────────────────────────────────────

export interface WorkflowCanvasProps {
  onOpenKanban?: () => void
  initialVariant?: 'classic' | 'unified'
  onToggleSidebar?: () => void
  agentName?: string
  connectedToOrchestrator?: boolean
  orchestratorName?: string
  initialNodes?: AnyNode[]
  initialEdges?: Edge[]
}

export default function WorkflowCanvas({ onOpenKanban, initialVariant, onToggleSidebar, agentName, connectedToOrchestrator, orchestratorName, initialNodes: seedNodes, initialEdges: seedEdges }: WorkflowCanvasProps) {
  // step: null = process picker (only shown on fresh new workflow, no initial data)
  // 'variant' = variant chooser (legacy, still shown when no initialVariant)
  // 'canvas' = canvas ready
  type Step = 'variant' | 'canvas'
  const hasSeeds = !!(seedNodes && seedNodes.length > 0)
  const [step, setStep] = useState<Step>('canvas')
  const [variant, setVariant] = useState<'classic' | 'unified'>(initialVariant ?? 'unified')
  // Empty canvas: solo el nodo de inicio cuando no hay seeds
  const [chosenNodes] = useState<AnyNode[] | undefined>(seedNodes ?? [START_NODE])
  const [chosenEdges] = useState<Edge[] | undefined>(seedEdges ?? [])

  if (step === 'variant') {
    return <VariantChooser onPick={v => { setVariant(v) }} />
  }

  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner
        variant={variant}
        onChangeVariant={() => setStep('variant')}
        onOpenKanban={onOpenKanban}
        onToggleSidebar={onToggleSidebar}
        agentName={agentName}
        connectedToOrchestrator={connectedToOrchestrator}
        orchestratorName={orchestratorName}
        seedNodes={chosenNodes}
        seedEdges={chosenEdges}
        onReconfigure={undefined}
      />
    </ReactFlowProvider>
  )
}
