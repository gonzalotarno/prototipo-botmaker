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
    title: 'Versión 1',
    tagline: 'Alert amarillo con borde + card de derivación. Columna "Derivar" en recuadro.',
    points: ['Aviso de precios en caja', 'Checkbox + modal de costo', 'Columna con recuadro azul'],
  },
  {
    n: '2',
    href: '/integraciones/opcion-2',
    title: 'Versión 2',
    tagline: 'Más prolija: franja de precios fina, derivación protagonista y tabla sin cajas.',
    points: ['Aviso fino (menos peso)', 'Derivación más destacada', 'Columna sin caja (checkbox + link)'],
    recommended: true,
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
