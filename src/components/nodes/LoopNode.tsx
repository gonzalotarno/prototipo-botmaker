import type { NodeProps } from '@xyflow/react'
import { Repeat2 } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function LoopNode({ id, data }: NodeProps<NodeData & Record<string, unknown>>) {
  return (
    <BaseNode
      id={id}
      data={data as NodeData}
      accentColor="#0891b2"
      accentBg="rgba(8,145,178,0.08)"
      icon={<Repeat2 size={14} />}
    />
  )
}
