const INSIGHTS: {
  id: number
  category: string
  color: string
  bg: string
  items: { text: string; note?: string }[]
}[] = [
  {
    id: 1,
    category: 'Orquestador',
    color: '#7C3AED',
    bg: '#F5F3FF',
    items: [
      { text: 'La gente no entiende que hay que configurar cosas en el orquestador para que el agente funcione.' },
      { text: 'Como no es obligatorio pasar por el orquestador al crear un agente, no saben que es necesario para que funcione.' },
    ],
  },
  {
    id: 2,
    category: 'Canvas & Interacción',
    color: '#0284C7',
    bg: '#F0F9FF',
    items: [
      { text: 'El pointer no lo entienden. Quieren poder seleccionar varias cajas — no saben que pueden usar Shift.' },
      { text: 'Los puertos son muy chicos. Les cuesta crear bifurcaciones.' },
      { text: 'Cuando hay más de 2 puertos no aparece el "+" para agregar más.' },
      { text: 'La gente arrastra la flecha encima del nodo en lugar de hacerlo de puerto a puerto.' },
    ],
  },
  {
    id: 3,
    category: 'Workflows',
    color: '#0F172A',
    bg: '#F8FAFC',
    items: [
      { text: 'Están mucho tiempo en la pantalla de workflows. Habría que upgradear esa experiencia.' },
      { text: 'La gente escribe mucho en algunos estados o nada en otros. Falta guía sobre qué completar.' },
    ],
  },
  {
    id: 4,
    category: 'Datos',
    color: '#B45309',
    bg: '#FFFBEB',
    items: [
      { text: 'No entienden por qué al borrar datos opcionales se borran también los obligatorios.' },
      { text: 'No quieren ver los datos que ya fueron pedidos anteriormente.' },
    ],
  },
  {
    id: 5,
    category: 'Base de conocimiento',
    color: '#15803D',
    bg: '#F0FDF4',
    items: [
      { text: 'No entienden que para eliminar una base de conocimiento tienen que volver al menú de bases de conocimiento.' },
      { text: 'Mal wording: dice "actualización en base de conocimiento" — confuso.' },
      { text: 'Falta poder agregar (sumar) bases de conocimiento desde esa pantalla.' },
    ],
  },
  {
    id: 6,
    category: 'Variables ($ y /)',
    color: '#9333EA',
    bg: '#FAF5FF',
    items: [
      { text: 'La funcionalidad de variables está un poco escondida. Una vez que se la explican la entienden.' },
      { text: 'Hay que reforzar la discoverability — que aparezca más naturalmente.' },
    ],
  },
  {
    id: 7,
    category: 'Flujos',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    items: [
      { text: 'Quieren que avise que pueden volver para atrás cuando aplican una mejora en un flujo.', note: 'Pedido específico para clientes finales' },
    ],
  },
  {
    id: 8,
    category: 'Google Sheets',
    color: '#16A34A',
    bg: '#F0FDF4',
    items: [
      { text: '¿Por qué hay que pegar el link manualmente? En n8n aparecen tus archivos vinculados a la cuenta directamente.' },
      { text: 'Preguntaron si el link tiene que ser público. Sol dijo que no — pero no queda claro en la UI.' },
      { text: '¿Tiene límite de alcance el Google Sheet?' },
    ],
  },
  {
    id: 9,
    category: 'Probar (Test)',
    color: '#DC2626',
    bg: '#FEF2F2',
    items: [
      { text: 'El ícono del agente está al revés: el orquestador debería estar a la izquierda y el usuario a la derecha.' },
      { text: 'El orden visual de cómo se escribe es al revés de lo esperado.' },
    ],
  },
  {
    id: 10,
    category: 'Onboarding',
    color: '#0891B2',
    bg: '#ECFEFF',
    items: [
      { text: 'Pidieron onboarding con videos — necesitan aprender cómo usar la plataforma de forma guiada.' },
      { text: 'Quieren templates para saber cómo empezar y qué hacer con cada funcionalidad.' },
    ],
  },
  {
    id: 11,
    category: 'Conexiones',
    color: '#EA580C',
    bg: '#FFF7ED',
    items: [
      { text: 'Modal sugerido: "Detectamos un canal nuevo — ¿querés conectarlo?" para facilitar la conexión.' },
      { text: 'Variables / datos: no queda claro a dónde va la información ni cómo trazarla.' },
    ],
  },
]

const PRIMARY = '#304FFE'

export default function WorkshopInsights() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: 'Roboto, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Header */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '28px 40px 24px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '4px 12px', borderRadius: 100, background: '#EFF0FF', color: PRIMARY, fontSize: 12, fontWeight: 700 }}>
                🧠 Workshop · Agentes de IA
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Insights del workshop
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#64748B' }}>
                {INSIGHTS.reduce((acc, g) => acc + g.items.length, 0)} observaciones · {INSIGHTS.length} categorías · Mayo 2026
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {INSIGHTS.map(g => (
                <a key={g.id} href={`#cat-${g.id}`} style={{
                  padding: '5px 12px', borderRadius: 100,
                  background: g.bg, color: g.color,
                  fontSize: 11.5, fontWeight: 700,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                  border: `1px solid ${g.color}22`,
                  transition: 'opacity 150ms',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {g.category}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 40px 60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}>
          {INSIGHTS.map(group => (
            <div
              key={group.id}
              id={`cat-${group.id}`}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
              }}
            >
              {/* Card header */}
              <div style={{
                padding: '14px 18px',
                background: group.bg,
                borderBottom: `1px solid ${group.color}22`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: group.color, flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 13, fontWeight: 800,
                  color: group.color, letterSpacing: '-0.01em',
                }}>
                  {group.category}
                </span>
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                  color: group.color, opacity: 0.6,
                }}>
                  {group.items.length} {group.items.length === 1 ? 'insight' : 'insights'}
                </span>
              </div>

              {/* Items */}
              <div style={{ padding: '4px 0' }}>
                {group.items.map((item, i) => (
                  <div key={i} style={{
                    padding: '13px 18px',
                    borderBottom: i < group.items.length - 1 ? '1px solid #F1F5F9' : 'none',
                  }}>
                    <p style={{
                      margin: 0, fontSize: 13.5, color: '#334155',
                      lineHeight: 1.6,
                    }}>
                      {item.text}
                    </p>
                    {item.note && (
                      <p style={{
                        margin: '6px 0 0', fontSize: 11.5,
                        color: '#94A3B8', fontStyle: 'italic',
                      }}>
                        ↳ {item.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
