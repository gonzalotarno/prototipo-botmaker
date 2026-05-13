import { color, font, radius } from './ds'
import Icon from './Icon'

// Spec UX para devs — métricas de producto SaaS de la plataforma de Agentes IA.
// El foco es entender CÓMO USAN nuestros clientes la plataforma — adopción,
// engagement, retención, friction — no la operación interna del agente.
//
// Convención de naming: PANTALLA_FEATURE_ACCION (uppercase, snake).
// Cada evento incluye: pregunta UX, métrica derivada que se calcula a partir
// de él, props clave, prioridad, y un mini-chart de cómo se vería.

type Priority = 'P0' | 'P1'

type ChartConfig =
  | { type: 'line';      data: number[] }
  | { type: 'bar';       data: { label: string; value: number; color?: string }[] }
  | { type: 'funnel';    data: { label: string; value: number }[] }
  | { type: 'pie';       data: { label: string; value: number; color: string }[] }
  | { type: 'bignumber'; value: string; label: string; trend?: string }

interface EventDef {
  name:       string         // PANTALLA_FEATURE_ACCION — lo que el dev dispara
  chartTitle: string         // título humano del gráfico
  question:   string         // qué pregunta UX responde
  props?:     string
  priority:   Priority
  chart:      ChartConfig
}

interface Category {
  title:     string
  problem:   string
  events:    EventDef[]
}

const line   = (data: number[]): ChartConfig => ({ type: 'line', data })
const bar    = (data: { label: string; value: number; color?: string }[]): ChartConfig => ({ type: 'bar', data })
const fun    = (data: { label: string; value: number }[]): ChartConfig => ({ type: 'funnel', data })
const pie    = (data: { label: string; value: number; color: string }[]): ChartConfig => ({ type: 'pie', data })
const bigN   = (value: string, label: string, trend?: string): ChartConfig => ({ type: 'bignumber', value, label, trend })

const C = {
  primary: '#304FFE', cyan: '#06B6D4', green: '#10B981',
  amber:   '#F59E0B', red:  '#EF4444', violet: '#8B5CF6',
}

const CATEGORIES: Category[] = [

  // ── 1. ACTIVACIÓN ─────────────────────────────────────────────────
  {
    title:   '1. Activación',
    problem: 'No sabemos si los clientes que se registran realmente llegan a crear y publicar un agente funcional, ni cuánto tardan. Con AGENT_CREATED + AGENT_PUBLISHED se arman los time-to-first y el funnel de activación.',
    events: [
      { name: 'AGENT_CREATED',
        chartTitle: 'Tiempo hasta primer agente',
        question: '¿Cuánto tarda un cliente desde que se registra hasta crear su primer agente?',
        props:    'agent_count_after, from_template',
        priority: 'P0',
        chart: bigN('2h 14m', 'mediana time-to-first-agent', '-22m') },

      { name: 'AGENT_PUBLISHED',
        chartTitle: 'Tiempo hasta primera publicación',
        question: '¿Cuánto tarda desde que crea el primer agente hasta publicarlo?',
        props:    'is_first_publish, sections_configured',
        priority: 'P0',
        chart: bigN('1d 4h', 'mediana time-to-first-publish', '-6h') },
    ],
  },

  // ── 2. ADOPCIÓN ───────────────────────────────────────────────────
  {
    title:   '2. Adopción de features',
    problem: 'No sabemos qué partes de la plataforma se usan realmente y cuáles están siendo ignoradas. Sin esto no podemos priorizar el roadmap. La adopción por feature se calcula contando cuántas cuentas tienen ≥1 evento de cada tipo (AGENT_LOGIC_SAVED, AGENT_MCP_ADDED, etc).',
    events: [
      { name: 'AGENT_WORKFLOW_NODE_ADDED',
        chartTitle: 'Tamaño de los workflows',
        question: '¿Cuántos nodos arman por workflow en promedio? (Workflows con 1–2 nodos no aprovechan la herramienta)',
        props:    'node_type, total_nodes_after',
        priority: 'P0',
        chart: bar([
          { label: '1–2 nodos',  value: 42, color: C.amber  },
          { label: '3–5 nodos',  value: 38, color: C.primary },
          { label: '6–10 nodos', value: 16, color: C.primary },
          { label: '10+ nodos',  value:  4, color: C.primary },
        ]) },

      { name: 'AGENT_LOGIC_SAVED',
        chartTitle: 'Lógicas configuradas vs vacías',
        question: '¿Crean lógicas pero no las terminan de configurar? (lógicas vacías = friction en el editor)',
        props:    'has_content, node_count',
        priority: 'P0',
        chart: pie([
          { label: 'Configuradas', value: 71, color: C.green  },
          { label: 'Vacías',       value: 29, color: C.amber  },
        ]) },

      { name: 'AGENT_KNOWLEDGE_ADDED',
        chartTitle: 'Bases de conocimiento por agente',
        question: '¿Cuántas bases de conocimiento por agente?',
        props:    'source_type (link | archivo | texto), doc_count',
        priority: 'P0',
        chart: bar([
          { label: '0 bases',    value: 41, color: C.red    },
          { label: '1 base',     value: 32, color: C.primary },
          { label: '2–3 bases',  value: 21, color: C.primary },
          { label: '4+ bases',   value:  6, color: C.primary },
        ]) },

      { name: 'AGENT_MCP_ADDED',
        chartTitle: 'MCPs por cuenta — evolución',
        question: '¿Cuántos MCPs conectan por cuenta? Indica qué tan integrada está la plataforma en su stack.',
        props:    'provider, kind (app | mcp_externo | mcp_interno)',
        priority: 'P0',
        chart: line([1.4, 1.8, 2.1, 2.4, 2.6, 2.9, 3.2]) },

      { name: 'AGENT_CODE_ADDED',
        chartTitle: 'Adopción de Código (feature avanzada)',
        question: '¿Qué % de cuentas crean al menos una acción de código? (proxy de madurez técnica)',
        props:    'language (js | python)',
        priority: 'P1',
        chart: bigN('14%', 'cuentas con ≥1 código', '+3pts') },

      { name: 'AGENT_AUTOMATION_ADDED',
        chartTitle: 'Templates de automatización más usados',
        question: '¿Qué template predefinido es el más popular?',
        props:    'template_id, source (template | custom)',
        priority: 'P1',
        chart: bar([
          { label: 'Diario 9hs', value: 32, color: C.primary },
          { label: 'Cada 5min', value: 28, color: C.primary },
          { label: 'Webhook',   value: 22, color: C.primary },
          { label: 'Custom',    value: 18, color: C.amber   },
        ]) },
    ],
  },

  // ── 3. ENGAGEMENT / RETENCIÓN ─────────────────────────────────────
  {
    title:   '3. Engagement y retención',
    problem: 'No sabemos si los clientes vuelven a la plataforma de forma recurrente o si la usan una vez y la abandonan.',
    events: [
      { name: 'AGENT_EDITOR_OPENED',
        chartTitle: 'Agentes editados por semana',
        question: '¿Cuántos agentes edita un cliente por semana? (clientes que no editan no iteran)',
        props:    'agent_id, edit_duration_ms',
        priority: 'P0',
        chart: bigN('3.4', 'agentes/semana por cuenta', '+0.6') },

      { name: 'AGENT_PUBLISHED',
        chartTitle: 'Frecuencia de publicación',
        question: '¿Con qué frecuencia publican cambios? Publish frecuente = están iterando.',
        props:    'agent_id, change_summary',
        priority: 'P0',
        chart: line([45, 52, 60, 58, 72, 80, 95]) },

      { name: 'PLATFORM_SESSION_ENDED',
        chartTitle: 'Sesiones por semana por cuenta',
        question: '¿Cuántas sesiones por semana tiene una cuenta? Diferencia poweruser vs ocasional.',
        props:    'session_duration_ms, pages_visited',
        priority: 'P1',
        chart: bigN('5.8', 'sesiones/semana mediana') },

      { name: 'ACCOUNT_CHURN_RISK_FLAGGED',
        chartTitle: 'Cuentas en riesgo de churn',
        question: '¿Cuántas cuentas están en alto riesgo de churn? (no publican, no abren lógicas, 0 MCPs en 14d)',
        props:    'indicators_matched (array), days_inactive',
        priority: 'P0',
        chart: bigN('38', 'cuentas en riesgo', '-7') },
    ],
  },

  // ── 4. FRICTION ───────────────────────────────────────────────────
  {
    title:   '4. Friction y errores de configuración',
    problem: 'Los clientes abandonan la configuración sin completarla y no tenemos datos de dónde ni por qué.',
    events: [
      { name: 'AGENT_LOGIC_EDITOR_OPENED',
        chartTitle: 'Tasa de abandono del editor',
        question: '¿Qué % de sesiones del editor terminan abandonadas (creó nodo, cerró sin guardar)?',
        props:    'logic_id, session_id',
        priority: 'P0',
        chart: bigN('34%', 'sesiones abandonadas en editor', '-4pts') },

      { name: 'AGENT_LOGIC_NODE_SAVED',
        chartTitle: 'Nodos con texto vs vacíos',
        question: '¿Qué % de nodos de instrucción se guardan vacíos? (no sabe qué escribir → falta onboarding o templates)',
        props:    'node_type, has_text',
        priority: 'P1',
        chart: pie([
          { label: 'Con texto', value: 79, color: C.green },
          { label: 'Vacíos',    value: 21, color: C.amber },
        ]) },

      { name: 'AGENT_KNOWLEDGE_UPLOAD_FAILED',
        chartTitle: 'Tasa de fallo en upload de archivos',
        question: '¿Qué % de cargas de archivos fallan? Si es alto hay problema técnico o de UX.',
        props:    'error_type (size | format | network), source_type',
        priority: 'P0',
        chart: bigN('4.2%', 'cargas fallidas', '-1.1pts') },

      { name: 'AGENT_LOGIC_EDITOR_ABANDONED',
        chartTitle: 'Tiempo en editor antes de abandonar',
        question: '¿Cuánto tiempo pasa el cliente en el editor antes de abandonar? Si es <1min, no entendió la UI.',
        props:    'time_in_editor_ms, nodes_created',
        priority: 'P1',
        chart: bar([
          { label: '<1 min',   value: 38, color: C.red    },
          { label: '1–5 min',  value: 32, color: C.amber  },
          { label: '5–15 min', value: 22, color: C.primary },
          { label: '15+ min',  value:  8, color: C.green  },
        ]) },

      { name: 'AGENT_MCP_VALIDATION_FAILED',
        chartTitle: 'Campos que más bloquean al conectar',
        question: '¿Qué campo bloquea más al usuario en el modal de conectar?',
        props:    'missing_field (cuando | cuenta | tools)',
        priority: 'P1',
        chart: pie([
          { label: 'cuando', value: 62, color: C.amber },
          { label: 'tools',  value: 22, color: C.cyan  },
          { label: 'cuenta', value: 16, color: C.violet },
        ]) },
    ],
  },

  // ── 5. EXPANSIÓN / PROFUNDIDAD ────────────────────────────────────
  {
    title:   '5. Expansión y profundidad de uso',
    problem: 'No sabemos si los clientes crecen dentro de la plataforma (más agentes, más orquestadores, más integraciones) o se quedan siempre en el mismo nivel de uso.',
    events: [
      { name: 'AGENT_CREATED',
        chartTitle: 'Crecimiento de agentes por cuenta',
        question: '¿Cómo evoluciona la cantidad de agentes por cuenta mes a mes? Crecimiento = confianza en el producto.',
        props:    'agent_count_after, from_template',
        priority: 'P0',
        chart: line([1.8, 2.1, 2.4, 2.8, 3.2, 3.7, 4.3]) },

      { name: 'ORCHESTRATOR_CREATED',
        chartTitle: 'Orquestadores por cuenta',
        question: '¿Cuántos orquestadores arman las cuentas? (más de uno = casos complejos = mayor switching cost)',
        props:    'agent_count_in_orchestrator',
        priority: 'P0',
        chart: bar([
          { label: '0 orquestadores', value: 32, color: C.amber  },
          { label: '1 orquestador',   value: 48, color: C.primary },
          { label: '2–3',             value: 16, color: C.primary },
          { label: '4+',              value:  4, color: C.primary },
        ]) },

      { name: 'AGENT_CHANNEL_ADDED',
        chartTitle: 'Cuentas multi-canal',
        question: '¿Qué % de cuentas tienen agentes en más de un canal? (WhatsApp + Web + otro)',
        props:    'channel, channel_count_after',
        priority: 'P1',
        chart: pie([
          { label: 'Multi-canal',  value: 38, color: C.primary },
          { label: 'Single canal', value: 62, color: C.cyan    },
        ]) },

      { name: 'ACCOUNT_DEPTH_UPDATED',
        chartTitle: 'Distribución de feature depth (power users)',
        question: '¿Cuántas cuentas son power users (5/5 features)? Score 0–5 por cuenta.',
        props:    'depth_score (0..5)',
        priority: 'P1',
        chart: bar([
          { label: 'Score 0', value: 18, color: C.red    },
          { label: 'Score 1', value: 24, color: C.amber  },
          { label: 'Score 2', value: 22, color: C.primary },
          { label: 'Score 3', value: 18, color: C.primary },
          { label: 'Score 4', value: 12, color: C.green  },
          { label: 'Score 5', value:  6, color: C.green  },
        ]) },
    ],
  },

  // ── 6. ONBOARDING ─────────────────────────────────────────────────
  {
    title:   '6. Salud del onboarding',
    problem: 'No sabemos si el flujo de onboarding actual lleva a los clientes a descubrir las features correctas en el orden correcto.',
    events: [
      { name: 'ONBOARDING_STEP_COMPLETED',
        chartTitle: 'Funnel de onboarding (7 días)',
        question: '¿Qué % de cuentas nuevas completan todo el onboarding en sus primeros 7 días?',
        props:    'step_id, step_index, total_steps',
        priority: 'P0',
        chart: fun([
          { label: 'Paso 1',  value: 1000 },
          { label: 'Paso 2',  value:  820 },
          { label: 'Paso 3',  value:  640 },
          { label: 'Paso 4',  value:  480 },
          { label: 'Completó', value: 360 },
        ]) },


      { name: 'AGENT_TEMPLATE_SELECTED',
        chartTitle: 'Uso de templates al crear agente',
        question: '¿Qué % de clientes nuevos arrancan desde un template? (alta adopción = baja barrera de entrada)',
        props:    'template_id, agent_id',
        priority: 'P0',
        chart: pie([
          { label: 'Desde template', value: 64, color: C.green   },
          { label: 'Desde cero',     value: 36, color: C.primary },
        ]) },

      { name: 'SUPPORT_TICKET_CREATED',
        chartTitle: 'Tickets de soporte por sección',
        question: '¿Qué secciones generan más tickets de soporte? (alto volumen = friction o docs faltantes)',
        props:    'feature, ticket_category',
        priority: 'P1',
        chart: bar([
          { label: 'Lógicas',      value: 42, color: C.red     },
          { label: 'MCPs',         value: 28, color: C.amber   },
          { label: 'Conocimiento', value: 18, color: C.primary },
          { label: 'Workflows',    value: 12, color: C.primary },
          { label: 'Código',       value:  8, color: C.green   },
        ]) },
    ],
  },
]

const PRIORITY_STYLE: Record<Priority, { bg: string; fg: string; label: string }> = {
  P0: { bg: '#FEE2E2', fg: '#991B1B', label: 'P0' },
  P1: { bg: '#DBEAFE', fg: '#1E40AF', label: 'P1' },
}

export default function Metrics() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F2FF',
      fontFamily: font.family,
    }}>
      <main style={{
        width: '100%', maxWidth: 1100,
        margin: '0 auto',
        padding: '56px 24px 80px',
        boxSizing: 'border-box',
      }}>

        {/* Hero */}
        <div style={{ marginBottom: 32 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: color.primary,
            background: color.primaryUltraLight,
            border: `1px solid ${color.primaryLight}`,
            borderRadius: 100, padding: '4px 10px',
            marginBottom: 14,
          }}>
            Producto · Spec para devs
          </span>
          <h1 style={{
            margin: 0, fontSize: 32, fontWeight: 800, color: color.grey900,
            letterSpacing: '-0.02em', lineHeight: 1.15,
          }}>
            Métricas de producto — Plataforma de Agentes IA
          </h1>
          <p style={{
            margin: '12px 0 0', fontSize: 14, color: color.grey600,
            maxWidth: 740, lineHeight: 1.6,
          }}>
            Cómo nuestros clientes usan la plataforma — adopción, engagement,
            retención y friction. No es operación interna del agente: son
            métricas de producto SaaS que nos ayudan a entender el negocio y
            priorizar el roadmap.
          </p>

          {/* Naming convention + priority key */}
          <div style={{
            marginTop: 18, padding: '12px 16px',
            background: 'white',
            border: `1px solid ${color.borderDefault}`,
            borderRadius: radius.md,
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14,
            fontSize: 12, color: color.grey700,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color.grey500 }}>Naming</span>
              <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, background: color.grey100, color: color.grey900, padding: '2px 8px', borderRadius: 4 }}>
                PANTALLA_FEATURE_ACCION
              </code>
            </div>
            <span style={{ color: color.grey300 }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PriorityChip p="P0" /> bloqueante para el lunes
            </div>
            <span style={{ color: color.grey300 }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PriorityChip p="P1" /> semana siguiente
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {CATEGORIES.map(cat => (
            <div key={cat.title}
              style={{
                background: 'white',
                border: `1px solid ${color.borderDefault}`,
                borderRadius: radius.lg,
                padding: '22px 24px',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
              {/* Section header */}
              <div>
                <h2 style={{
                  margin: 0, fontSize: 18, fontWeight: 800, color: color.grey900,
                  letterSpacing: '-0.01em', lineHeight: 1.25,
                }}>{cat.title}</h2>
                <p style={{
                  margin: '6px 0 0', fontSize: 12.5, color: color.grey600,
                  lineHeight: 1.5, fontStyle: 'italic',
                }}>
                  <strong style={{ color: color.grey700, fontStyle: 'normal' }}>Problemática:</strong>{' '}
                  {cat.problem}
                </p>
              </div>

              {/* Events */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cat.events.map(ev => (
                  <div key={ev.name}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) 220px',
                      gap: 16,
                      padding: '12px 14px', borderRadius: radius.md,
                      background: color.grey50,
                      border: `1px solid ${color.borderSubtle}`,
                    }}>
                    {/* Left */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                        <PriorityChip p={ev.priority} />
                        <code style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 12.5, fontWeight: 700, color: color.grey900,
                          background: 'white', padding: '1px 8px', borderRadius: 4,
                          border: `1px solid ${color.borderSubtle}`,
                        }}>{ev.name}</code>
                      </div>
                      <div style={{ fontSize: 12.5, color: color.grey700, lineHeight: 1.5 }}>{ev.question}</div>
                      {ev.props && (
                        <div style={{ marginTop: 6, fontSize: 11, color: color.grey500, lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginRight: 6 }}>props</span>
                          <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: color.grey700 }}>{ev.props}</code>
                        </div>
                      )}
                    </div>

                    {/* Right: chart con título humano arriba */}
                    <div style={{
                      background: 'white',
                      border: `1px solid ${color.borderSubtle}`,
                      borderRadius: radius.sm,
                      padding: '8px 10px 10px',
                      display: 'flex', flexDirection: 'column', gap: 6,
                      minHeight: 90,
                    }}>
                      <div style={{
                        fontSize: 10.5, fontWeight: 700, color: color.grey800,
                        letterSpacing: '-0.005em', lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }} title={ev.chartTitle}>{ev.chartTitle}</div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MiniChart config={ev.chart} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 36,
          padding: '14px 18px',
          background: 'white',
          border: `1px dashed ${color.borderDefault}`,
          borderRadius: radius.md,
          fontSize: 12, color: color.grey600, lineHeight: 1.6, textAlign: 'center',
        }}>
          Los gráficos son ejemplo del FORMATO esperado en Amplitude — los
          números que muestran no son reales.
        </div>
      </main>
    </div>
  )
}

// ── Components ────────────────────────────────────────────────────────────────

function PriorityChip({ p }: { p: Priority }) {
  const s = PRIORITY_STYLE[p]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 10.5, fontWeight: 800, letterSpacing: '0.04em',
      padding: '3px 8px', borderRadius: 4,
      background: s.bg, color: s.fg,
      flexShrink: 0,
      lineHeight: 1.4,
    }}>{s.label}</span>
  )
}

function MiniChart({ config }: { config: ChartConfig }) {
  if (config.type === 'line')      return <Sparkline values={config.data} />
  if (config.type === 'bar')       return <MiniBars data={config.data} />
  if (config.type === 'funnel')    return <MiniFunnel data={config.data} />
  if (config.type === 'pie')       return <MiniPie data={config.data} />
  return <MiniBigNumber value={config.value} label={config.label} trend={config.trend} />
}

function Sparkline({ values }: { values: number[] }) {
  const w = 200, h = 56, pad = 4
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const step = (w - pad * 2) / (values.length - 1)
  const pts = values.map((v, i) => {
    const x = pad + i * step
    const y = pad + (h - pad * 2) * (1 - (v - min) / range)
    return [x, y] as [number, number]
  })
  const polyline = pts.map(p => `${p[0]},${p[1]}`).join(' ')
  const area = `M ${pts[0][0]},${h - pad} ${pts.map(p => `L ${p[0]},${p[1]}`).join(' ')} L ${pts[pts.length - 1][0]},${h - pad} Z`
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <path d={area} fill={color.primary} fillOpacity={0.12} />
      <polyline points={polyline} fill="none" stroke={color.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3 : 0} fill={color.primary} />
      ))}
    </svg>
  )
}

function MiniBars({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...data.map(d => d.value))
  const list = data.slice(0, 6)
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {list.map(d => {
        const pct = (d.value / max) * 100
        return (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9.5, color: color.grey700, width: 64, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
            <div style={{ flex: 1, height: 7, borderRadius: 3, background: color.grey100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: d.color ?? color.primary, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 9.5, color: color.grey700, width: 24, fontWeight: 700, textAlign: 'right' }}>{d.value}</span>
          </div>
        )
      })}
    </div>
  )
}

function MiniFunnel({ data }: { data: { label: string; value: number }[] }) {
  const max = data[0].value
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100
        return (
          <div key={d.label}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1 }}>
              <span style={{ fontSize: 9.5, color: color.grey700, fontWeight: 600 }}>{d.label}</span>
              <span style={{ fontSize: 9.5, color: color.grey700, fontWeight: 700 }}>{d.value.toLocaleString()}</span>
            </div>
            <div style={{ height: 5, borderRadius: 100, background: color.grey100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: i === data.length - 1 ? '#10B981' : color.primary, opacity: 0.85 - i * 0.08, borderRadius: 100 }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MiniPie({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let acc = 0
  const stops = data.map(d => {
    const start = (acc / total) * 360
    acc += d.value
    const end = (acc / total) * 360
    return `${d.color} ${start}deg ${end}deg`
  }).join(', ')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: `conic-gradient(${stops})`,
        position: 'relative', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 28, height: 28, borderRadius: '50%',
          background: 'white',
        }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: color.grey700, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {d.label} <span style={{ color: color.grey500, fontWeight: 500 }}>· {Math.round((d.value / total) * 100)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniBigNumber({ value, label, trend }: { value: string; label: string; trend?: string }) {
  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'center' }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: color.grey900, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</span>
        {trend && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: trend.startsWith('-') ? color.successDark : color.successDark,
            background: color.successLight,
            padding: '1px 5px', borderRadius: 100,
          }}>{trend}</span>
        )}
      </div>
      <div style={{ fontSize: 10.5, color: color.grey500, marginTop: 4, lineHeight: 1.3 }}>{label}</div>
    </div>
  )
}
