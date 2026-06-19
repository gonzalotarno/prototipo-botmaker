import { useState } from 'react'

// Botón flotante "Volver a primeros pasos" — aparece solo cuando el usuario
// está en medio del onboarding (flag en sessionStorage) y navegó a otra
// superficie (editor de agentes, conversaciones). Permite retomar el flujo.
export default function OnboardingReturnButton() {
  const active = (() => {
    try { return sessionStorage.getItem('bm_onboarding_active') === '1' } catch { return false }
  })()
  const [hover, setHover] = useState(false)
  if (!active) return null
  return (
    <a
      href="/onboarding"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'fixed', bottom: 20, left: 20, zIndex: 9999,
        display: 'inline-flex', alignItems: 'center', gap: 9,
        padding: '10px 18px 10px 14px', borderRadius: 999,
        background: '#304FFE', color: '#fff', textDecoration: 'none',
        fontFamily: "'Roboto', system-ui, sans-serif", fontSize: 13.5, fontWeight: 600,
        boxShadow: hover ? '0 12px 32px -8px rgba(48,79,254,0.55)' : '0 6px 20px -6px rgba(48,79,254,0.45)',
        transform: hover ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'all 220ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <span className="material-symbols-rounded" style={{ fontSize: 19, fontVariationSettings: "'FILL' 0, 'wght' 500" }}>arrow_back</span>
      Volver a primeros pasos
    </a>
  )
}
