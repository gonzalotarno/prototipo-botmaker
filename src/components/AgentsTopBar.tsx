import Icon from '../Icon'
import { color } from '../ds'

// Top bar shared by /agente, /agents and /proyecto so the user feels like
// they're on the same screen — only the content area changes between modes.
// The hamburger toggles the rail; bell/help/user are visual stubs for the demo.

interface Props {
  onToggleSidebar?: () => void
  title?: string
}

export default function AgentsTopBar({ onToggleSidebar, title = 'Agents' }: Props) {
  return (
    <header style={{ background: 'white', padding: '0 20px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 11, borderBottom: `1px solid ${color.borderSubtle}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onToggleSidebar}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: color.primary, display: 'flex', alignItems: 'center', padding: '4px 6px', borderRadius: 100 }}
          onMouseEnter={e => (e.currentTarget.style.background = color.primaryUltraLight)}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <Icon name="menu" size={18} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: color.grey900 }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey600 }}
          onMouseEnter={e => (e.currentTarget.style.background = color.grey100)}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        ><Icon name="inbox" size={16} /></button>
        <button
          style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.grey600 }}
          onMouseEnter={e => (e.currentTarget.style.background = color.grey100)}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        ><Icon name="help" size={16} /></button>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 8px', borderRadius: 100, border: 'none', background: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = color.grey100)}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: color.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>Cr</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 11, color: color.grey900, fontWeight: 500, lineHeight: 1.2 }}>Estado</span>
            <span style={{ fontSize: 10, color: color.grey600, lineHeight: 1.2 }}>En línea</span>
          </div>
          <Icon name="expand_more" size={12} color={color.grey500} />
        </button>
      </div>
    </header>
  )
}
