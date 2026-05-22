const GROUPS: {
  id: string
  label: string
  emoji: string
  color: string
  noteColor: string
  noteBorder: string
  items: string[]
}[] = [
  {
    id: 'orquestador',
    label: 'Orquestador',
    emoji: '🔀',
    color: '#7C3AED',
    noteColor: '#FAF5FF',
    noteBorder: '#DDD6FE',
    items: [
      'La gente no entiende que hay que hacer cosas en el orquestador para que el agente funcione.',
      'Como no es obligatorio pasar por el orquestador al crear un agente, no saben que es necesario para que funcione.',
    ],
  },
  {
    id: 'canvas',
    label: 'Canvas & Interacción',
    emoji: '🖱️',
    color: '#0284C7',
    noteColor: '#F0F9FF',
    noteBorder: '#BAE6FD',
    items: [
      'El pointer no lo entienden. Quieren seleccionar varias cajas — no saben que pueden usar Shift.',
      'Los puertos son muy chicos. Les cuesta crear bifurcaciones.',
      'Cuando hay más de 2 puertos no aparece el "+" para agregar más.',
      'La gente arrastra la flecha encima del nodo en lugar de hacerlo de puerto a puerto.',
    ],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    emoji: '📋',
    color: '#475569',
    noteColor: '#F8FAFC',
    noteBorder: '#CBD5E1',
    items: [
      'Están mucho tiempo en la pantalla de workflows. Habría que upgradear esa experiencia.',
      'La gente escribe mucho en algunos estados, o nada en otros. Falta guía sobre qué completar.',
    ],
  },
  {
    id: 'datos',
    label: 'Datos',
    emoji: '📊',
    color: '#B45309',
    noteColor: '#FFFBEB',
    noteBorder: '#FDE68A',
    items: [
      'No entienden por qué al borrar datos opcionales se borran también los obligatorios.',
      'No quieren ver los datos que ya fueron pedidos anteriormente en el mismo flujo.',
    ],
  },
  {
    id: 'kb',
    label: 'Base de conocimiento',
    emoji: '📚',
    color: '#15803D',
    noteColor: '#F0FDF4',
    noteBorder: '#BBF7D0',
    items: [
      'No entienden que para eliminar una base de conocimiento hay que volver al menú de bases.',
      'Mal wording: dice "actualización en base de conocimiento" — confuso.',
      'Falta poder agregar (sumar) bases de conocimiento desde esa pantalla.',
    ],
  },
  {
    id: 'variables',
    label: 'Variables ($ y /)',
    emoji: '💲',
    color: '#9333EA',
    noteColor: '#FAF5FF',
    noteBorder: '#E9D5FF',
    items: [
      'La funcionalidad de variables está escondida. Una vez que se las explican, las entienden.',
      'Hay que reforzar la discoverability — que aparezca de forma más natural.',
    ],
  },
  {
    id: 'flujos',
    label: 'Flujos',
    emoji: '🔄',
    color: '#1D4ED8',
    noteColor: '#EFF6FF',
    noteBorder: '#BFDBFE',
    items: [
      'Quieren que avise que pueden volver para atrás cuando aplican una mejora en un flujo. (pedido para sus clientes)',
    ],
  },
  {
    id: 'sheets',
    label: 'Google Sheets',
    emoji: '📗',
    color: '#16A34A',
    noteColor: '#F0FDF4',
    noteBorder: '#BBF7D0',
    items: [
      '¿Por qué pegar el link manualmente? En n8n aparecen tus archivos de Google vinculados a la cuenta.',
      'Preguntaron si el link tiene que ser público. Sol dijo que no — no queda claro en la UI.',
      '¿Tiene límite de alcance el Google Sheet?',
    ],
  },
  {
    id: 'probar',
    label: 'Probar (Test)',
    emoji: '🧪',
    color: '#DC2626',
    noteColor: '#FEF2F2',
    noteBorder: '#FECACA',
    items: [
      'El ícono del agente está al revés: el orquestador debería estar a la izquierda y el usuario a la derecha.',
    ],
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    emoji: '🎓',
    color: '#0891B2',
    noteColor: '#ECFEFF',
    noteBorder: '#A5F3FC',
    items: [
      'Pidieron onboarding con videos — necesitan aprender cómo usar la plataforma de forma guiada.',
      'Quieren templates para saber cómo empezar y qué hacer con cada funcionalidad.',
    ],
  },
  {
    id: 'conexiones',
    label: 'Conexiones',
    emoji: '🔗',
    color: '#EA580C',
    noteColor: '#FFF7ED',
    noteBorder: '#FED7AA',
    items: [
      'Modal sugerido: "Detectamos un canal nuevo — ¿lo querés conectar?" para facilitar la incorporación.',
      'Variables / datos: no queda claro adónde va la información ni cómo trazarla.',
    ],
  },
]

const STICKY_ROTATIONS = ['-1.2deg', '0.8deg', '-0.5deg', '1.4deg', '-0.9deg', '0.6deg', '-1.5deg', '1.1deg']

export default function WorkshopInsights() {
  const total = GROUPS.reduce((acc, g) => acc + g.items.length, 0)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF8',
      fontFamily: 'Roboto, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        .sticky:hover { transform: rotate(0deg) scale(1.03) !important; box-shadow: 0 8px 32px -8px rgba(15,23,42,0.18) !important; z-index: 2; }
      `}</style>

      {/* Header */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '32px 48px 28px',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 22 }}>🧠</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>Workshop · Agentes de IA · Mayo 2026</span>
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 30, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>
            Insights del workshop
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: '#64748B' }}>
            {total} observaciones de usuarios e internos de Botmaker · {GROUPS.length} áreas
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 48px 80px' }}>
        {GROUPS.map(group => (
          <div key={group.id} style={{ marginBottom: 48 }}>
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 18 }}>{group.emoji}</span>
              <span style={{
                fontSize: 13, fontWeight: 800, color: group.color,
                textTransform: 'uppercase', letterSpacing: 0.8,
              }}>
                {group.label}
              </span>
              <div style={{ flex: 1, height: 1, background: `${group.color}22` }} />
              <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                {group.items.length}
              </span>
            </div>

            {/* Sticky notes row */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 16,
              alignItems: 'flex-start',
            }}>
              {group.items.map((text, i) => (
                <div
                  key={i}
                  className="sticky"
                  style={{
                    width: 200,
                    minHeight: 140,
                    padding: '16px 16px 20px',
                    background: group.noteColor,
                    border: `1.5px solid ${group.noteBorder}`,
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(15,23,42,0.10), 0 1px 2px rgba(15,23,42,0.06)',
                    transform: `rotate(${STICKY_ROTATIONS[i % STICKY_ROTATIONS.length]})`,
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    cursor: 'default',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  {/* Pin dot */}
                  <div style={{
                    position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                    width: 10, height: 10, borderRadius: '50%',
                    background: group.color, opacity: 0.4,
                  }} />
                  <p style={{
                    margin: '10px 0 0',
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: '#1E293B',
                    fontWeight: 500,
                  }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
