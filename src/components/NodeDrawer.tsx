import { createPortal } from 'react-dom'
import { useReactFlow } from '@xyflow/react'
import { X, Check, Plus } from 'lucide-react'
import { useDrawer } from '../context/DrawerContext'
import type { NodeData } from '../types'

const MOCK_ACCOUNTS = [
  { id: 'acc-1', email: 'hola@miempresa.com', initial: 'H' },
  { id: 'acc-2', email: 'admin@pizzeria.com', initial: 'A' },
]

export default function NodeDrawer() {
  const { drawerState, closeDrawer } = useDrawer()
  const { getNode, updateNodeData } = useReactFlow()

  if (!drawerState) return null

  const node = getNode(drawerState.nodeId)
  if (!node) return null

  const data = node.data as NodeData
  const activeInt = data.integrations.find(a => a.integration.id === drawerState.integrationId)
  if (!activeInt) return null

  const { integration, disabledActions, connectionConfig, accountName } = activeInt
  const selectedAccount = accountName ?? MOCK_ACCOUNTS[0].email

  const updateAccount = (email: string) => {
    updateNodeData(drawerState.nodeId, {
      integrations: data.integrations.map(a =>
        a.integration.id === drawerState.integrationId ? { ...a, accountName: email } : a
      ),
    })
  }

  const toggleAction = (actionId: string) => {
    const isDisabled = disabledActions.includes(actionId)
    const next = isDisabled
      ? disabledActions.filter(id => id !== actionId)
      : [...disabledActions, actionId]
    updateNodeData(drawerState.nodeId, {
      integrations: data.integrations.map(a =>
        a.integration.id === drawerState.integrationId ? { ...a, disabledActions: next } : a
      ),
    })
  }

  const updateConnectionConfig = (key: string, value: string) => {
    updateNodeData(drawerState.nodeId, {
      integrations: data.integrations.map(a =>
        a.integration.id === drawerState.integrationId
          ? { ...a, connectionConfig: { ...a.connectionConfig, [key]: value } }
          : a
      ),
    })
  }

  const enabledCount = integration.actions.length - disabledActions.length

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(15,15,30,0.15)' }}
        onClick={closeDrawer}
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white"
        style={{
          width: 360,
          borderLeft: '1px solid #E2E7FF',
          boxShadow: '-8px 0 32px rgba(48,79,254,0.1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0"
          style={{ background: integration.bgColor }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'white', boxShadow: `0 2px 8px ${integration.color}22` }}
            >
              {integration.icon}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: integration.color }}>
                {integration.name}
              </p>
              <p className="text-[11px] text-slate-400">{data.label}</p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Account section */}
          <div className="p-5 border-b border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Cuenta conectada
            </p>
            <div className="space-y-1.5">
              {MOCK_ACCOUNTS.map(acc => {
                const isSelected = selectedAccount === acc.email
                return (
                  <button
                    key={acc.id}
                    onClick={() => updateAccount(acc.email)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border"
                    style={{
                      borderColor: isSelected ? `${integration.color}33` : 'transparent',
                      background: isSelected ? integration.bgColor : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: isSelected ? integration.color : '#e2e8f0',
                        color: isSelected ? 'white' : '#64748b',
                      }}
                    >
                      {acc.initial}
                    </div>
                    <span className="text-sm text-slate-700 flex-1">{acc.email}</span>
                    {isSelected && <Check size={14} style={{ color: integration.color }} />}
                  </button>
                )
              })}
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left border border-dashed border-slate-200 hover:border-[#304FFE]/40 hover:bg-[#F0F2FF] transition-all group">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 group-hover:bg-[#304FFE]/10 transition-colors flex-shrink-0">
                  <Plus size={14} className="text-slate-400 group-hover:text-[#304FFE] transition-colors" />
                </div>
                <span className="text-sm text-slate-400 group-hover:text-[#304FFE] transition-colors">
                  Conectar nueva cuenta
                </span>
              </button>
            </div>
          </div>

          {/* Connection config fields */}
          {integration.connectionFields.length > 0 && (
            <div className="p-5 border-b border-slate-100 space-y-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Conexión
              </p>

              {integration.connectionFields.map(field => {
                if (!field.isResourceSelector) {
                  // Auth fields — always shown, no toggle
                  return (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">
                        {field.label}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={connectionConfig[field.key] || ''}
                          onChange={e => updateConnectionConfig(field.key, e.target.value)}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#304FFE]/50 focus:bg-white transition-colors"
                        >
                          <option value="">Seleccionar…</option>
                          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={connectionConfig[field.key] || ''}
                          onChange={e => updateConnectionConfig(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={2}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#304FFE]/50 focus:bg-white transition-colors resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={connectionConfig[field.key] || ''}
                          onChange={e => updateConnectionConfig(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#304FFE]/50 focus:bg-white transition-colors"
                        />
                      )}
                    </div>
                  )
                }

                // Resource selector — shows mode toggle
                const isPinned = !!connectionConfig[field.key]
                return (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-slate-500 mb-2">
                      {field.label}
                    </label>

                    {/* Mode toggle pills */}
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-3 text-xs font-medium">
                      <button
                        onClick={() => updateConnectionConfig(field.key, '')}
                        className="flex-1 py-2 transition-colors"
                        style={{
                          background: !isPinned ? integration.color : '#f8fafc',
                          color: !isPinned ? 'white' : '#94a3b8',
                        }}
                      >
                        Según el prompt
                      </button>
                      <button
                        onClick={() => {
                          // Keep existing value or focus the input
                          if (!connectionConfig[field.key]) updateConnectionConfig(field.key, ' ')
                        }}
                        className="flex-1 py-2 transition-colors"
                        style={{
                          background: isPinned ? integration.color : '#f8fafc',
                          color: isPinned ? 'white' : '#94a3b8',
                        }}
                      >
                        Recurso específico
                      </button>
                    </div>

                    {!isPinned ? (
                      <p className="text-[11px] text-slate-400 bg-slate-50 rounded-xl px-3 py-2.5 leading-relaxed">
                        El agente usará el recurso que el usuario mencione en el prompt. Podés indicarlo directamente ahí, ej: <span className="text-slate-600 font-medium italic">"buscá en la hoja de facturas…"</span>
                      </p>
                    ) : (
                      <input
                        type="text"
                        value={connectionConfig[field.key].trim()}
                        onChange={e => updateConnectionConfig(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        autoFocus
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[#304FFE]/50 focus:bg-white transition-colors"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Actions section */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Acciones disponibles
              </p>
              <span className="text-[10px] font-medium text-slate-400">
                {enabledCount} / {integration.actions.length} activas
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              El agente puede usar las acciones activadas. Desactivá las que no quieras permitir.
            </p>

            <div className="space-y-2">
              {integration.actions.map(action => {
                const isEnabled = !disabledActions.includes(action.id)
                return (
                  <button
                    key={action.id}
                    onClick={() => toggleAction(action.id)}
                    className="w-full flex items-start gap-3 px-3.5 py-3 rounded-xl text-left transition-all border"
                    style={{
                      borderColor: isEnabled ? `${integration.color}30` : '#e2e8f0',
                      background: isEnabled ? integration.bgColor : '#f8fafc',
                    }}
                  >
                    {/* Toggle */}
                    <div
                      className="flex-shrink-0 w-9 h-5 rounded-full relative transition-colors mt-0.5"
                      style={{ background: isEnabled ? integration.color : '#cbd5e1' }}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                        style={{ left: isEnabled ? '18px' : '2px' }}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold leading-tight"
                        style={{ color: isEnabled ? integration.color : '#94a3b8' }}
                      >
                        {action.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {action.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-2.5 flex-shrink-0">
          <button
            onClick={closeDrawer}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all border border-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={closeDrawer}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#304FFE' }}
          >
            Guardar
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
