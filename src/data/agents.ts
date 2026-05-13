export interface Orchestrator {
  id: string
  name: string
  emoji: string
  dailyMessages: number
}

export interface Agent {
  id: string
  orchestratorId: string
  name: string
  color: string
  status: 'active' | 'inactive' | 'configuring'
  description: string
}

export interface SubAgent {
  id: string
  agentId: string
  name: string
  status: 'active' | 'inactive' | 'configuring'
}

export const ORCHESTRATORS: Orchestrator[] = [
  { id: 'pizzeria', name: 'Pizzería Bella Italia', emoji: '🍕', dailyMessages: 127 },
  { id: 'moda',     name: 'Tienda Moda Express',   emoji: '👗', dailyMessages: 89  },
  { id: 'inmo',     name: 'Inmobiliaria Del Sur',   emoji: '🏠', dailyMessages: 23  },
]

export const AGENTS: Agent[] = [
  { id: 'pedidos',     orchestratorId: 'pizzeria', name: 'Toma de Pedidos',         color: '#304FFE', status: 'active',      description: 'Gestiona pedidos por WhatsApp'    },
  { id: 'soporte',     orchestratorId: 'pizzeria', name: 'Soporte al Cliente',       color: '#7c3aed', status: 'active',      description: 'Responde consultas frecuentes'    },
  { id: 'menu',        orchestratorId: 'pizzeria', name: 'Menú & Promociones',       color: '#0891b2', status: 'configuring', description: 'Informa el menú del día'          },
  { id: 'ventas',      orchestratorId: 'moda',     name: 'Asistente de Ventas',      color: '#16a34a', status: 'active',      description: 'Ayuda a elegir productos'         },
  { id: 'stock',       orchestratorId: 'moda',     name: 'Control de Stock',         color: '#d97706', status: 'inactive',    description: 'Consultas de inventario'          },
  { id: 'propiedades', orchestratorId: 'inmo',     name: 'Consultor de Propiedades', color: '#304FFE', status: 'active',      description: 'Muestra propiedades disponibles'  },
]

export const SUB_AGENTS: SubAgent[] = [
  { id: 'sub-pedidos-main',   agentId: 'pedidos',     name: 'Flujo Principal',    status: 'active'      },
  { id: 'sub-pedidos-pago',   agentId: 'pedidos',     name: 'Confirmación Pago',  status: 'active'      },
  { id: 'sub-soporte-faq',    agentId: 'soporte',     name: 'Consultas FAQ',      status: 'active'      },
  { id: 'sub-soporte-escala', agentId: 'soporte',     name: 'Escalado a Humano',  status: 'configuring' },
  { id: 'sub-menu-dia',       agentId: 'menu',        name: 'Menú del Día',       status: 'configuring' },
  { id: 'sub-ventas-main',    agentId: 'ventas',      name: 'Asistente Principal', status: 'active'     },
  { id: 'sub-stock-consulta', agentId: 'stock',       name: 'Consulta de Stock',  status: 'inactive'    },
  { id: 'sub-prop-busqueda',  agentId: 'propiedades', name: 'Búsqueda de Propiedades', status: 'active' },
]
