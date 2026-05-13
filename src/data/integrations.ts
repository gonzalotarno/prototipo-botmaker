import type { Integration } from '../types'

export const INTEGRATIONS: Integration[] = [
  // ── Google ──────────────────────────────────────────────────────────────
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    icon: '📊',
    color: '#34A853',
    bgColor: '#f0fdf4',
    category: 'Google',
    connectionFields: [
      { key: 'spreadsheetUrl', label: 'URL de la hoja', type: 'text', placeholder: 'https://docs.google.com/spreadsheets/d/...', isResourceSelector: true },
    ],
    actions: [
      { id: 'read',   name: 'Leer filas',      description: 'Busca y lee filas que coincidan con un criterio' },
      { id: 'append', name: 'Agregar fila',     description: 'Inserta una nueva fila al final de la hoja' },
      { id: 'update', name: 'Actualizar fila',  description: 'Modifica el contenido de una fila existente' },
      { id: 'delete', name: 'Eliminar fila',    description: 'Elimina una o varias filas de la hoja' },
      { id: 'search', name: 'Buscar en hoja',   description: 'Busca valores en cualquier columna y devuelve resultados' },
    ],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '✉️',
    color: '#EA4335',
    bgColor: '#fef2f2',
    category: 'Google',
    connectionFields: [],
    actions: [
      { id: 'send',   name: 'Enviar email',    description: 'Envía un email desde la cuenta conectada' },
      { id: 'read',   name: 'Leer emails',     description: 'Lee emails de la bandeja de entrada' },
      { id: 'search', name: 'Buscar emails',   description: 'Busca emails por remitente, asunto o contenido' },
      { id: 'draft',  name: 'Crear borrador',  description: 'Crea un borrador sin enviarlo' },
      { id: 'label',  name: 'Etiquetar',       description: 'Aplica o quita etiquetas a un email' },
    ],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    icon: '📅',
    color: '#4285F4',
    bgColor: '#eff6ff',
    category: 'Google',
    connectionFields: [
      { key: 'calendarId', label: 'Calendario', type: 'text', placeholder: 'Mi calendario', isResourceSelector: true },
    ],
    actions: [
      { id: 'create',  name: 'Crear evento',       description: 'Crea un nuevo evento en el calendario' },
      { id: 'read',    name: 'Leer eventos',        description: 'Lista eventos en un rango de fechas' },
      { id: 'update',  name: 'Actualizar evento',   description: 'Modifica un evento existente' },
      { id: 'delete',  name: 'Eliminar evento',     description: 'Elimina un evento del calendario' },
      { id: 'search',  name: 'Buscar eventos',      description: 'Busca eventos por título o descripción' },
    ],
  },

  // ── MCP ─────────────────────────────────────────────────────────────────
  {
    id: 'mcp-fetch',
    name: 'Fetch MCP',
    icon: '🌐',
    color: '#6366f1',
    bgColor: '#eef2ff',
    category: 'MCP',
    connectionFields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.ejemplo.com', isResourceSelector: true },
      { key: 'headers', label: 'Headers globales (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer {{token}}"}' },
    ],
    actions: [
      { id: 'get',    name: 'GET',    description: 'Realiza una petición GET a un endpoint' },
      { id: 'post',   name: 'POST',   description: 'Envía datos con una petición POST' },
      { id: 'put',    name: 'PUT',    description: 'Reemplaza un recurso con PUT' },
      { id: 'patch',  name: 'PATCH',  description: 'Actualiza parcialmente un recurso' },
      { id: 'delete', name: 'DELETE', description: 'Elimina un recurso via DELETE' },
    ],
  },
  {
    id: 'mcp-brave',
    name: 'Brave Search',
    icon: '🦁',
    color: '#fb923c',
    bgColor: '#fff7ed',
    category: 'MCP',
    connectionFields: [
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'BSA...' },
    ],
    actions: [
      { id: 'web',    name: 'Búsqueda web',     description: 'Busca en la web y devuelve resultados' },
      { id: 'news',   name: 'Búsqueda de noticias', description: 'Busca noticias recientes' },
      { id: 'local',  name: 'Búsqueda local',   description: 'Busca negocios o lugares cercanos' },
    ],
  },
  {
    id: 'mcp-postgres',
    name: 'PostgreSQL',
    icon: '🐘',
    color: '#336791',
    bgColor: '#edf3f8',
    category: 'MCP',
    connectionFields: [
      { key: 'connectionString', label: 'Connection String', type: 'text', placeholder: 'postgresql://user:pass@host:5432/db' },
    ],
    actions: [
      { id: 'select',   name: 'SELECT',   description: 'Consulta filas de una tabla' },
      { id: 'insert',   name: 'INSERT',   description: 'Inserta nuevos registros' },
      { id: 'update',   name: 'UPDATE',   description: 'Actualiza registros existentes' },
      { id: 'delete',   name: 'DELETE',   description: 'Elimina registros' },
      { id: 'execute',  name: 'Query libre', description: 'Ejecuta cualquier query SQL' },
    ],
  },

  // ── Pagos ────────────────────────────────────────────────────────────────
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    icon: '💙',
    color: '#009EE3',
    bgColor: '#e6f7fd',
    category: 'Pagos',
    connectionFields: [
      { key: 'accessToken', label: 'Access Token', type: 'text', placeholder: 'APP_USR-...' },
    ],
    actions: [
      { id: 'create-link',  name: 'Crear link de pago',  description: 'Genera un link de pago para el cliente' },
      { id: 'check-status', name: 'Consultar estado',    description: 'Verifica si un pago fue acreditado' },
      { id: 'refund',       name: 'Hacer reembolso',     description: 'Devuelve el dinero de un pago' },
      { id: 'list',         name: 'Listar pagos',        description: 'Lista pagos recibidos con filtros' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    color: '#635BFF',
    bgColor: '#eef2ff',
    category: 'Pagos',
    connectionFields: [
      { key: 'secretKey', label: 'Secret Key', type: 'text', placeholder: 'sk_...' },
    ],
    actions: [
      { id: 'create-payment',  name: 'Crear pago',         description: 'Crea un PaymentIntent o Checkout' },
      { id: 'check-status',    name: 'Consultar estado',   description: 'Verifica el estado de un pago' },
      { id: 'refund',          name: 'Reembolsar',         description: 'Genera un reembolso total o parcial' },
      { id: 'list-customers',  name: 'Listar clientes',    description: 'Busca clientes en Stripe' },
    ],
  },

  // ── Mensajería ───────────────────────────────────────────────────────────
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    bgColor: '#f0fdf4',
    category: 'Mensajería',
    connectionFields: [],
    actions: [
      { id: 'send-text',   name: 'Enviar texto',    description: 'Envía un mensaje de texto' },
      { id: 'send-media',  name: 'Enviar archivo',  description: 'Envía imagen, video o documento' },
      { id: 'read',        name: 'Leer mensajes',   description: 'Lee mensajes recibidos' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '🔔',
    color: '#4A154B',
    bgColor: '#faf5ff',
    category: 'Mensajería',
    connectionFields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/...' },
    ],
    actions: [
      { id: 'send',         name: 'Enviar mensaje',     description: 'Envía un mensaje a un canal o DM' },
      { id: 'read',         name: 'Leer mensajes',      description: 'Lee mensajes de un canal' },
      { id: 'upload-file',  name: 'Subir archivo',      description: 'Sube un archivo a un canal' },
    ],
  },

  // ── IA ───────────────────────────────────────────────────────────────────
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    color: '#10A37F',
    bgColor: '#f0fdf9',
    category: 'IA',
    connectionFields: [
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'sk-...' },
      { key: 'model',  label: 'Modelo',  type: 'select', options: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
    ],
    actions: [
      { id: 'chat',       name: 'Chat completion',   description: 'Genera texto o responde preguntas' },
      { id: 'vision',     name: 'Analizar imagen',   description: 'Describe o analiza el contenido de una imagen' },
      { id: 'embeddings', name: 'Embeddings',        description: 'Genera vectores para búsqueda semántica' },
      { id: 'tts',        name: 'Texto a voz',       description: 'Convierte texto en audio (TTS)' },
      { id: 'stt',        name: 'Voz a texto',       description: 'Transcribe audio a texto (Whisper)' },
    ],
  },

  // ── Base de datos ────────────────────────────────────────────────────────
  {
    id: 'airtable',
    name: 'Airtable',
    icon: '🗂️',
    color: '#FCB400',
    bgColor: '#fffbeb',
    category: 'Base de datos',
    connectionFields: [
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'pat...' },
      { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX' },
    ],
    actions: [
      { id: 'list',    name: 'Listar registros',    description: 'Lista registros de una tabla con filtros' },
      { id: 'create',  name: 'Crear registro',      description: 'Inserta un nuevo registro' },
      { id: 'update',  name: 'Actualizar registro', description: 'Modifica campos de un registro existente' },
      { id: 'delete',  name: 'Eliminar registro',   description: 'Elimina un registro por ID' },
      { id: 'search',  name: 'Buscar registros',    description: 'Busca registros que coincidan con una fórmula' },
    ],
  },
]
