import { color, font, radius } from './ds'

// Landing simple para los devs que están testeando.
// Foco en mostrar que hay 2 versiones (A actual vs B variante) para comparar.
// El Orquestador queda como link secundario al pie.

interface VersionCard {
  href:        string
  letter:      'A' | 'B'
  badge:       string
  title:       string
  tagline:     string
  bullets:     string[]
}

const VERSIONS: VersionCard[] = [
  {
    href:    '/agente',
    letter:  'A',
    badge:   'Versión actual',
    title:   'Empty state clásico + drawer',
    tagline: 'Lo que ya está implementado en el producto.',
    bullets: [
      'Cuando entrás a MCP / Apps / Códigos arrancás en un empty state centrado.',
      'Para agregar un recurso, abrís un drawer con el catálogo del workspace.',
      'Pensado para mostrar la solución como ya estaba.',
    ],
  },
  {
    href:    '/agente-v2',
    letter:  'B',
    badge:   'Variante propuesta',
    title:   'Catálogo siempre visible + modal',
    tagline: 'Probamos hacer la experiencia más directa.',
    bullets: [
      'Catálogo del workspace ya visible al entrar — los recursos disponibles "están a un click".',
      'Para agregar uno, abre un modal limpio con sólo lo necesario (cuándo se activa, qué tools, qué cuenta).',
      'Empty states reales en cada tab, sin diluirse en banners.',
    ],
  },
]

export default function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F2FF',
      fontFamily: font.family,
      display: 'flex', flexDirection: 'column',
    }}>
      <main style={{
        flex: 1,
        width: '100%', maxWidth: 1080,
        margin: '0 auto',
        padding: '72px 24px 80px',
        boxSizing: 'border-box',
      }}>

        {/* Hero — corto, claro */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: color.primary,
            background: color.primaryUltraLight,
            border: `1px solid ${color.primaryLight}`,
            borderRadius: 100, padding: '4px 10px',
            marginBottom: 16,
          }}>
            Prototipo · 2 versiones para comparar
          </span>
          <h1 style={{
            margin: 0, fontSize: 38, fontWeight: 800, color: color.grey900,
            letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>
            Agentes IA · Botmaker
          </h1>
          <p style={{
            margin: '14px auto 0', fontSize: 15, color: color.grey600,
            maxWidth: 560, lineHeight: 1.55,
          }}>
            Tenemos dos formas de que el usuario sume MCPs, apps y códigos al
            agente. Probá las dos y decinos cuál se siente más simple.
          </p>
        </div>

        {/* Comparación A vs B */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {VERSIONS.map(v => (
            <a key={v.href}
              href={v.href}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', gap: 16,
                padding: '28px 26px 24px',
                background: 'white',
                border: `1px solid ${color.borderDefault}`,
                borderRadius: radius.lg,
                textDecoration: 'none',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
              }}
              onMouseEnter={el => {
                el.currentTarget.style.transform = 'translateY(-3px)'
                el.currentTarget.style.boxShadow = '0 16px 32px -10px rgba(48,79,254,0.20), 0 4px 10px rgba(15,23,42,0.05)'
                el.currentTarget.style.borderColor = color.primaryLight
              }}
              onMouseLeave={el => {
                el.currentTarget.style.transform = 'translateY(0)'
                el.currentTarget.style.boxShadow = 'none'
                el.currentTarget.style.borderColor = color.borderDefault
              }}
            >
              {/* Letter mark + badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: color.primary, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em',
                  boxShadow: '0 8px 20px -6px rgba(48,79,254,0.45)',
                }}>{v.letter}</div>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '5px 10px', borderRadius: 100,
                  color: color.grey700, background: color.grey100,
                }}>{v.badge}</span>
              </div>

              {/* Title + tagline */}
              <div>
                <h2 style={{
                  margin: 0, fontSize: 18, fontWeight: 700, color: color.grey900,
                  letterSpacing: '-0.01em', lineHeight: 1.25,
                }}>
                  Versión {v.letter} · {v.title}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: color.grey500 }}>
                  {v.tagline}
                </p>
              </div>

              <div style={{ height: 1, background: color.borderSubtle, margin: '2px 0' }} />

              {/* Bullets */}
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {v.bullets.map((b, i) => (
                  <li key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    fontSize: 13, color: color.grey700, lineHeight: 1.5,
                  }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      background: color.primaryUltraLight, color: color.primary,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, marginTop: 2,
                    }}>•</span>
                    {b}
                  </li>
                ))}
              </ul>

              {/* CTA pill */}
              <div style={{
                marginTop: 4,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 100,
                background: color.primary, color: 'white',
                fontSize: 13, fontWeight: 700,
                alignSelf: 'flex-start',
              }}>
                Probar versión {v.letter} <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
              </div>
            </a>
          ))}
        </div>

        {/* Secondary links — proyecto + métricas */}
        <div style={{
          marginTop: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24,
          fontSize: 13, color: color.grey600, flexWrap: 'wrap',
        }}>
          <a href="/bienvenida" style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: color.primary, fontWeight: 600, textDecoration: 'none',
          }}>First-time state →</a>
          <span style={{ color: color.grey300 }}>·</span>
          <a href="/proyecto" style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: color.primary, fontWeight: 600, textDecoration: 'none',
          }}>Vista de orquestador →</a>
          <span style={{ color: color.grey300 }}>·</span>
          <a href="/metricas" style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: color.primary, fontWeight: 600, textDecoration: 'none',
          }}>Métricas del lanzamiento →</a>
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: 56, padding: '14px 18px',
          background: 'white',
          border: `1px dashed ${color.borderDefault}`,
          borderRadius: radius.md,
          fontSize: 12, color: color.grey500, lineHeight: 1.6, textAlign: 'center',
        }}>
          Datos mockeados — los cambios no persisten al recargar. Algunas acciones tienen
          un loading de ~1.5s simulando la red real. Reportá feedback directo a Gonzalo.
        </div>
      </main>
    </div>
  )
}
