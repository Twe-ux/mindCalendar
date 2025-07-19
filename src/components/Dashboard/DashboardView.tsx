'use client'

import React from 'react'
import { Brain, Calendar, RotateCw, Plus, Settings } from 'lucide-react'
import { NodeData, CalendarEvent } from '@/lib/types'

interface DashboardViewProps {
  tasks: NodeData[]
  events: CalendarEvent[]
  isSyncing: boolean
  onGoogleSync: () => void
}

export default function DashboardView({ tasks, events, isSyncing, onGoogleSync }: DashboardViewProps) {
  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-300 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tâches totales</p>
                <p className="text-3xl font-bold text-teal-600">{tasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                <Brain size={24} className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-300 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Événements</p>
                <p className="text-3xl font-bold text-teal-600">{events.length}</p>
              </div>
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-300 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planifiées</p>
                <p className="text-3xl font-bold text-teal-600">{tasks.filter(t => t.isScheduled).length}</p>
              </div>
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                <RotateCw size={24} className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-300 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-3xl font-bold text-teal-600">{tasks.filter(t => !t.isScheduled).length}</p>
              </div>
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                <Plus size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tâches récentes</h3>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {task.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">{task.title}</h4>
                    <p className="text-xs text-gray-500 truncate">{task.description}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">Aucune tâche créée</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Événements à venir</h3>
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Calendar size={16} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">{event.title}</h4>
                    <p className="text-xs text-gray-500">
                      {event.startDate.toLocaleDateString('fr-FR')} à {event.startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {event.isFromMindMap && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                      MindMap
                    </span>
                  )}
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">Aucun événement planifié</p>
              )}
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Settings className="mr-3" size={24} />
            Réglages et préférences
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Synchronisation Google Calendar</h4>
                  <p className="text-sm text-gray-600">Synchroniser automatiquement avec Google Calendar</p>
                </div>
                <button
                  onClick={onGoogleSync}
                  disabled={isSyncing}
                  className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-all duration-200"
                >
                  <RotateCw size={16} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sync...' : 'Synchroniser'}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Notifications</h4>
                  <p className="text-sm text-gray-600">Recevoir des notifications pour les tâches</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}