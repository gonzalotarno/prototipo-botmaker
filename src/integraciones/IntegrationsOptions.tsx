import Icon from '../Icon'
import { color } from '../ds'

// ── Options index ─────────────────────────────────────────────────────────────
// Chooser between the two approaches to communicate Meta's pricing change.

const INFO = color.information

interface Option {
  n: string
  href: string
  title: string
  tagline: string
  points: string[]
  recommended?: boolean
}

const OPTIONS: Option[] = [
  {
    n: '1',
    href: '/integraciones/opcion-1',
    title: 'Dos columnas',
    tagline: 'Derivación (azul, 3/4) y precios de Meta (blanco, 1/4) lado a lado.',
    points: ['Checkbox + copy + links', 'Cartel de Meta separado', 'Barra de acento azul'],
  },
  {
    n: '2',
    href: '/integraciones/opcion-2',
    title: 'Franja horizontal',
    tagline: 'Todo en una sola fila: título, control y precios de Meta a la derecha.',
    points: ['La más compacta en alto', 'Toggle inline', 'Precios como bloque a la derecha'],
  },
  {
    n: '3',
    href: '/integraciones/opcion-3',
    title: 'Acción-primero',
    tagline: 'Estilo setting de producto: el toggle es el héroe a la derecha.',
    points: ['Toggle grande + estado', 'Meta como nota al pie', 'Card blanca con divisor'],
    recommended: true,
  },
  {
    n: '4',
    href: '/integraciones/opcion-4',
    title: 'Apilado',
    tagline: 'Banner de derivación arriba y una barra de precios de Meta abajo.',
    points: ['Dos filas conectadas', 'Estado dinámico en la barra', 'Ancho completo'],
  },
  {
    n: '5',
    href: '/integraciones/opcion-5',
    title: 'Toggle jerárquico',
    tagline: 'WebChat a la izquierda con jerarquía clara: título, toggle, copy y links.',
    points: ['Estado dentro del toggle', 'Meta blanco a la derecha', 'Menos recargado'],
  },
  {
    n: '6',
    href: '/integraciones/opcion-6',
    title: 'Mínimo (una línea)',
    tagline: 'Una sola línea slim: título, toggle, estado y links.',
    points: ['Ocupa lo mínimo', 'Todo inline', 'Precios como link'],
  },
  {
    n: '7',
    href: '/integraciones/opcion-7',
    title: 'Franja + Meta afuera',
    tagline: 'Franja azul de derivación y el cartel de Meta como card separada a la derecha.',
    points: ['Meta fuera del azul', 'Dos bloques independientes', 'Toggle en la franja'],
  },
]

export default function IntegrationsOptions() {
  return (
    <div style={{ flex: 1, overflow: 'auto', background: color.grey100, fontFamily: "'Roboto', sans-serif" }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 32px 64px' }}>

        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color.grey500 }}>
          WhatsApp · Nueva política de precios de Meta
        </span>
        <h1 style={{ margin: '12px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: '-0.6px', color: color.grey900 }}>
          ¿Cómo comunicamos el cambio?
        </h1>
        <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.6, color: color.grey700, maxWidth: 620 }}>
          Seis versiones gráficas del bloque de derivación a WebChat + precios de Meta. Abrí una y compará; también podés saltar entre todas con el switcher del header.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginTop: 32 }}>
          {OPTIONS.map(opt => (
            <a
              key={opt.n}
              href={opt.href}
              style={{ display: 'flex', flexDirection: 'column', padding: 20, borderRadius: 16, background: '#fff', border: `1px solid ${color.grey200}`, textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'border-color .15s, box-shadow .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = INFO; e.currentTarget.style.boxShadow = '0 6px 20px rgba(48,79,254,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = color.grey200; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: color.infoLight, color: INFO, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {opt.n}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: color.grey500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Opción {opt.n}</span>
                {opt.recommended && (
                  <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 100, background: color.infoLight, color: color.infoDark, fontSize: 12, fontWeight: 700 }}>
                    <Icon name="bolt" size={11} color={color.infoDark} filled />
                    Recomendada
                  </span>
                )}
              </div>

              <h2 style={{ margin: '16px 0 0', fontSize: 20, fontWeight: 800, color: color.grey900 }}>{opt.title}</h2>
              <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.55, color: color.grey600 }}>{opt.tagline}</p>

              <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {opt.points.map(p => (
                  <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, lineHeight: 1.45, color: color.grey800 }}>
                    <Icon name="check_circle" size={16} color={color.success} filled style={{ flexShrink: 0, marginTop: 1 }} />
                    {p}
                  </li>
                ))}
              </ul>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, fontSize: 14, fontWeight: 700, color: INFO }}>
                Ver opción {opt.n}
                <Icon name="arrow_forward" size={17} color={INFO} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
