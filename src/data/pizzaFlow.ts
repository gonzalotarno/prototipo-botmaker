import type { Node, Edge } from '@xyflow/react'
import type { NodeData } from '../types'
import { INTEGRATIONS } from './integrations'
import type { Integration } from '../types'

const gs   = INTEGRATIONS.find(i => i.id === 'google-sheets')!
const gmail = INTEGRATIONS.find(i => i.id === 'gmail')!
const gcal  = INTEGRATIONS.find(i => i.id === 'google-calendar')!
const mp    = INTEGRATIONS.find(i => i.id === 'mercadopago')!
const fetch = INTEGRATIONS.find(i => i.id === 'mcp-fetch')!

/** Inline chip HTML */
function chip(integration: Integration): string {
  return (
    `<span data-chip-id="${integration.id}" contenteditable="false" style="` +
    `display:inline-flex;align-items:center;gap:3px;` +
    `padding:1px 8px 1px 6px;border-radius:100px;` +
    `font-size:11px;font-weight:600;` +
    `background:${integration.bgColor};color:${integration.color};` +
    `border:1px solid ${integration.color}33;` +
    `white-space:nowrap;cursor:default;user-select:none;` +
    `vertical-align:middle;line-height:1.8;margin:0 2px;` +
    `">${integration.icon} ${integration.name}</span>`
  )
}

// Layout: full left-to-right pipeline
// Node width = 380px, tab = 32px above, card height ≈ 264px
// Horizontal step = 440px (380 + 60 gap)
// Vertical: branches separated by ~80px from main row edges
const X0 = 60
const DX = 440
const Y  = 360        // main row
const YS = 0          // rama Sí  (above)
const YN = 720        // rama No  (below)

export const initialNodes: Node<NodeData>[] = [
  // ── 1. Trigger ─────────────────────────────────────────────────────────
  {
    id: 'n1',
    type: 'instructionNode',
    position: { x: X0, y: Y },
    data: {
      kind: 'instruction',
      label: 'Nuevo Pedido',
      promptHtml: 'El cliente inicia una conversación. Saludalo con el nombre de la pizzería y preguntale qué desea pedir hoy.',
      integrations: [],
    },
  },

  // ── 2. Identificar cliente con Google Sheets ────────────────────────────
  {
    id: 'n2',
    type: 'instructionNode',
    position: { x: X0 + DX * 1, y: Y },
    data: {
      kind: 'instruction',
      label: 'Identificar Cliente',
      promptHtml: `Preguntá el nombre y teléfono del cliente. Buscá si ya existe en ${chip(gs)} y traé su historial de pedidos anteriores para personalizar la atención.`,
      integrations: [
        {
          integration: gs,
          disabledActions: [],
          connectionConfig: {
            spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1abc_clientes',
          },
          accountName: 'pedidos@pizzeria.com',
        },
      ],
    },
  },

  // ── 3. Tomar el pedido ─────────────────────────────────────────────────
  {
    id: 'n3',
    type: 'instructionNode',
    position: { x: X0 + DX * 2, y: Y },
    data: {
      kind: 'instruction',
      label: 'Tomar el Pedido',
      promptHtml: 'Presentá el menú de pizzas disponibles. Preguntá tamaño, ingredientes extra y cantidad. Confirmá el pedido con el cliente antes de continuar.',
      integrations: [],
    },
  },

  // ── 4. Validar dirección con Fetch MCP ─────────────────────────────────
  {
    id: 'n4',
    type: 'instructionNode',
    position: { x: X0 + DX * 3, y: Y },
    data: {
      kind: 'instruction',
      label: 'Validar Dirección',
      promptHtml: `Pedile la dirección de entrega. Validá con ${chip(fetch)} si está dentro de la zona de cobertura de la pizzería (radio de 5 km).`,
      integrations: [
        {
          integration: fetch,
          disabledActions: [],
          connectionConfig: {
            baseUrl: 'https://api.cobertura.pizzeria.com',
            headers: '{"Content-Type": "application/json"}',
          },
          accountName: 'pedidos@pizzeria.com',
        },
      ],
    },
  },

  // ── 5. Verificar stock con Google Sheets ───────────────────────────────
  {
    id: 'n5',
    type: 'instructionNode',
    position: { x: X0 + DX * 4, y: Y },
    data: {
      kind: 'instruction',
      label: 'Verificar Stock',
      promptHtml: `Consultá en ${chip(gs)} el inventario de ingredientes. Verificá que todos los ingredientes del pedido estén disponibles en cantidad suficiente.`,
      integrations: [
        {
          integration: gs,
          disabledActions: [],
          connectionConfig: {
            spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1abc_inventario',
          },
          accountName: 'pedidos@pizzeria.com',
        },
      ],
    },
  },

  // ── 6. Condición ────────────────────────────────────────────────────────
  {
    id: 'n6',
    type: 'conditionNode',
    position: { x: X0 + DX * 5, y: Y },
    data: {
      kind: 'condition',
      label: '¿Pedido viable?',
      promptHtml: 'Evaluá si la dirección está en zona de cobertura Y todos los ingredientes están disponibles en stock.',
      integrations: [],
    },
  },

  // ── Rama SÍ ─────────────────────────────────────────────────────────────

  // ── 7. Agendar entrega con Google Calendar ─────────────────────────────
  {
    id: 'n7',
    type: 'instructionNode',
    position: { x: X0 + DX * 6, y: YS },
    data: {
      kind: 'instruction',
      label: 'Agendar Entrega',
      promptHtml: `Acordá un horario de entrega con el cliente. Creá el evento en ${chip(gcal)} asignando al repartidor disponible y notificá al equipo.`,
      integrations: [
        {
          integration: gcal,
          disabledActions: [],
          connectionConfig: {
            calendarId: 'Entregas Pizzería',
          },
          accountName: 'pedidos@pizzeria.com',
        },
      ],
    },
  },

  // ── 8. Procesar pago con Mercado Pago ──────────────────────────────────
  {
    id: 'n8',
    type: 'instructionNode',
    position: { x: X0 + DX * 7, y: YS },
    data: {
      kind: 'instruction',
      label: 'Procesar Pago',
      promptHtml: `Solicitá el método de pago preferido. Procesá el cobro del pedido mediante ${chip(mp)} y enviá el link de pago al cliente.`,
      integrations: [
        {
          integration: mp,
          disabledActions: [],
          connectionConfig: {
            accessToken: 'APP_USR-...',
          },
          accountName: 'admin@pizzeria.com',
        },
      ],
    },
  },

  // ── 9a. Registrar pedido en Google Sheets ──────────────────────────────
  {
    id: 'n9a',
    type: 'instructionNode',
    position: { x: X0 + DX * 8, y: YS },
    data: {
      kind: 'instruction',
      label: 'Registrar Pedido',
      promptHtml: `Guardá el pedido confirmado con todos los detalles en ${chip(gs)}: cliente, items, total y horario de entrega.`,
      integrations: [
        {
          integration: gs,
          disabledActions: [],
          connectionConfig: {
            spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1abc_pedidos',
          },
          accountName: 'pedidos@pizzeria.com',
        },
      ],
    },
  },

  // ── 9b. Enviar confirmación por Gmail ───────────────────────────────────
  {
    id: 'n9b',
    type: 'instructionNode',
    position: { x: X0 + DX * 9, y: YS },
    data: {
      kind: 'instruction',
      label: 'Enviar Confirmación',
      promptHtml: `Enviá al cliente un email de confirmación con el resumen del pedido y el horario de entrega vía ${chip(gmail)}.`,
      integrations: [
        {
          integration: gmail,
          disabledActions: [],
          connectionConfig: {},
          accountName: 'pedidos@pizzeria.com',
        },
      ],
    },
  },

  // ── Rama NO ─────────────────────────────────────────────────────────────

  // ── 10. Notificar problema con Gmail ───────────────────────────────────
  {
    id: 'n10',
    type: 'instructionNode',
    position: { x: X0 + DX * 6, y: YN },
    data: {
      kind: 'instruction',
      label: 'Notificar Problema',
      promptHtml: `Disculpate con el cliente e informá si el problema es de cobertura o de stock. Enviá un email con alternativas disponibles vía ${chip(gmail)}.`,
      integrations: [
        {
          integration: gmail,
          disabledActions: [],
          connectionConfig: {},
          accountName: 'pedidos@pizzeria.com',
        },
      ],
    },
  },
]

const OK  = { stroke: '#304FFE44', strokeWidth: 2 }
const ERR = { stroke: '#f43f5e88', strokeWidth: 2 }

export const initialEdges: Edge[] = [
  // n1 → n2: no integration on n1, single handle
  { id: 'e1-2', source: 'n1', target: 'n2', animated: true, style: OK },
  // n2 has Google Sheets → success port
  { id: 'e2-3', source: 'n2', sourceHandle: 'success', target: 'n3', animated: true, style: OK },
  // n3 has no integration
  { id: 'e3-4', source: 'n3', target: 'n4', animated: true, style: OK },
  // n4 has fetch → success port
  { id: 'e4-5', source: 'n4', sourceHandle: 'success', target: 'n5', animated: true, style: OK },
  // n5 has Google Sheets → success port
  { id: 'e5-6', source: 'n5', sourceHandle: 'success', target: 'n6', animated: true, style: OK },
  // n6 condition → yes / no
  {
    id: 'e6-7', source: 'n6', sourceHandle: 'yes', target: 'n7',
    animated: true,
    label: 'Sí ✓',
    style: { stroke: '#16a34a', strokeWidth: 2 },
    labelStyle: { fill: '#16a34a', fontWeight: 600, fontSize: 11 },
    labelBgStyle: { fill: '#f0fdf4', fillOpacity: 1 },
  },
  // n7 has gcal → success port
  { id: 'e7-8',   source: 'n7',  sourceHandle: 'success', target: 'n8',   animated: true, style: OK },
  // n8 has MercadoPago → success port
  { id: 'e8-9a',  source: 'n8',  sourceHandle: 'success', target: 'n9a',  animated: true, style: OK },
  // n9a has Google Sheets → success port
  { id: 'e9a-9b', source: 'n9a', sourceHandle: 'success', target: 'n9b',  animated: true, style: OK },
  // n6 condition → no branch
  {
    id: 'e6-10', source: 'n6', sourceHandle: 'no', target: 'n10',
    animated: true,
    label: 'No ✗',
    style: { stroke: '#ef4444', strokeWidth: 2 },
    labelStyle: { fill: '#ef4444', fontWeight: 600, fontSize: 11 },
    labelBgStyle: { fill: '#fef2f2', fillOpacity: 1 },
  },
  // error edge example: n2 Google Sheets error → n10
  {
    id: 'e2-err', source: 'n2', sourceHandle: 'error', target: 'n10',
    animated: true,
    label: 'Error',
    style: ERR,
    labelStyle: { fill: '#f43f5e', fontWeight: 600, fontSize: 11 },
    labelBgStyle: { fill: '#fff1f2', fillOpacity: 1 },
  },
]
