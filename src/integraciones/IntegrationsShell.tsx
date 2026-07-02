import { useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import AgentsTopBar from '../components/AgentsTopBar'
import Icon from '../Icon'
import { color } from '../ds'

// ── Integraciones shell ──────────────────────────────────────────────────────
// Reuses the AI-agents top bar so the section feels part of the same product,
// then layers a breadcrumb sub-header (matching AgentsShell) over the content.

interface Props {
  children: ReactNode
  // Last breadcrumb crumb (e.g. "WhatsApp"). Omit for the options index.
  leaf?: string
}

export default function IntegrationsShell({ children, leaf = 'WhatsApp' }: Props) {
  const [, setShowSidebar] = useState(true)
  const path = typeof window !== 'undefined' ? window.location.pathname : ''

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: color.grey100 }}>

      {/* ── Top bar (shared with /agents) ───────────────────────────────── */}
      <AgentsTopBar title="Canales e Integraciones" onToggleSidebar={() => setShowSidebar(s => !s)} />

      {/* ── Breadcrumb sub-header + options switcher ─────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '8px 20px', borderBottom: `1px solid ${color.borderSubtle}`, background: '#fff', flexShrink: 0, zIndex: 10 }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <a href="/integraciones" style={{ fontSize: 12, fontWeight: 500, color: color.primary, textDecoration: 'none', padding: '4px 8px', borderRadius: 6 }}>
            Canales e Integraciones
          </a>
          <ChevronRight size={12} className="text-slate-300" />
          <a href="/integraciones" style={{ fontSize: 12, fontWeight: 500, color: color.primary, textDecoration: 'none', padding: '4px 8px', borderRadius: 6 }}>
            Canales
          </a>
          <ChevronRight size={12} className="text-slate-300" />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: color.grey900, padding: '4px 8px' }}>
            {leaf}
            <Icon name="info" size={13} color={color.grey500} />
          </span>
        </nav>

        {/* Quick options switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: color.grey500 }}>Ver</span>
          <div style={{ display: 'flex', gap: 2, background: color.grey100, borderRadius: 100, padding: 3 }}>
            {[1, 2, 3, 4, 5, 6, 7].map(n => {
              const href = `/integraciones/opcion-${n}`
              const active = path === href
              return (
                <a
                  key={n}
                  href={href}
                  style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, textDecoration: 'none', color: active ? '#fff' : color.grey700, background: active ? color.primary : 'transparent' }}
                >
                  V{n}
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {children}
      </div>

    </div>
  )
}
