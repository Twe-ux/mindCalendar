'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { NodeData } from '@/lib/types'
import { Edit, Tag, Calendar, AlertCircle } from 'lucide-react'

interface MindMapNodeProps extends NodeProps {
  data: NodeData
}

const MindMapNode = memo(({ data }: MindMapNodeProps) => {
  const priorityColors = {
    low: 'bg-green-100 border-green-300',
    medium: 'bg-yellow-100 border-yellow-300',
    high: 'bg-red-100 border-red-300'
  }

  return (
    <div 
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] max-w-[300px] ${priorityColors[data.priority]} bg-white`}
      style={{ borderColor: data.color }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm text-gray-800 flex-1">
          {data.title}
        </h3>
        <button className="ml-2 p-1 hover:bg-gray-200 rounded">
          <Edit size={12} className="text-gray-500" />
        </button>
      </div>

      {data.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {data.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1">
          {data.priority === 'high' && (
            <AlertCircle size={12} className="text-red-500" />
          )}
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            data.priority === 'high' ? 'bg-red-200 text-red-800' :
            data.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
            'bg-green-200 text-green-800'
          }`}>
            {data.priority}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          {data.executionPeriod && (
            <Calendar size={12} className="text-blue-500" />
          )}
          {data.isScheduled && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </div>
      </div>

      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {data.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              <Tag size={8} className="mr-1" />
              {tag}
            </span>
          ))}
          {data.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{data.tags.length - 3}</span>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
})

MindMapNode.displayName = 'MindMapNode'

export default MindMapNode