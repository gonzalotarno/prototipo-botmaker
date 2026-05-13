import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Connection,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import InstructionNode from './nodes/InstructionNode'
import ConditionNode from './nodes/ConditionNode'
import LoopNode from './nodes/LoopNode'
import Toolbar from './Toolbar'
import NodeDrawer from './NodeDrawer'

import { initialNodes, initialEdges } from '../data/pizzaFlow'

const nodeTypes = {
  instructionNode: InstructionNode,
  conditionNode: ConditionNode,
  loopNode: LoopNode,
}

const edgeDefaults = {
  animated: true,
  style: { stroke: '#304FFE44', strokeWidth: 2 },
  labelStyle: { fill: '#64748b', fontSize: 10, fontFamily: 'Inter' },
  labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
}

const LS_NODES_KEY = 'automation_canvas_nodes'
const LS_EDGES_KEY = 'automation_canvas_edges'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    // ignore parse errors
  }
  return fallback
}

export default function AutomationCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    loadFromStorage(LS_NODES_KEY, initialNodes as any)
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    loadFromStorage(LS_EDGES_KEY, initialEdges)
  )

  useEffect(() => {
    try { localStorage.setItem(LS_NODES_KEY, JSON.stringify(nodes)) } catch { /* quota exceeded */ }
  }, [nodes])

  useEffect(() => {
    try { localStorage.setItem(LS_EDGES_KEY, JSON.stringify(edges)) } catch { /* quota exceeded */ }
  }, [edges])

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges(eds => addEdge({ ...connection, ...edgeDefaults }, eds)),
    [setEdges]
  )

  return (
    <>
      <div className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={edgeDefaults}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#304FFE18" />
          <MiniMap
            style={{
              background: '#ffffff',
              border: '1px solid #E2E7FF',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(48,79,254,0.08)',
            }}
            maskColor="rgba(240,242,255,0.7)"
            nodeColor={node => {
              const colors: Record<string, string> = {
                triggerNode: '#16a34a',
                instructionNode: '#304FFE',
                conditionNode: '#d97706',
                actionNode: '#7c3aed',
              }
              return colors[node.type ?? ''] ?? '#304FFE44'
            }}
          />
          <Toolbar />
        </ReactFlow>
      </div>

      {/* NodeDrawer renders via portal but needs ReactFlow context */}
      <NodeDrawer />
    </>
  )
}
