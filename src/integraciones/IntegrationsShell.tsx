import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import AgentsTopBar from '../components/AgentsTopBar'
import Icon from '../Icon'
import { color } from '../ds'
import WhatsAppChannel from './WhatsAppChannel'

// ── Integraciones shell ──────────────────────────────────────────────────────
// Reuses the AI-agents top bar so the section feels part of the same product,
// then layers a breadcrumb sub-header (matching AgentsShell) over the channel view.

export default function IntegrationsShell() {
  const [, setShowSidebar] = useState(true)

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: color.grey100 }}>

      {/* ── Top bar (shared with /agents) ───────────────────────────────── */}
      <AgentsTopBar title="Canales e Integraciones" onToggleSidebar={() => setShowSidebar(s => !s)} />

      {/* ── Breadcrumb sub-header ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px', borderBottom: `1px solid ${color.borderSubtle}`, background: '#fff', flexShrink: 0, zIndex: 10 }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <a href="/integraciones" style={{ fontSize: 12, fontWeight: 500, color: color.primary, textDecoration: 'none', padding: '4px 6px', borderRadius: 6 }}>
            Canales e Integraciones
          </a>
          <ChevronRight size={12} className="text-slate-300" />
          <a href="/integraciones" style={{ fontSize: 12, fontWeight: 500, color: color.primary, textDecoration: 'none', padding: '4px 6px', borderRadius: 6 }}>
            Canales
          </a>
          <ChevronRight size={12} className="text-slate-300" />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: color.grey900, padding: '4px 6px' }}>
            WhatsApp
            <Icon name="info" size={13} color={color.grey500} />
          </span>
        </nav>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <WhatsAppChannel />
      </div>

    </div>
  )
}
