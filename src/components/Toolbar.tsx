import { useReactFlow } from '@xyflow/react'
import { ZoomIn, ZoomOut, Maximize2, Plus } from 'lucide-react'
import type { NodeData } from '../types'
import type { Node } from '@xyflow/react'

const NODE_TYPES = [
  { type: 'instructionNode', label: 'Instrucción', color: '#304FFE' },
  { type: 'conditionNode', label: 'Condición', color: '#d97706' },
  { type: 'loopNode', label: 'Loop', color: '#0891b2' },
] as const

let nodeCounter = 100

export default function Toolbar() {
  const { zoomIn, zoomOut, fitView, addNodes, getNodes } = useReactFlow()

  const addNode = (type: string) => {
    const nodes = getNodes()
    const maxX = nodes.reduce((max, n) => Math.max(max, n.position.x), 0)

    const newNode: Node<NodeData> = {
      id: `node-${++nodeCounter}`,
      type,
      position: { x: maxX + 340, y: 280 },
      data: {
        kind: (type.replace('Node', '') as NodeData['kind']),
        label: 'Nuevo nodo',
        promptHtml: '',
        integrations: [],
      },
    }
    addNodes([newNode])
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[#E2E7FF] bg-white/90 backdrop-blur-sm shadow-lg shadow-[#304FFE]/8">
      {/* Add nodes */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200">
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest px-1.5">
          Agregar
        </span>
        {NODE_TYPES.map(nt => (
          <button
            key={nt.type}
            onClick={() => addNode(nt.type)}
            title={`Agregar ${nt.label}`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:bg-slate-100 active:scale-95"
            style={{ color: nt.color }}
          >
            <Plus size={11} />
            {nt.label}
          </button>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-0.5 pl-1">
        <button
          onClick={() => zoomOut()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          title="Zoom out"
        >
          <ZoomOut size={15} />
        </button>
        <button
          onClick={() => zoomIn()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          title="Zoom in"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={() => fitView({ padding: 0.15, duration: 600 })}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          title="Ajustar vista"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  )
}
