import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ReactFlowProvider } from '@xyflow/react'
import { AgentAvatar, AGENT_ICONS } from './agentIcons'
import AgentsListSidebar from './components/AgentsListSidebar'
import AgentsTopBar from './components/AgentsTopBar'
import LogicTestChat from './components/LogicTestChat'
import { DrawerProvider } from './context/DrawerContext'
import AutomationCanvas from './components/AutomationCanvas'
import WorkflowCanvas from './components/WorkflowCanvas'
import WorkflowList from './components/WorkflowList'
import Icon from './Icon'
import { color, spacing, radius, font, shadow, text } from './ds'

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'perfil' | 'estados' | 'subagentes' | 'bases' | 'mcps' | 'apps' | 'codigo' | 'automatizaciones'

const TABS: { id: Tab; label: string; icon: string; isMcp?: boolean }[] = [
  { id: 'perfil',           label: 'Perfil',                icon: 'ai-agent'     },
  { id: 'estados',          label: 'Workflows',             icon: 'view_kanban' },
  // { id: 'subagentes',    label: 'Lógicas', icon: 'route' },  // removed: ahora viven dentro de Workflows como estados avanzados
  { id: 'bases',            label: 'Bases',                 icon: 'description'  },
  { id: 'mcps',             label: 'MCP',                   icon: '',            isMcp: true },
  { id: 'apps',             label: 'Aplicaciones externas', icon: 'apps'        },
  { id: 'codigo',           label: 'Códigos',               icon: 'code'         },
  { id: 'automatizaciones', label: 'Automatizaciones',      icon: 'bolt'         },
]

// ── Agent data ─────────────────────────────────────────────────────────────────

const AGENT = {
  id: 'a1',
  name: 'Seguimiento de Leads',
  color: color.primary as string,
  icon: 'cart',
  description: 'Gestiona el seguimiento de leads por WhatsApp',
  status: 'active' as const,
}

// ── Estado node ────────────────────────────────────────────────────────────────

interface Estado { id: string; name: string; color: string }

const STATE_COLORS = [color.primary, '#673AB7', '#00BCD4', color.success, color.warningDark, color.error, '#FF3C9A', color.successDark]

const INITIAL_ESTADOS: Estado[] = [
  { id: 's1', name: 'Nuevo',         color: color.grey600 },
  { id: 's2', name: 'Consultando',   color: '#00BCD4'     },
  { id: 's3', name: 'Pedido tomado', color: color.primary  },
  { id: 's4', name: 'Confirmado',    color: color.success  },
  { id: 's5', name: 'Entregado',     color: color.success  },
]

function EstadoNode({ estado, onRename, onRemove, isLast }: { estado: Estado; onRename: (id: string, name: string) => void; onRemove: (id: string) => void; isLast: boolean }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(estado.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const commit = () => { if (draft.trim()) onRename(estado.id, draft.trim()); else setDraft(estado.name); setEditing(false) }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div
          style={{ width: 48, height: 48, borderRadius: '50%', background: estado.color + '18', border: `2.5px solid ${estado.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', transition: 'transform 0.15s' }}
          onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        >
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: estado.color }} />
          <button onClick={e => { e.stopPropagation(); onRemove(estado.id) }}
            style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: color.grey100, border: `1px solid ${color.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey500 }}
            onMouseEnter={e => { e.currentTarget.style.background = color.errorLight; e.currentTarget.style.color = color.error }}
            onMouseLeave={e => { e.currentTarget.style.background = color.grey100; e.currentTarget.style.color = color.grey500 }}
          ><Icon name="close" size={10} /></button>
        </div>
        {editing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(estado.name); setEditing(false) } }}
              style={{ width: 90, padding: '3px 6px', borderRadius: 6, border: `1px solid ${estado.color}`, fontSize: 11, textAlign: 'center', outline: 'none', fontFamily: font.family, color: color.grey800 }}
            />
            <button onClick={commit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: estado.color, padding: 2, display: 'flex' }}>
              <Icon name="check" size={12} />
            </button>
          </div>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 500, color: color.grey800, textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{estado.name}</span>
        )}
      </div>
      {!isLast && (
        <>
          <div style={{ width: 32, height: 2, background: color.borderDefault }} />
          <Icon name="chevron_right" size={14} color={color.grey400} style={{ marginLeft: -6, marginRight: 4 }} />
        </>
      )}
    </div>
  )
}

function EstadosTab() {
  const [estados, setEstados] = useState(INITIAL_ESTADOS)
  const [colorIdx, setColorIdx] = useState(0)
  const rename = (id: string, name: string) => setEstados(p => p.map(e => e.id === id ? { ...e, name } : e))
  const remove = (id: string) => setEstados(p => p.filter(e => e.id !== id))
  const addEstado = () => {
    const stateColor = STATE_COLORS[colorIdx % STATE_COLORS.length]
    setEstados(prev => [...prev, { id: `s${Date.now()}`, name: 'Nuevo estado', color: stateColor }])
    setColorIdx(i => i + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xBig }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: color.grey900 }}>Workflows</h2>
          <p style={{ margin: 0, fontSize: 12, color: color.grey500, lineHeight: 1.5 }}>
            Los workflows definen los estados del Kanban para este agente.
          </p>
        </div>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, border: 'none', background: color.primary, fontSize: 12, fontWeight: 600, color: 'white', cursor: 'pointer', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        ><Icon name="view_kanban" size={14} /> Ver Kanban</button>
      </div>
      <div style={{ background: 'white', borderRadius: radius.lg + 2, border: `1px solid ${color.primaryUltraLight}`, padding: `${spacing.xxxBig}px ${spacing.xBig}px` }}>
        <p style={{ margin: `0 0 ${spacing.xBig}px`, fontSize: 11, fontWeight: 600, color: color.grey500, textTransform: 'uppercase', letterSpacing: 1 }}>Flujo de estados</p>
        <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 0, rowGap: spacing.xBig }}>
          {estados.map((e, i) => (
            <EstadoNode key={e.id} estado={e} onRename={rename} onRemove={remove} isLast={i === estados.length - 1} />
          ))}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: -20, gap: 0 }}>
            {estados.length > 0 && (
              <>
                <div style={{ width: 32, height: 2, background: color.borderDefault }} />
                <Icon name="chevron_right" size={14} color={color.grey400} style={{ marginLeft: -6, marginRight: 4 }} />
              </>
            )}
            <button onClick={addEstado}
              style={{ width: 48, height: 48, borderRadius: '50%', border: `2px dashed ${color.primaryLight}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.primary, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = color.primaryUltraLight; (e.currentTarget.style as any).borderStyle = 'solid' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; (e.currentTarget.style as any).borderStyle = 'dashed' }}
            ><Icon name="add" size={16} /></button>
          </div>
        </div>
        <p style={{ margin: `${spacing.xBig}px 0 0`, fontSize: 12, color: color.grey500 }}>
          Hacé click en un estado para renombrarlo · Los estados definen las columnas del Kanban
        </p>
      </div>
    </div>
  )
}

// ── SubagentesTab ──────────────────────────────────────────────────────────────

interface SubAgent { id: string; name: string; description: string; nodeCount: number; trigger: string; mcps: number; bases: number; code: number; nodeTypes?: string[] }

const INITIAL_SUBAGENTS: SubAgent[] = [
  { id: 'sa1', name: 'Tomar pedido', description: 'Recibe el pedido del cliente, confirma ítems y registra en sistema', nodeCount: 7, nodeTypes: ['Instrucción', 'Instrucción', 'Condicional', 'Loop', 'Instrucción', 'Instrucción', 'Instrucción'], trigger: 'Cuando el cliente menciona que quiere hacer un pedido, dice "quiero pedir", "me gustaría ordenar" o cualquier variante que indique intención de compra, incluyendo cuando envía una foto del menú', mcps: 1, bases: 1, code: 1 },
  { id: 'sa2', name: 'Confirmar y pagar', description: 'Muestra resumen del pedido, genera link de pago y confirma', nodeCount: 5, nodeTypes: ['Instrucción', 'Instrucción', 'Condicional', 'Instrucción', 'Instrucción'], trigger: 'Cuando el pedido está completo y el cliente confirma los ítems seleccionados, se activa para generar el resumen final con precios, aplicar descuentos vigentes y enviar el link de pago por MercadoPago', mcps: 1, bases: 0, code: 0 },
  { id: 'sa3', name: 'Consultar estado', description: 'Responde al cliente sobre el estado actual de su pedido en curso', nodeCount: 4, nodeTypes: ['Instrucción', 'Condicional', 'Instrucción', 'Instrucción'], trigger: 'Cuando el cliente pregunta por el estado de su pedido, quiere saber dónde está su delivery, consulta el tiempo estimado de entrega o pide el número de seguimiento del envío', mcps: 2, bases: 0, code: 0 },
  { id: 'sa4', name: 'Cancelar pedido', description: 'Gestiona la cancelación, notifica a cocina y genera reembolso si aplica', nodeCount: 6, trigger: 'Este flujo se activa cuando el cliente manifiesta intención de cancelar su pedido actual. Esto incluye cuando dice explícitamente "quiero cancelar", "ya no quiero el pedido", "cancélame la orden" o variantes similares. También se activa cuando el cliente indica que hubo un error grave en la orden que no puede corregirse editando (por ejemplo, pidió para la dirección equivocada o seleccionó productos totalmente diferentes a los que quería). En caso de que el pedido ya haya sido preparado o esté en camino, el flujo debe verificar el estado actual consultando el sistema de logística antes de proceder. Si el pedido está en estado "preparando" o posterior, se requiere confirmación adicional del cliente informándole que podría haber un cargo parcial. El reembolso se gestiona automáticamente via MercadoPago si el pago fue digital, pero si fue en efectivo contra entrega se genera un crédito en cuenta para futuros pedidos. Adicionalmente, este flujo notifica a cocina para que detenga la preparación si aún es posible, actualiza el estado en el kanban a "Cancelado" y envía un mensaje de confirmación al cliente con el número de caso para seguimiento. Si el cliente cancela más de 3 pedidos en 30 días, se marca una alerta para revisión del equipo de operaciones.', mcps: 0, bases: 0, code: 0 },
  { id: 'sa5', name: 'Llamado a obtener infracciones + envío libre deuda', description: 'Consulta infracciones del usuario y envía certificado de libre deuda', nodeCount: 12, trigger: 'Cuando el usuario solicita un certificado de libre deuda o quiere consultar si tiene infracciones pendientes de pago en el sistema municipal', mcps: 2, bases: 1, code: 3 },
  { id: 'sa6', name: 'Nuevo flujo', description: '', nodeCount: 0, trigger: '', mcps: 0, bases: 0, code: 0 },
]

function FlowRow({ sa, onSelect, onRemove, onTest }: { sa: SubAgent; onSelect: (sa: SubAgent) => void; onRemove: (id: string) => void; onTest: (sa: SubAgent) => void }) {
  const [hovered, setHovered] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const hasTrigger = !!sa.trigger

  return (
    <>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onClick={() => onSelect(sa)}
        style={{ display: 'flex', alignItems: expanded ? 'flex-start' : 'center', gap: spacing.sm, padding: `${spacing.sm}px ${spacing.sm}px`, background: hovered ? color.grey50 : 'white', borderBottom: `1px solid ${color.borderSubtle}`, transition: 'background 0.1s', cursor: 'pointer' }}
      >
        <div style={{ width: 32, height: 32, borderRadius: radius.md, flexShrink: 0, background: color.primaryUltraLight, border: `1px solid ${color.primaryLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: expanded ? 2 : 0 }}>
          <Icon name="route" size={16} color={color.primary} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: color.grey900 }}>{sa.name}</div>
          {hasTrigger && <div style={{ fontSize: 11.5, color: color.grey500, marginTop: 1, lineHeight: 1.5, overflow: 'hidden', textOverflow: expanded ? undefined : 'ellipsis', whiteSpace: expanded ? 'normal' : 'nowrap', transition: 'all 0.2s ease' }}>{sa.trigger}</div>}
        </div>
        <div onClick={e => e.stopPropagation()} style={{ width: 130, flexShrink: 0, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <button onClick={() => onTest(sa)} title="Probar lógica"
            style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
          ><Icon name="play_arrow" size={18} /></button>
          <button onClick={() => onSelect(sa)} title="Abrir flujo"
            style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
          ><Icon name="arrow_forward" size={16} /></button>
          <button title="Editar metadata"
            style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
          ><Icon name="edit" size={16} /></button>
          <button onClick={() => setConfirmDelete(true)} title="Eliminar"
            style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.color = color.error; e.currentTarget.style.background = color.errorLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
          ><Icon name="delete" size={16} /></button>
        </div>
        {hasTrigger && (
          <button onClick={e => { e.stopPropagation(); setExpanded(ex => !ex) }} style={{ width: 28, height: 28, borderRadius: radius.sm, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey400, flexShrink: 0, transition: 'all 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = color.grey100)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          ><Icon name="expand_more" size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} /></button>
        )}
      </div>
      {confirmDelete && createPortal(
        <>
          <div onClick={() => setConfirmDelete(false)} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 9001, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '28px 28px 24px', width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', pointerEvents: 'all', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xSm, animation: 'scaleIn 0.15s ease' }}>
              <div style={{ width: 52, height: 52, borderRadius: 100, background: color.errorLight, border: `1px solid ${color.errorDark}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="warning" size={24} color={color.error} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: color.grey900 }}>¿Eliminar "{sa.name}"?</p>
                <p style={{ margin: 0, fontSize: 13, color: color.grey600, lineHeight: 1.5 }}>Se eliminará este flujo y todos sus nodos.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, width: '100%' }}>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', fontSize: 13, fontWeight: 600, color: color.grey800, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={() => { setConfirmDelete(false); onRemove(sa.id) }} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: 'none', background: color.error, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Eliminar</button>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </>
  )
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ position: 'relative', width: 220 }}>
      <Icon name="search" size={15} color={color.grey400} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', boxSizing: 'border-box', padding: '7px 12px 7px 32px', borderRadius: radius.sm, border: `1px solid ${color.borderDefault}`, fontSize: 12.5, color: color.grey800, outline: 'none', background: color.grey50, fontFamily: font.family }}
        onFocus={e => { e.currentTarget.style.borderColor = color.primary; e.currentTarget.style.background = 'white' }}
        onBlur={e => { e.currentTarget.style.borderColor = color.borderDefault; e.currentTarget.style.background = color.grey50 }}
      />
    </div>
  )
}

// ── V2 helpers compartidos por los tabs sin recurso "marketplace" ─────────────
// Empty state centrado de V2: idéntico look al banner del MCP/App/Code en V2,
// pero sin chip de tipo/destructiva, con hint apuntando al catálogo de abajo.
function V2EmptyState({
  icon, iconBg, title, description,
}: {
  icon:        React.ReactNode
  iconBg:      string
  title:       string
  description: string
}) {
  return (
    <div style={{
      background: 'white',
      border: `1px solid ${color.borderDefault}`,
      borderRadius: radius.lg,
      padding: '40px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: 14,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 18,
        background: iconBg,
        border: `1px solid ${color.borderDefault}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 12px 28px -8px rgba(15,23,42,0.16), 0 2px 6px rgba(15,23,42,0.05)',
      }}>{icon}</div>
      <div style={{ maxWidth: 460 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: color.grey900 }}>{title}</h3>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: color.grey500, lineHeight: 1.55 }}>{description}</p>
      </div>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11.5, fontWeight: 600, color: color.grey500, marginTop: 4,
      }}>
        <Icon name="south" size={12} /> O elegí uno de los disponibles abajo
      </span>
    </div>
  )
}

// Card chiquita para items del catálogo del workspace en V2 (Lógicas, Bases,
// Automatizaciones). Mismo lenguaje visual que las cards de V2 MCP/App/Code.
function V2CatalogCard({
  iconNode, iconBg, iconBorder, name, meta, isAdded, onAdd, onRemove,
}: {
  iconNode:   React.ReactNode
  iconBg:     string
  iconBorder: boolean
  name:       string
  meta?:      string
  isAdded:    boolean
  onAdd:      () => void
  onRemove?:  () => void
}) {
  return (
    <div style={{
      background: 'white',
      border: `1px solid ${isAdded ? color.success + '60' : color.borderDefault}`,
      borderRadius: radius.lg,
      transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
      boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
    }}
      onMouseEnter={e => { if (!isAdded) { e.currentTarget.style.borderColor = color.primaryLight; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 14px -6px rgba(48,79,254,0.18)' } }}
      onMouseLeave={e => { if (!isAdded) { e.currentTarget.style.borderColor = color.borderDefault; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.03)' } }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: iconBg,
        border: iconBorder ? `1px solid ${color.borderSubtle}` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{iconNode}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: color.grey900, lineHeight: 1.2 }}>{name}</div>
        {meta && (
          <div style={{ marginTop: 2, fontSize: 11.5, color: color.grey500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {meta}
          </div>
        )}
      </div>
      {isAdded ? (
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
            padding: '5px 10px', borderRadius: 100,
            border: `1px solid ${color.success}40`,
            background: color.successLight, color: color.successDark,
            fontSize: 11, fontWeight: 700, cursor: onRemove ? 'pointer' : 'default',
          }}
          title={onRemove ? 'Click para quitar' : undefined}
          onClick={onRemove}
        >
          <Icon name="check" size={11} /> Agregada
        </span>
      ) : (
        <button onClick={onAdd}
          style={{
            padding: '6px 14px', borderRadius: 100,
            border: `1px solid ${color.primaryLight}`,
            background: 'white', color: color.primary,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'all 0.12s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = color.primaryUltraLight }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
        >
          <Icon name="add" size={12} /> Agregar
        </button>
      )}
    </div>
  )
}

// Workspace catalog mock para Lógicas (templates de flujos comunes que el
// admin tiene compartidos a nivel workspace).
interface WorkspaceLogica {
  id:          string
  name:        string
  description: string
  trigger:     string
  nodeCount:   number
  icon:        string
}
const WORKSPACE_LOGICAS: WorkspaceLogica[] = [
  { id: 'wl-pedidos',  name: 'Tomar pedido',          description: 'Recibe el pedido del cliente, confirma ítems y registra en sistema.',  trigger: 'Cuando el cliente quiere comprar',         nodeCount: 7, icon: 'shopping_cart' },
  { id: 'wl-pago',     name: 'Confirmar y pagar',     description: 'Genera el link de pago y confirma la operación.',                       trigger: 'Cuando el pedido está listo',              nodeCount: 5, icon: 'payments' },
  { id: 'wl-estado',   name: 'Consultar estado',      description: 'Responde con el estado actual de la orden.',                            trigger: 'Cuando pregunta por su pedido',            nodeCount: 4, icon: 'inventory_2' },
  { id: 'wl-faq',      name: 'Preguntas frecuentes',  description: 'Resuelve dudas generales sobre horarios, métodos de pago y zonas.',     trigger: 'Consultas generales',                      nodeCount: 3, icon: 'quiz' },
  { id: 'wl-leads',    name: 'Captura de leads',      description: 'Recolecta info de contacto cuando el cliente todavía no compró.',       trigger: 'Cliente potencial sin registro',           nodeCount: 4, icon: 'contact_page' },
  { id: 'wl-soporte',  name: 'Escalar a humano',      description: 'Deriva la conversación a un operador en vivo.',                         trigger: 'Reclamo o caso complejo',                  nodeCount: 3, icon: 'support_agent' },
]

function SubagentesTabV2({ onSelect, onTest: _onTest }: { onSelect: (sa: SubAgent) => void; onTest: (sa: SubAgent) => void }) {
  const [items, setItems] = useState<SubAgent[]>([])
  const [search, setSearch] = useState('')

  // Modal "Crear lógica nueva" / Editar — form simple: nombre + cuándo.
  // editingId === null → modo crear; editingId set → modo editar.
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftTrigger, setDraftTrigger] = useState('')

  const startCreate = () => {
    setEditingId(null); setDraftName(''); setDraftTrigger('')
    setModalOpen(true)
  }
  const startEdit = (sa: SubAgent) => {
    setEditingId(sa.id); setDraftName(sa.name); setDraftTrigger(sa.trigger)
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditingId(null); setDraftName(''); setDraftTrigger('') }
  const submitModal = () => {
    if (!draftName.trim() || !draftTrigger.trim()) return
    if (editingId) {
      setItems(p => p.map(sa => sa.id === editingId
        ? { ...sa, name: draftName.trim(), trigger: draftTrigger.trim() }
        : sa
      ))
    } else {
      setItems(p => [...p, {
        id: `sa-${Date.now()}`,
        name: draftName.trim(),
        description: '',
        nodeCount: 0, trigger: draftTrigger.trim(),
        mcps: 0, bases: 0, code: 0,
      }])
    }
    closeModal()
  }
  const remove = (id: string) => setItems(p => p.filter(x => x.id !== id))

  const filtered = items.filter(sa =>
    !search || sa.name.toLowerCase().includes(search.toLowerCase()) ||
    sa.trigger.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: color.grey900, letterSpacing: '-0.01em' }}>Lógicas</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: color.grey600, lineHeight: 1.6, maxWidth: 720 }}>
            Subprocesos que el agente activa según la intención del cliente. Cada lógica es un flow propio que vos diseñás en el canvas.
          </p>
        </div>
        <button onClick={startCreate}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '9px 18px', borderRadius: 100, border: 'none',
            background: color.primary, color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px -3px rgba(48,79,254,0.35)',
            transition: 'transform 0.12s, box-shadow 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(48,79,254,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -3px rgba(48,79,254,0.35)' }}
        ><Icon name="add" size={14} /> Agregar nueva</button>
      </div>

      {items.length === 0 ? (
        <V2EmptyState
          iconBg={color.primaryUltraLight}
          icon={<Icon name="route" size={30} color={color.primary} />}
          title="Sumá lógicas al agente"
          description="Creá un flujo para que el agente derive en subprocesos: tomar pedido, consultar estado, escalar a humano…"
        />
      ) : (
        <>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar lógica..." />
          {filtered.length === 0 ? (
            <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, padding: '40px 20px', textAlign: 'center' }}>
              <Icon name="search_off" size={32} color={color.grey400} />
              <p style={{ margin: '10px 0 4px', fontSize: 13, fontWeight: 600, color: color.grey800 }}>Sin resultados</p>
            </div>
          ) : (
            <div style={{
              background: 'white', borderRadius: radius.lg,
              border: `1px solid ${color.borderDefault}`,
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            }}>
              {filtered.map((sa, i) => (
                <V2OwnedRow key={sa.id}
                  iconNode={<Icon name="route" size={22} color={color.primary} />}
                  iconBg={color.primaryUltraLight}
                  name={sa.name}
                  typeLabel={`${sa.nodeCount} pasos`}
                  description={sa.trigger}
                  onClick={() => onSelect(sa)}
                  onEdit={() => startEdit(sa)}
                  onDelete={() => remove(sa.id)}
                  isLast={i === filtered.length - 1}
                />
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <V2Modal
          icon={<Icon name="route" size={20} color={color.primary} />}
          iconBg={color.primaryUltraLight}
          title={editingId ? 'Editar lógica' : 'Crear lógica nueva'}
          subtitle={editingId ? 'Cambiá nombre o trigger sin perder los pasos del flujo' : 'El agente la activa cuando detecta el trigger correspondiente'}
          onClose={closeModal}
          footer={
            <>
              <button onClick={closeModal}
                style={{ padding: '8px 16px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', color: color.grey700, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >Cancelar</button>
              <button onClick={submitModal} disabled={!draftName.trim() || !draftTrigger.trim()}
                style={{
                  padding: '8px 18px', borderRadius: 100, border: 'none',
                  background: (draftName.trim() && draftTrigger.trim()) ? color.primary : color.grey200,
                  color:      (draftName.trim() && draftTrigger.trim()) ? 'white' : color.grey500,
                  fontSize: 13, fontWeight: 700,
                  cursor:     (draftName.trim() && draftTrigger.trim()) ? 'pointer' : 'default',
                }}
              >{editingId ? 'Guardar cambios' : 'Crear lógica'}</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700 }}>Nombre</label>
              <input value={draftName} onChange={e => setDraftName(e.target.value)}
                placeholder="Ej: Tomar pedido"
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  borderRadius: radius.md, border: `1px solid ${color.borderDefault}`,
                  fontSize: 13, color: color.grey900, outline: 'none', fontFamily: font.family,
                  background: 'white',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700 }}>¿Cuándo se activa?</label>
              <textarea value={draftTrigger} onChange={e => setDraftTrigger(e.target.value)}
                placeholder="Ej: Cuando el cliente menciona que quiere hacer un pedido."
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  borderRadius: radius.md, border: `1px solid ${color.borderDefault}`,
                  fontSize: 13, color: color.grey900, outline: 'none', fontFamily: font.family,
                  background: 'white', resize: 'vertical',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
              />
            </div>
            {!editingId && (
              <p style={{ margin: 0, fontSize: 11.5, color: color.grey500, lineHeight: 1.5 }}>
                Después de crearla, click en la fila para abrir el editor de pasos.
              </p>
            )}
          </div>
        </V2Modal>
      )}
    </div>
  )
}

function SubagentesTab({ onSelect, onTest }: { onSelect: (sa: SubAgent) => void; onTest: (sa: SubAgent) => void }) {
  const [items, setItems] = useState<SubAgent[]>([])
  const [search, setSearch] = useState('')
  const filtered = items.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.trigger.toLowerCase().includes(search.toLowerCase()))
  const isEmpty = items.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      {!isEmpty && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: color.grey900, letterSpacing: '-0.01em' }}>Lógicas</h2>
            <p style={{ margin: 0, fontSize: 13.5, color: color.grey600, lineHeight: 1.6, maxWidth: 600 }}>
              Las lógicas son subprocesos que el agente activa según la intención del cliente.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm, flexShrink: 0, marginTop: 4 }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar flujo..." />
            <button
              onClick={() => filtered[0] && onTest(filtered[0])}
              title="Abre el tester con el primer flujo de la lista"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, border: `1px solid ${color.primary}`, background: 'white', fontSize: 12.5, fontWeight: 600, color: color.primary, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            ><Icon name="play_arrow" size={14} /> Probar lógica</button>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 15px', borderRadius: 100, border: 'none', background: color.primary, fontSize: 12.5, fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            ><Icon name="add" size={13} /> Nuevo flujo</button>
          </div>
        </div>
      )}
      {isEmpty ? (
        <TabEmptyBanner
          iconBg={color.primaryUltraLight}
          icon={<Icon name="route" size={36} color={color.primary} />}
          status="Sumá lógicas al agente"
          hint="Las lógicas son subprocesos que el agente activa cuando detecta una intención específica del cliente: tomar un pedido, consultar el estado o escalar a humano."
          ctaLabel="Agregar lógica"
          onCta={() => setItems(INITIAL_SUBAGENTS.slice(0, 3))}
        />
      ) : (
        <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xSm, padding: `${spacing.xxSm}px ${spacing.sm}px`, background: color.primaryUltraLight, borderBottom: `1px solid ${color.primaryLight}` }}>
            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color.primary }}>Flujo</span>
            <span style={{ width: 130 }} />
          </div>
          {filtered.map(sa => (
            <FlowRow
              key={sa.id}
              sa={sa}
              onSelect={onSelect}
              onRemove={id => setItems(p => p.filter(x => x.id !== id))}
              onTest={onTest}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Empty state clásico que reusa el mismo lenguaje visual que ResourceEmptyState
// (centrado vertical, icono 88x88 con halo, título h2 + hint, CTA primario).
// Lo usan Lógicas / Bases / Automatizaciones — los tabs sin catálogo workspace.
function TabEmptyBanner({
  icon, iconBg, status, hint, ctaLabel, onCta,
}: {
  icon:      React.ReactNode
  iconBg:    string
  status:    string
  hint:      string
  ctaLabel?: string
  onCta?:    () => void
}) {
  return (
    <div style={{ padding: '64px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      <div style={{
        width: 88, height: 88, borderRadius: 22,
        background: iconBg,
        border: `1px solid ${color.borderDefault}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 16px 32px -10px rgba(15,23,42,0.18), 0 3px 8px rgba(15,23,42,0.06)',
      }}>{icon}</div>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: color.grey900 }}>{status}</h2>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: color.grey500, lineHeight: 1.6 }}>{hint}</p>
      </div>
      {ctaLabel && onCta && (
        <button onClick={onCta}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '11px 22px', borderRadius: 100, border: 'none',
            background: color.primary, color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 8px 24px -6px rgba(48,79,254,0.45)',
          }}
        ><Icon name="add" size={14} /> {ctaLabel}</button>
      )}
    </div>
  )
}

// ── BasesTab ──────────────────────────────────────────────────────────────────

interface BaseItem { id: string; name: string; source: string; sourceIcon: string; sourceFile: string; docCount: number; when: string; origin: 'global' | 'process'; flowName?: string }

const INITIAL_BASES: BaseItem[] = [
  { id: 'b1', name: 'FAQ General', source: 'Google Drive', sourceIcon: 'cloud', sourceFile: 'faq-general.gdoc', docCount: 24, when: 'Cuando el cliente hace preguntas frecuentes sobre el servicio, horarios de atención, métodos de pago aceptados, zonas de cobertura de delivery o cualquier consulta general que no requiera acceso al sistema de pedidos', origin: 'global' },
  { id: 'b2', name: 'Catálogo de Productos', source: 'Notion', sourceIcon: 'link', sourceFile: 'notion.so/catalogo-productos', docCount: 156, when: 'Cuando necesita buscar productos disponibles, verificar precios actualizados, consultar stock, revisar ingredientes o alérgenos, o mostrar opciones filtradas por categoría al cliente', origin: 'global' },
  { id: 'b3', name: 'Políticas internas', source: 'PDF Upload', sourceIcon: 'picture_as_pdf', sourceFile: 'politicas-internas-v3.pdf', docCount: 8, when: 'Cuando el cliente consulta sobre políticas de cambios y devoluciones, garantías de productos, tiempos máximos de reclamo, condiciones de envío gratuito o procedimientos de reembolso', origin: 'global' },
  { id: 'b4', name: 'Menú del restaurante', source: 'Google Sheets', sourceIcon: 'table_chart', sourceFile: 'menu-2026.xlsx', docCount: 3, when: '', origin: 'process', flowName: 'Tomar pedido' },
]

// Workspace catalog — bases que existen a nivel workspace, algunas ya están
// asignadas al agente actual (matchean por id con INITIAL_BASES) y otras no.
// El "usedInAgents" cuenta cuántos otros agentes la tienen, para dar contexto
// de reuso ("ah, esto es compartido").
interface WorkspaceBase {
  id:           string
  name:         string
  source:       string
  sourceIcon:   string
  docCount:     number
  type:         'link' | 'file' | 'text'
  usedInAgents: number
}

const INITIAL_WORKSPACE_BASES: WorkspaceBase[] = [
  { id: 'b1', name: 'FAQ General',           source: 'Google Drive',  sourceIcon: 'cloud',         docCount: 24,  type: 'link', usedInAgents: 3 },
  { id: 'b2', name: 'Catálogo de Productos', source: 'Notion',        sourceIcon: 'link',          docCount: 156, type: 'link', usedInAgents: 2 },
  { id: 'b3', name: 'Políticas internas',    source: 'PDF Upload',    sourceIcon: 'picture_as_pdf', docCount: 8,   type: 'file', usedInAgents: 5 },
  { id: 'b4', name: 'Menú del restaurante',  source: 'Google Sheets', sourceIcon: 'table_chart',   docCount: 3,   type: 'link', usedInAgents: 1 },
  // Estas tres NO están en el agente actual — el user las puede sumar desde el drawer
  { id: 'b5', name: 'Onboarding de empleados', source: 'Notion',      sourceIcon: 'link',          docCount: 18,  type: 'link', usedInAgents: 1 },
  { id: 'b6', name: 'Términos y condiciones', source: 'PDF Upload',  sourceIcon: 'picture_as_pdf', docCount: 4,   type: 'file', usedInAgents: 4 },
  { id: 'b7', name: 'Brief de marca',         source: 'Texto',       sourceIcon: 'description',   docCount: 1,   type: 'text', usedInAgents: 0 },
]

function BasesTab() {
  const [bases, setBases]                 = useState<BaseItem[]>([])
  const [workspaceBases, setWorkspaceBases] = useState(INITIAL_WORKSPACE_BASES)
  const [search, setSearch]               = useState('')
  const [showAddDrawer, setShowAddDrawer] = useState(false)
  const filtered = bases.filter(b =>
       b.name.toLowerCase().includes(search.toLowerCase())
    || b.source.toLowerCase().includes(search.toLowerCase())
    || (b.flowName?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )
  const isEmpty = bases.length === 0

  // Add an existing workspace base to the current agent with its activation rule.
  const addBaseFromWorkspace = (wb: WorkspaceBase, when: string) => {
    if (bases.some(b => b.id === wb.id)) return
    setBases(p => [...p, {
      id: wb.id,
      name: wb.name,
      source: wb.source,
      sourceIcon: wb.sourceIcon,
      sourceFile: '',
      docCount: wb.docCount,
      when,
      origin: 'global',
    }])
  }

  const removeBaseFromAgent = (id: string) => setBases(p => p.filter(x => x.id !== id))

  // Upload a new base to the workspace AND auto-assign to this agent.
  const uploadAndAdd = (newBase: WorkspaceBase, when: string) => {
    setWorkspaceBases(p => [...p, newBase])
    addBaseFromWorkspace(newBase, when)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      {!isEmpty && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: color.grey900, letterSpacing: '-0.01em' }}>Bases</h2>
            <p style={{ margin: 0, fontSize: 13.5, color: color.grey600, lineHeight: 1.6, maxWidth: 600 }}>
              Documentos y fuentes que alimentan al agente con información específica de tu negocio.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 4 }}>
            <button
              onClick={() => setShowAddDrawer(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 100, border: 'none',
                background: color.primary, color: 'white',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 12px -3px rgba(48,79,254,0.35)',
                transition: 'transform 0.12s, box-shadow 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(48,79,254,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -3px rgba(48,79,254,0.35)' }}
            ><Icon name="add" size={14} /> Agregar base</button>
          </div>
        </div>
      )}

      {!isEmpty && <SearchInput value={search} onChange={setSearch} placeholder="Buscar base..." />}

      {showAddDrawer && (
        <AddBaseDrawer
          workspaceBases={workspaceBases}
          assignedIds={new Set(bases.map(b => b.id))}
          onAddExisting={addBaseFromWorkspace}
          onRemoveFromAgent={removeBaseFromAgent}
          onUploadAndAdd={uploadAndAdd}
          onClose={() => setShowAddDrawer(false)}
        />
      )}

      {isEmpty ? (
        <TabEmptyBanner
          iconBg="#EFF6FF"
          icon={<Icon name="menu_book" size={36} color="#2563EB" />}
          status="Sumá bases al agente"
          hint="Conectá fuentes (Drive, Notion, PDF o texto) para que el agente responda con información actualizada de tu negocio."
          ctaLabel="Agregar base"
          onCta={() => setShowAddDrawer(true)}
        />
      ) : filtered.length > 0 ? (
        <div style={{
          background: 'white', borderRadius: radius.lg,
          border: `1px solid ${color.borderDefault}`,
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        }}>
          {filtered.map((b, i) => (
            <BaseRow
              key={b.id}
              base={b}
              isLast={i === filtered.length - 1}
              onRemove={id => setBases(p => p.filter(x => x.id !== id))}
            />
          ))}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, padding: '40px 20px', textAlign: 'center' }}>
          <Icon name="search_off" size={32} color={color.grey400} />
          <p style={{ margin: '10px 0 4px', fontSize: 13, fontWeight: 600, color: color.grey800 }}>Sin resultados</p>
          <p style={{ margin: 0, fontSize: 12, color: color.grey500 }}>Probá con otra palabra.</p>
        </div>
      )}
    </div>
  )
}

// Bases V2: mismo patrón listado que MCPListV2 — fila con icono + nombre +
// fuente + descripción a la izquierda, botón "Conectar" a la derecha.
const V2_FLOW_BOUND_BASES: Record<string, string[]> = {
  'b4': ['Tomar pedido'],
  'b3': ['Tomar pedido', 'Consultar estado'], // ejemplo de base usada en 2 lógicas
}

function BasesTabV2() {
  const [bases, setBases] = useState<BaseItem[]>([])
  const [workspace] = useState<WorkspaceBase[]>(INITIAL_WORKSPACE_BASES)
  const [showAddDrawer, setShowAddDrawer] = useState(false)
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<V2SortMode>('recomendado')
  const assignedIds = new Set(bases.map(b => b.id))

  // Modal "Conectar": pide "cuándo se va a usar" antes de agregar.
  const [connectingWbId, setConnectingWbId] = useState<string | null>(null)
  const [whenText, setWhenText] = useState('')

  const startConnect = (wb: WorkspaceBase) => {
    setConnectingWbId(wb.id)
    setWhenText('')
  }
  const closeConnect = () => { setConnectingWbId(null); setWhenText('') }
  const confirmConnect = () => {
    const wb = workspace.find(w => w.id === connectingWbId)
    if (!wb || !whenText.trim()) return
    setBases(p => [...p, {
      id: wb.id, name: wb.name, source: wb.source, sourceIcon: wb.sourceIcon,
      sourceFile: '', docCount: wb.docCount,
      when: whenText.trim(), origin: 'global',
    }])
    closeConnect()
  }

  const removeFromAgent = (id: string) => setBases(p => p.filter(x => x.id !== id))
  const uploadAndAdd = (newBase: WorkspaceBase, when: string) => {
    setBases(p => [...p, {
      id: newBase.id, name: newBase.name, source: newBase.source, sourceIcon: newBase.sourceIcon,
      sourceFile: '', docCount: newBase.docCount,
      when, origin: 'global',
    }])
  }
  const sourceIconFor = (source: string) =>
       source.includes('PDF')    ? 'picture_as_pdf'
     : source.includes('Sheets') ? 'table_chart'
     : source.includes('Drive')  ? 'cloud'
     : source.includes('Notion') ? 'link'
     : source.includes('Texto')  ? 'description'
     : 'menu_book'

  const filtered = workspace.filter(wb =>
    !search ||
    wb.name.toLowerCase().includes(search.toLowerCase()) ||
    wb.source.toLowerCase().includes(search.toLowerCase())
  )

  // Cada wb expande a una o más filas: una por cada lógica que lo usa, más
  // un slot "main" con rowKey estable. Apretar Conectar sólo intercambia el
  // botón por el chip "Conectado para el agente" sin reordenar la lista.
  type BaseDisplayRow = {
    wb:        WorkspaceBase
    rowKey:    string
    status:    V2RowStatus
    flowName?: string
  }
  const buildRows = (): BaseDisplayRow[] => {
    const rows: BaseDisplayRow[] = []
    filtered.forEach(wb => {
      const flows = V2_FLOW_BOUND_BASES[wb.id] ?? []
      flows.forEach(flowName => {
        rows.push({ wb, rowKey: `${wb.id}-flow-${flowName}`, status: 'flow', flowName })
      })
      const isGlobal = assignedIds.has(wb.id)
      rows.push({ wb, rowKey: `${wb.id}-main`, status: isGlobal ? 'global' : 'available' })
    })
    return rows
  }

  const statusOrder = (r: BaseDisplayRow) =>
    r.status === 'global' ? 0 : r.status === 'flow' ? 1 : 2

  // Orden congelado — sólo se recalcula cuando cambian search, sortMode o
  // el set de bases del workspace.
  const [orderedKeys, setOrderedKeys] = useState<string[]>([])
  useEffect(() => {
    const rows = buildRows()
    rows.sort((a, b) => {
      if (sortMode === 'nombre') {
        return a.wb.name.localeCompare(b.wb.name) || statusOrder(a) - statusOrder(b)
      }
      if (sortMode === 'tipo') {
        return a.wb.source.localeCompare(b.wb.source)
            || a.wb.name.localeCompare(b.wb.name)
            || statusOrder(a) - statusOrder(b)
      }
      return statusOrder(a) - statusOrder(b) || a.wb.name.localeCompare(b.wb.name)
    })
    setOrderedKeys(rows.map(r => r.rowKey))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortMode, workspace])

  const liveRowsByKey = new Map(buildRows().map(r => [r.rowKey, r]))
  const sorted = orderedKeys.map(k => liveRowsByKey.get(k)).filter(Boolean) as BaseDisplayRow[]

  const connectingWb = connectingWbId ? workspace.find(w => w.id === connectingWbId) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: color.grey900, letterSpacing: '-0.01em' }}>Bases</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: color.grey600, lineHeight: 1.6, maxWidth: 720 }}>
            Documentos y fuentes que alimentan al agente con información específica del negocio.
          </p>
        </div>
        <button onClick={() => setShowAddDrawer(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '9px 18px', borderRadius: 100, border: 'none',
            background: color.primary, color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px -3px rgba(48,79,254,0.35)',
            transition: 'transform 0.12s, box-shadow 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(48,79,254,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -3px rgba(48,79,254,0.35)' }}
        ><Icon name="add" size={14} /> Agregar nuevo</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar base..." />
        </div>
        <V2SortDropdown value={sortMode} onChange={setSortMode}
          options={['recomendado', 'estado', 'nombre', 'tipo']}
        />
      </div>

      {sorted.length === 0 ? (
        <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, padding: '40px 20px', textAlign: 'center' }}>
          <Icon name="search_off" size={32} color={color.grey400} />
          <p style={{ margin: '10px 0 4px', fontSize: 13, fontWeight: 600, color: color.grey800 }}>Sin resultados</p>
          <p style={{ margin: 0, fontSize: 12, color: color.grey500 }}>Probá con otra palabra.</p>
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: radius.lg,
          border: `1px solid ${color.borderDefault}`,
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        }}>
          {sorted.map((row, i) => (
            <V2ListRow key={row.rowKey}
              iconNode={<Icon name={sourceIconFor(row.wb.source)} size={22} color={color.primary} />}
              iconBg={color.primaryUltraLight}
              iconBorder={false}
              name={row.wb.name}
              typeLabel={row.wb.source}
              description={`${row.wb.docCount} ${row.wb.docCount === 1 ? 'documento' : 'documentos'} indexado${row.wb.docCount === 1 ? '' : 's'}.`}
              status={row.status}
              flowName={row.flowName}
              onConnect={() => startConnect(row.wb)}
              onClickConnected={() => removeFromAgent(row.wb.id)}
              isLast={i === sorted.length - 1}
            />
          ))}
        </div>
      )}

      {showAddDrawer && (
        <AddBaseDrawer
          workspaceBases={workspace}
          assignedIds={assignedIds}
          onAddExisting={(wb, when) => uploadAndAdd(wb, when)}
          onRemoveFromAgent={removeFromAgent}
          onUploadAndAdd={uploadAndAdd}
          onClose={() => setShowAddDrawer(false)}
        />
      )}

      {/* Modal Conectar base: pide cuándo se va a usar antes de agregar. */}
      {connectingWb && (
        <V2Modal
          icon={<Icon name={sourceIconFor(connectingWb.source)} size={20} color={color.primary} />}
          iconBg={color.primaryUltraLight}
          title={`Conectar ${connectingWb.name}`}
          subtitle={`${connectingWb.source} · ${connectingWb.docCount} ${connectingWb.docCount === 1 ? 'documento' : 'documentos'}`}
          onClose={closeConnect}
          footer={
            <>
              <button onClick={closeConnect}
                style={{ padding: '8px 16px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', color: color.grey700, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >Cancelar</button>
              <button onClick={confirmConnect} disabled={!whenText.trim()}
                style={{
                  padding: '8px 18px', borderRadius: 100, border: 'none',
                  background: whenText.trim() ? color.primary : color.grey200,
                  color:      whenText.trim() ? 'white' : color.grey500,
                  fontSize: 13, fontWeight: 700,
                  cursor:     whenText.trim() ? 'pointer' : 'default',
                }}
              >Conectar al agente</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
              ¿Cuándo va a ser utilizada?
            </label>
            <textarea value={whenText} onChange={e => setWhenText(e.target.value)}
              placeholder={`Ej: Cuando el cliente consulta sobre ${connectingWb.name.toLowerCase()}.`}
              rows={3}
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                borderRadius: radius.md, border: `1px solid ${color.borderDefault}`,
                fontSize: 13, color: color.grey900, outline: 'none', fontFamily: font.family,
                background: 'white', resize: 'vertical', transition: 'border-color 0.12s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
              onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
            />
          </div>
        </V2Modal>
      )}
    </div>
  )
}

function BaseRow({ base: b, onRemove, isLast }: { base: BaseItem; onRemove?: (id: string) => void; isLast?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const isGlobal = b.origin === 'global'
  const sourceIconName =
       b.source.includes('PDF')    ? 'picture_as_pdf'
     : b.source.includes('Notion') ? 'link'
     : b.source.includes('Sheets') ? 'table_chart'
     :                                'cloud'
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '14px 16px',
        background: hovered ? color.grey50 : 'white',
        borderBottom: isLast ? 'none' : `1px solid ${color.borderSubtle}`,
        transition: 'background 0.12s',
        cursor: 'pointer',
      }}
    >
      {/* Source icon — primary tint, 44x44 con leve lift en hover */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: color.primaryUltraLight,
        border: `1px solid ${color.primaryLight}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.18s ease',
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}>
        <Icon name={sourceIconName} size={20} color={color.primary} />
      </div>

      {/* Texto: nombre · source / docCount + descripción "cuándo" para globales */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: isGlobal && b.when ? 4 : 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: color.grey900 }}>{b.name}</span>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: color.grey500 }}>· {b.source} · {b.docCount} docs</span>
        </div>
        {isGlobal && b.when && (
          <p style={{
            margin: 0, fontSize: 12.5, color: color.grey600, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {b.when}
          </p>
        )}
      </div>

      {/* Scope chip + acciones (acciones aparecen solo en hover) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
        {isGlobal ? (
          <span style={{
            fontSize: 11, fontWeight: 600, color: color.successDark,
            background: color.successLight, border: `1px solid ${color.success}40`,
            borderRadius: 100, padding: '4px 10px',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            whiteSpace: 'nowrap',
          }}>
            <Icon name="all_inclusive" size={11} /> En todo el agente
          </span>
        ) : (
          <span style={{
            fontSize: 11, fontWeight: 600, color: color.primary,
            background: color.primaryUltraLight, border: `1px solid ${color.primaryLight}`,
            borderRadius: 100, padding: '4px 10px',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            whiteSpace: 'nowrap',
          }}>
            <Icon name="route" size={11} /> {b.flowName}
          </span>
        )}

        <div style={{
          display: 'flex', gap: 2,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
          transition: 'opacity 0.12s, transform 0.12s',
          width: hovered ? 'auto' : 0, overflow: 'hidden',
        }}>
          <button title={isGlobal ? 'Editar' : 'Ir al flujo'}
            style={{ width: 30, height: 30, borderRadius: 8, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey500, transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight }}
            onMouseLeave={e => { e.currentTarget.style.color = color.grey500; e.currentTarget.style.background = 'transparent' }}
          ><Icon name={isGlobal ? 'edit' : 'open_in_new'} size={15} /></button>
          {isGlobal && (
            <button onClick={() => onRemove?.(b.id)} title="Eliminar"
              style={{ width: 30, height: 30, borderRadius: 8, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey500, transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.color = color.error; e.currentTarget.style.background = color.errorLight }}
              onMouseLeave={e => { e.currentTarget.style.color = color.grey500; e.currentTarget.style.background = 'transparent' }}
            ><Icon name="delete" size={15} /></button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── AddBaseDrawer ─────────────────────────────────────────────────────────────
// Drawer 480px desde la derecha. Muestra el catálogo del workspace + permite
// subir una nueva base inline (que va al workspace y se auto-asigna al agente).
// La separación admin/agente se conserva: lo nuevo siempre va al workspace,
// solo que sin tener que ir físicamente al admin.

function AddBaseDrawer({
  workspaceBases,
  assignedIds,
  onAddExisting,
  onRemoveFromAgent,
  onUploadAndAdd,
  onClose,
}: {
  workspaceBases:    WorkspaceBase[]
  assignedIds:       Set<string>
  onAddExisting:     (wb: WorkspaceBase, when: string) => void
  onRemoveFromAgent: (id: string) => void
  onUploadAndAdd:    (wb: WorkspaceBase, when: string) => void
  onClose:           () => void
}) {
  const [search, setSearch] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadType, setUploadType] = useState<'link' | 'file' | 'text'>('link')
  const [uploadName, setUploadName] = useState('')
  const [uploadSource, setUploadSource] = useState('')
  const [uploadWhen, setUploadWhen] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  // Per-row inline-expand state: the workspace item the user is currently
  // configuring "cuándo se activa" for before confirming the add.
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [whenText, setWhenText] = useState('')

  const filtered = workspaceBases.filter(b =>
       b.name.toLowerCase().includes(search.toLowerCase())
    || b.source.toLowerCase().includes(search.toLowerCase())
  )

  const canSubmit = uploadName.trim().length > 0
                 && (uploadType === 'text' || uploadSource.trim().length > 0)
                 && uploadWhen.trim().length > 0

  const handleUpload = () => {
    if (!canSubmit || uploadLoading) return
    setUploadLoading(true)
    // Mock async upload — server side parses + indexes the source.
    setTimeout(() => {
      const sourceLabel = uploadType === 'link' ? (uploadSource.includes('notion') ? 'Notion' : uploadSource.includes('docs.google') ? 'Google Drive' : 'Link')
                      : uploadType === 'file' ? 'PDF Upload'
                      : 'Texto'
      const sourceIcon  = uploadType === 'link' ? 'link' : uploadType === 'file' ? 'picture_as_pdf' : 'description'
      const newBase: WorkspaceBase = {
        id: `wb-${Date.now()}`,
        name: uploadName.trim(),
        source: sourceLabel,
        sourceIcon,
        docCount: uploadType === 'text' ? 1 : Math.floor(2 + Math.random() * 12),
        type: uploadType,
        usedInAgents: 0,
      }
      onUploadAndAdd(newBase, uploadWhen.trim())
      setUploadName(''); setUploadSource(''); setUploadWhen('')
      setUploadOpen(false); setUploadLoading(false)
    }, 1500)
  }

  const handleConfirmExisting = (wb: WorkspaceBase) => {
    if (!whenText.trim()) return
    onAddExisting(wb, whenText.trim())
    setExpandedId(null); setWhenText('')
  }

  const inputBase: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    borderRadius: radius.md, border: `1px solid ${color.borderDefault}`,
    fontSize: 13, color: color.grey900, outline: 'none', fontFamily: font.family,
    background: 'white', transition: 'border-color 0.12s',
  }

  return createPortal(
    <>
      {/* Backdrop — sutil, no full black para mantener contexto del agente */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(15,23,42,0.18)',
        animation: 'fadeIn 0.18s ease',
      }} />

      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9001,
        width: 480, background: 'white',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-12px 0 40px rgba(15,23,42,0.16)',
        animation: 'slideInBaseDrawer 0.22s ease',
        fontFamily: font.family,
      }}>

        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${color.borderSubtle}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: color.primaryUltraLight, border: `1px solid ${color.primaryLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="menu_book" size={18} color={color.primary} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: color.grey900, lineHeight: 1.2 }}>Agregar base de conocimiento</div>
                <div style={{ fontSize: 12, color: color.grey500, marginTop: 2 }}>Elegí del Proyecto o subí una nueva</div>
              </div>
            </div>
            <button onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500 }}
              onMouseEnter={e => (e.currentTarget.style.background = color.grey100)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            ><Icon name="close" size={18} /></button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Search */}
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar base..." />

          {/* Upload section — collapsable */}
          <div style={{ background: color.grey50, border: `1px dashed ${color.borderDefault}`, borderRadius: radius.lg }}>
            <button onClick={() => setUploadOpen(o => !o)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: color.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="add" size={18} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: color.grey900 }}>Subir nueva base al Proyecto</div>
                <div style={{ fontSize: 11.5, color: color.grey500 }}>Disponible para todos los agentes desde el admin</div>
              </div>
              <Icon name="expand_more" size={18} color={color.grey500} style={{ transform: uploadOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
            </button>
            {uploadOpen && (
              <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Type selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {([
                    { id: 'link', label: 'Link',    icon: 'link',           desc: 'URL de Drive, Notion, etc.' },
                    { id: 'file', label: 'Archivo', icon: 'picture_as_pdf', desc: 'PDF, DOCX, XLSX' },
                    { id: 'text', label: 'Texto',   icon: 'description',    desc: 'Pegá el contenido' },
                  ] as const).map(t => {
                    const active = uploadType === t.id
                    return (
                      <button key={t.id} onClick={() => setUploadType(t.id)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          padding: '10px 6px', borderRadius: radius.md,
                          border: `1.5px solid ${active ? color.primary : color.borderDefault}`,
                          background: active ? color.primaryUltraLight : 'white',
                          cursor: 'pointer', transition: 'all 0.12s',
                        }}
                      >
                        <Icon name={t.icon} size={18} color={active ? color.primary : color.grey500} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: active ? color.primary : color.grey800 }}>{t.label}</span>
                      </button>
                    )
                  })}
                </div>
                {/* Name */}
                <input
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                  placeholder="Nombre de la base"
                  style={inputBase}
                  onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                  onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
                />
                {/* Source — distinto según tipo */}
                {uploadType === 'link' && (
                  <input
                    value={uploadSource}
                    onChange={e => setUploadSource(e.target.value)}
                    placeholder="https://..."
                    style={inputBase}
                    onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                    onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
                  />
                )}
                {uploadType === 'file' && (
                  <div style={{
                    border: `1.5px dashed ${color.borderDefault}`, borderRadius: radius.md,
                    padding: '20px 12px', textAlign: 'center', cursor: 'pointer',
                    background: 'white',
                  }}
                    onClick={() => setUploadSource('archivo-subido.pdf')}
                  >
                    <Icon name="upload_file" size={22} color={color.grey500} />
                    <div style={{ fontSize: 12, fontWeight: 600, color: color.grey800, marginTop: 6 }}>
                      {uploadSource ? `📎 ${uploadSource}` : 'Arrastrá tu archivo o hacé click'}
                    </div>
                    <div style={{ fontSize: 10.5, color: color.grey500, marginTop: 2 }}>PDF, DOCX, XLSX hasta 25MB</div>
                  </div>
                )}
                {uploadType === 'text' && (
                  <textarea
                    value={uploadSource}
                    onChange={e => setUploadSource(e.target.value)}
                    placeholder="Pegá el texto que querés que el agente conozca..."
                    rows={4}
                    style={{ ...inputBase, resize: 'vertical', fontFamily: font.family }}
                    onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                    onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
                  />
                )}
                {/* When-it-fires textarea — required so the agent knows cuándo activarla */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                    ¿Cuándo debería usarla el agente?
                  </label>
                  <textarea
                    value={uploadWhen}
                    onChange={e => setUploadWhen(e.target.value)}
                    placeholder="Ej: Cuando el cliente pregunta sobre horarios, métodos de pago o políticas de envío."
                    rows={2}
                    style={{ ...inputBase, resize: 'vertical', fontFamily: font.family }}
                    onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                    onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
                  />
                </div>
                {/* CTA with loading */}
                <button
                  onClick={handleUpload}
                  disabled={!canSubmit || uploadLoading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 100, border: 'none',
                    background: (canSubmit && !uploadLoading) ? color.primary : color.grey200,
                    color: (canSubmit && !uploadLoading) ? 'white' : color.grey500,
                    fontSize: 13, fontWeight: 600,
                    cursor: (canSubmit && !uploadLoading) ? 'pointer' : 'default',
                    transition: 'all 0.12s',
                  }}
                >
                  {uploadLoading ? (
                    <>
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: `2px solid ${color.grey400}`, borderTopColor: 'white',
                        animation: 'baseDrawerSpin 0.8s linear infinite',
                      }} />
                      Subiendo...
                    </>
                  ) : (
                    <><Icon name="cloud_upload" size={14} /> Subir y agregar al agente</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Workspace catalog list */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color.grey500 }}>
                Del Proyecto
              </span>
              <span style={{ fontSize: 11, color: color.grey500 }}>{filtered.length} {filtered.length === 1 ? 'base' : 'bases'}</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: color.grey50, borderRadius: radius.md }}>
                <Icon name="search_off" size={28} color={color.grey400} />
                <p style={{ margin: '8px 0 0', fontSize: 12.5, color: color.grey600 }}>Sin resultados en el catálogo.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filtered.map(wb => {
                  const assigned = assignedIds.has(wb.id)
                  const expanded = expandedId === wb.id
                  return (
                    <div key={wb.id}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        padding: 0, borderRadius: radius.md,
                        border: `1px solid ${expanded ? color.primary : color.borderDefault}`,
                        background: 'white',
                        transition: 'border-color 0.12s',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Top row */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px',
                      }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: color.primaryUltraLight, border: `1px solid ${color.primaryLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={wb.sourceIcon} size={16} color={color.primary} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: color.grey900 }}>{wb.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1, fontSize: 11.5, color: color.grey500 }}>
                            <span>{wb.source} · {wb.docCount} docs</span>
                            {wb.usedInAgents > 0 && (
                              <>
                                <span style={{ color: color.grey300 }}>·</span>
                                <span>Usada en {wb.usedInAgents} {wb.usedInAgents === 1 ? 'agente' : 'agentes'}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {assigned ? (
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '6px 10px', borderRadius: 100,
                              border: `1px solid ${color.success}40`, background: color.successLight,
                              color: color.successDark, fontSize: 11, fontWeight: 700,
                              cursor: 'default',
                            }}
                            title="Click para quitar"
                            onClick={() => onRemoveFromAgent(wb.id)}
                          >
                            <Icon name="check" size={11} /> Agregada
                          </span>
                        ) : (
                          <button
                            onClick={() => { setExpandedId(expanded ? null : wb.id); setWhenText('') }}
                            style={{
                              padding: '6px 14px', borderRadius: 100,
                              border: `1px solid ${color.primary}`,
                              background: expanded ? color.primary : 'white',
                              color: expanded ? 'white' : color.primary,
                              fontSize: 11, fontWeight: 700,
                              cursor: 'pointer', transition: 'all 0.12s',
                            }}
                            onMouseEnter={e => { if (!expanded) { e.currentTarget.style.background = color.primary; e.currentTarget.style.color = 'white' } }}
                            onMouseLeave={e => { if (!expanded) { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = color.primary } }}
                          >
                            {expanded ? 'Cancelar' : 'Agregar'}
                          </button>
                        )}
                      </div>

                      {/* Inline expand: ¿cuándo se activa? + confirmación */}
                      {expanded && (
                        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: `1px solid ${color.borderSubtle}`, paddingTop: 10 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                            ¿Cuándo debería usarla el agente?
                          </label>
                          <textarea
                            value={whenText}
                            onChange={e => setWhenText(e.target.value)}
                            placeholder={`Ej: Cuando el cliente pregunta sobre ${wb.name.toLowerCase()}.`}
                            rows={2}
                            style={{ ...inputBase, resize: 'vertical' }}
                            autoFocus
                            onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                            onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              onClick={() => { setExpandedId(null); setWhenText('') }}
                              style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', color: color.grey700, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                            >Cancelar</button>
                            <button
                              onClick={() => handleConfirmExisting(wb)}
                              disabled={!whenText.trim()}
                              style={{
                                padding: '6px 14px', borderRadius: 100, border: 'none',
                                background: whenText.trim() ? color.primary : color.grey200,
                                color: whenText.trim() ? 'white' : color.grey500,
                                fontSize: 12, fontWeight: 700,
                                cursor: whenText.trim() ? 'pointer' : 'default',
                              }}
                            >Agregar al agente</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${color.borderSubtle}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0, background: color.grey50 }}>
          <button
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: color.primary,
              padding: '6px 8px', borderRadius: radius.sm,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Administrar bases del Proyecto <Icon name="open_in_new" size={12} />
          </button>
          <button onClick={onClose}
            style={{
              padding: '8px 18px', borderRadius: 100,
              border: `1px solid ${color.borderDefault}`, background: 'white',
              color: color.grey800, fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >Listo</button>
        </div>
      </aside>

      <style>{`
        @keyframes slideInBaseDrawer { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn             { from { opacity: 0; } to { opacity: 1; } }
        @keyframes baseDrawerSpin     { to { transform: rotate(360deg); } }
      `}</style>
    </>,
    document.body
  )
}

// ── ConfiguracionTab ──────────────────────────────────────────────────────────

const PALETTE = [color.primary, '#673AB7', '#00BCD4', color.success, color.warningDark, color.error, '#FF3C9A', color.successDark]

interface FloatingInputProps {
  label:        string
  value:        string
  onChange:     (v: string) => void
  multiline?:   boolean
  placeholder?: string
  // When set, shows a "X/maxLength" counter at the bottom-right of the field.
  maxLength?:   number
  rows?:        number
}

function FloatingInput({ label, value, onChange, multiline, placeholder, maxLength, rows = 4 }: FloatingInputProps) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div style={{ position: 'relative' }}>
      <label style={{ position: 'absolute', left: 14, top: active ? -8 : multiline ? 16 : '50%', transform: active ? 'none' : 'translateY(-50%)', fontSize: active ? 11 : 14, fontWeight: 500, color: focused ? color.primary : color.grey500, background: 'white', padding: '0 4px', transition: 'all 0.15s ease', pointerEvents: 'none', zIndex: 1 }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={active ? placeholder : ''} maxLength={maxLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '16px 14px', borderRadius: radius.md, border: `1.5px solid ${focused ? color.primary : color.borderDefault}`, fontSize: 14, fontWeight: 500, color: color.grey900, outline: 'none', fontFamily: font.family, transition: 'border-color 0.15s', resize: 'vertical', background: 'white' }}
        />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={active ? placeholder : ''} maxLength={maxLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '16px 14px', borderRadius: radius.md, border: `1.5px solid ${focused ? color.primary : color.borderDefault}`, fontSize: 14, fontWeight: 500, color: color.grey900, outline: 'none', fontFamily: font.family, transition: 'border-color 0.15s', background: 'white' }}
        />
      )}
      {maxLength != null && (
        <div style={{ marginTop: 4, fontSize: 11, color: color.grey400, textAlign: 'right' }}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  )
}

// Catálogo de LLMs disponibles. Sigue el patrón del modal "Modelo generativo"
// que ya existe en chatbots: card por modelo con bullets de features + costo
// + chip "Recomendado" en el selected/destacado.
interface LLM {
  id:          string
  name:        string
  provider:    'Anthropic' | 'OpenAI' | 'Google' | 'Meta'
  features:    string[]
  recommendation?: string  // texto destacado en primary
  costPer1M:   number      // costo en USD por millón de tokens
  recommended?: boolean
}

const LLMS: LLM[] = [
  {
    id: 'claude-sonnet-4-7', name: 'Claude Sonnet 4.7', provider: 'Anthropic',
    features: ['Razonamiento balanceado', 'Análisis de código y texto largo'],
    recommendation: 'Mejor relación entre calidad, latencia y costo.',
    costPer1M: 3.0, recommended: true,
  },
  {
    id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'Anthropic',
    features: ['Latencia ultra baja', 'Ideal para flujos simples y alto volumen'],
    recommendation: 'Optimizado para velocidad sobre profundidad.',
    costPer1M: 1.0,
  },
  {
    id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI',
    features: ['Razonamiento profundo', 'Comprensión de instrucciones complejas'],
    recommendation: 'Prioridad en calidad de respuesta con coste mayor.',
    costPer1M: 5.0,
  },
  {
    id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', provider: 'Google',
    features: ['Multimodal nativo', 'Imágenes, audio y documentos largos'],
    recommendation: 'Para casos con inputs no textuales.',
    costPer1M: 4.0,
  },
]

// Brand-style icons (simplified, color-recognizable approximations).
function ProviderIcon({ provider, size = 20 }: { provider: LLM['provider']; size?: number }) {
  const styleProps = { display: 'block' as const }
  if (provider === 'Anthropic') {
    // Claude — burnt orange asterisk burst (8 spokes).
    return (
      <svg width={size} height={size} viewBox="-12 -12 24 24" style={styleProps}>
        {[0, 45, 90, 135].map(angle => (
          <rect key={angle} x="-1" y="-10" width="2" height="20" rx="1" fill="#D97706" transform={`rotate(${angle})`} />
        ))}
      </svg>
    )
  }
  if (provider === 'OpenAI') {
    // ChatGPT — interlocking 3-ring knot, simplified as 3 rotated ellipses.
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={styleProps} fill="none" stroke="#000" strokeWidth="2">
        <ellipse cx="12" cy="12" rx="9" ry="4" />
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)" />
      </svg>
    )
  }
  if (provider === 'Google') {
    // Gemini — 4-pointed sparkle with blue→purple gradient.
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={styleProps}>
        <defs>
          <linearGradient id="gemGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4285F4" />
            <stop offset="0.5" stopColor="#7B61FF" />
            <stop offset="1" stopColor="#9333EA" />
          </linearGradient>
        </defs>
        <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" fill="url(#gemGrad)" />
      </svg>
    )
  }
  // Meta — blue infinity-ish swirl placeholder
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={styleProps} fill="#1E40AF">
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

const PROVIDER_BG: Record<LLM['provider'], string> = {
  Anthropic: '#FFF7ED',
  OpenAI:    '#F8FAFC',
  Google:    '#F5F3FF',
  Meta:      '#EFF6FF',
}

function ModeloCard({ llm, selected, onSelect }: { llm: LLM; selected: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 14,
        width: '100%', height: '100%', minWidth: 0, textAlign: 'left',
        padding: '18px 18px 14px',
        borderRadius: radius.lg,
        border: `1.5px solid ${selected ? color.primary : color.borderDefault}`,
        background: selected ? color.primaryUltraLight : (hovered ? color.grey50 : 'white'),
        cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      {/* Recomendado chip — top-right */}
      {llm.recommended && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
          padding: '3px 10px', borderRadius: 100, lineHeight: 1.4,
          background: color.primary, color: 'white',
        }}>
          Recomendado
        </span>
      )}

      {/* Header: provider icon + name + provider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: PROVIDER_BG[llm.provider],
          border: `1px solid ${color.borderDefault}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ProviderIcon provider={llm.provider} size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: color.grey900, lineHeight: 1.2 }}>{llm.name}</div>
          <div style={{ fontSize: 11.5, color: color.grey500, marginTop: 2 }}>by {llm.provider}</div>
        </div>
      </div>

      {/* Feature bullets */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {llm.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              background: color.primaryUltraLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="check" size={11} color={color.primary} />
            </span>
            <span style={{ fontSize: 12, color: color.grey700, lineHeight: 1.4 }}>{f}</span>
          </li>
        ))}
      </ul>

      {/* Recommendation note (primary text) */}
      {llm.recommendation && (
        <p style={{ margin: 0, fontSize: 11.5, fontWeight: 600, color: color.primary, lineHeight: 1.45, textAlign: 'center' }}>
          {llm.recommendation}
        </p>
      )}

      {/* Cost footer */}
      <div style={{ paddingTop: 10, borderTop: `1px solid ${color.borderSubtle}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11.5, color: color.grey500 }}>Costo</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: color.primary, lineHeight: 1.1 }}>
            US$ {llm.costPer1M.toFixed(2).replace('.', ',')}
          </div>
          <div style={{ fontSize: 10, color: color.grey500, marginTop: 2 }}>por 1 millón de tokens</div>
        </div>
      </div>
    </button>
  )
}

function ConfiguracionTab({ agent, onChange }: { agent: typeof AGENT; onChange: (patch: Partial<typeof AGENT>) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [workflowGoal, setWorkflowGoal] = useState('')
  const [workflowDesc, setWorkflowDesc] = useState('')
  const [modelId, setModelId] = useState('claude-sonnet-4-7')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xBig }}>

      {/* ── Perfil ─────────────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, padding: spacing.xBig, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: color.grey900 }}>Perfil</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: color.grey500, lineHeight: 1.5 }}>
            Identidad del agente. Es el nombre con el que el orquestador y el equipo lo identifican.
          </p>
        </div>
        <div style={{ height: 1, background: color.borderSubtle, margin: `${spacing.xxSm}px 0` }} />
        <FloatingInput label="Nombre del agente" value={agent.name} onChange={v => onChange({ name: v })} />
      </div>

      {/* ── Modelo de IA ──────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, padding: spacing.xBig, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: color.grey900 }}>Modelo generativo</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: color.grey500, lineHeight: 1.5 }}>
            Elegí el LLM que el agente usa para razonar y responder. Podés cambiarlo en cualquier momento sin afectar el resto de la configuración.
          </p>
        </div>
        <div style={{ height: 1, background: color.borderSubtle, margin: `${spacing.xxSm}px 0` }} />

        {/* Horizontal carousel — overflow scroll with snap (matches the chatbots
            Modelo generativo modal). On wider viewports puede entrar todo;
            si no, se scrollea con el trackpad/drag. Mantenemos el carousel
            dentro del padding del card padre (sin negative-margin bleed) así
            la primera y la última card respetan el padding del section. */}
        <div style={{
          display: 'flex', gap: 12,
          overflowX: 'auto', overflowY: 'visible',
          paddingBottom: 8, paddingLeft: 2, paddingRight: 2,
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
        }}>
          {LLMS.map(llm => (
            <div
              key={llm.id}
              style={{
                flex: '0 0 260px',
                scrollSnapAlign: 'start',
              }}
            >
              <ModeloCard
                llm={llm}
                selected={modelId === llm.id}
                onSelect={() => setModelId(llm.id)}
              />
            </div>
          ))}
        </div>

        {/* Disclaimer note matching the chatbots modal */}
        <div style={{ marginTop: spacing.xxSm, padding: `${spacing.xSm}px ${spacing.sm}px`, background: color.primaryUltraLight, border: `1px solid ${color.primaryLight}`, borderRadius: radius.md, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Icon name="info" size={16} color={color.primary} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 12, color: color.grey700, lineHeight: 1.55 }}>
            Botmaker usa un motor de IA propietario con agentes, bases vectoriales y búsquedas indexadas. El modelo que elijas acá impacta el desempeño de esas funcionalidades.
          </p>
        </div>
      </div>

      {/* ── Activación ─────────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, padding: spacing.xBig, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: color.grey900 }}>Activación</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: color.grey500, lineHeight: 1.5 }}>
            Las condiciones que el orquestador evalúa para decidir cuándo activar este agente. Describí los disparadores e intenciones del cliente que deben activarlo.
          </p>
        </div>
        <div style={{ height: 1, background: color.borderSubtle, margin: `${spacing.xxSm}px 0` }} />
        <FloatingInput label="¿Cuando se activa por el orquestador?" value={agent.description} onChange={v => onChange({ description: v })} multiline maxLength={1500} rows={4} />
      </div>

      {/* ── Workflow ───────────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, padding: spacing.xBig, display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: color.grey900 }}>Workflow</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: color.grey500, lineHeight: 1.5 }}>
            Lo que el agente gestiona y cómo lo hace. Definí los objetos del negocio que va a manejar y describí cómo combina lógicas, MCPs, bases y código para cumplir el objetivo.
          </p>
        </div>
        <div style={{ height: 1, background: color.borderSubtle, margin: `${spacing.xxSm}px 0` }} />
        <FloatingInput label="¿Que desear gestionar en el workflow?" value={workflowGoal} onChange={setWorkflowGoal} placeholder="Pedidos, Tickets, Leads..." />
        <FloatingInput label="Describe como el agente utiliza las lógicas, MCPs, bases y códigos para cumplir el objetivo del workflow" value={workflowDesc} onChange={setWorkflowDesc} multiline maxLength={1500} rows={4} />
      </div>

      {/* ── Eliminar agente ─────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, padding: `${spacing.sm}px ${spacing.xBig}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: color.grey900 }}>Eliminar Agente "{agent.name}"</div>
          <div style={{ fontSize: 13, color: color.grey500, marginTop: 2 }}>Esta acción no se puede deshacer.</div>
        </div>
        <button
          onClick={() => setConfirmDelete(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 100, border: `1px solid ${color.error}`, background: 'white', fontSize: 13, fontWeight: 600, color: color.error, cursor: 'pointer', transition: 'background 0.12s' }}
          onMouseEnter={e => (e.currentTarget.style.background = color.errorLight)}
          onMouseLeave={e => (e.currentTarget.style.background = 'white')}
        >
          <Icon name="delete" size={16} color={color.error} /> Eliminar
        </button>
      </div>
      {confirmDelete && createPortal(
        <>
          <div onClick={() => setConfirmDelete(false)} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 9001, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '28px 28px 24px', width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', pointerEvents: 'all', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xSm, animation: 'scaleIn 0.15s ease' }}>
              <div style={{ width: 52, height: 52, borderRadius: 100, background: color.errorLight, border: `1px solid ${color.errorDark}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="warning" size={24} color={color.error} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: color.grey900 }}>¿Eliminar "{agent.name}"?</p>
                <p style={{ margin: 0, fontSize: 13, color: color.grey600, lineHeight: 1.5 }}>Se eliminará el agente y toda su configuración. Esta acción no se puede deshacer.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, width: '100%' }}>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', fontSize: 13, fontWeight: 600, color: color.grey800, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: 'none', background: color.error, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Eliminar</button>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </div>
  )
}

// ── Tool card (reusable for Codigo tab) ──────────────────────────────────────

interface Tool { id: string; name: string; when: string; status: 'active' | 'draft'; origin: 'global' | 'process'; flowName?: string }

function ToolRow({ tool, onRemove }: { tool: Tool; onRemove?: (id: string) => void }) {
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const isGlobal = tool.origin === 'global'
  const hasWhen = !!tool.when
  return (
    <>
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: expanded ? 'flex-start' : 'center', gap: spacing.sm, padding: `${spacing.sm}px ${spacing.sm}px`, background: hovered ? color.grey50 : 'white', borderBottom: `1px solid ${color.borderSubtle}`, transition: 'background 0.1s' }}
    >
      <div style={{ width: 32, height: 32, borderRadius: radius.md, flexShrink: 0, background: color.successLight, border: `1px solid ${color.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: expanded ? 2 : 0 }}>
        <Icon name="code" size={16} color={color.successDark} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: color.grey900 }}>{tool.name}</div>
        {hasWhen && <div style={{ fontSize: 11.5, color: color.grey500, marginTop: 1, lineHeight: 1.5, overflow: 'hidden', textOverflow: expanded ? undefined : 'ellipsis', whiteSpace: expanded ? 'normal' : 'nowrap', transition: 'all 0.2s ease' }}>{tool.when}</div>}
      </div>
      {isGlobal ? (
        <Tooltip text="Disponible cuando se active la instrucción de uso del agente." width={240}>
          <span style={{ fontSize: 11, fontWeight: 600, color: color.successDark, background: color.successLight, border: `1px solid ${color.success}`, borderRadius: 100, padding: '3px 10px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'default' }}>
            <Icon name="language" size={12} /> Global
          </span>
        </Tooltip>
      ) : (
        <Tooltip text={`Configurado en el flujo "${tool.flowName}". Para editarlo andá al flujo.`} width={230}>
          <span style={{ fontSize: 11, fontWeight: 500, color: color.primary, background: color.primaryUltraLight, border: `1px solid ${color.primaryLight}`, borderRadius: 100, padding: '3px 10px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'default' }}>
            <Icon name="route" size={12} /> {tool.flowName}
          </span>
        </Tooltip>
      )}
      <div style={{ width: 68, flexShrink: 0, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
        {isGlobal ? (
          <>
            <button style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
            ><Icon name="edit" size={16} /></button>
            <button onClick={() => onRemove?.(tool.id)} style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.color = color.error; e.currentTarget.style.background = color.errorLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
            ><Icon name="delete" size={16} /></button>
          </>
        ) : (
          <Tooltip text="Ir al flujo" width={80}>
            <button style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
            ><Icon name="open_in_new" size={16} /></button>
          </Tooltip>
        )}
        {hasWhen && (
          <button onClick={() => setExpanded(e => !e)} style={{ width: 28, height: 28, borderRadius: radius.sm, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey400, flexShrink: 0, transition: 'all 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = color.grey100)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          ><Icon name="expand_more" size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} /></button>
        )}
      </div>
    </div>
    </>
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ text, children, width = 200 }: { text: string; children: React.ReactNode; width?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  return (
    <div ref={ref} style={{ display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => ref.current && setRect(ref.current.getBoundingClientRect())}
      onMouseLeave={() => setRect(null)}
    >
      {children}
      {rect && createPortal(
        <div style={{ position: 'fixed', left: rect.left + rect.width / 2, top: rect.top - 8, transform: 'translate(-50%, -100%)', background: color.grey900, color: 'white', fontSize: 11, lineHeight: 1.5, padding: '7px 11px', borderRadius: radius.md, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.25)', pointerEvents: 'none', width, textAlign: 'center' }}>
          {text}
          <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${color.grey900}` }} />
        </div>,
        document.body
      )}
    </div>
  )
}

// ── AccionesTab ───────────────────────────────────────────────────────────────
// Unifies MCPs + Apps externas + Código in a single inventory. Each item
// represents an action the agent can invoke. Distinguished by colored type
// icon and a "Global" or "Lógica X" scope chip. Lógicas y Bases stay separate
// (sub-flows and read sources, conceptually different).

type ResourceKind  = 'mcp' | 'app' | 'code'
type ResourceScope = 'global' | 'flow'

interface Resource {
  id:          string         // instance id — uno por cada conexión al agente
  kind:        ResourceKind
  name:        string
  provider?:   string         // MercadoPago, Gmail, etc.
  description: string         // when it's used / what it does
  scope:       ResourceScope
  flowName?:   string         // when scope === 'flow'
  toolCount:   number         // tools/actions count
  status:      'active' | 'configuring'
  // Ref al WorkspaceResource del cual viene esta instancia. Permite tener
  // múltiples conexiones del mismo recurso al agente (ej: Gmail con cuándo
  // distinto cada vez). Si no está seteado, fallback es id (legacy V1).
  workspaceId?: string
  // MCPs y Apps: subset de tools que el agente tiene permitido invocar. El
  // usuario las elige al agregar el recurso — las destructivas (delete_*,
  // refund_*, etc) vienen destildadas por defecto.
  enabledTools?: string[]
  // Apps: cuenta conectada del workspace que se usa (ej: ventas@empresa.com vs
  // juan@gmail.com cuando hay 2 cuentas Gmail conectadas).
  accountId?:    string
  accountLabel?: string         // copia denormalizada para mostrar en la fila
}

// Color scheme: MCP grey (uses its own logo, neutral fits), Apps amber, Código green.
const RESOURCE_VISUAL: Record<ResourceKind, { label: string; bgColor: string; fgColor: string; iconName: string }> = {
  mcp:  { label: 'MCP',    bgColor: '#F1F5F9', fgColor: '#475569', iconName: 'extension'   },
  app:  { label: 'App',    bgColor: '#FEF3C7', fgColor: '#92400E', iconName: 'apps'        },
  code: { label: 'Código', bgColor: '#DCFCE7', fgColor: '#166534', iconName: 'code'        },
}

// Inline brand SVGs para los providers de apps externas. Mantenemos la marca
// reconocible (envelope rojo Gmail, hoja verde Sheets, calendario azul, oval
// amarillo Meli) sin depender de assets externos.
// Logos brand reales de las apps externas. Vienen de /public/logos/ —
// PNGs oficiales con fondo transparente. Ya no usamos SVGs hechos a mano.
const APP_PROVIDER_LOGO: Record<string, string> = {
  'Gmail':           '/logos/gmail.webp',
  'Google Sheets':   '/logos/google-sheets.png',
  'Google Calendar': '/logos/google-calendar.webp',
  'Mercado Libre':   '/logos/mercado-libre.png',
  'WhatsApp':        '/logos/whatsapp.webp',
}

function AppProviderIcon({ provider, size = 20 }: { provider?: string; size?: number }) {
  const src = provider ? APP_PROVIDER_LOGO[provider] : undefined
  if (src) {
    return (
      <img src={src}
        style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
        alt={provider}
      />
    )
  }
  // Fallback: cuadrado gris con la primera letra cuando no hay logo registrado.
  const letter = (provider ?? '?').slice(0, 1).toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: 4, background: color.grey200, color: color.grey700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, fontWeight: 700 }}>{letter}</div>
  )
}

// Sample inventory used when the user clicks "Agregar recurso" on the empty
// state — populates everything at once so the design is demoable with variety.
// `description` is the **activation rule** for global items ("cuándo lo usa el
// agente"). For flow-bound items the column is hidden — su comportamiento
// está definido dentro del flujo, no acá.
const SAMPLE_RESOURCES: Resource[] = [
  // MCPs
  { id: 'r1',  kind: 'mcp',  name: 'Pagos',          provider: 'MercadoPago',      description: 'Cuando el cliente necesita generar un link de pago, verificar el estado de una transacción o solicitar un comprobante.', scope: 'global', toolCount: 3, status: 'active' },
  { id: 'r2',  kind: 'mcp',  name: 'Notificaciones', provider: 'WhatsApp Business', description: 'Cuando el agente tiene que enviar una confirmación, recordatorio o mensaje proactivo al cliente por WhatsApp.', scope: 'global', toolCount: 2, status: 'active' },
  { id: 'r3',  kind: 'mcp',  name: 'Catálogo',       provider: 'Google Sheets',     description: '', scope: 'flow', flowName: 'Tomar pedido', toolCount: 2, status: 'active' },
  { id: 'r4',  kind: 'mcp',  name: 'Catálogo',       provider: 'Google Sheets',     description: '', scope: 'flow', flowName: 'Consultar estado', toolCount: 1, status: 'active' },
  { id: 'r5',  kind: 'mcp',  name: 'Tracking',       provider: 'Correo Argentino',  description: '', scope: 'flow', flowName: 'Consultar estado', toolCount: 1, status: 'active' },
  // Apps externas (acción directa, sin MCP intermedio)
  { id: 'r6',  kind: 'app',  name: 'Email comercial',      provider: 'Gmail',           description: 'Cuando hay que mandar un mail directo al cliente desde la cuenta del negocio.', scope: 'global', toolCount: 4, status: 'active' },
  { id: 'r7',  kind: 'app',  name: 'Calendario',           provider: 'Google Calendar', description: 'Cuando se necesita crear un evento, consultar disponibilidad o enviar una invitación.', scope: 'global', toolCount: 3, status: 'active' },
  { id: 'r8',  kind: 'app',  name: 'Hoja de pedidos',      provider: 'Google Sheets',   description: '', scope: 'flow', flowName: 'Tomar pedido', toolCount: 1, status: 'active' },
  { id: 'r9',  kind: 'app',  name: 'Tienda Mercado Libre', provider: 'Mercado Libre',   description: 'Cuando llega una pregunta de un comprador o hay que consultar el estado de una publicación.', scope: 'global', toolCount: 5, status: 'configuring' },
  // Código custom
  { id: 'r10', kind: 'code', name: 'calculatePriceWithDiscount', description: 'Cuando hay una promo activa y el agente tiene que aplicar el descuento al total del pedido.', scope: 'global', toolCount: 1, status: 'active' },
  { id: 'r11', kind: 'code', name: 'generateOrderNumber',        description: 'Cuando se confirma un pedido y hay que asignarle un identificador único para tracking interno.', scope: 'global', toolCount: 1, status: 'active' },
  { id: 'r12', kind: 'code', name: 'validateBusinessHours',      description: 'Antes de aceptar cualquier pedido, para verificar si el local está abierto.', scope: 'global', toolCount: 1, status: 'active' },
  { id: 'r13', kind: 'code', name: 'formatAddress',              description: '', scope: 'flow', flowName: 'Tomar pedido', toolCount: 1, status: 'active' },
]

function ResourceRow({
  r, isLast, onEdit, onRemove,
}: {
  r: Resource
  isLast?: boolean
  onEdit?: (id: string, patch: { description?: string; enabledTools?: string[]; accountId?: string }) => void
  onRemove?: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const visual = RESOURCE_VISUAL[r.kind]
  const isGlobal = r.scope === 'global'

  // Lookup de catálogo para edición. MCPs traen sus tools en WORKSPACE_RESOURCES;
  // apps las toman de PROVIDER_TOOLS por provider.
  const editTools =
       r.kind === 'mcp' ? (WORKSPACE_RESOURCES.find(w => w.id === r.id)?.tools ?? [])
     : r.kind === 'app' && r.provider ? (PROVIDER_TOOLS[r.provider] ?? [])
     : []
  const editAccounts =
       r.kind === 'app' && r.provider ? WORKSPACE_ACCOUNTS.filter(a => a.provider === r.provider)
     : []
  const hasToolPicker = (r.kind === 'mcp' || r.kind === 'app') && editTools.length > 0
  const hasAccountPicker = r.kind === 'app' && editAccounts.length > 0

  // Draft state local al row mientras está en edición.
  const [draftWhen, setDraftWhen] = useState(r.description)
  const [draftTools, setDraftTools] = useState<Set<string>>(new Set(r.enabledTools ?? []))
  const [draftAccountId, setDraftAccountId] = useState<string | null>(r.accountId ?? null)

  const startEdit = () => {
    setDraftWhen(r.description)
    setDraftTools(new Set(r.enabledTools ?? editTools.filter(t => !t.risky).map(t => t.id)))
    setDraftAccountId(r.accountId ?? editAccounts[0]?.id ?? null)
    setEditing(true)
  }
  const cancelEdit = () => setEditing(false)
  const saveEdit = () => {
    if (!onEdit) return
    onEdit(r.id, {
      description:  draftWhen.trim(),
      enabledTools: hasToolPicker ? Array.from(draftTools) : undefined,
      accountId:    hasAccountPicker ? (draftAccountId ?? undefined) : undefined,
    })
    setEditing(false)
  }
  const canSave =
       draftWhen.trim().length > 0
    && (!hasToolPicker || draftTools.size > 0)
    && (!hasAccountPicker || !!draftAccountId)

  const inputBase: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    borderRadius: radius.md, border: `1px solid ${color.borderDefault}`,
    fontSize: 13, color: color.grey900, outline: 'none', fontFamily: font.family,
    background: 'white', transition: 'border-color 0.12s',
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderBottom: isLast ? 'none' : `1px solid ${color.borderSubtle}`,
      background: editing ? color.primaryUltraLight + '40' : 'white',
      transition: 'background 0.12s',
    }}>
      <div
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '14px 16px',
          background: hovered && !editing ? color.grey50 : 'transparent',
          transition: 'background 0.12s',
          cursor: editing ? 'default' : 'pointer',
        }}
      >
        {/* Icono del tipo — más grande, con halo + dot de status superpuesto */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: r.kind === 'app' ? 'white' : visual.bgColor,
            border: r.kind === 'app' ? `1px solid ${color.borderSubtle}` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.18s ease',
            transform: hovered && !editing ? 'translateY(-1px)' : 'none',
          }}>
            {r.kind === 'mcp'
              ? <img src="/mcp-logo.png" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              : r.kind === 'app'
                ? <AppProviderIcon provider={r.provider} size={26} />
                : <Icon name={visual.iconName} size={22} color={visual.fgColor} />
            }
          </div>
          {/* Status dot — only for non-active states */}
          {r.status === 'configuring' && (
            <span title="Configurando"
              style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 14, height: 14, borderRadius: '50%',
                background: color.warningDark,
                border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <Icon name="more_horiz" size={9} color="white" />
            </span>
          )}
        </div>

        {/* Bloque de texto: nombre · provider arriba; descripción abajo (solo globals) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: isGlobal ? 4 : 0, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: color.grey900 }}>{r.name}</span>
            {r.provider && (
              <span style={{ fontSize: 12.5, fontWeight: 500, color: color.grey500 }}>· {r.provider}</span>
            )}
            {r.accountLabel && (
              <span title={r.accountLabel} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 600, color: color.grey700,
                background: color.grey100, padding: '2px 8px', borderRadius: 100,
                maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <Icon name="account_circle" size={11} /> {r.accountLabel}
              </span>
            )}
          </div>
          {isGlobal && r.description && (
            <p style={{
              margin: 0, fontSize: 12.5, color: color.grey600, lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {r.description}
            </p>
          )}
        </div>

        {/* Scope chip + acciones (acciones aparecen solo en hover) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
          {isGlobal ? (
            <span style={{
              fontSize: 11, fontWeight: 600, color: color.successDark,
              background: color.successLight, border: `1px solid ${color.success}40`,
              borderRadius: 100, padding: '4px 10px',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              whiteSpace: 'nowrap',
            }}>
              <Icon name="all_inclusive" size={11} /> En todo el agente
            </span>
          ) : (
            <span style={{
              fontSize: 11, fontWeight: 600, color: color.primary,
              background: color.primaryUltraLight, border: `1px solid ${color.primaryLight}`,
              borderRadius: 100, padding: '4px 10px',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              whiteSpace: 'nowrap',
            }}>
              <Icon name="route" size={11} /> {r.flowName}
            </span>
          )}

          {/* Acciones — visibles en hover, ocultas durante edición. */}
          {!editing && (
            <div style={{
              display: 'flex', gap: 2,
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
              transition: 'opacity 0.12s, transform 0.12s',
              width: hovered ? 'auto' : 0, overflow: 'visible',
            }}>
              <button title={isGlobal ? 'Editar' : 'Ir al flujo'}
                onClick={() => { if (isGlobal) startEdit() }}
                style={{ width: 30, height: 30, borderRadius: 8, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey500, transition: 'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight }}
                onMouseLeave={e => { e.currentTarget.style.color = color.grey500; e.currentTarget.style.background = 'transparent' }}
              ><Icon name={isGlobal ? 'edit' : 'open_in_new'} size={15} /></button>
              {isGlobal && (
                <div style={{ position: 'relative' }}>
                  <button title="Eliminar"
                    onClick={() => setConfirmingDelete(c => !c)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: confirmingDelete ? color.errorLight : 'transparent',
                      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      color: confirmingDelete ? color.error : color.grey500,
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = color.error; e.currentTarget.style.background = color.errorLight }}
                    onMouseLeave={e => { if (!confirmingDelete) { e.currentTarget.style.color = color.grey500; e.currentTarget.style.background = 'transparent' } }}
                  ><Icon name="delete" size={15} /></button>
                  {confirmingDelete && (
                    <>
                      {/* Click-outside catcher */}
                      <div onClick={() => setConfirmingDelete(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                        zIndex: 101, width: 240,
                        background: 'white',
                        border: `1px solid ${color.borderDefault}`,
                        borderRadius: radius.md,
                        boxShadow: '0 14px 32px rgba(15,23,42,0.14), 0 2px 6px rgba(15,23,42,0.06)',
                        padding: 14,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                          <span style={{ width: 28, height: 28, borderRadius: 8, background: color.errorLight, color: color.error, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon name="delete" size={14} />
                          </span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: color.grey900, lineHeight: 1.3 }}>
                              ¿Quitar este recurso del agente?
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: 11.5, color: color.grey600, lineHeight: 1.45 }}>
                              Sigue disponible en el Proyecto para volver a agregarlo cuando quieras.
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button onClick={() => setConfirmingDelete(false)}
                            style={{ padding: '6px 12px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', color: color.grey700, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          >Cancelar</button>
                          <button onClick={() => { setConfirmingDelete(false); onRemove?.(r.id) }}
                            style={{ padding: '6px 12px', borderRadius: 100, border: 'none', background: color.error, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                          >Quitar</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inline edit form — mismos campos que el drawer al agregar */}
      {editing && (
        <div style={{
          padding: '0 16px 16px 74px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
              ¿Cuándo debería usarlo el agente?
            </label>
            <textarea value={draftWhen} onChange={e => setDraftWhen(e.target.value)}
              rows={2}
              style={{ ...inputBase, resize: 'vertical' }}
              autoFocus
              onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
              onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
            />
          </div>

          {hasAccountPicker && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                ¿Qué cuenta de {r.provider} usar?
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: color.grey50, border: `1px solid ${color.borderDefault}`, borderRadius: radius.md, padding: 4 }}>
                {editAccounts.map(acc => {
                  const selected = draftAccountId === acc.id
                  return (
                    <label key={acc.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 10px', borderRadius: radius.sm,
                        cursor: 'pointer', transition: 'background 0.12s',
                        background: selected ? color.primaryUltraLight : 'transparent',
                      }}
                      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'white' }}
                      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <input type="radio" name={`edit-acc-${r.id}`} checked={selected}
                        onChange={() => setDraftAccountId(acc.id)}
                        style={{ accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: color.grey900 }}>{acc.identifier}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {hasToolPicker && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                  Herramientas que puede usar · {draftTools.size}/{editTools.length}
                </label>
                <button
                  onClick={() => {
                    if (draftTools.size === editTools.length) setDraftTools(new Set())
                    else setDraftTools(new Set(editTools.map(t => t.id)))
                  }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: color.primary, fontWeight: 600, padding: 0 }}
                >
                  {draftTools.size === editTools.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: color.grey50, border: `1px solid ${color.borderDefault}`, borderRadius: radius.md, padding: 4 }}>
                {editTools.map(t => {
                  const checked = draftTools.has(t.id)
                  return (
                    <label key={t.id}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '7px 10px', borderRadius: radius.sm,
                        cursor: 'pointer', background: 'transparent', transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'white')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <input type="checkbox" checked={checked}
                        onChange={() => setDraftTools(prev => {
                          const next = new Set(prev)
                          if (next.has(t.id)) next.delete(t.id); else next.add(t.id)
                          return next
                        })}
                        style={{ marginTop: 2, accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 600, color: color.grey900, background: 'white', padding: '1px 6px', borderRadius: 4, border: `1px solid ${color.borderSubtle}` }}>{t.name}</code>
                          {t.risky && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#9A3412', background: '#FED7AA', padding: '1px 6px', borderRadius: 4 }}>
                              <Icon name="warning" size={9} /> Destructiva
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11.5, color: color.grey600, marginTop: 2 }}>{t.description}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            <button onClick={cancelEdit}
              style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', color: color.grey700, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >Cancelar</button>
            <button onClick={saveEdit} disabled={!canSave}
              style={{
                padding: '6px 14px', borderRadius: 100, border: 'none',
                background: canSave ? color.primary : color.grey200,
                color:      canSave ? 'white' : color.grey500,
                fontSize: 12, fontWeight: 700,
                cursor:     canSave ? 'pointer' : 'default',
              }}
            >Guardar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// Dropdown menu shown when the user clicks "Agregar acción". Lets them pick
// the kind (MCP / App / Código) before they commit. For the demo, picking any
// option populates the sample inventory so the populated state is visible.
function AddActionMenu({ onPick }: { onPick: (kind: ResourceKind) => void }) {
  const items: Array<{ kind: ResourceKind; label: string; subtitle: string }> = [
    { kind: 'mcp',  label: 'MCP',                subtitle: 'Conectá un servidor MCP con tools' },
    { kind: 'app',  label: 'Aplicación externa', subtitle: 'Gmail, Sheets, Slack, MercadoPago...' },
    { kind: 'code', label: 'Código',             subtitle: 'Función custom JS o Python' },
  ]
  // Plain inline panel — parent decides positioning (absolute / fixed / etc.).
  return (
    <div style={{
      width: 300, background: 'white',
      borderRadius: radius.md, border: `1px solid ${color.borderDefault}`,
      boxShadow: '0 12px 32px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.06)',
      padding: 6, display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      {items.map(it => {
        const v = RESOURCE_VISUAL[it.kind]
        return (
          <button
            key={it.kind}
            onClick={() => onPick(it.kind)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 10px', borderRadius: 8,
              border: 'none', background: 'transparent',
              cursor: 'pointer', textAlign: 'left',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = color.grey50)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: v.bgColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {it.kind === 'mcp'
                ? <img src="/mcp-logo.png" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                : <Icon name={v.iconName} size={18} color={v.fgColor} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: color.grey900 }}>{it.label}</div>
              <div style={{ fontSize: 11.5, color: color.grey500, lineHeight: 1.4 }}>{it.subtitle}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function AccionesEmptyState({ onPopulate }: { onPopulate: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  // 4 tarjetas distribuidas en abanico — todas comparten un pivot virtual
  // muy debajo del hero, lo que produce el efecto de mano de cartas. Mientras
  // más alejada del centro la card, mayor el ángulo.
  type HeroCard =
    | { kind: 'logo';  src: string; rot: number; size?: number; z?: number }
    | { kind: 'icon';  iconBg: string; iconFg: string; iconName: string; rot: number; size?: number; z?: number }
    | { kind: 'gmail'; rot: number; size?: number; z?: number }
    | { kind: 'sheets'; rot: number; size?: number; z?: number }

  const cards: HeroCard[] = [
    { kind: 'icon',   iconBg: '#DCFCE7', iconFg: '#166534', iconName: 'code', rot: -28, z: 1 },
    { kind: 'logo',   src: '/mcp-logo.png',                                   rot: -10, z: 2 },
    { kind: 'gmail',                                                          rot:  10, z: 3, size: 78 },
    { kind: 'sheets',                                                         rot:  28, z: 2 },
  ]

  // Gmail mark — envelope rojo con la M clásica (negative space white).
  const Gmail = ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size * 0.78} viewBox="0 0 64 50" style={{ display: 'block' }}>
      <rect x="0" y="6" width="64" height="44" rx="6" fill="#EA4335" />
      <rect x="0" y="6" width="10" height="44" rx="2" fill="#C5221F" opacity="0.55" />
      <rect x="54" y="6" width="10" height="44" rx="2" fill="#C5221F" opacity="0.55" />
      <path d="M6 14 L6 44 L14 44 L14 26 L32 38 L50 26 L50 44 L58 44 L58 14 L50 14 L32 26 L14 14 Z" fill="white" />
    </svg>
  )

  // Sheets mark — documento doblado verde con grid de filas/columnas blancas.
  const Sheets = ({ size = 32 }: { size?: number }) => (
    <svg width={size * 0.78} height={size} viewBox="0 0 50 64" style={{ display: 'block' }}>
      <path d="M30 0 H4 C1.8 0 0 1.8 0 4 v56 c0 2.2 1.8 4 4 4 h42 c2.2 0 4-1.8 4-4 V20 L30 0 Z" fill="#0F9D58" />
      <path d="M30 0 v16 c0 2.2 1.8 4 4 4 h16 L30 0 Z" fill="#0B7E47" />
      <rect x="10" y="28" width="30" height="3" fill="white" rx="0.5" />
      <rect x="10" y="35" width="30" height="3" fill="white" rx="0.5" />
      <rect x="10" y="42" width="30" height="3" fill="white" rx="0.5" />
      <rect x="10" y="49" width="30" height="3" fill="white" rx="0.5" />
      <rect x="19" y="26" width="3" height="28" fill="#0F9D58" />
      <rect x="28" y="26" width="3" height="28" fill="#0F9D58" />
    </svg>
  )

  const renderInner = (c: HeroCard) => {
    if (c.kind === 'logo')  return <img src={c.src} style={{ width: 36, height: 36, objectFit: 'contain' }} />
    if (c.kind === 'gmail') return <Gmail size={32} />
    if (c.kind === 'sheets') return <Sheets size={36} />
    return (
      <div style={{ width: 40, height: 40, borderRadius: 12, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={c.iconName} size={22} color={c.iconFg} />
      </div>
    )
  }

  return (
    <div style={{
      padding: '88px 24px 96px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
      background: 'radial-gradient(ellipse at top, rgba(48,79,254,0.045), transparent 60%)',
    }}>
      {/* Fan-out hero — todas las cards apiladas en el mismo punto, rotando
          alrededor de un pivot virtual muy por debajo. Da el efecto de mano
          de cartas / abanico. */}
      <div style={{ position: 'relative', width: 240, height: 110 }}>
        {cards.map((c, i) => {
          const size = c.size ?? 72
          return (
            <div key={i} style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              marginLeft: -(size / 2),
              width: size, height: size,
              borderRadius: 18,
              background: 'white',
              border: `1px solid ${color.borderDefault}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 16px 32px -10px rgba(15,23,42,0.22), 0 3px 8px rgba(15,23,42,0.08)',
              transform: `rotate(${c.rot}deg)`,
              transformOrigin: '50% 240px',  // pivot well below the cards → fan effect
              zIndex: c.z ?? 1,
            }}>
              {renderInner(c)}
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: color.grey900, letterSpacing: '-0.01em' }}>
          Sumá acciones a tu agente
        </h2>
        <p style={{ margin: '10px 0 0', fontSize: 14, color: color.grey600, lineHeight: 1.6 }}>
          Conectá <b style={{ color: color.grey900, fontWeight: 600 }}>MCPs</b>, <b style={{ color: color.grey900, fontWeight: 600 }}>aplicaciones externas</b> o agregá <b style={{ color: color.grey900, fontWeight: 600 }}>código</b> para que el agente pueda mandar mails, escribir en una hoja, generar pagos o lo que tu negocio necesite.
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <button onClick={() => setMenuOpen(o => !o)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 26px', borderRadius: 100, border: 'none',
            background: color.primary, color: 'white',
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 8px 24px -6px rgba(48,79,254,0.45), 0 2px 4px rgba(48,79,254,0.15)',
            transition: 'transform 0.12s, box-shadow 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(48,79,254,0.55), 0 3px 6px rgba(48,79,254,0.18)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px -6px rgba(48,79,254,0.45), 0 2px 4px rgba(48,79,254,0.15)' }}
        ><Icon name="add" size={16} /> Agregar acción</button>
        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <div style={{ position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
              <AddActionMenu onPick={() => { setMenuOpen(false); onPopulate() }} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Per-kind copy for headers, empty states and CTAs.
const KIND_COPY: Record<ResourceKind, { plural: string; singular: string; description: string; emptyTitle: string; emptyDesc: string }> = {
  mcp: {
    plural:    'MCP',
    singular:  'MCP',
    description: 'Conectá servidores MCP para darle al agente acceso a tools y servicios externos.',
    emptyTitle: 'Sumá MCPs al agente',
    emptyDesc:  'Conectá un servidor MCP para que el agente pueda usar tools como pagos, mensajería o catálogos.',
  },
  app: {
    plural:    'Aplicaciones externas',
    singular:  'aplicación',
    description: 'Aplicaciones que el agente puede invocar directamente: mandar mails, escribir en una hoja, postear en Slack…',
    emptyTitle: 'Sumá aplicaciones externas',
    emptyDesc:  'Conectá Gmail, Sheets, Slack o cualquier app para que el agente accione directo, sin pasar por un MCP.',
  },
  code: {
    plural:    'Códigos',
    singular:  'código',
    description: 'Funciones custom de JavaScript o Python que el agente ejecuta cuando necesita lógica específica del negocio.',
    emptyTitle: 'Sumá código custom',
    emptyDesc:  'Escribí funciones JS o Python para encapsular lógica de negocio que el agente pueda invocar como una tool.',
  },
}

// Workspace-level catalog per kind. In real app these come from the workspace
// admin; here mocked so the drawer can show realistic options + reuse counts.
interface WorkspaceResource {
  id:           string
  kind:         ResourceKind
  name:         string
  provider?:    string
  toolCount:    number
  usedInAgents: number
  // Solo MCPs: catálogo de tools que expone el server. Cada una incluye `risky`
  // (true para delete/refund/etc) para que la UI las pueda marcar y advertir.
  tools?:       { id: string; name: string; description: string; risky?: boolean }[]
}

// Cuentas conectadas a nivel workspace. La identidad real depende del provider
// (mail para Gmail, número para WhatsApp, handle/id para Mercado Libre, etc).
// Por ahora no manejamos alias — sólo el identifier nativo.
interface ConnectedAccount {
  id:         string
  provider:   string
  identifier: string         // email, número, handle
}

// Mock: cantidades variadas de cuentas por provider para mostrar cada caso —
// 1 sola, 2, y 3+. La UI debería leer bien en los 3 escenarios.
const WORKSPACE_ACCOUNTS: ConnectedAccount[] = [
  // Google Sheets — 1 sola cuenta (caso "single")
  { id: 'acc-sheets-1',  provider: 'Google Sheets',   identifier: 'ops@empresa.com'        },
  // Gmail — 2 cuentas (caso "few")
  { id: 'acc-gmail-1',   provider: 'Gmail',           identifier: 'ventas@empresa.com'     },
  { id: 'acc-gmail-2',   provider: 'Gmail',           identifier: 'soporte@empresa.com'    },
  // Google Calendar — 3 cuentas (caso "many")
  { id: 'acc-cal-1',     provider: 'Google Calendar', identifier: 'agenda@empresa.com'     },
  { id: 'acc-cal-2',     provider: 'Google Calendar', identifier: 'team@empresa.com'       },
  { id: 'acc-cal-3',     provider: 'Google Calendar', identifier: 'eventos@empresa.com'    },
  // Mercado Libre — 2 cuentas
  { id: 'acc-meli-1',    provider: 'Mercado Libre',   identifier: 'TIENDA_EMPRESA'         },
  { id: 'acc-meli-2',    provider: 'Mercado Libre',   identifier: 'OUTLET_EMPRESA'         },
  // WhatsApp — 2 cuentas
  { id: 'acc-wa-1',      provider: 'WhatsApp',        identifier: '+54 9 11 5555-0000'     },
  { id: 'acc-wa-2',      provider: 'WhatsApp',        identifier: '+54 9 11 5555-1111'     },
]

// Tools disponibles por provider de App. Como cada provider expone una API
// fija, las tools son las mismas para todas las instancias de ese provider
// (a diferencia de los MCPs, que son custom por server).
const PROVIDER_TOOLS: Record<string, { id: string; name: string; description: string; risky?: boolean }[]> = {
  'Gmail': [
    { id: 'send_email',    name: 'send_email',    description: 'Envía un mail desde la cuenta conectada.' },
    { id: 'list_emails',   name: 'list_emails',   description: 'Lista mails de la bandeja de entrada.' },
    { id: 'reply_email',   name: 'reply_email',   description: 'Responde a un hilo existente.' },
    { id: 'archive_email', name: 'archive_email', description: 'Archiva un mail.' },
    { id: 'delete_email',  name: 'delete_email',  description: 'Elimina un mail definitivamente.', risky: true },
  ],
  'Google Calendar': [
    { id: 'list_events',  name: 'list_events',  description: 'Lista eventos en un rango de fechas.' },
    { id: 'create_event', name: 'create_event', description: 'Crea un nuevo evento.' },
    { id: 'update_event', name: 'update_event', description: 'Modifica un evento existente.' },
    { id: 'cancel_event', name: 'cancel_event', description: 'Cancela un evento programado.', risky: true },
  ],
  'Google Sheets': [
    { id: 'read_rows',   name: 'read_rows',   description: 'Lee filas de una hoja.' },
    { id: 'append_row',  name: 'append_row',  description: 'Agrega una fila al final.' },
    { id: 'update_row',  name: 'update_row',  description: 'Actualiza una fila existente.' },
    { id: 'delete_row',  name: 'delete_row',  description: 'Elimina una fila permanentemente.', risky: true },
    { id: 'create_sheet', name: 'create_sheet', description: 'Crea una nueva hoja en el documento.' },
  ],
  'Mercado Libre': [
    { id: 'search_items',     name: 'search_items',     description: 'Busca publicaciones en el catálogo de la tienda.' },
    { id: 'get_item',         name: 'get_item',         description: 'Obtiene detalle de una publicación.' },
    { id: 'create_listing',   name: 'create_listing',   description: 'Crea una nueva publicación.' },
    { id: 'update_listing',   name: 'update_listing',   description: 'Modifica precio o stock de una publicación.' },
    { id: 'list_orders',      name: 'list_orders',      description: 'Lista las órdenes de venta del último período.' },
    { id: 'answer_question',  name: 'answer_question',  description: 'Responde una pregunta de un comprador.' },
    { id: 'end_listing',      name: 'end_listing',      description: 'Finaliza una publicación activa.', risky: true },
  ],
}

const WORKSPACE_RESOURCES: WorkspaceResource[] = [
  // MCPs
  { id: 'wmcp-pagos',    kind: 'mcp',  name: 'Pagos',          provider: 'MercadoPago',      toolCount: 4, usedInAgents: 4, tools: [
    { id: 'create_payment_link', name: 'create_payment_link', description: 'Genera un link de pago para el cliente.' },
    { id: 'get_payment_status',  name: 'get_payment_status',  description: 'Consulta el estado de una transacción.' },
    { id: 'send_receipt',        name: 'send_receipt',        description: 'Envía el comprobante de una compra.' },
    { id: 'refund_payment',      name: 'refund_payment',      description: 'Devuelve el dinero de una transacción.', risky: true },
  ] },
  { id: 'wmcp-notif',    kind: 'mcp',  name: 'Notificaciones', provider: 'WhatsApp Business', toolCount: 3, usedInAgents: 6, tools: [
    { id: 'send_template_message', name: 'send_template_message', description: 'Envía mensaje basado en template aprobado.' },
    { id: 'send_text_message',     name: 'send_text_message',     description: 'Envía mensaje libre dentro de la ventana de 24h.' },
    { id: 'broadcast_to_segment',  name: 'broadcast_to_segment',  description: 'Envía a un segmento masivo de contactos.', risky: true },
  ] },
  { id: 'wmcp-tracking', kind: 'mcp',  name: 'Tracking',       provider: 'Correo Argentino',  toolCount: 2, usedInAgents: 2, tools: [
    { id: 'track_shipment',  name: 'track_shipment',  description: 'Consulta el estado de un envío por número de seguimiento.' },
    { id: 'cancel_shipment', name: 'cancel_shipment', description: 'Cancela un envío en curso.', risky: true },
  ] },
  { id: 'wmcp-stripe',   kind: 'mcp',  name: 'Stripe',         provider: 'Stripe',            toolCount: 5, usedInAgents: 0, tools: [
    { id: 'create_checkout_session', name: 'create_checkout_session', description: 'Crea una sesión de checkout de Stripe.' },
    { id: 'retrieve_customer',       name: 'retrieve_customer',       description: 'Obtiene los datos de un cliente.' },
    { id: 'list_subscriptions',      name: 'list_subscriptions',      description: 'Lista las suscripciones activas de un cliente.' },
    { id: 'cancel_subscription',     name: 'cancel_subscription',     description: 'Cancela la suscripción de un cliente.', risky: true },
    { id: 'delete_customer',         name: 'delete_customer',         description: 'Elimina un cliente de Stripe.', risky: true },
  ] },
  { id: 'wmcp-calendly', kind: 'mcp',  name: 'Calendly',       provider: 'Calendly',          toolCount: 3, usedInAgents: 1, tools: [
    { id: 'list_event_types',  name: 'list_event_types',  description: 'Lista los tipos de eventos disponibles.' },
    { id: 'schedule_event',    name: 'schedule_event',    description: 'Agenda una nueva reunión.' },
    { id: 'cancel_event',      name: 'cancel_event',      description: 'Cancela una reunión existente.', risky: true },
  ] },
  // Apps externas — el nombre es el de la integración (Gmail, Sheets, etc).
  // El usuario diferencia múltiples conexiones por la cuenta y el cuándo.
  { id: 'wapp-gmail',    kind: 'app',  name: 'Gmail',           provider: 'Gmail',           toolCount: 5, usedInAgents: 5 },
  { id: 'wapp-cal',      kind: 'app',  name: 'Google Calendar', provider: 'Google Calendar', toolCount: 4, usedInAgents: 3 },
  { id: 'wapp-sheets',   kind: 'app',  name: 'Google Sheets',   provider: 'Google Sheets',   toolCount: 5, usedInAgents: 2 },
  { id: 'wapp-meli',     kind: 'app',  name: 'Mercado Libre',   provider: 'Mercado Libre',   toolCount: 7, usedInAgents: 1 },
  // Códigos
  { id: 'wcode-promo',   kind: 'code', name: 'calculatePriceWithDiscount', toolCount: 1, usedInAgents: 3 },
  { id: 'wcode-order',   kind: 'code', name: 'generateOrderNumber',        toolCount: 1, usedInAgents: 5 },
  { id: 'wcode-hours',   kind: 'code', name: 'validateBusinessHours',      toolCount: 1, usedInAgents: 2 },
  { id: 'wcode-otp',     kind: 'code', name: 'sendOTP',                    toolCount: 1, usedInAgents: 0 },
  { id: 'wcode-addr',    kind: 'code', name: 'parseAddress',               toolCount: 1, usedInAgents: 1 },
]

// ── MCPListV2 ─────────────────────────────────────────────────────────────────
// V2: lista unificada estilo Instagram/X/TikTok. Cada fila muestra el ícono
// del recurso + nombre + tipo (Aplicación externa / MCP Externo / MCP Interno)
// + descripción corta a la izquierda; a la derecha un botón "Conectar" que
// pasa a "Conectado para el agente" al usarlo. Si el recurso ya viene de una
// lógica, en vez del botón aparece un chip "En lógica X" (read-only).

const V2_KIND_LABEL: Record<ResourceKind, string> = {
  mcp:  'MCP Externo',
  app:  'Aplicación externa',
  code: 'MCP Interno',
}

// Mock: workspace items que ya están siendo usados por una o más lógicas del
// agente. Cada uso del mismo recurso por una lógica distinta = fila propia
// en el listado (no se apilan en una sola row).
const V2_FLOW_BOUND: Record<string, string[]> = {
  'wmcp-tracking': ['Consultar estado'],
  'wapp-sheets':   ['Tomar pedido', 'Consultar estado'],
  'wcode-promo':   ['Confirmar y pagar'],
}

function getV2RowDescription(wr: WorkspaceResource): string {
  if (wr.kind === 'mcp' && wr.tools && wr.tools.length > 0) {
    const more = wr.tools.length > 1 ? ` y ${wr.tools.length - 1} más` : ''
    return wr.tools[0].description.replace(/\.$/, '') + more + '.'
  }
  if (wr.kind === 'app' && wr.provider) {
    const tools = PROVIDER_TOOLS[wr.provider] ?? []
    if (tools.length > 0) {
      const more = tools.length > 1 ? ` y ${tools.length - 1} más` : ''
      return tools[0].description.replace(/\.$/, '') + more + '.'
    }
    return `Acciones disponibles vía ${wr.provider}.`
  }
  if (wr.kind === 'code') {
    return 'Función custom para lógica específica del negocio.'
  }
  return ''
}

type V2RowStatus = 'available' | 'global' | 'flow'

// Row para items que el usuario crea/elige y maneja a nivel agente (Lógicas,
// Automatizaciones). No tiene la dicotomía global/flow del catálogo de
// recursos — siempre es del agente. Click en la fila ejecuta `onClick`
// (típicamente abrir editor), y en hover aparecen acciones edit / delete.
function V2OwnedRow({
  iconNode, iconBg, name, typeLabel, description,
  onClick, onEdit, onDelete, isLast,
}: {
  iconNode:    React.ReactNode
  iconBg:      string
  name:        string
  typeLabel?:  string
  description?: string
  onClick?:    () => void
  onEdit?:     () => void
  onDelete?:   () => void
  isLast?:     boolean
}) {
  const [hovered, setHovered] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px',
        borderBottom: isLast ? 'none' : `1px solid ${color.borderSubtle}`,
        cursor: onClick ? 'pointer' : 'default',
        background: hovered ? color.grey50 : 'transparent',
        transition: 'background 0.12s',
      }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{iconNode}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: color.grey900, lineHeight: 1.2 }}>{name}</span>
          {typeLabel && (
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
              padding: '2px 8px', borderRadius: 100,
              background: color.grey100, color: color.grey700,
              textTransform: 'uppercase', lineHeight: 1.4,
            }}>{typeLabel}</span>
          )}
        </div>
        {description && (
          <p style={{
            margin: 0, fontSize: 12.5, color: color.grey600, lineHeight: 1.45,
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{description}</p>
        )}
      </div>

      {/* Acciones hover-revealed */}
      <div style={{
        display: 'flex', gap: 4, flexShrink: 0,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.12s',
        pointerEvents: hovered ? 'auto' : 'none',
      }}>
        {onEdit && (
          <button title="Editar"
            onClick={e => { e.stopPropagation(); onEdit() }}
            style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey500 }}
            onMouseEnter={e => { e.currentTarget.style.background = color.primaryUltraLight; e.currentTarget.style.color = color.primary }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color.grey500 }}
          ><Icon name="edit" size={15} /></button>
        )}
        {onDelete && (
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button title="Eliminar"
              onClick={() => setConfirmingDelete(c => !c)}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: confirmingDelete ? color.errorLight : 'transparent',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: confirmingDelete ? color.error : color.grey500,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = color.errorLight; e.currentTarget.style.color = color.error }}
              onMouseLeave={e => { if (!confirmingDelete) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color.grey500 } }}
            ><Icon name="delete" size={15} /></button>
            {confirmingDelete && (
              <>
                <div onClick={() => setConfirmingDelete(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  zIndex: 101, width: 220,
                  background: 'white',
                  border: `1px solid ${color.borderDefault}`,
                  borderRadius: radius.md,
                  boxShadow: '0 14px 32px rgba(15,23,42,0.14)',
                  padding: 12,
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: color.grey900, marginBottom: 10 }}>
                    ¿Eliminar {name}?
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    <button onClick={() => setConfirmingDelete(false)}
                      style={{ padding: '6px 12px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', color: color.grey700, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >Cancelar</button>
                    <button onClick={() => { setConfirmingDelete(false); onDelete() }}
                      style={{ padding: '6px 12px', borderRadius: 100, border: 'none', background: color.error, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >Eliminar</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function V2ListRow({
  iconNode, iconBg, iconBorder, name, typeLabel, provider, description,
  status, flowName, onConnect, onClickConnected, isLast,
}: {
  iconNode:           React.ReactNode
  iconBg:             string
  iconBorder:         boolean
  name:               string
  typeLabel?:         string
  provider?:          string
  description?:       string
  // Cada fila representa UNA instancia de uso. Si un recurso está en 3 lógicas
  // + global, aparecen 4 filas con el mismo nombre — cada una con su estado.
  status:             V2RowStatus
  flowName?:          string
  onConnect?:         () => void
  onClickConnected?:  () => void
  isLast?:            boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 18px',
      borderBottom: isLast ? 'none' : `1px solid ${color.borderSubtle}`,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: iconBg,
        border: iconBorder ? `1px solid ${color.borderSubtle}` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{iconNode}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: color.grey900, lineHeight: 1.2 }}>{name}</span>
          {typeLabel && (
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
              padding: '2px 8px', borderRadius: 100,
              background: color.grey100, color: color.grey700,
              textTransform: 'uppercase', lineHeight: 1.4,
            }}>{typeLabel}</span>
          )}
          {provider && (
            <span style={{ fontSize: 12, color: color.grey500 }}>· {provider}</span>
          )}
        </div>
        {description && (
          <p style={{
            margin: 0, fontSize: 12.5, color: color.grey600, lineHeight: 1.45,
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{description}</p>
        )}
      </div>

      <div style={{ flexShrink: 0 }}>
        {status === 'available' && (
          <button onClick={onConnect}
            style={{
              padding: '7px 18px', borderRadius: 100,
              border: `1px solid ${color.primary}`,
              background: 'white', color: color.primary,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = color.primary; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = color.primary }}
          >Conectar</button>
        )}
        {status === 'global' && (
          <button onClick={onClickConnected}
            style={{
              padding: '7px 14px', borderRadius: 100,
              border: `1px solid ${color.success}40`,
              background: color.successLight, color: color.successDark,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
            title="Click para quitar"
          >
            <Icon name="check" size={13} /> Disponible en todo el agente
          </button>
        )}
        {status === 'flow' && (
          <span style={{
            padding: '7px 14px', borderRadius: 100,
            border: `1px solid ${color.primaryLight}`,
            background: color.primaryUltraLight, color: color.primary,
            fontSize: 12.5, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <Icon name="route" size={12} /> En lógica {flowName}
          </span>
        )}
      </div>
    </div>
  )
}

// Sort dropdown reusable. Pill chico con label "Ordenar: X" + chevron.
type V2SortMode = 'recomendado' | 'nombre' | 'tipo' | 'estado'
const V2_SORT_LABEL: Record<V2SortMode, string> = {
  recomendado: 'Recomendado',
  nombre:      'Nombre A-Z',
  tipo:        'Tipo',
  estado:      'Estado',
}

function V2SortDropdown({ value, onChange, options }: {
  value:    V2SortMode
  onChange: (m: V2SortMode) => void
  options:  V2SortMode[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 12px 8px 14px', borderRadius: 100,
          border: `1px solid ${color.borderDefault}`,
          background: 'white',
          fontSize: 12.5, fontWeight: 600, color: color.grey800,
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
        <Icon name="swap_vert" size={14} color={color.grey500} />
        Ordenar: <span style={{ color: color.grey900 }}>{V2_SORT_LABEL[value]}</span>
        <Icon name="expand_more" size={14} color={color.grey500} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            zIndex: 61, minWidth: 180,
            background: 'white',
            border: `1px solid ${color.borderDefault}`,
            borderRadius: radius.md,
            boxShadow: '0 14px 32px rgba(15,23,42,0.14), 0 2px 6px rgba(15,23,42,0.06)',
            padding: 4,
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            {options.map(opt => {
              const active = value === opt
              return (
                <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: radius.sm,
                    background: active ? color.primaryUltraLight : 'transparent',
                    color: active ? color.primary : color.grey800,
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: 13, fontWeight: active ? 700 : 500,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = color.grey50 }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  {V2_SORT_LABEL[opt]}
                  {active && <Icon name="check" size={14} />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function MCPListV2() {
  const [workspaceItems, setWorkspaceItems] = useState<WorkspaceResource[]>(WORKSPACE_RESOURCES)
  const [agentItems, setAgentItems] = useState<Resource[]>([])
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<V2SortMode>('recomendado')

  // Modal "Agregar nuevo": primero pickear el kind, después rellenar el form.
  const [connectOpen, setConnectOpen] = useState(false)
  const [newKind, setNewKind] = useState<ResourceKind | null>(null)

  // Modal "Conectar" un workspace item al agente — pide cuándo + tools + cuenta.
  const [connectingWrId, setConnectingWrId]   = useState<string | null>(null)
  const [whenText,       setWhenText]         = useState('')
  const [enabledTools,   setEnabledTools]     = useState<Set<string>>(new Set())
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const startConnect = (wr: WorkspaceResource) => {
    setConnectingWrId(wr.id)
    setWhenText('')
    if (wr.kind === 'mcp' && wr.tools) {
      setEnabledTools(new Set(wr.tools.filter(t => !t.risky).map(t => t.id)))
      setSelectedAccountId(null)
    } else if (wr.kind === 'app' && wr.provider) {
      const tools = PROVIDER_TOOLS[wr.provider] ?? []
      setEnabledTools(new Set(tools.filter(t => !t.risky).map(t => t.id)))
      const accs = WORKSPACE_ACCOUNTS.filter(a => a.provider === wr.provider)
      setSelectedAccountId(accs[0]?.id ?? null)
    } else {
      setEnabledTools(new Set())
      setSelectedAccountId(null)
    }
  }

  const closeConnect = () => {
    setConnectingWrId(null)
    setWhenText(''); setEnabledTools(new Set()); setSelectedAccountId(null)
  }

  const confirmConnect = () => {
    const wr = workspaceItems.find(w => w.id === connectingWrId)
    if (!wr) return
    const isApp = wr.kind === 'app' && !!wr.provider
    const hasTools = (wr.kind === 'mcp' && !!wr.tools) || isApp
    if (!whenText.trim()) return
    if (hasTools && enabledTools.size === 0) return
    if (isApp && !selectedAccountId) return

    const account = selectedAccountId ? WORKSPACE_ACCOUNTS.find(a => a.id === selectedAccountId) : undefined
    // Cada conexión es una instancia con id único + ref al wr. Permite tener
    // múltiples conexiones del mismo recurso (Gmail) con distinto "cuándo".
    setAgentItems(p => [...p, {
      id: `inst-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      workspaceId: wr.id,
      kind: wr.kind, name: wr.name, provider: wr.provider,
      description: whenText.trim(), scope: 'global',
      toolCount: enabledTools.size || wr.toolCount,
      status: 'active',
      enabledTools: hasTools ? Array.from(enabledTools) : undefined,
      accountId:    isApp ? (selectedAccountId ?? undefined) : undefined,
      accountLabel: account ? account.identifier : undefined,
    }])
    closeConnect()
  }

  const removeFromAgent = (id: string) => setAgentItems(p => p.filter(r => r.id !== id))

  const handleAddNew = (newItem: WorkspaceResource, when: string, et?: string[], accountId?: string, newAccount?: ConnectedAccount) => {
    if (newAccount && !WORKSPACE_ACCOUNTS.some(a => a.id === newAccount.id)) {
      WORKSPACE_ACCOUNTS.push(newAccount)
    }
    setWorkspaceItems(p => [...p, newItem])
    const account = accountId ? WORKSPACE_ACCOUNTS.find(a => a.id === accountId) : undefined
    setAgentItems(p => [...p, {
      id: newItem.id, kind: newItem.kind, name: newItem.name, provider: newItem.provider,
      description: when, scope: 'global',
      toolCount: et?.length ?? newItem.toolCount,
      status: 'active',
      enabledTools: et, accountId,
      accountLabel: account ? account.identifier : undefined,
    }])
    setConnectOpen(false)
    setNewKind(null)
  }

  const filtered = workspaceItems.filter(wr =>
    !search ||
    wr.name.toLowerCase().includes(search.toLowerCase()) ||
    (wr.provider?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  // Cada wr expande a varias filas:
  //   - 1 fila por cada lógica que usa el recurso (status='flow', read-only)
  //   - 1 fila por cada instancia conectada al agente (status='global').
  //     Múltiples instancias del mismo recurso son válidas — cada una con su
  //     propio "cuándo" + cuenta + tools (ej: Gmail con 2 reglas distintas).
  //   - 1 fila "Conectar" (status='available') siempre presente para sumar
  //     una instancia más, incluso si ya hay otras.
  type DisplayRow = {
    wr:        WorkspaceResource
    rowKey:    string
    status:    V2RowStatus
    flowName?: string
    instance?: Resource              // sólo para status='global'
  }
  const buildRows = (): DisplayRow[] => {
    const rows: DisplayRow[] = []
    filtered.forEach(wr => {
      const flows = V2_FLOW_BOUND[wr.id] ?? []
      flows.forEach(flowName => {
        rows.push({ wr, rowKey: `${wr.id}-flow-${flowName}`, status: 'flow', flowName })
      })
      const instances = agentItems.filter(r => (r.workspaceId ?? r.id) === wr.id)
      instances.forEach(inst => {
        rows.push({ wr, rowKey: `inst-${inst.id}`, status: 'global', instance: inst })
      })
      rows.push({ wr, rowKey: `${wr.id}-add`, status: 'available' })
    })
    return rows
  }

  const statusOrder = (r: DisplayRow) =>
    r.status === 'global' ? 0 : r.status === 'flow' ? 1 : 2

  // Orden por defecto agrupa por wr.name — todas las filas de Gmail juntas,
  // después todas las de Sheets, etc. Dentro de cada wr: instancias primero,
  // después flow rows, y la fila "Conectar" al final del grupo. Esto evita
  // que al agregar una instancia se reordene la mitad del listado.
  const [orderedKeys, setOrderedKeys] = useState<string[]>([])
  useEffect(() => {
    const rows = buildRows()
    rows.sort((a, b) => {
      if (sortMode === 'estado') {
        return statusOrder(a) - statusOrder(b) || a.wr.name.localeCompare(b.wr.name)
      }
      if (sortMode === 'tipo') {
        const order = { mcp: 0, app: 1, code: 2 } as const
        return order[a.wr.kind] - order[b.wr.kind]
            || a.wr.name.localeCompare(b.wr.name)
            || statusOrder(a) - statusOrder(b)
      }
      // 'recomendado' y 'nombre': agrupar por wr.name + status interno
      return a.wr.name.localeCompare(b.wr.name) || statusOrder(a) - statusOrder(b)
    })
    setOrderedKeys(rows.map(r => r.rowKey))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortMode, workspaceItems, agentItems])

  // En cada render, reconstruimos los rows con el estado actual y los
  // mostramos en el orden congelado.
  const liveRowsByKey = new Map(buildRows().map(r => [r.rowKey, r]))
  const sorted = orderedKeys.map(k => liveRowsByKey.get(k)).filter(Boolean) as DisplayRow[]

  // - app:  logo brand real (Gmail/Sheets/Calendar/ML) sobre blanco con borde
  //         sutil para que los colores de la marca queden visibles.
  // - mcp:  logo MCP sobre gris.
  // - code: ícono `code` Material en negro sobre gris (es interno, no tiene
  //         brand propia — vive en Code Actions de Botmaker).
  const renderIcon = (wr: WorkspaceResource) => {
    if (wr.kind === 'app') {
      return { node: <AppProviderIcon provider={wr.provider} size={26} />, bg: 'white', border: true }
    }
    if (wr.kind === 'code') {
      return { node: <Icon name="code" size={22} color="#1F2937" />, bg: '#F1F5F9', border: false }
    }
    return { node: <img src="/mcp-logo.png" style={{ width: 24, height: 24, objectFit: 'contain' }} />, bg: '#F1F5F9', border: false }
  }

  const connectingWr = connectingWrId ? workspaceItems.find(w => w.id === connectingWrId) : null
  const cWrTools = connectingWr
    ? (connectingWr.kind === 'mcp' ? (connectingWr.tools ?? [])
       : connectingWr.kind === 'app' && connectingWr.provider ? (PROVIDER_TOOLS[connectingWr.provider] ?? [])
       : [])
    : []
  const cWrAccounts = connectingWr && connectingWr.kind === 'app' && connectingWr.provider
    ? WORKSPACE_ACCOUNTS.filter(a => a.provider === connectingWr.provider) : []
  const cHasTools    = !!connectingWr && (connectingWr.kind === 'mcp' || connectingWr.kind === 'app') && cWrTools.length > 0
  const cHasAccounts = !!connectingWr && connectingWr.kind === 'app' && cWrAccounts.length > 0
  const cCanConfirm  = !!connectingWr && whenText.trim().length > 0
    && (!cHasTools    || enabledTools.size > 0)
    && (!cHasAccounts || !!selectedAccountId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header con CTA "Agregar nuevo" arriba a la derecha */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: color.grey900, letterSpacing: '-0.01em' }}>MCP</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: color.grey600, lineHeight: 1.6, maxWidth: 720 }}>
            Tools y servicios que el agente puede invocar. Aplicaciones externas, MCPs externos del Proyecto y MCPs internos (funciones custom).
          </p>
        </div>
        <button onClick={() => { setConnectOpen(true); setNewKind(null) }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '9px 18px', borderRadius: 100, border: 'none',
            background: color.primary, color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px -3px rgba(48,79,254,0.35)',
            transition: 'transform 0.12s, box-shadow 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(48,79,254,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -3px rgba(48,79,254,0.35)' }}
        ><Icon name="add" size={14} /> Agregar nuevo</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar tool..." />
        </div>
        <V2SortDropdown value={sortMode} onChange={setSortMode}
          options={['recomendado', 'estado', 'nombre', 'tipo']}
        />
      </div>

      {/* Listado unificado — un solo container, todas las filas adentro */}
      {sorted.length === 0 ? (
        <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, padding: '40px 20px', textAlign: 'center' }}>
          <Icon name="search_off" size={32} color={color.grey400} />
          <p style={{ margin: '10px 0 4px', fontSize: 13, fontWeight: 600, color: color.grey800 }}>Sin resultados</p>
          <p style={{ margin: 0, fontSize: 12, color: color.grey500 }}>Probá con otra palabra.</p>
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: radius.lg,
          border: `1px solid ${color.borderDefault}`,
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        }}>
          {sorted.map((row, i) => {
            const ic = renderIcon(row.wr)
            // Instancias: descripción = "cuándo" del usuario, provider line =
            // identifier de la cuenta. Available/flow: descripción default y
            // provider sólo si difiere del nombre (evita "Gmail · Gmail").
            const description = row.status === 'global' && row.instance
              ? (row.instance.description || getV2RowDescription(row.wr))
              : getV2RowDescription(row.wr)
            const providerLine = row.status === 'global' && row.instance?.accountLabel
              ? row.instance.accountLabel
              : (row.wr.provider && row.wr.provider !== row.wr.name ? row.wr.provider : undefined)
            return (
              <V2ListRow key={row.rowKey}
                iconNode={ic.node} iconBg={ic.bg} iconBorder={ic.border}
                name={row.wr.name}
                typeLabel={V2_KIND_LABEL[row.wr.kind]}
                provider={providerLine}
                description={description}
                status={row.status}
                flowName={row.flowName}
                onConnect={() => startConnect(row.wr)}
                onClickConnected={() => row.instance && removeFromAgent(row.instance.id)}
                isLast={i === sorted.length - 1}
              />
            )
          })}
        </div>
      )}

      {/* Modal Agregar nuevo: kind picker → ConnectNewForm */}
      {connectOpen && (
        <V2Modal
          icon={<Icon name="add" size={20} color="white" />}
          iconBg={color.primary}
          title={newKind ? `Conectar nuevo ${V2_KIND_LABEL[newKind].toLowerCase()}` : 'Agregar nuevo'}
          subtitle={newKind ? 'Disponible para todo el Proyecto' : '¿Qué querés conectar al agente?'}
          onClose={() => { setConnectOpen(false); setNewKind(null) }}
        >
          {newKind === 'mcp' ? (
            <ConnectNewForm kind="mcp" onSubmit={handleAddNew} />
          ) : newKind === 'code' ? (
            // MCP Interno: no se crea desde acá. Lo creás en Code Actions
            // (ya existe esa sección en Botmaker) y después aparece en la
            // lista del agente para conectarlo.
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center', padding: '12px 0 6px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: '#F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 20px -8px rgba(15,23,42,0.18)',
              }}>
                <Icon name="code" size={32} color="#1F2937" />
              </div>
              <div style={{ maxWidth: 420 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: color.grey900 }}>
                  Los MCPs Internos viven en Code Actions
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: color.grey600, lineHeight: 1.55 }}>
                  Creá tu función en <strong style={{ color: color.grey900 }}>Code Actions</strong> de Botmaker
                  (JS o Python). Una vez guardada aparece acá para conectarla al agente.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={() => setNewKind(null)}
                  style={{ padding: '9px 18px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', color: color.grey700, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >Volver</button>
                <a href="#" onClick={e => e.preventDefault()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 100, border: 'none',
                    background: color.primary, color: 'white',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px -3px rgba(48,79,254,0.35)',
                  }}>
                  Ir a Code Actions <Icon name="open_in_new" size={13} />
                </a>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Hint: las apps externas se manejan desde Integraciones, no desde
                  acá. Por eso "Aplicación externa" no es opción del picker. */}
              <div style={{
                padding: '11px 14px', borderRadius: radius.md,
                background: color.primaryUltraLight,
                border: `1px solid ${color.primaryLight}`,
                display: 'flex', alignItems: 'flex-start', gap: 10,
                fontSize: 12, color: color.grey700, lineHeight: 1.5,
              }}>
                <Icon name="info" size={14} color={color.primary} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  Para Gmail, Sheets, Calendar o Mercado Libre, conectá tu cuenta en{' '}
                  <a href="#" onClick={e => e.preventDefault()} style={{ color: color.primary, fontWeight: 600, textDecoration: 'none' }}>Integraciones →</a>
                  . Después aparece en la lista para conectarlo al agente.
                </span>
              </div>

              {([
                { kind: 'mcp',  label: 'MCP Externo',  desc: 'Pegá la URL de un server MCP custom para darle tools al agente.', icon: <img src="/mcp-logo.png" style={{ width: 22, height: 22, objectFit: 'contain' }} />, bg: '#F1F5F9' },
                { kind: 'code', label: 'MCP Interno',  desc: 'Función JS o Python custom. Se crea en Code Actions de Botmaker.',  icon: <Icon name="code" size={22} color="#1F2937" />, bg: '#F1F5F9' },
              ] as const).map(opt => (
                <button key={opt.kind} onClick={() => setNewKind(opt.kind as ResourceKind)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: radius.md,
                    border: `1.5px solid ${color.borderDefault}`,
                    background: 'white', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color.primary; e.currentTarget.style.background = color.primaryUltraLight }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = color.borderDefault; e.currentTarget.style.background = 'white' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color.borderSubtle}` }}>
                    {opt.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: color.grey900 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: color.grey600, marginTop: 2, lineHeight: 1.45 }}>{opt.desc}</div>
                  </div>
                  <Icon name="chevron_right" size={18} color={color.grey400} />
                </button>
              ))}
            </div>
          )}
        </V2Modal>
      )}

      {/* Modal Conectar: pide cuándo + tools + cuenta antes de agregar el item */}
      {connectingWr && (
        <V2Modal
          icon={connectingWr.kind === 'app'
            ? <AppProviderIcon provider={connectingWr.provider} size={32} />
            : connectingWr.kind === 'code'
              ? <Icon name="code" size={28} color="#1F2937" />
              : <img src="/mcp-logo.png" style={{ width: 32, height: 32, objectFit: 'contain' }} />}
          iconBg={connectingWr.kind === 'app' ? 'white' : '#F1F5F9'}
          iconBorder={connectingWr.kind === 'app'}
          title={`Conectar ${connectingWr.name} al agente`}
          subtitle={`${V2_KIND_LABEL[connectingWr.kind]}${connectingWr.provider ? ` · ${connectingWr.provider}` : ''}${cWrTools.length > 0 ? ` · ${cWrTools.length} herramientas` : ''}`}
          onClose={closeConnect}
          footer={
            <>
              <button onClick={closeConnect}
                style={{ padding: '8px 16px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', color: color.grey700, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >Cancelar</button>
              <button onClick={confirmConnect} disabled={!cCanConfirm}
                style={{
                  padding: '8px 18px', borderRadius: 100, border: 'none',
                  background: cCanConfirm ? color.primary : color.grey200,
                  color:      cCanConfirm ? 'white' : color.grey500,
                  fontSize: 13, fontWeight: 700,
                  cursor:     cCanConfirm ? 'pointer' : 'default',
                }}
              >Conectar al agente</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                ¿Cuándo va a ser utilizado?
              </label>
              <textarea value={whenText} onChange={e => setWhenText(e.target.value)}
                placeholder={`Ej: Cuando el agente necesita ${connectingWr.name.toLowerCase()}.`}
                rows={2}
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  borderRadius: radius.md, border: `1px solid ${color.borderDefault}`,
                  fontSize: 13, color: color.grey900, outline: 'none', fontFamily: font.family,
                  background: 'white', resize: 'vertical', transition: 'border-color 0.12s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
              />
            </div>

            {/* Cuentas conectadas — vienen de Integraciones, no se conectan
                desde acá. Mostramos cards con brand icon. Si no hay ninguna,
                empty state con link a Integraciones. */}
            {connectingWr.kind === 'app' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                  ¿Qué cuenta de {connectingWr.provider} usar?
                </label>
                {cHasAccounts && (
                  <a href="#" onClick={e => e.preventDefault()}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '9px 14px', borderRadius: radius.md,
                      border: `1px dashed ${color.primaryLight}`,
                      background: color.primaryUltraLight,
                      color: color.primary,
                      fontSize: 12.5, fontWeight: 600,
                      textDecoration: 'none', transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderStyle = 'solid'; e.currentTarget.style.borderColor = color.primary }}
                    onMouseLeave={e => { e.currentTarget.style.borderStyle = 'dashed'; e.currentTarget.style.borderColor = color.primaryLight }}
                  >
                    <Icon name="add" size={14} /> Conectar otra cuenta de {connectingWr.provider} en Integraciones
                    <Icon name="open_in_new" size={11} />
                  </a>
                )}
                {cHasAccounts ? (
                  <div style={{ display: 'grid', gridTemplateColumns: cWrAccounts.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                    {cWrAccounts.map(acc => {
                      const sel = selectedAccountId === acc.id
                      return (
                        <button key={acc.id} onClick={() => setSelectedAccountId(acc.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: radius.md, cursor: 'pointer',
                            background: sel ? color.primaryUltraLight : 'white',
                            border: `1.5px solid ${sel ? color.primary : color.borderDefault}`,
                            textAlign: 'left', transition: 'all 0.12s',
                          }}
                          onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = color.primaryLight }}
                          onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = color.borderDefault }}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: 'white', border: `1px solid ${color.borderSubtle}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AppProviderIcon provider={connectingWr.provider} size={20} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: color.grey900, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.identifier}</div>
                          </div>
                          {sel && (
                            <Icon name="check_circle" size={18} color={color.primary} style={{ flexShrink: 0 }} filled />
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{
                    padding: '16px 18px', borderRadius: radius.md,
                    border: `1px dashed ${color.borderDefault}`,
                    background: color.grey50,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'white', border: `1px solid ${color.borderSubtle}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AppProviderIcon provider={connectingWr.provider} size={22} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: color.grey900, lineHeight: 1.3 }}>
                        No tenés cuentas de {connectingWr.provider} conectadas
                      </div>
                      <div style={{ fontSize: 11.5, color: color.grey600, marginTop: 2, lineHeight: 1.4 }}>
                        Conectá una cuenta desde Integraciones para usarla acá.
                      </div>
                    </div>
                    <a href="#" onClick={e => e.preventDefault()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: color.primary, textDecoration: 'none', flexShrink: 0, padding: '6px 12px', borderRadius: 100, border: `1px solid ${color.primary}`, background: 'white' }}>
                      Ir a Integraciones <Icon name="open_in_new" size={11} />
                    </a>
                  </div>
                )}
              </div>
            )}

            {cHasTools && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                    Herramientas que puede usar · {enabledTools.size}/{cWrTools.length}
                  </label>
                  <button
                    onClick={() => {
                      if (enabledTools.size === cWrTools.length) setEnabledTools(new Set())
                      else setEnabledTools(new Set(cWrTools.map(t => t.id)))
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: color.primary, fontWeight: 600, padding: 0 }}
                  >
                    {enabledTools.size === cWrTools.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: color.grey50, border: `1px solid ${color.borderDefault}`, borderRadius: radius.md, padding: 4, maxHeight: 280, overflowY: 'auto' }}>
                  {cWrTools.map(t => {
                    const checked = enabledTools.has(t.id)
                    return (
                      <label key={t.id}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          padding: '7px 10px', borderRadius: radius.sm,
                          cursor: 'pointer', transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'white')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <input type="checkbox" checked={checked}
                          onChange={() => setEnabledTools(prev => {
                            const next = new Set(prev)
                            if (next.has(t.id)) next.delete(t.id); else next.add(t.id)
                            return next
                          })}
                          style={{ marginTop: 2, accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 600, color: color.grey900, background: 'white', padding: '1px 6px', borderRadius: 4, border: `1px solid ${color.borderSubtle}` }}>{t.name}</code>
                            {t.risky && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#9A3412', background: '#FED7AA', padding: '1px 6px', borderRadius: 4 }}>
                                <Icon name="warning" size={9} /> Destructiva
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: color.grey600, marginTop: 2, lineHeight: 1.4 }}>{t.description}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </V2Modal>
      )}
    </div>
  )
}

// ── ResourceListTabV2 ─────────────────────────────────────────────────────────
// Variante "marketplace inline" para probar con el CEO. Sin empty state ni
// drawer: al entrar al tab se ve la grilla completa de recursos del workspace
// con un botón "Agregar" al lado de cada uno. Para conectar un MCP / app /
// código nuevo hay un CTA prominente arriba que expande un formulario inline.
// Diferencias clave vs V1:
//   - El catálogo del workspace está visible desde el primer segundo.
//   - El "Conectá tu propio X" vive en hero, no detrás de un drawer.
//   - Los recursos ya activos se muestran en cards arriba.
function ResourceListTabV2({ kind }: { kind: ResourceKind }) {
  const copy = KIND_COPY[kind]
  const [agentItems, setAgentItems] = useState<Resource[]>([])
  const [workspaceItems, setWorkspaceItems] = useState<WorkspaceResource[]>(WORKSPACE_RESOURCES.filter(r => r.kind === kind))
  const [search, setSearch] = useState('')

  // Card-level inline expansion para agregar un workspace item.
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null)
  const [whenText, setWhenText] = useState('')
  const [enabledTools, setEnabledTools] = useState<Set<string>>(new Set())
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  // Hero "Conectar nuevo" — se expande inline en lugar de abrir un drawer.
  const [connectOpen, setConnectOpen] = useState(false)

  const addExisting = (wr: WorkspaceResource, when: string, et?: string[], accountId?: string) => {
    if (agentItems.some(r => r.id === wr.id)) return
    const account = accountId ? WORKSPACE_ACCOUNTS.find(a => a.id === accountId) : undefined
    setAgentItems(p => [...p, {
      id: wr.id, kind: wr.kind, name: wr.name, provider: wr.provider,
      description: when, scope: 'global',
      toolCount: et?.length ?? wr.toolCount,
      status: 'active',
      enabledTools: et,
      accountId,
      accountLabel: account ? account.identifier : undefined,
    }])
  }
  const removeFromAgent = (id: string) => setAgentItems(p => p.filter(r => r.id !== id))
  const editResource = (
    id: string,
    patch: { description?: string; enabledTools?: string[]; accountId?: string }
  ) => {
    setAgentItems(p => p.map(r => {
      if (r.id !== id) return r
      const next = { ...r }
      if (patch.description !== undefined) next.description = patch.description
      if (patch.enabledTools !== undefined) {
        next.enabledTools = patch.enabledTools
        next.toolCount = patch.enabledTools.length
      }
      if (patch.accountId !== undefined) {
        next.accountId = patch.accountId
        const acc = WORKSPACE_ACCOUNTS.find(a => a.id === patch.accountId)
        next.accountLabel = acc ? acc.identifier : undefined
      }
      return next
    }))
  }
  const uploadAndAdd = (newItem: WorkspaceResource, when: string, et?: string[], accountId?: string, newAccount?: ConnectedAccount) => {
    if (newAccount && !WORKSPACE_ACCOUNTS.some(a => a.id === newAccount.id)) {
      WORKSPACE_ACCOUNTS.push(newAccount)
    }
    setWorkspaceItems(p => [...p, newItem])
    addExisting(newItem, when, et, accountId)
  }

  // Cuando el usuario clickea "Agregar" en un workspace card, hidratamos el
  // estado de edición (cuándo, tools, cuenta) con defaults seguros.
  const startCardAdd = (wr: WorkspaceResource) => {
    if (expandedWorkspaceId === wr.id) {
      setExpandedWorkspaceId(null); return
    }
    setExpandedWorkspaceId(wr.id)
    setWhenText('')
    if (wr.kind === 'mcp' && wr.tools) {
      setEnabledTools(new Set(wr.tools.filter(t => !t.risky).map(t => t.id)))
      setSelectedAccountId(null)
    } else if (wr.kind === 'app' && wr.provider) {
      const tools = PROVIDER_TOOLS[wr.provider] ?? []
      setEnabledTools(new Set(tools.filter(t => !t.risky).map(t => t.id)))
      const accs = WORKSPACE_ACCOUNTS.filter(a => a.provider === wr.provider)
      setSelectedAccountId(accs[0]?.id ?? null)
    } else {
      setEnabledTools(new Set())
      setSelectedAccountId(null)
    }
  }

  const confirmCardAdd = (wr: WorkspaceResource) => {
    if (!whenText.trim()) return
    const isMcp = wr.kind === 'mcp' && !!wr.tools
    const isApp = wr.kind === 'app' && !!wr.provider
    if ((isMcp || isApp) && enabledTools.size === 0) return
    if (isApp && !selectedAccountId) return
    const et  = (isMcp || isApp) ? Array.from(enabledTools) : undefined
    const aid = isApp ? (selectedAccountId ?? undefined) : undefined
    addExisting(wr, whenText.trim(), et, aid)
    setExpandedWorkspaceId(null)
    setWhenText(''); setEnabledTools(new Set()); setSelectedAccountId(null)
  }

  const visual = RESOURCE_VISUAL[kind]
  const assignedIds = new Set(agentItems.map(r => r.id))
  const filteredWorkspace = workspaceItems.filter(wr => {
    if (!search) return true
    const q = search.toLowerCase()
    return wr.name.toLowerCase().includes(q) || (wr.provider?.toLowerCase().includes(q) ?? false)
  })

  const ctaLabel =
       kind === 'mcp'  ? 'Agregar nuevo MCP'
     : kind === 'app'  ? 'Agregar nueva app'
     : 'Agregar nuevo código'

  // Modal con la wr expandida (form de agregar existing) — la wr la sacamos del id.
  const expandedWr = expandedWorkspaceId
    ? workspaceItems.find(w => w.id === expandedWorkspaceId)
    : null
  const expandedWrTools = expandedWr
    ? (expandedWr.kind === 'mcp' ? (expandedWr.tools ?? [])
       : expandedWr.kind === 'app' && expandedWr.provider ? (PROVIDER_TOOLS[expandedWr.provider] ?? [])
       : [])
    : []
  const expandedWrAccounts = expandedWr && expandedWr.kind === 'app' && expandedWr.provider
    ? WORKSPACE_ACCOUNTS.filter(a => a.provider === expandedWr.provider)
    : []
  const expandedHasTools    = expandedWr ? ((expandedWr.kind === 'mcp' || expandedWr.kind === 'app') && expandedWrTools.length > 0) : false
  const expandedHasAccounts = expandedWr ? (expandedWr.kind === 'app' && expandedWrAccounts.length > 0) : false
  const expandedCanConfirm  = !!expandedWr
    && whenText.trim().length > 0
    && (!expandedHasTools    || enabledTools.size > 0)
    && (!expandedHasAccounts || !!selectedAccountId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header con CTA primario a la derecha */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: color.grey900, letterSpacing: '-0.01em' }}>{copy.plural}</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: color.grey600, lineHeight: 1.6, maxWidth: 720 }}>
            {copy.description}
          </p>
        </div>
        <button onClick={() => setConnectOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '9px 18px', borderRadius: 100, border: 'none',
            background: color.primary, color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px -3px rgba(48,79,254,0.35)',
            transition: 'transform 0.12s, box-shadow 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(48,79,254,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -3px rgba(48,79,254,0.35)' }}
        ><Icon name="add" size={14} /> {ctaLabel}</button>
      </div>

      {/* Empty state real (no banner) — centrado vertical con icono kind-specific.
          La diferencia con V1 es que abajo el catálogo sigue visible, así que
          el empty state termina con un hint apuntando a las disponibles. */}
      {agentItems.length === 0 && (
        <div style={{
          background: 'white',
          border: `1px solid ${color.borderDefault}`,
          borderRadius: radius.lg,
          padding: '40px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          gap: 14,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: visual.bgColor,
            border: `1px solid ${color.borderDefault}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 28px -8px rgba(15,23,42,0.16), 0 2px 6px rgba(15,23,42,0.05)',
          }}>
            {kind === 'mcp'
              ? <img src="/mcp-logo.png" style={{ width: 32, height: 32, objectFit: 'contain' }} />
              : <Icon name={visual.iconName} size={30} color={visual.fgColor} />
            }
          </div>
          <div style={{ maxWidth: 460 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: color.grey900 }}>
              {copy.emptyTitle}
            </h3>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: color.grey500, lineHeight: 1.55 }}>
              {copy.emptyDesc}
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11.5, fontWeight: 600, color: color.grey500,
            marginTop: 4,
          }}>
            <Icon name="south" size={12} /> O elegí uno de los disponibles abajo
          </span>
        </div>
      )}

      {/* Activas en este agente */}
      {agentItems.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color.grey500 }}>
              Activas en este agente · {agentItems.length}
            </span>
          </div>
          <div style={{
            background: 'white', borderRadius: radius.lg,
            border: `1px solid ${color.borderDefault}`,
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          }}>
            {agentItems.map((r, i) => (
              <ResourceRow key={r.id} r={r} isLast={i === agentItems.length - 1}
                onEdit={editResource} onRemove={removeFromAgent}
              />
            ))}
          </div>
        </div>
      )}

      {/* Catálogo del workspace */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color.grey500 }}>
            Disponibles del Proyecto · {workspaceItems.length - assignedIds.size}
          </span>
          <div style={{ width: 240 }}>
            <SearchInput value={search} onChange={setSearch} placeholder={`Buscar ${kind === 'mcp' ? 'MCP' : kind === 'app' ? 'app' : 'código'}...`} />
          </div>
        </div>

        {filteredWorkspace.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', background: 'white', borderRadius: radius.md, border: `1px solid ${color.borderDefault}` }}>
            <Icon name="search_off" size={28} color={color.grey400} />
            <p style={{ margin: '8px 0 0', fontSize: 12.5, color: color.grey600 }}>Sin resultados en el catálogo.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12,
          }}>
            {filteredWorkspace.map(wr => {
              const isAdded = assignedIds.has(wr.id)
              return (
                <div key={wr.id}
                  style={{
                    background: 'white',
                    border: `1px solid ${isAdded ? color.success + '60' : color.borderDefault}`,
                    borderRadius: radius.lg,
                    transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px',
                  }}
                  onMouseEnter={e => { if (!isAdded) { e.currentTarget.style.borderColor = color.primaryLight; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 14px -6px rgba(48,79,254,0.18)' } }}
                  onMouseLeave={e => { if (!isAdded) { e.currentTarget.style.borderColor = color.borderDefault; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.03)' } }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: kind === 'app' ? 'white' : visual.bgColor,
                    border: kind === 'app' ? `1px solid ${color.borderSubtle}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {kind === 'mcp'
                      ? <img src="/mcp-logo.png" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                      : kind === 'app'
                        ? <AppProviderIcon provider={wr.provider} size={24} />
                        : <Icon name={visual.iconName} size={20} color={visual.fgColor} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: color.grey900, lineHeight: 1.2 }}>
                      {wr.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: 11.5, color: color.grey500 }}>
                      {wr.provider
                        ? <span>{wr.provider}</span>
                        : <span>Nuevo en el Proyecto</span>}
                    </div>
                  </div>
                  {isAdded ? (
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '5px 10px', borderRadius: 100,
                        border: `1px solid ${color.success}40`,
                        background: color.successLight, color: color.successDark,
                        fontSize: 11, fontWeight: 700,
                        flexShrink: 0,
                      }}
                      title="Click en la fila para quitar"
                      onClick={() => removeFromAgent(wr.id)}
                    >
                      <Icon name="check" size={11} /> Agregada
                    </span>
                  ) : (
                    <button onClick={() => startCardAdd(wr)}
                      style={{
                        padding: '6px 14px', borderRadius: 100,
                        border: `1px solid ${color.primaryLight}`,
                        background: 'white', color: color.primary,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        transition: 'all 0.12s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = color.primaryUltraLight }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
                    >
                      <Icon name="add" size={12} /> Agregar
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal: agregar item existente del workspace */}
      {expandedWr && (
        <V2Modal
          icon={
            expandedWr.kind === 'mcp'
              ? <img src="/mcp-logo.png" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              : expandedWr.kind === 'app'
                ? <AppProviderIcon provider={expandedWr.provider} size={24} />
                : <Icon name={visual.iconName} size={20} color={visual.fgColor} />
          }
          iconBg={expandedWr.kind === 'app' ? 'white' : visual.bgColor}
          iconBorder={expandedWr.kind === 'app'}
          title={`Agregar ${expandedWr.name}`}
          subtitle={expandedWr.provider ? `${expandedWr.provider} · catálogo del Proyecto` : 'Catálogo del Proyecto'}
          onClose={() => setExpandedWorkspaceId(null)}
          footer={
            <>
              <button onClick={() => setExpandedWorkspaceId(null)}
                style={{ padding: '8px 16px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', color: color.grey700, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >Cancelar</button>
              <button onClick={() => confirmCardAdd(expandedWr)} disabled={!expandedCanConfirm}
                style={{
                  padding: '8px 18px', borderRadius: 100, border: 'none',
                  background: expandedCanConfirm ? color.primary : color.grey200,
                  color:      expandedCanConfirm ? 'white' : color.grey500,
                  fontSize: 13, fontWeight: 700,
                  cursor:     expandedCanConfirm ? 'pointer' : 'default',
                }}
              >Agregar al agente</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                ¿Cuándo debería usarlo el agente?
              </label>
              <textarea value={whenText} onChange={e => setWhenText(e.target.value)}
                placeholder={`Ej: Cuando el agente necesita ${expandedWr.name.toLowerCase()}.`}
                rows={2}
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  borderRadius: radius.md, border: `1px solid ${color.borderDefault}`,
                  fontSize: 13, color: color.grey900, outline: 'none', fontFamily: font.family,
                  background: 'white', resize: 'vertical', transition: 'border-color 0.12s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
              />
            </div>

            {expandedHasAccounts && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                  ¿Qué cuenta de {expandedWr.provider} usar?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 6 }}>
                  {expandedWrAccounts.map(acc => {
                    const sel = selectedAccountId === acc.id
                    return (
                      <label key={acc.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', borderRadius: radius.md,
                          cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s',
                          background: sel ? color.primaryUltraLight : 'white',
                          border: `1.5px solid ${sel ? color.primary : color.borderDefault}`,
                        }}>
                        <input type="radio" name={`v2-modal-acc-${expandedWr.id}`} checked={sel}
                          onChange={() => setSelectedAccountId(acc.id)}
                          style={{ accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: color.grey900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.identifier}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {expandedHasTools && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                    Herramientas que puede usar · {enabledTools.size}/{expandedWrTools.length}
                  </label>
                  <button
                    onClick={() => {
                      if (enabledTools.size === expandedWrTools.length) setEnabledTools(new Set())
                      else setEnabledTools(new Set(expandedWrTools.map(t => t.id)))
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: color.primary, fontWeight: 600, padding: 0 }}
                  >
                    {enabledTools.size === expandedWrTools.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: color.grey50, border: `1px solid ${color.borderDefault}`, borderRadius: radius.md, padding: 4, maxHeight: 280, overflowY: 'auto' }}>
                  {expandedWrTools.map(t => {
                    const checked = enabledTools.has(t.id)
                    return (
                      <label key={t.id}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          padding: '7px 10px', borderRadius: radius.sm,
                          cursor: 'pointer', transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'white')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <input type="checkbox" checked={checked}
                          onChange={() => setEnabledTools(prev => {
                            const next = new Set(prev)
                            if (next.has(t.id)) next.delete(t.id); else next.add(t.id)
                            return next
                          })}
                          style={{ marginTop: 2, accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 600, color: color.grey900, background: 'white', padding: '1px 6px', borderRadius: 4, border: `1px solid ${color.borderSubtle}` }}>{t.name}</code>
                            {t.risky && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#9A3412', background: '#FED7AA', padding: '1px 6px', borderRadius: 4 }}>
                                <Icon name="warning" size={9} /> Destructiva
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: color.grey600, marginTop: 2, lineHeight: 1.4 }}>{t.description}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </V2Modal>
      )}

      {/* Modal: conectar nuevo recurso al workspace */}
      {connectOpen && (
        <V2Modal
          icon={<Icon name="add" size={20} color="white" />}
          iconBg={color.primary}
          title={ctaLabel}
          subtitle={kind === 'mcp'
            ? 'El MCP queda disponible para todo el Proyecto'
            : kind === 'app'
            ? 'La conexión queda disponible para todo el Proyecto'
            : 'La función queda disponible para todo el Proyecto'}
          onClose={() => setConnectOpen(false)}
        >
          <ConnectNewForm
            kind={kind}
            onSubmit={(newItem, when, et, accountId, newAccount) => {
              uploadAndAdd(newItem, when, et, accountId, newAccount)
              setConnectOpen(false)
            }}
          />
        </V2Modal>
      )}
    </div>
  )
}

// Modal centrado reusable para V2. Usa createPortal para evitar conflictos
// de z-index con el shell del agente. Header con icono coloreado, body, footer.
function V2Modal({
  icon, iconBg, iconBorder, title, subtitle, children, footer, onClose,
}: {
  icon:        React.ReactNode
  iconBg?:     string
  iconBorder?: boolean
  title:       string
  subtitle?:   string
  children:    React.ReactNode
  footer?:     React.ReactNode
  onClose:     () => void
}) {
  return createPortal(
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.18s ease',
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, pointerEvents: 'none',
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: '100%', maxWidth: 580, maxHeight: '88vh',
          background: 'white',
          borderRadius: 18,
          boxShadow: '0 32px 80px rgba(15,23,42,0.28), 0 4px 12px rgba(15,23,42,0.08)',
          fontFamily: font.family,
          display: 'flex', flexDirection: 'column',
          animation: 'modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'auto',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '22px 24px 20px', borderBottom: `1px solid ${color.borderSubtle}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: iconBg ?? color.grey100,
                border: iconBorder ? `1px solid ${color.borderSubtle}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 14px -6px rgba(15,23,42,0.18)',
              }}>{icon}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: color.grey900, lineHeight: 1.25, letterSpacing: '-0.01em' }}>{title}</div>
                {subtitle && <div style={{ fontSize: 12.5, color: color.grey500, marginTop: 3, lineHeight: 1.4 }}>{subtitle}</div>}
              </div>
            </div>
            <button onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500, flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.background = color.grey100)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            ><Icon name="close" size={18} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {children}
          </div>
          {footer && (
            <div style={{ padding: '14px 24px', borderTop: `1px solid ${color.borderSubtle}`, display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0, background: color.grey50 }}>
              {footer}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes modalIn { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>,
    document.body
  )
}

// (V2 ya no usa hero card — el "Conectar nuevo" es un botón al lado del header
//  que abre el modal directamente. ConnectNewForm sigue en uso desde el modal.)

// Formulario de upload para V2 — extrae la lógica que vivía dentro del drawer
// (discovery MCP, OAuth mock para apps, autoload de tools) sin el shell.
function ConnectNewForm({
  kind, onSubmit,
}: {
  kind: ResourceKind
  onSubmit: (newItem: WorkspaceResource, when: string, et?: string[], accountId?: string, newAccount?: ConnectedAccount) => void
}) {
  const [name, setName] = useState('')
  const [when, setWhen] = useState('')

  // MCP-specific
  const [mcpUrl, setMcpUrl] = useState('')
  const [mcpAuth, setMcpAuth] = useState<'none' | 'apikey' | 'oauth'>('none')
  const [mcpKey, setMcpKey] = useState('')
  const [mcpDiscovering, setMcpDiscovering] = useState(false)
  const [mcpDiscoveredTools, setMcpDiscoveredTools] = useState<{ id: string; name: string; description: string; risky?: boolean }[] | null>(null)
  const [mcpEnabled, setMcpEnabled] = useState<Set<string>>(new Set())

  // App-specific
  const [appProvider, setAppProvider] = useState('')
  const [appAccountId, setAppAccountId] = useState<string | null>(null)
  const [appNewAccount, setAppNewAccount] = useState<ConnectedAccount | null>(null)
  const [appConnecting, setAppConnecting] = useState(false)
  const [appEnabled, setAppEnabled] = useState<Set<string>>(new Set())

  // Code-specific
  const [codeLang, setCodeLang] = useState<'js' | 'python'>('js')
  const [codeBody, setCodeBody] = useState('')

  const inputBase: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    borderRadius: radius.md, border: `1px solid ${color.borderDefault}`,
    fontSize: 13, color: color.grey900, outline: 'none', fontFamily: font.family,
    background: 'white', transition: 'border-color 0.12s',
  }

  // MCP discovery
  const MOCK_NEW_MCP_TOOLS = [
    { id: 'list_items',  name: 'list_items',  description: 'Lista todos los items disponibles.' },
    { id: 'get_item',    name: 'get_item',    description: 'Obtiene los detalles de un item.' },
    { id: 'create_item', name: 'create_item', description: 'Crea un nuevo item.' },
    { id: 'update_item', name: 'update_item', description: 'Actualiza un item existente.' },
    { id: 'delete_item', name: 'delete_item', description: 'Elimina un item permanentemente.', risky: true },
  ]
  const mcpReady = mcpUrl.trim().length > 0 && (mcpAuth === 'none' || mcpKey.trim().length > 0)
  const handleDiscover = () => {
    if (!mcpReady || mcpDiscovering) return
    setMcpDiscovering(true)
    setTimeout(() => {
      setMcpDiscoveredTools(MOCK_NEW_MCP_TOOLS)
      setMcpEnabled(new Set(MOCK_NEW_MCP_TOOLS.filter(t => !t.risky).map(t => t.id)))
      setMcpDiscovering(false)
    }, 1500)
  }
  const resetMcp = () => { setMcpDiscoveredTools(null); setMcpEnabled(new Set()) }

  // App OAuth mock
  const appAccounts = appProvider
    ? [...WORKSPACE_ACCOUNTS.filter(a => a.provider === appProvider), ...(appNewAccount ? [appNewAccount] : [])]
    : []
  const appTools = appProvider ? (PROVIDER_TOOLS[appProvider] ?? []) : []
  const handleConnectApp = () => {
    if (!appProvider || appConnecting) return
    setAppConnecting(true)
    setTimeout(() => {
      const slug = appProvider.toLowerCase().replace(/\s+/g, '-')
      const newAcc: ConnectedAccount = {
        id: `acc-${slug}-${Date.now()}`,
        provider: appProvider,
        identifier: `nueva-${slug}@empresa.com`,
      }
      setAppNewAccount(newAcc)
      setAppAccountId(newAcc.id)
      setAppConnecting(false)
      if (appEnabled.size === 0) {
        setAppEnabled(new Set(appTools.filter(t => !t.risky).map(t => t.id)))
      }
    }, 1500)
  }

  const sourceFilled =
       kind === 'mcp'  ? mcpDiscoveredTools !== null && mcpEnabled.size > 0
     : kind === 'app'  ? appProvider.length > 0 && appAccountId !== null && appEnabled.size > 0
     : kind === 'code' ? codeBody.trim().length > 0
     : false
  const canSubmit = name.trim().length > 0 && sourceFilled && when.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    if (kind === 'mcp') {
      const newItem: WorkspaceResource = {
        id: `wmcp-${Date.now()}`, kind: 'mcp', name: name.trim(),
        provider: mcpUrl.match(/https?:\/\/([^/]+)/)?.[1] ?? 'Custom MCP',
        toolCount: mcpDiscoveredTools!.length, usedInAgents: 0,
        tools: mcpDiscoveredTools!,
      }
      onSubmit(newItem, when.trim(), Array.from(mcpEnabled))
    } else if (kind === 'app') {
      const newItem: WorkspaceResource = {
        id: `wapp-${Date.now()}`, kind: 'app', name: name.trim(),
        provider: appProvider, toolCount: appEnabled.size, usedInAgents: 0,
      }
      onSubmit(newItem, when.trim(), Array.from(appEnabled), appAccountId ?? undefined, appNewAccount ?? undefined)
    } else {
      const newItem: WorkspaceResource = {
        id: `wcode-${Date.now()}`, kind: 'code', name: name.trim(),
        toolCount: 1, usedInAgents: 0,
      }
      onSubmit(newItem, when.trim())
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input value={name} onChange={e => setName(e.target.value)}
        placeholder={kind === 'mcp' ? 'Nombre del MCP' : kind === 'app' ? 'Nombre de la conexión' : 'Nombre de la función'}
        style={inputBase}
        onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
        onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
      />

      {/* MCP source */}
      {kind === 'mcp' && (
        <>
          <input value={mcpUrl} onChange={e => { setMcpUrl(e.target.value); resetMcp() }}
            placeholder="https://mcp.empresa.com/server"
            style={inputBase}
            onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
            onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {([
              { id: 'none',   label: 'Sin auth' },
              { id: 'apikey', label: 'API Key' },
              { id: 'oauth',  label: 'OAuth' },
            ] as const).map(a => {
              const active = mcpAuth === a.id
              return (
                <button key={a.id} onClick={() => { setMcpAuth(a.id); resetMcp() }}
                  style={{
                    padding: '8px 6px', borderRadius: radius.md,
                    border: `1.5px solid ${active ? color.primary : color.borderDefault}`,
                    background: active ? color.primaryUltraLight : 'white',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    color: active ? color.primary : color.grey700,
                  }}>{a.label}</button>
              )
            })}
          </div>
          {mcpAuth !== 'none' && (
            <input value={mcpKey} onChange={e => { setMcpKey(e.target.value); resetMcp() }}
              placeholder={mcpAuth === 'apikey' ? 'API key' : 'Client ID'}
              type={mcpAuth === 'apikey' ? 'password' : 'text'}
              style={inputBase}
              onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
              onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
            />
          )}
          {!mcpDiscoveredTools && (
            <button onClick={handleDiscover} disabled={!mcpReady || mcpDiscovering}
              style={{
                padding: '10px 16px', borderRadius: 100, border: 'none',
                background: (mcpReady && !mcpDiscovering) ? color.primary : color.grey200,
                color:      (mcpReady && !mcpDiscovering) ? 'white' : color.grey500,
                fontSize: 13, fontWeight: 600,
                cursor:     (mcpReady && !mcpDiscovering) ? 'pointer' : 'default',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              {mcpDiscovering ? (
                <>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${color.grey400}`, borderTopColor: 'white', animation: 'baseDrawerSpin 0.8s linear infinite' }} />
                  Conectando...
                </>
              ) : (
                <><Icon name="cable" size={14} /> Conectar y descubrir herramientas</>
              )}
            </button>
          )}
          {mcpDiscoveredTools && (
            <ToolChecklist label={`Herramientas descubiertas · ${mcpEnabled.size}/${mcpDiscoveredTools.length}`}
              tools={mcpDiscoveredTools}
              enabled={mcpEnabled}
              onToggle={id => setMcpEnabled(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })}
              onSelectAll={() => setMcpEnabled(mcpEnabled.size === mcpDiscoveredTools.length ? new Set() : new Set(mcpDiscoveredTools.map(t => t.id)))}
              onReset={resetMcp}
            />
          )}
        </>
      )}

      {/* App source */}
      {kind === 'app' && (
        <>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, marginBottom: 6, display: 'block' }}>Elegí la app</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {APP_PROVIDERS.map(p => {
                const active = appProvider === p.name
                return (
                  <button key={p.name} onClick={() => {
                    setAppProvider(p.name)
                    setAppAccountId(null); setAppNewAccount(null); setAppEnabled(new Set())
                    const tools = PROVIDER_TOOLS[p.name] ?? []
                    setAppEnabled(new Set(tools.filter(t => !t.risky).map(t => t.id)))
                    const accs = WORKSPACE_ACCOUNTS.filter(a => a.provider === p.name)
                    setAppAccountId(accs[0]?.id ?? null)
                  }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: radius.md, textAlign: 'left',
                      border: `1.5px solid ${active ? color.primary : color.borderDefault}`,
                      background: active ? color.primaryUltraLight : 'white',
                      cursor: 'pointer', transition: 'all 0.12s',
                    }}>
                    <AppProviderIcon provider={p.name} size={22} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? color.primary : color.grey800 }}>{p.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {appProvider && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                ¿Qué cuenta de {appProvider} usar?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 6 }}>
                {appAccounts.map(acc => {
                  const sel = appAccountId === acc.id
                  const isNew = appNewAccount?.id === acc.id
                  return (
                    <label key={acc.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 12px', borderRadius: radius.md, cursor: 'pointer',
                        background: sel ? color.primaryUltraLight : 'white',
                        border: `1.5px solid ${sel ? color.primary : color.borderDefault}`,
                      }}>
                      <input type="radio" name="v2-new-app-acc" checked={sel}
                        onChange={() => setAppAccountId(acc.id)}
                        style={{ accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: color.grey900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.identifier}</span>
                          {isNew && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: color.successDark, background: color.successLight, padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>
                              <Icon name="bolt" size={9} /> Nueva
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
              {!appNewAccount && (
                <button onClick={handleConnectApp} disabled={appConnecting}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 100,
                    border: `1px solid ${appConnecting ? color.borderDefault : color.primary}`,
                    background: 'white',
                    color: appConnecting ? color.grey500 : color.primary,
                    fontSize: 12, fontWeight: 600,
                    cursor: appConnecting ? 'default' : 'pointer',
                    alignSelf: 'flex-start',
                  }}>
                  {appConnecting ? (
                    <>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${color.grey300}`, borderTopColor: color.primary, animation: 'baseDrawerSpin 0.8s linear infinite' }} />
                      Conectando con {appProvider}...
                    </>
                  ) : (
                    <><Icon name="add_link" size={13} /> Conectar nueva cuenta de {appProvider}</>
                  )}
                </button>
              )}
            </div>
          )}

          {appProvider && appTools.length > 0 && (
            <ToolChecklist label={`Herramientas que puede usar · ${appEnabled.size}/${appTools.length}`}
              tools={appTools}
              enabled={appEnabled}
              onToggle={id => setAppEnabled(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })}
              onSelectAll={() => setAppEnabled(appEnabled.size === appTools.length ? new Set() : new Set(appTools.map(t => t.id)))}
            />
          )}
        </>
      )}

      {/* Code source */}
      {kind === 'code' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {([
              { id: 'js',     label: 'JavaScript' },
              { id: 'python', label: 'Python' },
            ] as const).map(l => {
              const active = codeLang === l.id
              return (
                <button key={l.id} onClick={() => setCodeLang(l.id)}
                  style={{
                    padding: '8px 6px', borderRadius: radius.md,
                    border: `1.5px solid ${active ? color.primary : color.borderDefault}`,
                    background: active ? color.primaryUltraLight : 'white',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    color: active ? color.primary : color.grey700,
                  }}>{l.label}</button>
              )
            })}
          </div>
          <textarea value={codeBody} onChange={e => setCodeBody(e.target.value)}
            placeholder={codeLang === 'js'
              ? 'function miFuncion(input) {\n  // ...\n  return result\n}'
              : 'def mi_funcion(input):\n    # ...\n    return result'}
            rows={6}
            spellCheck={false}
            style={{ ...inputBase, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, resize: 'vertical' }}
            onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
            onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
          />
        </>
      )}

      {/* When-it-fires + CTA */}
      {(
        (kind === 'mcp' && mcpDiscoveredTools) ||
        (kind === 'app' && appProvider && appAccountId) ||
        (kind === 'code')
      ) && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
              ¿Cuándo debería usarlo el agente?
            </label>
            <textarea value={when} onChange={e => setWhen(e.target.value)}
              placeholder={kind === 'mcp' ? 'Ej: Cuando el cliente necesita generar un link de pago.'
                        : kind === 'app' ? 'Ej: Cuando hay que mandar un mail de confirmación.'
                        : 'Ej: Cuando hay que aplicar el descuento al total del pedido.'}
              rows={2}
              style={{ ...inputBase, resize: 'vertical' }}
              onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
              onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSubmit} disabled={!canSubmit}
              style={{
                padding: '10px 22px', borderRadius: 100, border: 'none',
                background: canSubmit ? color.primary : color.grey200,
                color:      canSubmit ? 'white' : color.grey500,
                fontSize: 13, fontWeight: 700,
                cursor:     canSubmit ? 'pointer' : 'default',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
              <Icon name="add_circle" size={14} /> Agregar al agente
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Compact tool checklist reusable por MCP discovery y App provider tools.
function ToolChecklist({
  label, tools, enabled, onToggle, onSelectAll, onReset,
}: {
  label:        string
  tools:        { id: string; name: string; description: string; risky?: boolean }[]
  enabled:      Set<string>
  onToggle:     (id: string) => void
  onSelectAll:  () => void
  onReset?:     () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSelectAll}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: color.primary, fontWeight: 600, padding: 0 }}>
            {enabled.size === tools.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
          </button>
          {onReset && (
            <button onClick={onReset}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: color.grey500, fontWeight: 600, padding: 0 }}>
              Reconectar
            </button>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 4, background: color.grey50, border: `1px solid ${color.borderDefault}`, borderRadius: radius.md, padding: 4 }}>
        {tools.map(t => {
          const checked = enabled.has(t.id)
          return (
            <label key={t.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '7px 10px', borderRadius: radius.sm,
                cursor: 'pointer', transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'white')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <input type="checkbox" checked={checked} onChange={() => onToggle(t.id)}
                style={{ marginTop: 2, accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 600, color: color.grey900, background: 'white', padding: '1px 6px', borderRadius: 4, border: `1px solid ${color.borderSubtle}` }}>{t.name}</code>
                  {t.risky && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#9A3412', background: '#FED7AA', padding: '1px 6px', borderRadius: 4 }}>
                      <Icon name="warning" size={9} /> Destructiva
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: color.grey600, marginTop: 2, lineHeight: 1.4 }}>{t.description}</div>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function ResourceListTab({ kind }: { kind: ResourceKind }) {
  const copy = KIND_COPY[kind]
  const [agentItems, setAgentItems] = useState<Resource[]>([])
  const [workspaceItems, setWorkspaceItems] = useState<WorkspaceResource[]>(WORKSPACE_RESOURCES.filter(r => r.kind === kind))
  const [search, setSearch] = useState('')
  // Drawer arranca abierto en V1 — el usuario ya lo ve "adentro" sin tener
  // que apretar nada. Si lo cierra con la X, el header recupera el botón
  // "+ Agregar X" para reabrirlo.
  const [drawerOpen, setDrawerOpen] = useState(true)

  const addExisting = (wr: WorkspaceResource, when: string, enabledTools?: string[], accountId?: string) => {
    if (agentItems.some(r => r.id === wr.id)) return
    const account = accountId ? WORKSPACE_ACCOUNTS.find(a => a.id === accountId) : undefined
    setAgentItems(p => [...p, {
      id: wr.id, kind: wr.kind, name: wr.name, provider: wr.provider,
      description: when, scope: 'global',
      toolCount: enabledTools?.length ?? wr.toolCount,
      status: 'active',
      enabledTools,
      accountId,
      accountLabel: account ? account.identifier : undefined,
    }])
  }
  const removeFromAgent = (id: string) => setAgentItems(p => p.filter(r => r.id !== id))
  const editResource = (
    id: string,
    patch: { description?: string; enabledTools?: string[]; accountId?: string }
  ) => {
    setAgentItems(p => p.map(r => {
      if (r.id !== id) return r
      const next = { ...r }
      if (patch.description !== undefined) next.description = patch.description
      if (patch.enabledTools !== undefined) {
        next.enabledTools = patch.enabledTools
        next.toolCount = patch.enabledTools.length
      }
      if (patch.accountId !== undefined) {
        next.accountId = patch.accountId
        const acc = WORKSPACE_ACCOUNTS.find(a => a.id === patch.accountId)
        next.accountLabel = acc ? acc.identifier : undefined
      }
      return next
    }))
  }
  const uploadAndAdd = (newItem: WorkspaceResource, when: string, enabledTools?: string[], accountId?: string, newAccount?: ConnectedAccount) => {
    if (newAccount && !WORKSPACE_ACCOUNTS.some(a => a.id === newAccount.id)) {
      WORKSPACE_ACCOUNTS.push(newAccount)
    }
    setWorkspaceItems(p => [...p, newItem])
    addExisting(newItem, when, enabledTools, accountId)
  }
  const resetAgent = () => setAgentItems([])

  const filtered = agentItems.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.name.toLowerCase().includes(q)
        || (r.provider?.toLowerCase().includes(q) ?? false)
        || r.description.toLowerCase().includes(q)
        || (r.flowName?.toLowerCase().includes(q) ?? false)
  })

  const isEmpty = agentItems.length === 0
  const ctaLabel = `Agregar ${copy.singular === 'aplicación' ? 'app' : copy.singular === 'código' ? 'código' : 'MCP'}`

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: spacing.sm,
      // Cuando el drawer está abierto reservamos el ancho del drawer así el
      // contenido principal (empty state / lista) no queda tapado. El drawer
      // es position:fixed pero sin backdrop — el padding-right hace de "anchor".
      paddingRight: drawerOpen ? 460 : 0,
      transition: 'padding-right 0.22s ease',
    }}>
      {/* Header del tab — lo ocultamos completo cuando estamos en empty state
          porque el propio empty state ya tiene título + descripción y se
          duplicaba el contenido. Cuando hay items, vuelve el header con
          reset y (si el drawer está cerrado) el botón "Agregar". */}
      {!isEmpty && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: color.grey900, letterSpacing: '-0.01em' }}>{copy.plural}</h2>
            <p style={{ margin: 0, fontSize: 13.5, color: color.grey600, lineHeight: 1.6, maxWidth: 600 }}>
              {copy.description}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 4 }}>
            <button onClick={resetAgent}
              title="Volver al empty state (demo)"
              style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${color.borderDefault}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500, cursor: 'pointer', transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = color.grey50; e.currentTarget.style.color = color.grey800 }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = color.grey500 }}
            ><Icon name="restart_alt" size={16} /></button>
            {!drawerOpen && (
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 100, border: 'none',
                  background: color.primary, color: 'white',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 12px -3px rgba(48,79,254,0.35)',
                  transition: 'transform 0.12s, box-shadow 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(48,79,254,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -3px rgba(48,79,254,0.35)' }}
              ><Icon name="add" size={14} /> {ctaLabel}</button>
            )}
          </div>
        </div>
      )}

      {isEmpty ? (
        <ResourceEmptyState
          kind={kind}
          hideButton={drawerOpen}
          onPopulate={() => setDrawerOpen(true)}
        />
      ) : (
        <>
          <SearchInput value={search} onChange={setSearch} placeholder={`Buscar ${copy.singular}...`} />
          {filtered.length > 0 ? (
            <div style={{
              background: 'white', borderRadius: radius.lg,
              border: `1px solid ${color.borderDefault}`,
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
            }}>
              {filtered.map((r, i) => (
                <ResourceRow key={r.id} r={r} isLast={i === filtered.length - 1}
                  onEdit={editResource} onRemove={removeFromAgent}
                />
              ))}
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, padding: '40px 20px', textAlign: 'center' }}>
              <Icon name="search_off" size={32} color={color.grey400} />
              <p style={{ margin: '10px 0 4px', fontSize: 13, fontWeight: 600, color: color.grey800 }}>Sin resultados</p>
              <p style={{ margin: 0, fontSize: 12, color: color.grey500 }}>Probá con otra palabra.</p>
            </div>
          )}
        </>
      )}

      {drawerOpen && (
        <AddResourceDrawer
          inline
          kind={kind}
          workspaceItems={workspaceItems}
          assignedIds={new Set(agentItems.map(r => r.id))}
          onAddExisting={addExisting}
          onRemoveFromAgent={removeFromAgent}
          onUploadAndAdd={uploadAndAdd}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  )
}

// Empty state per-kind — usa AccionesEmptyState como base pero override el copy.
function ResourceEmptyState({ kind, onPopulate, hideButton = false }: { kind: ResourceKind; onPopulate?: () => void; hideButton?: boolean }) {
  const copy = KIND_COPY[kind]
  return (
    <div style={{ padding: '64px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      {/* Single hero card showing the kind */}
      <div style={{
        width: 88, height: 88, borderRadius: 22,
        background: RESOURCE_VISUAL[kind].bgColor,
        border: `1px solid ${color.borderDefault}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 16px 32px -10px rgba(15,23,42,0.18), 0 3px 8px rgba(15,23,42,0.06)',
      }}>
        {kind === 'mcp'
          ? <img src="/mcp-logo.png" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          : <Icon name={RESOURCE_VISUAL[kind].iconName} size={36} color={RESOURCE_VISUAL[kind].fgColor} />
        }
      </div>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: color.grey900 }}>{copy.emptyTitle}</h2>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: color.grey500, lineHeight: 1.6 }}>{copy.emptyDesc}</p>
      </div>
      {!hideButton && onPopulate && (
        <button onClick={onPopulate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 22px', borderRadius: 100, border: 'none', background: color.primary, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer', boxShadow: '0 8px 24px -6px rgba(48,79,254,0.45)' }}
        ><Icon name="add" size={14} /> {kind === 'mcp' ? 'Agregar MCP' : kind === 'app' ? 'Agregar app' : 'Agregar código'}</button>
      )}
    </div>
  )
}

// ── AddResourceDrawer ─────────────────────────────────────────────────────────
// Generic version of AddBaseDrawer for MCPs / Apps / Códigos. Same shell but
// the upload form changes per kind (server URL / app picker / code editor).

const KIND_DRAWER_COPY: Record<ResourceKind, { title: string; subtitle: string; uploadTitle: string; uploadSubtitle: string; sectionLabel: string; cta: string }> = {
  mcp: {
    title:           'Agregar MCP',
    subtitle:        'Elegí del Proyecto o conectá un nuevo server',
    uploadTitle:     'Conectar nuevo MCP al Proyecto',
    uploadSubtitle:  'Disponible para todos los agentes desde el admin',
    sectionLabel:    'Del Proyecto',
    cta:             'Conectar y agregar al agente',
  },
  app: {
    title:           'Agregar aplicación externa',
    subtitle:        'Elegí del Proyecto o conectá una nueva app',
    uploadTitle:     'Conectar nueva app al Proyecto',
    uploadSubtitle:  'Disponible para todos los agentes desde el admin',
    sectionLabel:    'Del Proyecto',
    cta:             'Conectar y agregar al agente',
  },
  code: {
    title:           'Agregar código',
    subtitle:        'Elegí del Proyecto o creá una nueva función',
    uploadTitle:     'Crear nueva función en el Proyecto',
    uploadSubtitle:  'Disponible para todos los agentes desde el admin',
    sectionLabel:    'Del Proyecto',
    cta:             'Crear y agregar al agente',
  },
}

const APP_PROVIDERS: { name: string }[] = [
  { name: 'Gmail'           },
  { name: 'Google Sheets'   },
  { name: 'Google Calendar' },
  { name: 'Mercado Libre'   },
]

function AddResourceDrawer({
  kind,
  workspaceItems,
  assignedIds,
  onAddExisting,
  onRemoveFromAgent,
  onUploadAndAdd,
  onClose,
  inline = false,
}: {
  kind:              ResourceKind
  workspaceItems:    WorkspaceResource[]
  assignedIds:       Set<string>
  onAddExisting:     (wr: WorkspaceResource, when: string, enabledTools?: string[], accountId?: string) => void
  onRemoveFromAgent: (id: string) => void
  onUploadAndAdd:    (wr: WorkspaceResource, when: string, enabledTools?: string[], accountId?: string, newAccount?: ConnectedAccount) => void
  onClose:           () => void
  // Inline = el drawer vive dentro del flujo de la página (panel lateral fijo
  // en la columna derecha) en vez de ser un overlay con backdrop. Sin animación
  // de entrada, sin portal, sin oscurecer el resto.
  inline?:           boolean
}) {
  const copy = KIND_DRAWER_COPY[kind]
  const [search, setSearch] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadWhen, setUploadWhen] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  // Per-kind upload-form state
  const [mcpUrl, setMcpUrl] = useState('')
  const [mcpAuth, setMcpAuth] = useState<'none' | 'apikey' | 'oauth'>('none')
  const [mcpKey, setMcpKey] = useState('')
  const [appProvider, setAppProvider] = useState<string>('')
  const [codeLang, setCodeLang] = useState<'js' | 'python'>('js')
  const [codeBody, setCodeBody] = useState('')
  // MCP-only: descubrimos las herramientas del server tras la conexión.
  // `mcpDiscovering` corre 1.5s simulando handshake; `mcpDiscoveredTools`
  // queda con el catálogo y `mcpEnabledTools` con las elegidas (default: todas
  // menos las marcadas como `risky`, para que la primera impresión sea segura).
  const [mcpDiscovering, setMcpDiscovering] = useState(false)
  const [mcpDiscoveredTools, setMcpDiscoveredTools] = useState<{ id: string; name: string; description: string; risky?: boolean }[] | null>(null)
  const [mcpEnabledTools, setMcpEnabledTools] = useState<Set<string>>(new Set())

  // App-only upload state. Tras elegir provider mostramos las cuentas conectadas
  // del workspace (ya OAuth'eadas) y la opción de conectar una nueva (1.5s mock).
  // Las tools del provider se hidratan automáticamente desde PROVIDER_TOOLS.
  const [appSelectedAccountId, setAppSelectedAccountId] = useState<string | null>(null)
  const [appConnectingNew, setAppConnectingNew] = useState(false)
  const [appNewAccount, setAppNewAccount] = useState<ConnectedAccount | null>(null)
  const [appEnabledTools, setAppEnabledTools] = useState<Set<string>>(new Set())

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [whenText, setWhenText] = useState('')
  // Recurso existente: tools y cuenta elegidas para esta asignación al agente.
  // Se hidratan cuando se expande la fila — risky vienen destildadas, primera
  // cuenta queda preseleccionada para los apps con varias.
  const [existingEnabledTools, setExistingEnabledTools] = useState<Set<string>>(new Set())
  const [existingSelectedAccountId, setExistingSelectedAccountId] = useState<string | null>(null)

  const filtered = workspaceItems.filter(r =>
       r.name.toLowerCase().includes(search.toLowerCase())
    || (r.provider?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  // MCP upload flow: la conexión simulada "descubre" estas tools genéricas.
  // En real-life vendría del handshake `tools/list` del MCP server.
  const MOCK_NEW_MCP_TOOLS = [
    { id: 'list_items',  name: 'list_items',  description: 'Lista todos los items disponibles.' },
    { id: 'get_item',    name: 'get_item',    description: 'Obtiene los detalles de un item.' },
    { id: 'create_item', name: 'create_item', description: 'Crea un nuevo item.' },
    { id: 'update_item', name: 'update_item', description: 'Actualiza un item existente.' },
    { id: 'delete_item', name: 'delete_item', description: 'Elimina un item permanentemente.', risky: true },
  ]

  const resetMcpDiscovery = () => {
    setMcpDiscoveredTools(null)
    setMcpEnabledTools(new Set())
  }

  const resetAppFlow = () => {
    setAppSelectedAccountId(null)
    setAppNewAccount(null)
    setAppConnectingNew(false)
    setAppEnabledTools(new Set())
  }

  // Cuentas existentes en el workspace para el provider seleccionado del upload.
  const appAccountsForProvider = appProvider
    ? [
        ...WORKSPACE_ACCOUNTS.filter(a => a.provider === appProvider),
        ...(appNewAccount ? [appNewAccount] : []),
      ]
    : []
  const appProviderTools = appProvider ? (PROVIDER_TOOLS[appProvider] ?? []) : []

  // MCP: requiere URL + (key si auth ≠ none) y discovery completo con ≥1 tool activa.
  // App: requiere provider + cuenta seleccionada + ≥1 tool activa.
  const mcpReadyToConnect = mcpUrl.trim().length > 0 && (mcpAuth === 'none' || mcpKey.trim().length > 0)
  const sourceFilled =
       kind === 'mcp'  ? mcpDiscoveredTools !== null && mcpEnabledTools.size > 0
     : kind === 'app'  ? appProvider.length > 0 && appSelectedAccountId !== null && appEnabledTools.size > 0
     : kind === 'code' ? codeBody.trim().length > 0
     : false
  const canSubmit = uploadName.trim().length > 0 && sourceFilled && uploadWhen.trim().length > 0

  const handleDiscoverMcp = () => {
    if (!mcpReadyToConnect || mcpDiscovering) return
    setMcpDiscovering(true)
    setTimeout(() => {
      setMcpDiscoveredTools(MOCK_NEW_MCP_TOOLS)
      setMcpEnabledTools(new Set(MOCK_NEW_MCP_TOOLS.filter(t => !t.risky).map(t => t.id)))
      setMcpDiscovering(false)
    }, 1500)
  }

  const handleConnectNewAppAccount = () => {
    if (!appProvider || appConnectingNew) return
    setAppConnectingNew(true)
    setTimeout(() => {
      const slug = appProvider.toLowerCase().replace(/\s+/g, '-')
      const newAcc: ConnectedAccount = {
        id:         `acc-${slug}-${Date.now()}`,
        provider:   appProvider,
        identifier: `nueva-${slug}@empresa.com`,
      }
      setAppNewAccount(newAcc)
      setAppSelectedAccountId(newAcc.id)
      setAppConnectingNew(false)
      // Si todavía no se eligieron tools, las inicializamos por default.
      if (appEnabledTools.size === 0) {
        const tools = PROVIDER_TOOLS[appProvider] ?? []
        setAppEnabledTools(new Set(tools.filter(t => !t.risky).map(t => t.id)))
      }
    }, 1500)
  }

  const toggleMcpUploadTool = (id: string) => {
    setMcpEnabledTools(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleAppUploadTool = (id: string) => {
    setAppEnabledTools(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleExistingTool = (id: string) => {
    setExistingEnabledTools(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const finishUploadReset = () => {
    setUploadName(''); setMcpUrl(''); setMcpAuth('none'); setMcpKey('')
    setAppProvider(''); setCodeLang('js'); setCodeBody('')
    setUploadWhen(''); setUploadOpen(false); setUploadLoading(false)
    resetMcpDiscovery()
    resetAppFlow()
  }

  const handleUpload = () => {
    if (!canSubmit || uploadLoading) return

    // MCP: no spinner extra, ya conectamos durante el discovery.
    if (kind === 'mcp') {
      const newItem: WorkspaceResource = {
        id: `wmcp-${Date.now()}`,
        kind: 'mcp',
        name: uploadName.trim(),
        provider: mcpUrl.match(/https?:\/\/([^/]+)/)?.[1] ?? 'Custom MCP',
        toolCount: mcpDiscoveredTools!.length,
        usedInAgents: 0,
        tools: mcpDiscoveredTools!,
      }
      onUploadAndAdd(newItem, uploadWhen.trim(), Array.from(mcpEnabledTools))
      finishUploadReset()
      return
    }

    // App: cuenta + tools ya elegidos, no hace falta otro spinner.
    if (kind === 'app') {
      const newItem: WorkspaceResource = {
        id: `wapp-${Date.now()}`,
        kind: 'app',
        name: uploadName.trim(),
        provider: appProvider,
        toolCount: appEnabledTools.size,
        usedInAgents: 0,
      }
      onUploadAndAdd(
        newItem,
        uploadWhen.trim(),
        Array.from(appEnabledTools),
        appSelectedAccountId ?? undefined,
        appNewAccount ?? undefined,
      )
      finishUploadReset()
      return
    }

    // Code: spinner mockeando guardado.
    setUploadLoading(true)
    setTimeout(() => {
      const newItem: WorkspaceResource = {
        id: `w${kind}-${Date.now()}`,
        kind,
        name: uploadName.trim(),
        toolCount: 1,
        usedInAgents: 0,
      }
      onUploadAndAdd(newItem, uploadWhen.trim())
      finishUploadReset()
    }, 1500)
  }

  const handleExpandToggle = (wr: WorkspaceResource) => {
    if (expandedId === wr.id) {
      setExpandedId(null); setWhenText('')
      setExistingEnabledTools(new Set()); setExistingSelectedAccountId(null)
      return
    }
    setExpandedId(wr.id)
    setWhenText('')
    if (wr.kind === 'mcp' && wr.tools) {
      setExistingEnabledTools(new Set(wr.tools.filter(t => !t.risky).map(t => t.id)))
      setExistingSelectedAccountId(null)
    } else if (wr.kind === 'app' && wr.provider) {
      const tools = PROVIDER_TOOLS[wr.provider] ?? []
      setExistingEnabledTools(new Set(tools.filter(t => !t.risky).map(t => t.id)))
      const accounts = WORKSPACE_ACCOUNTS.filter(a => a.provider === wr.provider)
      setExistingSelectedAccountId(accounts[0]?.id ?? null)
    } else {
      setExistingEnabledTools(new Set())
      setExistingSelectedAccountId(null)
    }
  }

  const handleConfirmExisting = (wr: WorkspaceResource) => {
    if (!whenText.trim()) return
    const isMcp = wr.kind === 'mcp' && !!wr.tools
    const isApp = wr.kind === 'app' && !!wr.provider
    if ((isMcp || isApp) && existingEnabledTools.size === 0) return
    if (isApp && !existingSelectedAccountId) return
    const enabled = (isMcp || isApp) ? Array.from(existingEnabledTools) : undefined
    const accountId = isApp ? (existingSelectedAccountId ?? undefined) : undefined
    onAddExisting(wr, whenText.trim(), enabled, accountId)
    setExpandedId(null); setWhenText('')
    setExistingEnabledTools(new Set()); setExistingSelectedAccountId(null)
  }

  const inputBase: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    borderRadius: radius.md, border: `1px solid ${color.borderDefault}`,
    fontSize: 13, color: color.grey900, outline: 'none', fontFamily: font.family,
    background: 'white', transition: 'border-color 0.12s',
  }

  const visual = RESOURCE_VISUAL[kind]

  const asideStyle: React.CSSProperties = inline
    ? {
        // Inline: drawer real anclado al borde derecho del viewport, pero
        // SIN backdrop. Misma silueta que el drawer overlay (full-height,
        // ancho 440, sombra a la izquierda) sólo que no oscurece el resto
        // de la página, así el usuario sigue viendo y operando el empty
        // state / la lista a la izquierda. `top` calculado para arrancar
        // justo debajo del topbar (48) + agent header (~60) + tab nav (44).
        position: 'fixed', top: 153, right: 0, bottom: 0, zIndex: 50,
        width: 440, background: 'white',
        borderTop: `1px solid ${color.borderDefault}`,
        borderLeft: `1px solid ${color.borderDefault}`,
        borderTopLeftRadius: radius.lg,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-16px 0 40px -8px rgba(15,23,42,0.14)',
        animation: 'slideInBaseDrawer 0.22s ease',
        fontFamily: font.family,
      }
    : {
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9001,
        width: 480, background: 'white',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-12px 0 40px rgba(15,23,42,0.16)',
        animation: 'slideInBaseDrawer 0.22s ease',
        fontFamily: font.family,
      }

  const drawerContent = (
    <>
      <aside style={asideStyle}>

        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${color.borderSubtle}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: visual.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {kind === 'mcp'
                  ? <img src="/mcp-logo.png" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                  : <Icon name={visual.iconName} size={18} color={visual.fgColor} />}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: color.grey900, lineHeight: 1.2 }}>{copy.title}</div>
                <div style={{ fontSize: 12, color: color.grey500, marginTop: 2 }}>{copy.subtitle}</div>
              </div>
            </div>
            <button onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500 }}
              onMouseEnter={e => (e.currentTarget.style.background = color.grey100)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            ><Icon name="close" size={18} /></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <SearchInput value={search} onChange={setSearch} placeholder={`Buscar ${kind === 'mcp' ? 'MCP' : kind === 'app' ? 'app' : 'código'}...`} />

          {/* Upload section */}
          <div style={{ background: color.grey50, border: `1px dashed ${color.borderDefault}`, borderRadius: radius.lg }}>
            <button onClick={() => setUploadOpen(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: color.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="add" size={18} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: color.grey900 }}>{copy.uploadTitle}</div>
                <div style={{ fontSize: 11.5, color: color.grey500 }}>{copy.uploadSubtitle}</div>
              </div>
              <Icon name="expand_more" size={18} color={color.grey500} style={{ transform: uploadOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
            </button>

            {uploadOpen && (
              <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Name */}
                <input value={uploadName} onChange={e => setUploadName(e.target.value)}
                  placeholder={kind === 'mcp' ? 'Nombre del MCP' : kind === 'app' ? 'Nombre de la conexión' : 'Nombre de la función'}
                  style={inputBase}
                  onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                  onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
                />

                {/* Per-kind source */}
                {kind === 'mcp' && (
                  <>
                    <input value={mcpUrl} onChange={e => { setMcpUrl(e.target.value); resetMcpDiscovery() }}
                      placeholder="https://mcp.empresa.com/server"
                      style={inputBase}
                      onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                      onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {([
                        { id: 'none',   label: 'Sin auth' },
                        { id: 'apikey', label: 'API Key'  },
                        { id: 'oauth',  label: 'OAuth'    },
                      ] as const).map(a => {
                        const active = mcpAuth === a.id
                        return (
                          <button key={a.id} onClick={() => { setMcpAuth(a.id); resetMcpDiscovery() }}
                            style={{
                              padding: '8px 6px', borderRadius: radius.md,
                              border: `1.5px solid ${active ? color.primary : color.borderDefault}`,
                              background: active ? color.primaryUltraLight : 'white',
                              cursor: 'pointer', fontSize: 12, fontWeight: 600,
                              color: active ? color.primary : color.grey700,
                            }}>{a.label}</button>
                        )
                      })}
                    </div>
                    {mcpAuth !== 'none' && (
                      <input value={mcpKey} onChange={e => { setMcpKey(e.target.value); resetMcpDiscovery() }}
                        placeholder={mcpAuth === 'apikey' ? 'API key' : 'Client ID'}
                        type={mcpAuth === 'apikey' ? 'password' : 'text'}
                        style={inputBase}
                        onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                        onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
                      />
                    )}

                    {/* Discovery — antes de que aparezcan tools, este botón hace el handshake */}
                    {!mcpDiscoveredTools && (
                      <button onClick={handleDiscoverMcp} disabled={!mcpReadyToConnect || mcpDiscovering}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '10px 16px', borderRadius: 100, border: 'none',
                          background: (mcpReadyToConnect && !mcpDiscovering) ? color.primary : color.grey200,
                          color:      (mcpReadyToConnect && !mcpDiscovering) ? 'white' : color.grey500,
                          fontSize: 13, fontWeight: 600,
                          cursor:     (mcpReadyToConnect && !mcpDiscovering) ? 'pointer' : 'default',
                        }}>
                        {mcpDiscovering ? (
                          <>
                            <span style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${color.grey400}`, borderTopColor: 'white', animation: 'baseDrawerSpin 0.8s linear infinite' }} />
                            Conectando y descubriendo herramientas...
                          </>
                        ) : (
                          <><Icon name="cable" size={14} /> Conectar y descubrir herramientas</>
                        )}
                      </button>
                    )}

                    {/* Tools descubiertas — checklist con tools risky deshabilitadas por defecto */}
                    {mcpDiscoveredTools && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="check_circle" size={14} color={color.success} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                              Conectado · {mcpEnabledTools.size}/{mcpDiscoveredTools.length} herramientas activas
                            </span>
                          </div>
                          <button onClick={resetMcpDiscovery}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: color.primary, fontWeight: 600 }}>
                            Reconectar
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'white', border: `1px solid ${color.borderDefault}`, borderRadius: radius.md, padding: 4 }}>
                          {mcpDiscoveredTools.map(t => {
                            const checked = mcpEnabledTools.has(t.id)
                            return (
                              <label key={t.id}
                                style={{
                                  display: 'flex', alignItems: 'flex-start', gap: 10,
                                  padding: '8px 10px', borderRadius: radius.sm,
                                  cursor: 'pointer',
                                  background: 'transparent', transition: 'background 0.12s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = color.grey50)}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              >
                                <input type="checkbox" checked={checked}
                                  onChange={() => toggleMcpUploadTool(t.id)}
                                  style={{ marginTop: 2, accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 600, color: color.grey900, background: color.grey100, padding: '1px 6px', borderRadius: 4 }}>{t.name}</code>
                                    {t.risky && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#9A3412', background: '#FED7AA', padding: '1px 6px', borderRadius: 4 }}>
                                        <Icon name="warning" size={9} /> Destructiva
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 11.5, color: color.grey600, marginTop: 2 }}>{t.description}</div>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {kind === 'app' && (
                  <>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, marginBottom: 6, display: 'block' }}>Elegí la app</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                        {APP_PROVIDERS.map(p => {
                          const active = appProvider === p.name
                          return (
                            <button key={p.name} onClick={() => {
                              setAppProvider(p.name)
                              resetAppFlow()
                              const tools = PROVIDER_TOOLS[p.name] ?? []
                              setAppEnabledTools(new Set(tools.filter(t => !t.risky).map(t => t.id)))
                              const accounts = WORKSPACE_ACCOUNTS.filter(a => a.provider === p.name)
                              setAppSelectedAccountId(accounts[0]?.id ?? null)
                            }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: radius.md,
                                border: `1.5px solid ${active ? color.primary : color.borderDefault}`,
                                background: active ? color.primaryUltraLight : 'white',
                                cursor: 'pointer', transition: 'all 0.12s', textAlign: 'left',
                              }}>
                              <AppProviderIcon provider={p.name} size={22} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: active ? color.primary : color.grey800, lineHeight: 1.2 }}>{p.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Cuentas conectadas para el provider elegido */}
                    {appProvider && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                          ¿Qué cuenta de {appProvider} usar?
                        </label>

                        {appAccountsForProvider.length === 0 && !appConnectingNew && (
                          <div style={{ padding: '10px 12px', background: 'white', border: `1px dashed ${color.borderDefault}`, borderRadius: radius.md, fontSize: 12, color: color.grey600 }}>
                            No hay cuentas conectadas todavía. Conectá una nueva debajo.
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'white', border: `1px solid ${color.borderDefault}`, borderRadius: radius.md, padding: 4 }}>
                          {appAccountsForProvider.map(acc => {
                            const selected = appSelectedAccountId === acc.id
                            const isNew = appNewAccount?.id === acc.id
                            return (
                              <label key={acc.id}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: '8px 10px', borderRadius: radius.sm,
                                  cursor: 'pointer', transition: 'background 0.12s',
                                  background: selected ? color.primaryUltraLight : 'transparent',
                                }}
                                onMouseEnter={e => { if (!selected) e.currentTarget.style.background = color.grey50 }}
                                onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                              >
                                <input type="radio" name="app-account" checked={selected}
                                  onChange={() => setAppSelectedAccountId(acc.id)}
                                  style={{ accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 12.5, fontWeight: 600, color: color.grey900 }}>{acc.identifier}</span>
                                    {isNew && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: color.successDark, background: color.successLight, padding: '1px 6px', borderRadius: 4 }}>
                                        <Icon name="bolt" size={9} /> Recién conectada
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </label>
                            )
                          })}
                        </div>

                        {!appNewAccount && (
                          <button onClick={handleConnectNewAppAccount} disabled={appConnectingNew}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              padding: '8px 14px', borderRadius: 100,
                              border: `1px solid ${appConnectingNew ? color.borderDefault : color.primary}`,
                              background: 'white',
                              color: appConnectingNew ? color.grey500 : color.primary,
                              fontSize: 12, fontWeight: 600,
                              cursor: appConnectingNew ? 'default' : 'pointer',
                              alignSelf: 'flex-start',
                            }}>
                            {appConnectingNew ? (
                              <>
                                <span style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${color.grey300}`, borderTopColor: color.primary, animation: 'baseDrawerSpin 0.8s linear infinite' }} />
                                Conectando con {appProvider}...
                              </>
                            ) : (
                              <><Icon name="add_link" size={13} /> Conectar nueva cuenta de {appProvider}</>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Tool checklist para el provider */}
                    {appProvider && appProviderTools.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                            Herramientas que puede usar · {appEnabledTools.size}/{appProviderTools.length}
                          </label>
                          <button
                            onClick={() => {
                              if (appEnabledTools.size === appProviderTools.length) {
                                setAppEnabledTools(new Set())
                              } else {
                                setAppEnabledTools(new Set(appProviderTools.map(t => t.id)))
                              }
                            }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: color.primary, fontWeight: 600, padding: 0 }}
                          >
                            {appEnabledTools.size === appProviderTools.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'white', border: `1px solid ${color.borderDefault}`, borderRadius: radius.md, padding: 4 }}>
                          {appProviderTools.map(t => {
                            const checked = appEnabledTools.has(t.id)
                            return (
                              <label key={t.id}
                                style={{
                                  display: 'flex', alignItems: 'flex-start', gap: 10,
                                  padding: '7px 10px', borderRadius: radius.sm,
                                  cursor: 'pointer', transition: 'background 0.12s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = color.grey50)}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              >
                                <input type="checkbox" checked={checked}
                                  onChange={() => toggleAppUploadTool(t.id)}
                                  style={{ marginTop: 2, accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 600, color: color.grey900, background: color.grey100, padding: '1px 6px', borderRadius: 4 }}>{t.name}</code>
                                    {t.risky && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#9A3412', background: '#FED7AA', padding: '1px 6px', borderRadius: 4 }}>
                                        <Icon name="warning" size={9} /> Destructiva
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 11.5, color: color.grey600, marginTop: 2 }}>{t.description}</div>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {kind === 'code' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                      {([
                        { id: 'js',     label: 'JavaScript' },
                        { id: 'python', label: 'Python'     },
                      ] as const).map(l => {
                        const active = codeLang === l.id
                        return (
                          <button key={l.id} onClick={() => setCodeLang(l.id)}
                            style={{
                              padding: '8px 6px', borderRadius: radius.md,
                              border: `1.5px solid ${active ? color.primary : color.borderDefault}`,
                              background: active ? color.primaryUltraLight : 'white',
                              cursor: 'pointer', fontSize: 12, fontWeight: 600,
                              color: active ? color.primary : color.grey700,
                            }}>{l.label}</button>
                        )
                      })}
                    </div>
                    <textarea value={codeBody} onChange={e => setCodeBody(e.target.value)}
                      placeholder={codeLang === 'js'
                        ? 'function miFuncion(input) {\n  // ...\n  return result\n}'
                        : 'def mi_funcion(input):\n    # ...\n    return result'}
                      rows={5}
                      spellCheck={false}
                      style={{ ...inputBase, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, resize: 'vertical' }}
                      onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                      onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
                    />
                  </>
                )}

                {/* When-it-fires + CTA. MCP: post-discovery. App: cuando hay
                    provider + cuenta. Code: siempre. */}
                {(
                  (kind === 'mcp'  && mcpDiscoveredTools) ||
                  (kind === 'app'  && appProvider && appSelectedAccountId) ||
                  (kind === 'code')
                ) && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                        ¿Cuándo debería usarlo el agente?
                      </label>
                      <textarea value={uploadWhen} onChange={e => setUploadWhen(e.target.value)}
                        placeholder={kind === 'mcp' ? 'Ej: Cuando el cliente necesita generar un link de pago.'
                                  : kind === 'app' ? 'Ej: Cuando hay que mandar un mail de confirmación.'
                                  : 'Ej: Cuando hay que aplicar el descuento al total del pedido.'}
                        rows={2}
                        style={{ ...inputBase, resize: 'vertical', fontFamily: font.family }}
                        onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                        onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
                      />
                    </div>

                    <button onClick={handleUpload} disabled={!canSubmit || uploadLoading}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 16px', borderRadius: 100, border: 'none',
                        background: (canSubmit && !uploadLoading) ? color.primary : color.grey200,
                        color:      (canSubmit && !uploadLoading) ? 'white' : color.grey500,
                        fontSize: 13, fontWeight: 600,
                        cursor:     (canSubmit && !uploadLoading) ? 'pointer' : 'default',
                      }}
                    >
                      {uploadLoading ? (
                        <>
                          <span style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${color.grey400}`, borderTopColor: 'white', animation: 'baseDrawerSpin 0.8s linear infinite' }} />
                          {kind === 'app' ? 'Autenticando...' : 'Guardando...'}
                        </>
                      ) : (
                        <><Icon name={kind === 'code' ? 'save' : kind === 'mcp' ? 'add_circle' : 'cloud_upload'} size={14} />
                          {kind === 'mcp' ? 'Agregar al agente' : copy.cta}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Workspace catalog list */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color.grey500 }}>
                {copy.sectionLabel}
              </span>
              <span style={{ fontSize: 11, color: color.grey500 }}>{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: color.grey50, borderRadius: radius.md }}>
                <Icon name="search_off" size={28} color={color.grey400} />
                <p style={{ margin: '8px 0 0', fontSize: 12.5, color: color.grey600 }}>Sin resultados en el catálogo.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filtered.map(wr => {
                  const assigned = assignedIds.has(wr.id)
                  const expanded = expandedId === wr.id
                  return (
                    <div key={wr.id}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        borderRadius: radius.md,
                        border: `1px solid ${expanded ? color.primary : color.borderDefault}`,
                        background: 'white',
                        transition: 'border-color 0.12s',
                        overflow: 'hidden',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: kind === 'app' ? 'white' : visual.bgColor,
                          border: kind === 'app' ? `1px solid ${color.borderSubtle}` : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {kind === 'mcp'
                            ? <img src="/mcp-logo.png" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                            : kind === 'app'
                              ? <AppProviderIcon provider={wr.provider} size={22} />
                              : <Icon name={visual.iconName} size={16} color={visual.fgColor} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: color.grey900 }}>{wr.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1, fontSize: 11.5, color: color.grey500 }}>
                            {wr.provider && <span>{wr.provider}</span>}
                            {wr.provider && wr.usedInAgents > 0 && <span style={{ color: color.grey300 }}>·</span>}
                            {wr.usedInAgents > 0 && <span>Usado en {wr.usedInAgents} {wr.usedInAgents === 1 ? 'agente' : 'agentes'}</span>}
                            {!wr.provider && wr.usedInAgents === 0 && <span>Nuevo en el Proyecto</span>}
                          </div>
                        </div>
                        {assigned ? (
                          <span
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 100, border: `1px solid ${color.success}40`, background: color.successLight, color: color.successDark, fontSize: 11, fontWeight: 700, cursor: 'default' }}
                            onClick={() => onRemoveFromAgent(wr.id)}
                            title="Click para quitar"
                          >
                            <Icon name="check" size={11} /> Agregada
                          </span>
                        ) : (
                          <button
                            onClick={() => handleExpandToggle(wr)}
                            style={{
                              padding: '6px 14px', borderRadius: 100,
                              border: `1px solid ${color.primary}`,
                              background: expanded ? color.primary : 'white',
                              color: expanded ? 'white' : color.primary,
                              fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.12s',
                            }}
                            onMouseEnter={e => { if (!expanded) { e.currentTarget.style.background = color.primary; e.currentTarget.style.color = 'white' } }}
                            onMouseLeave={e => { if (!expanded) { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = color.primary } }}
                          >
                            {expanded ? 'Cancelar' : 'Agregar'}
                          </button>
                        )}
                      </div>

                      {expanded && (() => {
                        const hasMcpTools = wr.kind === 'mcp' && !!wr.tools && wr.tools.length > 0
                        const isApp = wr.kind === 'app' && !!wr.provider
                        const appTools = isApp ? (PROVIDER_TOOLS[wr.provider!] ?? []) : []
                        const appAccounts = isApp ? WORKSPACE_ACCOUNTS.filter(a => a.provider === wr.provider) : []
                        const toolList = hasMcpTools ? wr.tools! : (isApp ? appTools : [])
                        const showTools = hasMcpTools || (isApp && appTools.length > 0)
                        const canConfirm =
                          whenText.trim().length > 0
                          && (!showTools || existingEnabledTools.size > 0)
                          && (!isApp || !!existingSelectedAccountId)
                        return (
                          <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: `1px solid ${color.borderSubtle}`, paddingTop: 10 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                                ¿Cuándo debería usarlo el agente?
                              </label>
                              <textarea value={whenText} onChange={e => setWhenText(e.target.value)}
                                placeholder={`Ej: Cuando el agente necesita ${wr.name.toLowerCase()}.`}
                                rows={2}
                                style={{ ...inputBase, resize: 'vertical' }}
                                autoFocus
                                onFocus={e => (e.currentTarget.style.borderColor = color.primary)}
                                onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
                              />
                            </div>

                            {/* App: selector de cuenta conectada del workspace */}
                            {isApp && appAccounts.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                                  ¿Qué cuenta de {wr.provider} usar?
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: color.grey50, border: `1px solid ${color.borderDefault}`, borderRadius: radius.md, padding: 4 }}>
                                  {appAccounts.map(acc => {
                                    const selected = existingSelectedAccountId === acc.id
                                    return (
                                      <label key={acc.id}
                                        style={{
                                          display: 'flex', alignItems: 'center', gap: 10,
                                          padding: '7px 10px', borderRadius: radius.sm,
                                          cursor: 'pointer', transition: 'background 0.12s',
                                          background: selected ? color.primaryUltraLight : 'transparent',
                                        }}
                                        onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'white' }}
                                        onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                                      >
                                        <input type="radio" name={`existing-app-acc-${wr.id}`} checked={selected}
                                          onChange={() => setExistingSelectedAccountId(acc.id)}
                                          style={{ accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ fontSize: 12.5, fontWeight: 600, color: color.grey900 }}>{acc.identifier}</div>
                                        </div>
                                      </label>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                            {isApp && appAccounts.length === 0 && (
                              <div style={{ padding: '8px 10px', background: '#FEF3C7', border: `1px solid #FCD34D`, borderRadius: radius.sm, fontSize: 11.5, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="warning" size={12} />
                                No hay cuentas de {wr.provider} conectadas. Conectá una desde Administrar apps del Proyecto.
                              </div>
                            )}

                            {showTools && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <label style={{ fontSize: 11, fontWeight: 700, color: color.grey700, letterSpacing: '0.02em' }}>
                                    Herramientas que puede usar · {existingEnabledTools.size}/{toolList.length}
                                  </label>
                                  <button
                                    onClick={() => {
                                      if (existingEnabledTools.size === toolList.length) {
                                        setExistingEnabledTools(new Set())
                                      } else {
                                        setExistingEnabledTools(new Set(toolList.map(t => t.id)))
                                      }
                                    }}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: color.primary, fontWeight: 600, padding: 0 }}
                                  >
                                    {existingEnabledTools.size === toolList.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                                  </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: color.grey50, border: `1px solid ${color.borderDefault}`, borderRadius: radius.md, padding: 4 }}>
                                  {toolList.map(t => {
                                    const checked = existingEnabledTools.has(t.id)
                                    return (
                                      <label key={t.id}
                                        style={{
                                          display: 'flex', alignItems: 'flex-start', gap: 10,
                                          padding: '7px 10px', borderRadius: radius.sm,
                                          cursor: 'pointer',
                                          background: 'transparent', transition: 'background 0.12s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'white')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                      >
                                        <input type="checkbox" checked={checked}
                                          onChange={() => toggleExistingTool(t.id)}
                                          style={{ marginTop: 2, accentColor: color.primary, cursor: 'pointer', width: 14, height: 14 }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 600, color: color.grey900, background: 'white', padding: '1px 6px', borderRadius: 4, border: `1px solid ${color.borderSubtle}` }}>{t.name}</code>
                                            {t.risky && (
                                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#9A3412', background: '#FED7AA', padding: '1px 6px', borderRadius: 4 }}>
                                                <Icon name="warning" size={9} /> Destructiva
                                              </span>
                                            )}
                                          </div>
                                          <div style={{ fontSize: 11.5, color: color.grey600, marginTop: 2 }}>{t.description}</div>
                                        </div>
                                      </label>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                              <button onClick={() => handleExpandToggle(wr)}
                                style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', color: color.grey700, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                              >Cancelar</button>
                              <button onClick={() => handleConfirmExisting(wr)} disabled={!canConfirm}
                                style={{
                                  padding: '6px 14px', borderRadius: 100, border: 'none',
                                  background: canConfirm ? color.primary : color.grey200,
                                  color:      canConfirm ? 'white' : color.grey500,
                                  fontSize: 12, fontWeight: 700,
                                  cursor:     canConfirm ? 'pointer' : 'default',
                                }}
                              >Agregar al agente</button>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${color.borderSubtle}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0, background: color.grey50 }}>
          <button
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: color.primary, padding: '6px 8px', borderRadius: radius.sm }}
            onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Administrar {kind === 'mcp' ? 'MCPs' : kind === 'app' ? 'apps' : 'códigos'} del Proyecto <Icon name="open_in_new" size={12} />
          </button>
          <button onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', color: color.grey800, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >Listo</button>
        </div>
      </aside>

      <style>{`
        @keyframes slideInBaseDrawer { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn             { from { opacity: 0; } to { opacity: 1; } }
        @keyframes baseDrawerSpin     { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )

  // Inline: el panel vive dentro de la página (sin portal, sin backdrop).
  if (inline) return drawerContent

  // Overlay: portal + backdrop click-to-close.
  return createPortal(
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(15,23,42,0.18)',
        animation: 'fadeIn 0.18s ease',
      }} />
      {drawerContent}
    </>,
    document.body
  )
}

// ── MCPsTab (legacy, queda para retrocompatibilidad) ──────────────────────────

interface MCPItem {
  id: string; name: string; provider: string; email: string
  availableTools: string[]; disabledTools: string[]; when: string
  status: 'active' | 'configuring'; source: 'global' | 'process'
  flowName?: string
}

const INITIAL_MCPS: MCPItem[] = [
  { id: 'm1', name: 'Pagos', provider: 'MercadoPago', email: 'pagos@empresa.com', availableTools: ['createPayment', 'getPaymentStatus'], disabledTools: ['refundPayment'], when: 'Cuando el cliente necesita generar un link de pago, verificar el estado de una transacción pendiente, consultar si un pago fue acreditado o solicitar un comprobante de la operación realizada', status: 'active', source: 'global' },
  { id: 'm3', name: 'Notificaciones', provider: 'WhatsApp Business', email: 'wa@empresa.com', availableTools: ['sendMessage', 'sendTemplate'], disabledTools: ['sendMedia'], when: 'Cuando necesita enviar una confirmación de pedido, comprobante de pago, notificación de cambio de estado, recordatorio de entrega o cualquier mensaje proactivo al cliente por WhatsApp', status: 'active', source: 'global' },
  { id: 'f1', name: 'Catálogo', provider: 'Google Sheets', email: '', availableTools: ['searchProduct', 'getProductDetails'], disabledTools: [], when: '', status: 'active', source: 'process', flowName: 'Tomar pedido' },
  { id: 'f2', name: 'Catálogo', provider: 'Google Sheets', email: '', availableTools: ['getProductDetails'], disabledTools: [], when: '', status: 'active', source: 'process', flowName: 'Consultar estado' },
  { id: 'f3', name: 'Tracking', provider: 'Correo Argentino', email: '', availableTools: ['getTrackingStatus'], disabledTools: [], when: '', status: 'active', source: 'process', flowName: 'Consultar estado' },
]

function MCPEditModal({ mcp, onSave, onClose }: { mcp: MCPItem; onSave: (patch: Partial<Pick<MCPItem, 'when' | 'availableTools' | 'disabledTools'>>) => void; onClose: () => void }) {
  const [whenValue, setWhenValue] = useState(mcp.when)
  const allTools = [...mcp.availableTools, ...mcp.disabledTools]
  const [enabled, setEnabled] = useState<Set<string>>(new Set(mcp.availableTools))
  const toggle = (t: string) => setEnabled(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n })

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 9001, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ background: 'white', borderRadius: radius.lg, padding: spacing.xBig, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', pointerEvents: 'all', display: 'flex', flexDirection: 'column', gap: spacing.sm, animation: 'scaleIn 0.15s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xSm }}>
            <div style={{ width: 36, height: 36, borderRadius: radius.md, background: color.grey100, border: `1px solid ${color.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/mcp-logo.png" style={{ width: 18, height: 18, objectFit: 'contain', opacity: 0.5 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: color.grey900 }}>{mcp.name}</div>
              <div style={{ fontSize: 12, color: color.grey500 }}>{mcp.provider}</div>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 100, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey400 }}
              onMouseEnter={e => { e.currentTarget.style.background = color.grey100; e.currentTarget.style.color = color.grey800 }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = color.grey400 }}
            ><Icon name="close" size={16} /></button>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color.grey500, display: 'block', marginBottom: 4 }}>Instrucción al agente</label>
            <textarea value={whenValue} onChange={e => setWhenValue(e.target.value)} rows={3} placeholder="¿Cuándo debe usar este MCP?"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: `1px solid ${color.borderDefault}`, borderRadius: radius.md, outline: 'none', fontSize: 13, color: color.grey800, lineHeight: 1.5, resize: 'none', fontFamily: font.family }}
              onFocus={e => (e.currentTarget.style.borderColor = color.primary)} onBlur={e => (e.currentTarget.style.borderColor = color.borderDefault)}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color.grey500, display: 'block', marginBottom: 6 }}>Herramientas</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {allTools.map(tool => {
                const checked = enabled.has(tool)
                return (
                  <label key={tool} onClick={() => toggle(tool)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', cursor: 'pointer', borderRadius: radius.sm }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, background: checked ? color.primary : 'white', border: `2px solid ${checked ? color.primary : color.grey400}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}>
                      {checked && <Icon name="check" size={10} color="white" />}
                    </div>
                    <span style={{ fontSize: 13, color: checked ? color.grey900 : color.grey500 }}>{tool}</span>
                  </label>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', fontSize: 13, fontWeight: 600, color: color.grey700, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={() => { onSave({ when: whenValue.trim(), availableTools: allTools.filter(t => enabled.has(t)), disabledTools: allTools.filter(t => !enabled.has(t)) }); onClose() }}
              style={{ padding: '8px 20px', borderRadius: 100, border: 'none', background: color.primary, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}
            >Guardar</button>
          </div>
        </div>
      </div>
    </>, document.body
  )
}

function MCPRow({ mcp, onRemove, onUpdate }: { mcp: MCPItem; onRemove?: (id: string) => void; onUpdate?: (id: string, patch: Partial<Pick<MCPItem, 'when' | 'availableTools' | 'disabledTools'>>) => void }) {
  const [hovered, setHovered] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const isGlobal = mcp.source === 'global'
  const hasWhen = isGlobal && mcp.when

  return (
    <>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ display: 'flex', alignItems: expanded ? 'flex-start' : 'center', gap: spacing.sm, padding: `${spacing.sm}px ${spacing.sm}px`, background: hovered ? color.grey50 : 'white', borderBottom: `1px solid ${color.borderSubtle}`, transition: 'background 0.1s' }}
      >
        {/* Icon */}
        <div style={{ width: 32, height: 32, borderRadius: radius.md, flexShrink: 0, background: color.grey100, border: `1px solid ${color.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: expanded ? 2 : 0 }}>
          <img src="/mcp-logo.png" style={{ width: 16, height: 16, objectFit: 'contain', opacity: 0.5 }} />
        </div>
        {/* Name + description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: color.grey900 }}>{mcp.name}</span>
            <span style={{ fontSize: 11, color: color.grey500 }}>{mcp.provider}</span>
          </div>
          {hasWhen && (
            <div style={{ fontSize: 11.5, color: color.grey500, marginTop: 1, lineHeight: 1.5, overflow: 'hidden', textOverflow: expanded ? undefined : 'ellipsis', whiteSpace: expanded ? 'normal' : 'nowrap', transition: 'all 0.2s ease' }}>{mcp.when}</div>
          )}
          {mcp.availableTools.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {mcp.availableTools.slice(0, 3).map(t => (
                <span key={t} style={{ fontSize: 10, fontWeight: 500, color: color.grey600, background: color.grey100, borderRadius: radius.sm, padding: '1px 6px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Icon name="build" size={9} color={color.grey400} />{t}
                </span>
              ))}
              {mcp.availableTools.length > 3 && <span style={{ fontSize: 10, color: color.grey400 }}>+{mcp.availableTools.length - 3}</span>}
            </div>
          )}
        </div>
        {/* Origin chip */}
        {isGlobal ? (
          <Tooltip text="Disponible cuando se active la instrucción de uso del agente." width={240}>
            <span style={{ fontSize: 11, fontWeight: 600, color: color.successDark, background: color.successLight, border: `1px solid ${color.success}`, borderRadius: 100, padding: '3px 10px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'default' }}>
              <Icon name="language" size={12} /> Global
            </span>
          </Tooltip>
        ) : (
          <Tooltip text={`Configurado en el flujo "${mcp.flowName}". Para editarlo andá al flujo.`} width={230}>
            <span style={{ fontSize: 11, fontWeight: 500, color: color.primary, background: color.primaryUltraLight, border: `1px solid ${color.primaryLight}`, borderRadius: 100, padding: '3px 10px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'default' }}>
              <Icon name="route" size={12} /> {mcp.flowName}
            </span>
          </Tooltip>
        )}
        {/* Tools count */}
        <span style={{ fontSize: 11, color: color.grey400, flexShrink: 0, width: 55, textAlign: 'center' }}>{mcp.availableTools.length} tools</span>
        {/* Actions: only for global */}
        <div style={{ width: 68, flexShrink: 0, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          {isGlobal ? (
            <>
              <button onClick={() => setShowEdit(true)}
                style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
              ><Icon name="edit" size={16} /></button>
              <button onClick={() => setConfirmDelete(true)}
                style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.color = color.error; e.currentTarget.style.background = color.errorLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
              ><Icon name="delete" size={16} /></button>
            </>
          ) : (
            <Tooltip text="Ir al flujo" width={80}>
              <button style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
              ><Icon name="open_in_new" size={16} /></button>
            </Tooltip>
          )}
        </div>
        {hasWhen && (
          <button onClick={() => setExpanded(e => !e)} style={{ width: 28, height: 28, borderRadius: radius.sm, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey400, flexShrink: 0, transition: 'all 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = color.grey100)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          ><Icon name="expand_more" size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} /></button>
        )}
      </div>
      {showEdit && onUpdate && <MCPEditModal mcp={mcp} onSave={patch => onUpdate(mcp.id, patch)} onClose={() => setShowEdit(false)} />}
      {confirmDelete && createPortal(
        <>
          <div onClick={() => setConfirmDelete(false)} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 9001, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '28px 28px 24px', width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', pointerEvents: 'all', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xSm, animation: 'scaleIn 0.15s ease' }}>
              <div style={{ width: 52, height: 52, borderRadius: 100, background: color.errorLight, border: `1px solid ${color.errorDark}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="warning" size={24} color={color.error} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: color.grey900 }}>¿Quitar "{mcp.name}"?</p>
                <p style={{ margin: 0, fontSize: 13, color: color.grey600, lineHeight: 1.5 }}>Se va a quitar este MCP del agente.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, width: '100%' }}>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', fontSize: 13, fontWeight: 600, color: color.grey800, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={() => { setConfirmDelete(false); onRemove?.(mcp.id) }} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: 'none', background: color.error, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Quitar</button>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </>
  )
}

// ── MCP Catalog + Drawer ──────────────────────────────────────────────────────

interface CatalogMCP { id: string; name: string; provider: string; tools: { name: string; description: string }[] }
const MCP_CATALOG: CatalogMCP[] = [
  { id: 'c1', name: 'deepwiki', provider: 'DeepWiki', tools: [{ name: 'readWikiContents', description: 'Lee contenido de la wiki' }, { name: 'askQuestion', description: 'Hace una pregunta' }, { name: 'readWikiStructure', description: 'Obtiene estructura' }] },
  { id: 'c2', name: 'Slack', provider: 'Slack', tools: [{ name: 'sendMessage', description: 'Envía mensaje a canal' }, { name: 'createChannel', description: 'Crea canal' }] },
  { id: 'c3', name: 'GitHub', provider: 'GitHub', tools: [{ name: 'createIssue', description: 'Crea issue' }, { name: 'searchRepos', description: 'Busca repos' }] },
  { id: 'c4', name: 'Notion', provider: 'Notion', tools: [{ name: 'createPage', description: 'Crea página' }, { name: 'searchPages', description: 'Busca páginas' }] },
]

function AddMCPDrawer({ addedIds, onAdd, onClose }: { addedIds: string[]; onAdd: (mcp: CatalogMCP) => void; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>('c1')
  const filtered = MCP_CATALOG.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.provider.toLowerCase().includes(query.toLowerCase()))

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(0,0,0,0.18)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 8001, width: 380, background: 'white', boxShadow: '-4px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.22s ease' }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${color.grey100}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: color.grey900 }}>Agregar MCP Global</span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 100, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500 }}
            onMouseEnter={e => { e.currentTarget.style.background = color.grey100; e.currentTarget.style.color = color.grey800 }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = color.grey500 }}
          ><Icon name="close" size={16} /></button>
        </div>
        <div style={{ padding: '12px 20px 8px', flexShrink: 0 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px 8px 36px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, fontSize: 13, color: color.grey800, outline: 'none', background: color.grey50, fontFamily: font.family }}
            onFocus={e => { e.currentTarget.style.borderColor = color.primary; e.currentTarget.style.background = 'white' }} onBlur={e => { e.currentTarget.style.borderColor = color.borderDefault; e.currentTarget.style.background = color.grey50 }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 16px' }}>
          {filtered.map(mcp => {
            const isOpen = expanded === mcp.id
            const isAdded = addedIds.includes(mcp.id)
            return (
              <div key={mcp.id} style={{ borderBottom: `1px solid ${color.grey100}`, paddingBottom: 4 }}>
                <button onClick={() => setExpanded(isOpen ? null : mcp.id)}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 4px', borderRadius: 100, textAlign: 'left', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = color.grey50)} onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: color.grey100, border: `1px solid ${color.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/mcp-logo.png" style={{ width: 18, height: 18, objectFit: 'contain', opacity: 0.45 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: color.grey900 }}>{mcp.name}</div>
                    <div style={{ fontSize: 11.5, color: color.grey500 }}>{mcp.provider}</div>
                  </div>
                  {isAdded && <span style={{ fontSize: 10.5, fontWeight: 600, color: color.success, background: color.successLight, padding: '2px 8px', borderRadius: 100 }}>Agregado</span>}
                  <Icon name="expand_more" size={15} color={color.grey500} style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
                </button>
                {isOpen && (
                  <div style={{ margin: '0 0 10px 46px', background: color.grey50, borderRadius: spacing.xSm, border: `1px solid ${color.grey100}`, padding: '10px 12px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: color.grey500, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: spacing.xxSm }}>Herramientas disponibles</div>
                    {mcp.tools.map(t => (
                      <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm, padding: '5px 0' }}>
                        <Icon name="build" size={13} color={color.primary} />
                        <span style={{ flex: 1, fontSize: 12.5, color: color.grey800 }}>{t.name}</span>
                        <Tooltip text={t.description} width={170}><Icon name="help" size={12} color={color.grey400} /></Tooltip>
                      </div>
                    ))}
                    {!isAdded && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                        <button onClick={() => onAdd(mcp)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 100, border: 'none', background: color.primary, fontSize: 12, fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'opacity 0.12s' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        ><Icon name="add" size={13} /> Agregar</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ margin: '0 16px 16px', padding: '12px 14px', background: color.primaryUltraLight, borderRadius: 14, display: 'flex', gap: 10, flexShrink: 0 }}>
          <Icon name="info" size={15} color={color.primary} style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 11.5, color: color.primaryDark, lineHeight: 1.55 }}>
            Los MCPs globales quedan disponibles para todo el agente. Configurá la instrucción de activación para que el agente sepa cuándo invocarlo.
          </p>
        </div>
      </div>
    </>, document.body
  )
}

function MCPsTab() {
  const [mcps, setMcps] = useState(INITIAL_MCPS)
  const [showDrawer, setShowDrawer] = useState(false)
  const [search, setSearch] = useState('')
  const addedCatalogIds = mcps.filter(m => m.id.startsWith('cat-')).map(m => m.id.replace('cat-', ''))
  const update = (id: string, patch: Partial<Pick<MCPItem, 'when' | 'availableTools' | 'disabledTools'>>) => setMcps(p => p.map(m => m.id === id ? { ...m, ...patch } : m))
  const handleAddFromCatalog = (cat: CatalogMCP) => {
    if (mcps.some(m => m.id === `cat-${cat.id}`)) return
    setMcps(p => [...p, { id: `cat-${cat.id}`, name: cat.name, provider: cat.provider, email: '', availableTools: cat.tools.map(t => t.name), disabledTools: [], when: '', status: 'active' as const, source: 'global' as const }])
    setShowDrawer(false)
  }
  const filtered = mcps.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm, marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: color.grey900 }}>MCPs</h2>
          <p style={{ margin: 0, fontSize: 13, color: color.grey600, lineHeight: 1.6, maxWidth: 600 }}>
            Conecta herramientas y servicios externos para ampliar las capacidades de tu agente.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm, flexShrink: 0, marginTop: 4 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar MCP..." />
          <button onClick={() => setShowDrawer(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 15px', borderRadius: 100, border: 'none', background: color.primary, fontSize: 12.5, fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          ><Icon name="add" size={13} /> Agregar MCP Global</button>
        </div>
      </div>
      {/* Globales */}
      <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm, padding: `${spacing.xxSm}px ${spacing.sm}px`, background: color.grey100, borderBottom: `1px solid ${color.borderDefault}` }}>
          <Icon name="language" size={14} color={color.grey700} />
          <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: color.grey900 }}>Globales</span>
          <span style={{ fontSize: 10, color: color.grey600 }}>{filtered.filter(m => m.source === 'global').length}</span>
        </div>
        {filtered.filter(m => m.source === 'global').map(m => (
          <MCPRow key={m.id} mcp={m} onRemove={id => setMcps(p => p.filter(x => x.id !== id))} onUpdate={update} />
        ))}
        {filtered.filter(m => m.source === 'global').length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 12.5, color: color.grey500 }}>Sin MCPs globales. Agregá uno para empezar.</p>
          </div>
        )}
      </div>
      {/* En flujos */}
      {filtered.filter(m => m.source === 'process').length > 0 && (
        <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, overflow: 'hidden', marginTop: spacing.sm }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm, padding: `${spacing.xxSm}px ${spacing.sm}px`, background: color.grey100, borderBottom: `1px solid ${color.borderDefault}` }}>
            <Icon name="route" size={14} color={color.grey700} />
            <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: color.grey900 }}>En flujos</span>
            <span style={{ fontSize: 10, color: color.grey600 }}>{filtered.filter(m => m.source === 'process').length}</span>
          </div>
          {filtered.filter(m => m.source === 'process').map(m => (
            <MCPRow key={m.id} mcp={m} />
          ))}
        </div>
      )}
      {showDrawer && <AddMCPDrawer addedIds={addedCatalogIds} onAdd={handleAddFromCatalog} onClose={() => setShowDrawer(false)} />}
    </div>
  )
}

// ── DisparadoresTab ───────────────────────────────────────────────────────────

interface Disparador { id: string; name: string; type: 'CRON' | 'Workflow'; config: string; description: string }

const INITIAL_DISPARADORES: Disparador[] = [
  { id: 'd1', name: 'Automation process', type: 'CRON', config: 'Cada 5 minutos', description: '' },
]

const CRON_CATALOG = ['Cada 5 minutos', 'A cada hora', 'Todos los días', 'Todos los días de semana', 'Todos los Lunes', 'Todos los Martes', 'Todos los Miércoles', 'Todos los Jueves', 'Todos los Viernes', 'Todos los Sábados', 'Todos los Domingos', 'Cada 30 minutos']

const WORKFLOW_CATALOG = [
  { name: 'Nuevo', from: 'Inicio', to: 'Nuevo' },
  { name: 'Consultando', from: 'Nuevo', to: 'Consultando' },
  { name: 'Pedido tomado', from: 'Consultando', to: 'Pedido tomado' },
  { name: 'Confirmado', from: 'Pedido tomado', to: 'Confirmado' },
]

function DisparadorRow({ d, onRemove, onSelect }: { d: Disparador; onRemove: (id: string) => void; onSelect: (d: Disparador) => void }) {
  const [hovered, setHovered] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isCron = d.type === 'CRON'
  const tc = isCron ? { bg: color.warningLight, border: color.warning, fg: color.warningDark, icon: 'schedule' } : { bg: color.primaryUltraLight, border: color.primaryLight, fg: color.primary, icon: 'route' }

  return (
    <>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onSelect(d)}
        style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, padding: `${spacing.sm}px ${spacing.sm}px`, background: hovered ? color.grey50 : 'white', borderBottom: `1px solid ${color.borderSubtle}`, cursor: 'pointer', transition: 'background 0.1s' }}
      >
        <div style={{ width: 32, height: 32, borderRadius: radius.md, flexShrink: 0, background: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={tc.icon} size={16} color={tc.fg} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: color.grey900 }}>{d.name}</div>
          <div style={{ fontSize: 11.5, color: color.grey500, marginTop: 1 }}>{d.config}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: tc.fg, background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: 100, padding: '3px 10px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon name={tc.icon} size={12} /> {d.type}
        </span>
        <div onClick={e => e.stopPropagation()} style={{ width: 100, flexShrink: 0, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <button onClick={() => onSelect(d)}
            style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
          ><Icon name="arrow_forward" size={16} /></button>
          <button style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
          ><Icon name="edit" size={16} /></button>
          <button onClick={() => setConfirmDelete(true)}
            style={{ width: 30, height: 30, borderRadius: 100, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.grey400, transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.color = color.error; e.currentTarget.style.background = color.errorLight }} onMouseLeave={e => { e.currentTarget.style.color = hovered ? color.grey600 : color.grey400; e.currentTarget.style.background = 'transparent' }}
          ><Icon name="delete" size={16} /></button>
        </div>
      </div>
      {confirmDelete && createPortal(
        <>
          <div onClick={() => setConfirmDelete(false)} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 9001, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '28px 28px 24px', width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', pointerEvents: 'all', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xSm, animation: 'scaleIn 0.15s ease' }}>
              <div style={{ width: 52, height: 52, borderRadius: 100, background: color.errorLight, border: `1px solid ${color.errorDark}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="warning" size={24} color={color.error} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: color.grey900 }}>¿Eliminar "{d.name}"?</p>
                <p style={{ margin: 0, fontSize: 13, color: color.grey600, lineHeight: 1.5 }}>Se eliminará este disparador del agente.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, width: '100%' }}>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', fontSize: 13, fontWeight: 600, color: color.grey800, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={() => { setConfirmDelete(false); onRemove(d.id) }} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: 'none', background: color.error, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Eliminar</button>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </>
  )
}

function AddDisparadorDrawer({ onAdd, onClose }: { onAdd: (d: Disparador) => void; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('cron')
  const filteredCron = CRON_CATALOG.filter(c => c.toLowerCase().includes(query.toLowerCase()))
  const filteredWorkflow = WORKFLOW_CATALOG.filter(w => w.name.toLowerCase().includes(query.toLowerCase()))

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(0,0,0,0.18)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 8001, width: 380, background: 'white', boxShadow: '-4px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.22s ease' }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${color.grey100}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 100, background: color.warningLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bolt" size={16} color={color.warningDark} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: color.grey900 }}>Agregar iniciador</span>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 100, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500 }}
            onMouseEnter={e => { e.currentTarget.style.background = color.grey100; e.currentTarget.style.color = color.grey800 }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = color.grey500 }}
          ><Icon name="close" size={16} /></button>
        </div>
        <div style={{ padding: '12px 20px 8px', flexShrink: 0 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar ..."
            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, fontSize: 13, color: color.grey800, outline: 'none', background: color.grey50, fontFamily: font.family }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 16px' }}>
          {/* Time Triggers */}
          <div style={{ borderBottom: `1px solid ${color.grey100}`, paddingBottom: 4 }}>
            <button onClick={() => setExpandedSection(expandedSection === 'cron' ? null : 'cron')} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: spacing.xSm, padding: '14px 4px', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 100, background: color.warningLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="schedule" size={18} color={color.warningDark} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: color.grey900 }}>Time Triggers</div>
                <div style={{ fontSize: 11.5, color: color.grey500 }}>{filteredCron.length} triggers disponibles</div>
              </div>
              <Icon name="expand_more" size={16} color={color.grey500} style={{ flexShrink: 0, transform: expandedSection === 'cron' ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
            </button>
            {expandedSection === 'cron' && filteredCron.map(c => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', borderBottom: `1px solid ${color.grey50}` }}>
                <Icon name="schedule" size={14} color={color.warningDark} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13.5, color: color.grey800 }}>{c}</span>
                <button onClick={() => { onAdd({ id: `d${Date.now()}`, name: c, type: 'CRON', config: c, description: '' }); onClose() }}
                  style={{ width: 28, height: 28, borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.primary, flexShrink: 0, transition: 'background 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = color.primaryUltraLight; e.currentTarget.style.borderColor = color.primaryLight }} onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = color.borderDefault }}
                ><Icon name="add" size={14} /></button>
              </div>
            ))}
          </div>
          {/* Workflows */}
          <div style={{ paddingBottom: 4 }}>
            <button onClick={() => setExpandedSection(expandedSection === 'workflow' ? null : 'workflow')} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: spacing.xSm, padding: '14px 4px', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 100, background: color.primaryUltraLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="account_tree" size={18} color={color.primary} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: color.grey900 }}>Workflows</div>
                <div style={{ fontSize: 11.5, color: color.grey500 }}>{filteredWorkflow.length} cambios de estado</div>
              </div>
              <Icon name="expand_more" size={16} color={color.grey500} style={{ flexShrink: 0, transform: expandedSection === 'workflow' ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
            </button>
            {expandedSection === 'workflow' && filteredWorkflow.map(w => (
              <div key={w.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', borderBottom: `1px solid ${color.grey50}` }}>
                <Icon name="account_tree" size={14} color={color.primary} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13.5, color: color.grey800 }}>{w.name}</span>
                  <span style={{ fontSize: 11, color: color.grey500, marginLeft: 6 }}>{w.from} → {w.to}</span>
                </div>
                <button onClick={() => { onAdd({ id: `d${Date.now()}`, name: `Al entrar a ${w.name}`, type: 'Workflow', config: `${w.from} → ${w.to}`, description: '' }); onClose() }}
                  style={{ width: 28, height: 28, borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: color.primary, flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.background = color.primaryUltraLight }} onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
                ><Icon name="add" size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>, document.body
  )
}

// Workspace catalog mock para Automatizaciones (templates de disparadores
// comunes que el admin tiene compartidos a nivel workspace).
interface WorkspaceDisparador {
  id:          string
  name:        string
  config:      string
  type:        'CRON' | 'Workflow' | 'Webhook'
  description: string
  icon:        string
}
const WORKSPACE_DISPARADORES: WorkspaceDisparador[] = [
  { id: 'wd-cron-daily', name: 'Resumen diario',     config: 'Todos los días a las 9hs',                type: 'CRON',     description: 'Envía resumen del día anterior al equipo', icon: 'schedule' },
  { id: 'wd-cron-hour',  name: 'Pulso horario',      config: 'Cada hora',                                type: 'CRON',     description: 'Chequea pendientes y notifica al canal',   icon: 'autorenew' },
  { id: 'wd-webhook',    name: 'Webhook entrante',   config: 'POST /api/webhook',                        type: 'Webhook',  description: 'Lo dispara una integración externa',       icon: 'webhook' },
  { id: 'wd-status',     name: 'Cambio de estado',   config: 'Cuando un pedido pasa a "Pedido tomado"',  type: 'Workflow', description: 'Reacciona a transiciones del kanban',      icon: 'change_circle' },
]

// Templates predefinidos para Automatizaciones — el modal "Agregar nuevo"
// muestra esto en lugar de un form abierto. El usuario clickea uno y queda
// agregado con la config preset; después puede editarla.
interface DisparadorTemplate {
  id:    string
  name:  string
  config: string
  type:  'CRON' | 'Workflow' | 'Webhook'
  description: string
  icon:  string
}
const DISPARADOR_TEMPLATES: DisparadorTemplate[] = [
  { id: 't-cron-5m',    name: 'Cada 5 minutos',         config: 'Cada 5 minutos',                type: 'CRON',     description: 'Ideal para chequeos rápidos y polling.',                icon: 'autorenew' },
  { id: 't-cron-hour',  name: 'Cada hora',              config: 'A cada hora',                    type: 'CRON',     description: 'Pulso horario para tareas de mantenimiento.',          icon: 'schedule' },
  { id: 't-cron-9am',   name: 'Todos los días a las 9hs', config: 'Todos los días a las 9hs',     type: 'CRON',     description: 'Resumen diario, recordatorios, jobs nocturnos.',       icon: 'wb_sunny' },
  { id: 't-cron-mon',   name: 'Lunes a las 9hs',         config: 'Todos los Lunes',                type: 'CRON',     description: 'Reportes semanales o jobs del lunes.',                  icon: 'today' },
  { id: 't-flow-status', name: 'Cambio de estado',       config: 'Cuando un pedido pasa a "Pedido tomado"', type: 'Workflow', description: 'Reacciona a transiciones del kanban.',                  icon: 'change_circle' },
  { id: 't-flow-msg',   name: 'Mensaje recibido',        config: 'Cuando llega un mensaje en WhatsApp',     type: 'Workflow', description: 'Reacciona a mensajes entrantes en cualquier canal.',    icon: 'chat' },
  { id: 't-webhook',    name: 'Webhook entrante',        config: 'POST /api/webhook',              type: 'Webhook',  description: 'Recibí un POST de cualquier integración externa.',     icon: 'webhook' },
]

function DisparadoresTabV2({ onSelect: _onSelect }: { onSelect: (d: Disparador) => void }) {
  const [disparadores, setDisparadores] = useState<Disparador[]>([])
  const [showCustom, setShowCustom] = useState(false)
  const [showAddPicker, setShowAddPicker] = useState(false)
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<V2SortMode>('recomendado')

  const addFromTemplate = (t: DisparadorTemplate) => {
    setDisparadores(p => [...p, {
      id: `${t.id}-${Date.now()}`,
      name: t.name,
      type: t.type === 'Webhook' ? 'Workflow' : t.type,
      config: t.config, description: t.description,
    }])
    setShowAddPicker(false)
  }
  const removeFromAgent = (id: string) => setDisparadores(p => p.filter(x => x.id !== id))

  const filtered = disparadores.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.config.toLowerCase().includes(search.toLowerCase())
  )
  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'nombre') return a.name.localeCompare(b.name)
    if (sortMode === 'tipo')   return a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
    return a.name.localeCompare(b.name)
  })

  // Icono según tipo del disparador.
  const iconForType = (t: DisparadorTemplate['type']): string =>
    t === 'CRON' ? 'schedule' : t === 'Webhook' ? 'webhook' : 'change_circle'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: color.grey900, letterSpacing: '-0.01em' }}>Automatizaciones</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: color.grey600, lineHeight: 1.6, maxWidth: 720 }}>
            Disparadores automáticos como cron jobs, cambios de estado o webhooks para ejecutar el agente sin intervención manual.
          </p>
        </div>
        <button onClick={() => setShowAddPicker(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '9px 18px', borderRadius: 100, border: 'none',
            background: color.primary, color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px -3px rgba(48,79,254,0.35)',
            transition: 'transform 0.12s, box-shadow 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(48,79,254,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -3px rgba(48,79,254,0.35)' }}
        ><Icon name="add" size={14} /> Agregar nueva</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar automatización..." />
        </div>
        <V2SortDropdown value={sortMode} onChange={setSortMode} options={['recomendado', 'nombre', 'tipo']} />
      </div>

      {disparadores.length === 0 ? (
        <V2EmptyState
          iconBg="#FEF3C7"
          icon={<Icon name="bolt" size={30} color="#92400E" />}
          title="Sumá automatizaciones al agente"
          description="Disparadores como cron jobs, cambios de estado o webhooks que ejecutan el agente sin intervención."
        />
      ) : sorted.length === 0 ? (
        <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, padding: '40px 20px', textAlign: 'center' }}>
          <Icon name="search_off" size={32} color={color.grey400} />
          <p style={{ margin: '10px 0 4px', fontSize: 13, fontWeight: 600, color: color.grey800 }}>Sin resultados</p>
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: radius.lg,
          border: `1px solid ${color.borderDefault}`,
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        }}>
          {sorted.map((d, i) => (
            <V2OwnedRow key={d.id}
              iconNode={<Icon name={iconForType(d.type)} size={22} color="#92400E" />}
              iconBg="#FEF3C7"
              name={d.name}
              typeLabel={d.type}
              description={d.config}
              onDelete={() => removeFromAgent(d.id)}
              isLast={i === sorted.length - 1}
            />
          ))}
        </div>
      )}

      {/* Modal: picker de templates predefinidos */}
      {showAddPicker && (
        <V2Modal
          icon={<Icon name="bolt" size={20} color="#92400E" />}
          iconBg="#FEF3C7"
          title="Elegí una automatización"
          subtitle="Templates predefinidos que ya vienen con la configuración lista."
          onClose={() => setShowAddPicker(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DISPARADOR_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => addFromTemplate(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', borderRadius: radius.md,
                  border: `1.5px solid ${color.borderDefault}`,
                  background: 'white', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.background = '#FFFBEB' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = color.borderDefault; e.currentTarget.style.background = 'white' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={t.icon} size={20} color="#92400E" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: color.grey900 }}>{t.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', padding: '1px 6px', borderRadius: 100, background: color.grey100, color: color.grey700, textTransform: 'uppercase' }}>{t.type}</span>
                  </div>
                  <div style={{ fontSize: 12, color: color.grey600, lineHeight: 1.4 }}>{t.description}</div>
                </div>
                <Icon name="chevron_right" size={18} color={color.grey400} />
              </button>
            ))}

            {/* Custom: escape-hatch al drawer V1 para configuración avanzada */}
            <button onClick={() => { setShowAddPicker(false); setShowCustom(true) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px', borderRadius: radius.md,
                border: `1.5px dashed ${color.borderDefault}`,
                background: 'transparent', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.12s', marginTop: 4,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.background = '#FFFBEB' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = color.borderDefault; e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'white', border: `1px solid ${color.borderSubtle}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="tune" size={20} color={color.grey700} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: color.grey900 }}>Configuración custom</div>
                <div style={{ fontSize: 12, color: color.grey600, marginTop: 2 }}>Definí el cron, transición o webhook con todos los detalles.</div>
              </div>
              <Icon name="chevron_right" size={18} color={color.grey400} />
            </button>
          </div>
        </V2Modal>
      )}

      {showCustom && <AddDisparadorDrawer onAdd={d => setDisparadores(p => [...p, d])} onClose={() => setShowCustom(false)} />}
    </div>
  )
}

function DisparadoresTab({ onSelect }: { onSelect: (d: Disparador) => void }) {
  const [disparadores, setDisparadores] = useState<Disparador[]>([])
  const [showDrawer, setShowDrawer] = useState(false)
  const [search, setSearch] = useState('')
  const filtered = disparadores.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.config.toLowerCase().includes(search.toLowerCase()))
  const isEmpty = disparadores.length === 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      {!isEmpty && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: color.grey900, letterSpacing: '-0.01em' }}>Automatizaciones</h2>
            <p style={{ margin: 0, fontSize: 13.5, color: color.grey600, lineHeight: 1.6, maxWidth: 600 }}>
              Configurá disparadores automáticos como webhooks, cron jobs o cambios de estado para ejecutar el agente sin intervención manual.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm, flexShrink: 0, marginTop: 4 }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar disparador..." />
            <button onClick={() => setShowDrawer(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 15px', borderRadius: 100, border: 'none', background: color.primary, fontSize: 12.5, fontWeight: 600, color: 'white', cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            ><Icon name="add" size={13} /> Agregar disparador</button>
          </div>
        </div>
      )}
      {isEmpty ? (
        <TabEmptyBanner
          iconBg="#FEF3C7"
          icon={<Icon name="bolt" size={36} color="#92400E" />}
          status="Sumá automatizaciones al agente"
          hint="Configurá webhooks, cron jobs o eventos de estado para ejecutar el agente sin intervención manual."
          ctaLabel="Agregar disparador"
          onCta={() => setShowDrawer(true)}
        />
      ) : (
        <div style={{ background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xSm, padding: `${spacing.xxSm}px ${spacing.sm}px`, background: color.grey100, borderBottom: `1px solid ${color.borderDefault}` }}>
            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color.grey900 }}>Disparador</span>
            <span style={{ width: 90, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color.grey900, textAlign: 'center' }}>Tipo</span>
            <span style={{ width: 100 }} />
          </div>
          {filtered.map(d => (
            <DisparadorRow key={d.id} d={d} onRemove={id => setDisparadores(p => p.filter(x => x.id !== id))} onSelect={onSelect} />
          ))}
        </div>
      )}
      {showDrawer && <AddDisparadorDrawer onAdd={d => setDisparadores(p => [...p, d])} onClose={() => setShowDrawer(false)} />}
    </div>
  )
}

// ── Historial Sidebar ──────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#304FFE', '#02C66A', '#F5A623', '#FB1531', '#673AB7', '#00BCD4']
function UserAvatar({ name, size = 22 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colorIdx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: AVATAR_COLORS[colorIdx], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.45, fontWeight: font.bold, color: 'white', fontFamily: font.family, lineHeight: 1 }}>{initials}</span>
    </div>
  )
}

interface HistVersion {
  id: number
  date: string
  time: string
  publishedBy: string
  env: 'produccion' | 'demo' | null
  label?: string
  notes?: string
}

const INITIAL_VERSIONS: HistVersion[] = [
  { id: 17, date: '24/4/2026', time: '14:58:15', publishedBy: 'Matías R.', env: 'produccion', label: 'Ajuste de tono (Restaurado)' },
  { id: 16, date: '24/4/2026', time: '14:58:15', publishedBy: 'Matías R.', env: null,         label: 'Soporte nocturno + Instagram' },
  { id: 15, date: '24/4/2026', time: '14:58:15', publishedBy: 'Matías R.', env: null,         label: 'Ajuste de tono' },
  { id: 12, date: '24/4/2026', time: '14:58:15', publishedBy: 'Matías R.', env: null,         label: 'Version 12' },
  { id: 10, date: '24/4/2026', time: '14:58:15', publishedBy: 'Matías R.', env: null,         label: 'Canal WhatsApp Business' },
  { id:  1, date: '24/4/2026', time: '14:58:15', publishedBy: 'Matías R.', env: null,         label: 'Lanzamiento inicial' },
]

interface HistorialSidebarProps {
  onClose: () => void
  // Optional: lets the parent persist the "viewing" snapshot so the read-only
  // banner survives drawer close/open cycles.
  initialSelectedId?: number | null
  onSelectionChange?: (v: HistVersion | null) => void
}

function HistorialSidebar({ onClose, initialSelectedId = null, onSelectionChange }: HistorialSidebarProps) {
  const [versions, setVersions] = useState<HistVersion[]>(INITIAL_VERSIONS)
  const [selectedId, setSelectedId] = useState<number | null>(initialSelectedId)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  // Mirror selectedId to the parent so the floating banner can live above
  // the editor (not inside this sidebar's portal). Avoids the banner getting
  // unmounted when the drawer closes.
  useEffect(() => {
    const v = selectedId !== null ? versions.find(ver => ver.id === selectedId) ?? null : null
    onSelectionChange?.(v)
  }, [selectedId, versions, onSelectionChange])
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('Cargando versión...')
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishName, setPublishName] = useState('')
  const [publishNotes, setPublishNotes] = useState('')
  const [draftStatus, setDraftStatus] = useState<'editing' | 'synced'>('editing')

  const btnBase: React.CSSProperties = { padding: `6px ${spacing.sm}px`, borderRadius: 100, cursor: 'pointer', fontSize: text.paragraphXs.size, fontWeight: font.medium, fontFamily: font.family, display: 'inline-flex', alignItems: 'center', gap: spacing.xxxSm }
  const btnOutline: React.CSSProperties = { ...btnBase, border: `1px solid ${color.primary}`, background: 'white', color: color.primary }
  const btnGhost: React.CSSProperties = { ...btnBase, border: `1px solid ${color.grey300}`, background: 'white', color: color.grey800 }

  const fakeLoad = (msg: string, cb: () => void) => {
    setLoadingMsg(msg)
    setLoading(true)
    setTimeout(() => { setLoading(false); cb() }, 800 + Math.random() * 400)
  }

  const promoteToProduction = (id: number) => {
    fakeLoad('Publicando en producción...', () => {
      setVersions(prev => prev.map(v => {
        if (v.id === id) return { ...v, env: 'produccion' as const }
        if (v.env === 'produccion') return { ...v, env: null }
        return v
      }))
    })
  }

  const selectVersion = (id: number) => {
    if (selectedId === id) { setSelectedId(null); return }
    fakeLoad('Cargando versión...', () => setSelectedId(id))
  }

  const confirmPublish = () => {
    const now = new Date()
    const newVersion: HistVersion = {
      id: (versions[0]?.id ?? 0) + 1,
      date: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
      time: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`,
      publishedBy: 'Gonzalo T.',
      env: null,
      label: publishName || undefined,
      notes: publishNotes || undefined,
    }
    setShowPublishModal(false)
    fakeLoad('Publicando versión...', () => {
      setVersions(prev => [newVersion, ...prev])
      setSelectedId(newVersion.id)
      setPublishName('')
      setPublishNotes('')
      setDraftStatus('synced')
      // Simulate that the user keeps editing after a bit
      setTimeout(() => setDraftStatus('editing'), 5000)
    })
  }

  const restoreToDraft = (id: number) => {
    const v = versions.find(ver => ver.id === id)
    fakeLoad('Restaurando en borrador...', () => {
      setSelectedId(null)
      setDraftStatus('editing')
    })
  }

  const spinnerCss = `@keyframes histSpinner { to { transform: rotate(360deg) } }`

  const latestVersion = versions[0]

  return createPortal(
    <>
      <style>{spinnerCss}</style>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 7000, background: 'rgba(0,0,0,0.08)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 7001, width: 370, background: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.2s ease' }}>
        {/* Header */}
        <div style={{ padding: `${spacing.sm}px ${spacing.xBig}px`, borderBottom: `1px solid ${color.grey200}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: text.h5.size, lineHeight: `${text.h5.lh}px`, fontWeight: font.bold, color: color.grey900, fontFamily: font.family }}>Historial de versiones</span>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 100, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500 }}
              onMouseEnter={e => { e.currentTarget.style.background = color.grey100 }} onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            ><Icon name="close" size={18} /></button>
          </div>
          <span style={{ fontSize: text.paragraphXs.size, color: color.grey500, fontFamily: font.family }}>Revisá una versión anterior.</span>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing.xSm }}>
            <div style={{ width: 28, height: 28, border: `3px solid ${color.grey200}`, borderTopColor: color.primary, borderRadius: '50%', animation: 'histSpinner 0.7s linear infinite' }} />
            <span style={{ fontSize: text.paragraphXs.size, color: color.grey600, fontFamily: font.family }}>{loadingMsg}</span>
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: spacing.sm, opacity: loading ? 0.4 : 1, transition: 'opacity 0.2s', pointerEvents: loading ? 'none' : 'auto' }}>
          {/* Draft card — selected when no version is being previewed */}
          {(() => {
            const draftSelected = selectedId === null
            return (
              <div
                onClick={() => setSelectedId(null)}
                style={{
                  padding: spacing.sm,
                  borderRadius: radius.md,
                  background: draftSelected ? color.primaryUltraLight : 'white',
                  border: `1.5px solid ${draftSelected ? color.primary : color.grey200}`,
                  marginBottom: spacing.xSm,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{ marginBottom: spacing.xxSm }}>
                  {draftStatus === 'editing' ? (
                    <span style={{ fontSize: text.paragraphXxs.size, fontWeight: font.bold, color: color.warningDark, background: color.warningLight, padding: '2px 9px', borderRadius: 100 }}>Editando</span>
                  ) : (
                    <span style={{ fontSize: text.paragraphXxs.size, fontWeight: font.medium, color: color.grey500, background: color.grey100, padding: '2px 9px', borderRadius: 100 }}>Sin cambios</span>
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: font.bold, color: color.grey900, marginBottom: 2, fontFamily: font.family }}>
                  Borrador (actual)
                </div>
                <p style={{ fontSize: text.paragraphSm.size, lineHeight: `${text.paragraphSm.lh}px`, color: color.grey500, margin: `0 0 ${spacing.sm}px`, fontFamily: font.family }}>
                  {draftStatus === 'synced'
                    ? `Sincronizado con v${latestVersion?.id}. Editá para crear cambios nuevos.`
                    : 'Editas colaborativamente en vivo.'}
                </p>
                <button
                  onClick={e => { e.stopPropagation(); setShowPublishModal(true) }}
                  style={{ ...btnBase, width: '100%', justifyContent: 'center', padding: `${spacing.xSm}px`, border: 'none', background: color.primary, color: 'white', fontSize: text.paragraphSm.size, fontWeight: font.bold }}
                  onMouseEnter={e => { e.currentTarget.style.background = color.primaryMidDark }}
                  onMouseLeave={e => { e.currentTarget.style.background = color.primary }}
                >
                  Publicar en producción
                </button>
              </div>
            )
          })()}

          {/* Versions — independent cards (no timeline thread) */}
          {versions.map(v => {
            const isSelected = selectedId === v.id
            const isHovered  = hoveredId === v.id && !isSelected
            return (
              <div
                key={v.id}
                onClick={() => selectVersion(v.id)}
                onMouseEnter={() => setHoveredId(v.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  padding: spacing.sm,
                  borderRadius: radius.md,
                  background: isSelected ? color.primaryUltraLight : isHovered ? color.grey50 : 'white',
                  border: `1.5px solid ${isSelected ? color.primary : color.grey200}`,
                  marginBottom: spacing.xSm,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {v.env === 'produccion' && (
                  <div style={{ marginBottom: spacing.xxSm }}>
                    <span style={{ fontSize: text.paragraphXxs.size, fontWeight: font.bold, color: color.successDark, background: color.successLight, padding: '2px 9px', borderRadius: 100 }}>En producción</span>
                  </div>
                )}
                <div style={{ fontSize: 15, fontWeight: font.bold, color: color.grey900, marginBottom: spacing.xxxSm, fontFamily: font.family }}>
                  {v.label ?? `Versión ${v.id}`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm, fontSize: text.paragraphXs.size, color: color.grey500, fontFamily: font.family }}>
                  <span>{v.date}, {v.time}</span>
                  <span style={{ color: color.grey300 }}>·</span>
                  <UserAvatar name={v.publishedBy} size={18} />
                  <span>{v.publishedBy}</span>
                </div>

                {isSelected && (
                  <div style={{ display: 'flex', gap: spacing.xxSm, marginTop: spacing.sm }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => restoreToDraft(v.id)}
                      style={{ ...btnOutline, flex: 1, justifyContent: 'center', padding: `${spacing.xxSm}px`, fontWeight: font.bold }}
                      onMouseEnter={e => { e.currentTarget.style.background = color.primaryUltraLight }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
                    >
                      Aplicar en borrador
                    </button>
                    <button
                      onClick={() => promoteToProduction(v.id)}
                      style={{ ...btnBase, flex: 1, justifyContent: 'center', padding: `${spacing.xxSm}px`, border: 'none', background: color.primary, color: 'white', fontWeight: font.bold }}
                      onMouseEnter={e => { e.currentTarget.style.background = color.primaryMidDark }}
                      onMouseLeave={e => { e.currentTarget.style.background = color.primary }}
                    >
                      Publicar en producción
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Publish modal */}
      {showPublishModal && (
        <>
          <div onClick={() => setShowPublishModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 8001, width: 420, background: 'white', borderRadius: radius.lg, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: spacing.xBig, fontFamily: font.family }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xBig }}>
              <span style={{ fontSize: text.h4.size, fontWeight: font.bold, color: color.grey900 }}>Publicar versión</span>
              <button onClick={() => setShowPublishModal(false)} style={{ width: 28, height: 28, borderRadius: 100, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500 }}
                onMouseEnter={e => { e.currentTarget.style.background = color.grey100 }} onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
              ><Icon name="close" size={18} /></button>
            </div>
            <p style={{ fontSize: text.paragraphSm.size, color: color.grey600, margin: `0 0 ${spacing.sm}px`, lineHeight: `${text.paragraphSm.lh}px` }}>
              Se creará la <b>versión {(versions[0]?.id ?? 0) + 1}</b> con el contenido actual del borrador.
            </p>
            <div style={{ marginBottom: spacing.sm }}>
              <label style={{ display: 'block', fontSize: text.paragraphXs.size, fontWeight: font.medium, color: color.grey700, marginBottom: spacing.xxxSm }}>Nombre (opcional)</label>
              <input
                value={publishName} onChange={e => setPublishName(e.target.value)}
                placeholder="ej. Mejora de prompts de venta"
                autoFocus
                style={{ width: '100%', padding: `${spacing.xxSm}px ${spacing.xSm}px`, borderRadius: radius.sm, border: `1px solid ${color.grey300}`, fontSize: text.paragraphSm.size, fontFamily: font.family, color: color.grey900, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.currentTarget.style.borderColor = color.primary }} onBlur={e => { e.currentTarget.style.borderColor = color.grey300 }}
              />
            </div>
            <div style={{ marginBottom: spacing.xBig }}>
              <label style={{ display: 'block', fontSize: text.paragraphXs.size, fontWeight: font.medium, color: color.grey700, marginBottom: spacing.xxxSm }}>Notas (opcional)</label>
              <textarea
                value={publishNotes} onChange={e => setPublishNotes(e.target.value)}
                placeholder="Describí qué cambió en esta versión..."
                rows={3}
                style={{ width: '100%', padding: `${spacing.xxSm}px ${spacing.xSm}px`, borderRadius: radius.sm, border: `1px solid ${color.grey300}`, fontSize: text.paragraphSm.size, fontFamily: font.family, color: color.grey900, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                onFocus={e => { e.currentTarget.style.borderColor = color.primary }} onBlur={e => { e.currentTarget.style.borderColor = color.grey300 }}
              />
            </div>
            <div style={{ display: 'flex', gap: spacing.xxSm, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPublishModal(false)} style={{ ...btnGhost }}
                onMouseEnter={e => { e.currentTarget.style.background = color.grey50 }} onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
              >Cancelar</button>
              <button onClick={confirmPublish} style={{ ...btnBase, border: 'none', background: color.primary, color: 'white' }}
                onMouseEnter={e => { e.currentTarget.style.background = color.primaryMidDark }} onMouseLeave={e => { e.currentTarget.style.background = color.primary }}
              ><Icon name="publish" size={14} color="white" />Publicar</button>
            </div>
          </div>
        </>
      )}
    </>, document.body
  )
}

// ── SIDEBAR AGENTS ────────────────────────────────────────────────────────────


// ── FlowEmptyState ────────────────────────────────────────────────────────────

function LoopNode({ onDelete }: { onDelete: () => void }) {
  return (
    <div style={{ position: 'relative', width: 420, paddingTop: 28 }} data-no-drag>
      {/* Green tab behind label */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 130, height: 52, borderRadius: `${radius.lg}px ${radius.lg}px 0 0`, background: color.successLight, border: `1.5px solid ${color.success}`, borderBottom: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 6, left: 10, zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
        <Icon name="replay" size={16} color={color.successDark} />
        <span style={{ fontSize: 13, fontWeight: 700, color: color.successDark }}>Loop</span>
        <Icon name="expand_more" size={14} color={color.successDark} />
      </div>
      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, background: 'white', borderRadius: radius.lg + 2, border: `1.5px solid ${color.grey200}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {/* Left connector */}
        <div style={{ position: 'absolute', left: -7, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', background: color.grey300, border: `2px solid white` }} />
        {/* Title bar */}
        <NodeTitleBar title="Por cada item" onDelete={onDelete} />
        {/* Content */}
        <div style={{ padding: spacing.sm }}>
          <div style={{ padding: `${spacing.xSm}px ${spacing.sm}px`, background: color.grey50, borderRadius: radius.md, border: `1px solid ${color.grey200}`, fontSize: 14, color: color.grey800, fontFamily: font.family }}>
            Recorre la lista de usuario
          </div>
        </div>
      </div>
      {/* Right output ports — aligned to card edge */}
      <div style={{ position: 'absolute', right: -130, top: 28, bottom: 0, zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, pointerEvents: 'all' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: color.grey300, border: `2px solid white`, flexShrink: 0 }} />
          <div style={{ width: 16, height: 2, background: color.grey300 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: color.grey600, background: 'white', padding: '3px 10px', borderRadius: 100, border: `1px solid ${color.grey200}`, boxShadow: shadow.small, whiteSpace: 'nowrap' }}>Finalizado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, pointerEvents: 'all' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: color.grey300, border: `2px solid white`, flexShrink: 0 }} />
          <div style={{ width: 16, height: 2, background: color.grey300 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: color.grey600, background: 'white', padding: '3px 10px', borderRadius: 100, border: `1px solid ${color.grey200}`, boxShadow: shadow.small, whiteSpace: 'nowrap' }}>Por cada item</span>
        </div>
      </div>
    </div>
  )
}

function FlowCanvasToolbar() {
  return (
    <div style={{ position: 'absolute', bottom: spacing.sm, left: spacing.sm, right: spacing.sm, display: 'flex', alignItems: 'center', zIndex: 5, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'white', borderRadius: radius.md, padding: 2, border: `1px solid ${color.borderSubtle}`, boxShadow: shadow.small, pointerEvents: 'all' }}>
        {['zoom_out', undefined, 'zoom_in', undefined, 'account_tree', 'view_column', 'fullscreen'].map((ic, i) =>
          ic === undefined ? (
            i === 1 ? <span key={i} style={{ fontSize: 12, fontWeight: 600, color: color.grey700, padding: '0 6px', minWidth: 36, textAlign: 'center' }}>100%</span>
            : <div key={i} style={{ width: 1, height: 18, background: color.grey200, margin: '0 2px' }} />
          ) : (
            <button key={ic} style={{ width: 30, height: 30, borderRadius: radius.sm, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey600 }}
              onMouseEnter={e => (e.currentTarget.style.background = color.grey200)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            ><Icon name={ic} size={18} /></button>
          )
        )}
      </div>
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 2, background: 'white', borderRadius: radius.md, padding: 2, border: `1px solid ${color.borderSubtle}`, boxShadow: shadow.small, pointerEvents: 'all' }}>
        <button style={{ width: 32, height: 32, borderRadius: radius.sm, border: 'none', background: color.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Icon name="near_me" size={18} /></button>
        <button style={{ width: 32, height: 32, borderRadius: radius.sm, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey600 }}><Icon name="pan_tool" size={18} /></button>
        <button style={{ width: 32, height: 32, borderRadius: radius.sm, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey600 }}><Icon name="chat_bubble_outline" size={18} /></button>
        <div style={{ width: 1, height: 18, background: color.grey200, margin: '0 2px' }} />
        <button style={{ width: 32, height: 32, borderRadius: radius.sm, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey400 }}><Icon name="undo" size={18} /></button>
        <button style={{ width: 32, height: 32, borderRadius: radius.sm, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey400 }}><Icon name="redo" size={18} /></button>
      </div>
    </div>
  )
}

function AddNodeMenu({ onSelect }: { onSelect: (type: string) => void }) {
  const nodeOptions = [
    { id: 'instruction', icon: 'edit_note', label: 'Bloque de instrucción', desc: 'Instrucción para el agente', bg: color.primaryUltraLight, border: color.primaryLight, fg: color.primary },
    { id: 'condition', icon: 'call_split', label: 'Condicional', desc: 'Bifurca según una condición', bg: color.warningLight, border: color.warning, fg: color.warningDark },
    { id: 'loop', icon: 'replay', label: 'Loop', desc: 'Repite un bloque', bg: color.successLight, border: color.success, fg: color.successDark },
    { id: 'ideas', icon: 'auto_awesome', label: 'Ideas de flujo', desc: 'Sugerencias con IA', bg: color.primaryUltraLight, border: color.primaryLight, fg: color.primary },
  ]
  return (
    <div style={{ position: 'absolute', top: 44, left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, boxShadow: shadow.medium, padding: spacing.xxxSm, width: 220, zIndex: 10, animation: 'scaleIn 0.12s ease' }}>
      {nodeOptions.map(opt => (
        <button key={opt.id} onClick={() => onSelect(opt.id)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: spacing.xxSm, padding: `${spacing.xxSm}px ${spacing.xSm}px`, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: radius.md, textAlign: 'left', transition: 'background 0.1s' }}
          onMouseEnter={e => (e.currentTarget.style.background = color.grey50)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ width: 28, height: 28, borderRadius: radius.sm, background: opt.bg, border: `1px solid ${opt.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={opt.icon} size={16} color={opt.fg} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: color.grey900 }}>{opt.label}</div>
            <div style={{ fontSize: 11, color: color.grey500 }}>{opt.desc}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

interface ChipItem { id: string; label: string; type: 'base' | 'mcp' | 'code' | 'integration' | 'variable'; sub: string }

const CHIP_COLORS: Record<string, { bg: string; border: string; fg: string }> = {
  base: { bg: color.primaryUltraLight, border: color.primaryLight, fg: color.primary },
  mcp: { bg: color.grey100, border: color.borderDefault, fg: color.grey700 },
  code: { bg: color.successLight, border: color.success, fg: color.successDark },
  integration: { bg: color.warningLight, border: color.warning, fg: color.warningDark },
  variable: { bg: '#F3E8FF', border: '#D8B4FE', fg: '#7C3AED' },
}

const ALL_INSERTABLES: ChipItem[] = [
  { id: 'i1', label: 'Catálogo', type: 'mcp', sub: 'MCP · Google Sheets' },
  { id: 'i2', label: 'Pagos', type: 'mcp', sub: 'MCP · MercadoPago' },
  { id: 'i3', label: 'Notificaciones', type: 'mcp', sub: 'MCP · WhatsApp Business' },
  { id: 'i4', label: 'FAQ General', type: 'base', sub: 'Base · Google Drive' },
  { id: 'i5', label: 'Catálogo de Productos', type: 'base', sub: 'Base · Notion' },
  { id: 'i6', label: 'Políticas internas', type: 'base', sub: 'Base · PDF' },
  { id: 'i7', label: 'Calcular precio', type: 'code', sub: 'Código · Global' },
  { id: 'i8', label: 'Validar horario', type: 'code', sub: 'Código · Global' },
  { id: 'i9', label: 'Mail', type: 'integration', sub: 'Integración · Email' },
  { id: 'i10', label: 'WhatsApp', type: 'integration', sub: 'Integración · Canal' },
  { id: 'i11', label: 'nombre_cliente', type: 'variable', sub: 'Variable · Contexto' },
  { id: 'i12', label: 'total_pedido', type: 'variable', sub: 'Variable · Contexto' },
]

const SLASH_CATEGORIES = [
  { icon: 'confirmation_number', label: 'Business Ticket', bg: color.primaryUltraLight, border: color.primaryLight, fg: color.primary },
  { icon: 'menu_book', label: 'Bases de conocimiento', bg: color.primaryUltraLight, border: color.primaryLight, fg: color.primary },
  { icon: 'memory', label: 'MCPs', bg: color.grey100, border: color.borderDefault, fg: color.grey700, isMcp: true },
  { icon: 'power', label: 'Integraciones y Canales', bg: color.warningLight, border: color.warning, fg: color.warningDark },
  { icon: 'code', label: 'Código', bg: color.successLight, border: color.success, fg: color.successDark },
  { icon: 'data_object', label: 'Variables', bg: '#F3E8FF', border: '#D8B4FE', fg: '#7C3AED' },
]

type ContentPart = { type: 'text'; text: string } | { type: 'chip'; chip: ChipItem }

function InstructionChip({ chip, onRemove }: { chip: ChipItem; onRemove: () => void }) {
  const c = CHIP_COLORS[chip.type]
  return (
    <span contentEditable={false} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 8px', borderRadius: 100, background: c.bg, border: `1px solid ${c.border}`, fontSize: 12, fontWeight: 600, color: c.fg, cursor: 'default', verticalAlign: 'middle', margin: '0 2px', lineHeight: '20px' }}>
      {chip.type === 'mcp' ? <img src="/mcp-logo.png" style={{ width: 11, height: 11, opacity: 0.6 }} /> : <Icon name={chip.type === 'base' ? 'menu_book' : chip.type === 'code' ? 'code' : chip.type === 'integration' ? 'power' : 'data_object'} size={11} color={c.fg} />}
      {chip.label}
      <span onClick={onRemove} style={{ cursor: 'pointer', marginLeft: 2, opacity: 0.5, fontSize: 10 }}>✕</span>
    </span>
  )
}

function NodeTitleBar({ title, onDelete }: { title: string; onDelete: () => void }) {
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', padding: `${spacing.xSm}px ${spacing.sm}px`, borderBottom: `1px solid ${color.grey100}` }}>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: color.grey900 }}>{title}</span>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(m => !m)}
            style={{ width: 28, height: 28, borderRadius: radius.sm, border: 'none', background: showMenu ? color.grey100 : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500 }}
            onMouseEnter={e => (e.currentTarget.style.background = color.grey100)}
            onMouseLeave={e => { if (!showMenu) e.currentTarget.style.background = 'transparent' }}
          ><Icon name="more_vert" size={18} /></button>
          {showMenu && (
            <>
              <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
              <div style={{ position: 'absolute', top: 32, right: 0, background: 'white', borderRadius: radius.md, border: `1px solid ${color.borderDefault}`, boxShadow: shadow.medium, width: 180, zIndex: 10, overflow: 'hidden', animation: 'scaleIn 0.1s ease' }}>
                {[
                  { icon: 'content_copy', label: 'Copiar nodo', action: () => setShowMenu(false) },
                  { icon: 'content_paste', label: 'Duplicar nodo', action: () => setShowMenu(false) },
                  { icon: 'delete', label: 'Eliminar nodo', danger: true, action: () => { setShowMenu(false); setConfirmDelete(true) } },
                ].map(opt => (
                  <button key={opt.label} onClick={opt.action}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: spacing.xxSm, padding: `${spacing.xxSm}px ${spacing.xSm}px`, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 500, color: opt.danger ? color.error : color.grey800, transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = opt.danger ? color.errorLight : color.grey50)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon name={opt.icon} size={16} color={opt.danger ? color.error : color.grey500} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {confirmDelete && createPortal(
        <>
          <div onClick={() => setConfirmDelete(false)} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 9001, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '28px 28px 24px', width: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', pointerEvents: 'all', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xSm, animation: 'scaleIn 0.15s ease' }}>
              <div style={{ width: 52, height: 52, borderRadius: 100, background: color.errorLight, border: `1px solid ${color.errorDark}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="warning" size={24} color={color.error} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: color.grey900 }}>¿Eliminar este nodo?</p>
                <p style={{ margin: 0, fontSize: 13, color: color.grey600, lineHeight: 1.5 }}>Se eliminará el nodo y todo su contenido. Esta acción no se puede deshacer.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4, width: '100%' }}>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', fontSize: 13, fontWeight: 600, color: color.grey800, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={() => { setConfirmDelete(false); onDelete() }} style={{ flex: 1, padding: '9px 0', borderRadius: 100, border: 'none', background: color.error, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>Eliminar</button>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </>
  )
}

function InstructionNode({ onDelete }: { onDelete: () => void }) {
  const [parts, setParts] = useState<ContentPart[]>([{ type: 'text', text: '' }])
  const [slashQuery, setSlashQuery] = useState<string | null>(null)
  const [showBrowseMenu, setShowBrowseMenu] = useState(false)
  const [activeTextIdx, setActiveTextIdx] = useState(0)
  const [addedActions, setAddedActions] = useState<ChipItem[]>([])
  const [configDrawer, setConfigDrawer] = useState<ChipItem | null>(null)
  const [editorFocused, setEditorFocused] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleTextChange = (idx: number, val: string) => {
    const newParts = [...parts]
    newParts[idx] = { type: 'text', text: val }
    setParts(newParts)

    // Detect / or $
    const lastTrigger = Math.max(val.lastIndexOf('/'), val.lastIndexOf('$'))
    if (lastTrigger >= 0) {
      const before = lastTrigger > 0 ? val[lastTrigger - 1] : ' '
      if (before === ' ' || before === '\n' || lastTrigger === 0) {
        setSlashQuery(val.slice(lastTrigger + 1))
        setActiveTextIdx(idx)
        return
      }
    }
    setSlashQuery(null)
  }

  const insertChip = (chip: ChipItem, fromBrowse?: boolean) => {
    if (fromBrowse) {
      // From browse button — append at the end
      const newParts = [...parts, { type: 'chip' as const, chip }, { type: 'text' as const, text: '' }]
      setParts(newParts)
      setShowBrowseMenu(false)
    } else {
      // From slash command — replace the /query
      const newParts = [...parts]
      const textPart = newParts[activeTextIdx]
      if (textPart.type !== 'text') return
      const text = textPart.text
      const lastTrigger = Math.max(text.lastIndexOf('/'), text.lastIndexOf('$'))
      const before = text.slice(0, lastTrigger)
      newParts.splice(activeTextIdx, 1, { type: 'text', text: before }, { type: 'chip', chip }, { type: 'text', text: '' })
      setParts(newParts)
      setSlashQuery(null)
    }
    // Track for config section (integrations, mcps get config)
    if (chip.type === 'integration' || chip.type === 'mcp') {
      setAddedActions(prev => prev.some(a => a.id === chip.id) ? prev : [...prev, chip])
    }
    setTimeout(() => { const refs = inputRefs.current; refs[refs.length - 1]?.focus() }, 50)
  }

  const removeChip = (idx: number) => {
    const newParts = [...parts]
    // Merge surrounding text parts
    const before = idx > 0 && newParts[idx - 1].type === 'text' ? (newParts[idx - 1] as { type: 'text'; text: string }).text : ''
    const after = idx < newParts.length - 1 && newParts[idx + 1].type === 'text' ? (newParts[idx + 1] as { type: 'text'; text: string }).text : ''
    const removeCount = 1 + (idx > 0 && newParts[idx - 1].type === 'text' ? 1 : 0) + (idx < newParts.length - 1 && newParts[idx + 1].type === 'text' ? 1 : 0)
    const startIdx = idx > 0 && newParts[idx - 1].type === 'text' ? idx - 1 : idx
    newParts.splice(startIdx, removeCount, { type: 'text', text: before + after })
    setParts(newParts)
  }

  const q = (slashQuery ?? (showBrowseMenu ? '' : null))?.toLowerCase() ?? ''
  const isMenuOpen = editorFocused && (slashQuery !== null || showBrowseMenu)
  const filteredItems = q.length > 0 ? ALL_INSERTABLES.filter(it => it.label.toLowerCase().includes(q) || it.sub.toLowerCase().includes(q)) : (showBrowseMenu ? ALL_INSERTABLES : [])
  const filteredCategories = q.length === 0 ? SLASH_CATEGORIES : SLASH_CATEGORIES.filter(c => c.label.toLowerCase().includes(q))
  const isEmpty = parts.length === 1 && parts[0].type === 'text' && (parts[0] as { text: string }).text === ''

  return (
    <div style={{ position: 'relative', width: 420, paddingTop: 28 }} data-no-drag>
      {/* Blue tab */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 170, height: 52, borderRadius: `${radius.lg}px ${radius.lg}px 0 0`, background: color.primaryUltraLight, border: `1.5px solid ${color.primaryLight}`, borderBottom: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 6, left: 10, zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'default' }}>
        <Icon name="edit_note" size={16} color={color.primary} />
        <span style={{ fontSize: 13, fontWeight: 700, color: color.primary }}>Instrucción</span>
        <Icon name="expand_more" size={14} color={color.primary} />
      </div>
      {/* Card */}
      <div style={{ position: 'relative', zIndex: 1, background: 'white', borderRadius: radius.lg + 2, border: `1.5px solid ${color.grey200}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ position: 'absolute', left: -7, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', background: color.grey300, border: `2px solid white` }} />
        <div style={{ position: 'absolute', right: -7, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', background: color.grey300, border: `2px solid white` }} />
        {/* Node title + menu */}
        <NodeTitleBar title="Nodo de Instrucción:" onDelete={onDelete} />
        {/* Editor area */}
        <div style={{ padding: `${spacing.sm}px ${spacing.sm}px 0`, position: 'relative' }}>
          <div style={{ minHeight: 100, maxHeight: 240, overflowY: 'auto', padding: `${spacing.xSm}px ${spacing.sm}px`, border: `1px solid ${color.grey200}`, borderRadius: radius.md, background: color.grey50, fontFamily: font.family, fontSize: 14, color: color.grey800, lineHeight: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', alignContent: 'flex-start', gap: 0, cursor: 'text' }}
            onClick={() => { const last = inputRefs.current[inputRefs.current.length - 1]; last?.focus() }}
            onContextMenu={e => { e.preventDefault(); setShowBrowseMenu(m => !m); setSlashQuery(null) }}
          >
            {isEmpty && <span style={{ position: 'absolute', color: color.grey400, pointerEvents: 'none', fontSize: 14 }}>Escribe lo que deseas o escribe / para comandos...</span>}
            {parts.map((part, i) =>
              part.type === 'chip' ? (
                <InstructionChip key={i} chip={part.chip} onRemove={() => removeChip(i)} />
              ) : (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  value={part.text}
                  onChange={e => handleTextChange(i, e.target.value)}
                  onFocus={() => { setActiveTextIdx(i); setEditorFocused(true) }}
                  onBlur={() => setTimeout(() => setEditorFocused(false), 200)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: color.grey800, fontFamily: font.family, lineHeight: '28px', padding: 0, minWidth: 20, width: Math.max(20, part.text.length * 8.5 + 10), flexShrink: 0 }}
                />
              )
            )}
          </div>
          <div style={{ position: 'absolute', top: spacing.sm + 8, right: spacing.sm + 8, width: 24, height: 24, borderRadius: '50%', background: color.grey200, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="help_outline" size={16} color={color.grey500} />
          </div>
          {/* Slash menu — side panel attached to right of card */}
        </div>
        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', padding: `${spacing.xxSm}px ${spacing.sm}px`, borderTop: `1px solid ${color.grey100}` }}>
          <span style={{ fontSize: 11, color: color.grey400 }}>Click derecho o escribe <span style={{ fontWeight: 600 }}>/</span> para insertar acciones</span>
        </div>
        {/* Action config rows — each opens a drawer */}
        {addedActions.map(action => {
          const ac = CHIP_COLORS[action.type]
          return (
            <button key={action.id} onClick={() => setConfigDrawer(action)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: spacing.xxSm, padding: `${spacing.xSm}px ${spacing.sm}px`, borderTop: `1px solid ${color.grey100}`, border: 'none', borderBottom: 'none', borderLeft: 'none', borderRight: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = color.grey50)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 24, height: 24, borderRadius: radius.sm, background: ac.bg, border: `1px solid ${ac.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {action.type === 'mcp' ? <img src="/mcp-logo.png" style={{ width: 12, height: 12, opacity: 0.5 }} /> : <Icon name={action.type === 'integration' ? 'power' : action.type === 'code' ? 'code' : 'data_object'} size={13} color={ac.fg} />}
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: color.grey800 }}>Configuración {action.label}</span>
              <Icon name="chevron_right" size={16} color={color.grey400} />
            </button>
          )
        })}
      </div>
      {/* Side panel menu — right of card */}
      {isMenuOpen && (filteredCategories.length > 0 || filteredItems.length > 0) && (
        <div style={{ position: 'absolute', top: 28, left: '100%', marginLeft: spacing.xSm, width: 260, background: 'white', borderRadius: radius.lg, border: `1px solid ${color.borderDefault}`, boxShadow: shadow.medium, overflow: 'hidden', maxHeight: 400, overflowY: 'auto', animation: 'scaleIn 0.12s ease', zIndex: 20 }}>
          {/* Search */}
          <div style={{ padding: `${spacing.xxSm}px ${spacing.xSm}px`, borderBottom: `1px solid ${color.grey100}`, position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: radius.sm, background: color.grey50, border: `1px solid ${color.grey200}` }}>
              <Icon name="search" size={14} color={color.grey400} />
              <span style={{ fontSize: 12, color: color.grey400 }}>{slashQuery ? `/${slashQuery}` : 'Buscar acciones...'}</span>
            </div>
          </div>
          {/* Results */}
          {filteredItems.length > 0 && (
            <>
              <div style={{ padding: `6px ${spacing.xSm}px`, borderBottom: `1px solid ${color.grey100}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: color.grey400, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resultados</span>
              </div>
              {filteredItems.map(item => {
                const ic = CHIP_COLORS[item.type]
                return (
                  <button key={item.id} onClick={() => insertChip(item, showBrowseMenu)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: spacing.xxSm, padding: `6px ${spacing.xSm}px`, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = color.grey50)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: radius.sm, background: ic.bg, border: `1px solid ${ic.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.type === 'mcp' ? <img src="/mcp-logo.png" style={{ width: 12, height: 12, opacity: 0.5 }} /> : <Icon name={item.type === 'base' ? 'menu_book' : item.type === 'code' ? 'code' : item.type === 'integration' ? 'power' : 'data_object'} size={13} color={ic.fg} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: color.grey900 }}>{item.label}</div>
                      <div style={{ fontSize: 10, color: color.grey500 }}>{item.sub}</div>
                    </div>
                  </button>
                )
              })}
            </>
          )}
          {/* Categories */}
          {filteredCategories.length > 0 && (
            <>
              <div style={{ padding: `6px ${spacing.xSm}px`, borderBottom: `1px solid ${color.grey100}`, borderTop: filteredItems.length > 0 ? `1px solid ${color.grey100}` : 'none' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: color.grey400, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categorías</span>
              </div>
              {filteredCategories.map(item => (
                <button key={item.label}
                  onClick={() => { setSlashQuery(null); setShowBrowseMenu(false) }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: spacing.xxSm, padding: `8px ${spacing.xSm}px`, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = color.grey50)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: 28, height: 28, borderRadius: radius.md, background: item.bg, border: `1px solid ${item.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.isMcp ? <img src="/mcp-logo.png" style={{ width: 14, height: 14, opacity: 0.5 }} /> : <Icon name={item.icon} size={16} color={item.fg} />}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: color.grey900 }}>{item.label}</span>
                  <Icon name="chevron_right" size={16} color={color.grey400} />
                </button>
              ))}
            </>
          )}
        </div>
      )}
      {/* Config drawer */}
      {configDrawer && createPortal(
        <>
          <div onClick={() => setConfigDrawer(null)} style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(0,0,0,0.18)' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 8001, width: 380, background: 'white', boxShadow: '-4px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.22s ease' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${color.grey100}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: color.grey900 }}>Configuración {configDrawer.label}</span>
              <button onClick={() => setConfigDrawer(null)} style={{ width: 30, height: 30, borderRadius: 100, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500 }}
                onMouseEnter={e => { e.currentTarget.style.background = color.grey100 }} onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
              ><Icon name="close" size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: color.grey900, marginBottom: spacing.sm }}>Configuración de cuentas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xSm }}>
                <div>
                  <label style={{ fontSize: 12, color: color.grey600, display: 'block', marginBottom: 4 }}>Seleccionar cuenta</label>
                  <div style={{ display: 'flex', gap: spacing.xxSm }}>
                    <input defaultValue="leo@botmaker.io" style={{ flex: 1, padding: '8px 12px', borderRadius: radius.md, border: `1px solid ${color.borderDefault}`, fontSize: 13, color: color.grey800, outline: 'none', fontFamily: font.family }} />
                    <button style={{ width: 36, height: 36, borderRadius: radius.md, border: `1px solid ${color.borderDefault}`, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey500 }}><Icon name="sync" size={16} /></button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: color.grey600, display: 'block', marginBottom: 4 }}>Seleccionar calendario</label>
                  <div style={{ position: 'relative' }}>
                    <select defaultValue="Personal" style={{ width: '100%', padding: '8px 12px', borderRadius: radius.md, border: `1px solid ${color.borderDefault}`, fontSize: 13, color: color.grey800, outline: 'none', fontFamily: font.family, appearance: 'none', background: 'white' }}>
                      <option>Personal</option>
                      <option>Trabajo</option>
                      <option>Equipo</option>
                    </select>
                    <Icon name="expand_more" size={16} color={color.grey500} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${color.grey100}`, display: 'flex', justifyContent: 'flex-end', gap: spacing.xSm, flexShrink: 0 }}>
              <button onClick={() => setConfigDrawer(null)} style={{ padding: '8px 20px', borderRadius: 100, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: color.primary, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => setConfigDrawer(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 100, border: 'none', background: color.primary, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}
              ><Icon name="save" size={14} /> Guardar</button>
            </div>
          </div>
        </>, document.body
      )}
    </div>
  )
}

function FlowEmptyState({ triggerLabel }: { triggerLabel: string }) {
  const [showMenu, setShowMenu] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [addedNode, setAddedNode] = useState<string | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleAddNode = (type: string) => { setAddedNode(type); setShowMenu(false); setContextMenu(null) }

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, textarea, input, [data-no-drag]')) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setPan({ x: dragStart.current.panX + e.clientX - dragStart.current.x, y: dragStart.current.panY + e.clientY - dragStart.current.y })
  }
  const onMouseUp = () => setDragging(false)

  const onDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, textarea, input, [data-no-drag]')) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    setContextMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div ref={canvasRef}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onDoubleClick={onDoubleClick}
      style={{ flex: 1, background: `radial-gradient(circle, ${color.grey300} 1px, transparent 1px)`, backgroundSize: '24px 24px', backgroundPosition: `${pan.x}px ${pan.y}px`, overflow: 'hidden', position: 'relative', cursor: dragging ? 'grabbing' : 'grab' }}
    >
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translate(${pan.x}px, ${pan.y}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {/* Trigger pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xxSm, padding: `${spacing.xSm}px ${spacing.sm}px`, borderRadius: radius.xlg, background: color.primaryUltraLight, border: `1.5px solid ${color.primaryLight}`, cursor: 'default' }}>
            <Icon name="chat" size={16} color={color.primary} />
            <span style={{ fontSize: 13, fontWeight: 600, color: color.primary }}>{triggerLabel}</span>
          </div>
          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 48, height: 2, background: color.grey300 }} />
            <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `7px solid ${color.grey300}` }} />
          </div>
          {/* Node or add button */}
          {addedNode === 'instruction' ? (
            <InstructionNode onDelete={() => setAddedNode(null)} />
          ) : addedNode === 'loop' ? (
            <LoopNode onDelete={() => setAddedNode(null)} />
          ) : (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: spacing.xxSm }} data-no-drag>
              <button onClick={() => setShowMenu(m => !m)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px 8px 10px', borderRadius: 100, border: `2px dashed ${showMenu ? color.primary : color.grey300}`, background: showMenu ? color.primaryUltraLight : 'white', cursor: 'pointer', color: showMenu ? color.primary : color.grey500, transition: 'all 0.15s', fontSize: 13, fontWeight: 500 }}
                onMouseEnter={e => { if (!showMenu) { e.currentTarget.style.borderColor = color.primaryLight; e.currentTarget.style.color = color.primary; e.currentTarget.style.background = color.primaryUltraLight } }}
                onMouseLeave={e => { if (!showMenu) { e.currentTarget.style.borderColor = color.grey300; e.currentTarget.style.color = color.grey500; e.currentTarget.style.background = 'white' } }}
              ><Icon name="add" size={18} /> Agregar nodo</button>
              {showMenu && <AddNodeMenu onSelect={handleAddNode} />}
            </div>
          )}
        </div>
      </div>
      {/* Double-click context menu */}
      {contextMenu && (
        <>
          <div onClick={() => setContextMenu(null)} style={{ position: 'absolute', inset: 0, zIndex: 14 }} />
          <div style={{ position: 'absolute', left: contextMenu.x, top: contextMenu.y, zIndex: 15 }}>
            <AddNodeMenu onSelect={handleAddNode} />
          </div>
        </>
      )}
      {/* Add node floating button — top right */}
      <div style={{ position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 5 }}>
        <div style={{ position: 'relative' }} data-no-drag>
          <button onClick={() => setShowMenu(m => !m)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px', borderRadius: 100, border: 'none', background: color.primary, color: 'white', cursor: 'pointer', boxShadow: '0 4px 16px rgba(48,79,254,0.3)', transition: 'all 0.25s ease', overflow: 'hidden', width: 44, whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.width = '170px'; e.currentTarget.style.padding = '10px 18px 10px 12px'; (e.currentTarget.lastChild as HTMLElement).style.opacity = '1' }}
            onMouseLeave={e => { if (!showMenu) { e.currentTarget.style.width = '44px'; e.currentTarget.style.padding = '10px'; (e.currentTarget.lastChild as HTMLElement).style.opacity = '0' } }}
          >
            <Icon name="add" size={22} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, opacity: 0, transition: 'opacity 0.15s ease 0.1s' }}>Agregar nodo</span>
          </button>
          {showMenu && !contextMenu && <AddNodeMenu onSelect={handleAddNode} />}
        </div>
      </div>
      <FlowCanvasToolbar />
      {/* Hint */}
      {!addedNode && (
        <div style={{ position: 'absolute', bottom: 56, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: spacing.xxSm, padding: '6px 14px', borderRadius: 100, background: 'white', border: `1px solid ${color.borderSubtle}`, boxShadow: shadow.small, zIndex: 4 }}>
          <Icon name="ads_click" size={14} color={color.grey400} />
          <span style={{ fontSize: 11, color: color.grey500 }}>Doble click en el canvas para agregar un nodo</span>
        </div>
      )}
    </div>
  )
}

// Trigger run timeline — the "razonamiento del sistema" pattern.
// Each step represents a node, condition or action that the trigger executed,
// with optional indented sub-steps (actions invoked from within a node).
type StepKind = 'node' | 'condition' | 'action'
interface ExecStep { kind: StepKind; label: string; indent?: boolean; durationMs: number }

const TRIGGER_RUN_SEQUENCE: ExecStep[] = [
  { kind: 'node',      label: 'Ejecutó nodo "Leer spresheets"',                   durationMs: 700 },
  { kind: 'action',    label: 'Ejecutó accion "Get Row in Sheet"',  indent: true, durationMs: 500 },
  { kind: 'condition', label: 'Ejecutó condicional "Ya es cliente?"',             durationMs: 450 },
  { kind: 'node',      label: 'Ejecutó nodo "Enviar mail con invitacion"',        durationMs: 800 },
  { kind: 'action',    label: 'Ejecutó accion "Create Event"',      indent: true, durationMs: 600 },
  { kind: 'action',    label: 'Ejecutó acción "Send Email"',        indent: true, durationMs: 550 },
  { kind: 'condition', label: 'Ejecutando condicional "Ya es cliente?"',          durationMs: 700 },
]

const KIND_VISUAL: Record<StepKind, { icon: string; color: string; bg: string }> = {
  node:      { icon: 'description',  color: '#304FFE', bg: '#EEF1FF' },
  condition: { icon: 'fork_right',   color: '#F59E0B', bg: '#FEF3C7' },
  action:    { icon: 'bolt',         color: '#10B981', bg: '#DCFCE7' },
}

function DisparadorCanvasView({ disparador, onBack }: { disparador: Disparador; onBack: () => void }) {
  const [showDrawer, setShowDrawer] = useState(true)
  // -1 = nothing started yet. Otherwise the index of the currently running step.
  // Steps with index < currentStep are "done"; equal is "running"; greater is pending.
  const [currentStep, setCurrentStep] = useState(0)
  const [runId, setRunId] = useState(0)   // bumping this restarts the sequence
  const cancelRef = useRef(false)

  const startRun = () => {
    cancelRef.current = false
    setCurrentStep(0)
    setRunId(id => id + 1)
    setShowDrawer(true)
  }

  // Drive the sequence: when currentStep changes (and we're not done), schedule
  // its completion based on its durationMs.
  useEffect(() => {
    cancelRef.current = false
    if (currentStep >= TRIGGER_RUN_SEQUENCE.length) return
    const step = TRIGGER_RUN_SEQUENCE[currentStep]
    const t = setTimeout(() => {
      if (cancelRef.current) return
      setCurrentStep(s => s + 1)
    }, step.durationMs)
    return () => { cancelRef.current = true; clearTimeout(t) }
    // runId resets the sequence; intentionally tracked alongside currentStep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, runId])

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', position: 'relative' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: showDrawer ? 340 : 0, zIndex: 5, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 100, background: 'white', border: `1px solid ${color.borderDefault}`, fontSize: 12, fontWeight: 500, color: color.grey600, cursor: 'pointer', boxShadow: shadow.small }}
          ><Icon name="arrow_back" size={13} /> Disparadores</button>
          <span style={{ fontSize: 13, fontWeight: 600, color: color.grey800, background: 'white', padding: '4px 10px', borderRadius: 100, boxShadow: shadow.small, border: `1px solid ${color.borderSubtle}` }}>{disparador.name}</span>
          <div style={{ flex: 1 }} />
          {!showDrawer && (
            <button onClick={() => setShowDrawer(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, background: 'white', border: `1px solid ${color.borderDefault}`, fontSize: 12.5, fontWeight: 600, color: color.grey700, cursor: 'pointer', boxShadow: shadow.small }}
            ><Icon name="terminal" size={14} /> Probar disparador</button>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <DrawerProvider>
            <ReactFlowProvider>
              <AutomationCanvas />
            </ReactFlowProvider>
          </DrawerProvider>
        </div>
      </div>

      {showDrawer && (
        <div style={{ width: 340, flexShrink: 0, background: 'white', borderLeft: `1.5px solid ${color.borderDefault}`, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.22s ease', zIndex: 6 }}>

          {/* Header */}
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${color.grey100}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: color.grey900 }}>Probar disparador</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={startRun}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, border: `1px solid ${color.primary}`, background: 'white', fontSize: 12, fontWeight: 600, color: color.primary, cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}
              ><Icon name="play_arrow" size={13} /> Reiniciar</button>
              <button onClick={() => setShowDrawer(false)}
                style={{ width: 26, height: 26, borderRadius: 100, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey400 }}
                onMouseEnter={e => { e.currentTarget.style.background = color.grey100; e.currentTarget.style.color = color.grey700 }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = color.grey400 }}
              ><Icon name="close" size={14} /></button>
            </div>
          </div>

          {/* Body — system reasoning timeline */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: color.grey900 }}>Razonamiento del sistema</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TRIGGER_RUN_SEQUENCE.map((step, i) => {
                const status: 'pending' | 'running' | 'done' =
                  i < currentStep ? 'done' : i === currentStep ? 'running' : 'pending'
                const visual = KIND_VISUAL[step.kind]
                const muted  = status === 'pending'
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    paddingLeft: step.indent ? 22 : 0,
                    opacity: muted ? 0.45 : 1,
                    transition: 'opacity 0.2s',
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: visual.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={visual.icon} size={13} color={visual.color} />
                    </span>
                    <span style={{
                      flex: 1, minWidth: 0,
                      fontSize: 12.5, lineHeight: 1.4,
                      color: muted ? color.grey500 : color.grey900,
                      fontWeight: status === 'running' ? 600 : 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {step.label}
                    </span>
                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>
                      {status === 'done'    && <Icon name="check_circle" size={16} color={color.success} filled />}
                      {status === 'running' && (
                        <span style={{
                          width: 14, height: 14, borderRadius: '50%',
                          border: `2px solid ${color.primaryLight}`,
                          borderTopColor: color.primary,
                          animation: 'spin 0.9s linear infinite',
                        }} />
                      )}
                    </span>
                  </div>
                )
              })}
            </div>

            {currentStep >= TRIGGER_RUN_SEQUENCE.length && (
              <div style={{ marginTop: 'auto', padding: '10px 12px', borderRadius: radius.md, background: color.successLight, color: color.successDark, fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="check_circle" size={16} color={color.successDark} filled />
                Disparador completado sin errores
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Collaborative presence ───────────────────────────────────────────────────

interface OnlineUser {
  id: string
  name: string
  initials: string
  color: string
  tab: Tab
}

const ONLINE_USERS: OnlineUser[] = [
  { id: 'u1', name: 'Lucía Fernández', initials: 'LF', color: '#673AB7', tab: 'subagentes' },
  { id: 'u2', name: 'Tomás Ruiz', initials: 'TR', color: '#02C66A', tab: 'mcps' },
  { id: 'u3', name: 'Martín García', initials: 'MG', color: '#F5A623', tab: 'subagentes' },
  { id: 'u4', name: 'Carla Romero', initials: 'CR', color: '#00BCD4', tab: 'bases' },
]

function PresenceAvatar({ user, size = 28, border = true, showTooltip = false }: { user: OnlineUser; size?: number; border?: boolean; showTooltip?: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', width: size, height: size, borderRadius: '50%', background: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: 'white', border: border ? '2px solid white' : 'none', cursor: 'default', flexShrink: 0, boxSizing: 'content-box' }}
    >
      {user.initials}
      {/* Online dot */}
      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, borderRadius: '50%', background: '#02C66A', border: '1.5px solid white' }} />
      {/* Tooltip */}
      {showTooltip && hover && (
        <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6, background: color.grey900, color: 'white', fontSize: 11, fontWeight: 500, padding: '4px 8px', borderRadius: radius.sm, whiteSpace: 'nowrap', zIndex: 100, fontFamily: font.family }}>
          {user.name}
        </div>
      )}
    </div>
  )
}

function TabPresenceInline({ users }: { users: OnlineUser[] }) {
  if (users.length === 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {users.map((u, i) => (
          <div key={u.id} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: users.length - i }}>
            <PresenceAvatar user={u} size={24} showTooltip />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AgentDetail({ initialTab, variant = 'v1' }: { initialTab?: string; variant?: 'v1' | 'v2' }) {
  const [activeTab, setActiveTab] = useState<Tab>((initialTab as Tab) || 'mcps')
  const [activeSubAgent, setActiveSubAgent] = useState<SubAgent | null>(null)
  const [activeDisparador, setActiveDisparador] = useState<Disparador | null>(null)
  const [agentConfig, setAgentConfig] = useState(AGENT)
  const [showHistorial, setShowHistorial] = useState(false)
  // Snapshot of the version currently being previewed in read-only mode.
  // Lives at the editor level (not inside HistorialSidebar) so the banner
  // persists when the drawer is closed and re-opened.
  const [viewingVersion, setViewingVersion] = useState<HistVersion | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [testingLogic, setTestingLogic] = useState<SubAgent | null>(null)

  const inSubagentCanvas = activeTab === 'subagentes' && activeSubAgent !== null
  const inDisparadorCanvas = activeTab === 'automatizaciones' && activeDisparador !== null
  const inCanvas = inSubagentCanvas || inDisparadorCanvas

  const handleSelectSubAgent = (sa: SubAgent) => setActiveSubAgent(sa)
  const handleSelectDisparador = (d: Disparador) => setActiveDisparador(d)
  const handleTabChange = (tab: Tab) => { setActiveTab(tab); if (tab !== 'subagentes') setActiveSubAgent(null); if (tab !== 'automatizaciones') setActiveDisparador(null) }

  return (
    <div style={{ height: '100vh', background: color.bgAI, fontFamily: font.family, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Top menu ── */}
      <AgentsTopBar onToggleSidebar={() => setShowSidebar(s => !s)} />

      {/* ── Body: sidebar + main panel ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

      {/* ── Sidebar (shared with /proyecto orchestrator pane) ── */}
      <AgentsListSidebar collapsed={!showSidebar} onToggle={() => setShowSidebar(s => !s)} />

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Agent header ── */}
      <div style={{ background: 'white', padding: `${spacing.xSm}px ${spacing.xBig}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: `1px solid ${color.borderSubtle}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xSm }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: color.primaryUltraLight, border: `1.5px solid ${color.primaryLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/avatar-ai.svg" style={{ width: 18, height: 18, filter: 'brightness(0) saturate(100%) invert(23%) sepia(93%) saturate(7484%) hue-rotate(234deg) brightness(101%) contrast(101%)' }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: color.grey900 }}>{agentConfig.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xSm }}>
          {/* Collaborators — current user (big, outside pill) + others in pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm }}>
            {/* Current user — larger avatar with colored ring */}
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2.5px solid ${color.primary}`, padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: color.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', fontFamily: font.family }}>GT</div>
            </div>
            {/* Others pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm, background: color.grey100, borderRadius: 100, padding: '4px 12px 4px 4px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {ONLINE_USERS.slice(0, 2).map((u, i) => (
                  <div key={u.id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: ONLINE_USERS.length - i, position: 'relative' }}>
                    <PresenceAvatar user={u} size={26} showTooltip border />
                  </div>
                ))}
                {ONLINE_USERS.length > 2 && (
                  <div style={{ marginLeft: -8, zIndex: 0, width: 26, height: 26, borderRadius: '50%', background: color.grey200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: color.grey700, border: '2px solid white', fontFamily: font.family, boxSizing: 'content-box' }}>
                    {ONLINE_USERS[2].initials}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: text.paragraphSm.size, fontWeight: font.bold, color: color.primary, fontFamily: font.family }}>{ONLINE_USERS.length}</span>
                <Icon name="expand_more" size={14} color={color.grey500} />
              </div>
            </div>
          </div>
          <button onClick={() => setShowHistorial(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, border: `1px solid ${color.primary}`, background: showHistorial ? color.primaryUltraLight : 'white', color: color.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)} onMouseLeave={e => { if (!showHistorial) e.currentTarget.style.background = 'white' }}
          ><Icon name="schedule" size={13} /> Historial</button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, border: 'none', background: color.primary, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          ><Icon name="upload" size={13} /> Publicar</button>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      {!inCanvas && (
        <div style={{ background: 'white', borderBottom: `1px solid ${color.borderSubtle}`, height: 44, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 4, flexShrink: 0, zIndex: 9 }}>
          {TABS.filter(tab => !(variant === 'v2' && (tab.id === 'codigo' || tab.id === 'apps'))).map(tab => {
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 100, border: 'none', cursor: 'pointer', background: active ? color.primaryUltraLight : 'transparent', color: active ? color.primary : color.grey600, fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all 0.12s' }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = color.grey50; e.currentTarget.style.color = color.grey800 } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color.grey600 } }}
              >{tab.isMcp ? <img src="/mcp-logo.png" style={{ width: 16, height: 16, objectFit: 'contain', opacity: active ? 1 : 0.5 }} /> : tab.icon === 'ai-agent' ? <img src="/avatar-ai.svg" style={{ width: 16, height: 16, opacity: active ? 1 : 0.5, filter: active ? 'brightness(0) saturate(100%) invert(23%) sepia(93%) saturate(7484%) hue-rotate(234deg) brightness(101%) contrast(101%)' : undefined }} /> : <Icon name={tab.icon} size={16} />} {tab.label}</button>
            )
          })}
        </div>
      )}

      {/* ── Content ── */}
      {inDisparadorCanvas && activeDisparador ? (
        <DisparadorCanvasView disparador={activeDisparador} onBack={() => setActiveDisparador(null)} />
      ) : inSubagentCanvas ? (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Canvas top bar */}
          <div style={{ background: 'white', borderBottom: `1px solid ${color.borderSubtle}`, padding: `${spacing.xxSm}px ${spacing.sm}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm }}>
              <button onClick={() => setActiveSubAgent(null)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: radius.sm, background: 'transparent', border: 'none', fontSize: 12, fontWeight: 500, color: color.grey600, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = color.grey100)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              ><Icon name="arrow_back" size={14} /></button>
              {activeSubAgent && <span style={{ fontSize: 14, fontWeight: 600, color: color.grey900 }}>{activeSubAgent.name}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xxSm }}>
              <button
                onClick={() => activeSubAgent && setTestingLogic(activeSubAgent)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, border: `1px solid ${color.borderDefault}`, background: 'white', fontSize: 12, fontWeight: 600, color: color.grey700, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = color.grey50)} onMouseLeave={e => (e.currentTarget.style.background = 'white')}
              ><Icon name="play_arrow" size={14} /> Probar proceso</button>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: color.grey200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: color.grey600 }}>Cr</span>
              </div>
              <div style={{ position: 'relative', width: 160 }}>
                <Icon name="search" size={14} color={color.grey400} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
                <input placeholder="Buscar ..." style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px 6px 28px', borderRadius: radius.sm, border: `1px solid ${color.borderDefault}`, fontSize: 12, color: color.grey800, outline: 'none', background: color.grey50, fontFamily: font.family }} />
              </div>
            </div>
          </div>
          {/* Canvas body */}
          {activeSubAgent && activeSubAgent.nodeCount === 0 ? (
            <FlowEmptyState triggerLabel="Inicio desde conversación" />
          ) : (
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <DrawerProvider>
                <ReactFlowProvider>
                  <AutomationCanvas />
                </ReactFlowProvider>
              </DrawerProvider>
            </div>
          )}
        </div>
      ) : (
        <main style={{
          flex: 1, overflow: activeTab === 'estados' ? 'hidden' : 'auto',
          padding: activeTab === 'estados' ? 0 : '28px 36px 80px',
          background: activeTab === 'estados' ? '#F8FAFC' : 'transparent',
          position: 'relative',
        }}>
          {activeTab === 'estados' ? (
            variant === 'v2'
              ? <WorkflowCanvas onOpenKanban={() => { window.location.href = '/kanban' }} initialVariant="unified" onToggleSidebar={() => setShowSidebar(s => !s)} agentName={agentConfig.name} />
              : <WorkflowCanvas onOpenKanban={() => { window.location.href = '/kanban' }} onToggleSidebar={() => setShowSidebar(s => !s)} agentName={agentConfig.name} />
          ) : (activeTab === 'mcps' || activeTab === 'apps' || activeTab === 'codigo' || activeTab === 'bases' || activeTab === 'subagentes' || activeTab === 'automatizaciones') ? (
            <>
              {activeTab === 'mcps'             && <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>{variant === 'v2' ? <MCPListV2 /> : <ResourceListTab kind="mcp"  />}</div>}
              {activeTab === 'apps'             && <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>{variant === 'v2' ? <ResourceListTabV2 kind="app"  /> : <ResourceListTab kind="app"  />}</div>}
              {activeTab === 'codigo'           && <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>{variant === 'v2' ? <ResourceListTabV2 kind="code" /> : <ResourceListTab kind="code" />}</div>}
              {activeTab === 'bases'            && <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>{variant === 'v2' ? <BasesTabV2 /> : <BasesTab />}</div>}
              {activeTab === 'subagentes'       && <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>{variant === 'v2' ? <SubagentesTabV2 onSelect={handleSelectSubAgent} onTest={setTestingLogic} /> : <SubagentesTab onSelect={handleSelectSubAgent} onTest={setTestingLogic} />}</div>}
              {activeTab === 'automatizaciones' && <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>{variant === 'v2' ? <DisparadoresTabV2 onSelect={handleSelectDisparador} /> : <DisparadoresTab onSelect={handleSelectDisparador} />}</div>}
            </>
          ) : (
            <div style={{ maxWidth: 780, margin: '0 auto' }}>
              {activeTab === 'perfil' && <ConfiguracionTab agent={agentConfig} onChange={patch => setAgentConfig(prev => ({ ...prev, ...patch }))} />}
            </div>
          )}
        </main>
      )}

      </div>{/* end right panel */}
      </div>{/* end body */}

      {showHistorial && (
        <HistorialSidebar
          onClose={() => setShowHistorial(false)}
          initialSelectedId={viewingVersion?.id ?? null}
          onSelectionChange={setViewingVersion}
        />
      )}

      {testingLogic && (
        <LogicTestChat
          logic={{ id: testingLogic.id, name: testingLogic.name, description: testingLogic.description, trigger: testingLogic.trigger }}
          onClose={() => setTestingLogic(null)}
        />
      )}

      {/* Read-only floating banner — lives at editor level so it survives the
          historial drawer being closed/reopened. Slides toward the canvas
          centre when the drawer is open (right offset 370). */}
      {viewingVersion && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 80,
            left: 0,
            right: showHistorial ? 370 : 0,
            zIndex: 7100,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            transition: 'right 0.2s ease',
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing.sm,
              padding: `${spacing.xxSm}px ${spacing.xSm}px ${spacing.xxSm}px ${spacing.sm}px`,
              background: 'white',
              border: `1px solid ${color.grey200}`,
              borderRadius: 100,
              boxShadow: '0 8px 28px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.06)',
              fontFamily: font.family,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: color.warningLight, flexShrink: 0 }}>
              <Icon name="visibility" size={15} color={color.warningDark} />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, paddingRight: spacing.xxSm }}>
              <span style={{ fontSize: text.paragraphSm.size, fontWeight: font.bold, color: color.grey900 }}>
                Modo lectura
              </span>
              <span style={{ fontSize: text.paragraphXs.size, color: color.grey500 }}>
                Viendo {viewingVersion.label ?? `Versión ${viewingVersion.id}`} · v{viewingVersion.id}
                {viewingVersion.env === 'produccion' && ' (producción)'}
              </span>
            </div>
            <div style={{ width: 1, height: 24, background: color.grey200, flexShrink: 0 }} />
            <button
              onClick={() => setViewingVersion(null)}
              style={{ padding: `6px ${spacing.sm}px`, borderRadius: 100, cursor: 'pointer', fontSize: text.paragraphXs.size, fontWeight: font.medium, fontFamily: font.family, display: 'inline-flex', alignItems: 'center', gap: spacing.xxxSm, border: `1px solid ${color.grey300}`, background: 'white', color: color.grey800 }}
              title="Volver a tu borrador y salir del modo lectura"
              onMouseEnter={e => { e.currentTarget.style.background = color.grey50 }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
            >
              <Icon name="arrow_back" size={13} color={color.grey600} />Volver al borrador
            </button>
            <button
              onClick={() => setViewingVersion(null)}
              style={{ padding: `6px ${spacing.sm}px`, borderRadius: 100, cursor: 'pointer', fontSize: text.paragraphXs.size, fontWeight: font.medium, fontFamily: font.family, display: 'inline-flex', alignItems: 'center', gap: spacing.xxxSm, border: `1px solid ${color.primary}`, background: 'white', color: color.primary }}
              title="Reemplazar el borrador con esta versión"
              onMouseEnter={e => { e.currentTarget.style.background = color.primaryUltraLight }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
            >
              <Icon name="content_copy" size={13} color={color.primary} />Aplicar en borrador
            </button>
            {viewingVersion.env === 'produccion' ? (
              <span style={{ padding: `6px ${spacing.sm}px`, borderRadius: 100, fontSize: text.paragraphXs.size, fontWeight: font.medium, fontFamily: font.family, display: 'inline-flex', alignItems: 'center', gap: spacing.xxxSm, background: color.successLight, color: color.successDark, border: `1px solid ${color.successLight}` }}>
                <Icon name="check_circle" size={13} color={color.successDark} />Activa en producción
              </span>
            ) : (
              <button
                onClick={() => setViewingVersion(null)}
                style={{ padding: `6px ${spacing.sm}px`, borderRadius: 100, cursor: 'pointer', fontSize: text.paragraphXs.size, fontWeight: font.medium, fontFamily: font.family, display: 'inline-flex', alignItems: 'center', gap: spacing.xxxSm, border: 'none', background: color.primary, color: 'white' }}
                onMouseEnter={e => { e.currentTarget.style.background = color.primaryMidDark }}
                onMouseLeave={e => { e.currentTarget.style.background = color.primary }}
              >
                <Icon name="rocket_launch" size={13} color="white" />Publicar en producción
              </button>
            )}
          </div>
        </div>,
        document.body,
      )}

      {/* Figma capture button */}
      <button
        onClick={() => {
          const w = window as any
          if (w.figma && w.figma.captureForDesign) {
            const id = `cap-${Date.now()}`
            w.figma.captureForDesign({ captureId: id, endpoint: `https://mcp.figma.com/mcp/capture/${id}/submit`, selector: 'body' })
            alert('Captura enviada a Figma. Usá el captureId:\n' + id)
          } else {
            alert('El script de captura de Figma no está cargado.')
          }
        }}
        style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 100, border: 'none', background: color.grey900, color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', opacity: 0.7, transition: 'opacity 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
      ><Icon name="send" size={13} /> Send to Figma</button>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.93); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
