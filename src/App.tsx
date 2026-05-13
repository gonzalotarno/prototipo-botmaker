import { ReactFlowProvider } from '@xyflow/react'
import AutomationCanvas from './components/AutomationCanvas'
import { DrawerProvider } from './context/DrawerContext'
import WebChat from './components/WebChat'
import { ChevronRight, Home } from 'lucide-react'

export default function App() {
  return (
    <DrawerProvider>
      <div className="w-screen h-screen bg-[#F0F2FF] overflow-hidden flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-[#E2E7FF] bg-white z-20 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5">
              <button
                onClick={() => { window.location.href = '/' }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-xs font-medium transition-all"
              >
                <Home size={11} /> Inicio
              </button>
              <ChevronRight size={12} className="text-slate-300" />
              <button
                onClick={() => { window.location.href = '/orquestador' }}
                className="inline-flex items-center px-2 py-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-xs font-medium transition-all"
              >
                🍕 Pizzería Bella Italia
              </button>
              <ChevronRight size={12} className="text-slate-300" />
              <button
                onClick={() => { window.location.href = '/agente' }}
                className="inline-flex items-center px-2 py-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-xs font-medium transition-all"
              >
                Toma de Pedidos
              </button>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-xs font-semibold text-slate-800 px-2 py-1">Flujo Principal</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Activo
            </span>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all border border-slate-200">
              Guardar
            </button>
            <button
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#304FFE' }}
            >
              Publicar
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <AutomationCanvas />
          </ReactFlowProvider>
        </div>

        {/* Hint bar */}
        <div className="px-5 py-2 border-t border-[#E2E7FF] bg-white flex items-center gap-4 flex-shrink-0">
          <p className="text-xs text-slate-500">
            Escribí{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-600 text-[11px]">/</kbd>{' '}
            o{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-600 text-[11px]">$</kbd>{' '}
            dentro del prompt de un nodo para agregar integraciones (Google Sheets, WhatsApp, Gmail y más)
          </p>
        </div>
      </div>
      <WebChat />
    </DrawerProvider>
  )
}
