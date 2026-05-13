import { color, font } from '../ds'

// Botón flotante "Volver al inicio" para los devs que están comparando A vs B.
// Aparece sólo en las páginas internas del prototipo (no en la landing).
// Posición: bottom-left, discreto pero siempre accesible.

export default function BackToLandingButton() {
  return (
    <a href="/"
      style={{
        position: 'fixed',
        bottom: 20, left: 20,
        zIndex: 50,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '9px 16px',
        borderRadius: 100,
        background: 'white',
        border: `1px solid ${color.borderDefault}`,
        boxShadow: '0 8px 20px -6px rgba(15,23,42,0.20), 0 2px 6px rgba(15,23,42,0.06)',
        textDecoration: 'none',
        fontSize: 12.5, fontWeight: 600,
        color: color.grey800,
        fontFamily: font.family,
        cursor: 'pointer',
        transition: 'transform 0.12s, box-shadow 0.12s, border-color 0.12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(15,23,42,0.24), 0 2px 6px rgba(15,23,42,0.08)'
        e.currentTarget.style.borderColor = color.primaryLight
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(15,23,42,0.20), 0 2px 6px rgba(15,23,42,0.06)'
        e.currentTarget.style.borderColor = color.borderDefault
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1, color: color.primary }}>←</span>
      Volver al inicio
    </a>
  )
}
