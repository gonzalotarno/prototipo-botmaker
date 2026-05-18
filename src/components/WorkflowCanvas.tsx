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
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Plus, AlertCircle, Trash2, Settings, LayoutGrid, Maximize2, Sparkles, MoreVertical, Braces, ChevronDown } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RequiredField {
  id: string
  name: string
  description: string
}

type StateNodeData = Record<string, unknown> & {
  name: string
  description: string
  color: string
  requiresHuman: boolean
  requiredData: RequiredField[]
  kind: 'simple' | 'complex'
  isDisconnected?: boolean
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
  { id: 'start',  type: 'startNode',  position: { x: 80,  y: 200 }, data: { onAddNext: () => {} } as any },
  { id: 's_todo', type: 'stateNode',  position: { x: 280, y: 175 }, data: { name: 'Todo',  description: '', color: COLORS[0], requiresHuman: false, requiredData: [], kind: 'simple',  onEdit: () => {}, onAddNext: () => {} } as any },
  { id: 's_doing',type: 'stateNode',  position: { x: 580, y: 175 }, data: { name: 'Doing', description: '', color: COLORS[0], requiresHuman: true,  requiredData: [], kind: 'simple',  onEdit: () => {}, onAddNext: () => {} } as any },
  { id: 's_done', type: 'stateNode',  position: { x: 880, y: 175 }, data: { name: 'Done',  description: '', color: COLORS[0], requiresHuman: true,  requiredData: [], kind: 'simple',  onEdit: () => {}, onAddNext: () => {} } as any },
]

const INITIAL_EDGES: Edge[] = [
  { id: 'e-start-todo', source: 'start',   target: 's_todo', type: 'smoothstep' },
  // intentionally NOT connecting doing & done to show "disconnected" warning style
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
  const { name, description, color: dotColor, isDisconnected, requiresHuman, kind, onEdit, onOpenAdvanced } = data
  const isComplex = kind === 'complex'
  // For complex states: click opens advanced editor directly (no modal in between)
  const handleClick = () => isComplex ? onOpenAdvanced?.(id) : onEdit(id)
  return (
    <div
      onClick={handleClick}
      style={{
        width: 320,
        padding: '14px 16px',
        background: '#FFFFFF',
        border: `1.5px solid ${isDisconnected ? '#F59E0B' : isComplex ? PRIMARY : '#E2E8F0'}`,
        borderRadius: 10,
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 140ms ease-out, box-shadow 140ms ease-out',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(48,79,254,0.18)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)' }}
    >
      <Handle type="target" position={Position.Left} style={{ background: PRIMARY, width: 8, height: 8, border: 'none' }} />

      {/* Sparkle accent on complex (top-right corner mini glow) */}
      {isComplex && (
        <span aria-hidden style={{
          position: 'absolute', top: -7, right: -7,
          width: 20, height: 20, borderRadius: '50%',
          background: PRIMARY, color: '#FFFFFF',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px -2px rgba(48,79,254,0.45), 0 0 0 3px #FFFFFF',
        }}>
          <Sparkles size={11} />
        </span>
      )}

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <span style={{ flex: 1, fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
        {requiresHuman && (
          <span title="Requiere confirmación humana" style={{ width: 16, height: 16, borderRadius: '50%', background: '#FEF3C7', color: '#B45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={11} />
          </span>
        )}
      </div>

      {/* Description (simple only) */}
      {!isComplex && description && (
        <p style={{
          margin: '6px 0 0',
          fontFamily: 'Roboto, sans-serif', fontSize: 12, lineHeight: 1.45, color: '#64748B',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{description}</p>
      )}

      {/* Complex: single subtle "Editar flujo" hint at bottom */}
      {isComplex && (
        <div
          onClick={e => { e.stopPropagation(); onOpenAdvanced?.(id) }}
          style={{
            marginTop: 8, paddingTop: 8, borderTop: '1px dashed #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: 'Roboto, sans-serif', fontSize: 11.5, color: PRIMARY, fontWeight: 600,
          }}
        >
          <span>Editar flujo</span>
          <span>→</span>
        </div>
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
  type: 'smoothstep',
  style: { stroke: '#94A3B8', strokeWidth: 1.5 },
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────

function EditStateModal({
  node, onClose, onSave, onDelete, onOpenAdvanced,
}: {
  node: Node<StateNodeData>
  onClose: () => void
  onSave: (id: string, patch: Partial<StateNodeData>) => void
  onDelete: (id: string) => void
  onOpenAdvanced: (id: string) => void
}) {
  const [name, setName] = useState(node.data.name)
  const [description, setDescription] = useState(node.data.description)
  const [color, setColor] = useState(node.data.color)
  const [requiresHuman, setRequiresHuman] = useState(node.data.requiresHuman)
  const [requiredData, setRequiredData] = useState<RequiredField[]>(node.data.requiredData ?? [])
  const [colorOpen, setColorOpen] = useState(false)

  useEffect(() => {
    onSave(node.id, { name, description, color, requiresHuman, requiredData })
  }, [name, description, color, requiresHuman, requiredData.length]) // eslint-disable-line

  const handleConvertToAdvanced = () => {
    // Persist current basics + flip kind, then open the advanced editor
    onSave(node.id, { name, description: '', color, requiresHuman, requiredData, kind: 'complex' })
    onOpenAdvanced(node.id)
  }

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
          width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto',
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 24px 60px -12px rgba(15,23,42,0.25)',
          fontFamily: 'Roboto, sans-serif',
        }}
      >
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

          {/* Description */}
          <Field label="Descripción del estado">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Agrega una descripción"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 86, lineHeight: 1.5, fontFamily: 'inherit' }}
            />
          </Field>

          {/* Convert to advanced — prominent, single CTA */}
          <button
            onClick={handleConvertToAdvanced}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', borderRadius: 12,
              background: '#EFF0FF', border: `1px solid #C7D2FE`,
              cursor: 'pointer', textAlign: 'left', width: '100%',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#DDE2FF')}
            onMouseLeave={e => (e.currentTarget.style.background = '#EFF0FF')}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: PRIMARY, color: '#FFFFFF',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Sparkles size={14} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13.5, fontWeight: 700, color: '#1E1B4B' }}>
                  Convertir a estado avanzado
                </span>
                <span style={{ fontSize: 11.5, color: '#4338CA', marginTop: 2 }}>
                  Para condicionales, MCPs, loops o flujos personalizados
                </span>
              </div>
            </div>
            <span style={{ color: PRIMARY, fontSize: 18, fontWeight: 700, marginLeft: 8 }}>→</span>
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
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 18, marginTop: 18, borderTop: '1px solid #E2E8F0', background: '#FAFBFD',
          borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
        }}>
          <button
            onClick={() => { onDelete(node.id); onClose() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 100,
              background: '#FFFFFF', border: '1px solid #FECACA',
              color: '#DC2626', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          ><Trash2 size={14} /> Eliminar</button>
          <button
            onClick={onClose}
            style={{
              padding: '8px 22px', borderRadius: 100,
              background: '#FFFFFF', border: `1px solid ${PRIMARY}`,
              color: PRIMARY, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >Cerrar</button>
        </div>
      </div>
    </div>
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
  const insertVariable = () => {
    onUpdate(field.id, { description: (field.description || '') + ' {{variable}}' })
  }
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
      {/* Variable insertion button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          onClick={insertVariable}
          title="Insertar variable"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6,
            background: '#F1F5F9', border: 'none',
            color: '#475569', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9' }}
        ><Braces size={11} /> Insertar variable</button>
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

function WorkflowCanvasInner({ onOpenKanban }: { onOpenKanban?: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [advancedId, setAdvancedId] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<AnyNode>(INITIAL_NODES as any)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES)

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
        <ToolbarBtn icon={<Settings size={14} />}>Ajustes del workflow</ToolbarBtn>
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

      {/* Edit modal */}
      {editingNode && (
        <EditStateModal
          node={editingNode}
          onClose={() => setEditingId(null)}
          onSave={updateState}
          onDelete={deleteState}
          onOpenAdvanced={(id) => { setEditingId(null); setAdvancedId(id) }}
        />
      )}

      {/* Advanced editor overlay */}
      {advancedId && (() => {
        const adv = decoratedNodes.find(n => n.id === advancedId) as Node<StateNodeData> | undefined
        if (!adv) return null
        return (
          <AdvancedEditorOverlay
            node={adv}
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
  node, onClose, onSave, onConvertToSimple,
}: {
  node: Node<StateNodeData>
  onClose: () => void
  onSave: (id: string, patch: Partial<StateNodeData>) => void
  onConvertToSimple: (id: string) => void
}) {
  const [name, setName] = useState(node.data.name)
  const [color, setColor] = useState(node.data.color)
  const [requiresHuman, setRequiresHuman] = useState(node.data.requiresHuman)
  const [requiredData, setRequiredData] = useState<RequiredField[]>(node.data.requiredData ?? [])
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

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid #E2E8F0',
        background: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button
            onClick={onClose}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: 'transparent', border: '1px solid #E2E8F0',
              color: '#475569', fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
            }}
          >← Workflow</button>
          <span style={{ color: '#CBD5E1', flexShrink: 0 }}>/</span>
          {/* Color swatch (decorativo) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setColorOpen(o => !o)}
              title="Color del estado (decorativo)"
              style={{
                width: 18, height: 18, borderRadius: '50%',
                background: color, border: 'none', cursor: 'pointer', padding: 0,
              }}
            />
            {colorOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 5,
                padding: 8, background: '#FFFFFF', borderRadius: 10,
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 28px -8px rgba(15,23,42,0.18)',
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6,
                minWidth: 160,
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
          {/* Editable name */}
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: 8,
              border: '1px solid transparent',
              fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: '#0F172A',
              background: 'transparent', outline: 'none', minWidth: 200,
            }}
            onFocus={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0' }}
            onBlur={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
          />
          {/* Avanzado pill */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 100,
            background: '#EFF0FF', color: PRIMARY,
            fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            <Sparkles size={10} /> Avanzado
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onConvertToSimple(node.id)}
            style={{
              padding: '7px 14px', borderRadius: 8,
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              color: '#475569', fontFamily: 'Roboto, sans-serif', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}
          >Volver a simple</button>
          <button style={{
            padding: '7px 14px', borderRadius: 8,
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            color: '#0F172A', fontFamily: 'Roboto, sans-serif', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}>Probar</button>
          <button style={{
            padding: '7px 16px', borderRadius: 8,
            background: PRIMARY, border: 'none',
            color: '#FFFFFF', fontFamily: 'Roboto, sans-serif', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}>Guardar</button>
        </div>
      </header>

      {/* Body: sidebar + canvas */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar — state info */}
        <aside style={{
          width: 320, flexShrink: 0,
          borderRight: '1px solid #E2E8F0', background: '#FAFBFD',
          overflow: 'auto', padding: 18,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 12, background: '#FFFFFF', border: '1px solid #E2E8F0',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', fontFamily: 'Roboto, sans-serif' }}>Requiere confirmación humana</div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Antes de cambiar el workflow</div>
            </div>
            <Toggle on={requiresHuman} onChange={setRequiresHuman} />
          </div>
          <RequiredDataSection fields={requiredData} onChange={setRequiredData} />
        </aside>

        {/* Right: canvas with toolbar */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#F8FAFC' }}>
          {/* Floating toolbar (top of canvas) */}
          <div style={{
            position: 'absolute', top: 16, left: 16, zIndex: 10,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: 6,
            background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 100,
            boxShadow: '0 4px 12px -4px rgba(15,23,42,0.12)',
          }}>
            <NodeAddBtn label="Instrucción" color="#3B82F6" />
            <NodeAddBtn label="Condicional" color="#F59E0B" />
            <NodeAddBtn label="Loop" color="#9333EA" />
            <NodeAddBtn label="MCP"        color={PRIMARY} />
            <NodeAddBtn label="Respuesta"  color="#16A34A" />
          </div>
          <AdvancedFlow />
        </div>
      </div>

      {/* Hint bar */}
      <div style={{
        padding: '10px 20px', borderTop: '1px solid #E2E8F0',
        fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#64748B',
        background: '#FFFFFF',
      }}>
        Editor avanzado · Definí condicionales, MCPs, loops y todo el flujo de este estado.
      </div>
    </div>
  )
}

function NodeAddBtn({ label, color }: { label: string; color: string }) {
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 100,
      background: 'transparent', border: 'none',
      fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {label}
    </button>
  )
}

// Inline flow inside the overlay so we don't bring the full AutomationCanvas chrome
function AdvancedFlow() {
  const initialAdvancedNodes: Node[] = [
    { id: 'a-trigger', position: { x: 80, y: 200 }, data: { label: 'Trigger del estado' }, style: nodeChip('#0F172A', '#FFFFFF') },
    { id: 'a-cond',    position: { x: 320, y: 200 }, data: { label: '¿Cliente tiene cuenta?' }, style: nodeChip('#F59E0B', '#FFFFFF') },
    { id: 'a-mcp',     position: { x: 600, y: 120 }, data: { label: 'MCP: HubSpot · Lookup contact' }, style: nodeChip(PRIMARY, '#FFFFFF') },
    { id: 'a-respond', position: { x: 600, y: 280 }, data: { label: 'Responder: pedir email' }, style: nodeChip('#16A34A', '#FFFFFF') },
    { id: 'a-finish',  position: { x: 900, y: 200 }, data: { label: 'Fin del estado' }, style: nodeChip('#0F172A', '#FFFFFF') },
  ]
  const initialAdvancedEdges: Edge[] = [
    { id: 'ae-1', source: 'a-trigger', target: 'a-cond', type: 'smoothstep' },
    { id: 'ae-2', source: 'a-cond',    target: 'a-mcp',     type: 'smoothstep', label: 'sí' },
    { id: 'ae-3', source: 'a-cond',    target: 'a-respond', type: 'smoothstep', label: 'no' },
    { id: 'ae-4', source: 'a-mcp',     target: 'a-finish',  type: 'smoothstep' },
    { id: 'ae-5', source: 'a-respond', target: 'a-finish',  type: 'smoothstep' },
  ]
  const [n, , onN] = useNodesState(initialAdvancedNodes)
  const [e, setE, onE] = useEdgesState(initialAdvancedEdges)
  const onConnect = useCallback((p: Connection) => setE(es => addEdge({ ...p, type: 'smoothstep' }, es)), [setE])
  return (
    <ReactFlow
      nodes={n}
      edges={e}
      onNodesChange={onN}
      onEdgesChange={onE}
      onConnect={onConnect}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#CBD5E1" />
    </ReactFlow>
  )
}

function nodeChip(border: string, bg: string): React.CSSProperties {
  return {
    padding: '10px 14px', borderRadius: 8,
    background: bg, border: `1.5px solid ${border}`,
    fontFamily: 'Roboto, sans-serif', fontSize: 12.5, fontWeight: 600,
    color: '#0F172A',
    boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
  }
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

// ─── Exported wrapper ──────────────────────────────────────────────────────────

export default function WorkflowCanvas({ onOpenKanban }: { onOpenKanban?: () => void }) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner onOpenKanban={onOpenKanban} />
    </ReactFlowProvider>
  )
}
