'use client'

import React from 'react'
import { NodeData } from '@/lib/types'
import { Calendar, Clock, Tag, AlertCircle, CheckCircle } from 'lucide-react'

interface TaskPanelProps {
  tasks: NodeData[]
  onTaskSelect: (task: NodeData) => void
  onScheduleTask: (taskId: string, date: Date) => void
}

export default function TaskPanel({ tasks, onTaskSelect, onScheduleTask }: TaskPanelProps) {
  const unscheduledTasks = tasks.filter(task => !task.isScheduled)
  const scheduledTasks = tasks.filter(task => task.isScheduled)

  const priorityColors = {
    high: 'border-l-red-500 bg-red-50',
    medium: 'border-l-yellow-500 bg-yellow-50',
    low: 'border-l-green-500 bg-green-50'
  }

  const TaskItem = ({ task, isScheduled }: { task: NodeData; isScheduled: boolean }) => (
    <div
      className={`border-l-4 p-3 mb-2 rounded-r-lg cursor-pointer transition-all hover:shadow-md ${
        priorityColors[task.priority]
      }`}
      onClick={() => onTaskSelect(task)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(task))
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-sm text-gray-800 mb-1">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <div className="ml-2 flex items-center">
          {task.priority === 'high' && (
            <AlertCircle size={14} className="text-red-500" />
          )}
          {isScheduled && (
            <CheckCircle size={14} className="text-green-500 ml-1" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.priority === 'high' ? 'bg-red-200 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
            'bg-green-200 text-green-800'
          }`}>
            {task.priority}
          </span>
          
          {task.executionPeriod && (
            <div className="flex items-center">
              <Clock size={12} className="mr-1" />
              <span>{task.executionPeriod.type}: {task.executionPeriod.value instanceof Date ? task.executionPeriod.value.toLocaleDateString() : task.executionPeriod.value}</span>
            </div>
          )}
        </div>

        {task.tags.length > 0 && (
          <div className="flex items-center">
            <Tag size={12} className="mr-1" />
            <span>{task.tags[0]}</span>
            {task.tags.length > 1 && (
              <span className="ml-1">+{task.tags.length - 1}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Calendar size={20} className="mr-2" />
          Panneau des Tâches
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Tâches non planifiées */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <AlertCircle size={16} className="mr-2 text-orange-500" />
            Tâches non planifiées ({unscheduledTasks.length})
          </h4>
          
          {unscheduledTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Toutes les tâches sont planifiées!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {unscheduledTasks.map(task => (
                <TaskItem key={task.id} task={task} isScheduled={false} />
              ))}
            </div>
          )}
        </div>

        {/* Tâches planifiées */}
        {scheduledTasks.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <CheckCircle size={16} className="mr-2 text-green-500" />
              Tâches planifiées ({scheduledTasks.length})
            </h4>
            
            <div className="space-y-2">
              {scheduledTasks.map(task => (
                <TaskItem key={task.id} task={task} isScheduled={true} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="mb-2">💡 <strong>Glisser-déposer</strong> une tâche vers le calendrier pour la planifier</p>
          <p>📋 Les tâches issues de la Mind Map sont marquées en vert dans le calendrier</p>
        </div>
      </div>
    </div>
  )
}