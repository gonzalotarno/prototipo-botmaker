import { useState, useRef, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import AutomationCanvas from './components/AutomationCanvas'
import { DrawerProvider } from './context/DrawerContext'
import WebChat from './components/WebChat'
import {
  Plus, ChevronLeft,
  Clock, ArrowRight, GitBranch, Users, FileText,
  Cpu, Code2, Settings, Filter, Search,
  MoreHorizontal, Pencil, Trash2, X, BookOpen, Plug, Terminal, RotateCcw,
} from 'lucide-react'
import { AGENT_ICONS, AgentIcon } from './agentIcons'

// ── Types ─────────────────────────────────────────────────────────────────────
interface AgentItem {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

interface SubAgent {
  id: string
  name: string
  avatarColor: string
  description: string
  updatedAgo: string
  nodes: number
  active: boolean
}

// ── Data ──────────────────────────────────────────────────────────────────────
const ORCHESTRATOR_NAME = 'Pizzería Bella Italia'

const AGENTS: AgentItem[] = [
  { id: 'a1', name: 'Toma de Pedidos',    icon: 'cart',       color: '#16a34a', description: 'Recibe pedidos y los registra automáticamente' },
  { id: 'a2', name: 'Soporte al Cliente', icon: 'headphones', color: '#d97706', description: 'Responde consultas frecuentes y reclamos'      },
  { id: 'a3', name: 'Menú & Promociones', icon: 'megaphone',  color: '#9333ea', description: 'Comparte menú del día y promos vigentes'        },
]

const UNASSIGNED_AGENTS: AgentItem[] = [
  { id: 'u1', name: 'Atención al Cliente', icon: 'phone',     color: '#64748b', description: 'Agente genérico de atención' },
  { id: 'u2', name: 'Inventory Manager',   icon: 'clipboard', color: '#64748b', description: 'Gestión de stock e inventario' },
]

const SUB_AGENTS: SubAgent[] = [
  { id: 's1', name: 'Flujo Principal',         avatarColor: '#6366f1', description: 'Flujo principal de conversación y toma de datos del cliente.', updatedAgo: '1d', nodes: 10, active: true },
  { id: 's2', name: 'Confirmación de Pedido',  avatarColor: '#f59e0b', description: 'Confirma el pedido con el cliente y valida disponibilidad de ingredientes.', updatedAgo: '3h', nodes: 10, active: true },
  { id: 's3', name: 'Notificación de Estado',  avatarColor: '#8b5cf6', description: 'Notifica al cliente sobre el estado del pedido en tiempo real.', updatedAgo: '2d', nodes: 8, active: true },
  { id: 's4', name: 'Seguimiento Post-venta',  avatarColor: '#10b981', description: 'Hace seguimiento automático después de la entrega para asegurar satisfacción.', updatedAgo: '5d', nodes: 6, active: false },
  { id: 's5', name: 'Flujo de Error',          avatarColor: '#ef4444', description: 'Manejo de casos borde y errores: pedido fuera de cobertura, sin stock, etc.', updatedAgo: '1d', nodes: 5, active: true },
]

const TABS = [
  { id: 'flujos',        label: 'Flujos',         icon: GitBranch },
  { id: 'bases',         label: 'Bases',          icon: FileText  },
  { id: 'mcps',          label: 'MCPs',           icon: Cpu       },
  { id: 'codigo',        label: 'Código',         icon: Code2     },
  { id: 'configuracion', label: 'Configuración',  icon: Settings  },
  { id: 'historial',     label: 'Historial',      icon: Clock     },
]

// ── Sub-agentes tab ────────────────────────────────────────────────────────────
function SubAgentesTab({ agentName }: { agentName: string }) {
  const [subSearch, setSubSearch] = useState('')
  const [agents, setAgents] = useState(SUB_AGENTS)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<SubAgent | null>(null)
  const [editName, setEditName] = useState('')
  const [editTrigger, setEditTrigger] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SubAgent | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openEdit = (sub: SubAgent) => {
    setEditTarget(sub)
    setEditName(sub.name)
    setEditTrigger(sub.description)
    setOpenMenuId(null)
  }

  const saveEdit = () => {
    if (!editTarget) return
    setAgents(prev => prev.map(s => s.id === editTarget.id ? { ...s, name: editName, description: editTrigger } : s))
    setEditTarget(null)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setAgents(prev => prev.filter(s => s.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const filtered = agents.filter(s =>
    s.name.toLowerCase().includes(subSearch.toLowerCase())
  )

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '28px 36px', background: '#f9fafb' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Sub-agentes</h2>
          <p style={{ fontSize: 13, color: '#64748b', maxWidth: 600 }}>
            Cada sub-agente es un flow de nodos en el canvas. El agente los coordina y los invoca según el contexto de la conversación.
          </p>
        </div>
        <button
          onClick={() => {}}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 100, border: 'none', background: '#304FFE', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(48,79,254,0.24)' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={14} /> Nuevo Sub-agente
        </button>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={13} color="#9ca3af" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={subSearch}
            onChange={e => setSubSearch(e.target.value)}
            placeholder="Buscar sub-agentes (flows)..."
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#304FFE')}
            onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
          />
        </div>
        <button style={{ padding: '8px 12px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
          onMouseLeave={e => (e.currentTarget.style.background = 'white')}
        >
          <Filter size={14} />
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {filtered.map((sub, i) => (
          <div
            key={sub.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
              transition: 'background 0.15s',
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={() => { window.location.href = '/flow' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Avatar circle */}
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: sub.avatarColor + '20', border: `2px solid ${sub.avatarColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 18, color: sub.avatarColor }}>👤</span>
            </div>

            {/* Name + description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{sub.name}</p>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>¿CUÁNDO SE ACTIVA ESTE SUB-AGENTE?</p>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{sub.description}</p>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                <Clock size={11} /> Actualizado hace {sub.updatedAgo}
              </span>
              <span style={{ padding: '3px 9px', borderRadius: 100, background: '#f1f5f9', border: '1px solid #e5e7eb', fontSize: 11, fontWeight: 500, color: '#475569' }}>
                {sub.nodes} Nodos
              </span>
              <span style={{ padding: '3px 9px', borderRadius: 100, background: sub.active ? '#f0fdf4' : '#fafafa', border: `1px solid ${sub.active ? '#bbf7d0' : '#e5e7eb'}`, fontSize: 11, fontWeight: 600, color: sub.active ? '#16a34a' : '#94a3b8' }}>
                {sub.active ? 'Activo' : 'Inactivo'}
              </span>
              <button
                onClick={e => { e.stopPropagation(); window.location.href = '/flow' }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 8, border: 'none', background: 'transparent', color: '#304FFE', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#EEF1FF')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Ingresar <ArrowRight size={12} />
              </button>

              {/* Kebab menu */}
              <div style={{ position: 'relative' }} ref={openMenuId === sub.id ? menuRef : null} onClick={e => e.stopPropagation()}>
                <button
                  onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === sub.id ? null : sub.id) }}
                  style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: openMenuId === sub.id ? '#f1f5f9' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseLeave={e => { if (openMenuId !== sub.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <MoreHorizontal size={15} />
                </button>

                {openMenuId === sub.id && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', background: 'white', borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', minWidth: 150, zIndex: 50, overflow: 'hidden' }}>
                    <button
                      onClick={() => openEdit(sub)}
                      style={{ width: '100%', padding: '9px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#334155', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Pencil size={13} color="#64748b" /> Editar
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(sub); setOpenMenuId(null) }}
                      style={{ width: '100%', padding: '9px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#dc2626', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit modal ── */}
      {editTarget && (
        <>
          <div onClick={() => setEditTarget(null)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 100, width: 480, background: 'white', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Editar sub-agente</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>Modificá el nombre y cuándo el agente lo invoca</p>
              </div>
              <button onClick={() => setEditTarget(null)} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: '#f1f5f9', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Nombre del sub-agente</label>
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#304FFE')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>¿Cuándo debe invocar el agente este sub-agente?</label>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, lineHeight: 1.5 }}>Describí en qué situación el agente debe delegar la conversación a este sub-agente (flow).</p>
                <textarea
                  value={editTrigger}
                  onChange={e => setEditTrigger(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, color: '#0f172a', outline: 'none', resize: 'vertical', lineHeight: 1.65, boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#304FFE')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                />
              </div>
            </div>
            <div style={{ padding: '0 24px 22px', display: 'flex', gap: 10 }}>
              <button onClick={() => setEditTarget(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'transparent', fontSize: 13, fontWeight: 500, color: '#64748b', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={saveEdit} style={{ flex: 1, padding: '11px', borderRadius: 100, border: 'none', background: '#304FFE', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Guardar cambios</button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <>
          <div onClick={() => setDeleteTarget(null)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 100, width: 420, background: 'white', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={20} color="#dc2626" />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Eliminar sub-agente</h2>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                ¿Estás seguro que querés eliminar <strong style={{ color: '#0f172a' }}>{deleteTarget.name}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'transparent', fontSize: 13, fontWeight: 500, color: '#64748b', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Sí, eliminar</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Config modal ────────────────────────────────────────────────────────────────
const AGENT_COLORS = ['#304FFE', '#16a34a', '#d97706', '#dc2626', '#9333ea', '#0891b2', '#db2777', '#64748b']

function ConfigModal({ agent, onClose }: { agent: AgentItem; onClose: () => void }) {
  const [name, setName] = useState(agent.name)
  const [description, setDescription] = useState(agent.description)
  const [iconKey, setIconKey] = useState(agent.icon)
  const [color, setColor] = useState(agent.color)
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const Icon = AGENT_ICONS.find(i => i.key === iconKey)?.Icon ?? AGENT_ICONS[0].Icon

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1200)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 201, width: 520, maxHeight: '88vh',
        background: 'white', borderRadius: 20,
        boxShadow: '0 32px 96px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px 18px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Settings size={17} color="#304FFE" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', flex: 1, margin: 0 }}>Configurar agente</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Nombre */}
          <div style={{ position: 'relative' }}>
            <label style={{
              position: 'absolute', left: 14, top: name ? 6 : '50%',
              transform: name ? 'none' : 'translateY(-50%)',
              fontSize: name ? 10 : 13, fontWeight: 500,
              color: '#94a3b8', transition: 'all 0.15s', pointerEvents: 'none',
            }}>Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', paddingTop: 20, paddingBottom: 8, paddingLeft: 14, paddingRight: 14, borderRadius: 10, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#304FFE')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* Descripción */}
          <div style={{ position: 'relative' }}>
            <label style={{
              position: 'absolute', left: 14, top: description ? 8 : 14,
              fontSize: description ? 10 : 13, fontWeight: 500,
              color: '#94a3b8', transition: 'all 0.15s', pointerEvents: 'none',
            }}>Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', paddingTop: 22, paddingBottom: 10, paddingLeft: 14, paddingRight: 14, borderRadius: 10, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, color: '#0f172a', outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'inherit' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#304FFE')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* Ícono del proceso */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 14 }}>Ícono del proceso</p>

            {/* Preview */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: color, boxShadow: `0 8px 24px ${color}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                <Icon size={32} color="white" />
              </div>
            </div>

            {/* Color row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
              {AGENT_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{
                  width: 24, height: 24, borderRadius: '50%', border: 'none',
                  background: c, cursor: 'pointer',
                  outline: color === c ? `2.5px solid ${c}` : 'none', outlineOffset: 3,
                  transform: color === c ? 'scale(1.25)' : 'scale(1)',
                  transition: 'transform 0.15s',
                }} />
              ))}
            </div>

            {/* Icon grid */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 12px', background: '#fafafa' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {AGENT_ICONS.map(({ key, Icon: IIcon }) => {
                  const sel = iconKey === key
                  return (
                    <button
                      key={key}
                      onClick={() => setIconKey(key)}
                      style={{
                        width: 36, height: 36, borderRadius: 8, padding: 0, cursor: 'pointer', border: 'none',
                        background: sel ? color + '18' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.12s',
                        outline: sel ? `2px solid ${color}` : 'none', outlineOffset: 0,
                      }}
                      onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#f1f5f9' }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}
                    >
                      <IIcon size={18} color={sel ? color : '#64748b'} />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Eliminar agente */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 0', borderTop: '1px solid #f1f5f9' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 2 }}>Eliminar agente</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Esta acción es permanente y no se puede deshacer.</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Eliminar
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ padding: '9px 22px', borderRadius: 100, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 500, color: '#64748b', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#304FFE'; e.currentTarget.style.color = '#304FFE' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
          >
            Cancelar
          </button>
          <button onClick={handleSave}
            style={{ padding: '9px 24px', borderRadius: 100, border: 'none', background: saved ? '#16a34a' : '#304FFE', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', minWidth: 110 }}
            onMouseEnter={e => { if (!saved) e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {saved ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }} onClick={() => setShowDeleteConfirm(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 301, width: 400, background: 'white', borderRadius: 18, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Trash2 size={20} color="#dc2626" />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>¿Eliminar agente?</h2>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                Esta acción es <strong style={{ color: '#0f172a' }}>permanente</strong> y no se puede deshacer. Se eliminará <strong style={{ color: '#0f172a' }}>{agent.name}</strong> junto con toda su configuración.
              </p>
            </div>
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '11px', borderRadius: 100, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 500, color: '#64748b', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => { setShowDeleteConfirm(false); onClose() }} style={{ flex: 1, padding: '11px', borderRadius: 100, border: 'none', background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Sí, eliminar</button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ── Generic knowledge/tool tab ─────────────────────────────────────────────────
interface KnowledgeTabProps {
  title: string
  subtitle: string
  addLabel: string
  searchPlaceholder: string
  cardIcon: React.ReactNode
  cardTitle: string
  cardUsageLabel: string
  cardUsageHint: string
}

function KnowledgeTab({ title, subtitle, addLabel, searchPlaceholder, cardIcon, cardTitle, cardUsageLabel, cardUsageHint }: KnowledgeTabProps) {
  const [search, setSearch] = useState('')
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '28px 36px', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{title}</h2>
          <p style={{ fontSize: 13, color: '#64748b', maxWidth: 560 }}>{subtitle}</p>
        </div>
        <button
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 100, border: 'none', background: '#304FFE', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(48,79,254,0.24)' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={14} /> {addLabel}
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 24 }}>
        <Search size={13} color="#9ca3af" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#304FFE')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />
      </div>

      {/* Sample card */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ width: 340, background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            {cardIcon}
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>{cardTitle}</span>
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            {cardUsageLabel}
          </p>
          <textarea
            readOnly
            placeholder={cardUsageHint}
            rows={3}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#f9fafb', fontSize: 12, color: '#64748b', resize: 'none', outline: 'none', lineHeight: 1.5, boxSizing: 'border-box', fontFamily: 'inherit', cursor: 'default' }}
          />
        </div>
      </div>
    </div>
  )
}

function BasesTab() {
  return (
    <KnowledgeTab
      title="Todas las bases de conocimiento"
      subtitle="Presentale contexto a tu agente con documentos, FAQs y datos de tu negocio para que responda con mayor precisión."
      addLabel="Agregar Base de Conocimiento"
      searchPlaceholder="Buscar bases de conocimiento..."
      cardIcon={<div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BookOpen size={18} color="#304FFE" /></div>}
      cardTitle="Base_Conocimiento_Menu_Pizzeria.docx"
      cardUsageLabel="¿Cómo va a ser utilizada por el agente?"
      cardUsageHint="Descripción de cuándo y cómo el agente debe consultar este documento..."
    />
  )
}

function McpsTab() {
  return (
    <KnowledgeTab
      title="Conexiones MCP"
      subtitle="Conectá tu agente a herramientas y servicios externos mediante el protocolo MCP para ampliar sus capacidades de acción."
      addLabel="Agregar MCP"
      searchPlaceholder="Buscar conexiones MCP..."
      cardIcon={<div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Plug size={18} color="#16a34a" /></div>}
      cardTitle="mcp-google-calendar"
      cardUsageLabel="¿Cuándo debe usar esta herramienta el agente?"
      cardUsageHint="Descripción de cuándo el agente debe invocar este MCP..."
    />
  )
}

function CodigoTab() {
  return (
    <KnowledgeTab
      title="Funciones de código"
      subtitle="Agregá lógica personalizada que tu agente puede ejecutar para resolver tareas complejas o integrarse con sistemas propios."
      addLabel="Agregar Función"
      searchPlaceholder="Buscar funciones..."
      cardIcon={<div style={{ width: 36, height: 36, borderRadius: 10, background: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Terminal size={18} color="#9333ea" /></div>}
      cardTitle="calcular_tiempo_entrega.js"
      cardUsageLabel="¿Cuándo debe ejecutarse esta función?"
      cardUsageHint="Descripción de cuándo el agente debe ejecutar este código..."
    />
  )
}

// ── Historial Tab ─────────────────────────────────────────────────────────────

const MOCK_VERSIONS = [
  {
    id: 'v3', label: 'v3', date: 'Hoy', time: '14:32', author: 'Lucía F.',
    isCurrent: true, named: 'Versión de producción',
    changes: ['Mejora en el flujo de confirmación', 'Nuevo mensaje de bienvenida', 'Fix: timeout en respuesta de pago'],
  },
  {
    id: 'v2b', label: 'v2', date: 'Ayer', time: '11:20', author: 'Lucía F.',
    isCurrent: false, named: null,
    changes: ['Soporte para pagos con QR', 'Fix: loop infinito en pedidos pendientes'],
  },
  {
    id: 'v2a', label: 'v2', date: 'Ayer', time: '09:05', author: 'Matías R.',
    isCurrent: false, named: null,
    changes: ['Ajuste de tono en mensajes de error'],
  },
  {
    id: 'v1c', label: 'v1', date: 'Hace 3 días', time: '16:44', author: 'Lucía F.',
    isCurrent: false, named: 'Primera versión estable',
    changes: ['Configuración inicial de flujos', 'Integración con base de datos de menú'],
  },
  {
    id: 'v1b', label: 'v1', date: 'Hace 4 días', time: '10:12', author: 'Matías R.',
    isCurrent: false, named: null,
    changes: ['Estructura básica del agente'],
  },
  {
    id: 'v1a', label: 'v1', date: 'Hace 1 semana', time: '09:00', author: 'Matías R.',
    isCurrent: false, named: null,
    changes: ['Versión inicial creada'],
  },
]

function HistorialTab({ agentName }: { agentName: string }) {
  const [selectedId, setSelectedId] = useState(MOCK_VERSIONS[0].id)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const selected = MOCK_VERSIONS.find(v => v.id === selectedId) ?? MOCK_VERSIONS[0]

  const handleRestore = (id: string) => {
    setRestoring(id)
    setTimeout(() => {
      setRestoring(null)
      setSelectedId(MOCK_VERSIONS[0].id) // after restore, go to current
    }, 1800)
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f8fafc' }}>

      {/* ── Left: version preview ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 24 }}>
        <div style={{
          background: 'white', borderRadius: 20, border: '1px solid #e5e7eb',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          padding: '36px 40px', maxWidth: 480, width: '100%',
        }}>
          {/* Version badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 12px', borderRadius: 100,
              background: selected.isCurrent ? '#304FFE' : '#f1f5f9',
              color: selected.isCurrent ? 'white' : '#374151',
              fontSize: 12, fontWeight: 700,
            }}>
              {selected.label}
              {selected.isCurrent && <span style={{ fontSize: 10, opacity: 0.85 }}>· actual</span>}
            </span>
            {selected.named && (
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{selected.named}</span>
            )}
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{agentName}</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', lineHeight: 1.5 }}>
            Guardado el {selected.date} a las {selected.time} por {selected.author}
          </p>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
              Cambios en esta versión
            </p>
            <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selected.changes.map(c => (
                <li key={c} style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{c}</li>
              ))}
            </ul>
          </div>

          {!selected.isCurrent && (
            <button
              onClick={() => handleRestore(selected.id)}
              disabled={restoring === selected.id}
              style={{
                marginTop: 28, width: '100%',
                padding: '10px', borderRadius: 10, border: 'none',
                background: restoring === selected.id ? '#f0fdf4' : '#304FFE',
                color: restoring === selected.id ? '#16a34a' : 'white',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'all 0.2s',
              }}
            >
              {restoring === selected.id ? (
                <><span style={{ fontSize: 16 }}>✓</span> Versión restaurada</>
              ) : (
                <><RotateCcw size={14} /> Restaurar esta versión</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Right: version timeline ── */}
      <div style={{
        width: 280, borderLeft: '1px solid #e5e7eb', background: 'white',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Historial de versiones</p>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#94a3b8' }}>{MOCK_VERSIONS.length} versiones guardadas</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {MOCK_VERSIONS.map((v, i) => {
            const isSelected = v.id === selectedId
            const isHovered = v.id === hoveredId
            const showDate = i === 0 || MOCK_VERSIONS[i-1].date !== v.date

            return (
              <div key={v.id}>
                {showDate && (
                  <div style={{ padding: '10px 20px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {v.date}
                  </div>
                )}
                <button
                  onClick={() => setSelectedId(v.id)}
                  onMouseEnter={() => setHoveredId(v.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    width: '100%', padding: '12px 20px', border: 'none', textAlign: 'left',
                    background: isSelected ? '#EEF1FF' : isHovered ? '#f8fafc' : 'white',
                    cursor: 'pointer', transition: 'background 0.12s',
                    borderLeft: isSelected ? '3px solid #304FFE' : '3px solid transparent',
                    display: 'flex', flexDirection: 'column', gap: 3,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#304FFE' : '#0f172a' }}>
                      {v.time}
                    </span>
                    {v.isCurrent && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100,
                        background: '#304FFE', color: 'white',
                      }}>actual</span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{v.author}</span>
                  {v.named && (
                    <span style={{ fontSize: 11, color: '#304FFE', fontWeight: 600, marginTop: 2 }}>{v.named}</span>
                  )}
                  {isHovered && !v.isCurrent && (
                    <span style={{ fontSize: 11, color: '#304FFE', marginTop: 4, fontWeight: 500 }}>
                      Restaurar →
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AgentView() {
  const isUnassigned = new URLSearchParams(window.location.search).get('u') === '1'
  const agentPool = isUnassigned ? UNASSIGNED_AGENTS : AGENTS
  const [selectedAgent, setSelectedAgent] = useState(agentPool[0])
  const [activeTab, setActiveTab] = useState('flujos')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)

  return (
    <DrawerProvider>
      <div style={{
        display: 'flex', height: '100vh', background: 'white',
        fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden',
      }}>

        {/* ── Left sidebar ── */}
        <aside style={{
          width: 240, flexShrink: 0, borderRight: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column', background: 'white',
        }}>
          {/* Sidebar top */}
          {isUnassigned ? (
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <button
                onClick={() => { window.location.href = '/' }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 0', border: 'none', background: 'transparent', color: '#9ca3af', fontSize: 11, cursor: 'pointer', marginBottom: 12 }}
              >
                <ChevronLeft size={12} /> Inicio
              </button>
              <div style={{ padding: '14px 16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Sin orquestador asignado</p>
                <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.5, marginBottom: 10 }}>Este agente todavía no está dentro de ningún orquestador.</p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  style={{ width: '100%', padding: '9px', borderRadius: 100, border: 'none', background: '#304FFE', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Asignar a orquestador
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { window.location.href = '/orquestador' }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '16px 20px', border: 'none', background: 'transparent',
                cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f1f5f9',
                width: '100%',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronLeft size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px' }}>Orquestador</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ORCHESTRATOR_NAME}</p>
              </div>
            </button>
          )}

          {/* Section label + add */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 8px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isUnassigned ? 'En desarrollo' : 'Agentes'}
            </span>
            <button
              style={{ width: 24, height: 24, borderRadius: 6, background: '#EEF1FF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#304FFE')}
              onMouseLeave={e => (e.currentTarget.style.background = '#EEF1FF')}
              title="Nuevo agente"
            >
              <Plus size={13} color="#304FFE" />
            </button>
          </div>

          {/* Agent list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0 12px' }}>
            {agentPool.map(agent => {
              const active = selectedAgent.id === agent.id
              return (
                <button
                  key={agent.id}
                  onClick={() => { setSelectedAgent(agent); setActiveTab('flujos') }}
                  style={{
                    width: '100%', padding: '10px 16px 10px 13px', border: 'none',
                    textAlign: 'left', background: active ? '#EEF1FF' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11,
                    borderLeft: active ? '3px solid #304FFE' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f9fafb' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <AgentIcon iconKey={agent.icon} color={agent.color} size={30} iconSize={14} />
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#304FFE' : '#374151', lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {agent.name}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* ── Main panel ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <header style={{ borderBottom: '1px solid #e5e7eb', background: 'white', flexShrink: 0, padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Left: agent identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <AgentIcon iconKey={selectedAgent.icon} color={selectedAgent.color} size={42} iconSize={20} />
                <span style={{ position: 'absolute', bottom: 2, right: 2, width: 9, height: 9, borderRadius: '50%', background: '#22c55e', border: '2px solid white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{selectedAgent.name}</h1>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{selectedAgent.description}</p>
              </div>
            </div>

            {/* Right: pill nav buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {TABS.map(tab => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => tab.id === 'configuracion' ? setShowConfigModal(true) : setActiveTab(tab.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 100, border: 'none', cursor: 'pointer',
                      background: active ? '#304FFE' : 'transparent',
                      color: active ? 'white' : '#6b7280',
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#374151' } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' } }}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                )
              })}
            </div>
          </header>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {activeTab === 'flujos' && <SubAgentesTab agentName={selectedAgent.name} />}
              {activeTab === 'bases' && <BasesTab />}
              {activeTab === 'mcps' && <McpsTab />}
              {activeTab === 'codigo' && <CodigoTab />}
              {activeTab === 'historial' && <HistorialTab agentName={selectedAgent.name} />}
            </div>
          </div>
        </div>
      </div>
      <WebChat />

      {/* ── Config modal ── */}
      {showConfigModal && (
        <ConfigModal agent={selectedAgent} onClose={() => { setShowConfigModal(false) }} />
      )}

      {/* ── Assign modal ── */}
      {showAssignModal && (
        <>
          <div onClick={() => setShowAssignModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 100, width: 400, background: 'white', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Asignar a orquestador</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>¿A qué orquestador querés agregar <strong>{selectedAgent.name}</strong>?</p>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'Pizzería Bella Italia', emoji: '🍕', color: '#304FFE' },
                { name: 'Tienda Moda Express',  emoji: '👗', color: '#7C3AED' },
                { name: 'Inmobiliaria Del Sur', emoji: '🏠', color: '#D97706' },
              ].map(orch => (
                <button
                  key={orch.name}
                  onClick={() => { window.location.href = '/orquestador' }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = orch.color + '60'; e.currentTarget.style.background = '#fafbff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white' }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: orch.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{orch.emoji}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{orch.name}</span>
                </button>
              ))}
            </div>
            <div style={{ padding: '0 24px 20px' }}>
              <button onClick={() => setShowAssignModal(false)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'transparent', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </>
      )}
    </DrawerProvider>
  )
}
