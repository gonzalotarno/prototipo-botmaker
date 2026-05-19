import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
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
import { Plus, AlertCircle, Trash2, Settings, LayoutGrid, Maximize2, Sparkles, MoreVertical, Braces, ChevronDown, MessageSquare, GitBranch, RotateCcw, Play, Search, MousePointer2, Hand, Undo2, Redo2, Map as MapIcon } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type FieldType = 'text' | 'email' | 'number' | 'date' | 'phone' | 'url' | 'enum'

interface RequiredField {
  id: string
  name: string
  description: string
  type?: FieldType
  maxLength?: number
  pattern?: string
  enumValues?: string[]
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

type StateNodeData = Record<string, unknown> & {
  name: string
  description: string
  color: string
  requiresHuman: boolean
  requiredData: RequiredField[]
  kind: 'simple' | 'complex' | 'final'
  isDisconnected?: boolean
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

// ─── Initial data ──────────────────────────────────────────────────────────────

const INITIAL_NODES: AnyNode[] = [
  { id: 'start',  type: 'startNode',  position: { x: 80,  y: 220 }, data: { onAddNext: () => {} } as any },
  { id: 's_todo', type: 'stateNode',  position: { x: 280, y: 195 }, data: { name: 'Evaluación inicial', description: 'Recopila los datos básicos del cliente antes de avanzar al triage.', color: '#16A34A', requiresHuman: false, requiredData: [], kind: 'simple', onEdit: () => {}, onAddNext: () => {} } as any },
  { id: 's_doing',type: 'stateNode',  position: { x: 700, y: 195 }, data: { name: 'Atención avanzada', description: '', color: '#3B82F6', requiresHuman: true,  requiredData: [], kind: 'complex', onEdit: () => {}, onAddNext: () => {} } as any },
  { id: 's_done', type: 'stateNode',  position: { x: 1120, y: 220 }, data: { name: 'Resuelto', description: '', color: '#16A34A', requiresHuman: false, requiredData: [], kind: 'final',  onEdit: () => {}, onAddNext: () => {} } as any },
]

// ─── Workflow Templates ────────────────────────────────────────────────────────

interface Template {
  id: string
  name: string
  emoji: string
  description: string
  build: () => { nodes: AnyNode[]; edges: Edge[] }
}

function mkState(id: string, name: string, x: number, color: string, kind: 'simple' | 'complex' | 'final' = 'simple'): AnyNode {
  return {
    id, type: 'stateNode', position: { x, y: 200 },
    data: { name, description: '', color, requiresHuman: false, requiredData: [], kind, onEdit: () => {}, onAddNext: () => {} } as any,
  }
}
function mkEdge(source: string, target: string): Edge {
  return { id: `e-${source}-${target}`, source, target, type: 'conditionEdge' }
}

const START_NODE: AnyNode = { id: 'start', type: 'startNode', position: { x: 80, y: 220 }, data: { onAddNext: () => {} } as any }

const TEMPLATES: Template[] = [
  {
    id: 'blank', name: 'Empezar de cero', emoji: '✨',
    description: 'Un workflow vacío con Inicio + Todo + Done',
    build: () => ({
      nodes: [START_NODE, mkState('s1', 'Todo', 280, '#3B82F6'), mkState('s2', 'Done', 580, '#16A34A', 'final')],
      edges: [mkEdge('start', 's1'), mkEdge('s1', 's2')],
    }),
  },
  {
    id: 'soporte', name: 'Triage de soporte', emoji: '🎧',
    description: 'Evaluación inicial → triage → atención por prioridad',
    build: () => ({
      nodes: [
        START_NODE,
        mkState('eval', 'Evaluación inicial', 280, '#16A34A'),
        mkState('triage', 'Triage en proceso', 580, '#3B82F6'),
        mkState('baja', 'Urgencia baja', 880, '#EAB308'),
        mkState('media', 'Urgencia media', 880, '#9333EA'),
        mkState('alta', 'Urgencia alta', 880, '#0F766E'),
        mkState('atendido', 'Atendido', 1180, '#EC4899', 'final'),
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
    id: 'ventas', name: 'Funnel de ventas', emoji: '💼',
    description: 'Lead → calificado → demo → propuesta → cierre',
    build: () => ({
      nodes: [
        START_NODE,
        mkState('lead', 'Lead nuevo', 280, '#3B82F6'),
        mkState('qual', 'Calificado', 580, '#EAB308'),
        mkState('demo', 'Demo agendada', 880, '#9333EA'),
        mkState('prop', 'Propuesta enviada', 1180, '#0F766E'),
        mkState('won', 'Ganado', 1480, '#16A34A', 'final'),
        mkState('lost', 'Perdido', 1480, '#DC2626', 'final'),
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
    id: 'cobranzas', name: 'Cobranzas', emoji: '💳',
    description: 'Recordatorios escalonados hasta acuerdo de pago',
    build: () => ({
      nodes: [
        START_NODE,
        mkState('aviso', 'Aviso amistoso', 280, '#3B82F6'),
        mkState('r1', 'Recordatorio 1', 580, '#EAB308'),
        mkState('r2', 'Recordatorio 2', 880, '#F59E0B'),
        mkState('plan', 'Plan de pago', 1180, '#9333EA'),
        mkState('pagado', 'Pagado', 1480, '#16A34A', 'final'),
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
    id: 'pedidos', name: 'Toma de pedidos', emoji: '🍕',
    description: 'Pedido → confirmación → preparación → entrega',
    build: () => ({
      nodes: [
        START_NODE,
        mkState('orden', 'Pedido tomado', 280, '#3B82F6'),
        mkState('pago', 'Pago confirmado', 580, '#EAB308'),
        mkState('coc', 'En preparación', 880, '#F59E0B'),
        mkState('cam', 'En camino', 1180, '#9333EA'),
        mkState('ent', 'Entregado', 1480, '#16A34A', 'final'),
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
    id: 'onboarding', name: 'Onboarding de clientes', emoji: '🎯',
    description: 'Bienvenida → setup → primer valor → activado',
    build: () => ({
      nodes: [
        START_NODE,
        mkState('bien', 'Bienvenida', 280, '#3B82F6'),
        mkState('setup', 'Setup inicial', 580, '#EAB308'),
        mkState('valor', 'Primer valor', 880, '#9333EA'),
        mkState('act', 'Cliente activado', 1180, '#16A34A', 'final'),
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
  { id: 'e-start-todo',  source: 'start',   target: 's_todo',  type: 'conditionEdge' },
  { id: 'e-todo-doing',  source: 's_todo',  target: 's_doing', type: 'conditionEdge' },
  { id: 'e-doing-done',  source: 's_doing', target: 's_done',  type: 'conditionEdge' },
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
      Inicio
      <Handle type="source" position={Position.Right} style={{ background: PRIMARY, width: 8, height: 8, border: 'none' }} />
    </div>
  )
}

// ─── State Node (the main card) ────────────────────────────────────────────────

function StateNode({ id, data }: NodeProps<Node<StateNodeData>>) {
  const { name, description, color: dotColor, isDisconnected, requiresHuman, kind, onEdit } = data
  const hasFlow = kind === 'complex'
  const isFinal = kind === 'final'

  return (
    <div
      onClick={() => onEdit(id)}
      style={{
        width: 300,
        padding: '12px 16px',
        background: '#FFFFFF',
        border: `1.5px solid ${isDisconnected ? '#F59E0B' : '#E2E8F0'}`,
        borderRadius: 10,
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 140ms ease-out, box-shadow 320ms ease-out',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(48,79,254,0.18)'; e.currentTarget.style.borderColor = isDisconnected ? '#F59E0B' : '#C7D2FE' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)'; e.currentTarget.style.borderColor = isDisconnected ? '#F59E0B' : '#E2E8F0' }}
    >
      <Handle type="target" position={Position.Left} style={{ background: PRIMARY, width: 8, height: 8, border: 'none' }} />

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <span style={{ flex: 1, fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
        {requiresHuman && (
          <span title="Requiere confirmación humana" style={{ width: 16, height: 16, borderRadius: '50%', background: '#FEF3C7', color: '#B45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={11} />
          </span>
        )}
        {hasFlow && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 4, background: '#EEF0FF', color: PRIMARY, fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' as const, flexShrink: 0 }}>
            <GitBranch size={8} /> Flujo
          </span>
        )}
        {isFinal && (
          <span style={{ padding: '2px 6px', borderRadius: 4, background: '#DCFCE7', color: '#15803D', fontFamily: 'Roboto, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' as const, flexShrink: 0 }}>
            🏁 Final
          </span>
        )}
      </div>

      {/* Instructions preview */}
      {description && (
        <p style={{ margin: '6px 0 0', fontFamily: 'Roboto, sans-serif', fontSize: 12, lineHeight: 1.45, color: '#64748B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {description}
        </p>
      )}

      <Handle type="source" position={Position.Right} style={{ background: PRIMARY, width: 8, height: 8, border: 'none' }} />

      {/* + button to add next state */}
      <button
        onClick={e => { e.stopPropagation(); data.onAddNext(id) }}
        title="Agregar siguiente estado"
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

function EditStateDrawer({
  node, onClose, onSave, onDelete, onOpenAdvanced, onMakeFinal,
}: {
  node: Node<StateNodeData>
  onClose: () => void
  onSave: (id: string, patch: Partial<StateNodeData>) => void
  onDelete: (id: string) => void
  onOpenAdvanced: (id: string) => void
  onMakeFinal: (id: string) => void
}) {
  // Reset state when the node id changes (switching between cards keeps the drawer open)
  const [name, setName] = useState(node.data.name)
  const [description, setDescription] = useState(node.data.description)
  const [color, setColor] = useState(node.data.color)
  const [requiresHuman, setRequiresHuman] = useState(node.data.requiresHuman)
  const [requiredData, setRequiredData] = useState<RequiredField[]>(node.data.requiredData ?? [])
  const [colorOpen, setColorOpen] = useState(false)

  // Sync state with new node when user clicks a different one
  useEffect(() => {
    setName(node.data.name)
    setDescription(node.data.description)
    setColor(node.data.color)
    setRequiresHuman(node.data.requiresHuman)
    setRequiredData(node.data.requiredData ?? [])
  }, [node.id]) // eslint-disable-line

  useEffect(() => {
    onSave(node.id, { name, description, color, requiresHuman, requiredData })
  }, [name, description, color, requiresHuman, requiredData.length]) // eslint-disable-line

  const hasFlow = node.data.kind === 'complex'

  const handleFlowAction = () => {
    if (!hasFlow) {
      onSave(node.id, { name, description, color, requiresHuman, requiredData, kind: 'complex' })
    }
    onOpenAdvanced(node.id)
  }

  return (
    <aside
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', top: 16, right: 16, bottom: 16, zIndex: 30,
        width: 420,
        background: '#FFFFFF',
        borderRadius: 14,
        border: '1px solid #E2E8F0',
        boxShadow: '0 24px 60px -12px rgba(15,23,42,0.18)',
        fontFamily: 'Roboto, sans-serif',
        display: 'flex', flexDirection: 'column',
        animation: 'wfDrawerSlide 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <style>{`@keyframes wfDrawerSlide{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}`}</style>
      {/* Drawer header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name || 'Estado sin nombre'}</span>
        </div>
        <button onClick={onClose} title="Cerrar (Esc)" style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >✕</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Body */}
        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name with inline color swatch */}
          <Field label="Nombre del estado">
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
              {/* Color swatch (small, secondary) */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setColorOpen(o => !o)}
                  title="Color visual del estado (decorativo)"
                  style={{
                    height: '100%', minHeight: 38,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '0 10px', borderRadius: 8,
                    background: '#FFFFFF', border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
                  <ChevronDown size={12} color="#94A3B8" />
                </button>
                {colorOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 5,
                    padding: 10, background: '#FFFFFF', borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 12px 28px -8px rgba(15,23,42,0.18)',
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
                    minWidth: 180,
                  }}>
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => { setColor(c); setColorOpen(false) }}
                        style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: c, border: 'none', cursor: 'pointer', padding: 0,
                          outline: color === c ? `2px solid ${PRIMARY}` : 'none',
                          outlineOffset: 2,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Name input */}
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </Field>

          {/* Instructions */}
          <Field label="Instrucciones del estado">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describí cómo el agente debe comportarse en este estado"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 86, lineHeight: 1.5, fontFamily: 'inherit' }}
            />
          </Field>

          {/* Add / Edit flow CTA */}
          <button
            onClick={handleFlowAction}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', borderRadius: 12,
              background: hasFlow ? '#EFF0FF' : '#FAFBFD',
              border: `1px solid ${hasFlow ? '#C7D2FE' : '#E2E8F0'}`,
              cursor: 'pointer', textAlign: 'left', width: '100%',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EFF0FF'; e.currentTarget.style.borderColor = '#C7D2FE' }}
            onMouseLeave={e => { e.currentTarget.style.background = hasFlow ? '#EFF0FF' : '#FAFBFD'; e.currentTarget.style.borderColor = hasFlow ? '#C7D2FE' : '#E2E8F0' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: hasFlow ? PRIMARY : '#E2E8F0', color: hasFlow ? '#FFFFFF' : '#64748B',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'background 150ms',
              }}>
                <GitBranch size={14} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                  {hasFlow ? 'Editar flujo del estado' : 'Agregar flujo al estado'}
                </span>
                <span style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                  {hasFlow ? 'Este estado tiene un flujo configurado' : 'Condicionales, pasos y llamadas dentro del estado'}
                </span>
              </div>
            </div>
            <span style={{ color: hasFlow ? PRIMARY : '#94A3B8', fontSize: 18, fontWeight: 700, marginLeft: 8 }}>→</span>
          </button>

          {/* Requires human */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Requiere confirmación humana</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Agrega un equipo o persona que confirme el cambio de workflow</div>
            </div>
            <Toggle on={requiresHuman} onChange={setRequiresHuman} />
          </div>

          {/* Required data */}
          <RequiredDataSection
            fields={requiredData}
            onChange={setRequiredData}
          />

          {/* Mark as final state */}
          <button
            onClick={() => { onMakeFinal(node.id); onClose() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 14px', borderRadius: 10,
              background: 'transparent', border: '1.5px dashed #CBD5E1',
              color: '#475569', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#16A34A'; e.currentTarget.style.color = '#15803D' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#475569' }}
          >🏁 Marcar como estado final</button>
        </div>
        </div>{/* end scrollable */}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 14, borderTop: '1px solid #E2E8F0', background: '#FAFBFD',
          borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
        }}>
          <button
            onClick={() => { onDelete(node.id); onClose() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 100,
              background: '#FFFFFF', border: '1px solid #FECACA',
              color: '#DC2626', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}
          ><Trash2 size={14} /> Eliminar</button>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px', borderRadius: 100,
              background: '#FFFFFF', border: `1px solid ${PRIMARY}`,
              color: PRIMARY, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}
          >Cerrar</button>
        </div>
    </aside>
  )
}

// ─── Required Data — card-based (per CEO image #17) ────────────────────────────

function RequiredDataSection({
  fields, onChange,
}: {
  fields: RequiredField[]
  onChange: (fields: RequiredField[]) => void
}) {
  const add = () => onChange([...fields, { id: `f_${Date.now()}`, name: 'Nuevo dato', description: '' }])
  const update = (id: string, patch: Partial<RequiredField>) =>
    onChange(fields.map(f => f.id === id ? { ...f, ...patch } : f))
  const remove = (id: string) => onChange(fields.filter(f => f.id !== id))
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Datos requeridos en este estado</div>
      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 12 }}>Estos datos deben completarse durante este workflow</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fields.map(field => (
          <RequiredDataCard key={field.id} field={field} onUpdate={update} onRemove={remove} />
        ))}
        <button
          onClick={add}
          style={{
            padding: '12px 16px', borderRadius: 10,
            background: 'transparent', border: '1.5px dashed #CBD5E1',
            color: PRIMARY, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            textAlign: 'left',
          }}
        >+ Agregar dato</button>
      </div>
    </div>
  )
}

function RequiredDataCard({
  field, onUpdate, onRemove,
}: {
  field: RequiredField
  onUpdate: (id: string, patch: Partial<RequiredField>) => void
  onRemove: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [validationOpen, setValidationOpen] = useState(false)
  const type = field.type ?? 'text'
  const insertVariable = () => {
    onUpdate(field.id, { description: (field.description || '') + ' {{variable}}' })
  }
  const hasValidation = field.maxLength != null || (field.pattern && field.pattern.length > 0) || (field.enumValues && field.enumValues.length > 0)
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 10,
      background: '#FFFFFF', border: '1px solid #E2E8F0',
      position: 'relative',
    }}>
      {/* Top row: name + obligatorio + menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          value={field.name}
          onChange={e => onUpdate(field.id, { name: e.target.value })}
          placeholder="Nombre del dato"
          style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#0F172A',
            padding: 0,
          }}
        />
        <span style={{
          padding: '3px 9px', borderRadius: 5,
          background: '#EEF0FF', color: '#5B49D6',
          fontFamily: 'inherit', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
        }}>Obligatorio</span>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              width: 22, height: 22, borderRadius: 6,
              border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          ><MoreVertical size={14} /></button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 5,
              minWidth: 160, padding: 4,
              background: '#FFFFFF', borderRadius: 10,
              border: '1px solid #E2E8F0',
              boxShadow: '0 12px 28px -8px rgba(15,23,42,0.18)',
            }}>
              <button onClick={() => { onRemove(field.id); setMenuOpen(false) }} style={menuItem}>Eliminar</button>
            </div>
          )}
        </div>
      </div>
      {/* Description textarea */}
      <textarea
        value={field.description}
        onChange={e => onUpdate(field.id, { description: e.target.value })}
        placeholder="Describe el dato que IA interpretará"
        rows={2}
        style={{
          width: '100%', boxSizing: 'border-box', marginTop: 6,
          padding: 0, border: 'none', background: 'transparent', outline: 'none', resize: 'vertical',
          fontFamily: 'inherit', fontSize: 13, lineHeight: 1.45, color: '#475569',
          minHeight: 36,
        }}
      />
      {/* Type selector + validation + variable */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px dashed #E2E8F0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {/* Tipo selector — native select keeps it small */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 6,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            fontFamily: 'inherit', fontSize: 11, color: '#475569', fontWeight: 600,
          }}>
            Tipo:
            <select
              value={type}
              onChange={e => onUpdate(field.id, { type: e.target.value as FieldType })}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'inherit', fontSize: 11, color: '#0F172A', fontWeight: 700, cursor: 'pointer',
              }}
            >
              {FIELD_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <button
            onClick={() => setValidationOpen(o => !o)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 6,
              background: hasValidation ? '#EFF0FF' : 'transparent', border: 'none',
              color: hasValidation ? PRIMARY : '#64748B', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Settings size={10} /> Validación{hasValidation ? ' ●' : ''} {validationOpen ? '▴' : '▾'}
          </button>
        </div>
        <button
          onClick={insertVariable}
          title="Insertar variable"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 6,
            background: '#F1F5F9', border: 'none',
            color: '#475569', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9' }}
        ><Braces size={11} /> Variable</button>
      </div>
      {/* Validation panel */}
      {validationOpen && (
        <div style={{
          marginTop: 8, padding: 12, borderRadius: 8,
          background: '#FAFBFD', border: '1px solid #E2E8F0',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {type === 'enum' ? (
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Opciones permitidas (una por línea)</label>
              <textarea
                value={(field.enumValues ?? []).join('\n')}
                onChange={e => onUpdate(field.id, { enumValues: e.target.value.split('\n').filter(Boolean) })}
                placeholder={'Alto\nMedio\nBajo'}
                rows={3}
                style={{ ...inputStyle, padding: 8, fontFamily: 'inherit', fontSize: 12.5, minHeight: 64, resize: 'vertical' }}
              />
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Largo máximo</label>
                  <input
                    type="number"
                    value={field.maxLength ?? ''}
                    onChange={e => onUpdate(field.id, { maxLength: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Sin límite"
                    style={{ ...inputStyle, padding: 8, fontSize: 12.5 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Patrón (regex)</label>
                  <input
                    value={field.pattern ?? ''}
                    onChange={e => onUpdate(field.id, { pattern: e.target.value })}
                    placeholder="^[A-Z]{3}$"
                    style={{ ...inputStyle, padding: 8, fontSize: 12.5, fontFamily: 'monospace' }}
                  />
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>
                El tipo "<strong>{FIELD_TYPES.find(t => t.id === type)?.label}</strong>" ya valida el formato base. Usá patrón regex solo si necesitás una restricción extra.
              </div>
            </>
          )}
        </div>
      )}
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
  variant, onOpenKanban, onChangeVariant,
}: {
  variant: 'classic' | 'unified'
  onOpenKanban?: () => void
  onChangeVariant: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [advancedId, setAdvancedId] = useState<string | null>(null)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState<AnyNode>(INITIAL_NODES as any)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES)

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
        data: { ...n.data, isDisconnected, onEdit: setEditingId, onAddNext: handleAddNext, onOpenAdvanced: setAdvancedId },
      }
    }
    return n
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [nodes, reachable])

  const nodeTypes = useMemo(() => ({
    startNode: StartNode,
    stateNode: StateNode,
  }), [])

  const edgeTypes = useMemo(() => ({
    conditionEdge: ConditionEdge,
  }), [])

  const onConnect = useCallback((params: Connection) =>
    setEdges(eds => addEdge({ ...params, ...edgeDefaults }, eds)), [setEdges])

  function handleAddNext(fromId: string) {
    const src = nodes.find(n => n.id === fromId)
    if (!src) return
    const newId = `s_${Date.now()}`
    const newNode: AnyNode = {
      id: newId, type: 'stateNode',
      position: { x: (src.position.x ?? 0) + 380, y: (src.position.y ?? 0) },
      data: { name: 'Nuevo estado', description: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], requiresHuman: false, requiredData: [], kind: 'simple', onEdit: () => {}, onAddNext: () => {} } as any,
    }
    setNodes(ns => [...ns, newNode])
    setEdges(es => [...es, { id: `e-${fromId}-${newId}`, source: fromId, target: newId, ...edgeDefaults }])
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 600 }}>
      {/* Top-right toolbar */}
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <ToolbarBtn icon={<Sparkles size={14} />} onClick={() => setTemplatesOpen(true)}>Plantillas</ToolbarBtn>
        <ToolbarBtn icon={<Settings size={14} />}>Ajustes del workflow</ToolbarBtn>
        <ToolbarBtn icon={<LayoutGrid size={14} />} onClick={onChangeVariant}>
          {variant === 'unified' ? 'Vista: Unificada' : 'Vista: Clásica'}
        </ToolbarBtn>
        <ToolbarBtn icon={<LayoutGrid size={14} />} primary onClick={onOpenKanban}>Ver tablero</ToolbarBtn>
        <ToolbarBtn icon={<Maximize2 size={14} />} square />
      </div>

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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={edgeDefaults}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable
        elementsSelectable
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#CBD5E1" />
      </ReactFlow>

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
          onClose={() => setEditingId(null)}
          onSave={updateState}
          onDelete={deleteState}
          onMakeFinal={(id) => updateState(id, { kind: 'final' })}
          onOpenAdvanced={(id) => { setEditingId(null); setAdvancedId(id) }}
        />
      )}

      {/* Templates picker */}
      {templatesOpen && (
        <TemplatesModal onClose={() => setTemplatesOpen(false)} onPick={applyTemplate} />
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
          />
        )
      })()}
    </div>
  )
}

// ─── Advanced Editor Overlay (Lógica editor) ───────────────────────────────────

function AdvancedEditorOverlay({
  node, onClose, onSave, onConvertToSimple, pinSettings,
}: {
  node: Node<StateNodeData>
  onClose: () => void
  onSave: (id: string, patch: Partial<StateNodeData>) => void
  onConvertToSimple: (id: string) => void
  pinSettings?: boolean
}) {
  const [name, setName] = useState(node.data.name)
  const [color, setColor] = useState(node.data.color)
  const [requiresHuman, setRequiresHuman] = useState(node.data.requiresHuman)
  const [requiredData, setRequiredData] = useState<RequiredField[]>(node.data.requiredData ?? [])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)

  useEffect(() => {
    onSave(node.id, { name, color, requiresHuman, requiredData })
  }, [name, color, requiresHuman, requiredData.length]) // eslint-disable-line

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      animation: 'wfSlide 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
    }}>
      <style>{`@keyframes wfSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header — minimal: back + state name pill + actions */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'transparent',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {/* Back arrow icon */}
          <button
            onClick={onClose}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              color: PRIMARY, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            }}
            title="Volver al workflow"
          >←</button>
          {/* State name pill (editable) */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10,
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          }}>
            {/* Color swatch */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setColorOpen(o => !o)}
                title="Color (decorativo)"
                style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: color, border: 'none', cursor: 'pointer', padding: 0,
                }}
              />
              {colorOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: -10, zIndex: 5,
                  padding: 8, background: '#FFFFFF', borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 12px 28px -8px rgba(15,23,42,0.18)',
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6,
                }}>
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => { setColor(c); setColorOpen(false) }}
                      style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: c, border: 'none', cursor: 'pointer', padding: 0,
                        outline: color === c ? `2px solid ${PRIMARY}` : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                padding: 0, border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: '#0F172A',
                minWidth: 120,
              }}
            />
          </div>
          {/* Settings gear — only when the panel is not already pinned to the side */}
          {!pinSettings && (
            <button
              onClick={() => setSettingsOpen(true)}
              title="Configuración del estado (datos requeridos, etc.)"
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                color: '#475569', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
              }}
            ><Settings size={16} /></button>
          )}
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
          >Volver a simple</button>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10,
            background: '#FFFFFF', border: `1px solid ${PRIMARY}`,
            color: PRIMARY, fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          }}><Play size={13} /> Probar flujo</button>
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
              placeholder="Buscar ..."
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
        <AdvancedFlow />

        {/* Right-side node palette (per Image #18) */}
        <div style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <PaletteCard label="Instrucción" icon={<MessageSquare size={14} />} color={PRIMARY} />
          <PaletteCard label="Condición"   icon={<GitBranch    size={14} />} color="#D97706" />
          <PaletteCard label="Bucle"       icon={<RotateCcw    size={14} />} color="#0891B2" />
        </div>

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
            width: 380, flexShrink: 0,
            background: '#FFFFFF',
            borderLeft: '1px solid #E2E8F0',
            padding: '20px 22px',
            overflow: 'auto',
            display: 'flex', flexDirection: 'column', gap: 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontFamily: 'Roboto, sans-serif', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Configuración del estado</h3>
              <span style={{
                padding: '2px 7px', borderRadius: 5,
                background: '#EEF0FF', color: PRIMARY,
                fontFamily: 'Roboto, sans-serif', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>Unificado</span>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Roboto, sans-serif' }}>Requiere confirmación humana</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Antes de cambiar el workflow</div>
              </div>
              <Toggle on={requiresHuman} onChange={setRequiresHuman} />
            </div>

            <RequiredDataSection fields={requiredData} onChange={setRequiredData} />
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
          <h3 style={{ margin: 0, fontFamily: 'Roboto, sans-serif', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Configuración del estado</h3>
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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'Roboto, sans-serif' }}>Requiere confirmación humana</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Antes de cambiar el workflow</div>
          </div>
          <Toggle on={requiresHuman} onChange={setRequiresHuman} />
        </div>

        <RequiredDataSection fields={requiredData} onChange={setRequiredData} />
      </aside>
    </div>
  )
}

// ── Advanced flow nodes (match Image #18: Inicio pill + Instrucción rich card) ──

function InicioAdvNode() {
  return (
    <div style={{
      padding: '10px 22px',
      background: '#FFFFFF',
      border: `1.5px solid ${PRIMARY}`,
      borderRadius: 100,
      fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, color: PRIMARY,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      position: 'relative',
    }}>
      <MessageSquare size={14} />
      Inicio
      <Handle type="source" position={Position.Right} style={{ background: PRIMARY, width: 8, height: 8, border: 'none' }} />
    </div>
  )
}

type InstAdvData = Record<string, unknown> & { title: string; description: string; warning?: string }

function InstructionAdvNode({ data }: NodeProps<Node<InstAdvData>>) {
  return (
    <div style={{ width: 380, position: 'relative' }}>
      <Handle type="target" position={Position.Left} style={{ background: PRIMARY, width: 8, height: 8, border: 'none' }} />
      {/* Floating type tab */}
      <div style={{
        position: 'absolute', left: 0, top: -32,
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8,
        background: 'rgba(48,79,254,0.08)', color: PRIMARY,
        fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700,
      }}>
        <MessageSquare size={12} />
        Instrucción
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
        {/* Prompt textarea */}
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#94A3B8', lineHeight: 1.5,
            padding: '4px 0', minHeight: 40,
          }}>
            {data.description || 'Escribe lo que quieres que el agente haga'}
          </div>
          <div style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 11.5, color: '#94A3B8',
            paddingTop: 6, borderTop: '1px dashed #E2E8F0', marginTop: 4,
          }}>
            Escribe <strong>$</strong> o <strong>/</strong> para desplegar el menú de variables
          </div>
        </div>
        {/* Warning */}
        {data.warning && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px',
            background: '#FFFBEB', borderTop: '1px solid #FDE68A',
            fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#B45309',
          }}>
            <AlertCircle size={12} /> {data.warning}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: PRIMARY, width: 8, height: 8, border: 'none', top: 'calc(50% + 12px)' }} />
    </div>
  )
}

function AdvancedFlow() {
  const initialAdvancedNodes: Node[] = [
    { id: 'a-start', type: 'inicioAdv', position: { x: 80, y: 240 }, data: {} },
    {
      id: 'a-inst1', type: 'instAdv', position: { x: 260, y: 200 },
      data: { title: 'Datos del usuario', description: '', warning: 'Mejoras pendientes' },
    },
  ]
  const initialAdvancedEdges: Edge[] = [
    { id: 'ae-1', source: 'a-start', target: 'a-inst1', type: 'smoothstep' },
  ]
  const advNodeTypes = useMemo(() => ({
    inicioAdv: InicioAdvNode,
    instAdv: InstructionAdvNode,
  }), [])
  const [n, , onN] = useNodesState(initialAdvancedNodes)
  const [e, setE, onE] = useEdgesState(initialAdvancedEdges)
  const onConnect = useCallback((p: Connection) => setE(es => addEdge({ ...p, type: 'smoothstep' }, es)), [setE])
  return (
    <ReactFlow
      nodes={n}
      edges={e}
      nodeTypes={advNodeTypes}
      onNodesChange={onN}
      onEdgesChange={onE}
      onConnect={onConnect}
      defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#94A3B8', strokeWidth: 1.5 } }}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#CBD5E1" />
    </ReactFlow>
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
              Plantillas de workflow
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B', lineHeight: 1.5, maxWidth: 520 }}>
              Empezá con una estructura común y adaptala a tu caso. Reemplaza el workflow actual.
            </p>
          </div>
          <button onClick={onClose} title="Cerrar" style={{
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
          Las plantillas son un punto de partida — siempre podés agregar, modificar o eliminar estados después.
        </p>
      </div>
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
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Elegí cómo querés ver el workflow</h2>
        <p style={{ margin: '6px 0 28px', fontSize: 14, color: '#64748B', maxWidth: 640 }}>
          Dos vistas distintas del mismo agente. Probalas y quedate con la que sume más al equipo.
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
              }}>Opción 1</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Vista clásica</span>
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
                  }}>Avz</span>
                </div>
                <div style={{ marginTop: 4 }}>Avanzado</div>
              </div>
              <span style={{ color: '#94A3B8' }}>→</span>
              <div style={{
                padding: '6px 12px', background: '#FFFFFF', borderRadius: 100,
                border: '1.5px solid #16A34A', fontSize: 10, fontWeight: 700, color: '#15803D',
              }}>Final</div>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#475569' }}>
              Estados <strong>simples</strong> y <strong>avanzados</strong> conviven y se ven distinto. Los avanzados muestran un mini-flujo y abren el editor de lógica.
            </p>
            <div style={{
              alignSelf: 'flex-start',
              padding: '8px 14px', borderRadius: 8,
              background: PRIMARY, color: '#FFFFFF',
              fontSize: 13, fontWeight: 700,
            }}>Usar vista clásica →</div>
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
              }}>Opción 2</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Vista unificada</span>
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
                Estado
              </div>
              <span style={{ color: '#94A3B8' }}>→</span>
              <div style={{
                width: 78, padding: '8px 10px', background: '#FFFFFF', borderRadius: 6,
                border: '1px solid #E2E8F0', fontSize: 10, fontWeight: 700, color: '#0F172A',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', marginBottom: 4 }} />
                Estado
              </div>
              <span style={{ color: '#94A3B8' }}>→</span>
              <div style={{
                padding: '6px 12px', background: '#FFFFFF', borderRadius: 100,
                border: '1.5px solid #16A34A', fontSize: 10, fontWeight: 700, color: '#15803D',
              }}>Final</div>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#475569' }}>
              Todos los estados se ven <strong>iguales</strong>. Al entrar, ves la lógica del estado y el panel de configuración fijo a la derecha.
            </p>
            <div style={{
              alignSelf: 'flex-start',
              padding: '8px 14px', borderRadius: 8,
              background: PRIMARY, color: '#FFFFFF',
              fontSize: 13, fontWeight: 700,
            }}>Usar vista unificada →</div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Exported wrapper ──────────────────────────────────────────────────────────

export default function WorkflowCanvas({ onOpenKanban, initialVariant }: { onOpenKanban?: () => void; initialVariant?: 'classic' | 'unified' }) {
  const [variant, setVariant] = useState<'classic' | 'unified' | null>(initialVariant ?? null)
  if (!variant) return <VariantChooser onPick={setVariant} />
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner
        variant={variant}
        onChangeVariant={initialVariant ? () => {} : () => setVariant(null)}
        onOpenKanban={onOpenKanban}
      />
    </ReactFlowProvider>
  )
}
