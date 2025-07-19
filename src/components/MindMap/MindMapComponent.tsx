'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  NodeTypes,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useSession } from 'next-auth/react'

import MindMapNode from './MindMapNode'
import { NodeData } from '@/lib/types'
import { Plus, Loader2 } from 'lucide-react'

const nodeTypes: NodeTypes = {
  mindMapNode: MindMapNode,
}

interface MindMapComponentProps {
  tasks?: NodeData[]
  onTaskUpdate?: (tasks: NodeData[]) => void
}

export default function MindMapComponent({ tasks = [], onTaskUpdate }: MindMapComponentProps) {
  const { data: session } = useSession()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  
  // Convertir les tâches en noeuds React Flow
  useEffect(() => {
    const flowNodes = tasks.map((task, index) => ({
      id: task.id,
      type: 'mindMapNode',
      position: { 
        x: task.x || (250 + (index % 3) * 200), 
        y: task.y || (100 + Math.floor(index / 3) * 150) 
      },
      data: task,
    }))
    
    setNodes(flowNodes)
    
    // Créer des connexions simples pour l'exemple
    const flowEdges = tasks.slice(1).map((task, index) => ({
      id: `e-${tasks[0]?.id || '1'}-${task.id}`,
      source: tasks[0]?.id || '1',
      target: task.id,
      animated: true,
    }))
    
    setEdges(flowEdges)
  }, [tasks, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id)
  }, [])

  const addNewNode = useCallback(async () => {
    if (!session?.user?.email) {
      setError('Vous devez être connecté pour créer une tâche')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const newTaskData = {
        title: 'Nouvelle idée',
        description: 'Description de la nouvelle idée',
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
        color: '#8b5cf6',
        priority: 'medium' as const,
        tags: ['mindmap'],
        isScheduled: false,
        connections: []
      }
      
      console.log('Création d\'une nouvelle tâche:', newTaskData)
      
      const response = await fetch('/api/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskData)
      })
      
      if (response.ok) {
        const savedTask = await response.json()
        console.log('Tâche créée avec succès:', savedTask)
        
        const newTask: NodeData = {
          id: savedTask._id,
          title: savedTask.title,
          description: savedTask.description,
          color: savedTask.color,
          priority: savedTask.priority,
          tags: savedTask.tags || [],
          isScheduled: savedTask.isScheduled,
          x: savedTask.x,
          y: savedTask.y
        }
        
        // Informer le composant parent de la mise à jour
        if (onTaskUpdate) {
          onTaskUpdate([...tasks, newTask])
        }
        
      } else {
        const errorData = await response.json()
        console.error('Erreur lors de la création:', errorData)
        setError(`Erreur: ${errorData.error}`)
      }
    } catch (err) {
      console.error('Erreur réseau:', err)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [session, tasks, onTaskUpdate])

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button
          onClick={addNewNode}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          {loading ? 'Création...' : 'Nouvelle idée'}
        </button>
        
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm max-w-xs">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div ref={reactFlowWrapper} className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              const nodeData = node.data as NodeData
              return nodeData.color || '#3b82f6'
            }}
            className="bg-white border border-gray-300"
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="#e5e7eb"
          />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="absolute top-4 right-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
          <h3 className="font-semibold text-lg mb-2">Détails du nœud</h3>
          <p className="text-sm text-gray-600">
            Nœud sélectionné: {selectedNode}
          </p>
          <button
            onClick={() => setSelectedNode(null)}
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  )
}