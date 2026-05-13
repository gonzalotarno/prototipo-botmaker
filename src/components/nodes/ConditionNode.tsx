import type { NodeProps } from '@xyflow/react'
import { GitFork } from 'lucide-react'
import BaseNode from './BaseNode'
import type { NodeData } from '../../types'

export default function ConditionNode({ id, data }: NodeProps<NodeData & Record<string, unknown>>) {
  return (
    <BaseNode
      id={id}
      data={data as NodeData}
      accentColor="#d97706"
      accentBg="rgba(217,119,6,0.08)"
      icon={<GitFork size={14} />}
      sourceHandleBottom
    />
  )
}
