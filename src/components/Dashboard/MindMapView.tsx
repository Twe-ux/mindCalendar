'use client'

import React from 'react'
import MindMapComponent from '@/components/MindMap/MindMapComponent'
import { NodeData } from '@/lib/types'

interface MindMapViewProps {
  tasks: NodeData[]
  onTaskUpdate: (tasks: NodeData[]) => void
}

export default function MindMapView({ tasks, onTaskUpdate }: MindMapViewProps) {
  return (
    <div className="h-full">
      <MindMapComponent 
        tasks={tasks}
        onTaskUpdate={onTaskUpdate}
      />
    </div>
  )
}