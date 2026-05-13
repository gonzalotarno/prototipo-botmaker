import type { NodeProps } from '@xyflow/react'
import { MessageSquare } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function InstructionNode({ id, data }: NodeProps<NodeData & Record<string, unknown>>) {
  return (
    <BaseNode
      id={id}
      data={data as NodeData}
      accentColor="#304FFE"
      accentBg="rgba(48,79,254,0.08)"
      icon={<MessageSquare size={14} />}
      allowIntegrations
    />
  )
}
