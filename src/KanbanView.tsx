import { useState } from 'react'
import { ArrowLeft, ChevronRight, Plus, MessageSquare, Clock, User } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Column {
  id: string
  name: string
  color: string
}

interface Ticket {
  id: string
  columnId: string
  customer: string
  preview: string
  channel: string
  channelIcon: string
  ago: string
  assignee?: string
  unread?: boolean
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const COLUMNS: Column[] = [
  { id: 's1', name: 'Nuevo',         color: '#64748b' },
  { id: 's2', name: 'Consultando',   color: '#0891b2' },
  { id: 's3', name: 'Pedido tomado', color: '#304FFE' },
  { id: 's4', name: 'Confirmado',    color: '#16a34a' },
  { id: 's5', name: 'Entregado',     color: '#16a34a' },
]

const INITIAL_TICKETS: Ticket[] = [
  // Nuevo
  { id: 't1', columnId: 's1', customer: 'Juan Pérez',      preview: 'Hola, ¿tienen pizza de ananá?',                  channel: 'WhatsApp',  channelIcon: '💬', ago: 'ahora',    unread: true },
  { id: 't2', columnId: 's1', customer: 'Lucía Ramírez',   preview: 'Quiero saber los horarios de entrega',             channel: 'Instagram', channelIcon: '📸', ago: '2 min',    unread: true },
  { id: 't3', columnId: 's1', customer: 'Diego Fernández', preview: '¿Tienen promo para llevar?',                       channel: 'WhatsApp',  channelIcon: '💬', ago: '5 min' },
  // Consultando
  { id: 't4', columnId: 's2', customer: 'María López',     preview: 'Sí, quiero la familiar con extra queso...',        channel: 'WhatsApp',  channelIcon: '💬', ago: '8 min',    assignee: 'Bot' },
  { id: 't5', columnId: 's2', customer: 'Roberto Silva',   preview: '¿Cuánto tarda un pedido a Palermo?',               channel: 'WhatsApp',  channelIcon: '💬', ago: '12 min',   assignee: 'Bot' },
  // Pedido tomado
  { id: 't6', columnId: 's3', customer: 'Ana González',    preview: '2x Margarita + 1x Napolitana. Efectivo.',          channel: 'WhatsApp',  channelIcon: '💬', ago: '15 min',   assignee: 'Carlos' },
  { id: 't7', columnId: 's3', customer: 'Sofía Castro',    preview: 'Pizza muzarela grande y empanadas x6.',            channel: 'Instagram', channelIcon: '📸', ago: '20 min',   assignee: 'Carlos' },
  { id: 't8', columnId: 's3', customer: 'Pablo Morales',   preview: '1x Cuatro Quesos. Paga con MP.',                   channel: 'WhatsApp',  channelIcon: '💬', ago: '23 min',   assignee: 'Bot' },
  // Confirmado
  { id: 't9',  columnId: 's4', customer: 'Elena Torres',   preview: 'Pedido #4821 confirmado. En camino.',              channel: 'WhatsApp',  channelIcon: '💬', ago: '31 min',   assignee: 'Repartidor 1' },
  { id: 't10', columnId: 's4', customer: 'Marco Ruiz',     preview: 'Pedido #4820 en preparación.',                    channel: 'WhatsApp',  channelIcon: '💬', ago: '35 min',   assignee: 'Cocina' },
  // Entregado
  { id: 't11', columnId: 's5', customer: 'Valentina Díaz', preview: '¡Gracias! Todo perfecto como siempre 🙌',          channel: 'WhatsApp',  channelIcon: '💬', ago: '48 min' },
  { id: 't12', columnId: 's5', customer: 'Matías Suárez',  preview: 'Entregado. ¿Podés mandar la factura?',             channel: 'WhatsApp',  channelIcon: '💬', ago: '1h' },
]

// ── TicketCard ─────────────────────────────────────────────────────────────────

function TicketCard({
  ticket,
  columnColor,
  onMove,
  columns,
}: {
  ticket: Ticket
  columnColor: string
  onMove: (ticketId: string, newColumnId: string) => void
  columns: Column[]
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: 12,
        border: `1px solid ${hovered ? columnColor + '44' : '#E8EEFF'}`,
        padding: '12px 14px',
        cursor: 'pointer',
        boxShadow: hovered
          ? `0 4px 16px ${columnColor}18`
          : '0 1px 4px rgba(48,79,254,0.04)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >
      {/* Unread dot */}
      {ticket.unread && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          width: 7, height: 7, borderRadius: '50%',
          background: '#304FFE',
          boxShadow: '0 0 0 2px white',
        }} />
      )}

      {/* Customer + channel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: columnColor + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: columnColor, flexShrink: 0,
        }}>
          {ticket.customer[0]}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ticket.customer}
        </span>
        <span style={{ fontSize: 11 }}>{ticket.channelIcon}</span>
      </div>

      {/* Preview */}
      <p style={{
        margin: '0 0 8px', fontSize: 11, color: '#64748b',
        lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {ticket.preview}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
          <Clock size={9} style={{ color: '#cbd5e1' }} />
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{ticket.ago}</span>
        </div>
        {ticket.assignee && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <User size={9} style={{ color: '#cbd5e1' }} />
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{ticket.assignee}</span>
          </div>
        )}

        {/* Move dropdown */}
        <select
          value={ticket.columnId}
          onChange={e => { e.stopPropagation(); onMove(ticket.id, e.target.value) }}
          onClick={e => e.stopPropagation()}
          style={{
            fontSize: 10, color: '#94a3b8',
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '1px 2px', outline: 'none', maxWidth: 90,
          }}
        >
          {columns.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ── Column ─────────────────────────────────────────────────────────────────────

function KanbanColumn({
  column,
  tickets,
  onMove,
  allColumns,
}: {
  column: Column
  tickets: Ticket[]
  onMove: (ticketId: string, newColumnId: string) => void
  allColumns: Column[]
}) {
  return (
    <div style={{
      width: 220,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      {/* Column header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 4px 10px',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: column.color, flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', flex: 1 }}>
          {column.name}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: column.color,
          background: column.color + '18',
          padding: '1px 7px', borderRadius: 100,
        }}>
          {tickets.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        minHeight: 80,
      }}>
        {tickets.map(t => (
          <TicketCard
            key={t.id}
            ticket={t}
            columnColor={column.color}
            onMove={onMove}
            columns={allColumns}
          />
        ))}
      </div>

      {/* Add ticket */}
      <button style={{
        marginTop: 10,
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 10px', borderRadius: 100,
        border: '1px dashed #C7D0FF', background: 'transparent',
        fontSize: 11, color: '#94a3b8', cursor: 'pointer',
        transition: 'all 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.color = '#304FFE'; e.currentTarget.style.borderColor = '#304FFE' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#C7D0FF' }}
      >
        <Plus size={11} /> Nuevo ticket
      </button>
    </div>
  )
}

// ── KanbanView ─────────────────────────────────────────────────────────────────

export default function KanbanView() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS)

  const moveTicket = (ticketId: string, newColumnId: string) =>
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, columnId: newColumnId } : t))

  const totalUnread = tickets.filter(t => t.unread).length

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FF', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        background: 'white', borderBottom: '1px solid #E2E7FF', padding: '0 32px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 4px rgba(48,79,254,0.06)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => { window.location.href = '/agente' }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E7FF',
              background: 'white', fontSize: 12, fontWeight: 500, color: '#64748b', cursor: 'pointer',
            }}
          >
            <ArrowLeft size={13} /> Toma de Pedidos
          </button>
          <ChevronRight size={14} style={{ color: '#e2e8f0' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Kanban operativo</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>· Bella Italia</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {totalUnread > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 100,
              background: '#EEF0FF', border: '1px solid #C7D0FF',
              fontSize: 11, fontWeight: 600, color: '#304FFE',
            }}>
              <MessageSquare size={11} />
              {totalUnread} sin leer
            </span>
          )}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 100,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            fontSize: 11, fontWeight: 600, color: '#16a34a',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            En vivo
          </span>
        </div>
      </header>

      {/* Board */}
      <main style={{
        flex: 1, overflowX: 'auto', overflowY: 'auto',
        padding: '28px 32px 60px',
      }}>
        <div style={{
          display: 'flex', gap: 16, alignItems: 'flex-start',
          minWidth: 'max-content',
        }}>
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              tickets={tickets.filter(t => t.columnId === col.id)}
              onMove={moveTicket}
              allColumns={COLUMNS}
            />
          ))}
        </div>
      </main>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}
