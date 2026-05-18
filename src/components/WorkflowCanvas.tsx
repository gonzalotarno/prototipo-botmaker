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
import { Plus, AlertCircle, X, Trash2, Settings, LayoutGrid, Maximize2, Sparkles } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type StateNodeData = Record<string, unknown> & {
  name: string
  description: string
  color: string
  requiresHuman: boolean
  requiredData: string[]
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
  return (
    <div
      onClick={() => onEdit(id)}
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

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <span style={{ flex: 1, fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
        {requiresHuman && (
          <span title="Requiere confirmación humana" style={{ width: 16, height: 16, borderRadius: '50%', background: '#FEF3C7', color: '#B45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={11} />
          </span>
        )}
        {isComplex && (
          <span title="Estado avanzado" style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 7px', borderRadius: 100,
            background: '#EFF0FF', color: PRIMARY,
            fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            <Sparkles size={9} /> Avanzado
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
      {/* Complex: "Abrir editor" button */}
      {isComplex && (
        <button
          onClick={e => { e.stopPropagation(); onOpenAdvanced?.(id) }}
          style={{
            marginTop: 10, width: '100%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8,
            background: '#EFF0FF', border: `1px solid #C7D2FE`,
            color: PRIMARY, fontFamily: 'Roboto, sans-serif', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#DBEAFE')}
          onMouseLeave={e => (e.currentTarget.style.background = '#EFF0FF')}
        >
          Abrir editor avanzado →
        </button>
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
  const [requiredData, setRequiredData] = useState<string[]>(node.data.requiredData ?? [])
  const [kind, setKind] = useState<'simple' | 'complex'>(node.data.kind)

  const isComplex = kind === 'complex'
  // Heuristic: suggest upgrade when description gets meaningfully long
  const shouldSuggestUpgrade = !isComplex && description.length > 90

  const save = () => {
    onSave(node.id, { name, description, color, requiresHuman, requiredData, kind })
    onClose()
  }
  // Auto-save on field change
  useEffect(() => {
    onSave(node.id, { name, description, color, requiresHuman, requiredData, kind })
  }, [name, description, color, requiresHuman, requiredData.length, kind])  // eslint-disable-line

  const handleConvertToComplex = () => {
    setKind('complex')
    // Wipe description since complex states don't have one
    setDescription('')
    setRequiredData([])
  }
  const handleConvertToSimple = () => setKind('simple')

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
          width: '100%', maxWidth: 460, maxHeight: '90vh', overflow: 'auto',
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 24px 60px -12px rgba(15,23,42,0.25)',
          fontFamily: 'Roboto, sans-serif',
        }}
      >
        {/* Body */}
        <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Kind chip */}
          {isComplex && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 100,
              background: '#EFF0FF', border: `1px solid #C7D2FE`,
              color: PRIMARY, fontFamily: 'Roboto, sans-serif',
              fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
              alignSelf: 'flex-start',
            }}>
              <Sparkles size={11} /> Estado avanzado
            </div>
          )}

          {/* Name */}
          <Field label="Nombre del estado">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              style={inputStyle}
            />
          </Field>

          {/* Description — simple only */}
          {!isComplex && (
            <Field label="Descripción del estado">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Agrega una descripción"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 86, lineHeight: 1.5, fontFamily: 'inherit' }}
              />
              {shouldSuggestUpgrade && (
                <div style={{
                  marginTop: 8,
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '10px 12px', borderRadius: 10,
                  background: '#EFF0FF', border: `1px solid #C7D2FE`,
                }}>
                  <Sparkles size={14} color={PRIMARY} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, fontSize: 12.5, color: '#1E1B4B', lineHeight: 1.45 }}>
                    Si lo que necesitás incluye <strong>condicionales, MCPs o flujos</strong>, este estado puede ser avanzado.
                    <button
                      onClick={handleConvertToComplex}
                      style={{
                        marginLeft: 6, padding: 0, border: 'none', background: 'transparent',
                        color: PRIMARY, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline',
                      }}
                    >Convertir →</button>
                  </div>
                </div>
              )}
            </Field>
          )}

          {/* Complex: open editor button */}
          {isComplex && (
            <button
              onClick={() => onOpenAdvanced(node.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                padding: '14px 18px', borderRadius: 12,
                background: PRIMARY, border: 'none',
                color: '#FFFFFF', fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 20px -6px rgba(48,79,254,0.45)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} />
                Abrir editor avanzado
              </span>
              <span>→</span>
            </button>
          )}

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

          {/* Color */}
          <Field label="Color">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: c, border: 'none', cursor: 'pointer', padding: 0,
                    outline: color === c ? `2px solid ${PRIMARY}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </Field>

          {/* Required data — simple only */}
          {!isComplex && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Datos requeridos en este estado</div>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>Estos datos deben completarse durante este workflow</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {requiredData.map((field, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8,
                  }}>
                    <input
                      value={field}
                      onChange={e => setRequiredData(prev => prev.map((f, j) => j === i ? e.target.value : f))}
                      placeholder="Nombre del dato"
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13 }}
                    />
                    <button
                      onClick={() => setRequiredData(prev => prev.filter((_, j) => j !== i))}
                      style={{ border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer', display: 'flex' }}
                    ><X size={14} /></button>
                  </div>
                ))}
                <button
                  onClick={() => setRequiredData(prev => [...prev, ''])}
                  style={{
                    padding: '12px 16px', borderRadius: 10,
                    background: 'transparent', border: '1.5px dashed #CBD5E1',
                    color: PRIMARY, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >+ Agregar dato</button>
              </div>
            </div>
          )}

          {/* Convert toggle (always available, subtle) */}
          <div style={{
            paddingTop: 12, borderTop: '1px dashed #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.45 }}>
              {isComplex
                ? 'Este estado tiene lógica avanzada (condicionales, MCPs).'
                : '¿Necesitás condicionales, MCPs o flujos?'}
            </div>
            {isComplex ? (
              <button
                onClick={handleConvertToSimple}
                style={{
                  padding: '6px 12px', borderRadius: 100,
                  background: 'transparent', border: '1px solid #E2E8F0',
                  color: '#475569', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >Volver a simple</button>
            ) : (
              <button
                onClick={handleConvertToComplex}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 100,
                  background: '#FFFFFF', border: `1px solid ${PRIMARY}`,
                  color: PRIMARY, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              ><Sparkles size={12} /> Convertir a avanzado</button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 20, marginTop: 20, borderTop: '1px solid #E2E8F0', background: '#FAFBFD',
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
            onClick={save}
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
            stateName={adv.data.name}
            stateColor={adv.data.color}
            onClose={() => setAdvancedId(null)}
          />
        )
      })()}
    </div>
  )
}

// ─── Advanced Editor Overlay (Lógica editor) ───────────────────────────────────

function AdvancedEditorOverlay({ stateName, stateColor, onClose }: {
  stateName: string
  stateColor: string
  onClose: () => void
}) {
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
        padding: '14px 24px',
        borderBottom: '1px solid #E2E8F0',
        background: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: 'transparent', border: '1px solid #E2E8F0',
              color: '#475569', fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >← Workflow</button>
          <span style={{ color: '#CBD5E1' }}>/</span>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: stateColor, display: 'inline-block' }} />
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{stateName}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 100,
            background: '#EFF0FF', color: PRIMARY,
            fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            <Sparkles size={10} /> Lógica
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            padding: '7px 14px', borderRadius: 8,
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            color: '#0F172A', fontFamily: 'Roboto, sans-serif', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}>Probar lógica</button>
          <button style={{
            padding: '7px 16px', borderRadius: 8,
            background: PRIMARY, border: 'none',
            color: '#FFFFFF', fontFamily: 'Roboto, sans-serif', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          }}>Guardar</button>
        </div>
      </header>

      {/* Canvas — embebido AutomationCanvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AdvancedFlow />
      </div>

      {/* Hint bar */}
      <div style={{
        padding: '10px 24px', borderTop: '1px solid #E2E8F0',
        fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#64748B',
        background: '#FAFBFD',
      }}>
        Editor avanzado · Acá podés definir condicionales, MCPs, loops y todo el flujo de este estado complejo.
      </div>
    </div>
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
