import { useCallback } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { ChevronDown, Maximize2, MoreVertical, AlertCircle, ChevronRight, Check } from 'lucide-react'
import PromptEditor from '../PromptEditor'
import { useDrawer } from '../../context/DrawerContext'
import type { NodeData, Integration, ActiveIntegration, NodeKind } from '../../types'

const KIND_LABEL: Record<NodeKind, string> = {
  instruction: 'Instrucción',
  condition: 'Condicional',
  loop: 'Loop',
}

interface BaseNodeProps {
  id: string
  data: NodeData
  accentColor: string
  accentBg: string
  icon: React.ReactNode
  allowIntegrations?: boolean
  showTargetHandle?: boolean
  showSourceHandle?: boolean
  sourceHandleBottom?: boolean
}

export default function BaseNode({
  id,
  data,
  accentColor,
  accentBg,
  icon,
  allowIntegrations = false,
  showTargetHandle = true,
  showSourceHandle = true,
  sourceHandleBottom = false,
}: BaseNodeProps) {
  const { updateNodeData } = useReactFlow()
  const { openDrawer } = useDrawer()

  const handleHtmlChange = useCallback(
    (html: string) => {
      // Parse which chip IDs are still present in the HTML and keep only those integrations.
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const chipIds = new Set(
        Array.from(doc.querySelectorAll('[data-chip-id]')).map(el => el.getAttribute('data-chip-id'))
      )
      const activeIntegrations = data.integrations.filter(({ integration }) =>
        chipIds.has(integration.id)
      )
      updateNodeData(id, { promptHtml: html, integrations: activeIntegrations })
    },
    [id, updateNodeData, data.integrations]
  )

  const handleIntegrationAdd = useCallback(
    (integration: Integration, html: string) => {
      const newInt: ActiveIntegration = {
        integration,
        disabledActions: [],
        connectionConfig: Object.fromEntries(integration.connectionFields.map(f => [f.key, ''])),
        accountName: undefined,
      }
      // Single call to avoid race condition with the stale store snapshot.
      updateNodeData(id, { integrations: [newInt], promptHtml: html })
    },
    [id, updateNodeData]
  )

  // Show error port only on instruction nodes that have at least one active integration
  const hasError = allowIntegrations && data.integrations.length > 0

  return (
    <div className="relative" style={{ width: 380 }}>
      {/* Type tab — floats above the card */}
      <div
        className="absolute left-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
        style={{ top: -32, background: accentBg }}
      >
        <span className="flex items-center" style={{ color: accentColor }}>
          {icon}
        </span>
        <span className="text-xs font-semibold" style={{ color: accentColor }}>
          {KIND_LABEL[data.kind]}
        </span>
        <ChevronDown size={11} style={{ color: accentColor }} />
      </div>

      {/* Card */}
      <div
        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)' }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="text-sm font-bold text-slate-800 leading-tight">{data.label}</span>
          <div className="flex items-center gap-1.5">
            <button className="text-slate-400 hover:text-slate-600 nodrag transition-colors p-0.5">
              <Maximize2 size={13} />
            </button>
            <button className="text-slate-400 hover:text-slate-600 nodrag transition-colors p-0.5">
              <MoreVertical size={13} />
            </button>
          </div>
        </div>

        {/* Prompt editor */}
        <PromptEditor
          initialHtml={data.promptHtml}
          onHtmlChange={handleHtmlChange}
          onIntegrationAdd={handleIntegrationAdd}
          allowIntegrations={allowIntegrations}
        />

        {/* Integration rows — only for instruction nodes */}
        {allowIntegrations && data.integrations.length > 0 && (
          <div className="border-t border-slate-100">
            {data.integrations.map(({ integration, accountName }) => (
              <button
                key={integration.id}
                onClick={() => openDrawer(id, integration.id)}
                className="nodrag w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <span className="text-base flex-shrink-0">{integration.icon}</span>
                <span className="text-xs font-medium text-slate-700 flex-1 truncate">
                  Configuración {integration.name}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {accountName ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <AlertCircle size={15} className="text-amber-400" />
                  )}
                  <ChevronRight size={13} className="text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Hint text — only for instruction nodes */}
        {allowIntegrations && (
          <div className="px-4 py-2.5 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Escribe $ o / para desplegar el menú de variables
            </span>
          </div>
        )}
      </div>

      {/* Target handle */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !rounded-full !border-2 !border-slate-300 !bg-white"
        />
      )}

      {/* Source handles */}
      {showSourceHandle && !sourceHandleBottom && !hasError && (
        /* Single output — no integration or integration not active */
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !rounded-full !border-2 !border-slate-300 !bg-white"
        />
      )}
      {showSourceHandle && !sourceHandleBottom && hasError && (
        /* Two outputs: success + error — instruction node with active integration */
        <>
          <Handle
            id="success"
            type="source"
            position={Position.Right}
            style={{ top: '36%' }}
            className="!w-3 !h-3 !rounded-full !border-2 !border-slate-300 !bg-white"
          />
          <span
            className="absolute text-[9px] font-semibold text-slate-400 select-none pointer-events-none"
            style={{ right: -38, top: 'calc(36% - 7px)' }}
          >
            ok
          </span>
          <Handle
            id="error"
            type="source"
            position={Position.Right}
            style={{ top: '72%' }}
            className="!w-3 !h-3 !rounded-full !border-2 !border-rose-400 !bg-white"
          />
          <span
            className="absolute text-[9px] font-semibold text-rose-400 select-none pointer-events-none"
            style={{ right: -38, top: 'calc(72% - 7px)' }}
          >
            error
          </span>
        </>
      )}
      {showSourceHandle && sourceHandleBottom && (
        /* Condition node: yes / no */
        <>
          <Handle
            id="yes"
            type="source"
            position={Position.Right}
            style={{ top: '35%' }}
            className="!w-3 !h-3 !rounded-full !border-2 !border-slate-300 !bg-white"
          />
          <Handle
            id="no"
            type="source"
            position={Position.Right}
            style={{ top: '65%' }}
            className="!w-3 !h-3 !rounded-full !border-2 !border-slate-300 !bg-white"
          />
        </>
      )}
    </div>
  )
}
