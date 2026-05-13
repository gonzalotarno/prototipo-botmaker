import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AgentsShell from './AgentsShell'
import AgentDetail from './AgentDetail'
import KanbanView from './KanbanView'
import HistorialDemo from './HistorialDemo'
import Landing from './Landing'
import Home from './Home'
import HomeOptions from './HomeOptions'
import Metrics from './Metrics'
import AgentesFirstTime from './AgentesFirstTime'
import BackToLandingButton from './components/BackToLandingButton'

// Support `?path=/agents&embed=1` for iframe embedding (portfolio).
const params = new URLSearchParams(window.location.search)
const queryPath = params.get('path')
const isEmbed = params.get('embed') === '1'
const path = queryPath ?? window.location.pathname

// Embed mode: block in-iframe navigation (breadcrumbs, links) so users
// don't bounce to 404s on the parent app.
if (isEmbed) {
  // Neutralize `window.location.href = '/foo'` writes (used by breadcrumbs).
  try {
    const desc = Object.getOwnPropertyDescriptor(Location.prototype, 'href')
    if (desc?.set) {
      Object.defineProperty(Location.prototype, 'href', {
        ...desc,
        set: () => {},
        configurable: true,
      })
    }
  } catch {}
  // Block <a> clicks at capture phase.
  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as Element | null)?.closest('a')
      if (a && a.getAttribute('href')) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    true
  )
  // Mark embed in body for optional CSS hooks.
  document.documentElement.dataset.embed = '1'
}

// Extract tab from /agente[-v2]/:tab routes
const agentTabMatch = path.match(/^\/agente(?:-v2)?\/(\w+)/)
const initialTab = agentTabMatch ? agentTabMatch[1] : undefined
const isV2 = path.startsWith('/agente-v2')

function App() {
  // `/` es la landing de opciones (A vs B) para revisar con el CEO.
  // `/home-a` y `/home-b` son las dos versiones de la Home.
  // `/dev` queda como landing de devs para comparar versiones A vs B del flow.
  // Las superficies internas siguen accesibles por path directo.
  if (path === '/') return <HomeOptions />
  if (path === '/home-a') return <><Home variant="a" /><BackToLandingButton /></>
  if (path === '/home-b') return <><Home variant="b" /><BackToLandingButton /></>
  if (path === '/home-c') return <><Home variant="c" /><BackToLandingButton /></>
  if (path === '/home-d') return <><Home variant="d" /><BackToLandingButton /></>
  if (path === '/dev') return <Landing />
  if (path === '/metricas') return <><Metrics /><BackToLandingButton /></>
  if (path === '/bienvenida') return <><AgentesFirstTime /><BackToLandingButton /></>

  let page: JSX.Element
  if (path === '/proyecto')                         page = <AgentsShell />
  else if (path === '/flow' || path === '/agents') page = <AgentsShell />
  else if (path.startsWith('/agente'))             page = <AgentDetail initialTab={initialTab} variant={isV2 ? 'v2' : 'v1'} />
  else if (path === '/kanban')                     page = <KanbanView />
  else if (path === '/historial-demo')             page = <HistorialDemo />
  else                                             page = <AgentsShell />

  return (
    <>
      {page}
      {!isEmbed && <BackToLandingButton />}
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
