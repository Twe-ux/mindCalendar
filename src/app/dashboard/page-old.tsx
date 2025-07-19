'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import MindMapComponent from '@/components/MindMap/MindMapComponent'
import CalendarComponent from '@/components/Calendar/CalendarComponent'
import { CalendarEvent, NodeData } from '@/lib/types'
import { Brain, Calendar, RotateCw, LogOut, User, Settings, Home, ChevronLeft, ChevronRight, Plus } from 'lucide-react'


export default function Dashboard() {
  const { data: session, status } = useSession()
  const [activeView, setActiveView] = useState<'dashboard' | 'mindmap' | 'calendar'>('dashboard')
  const [tasks, setTasks] = useState<NodeData[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggedTask, setDraggedTask] = useState<NodeData | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Fonction pour charger les données depuis MongoDB
  const fetchData = useCallback(async () => {
    if (session?.user?.email) {
      try {
        setLoading(true)
        setError(null)
        
        // Récupérer les tâches
        const tasksResponse = await fetch('/api/mindmap')
        if (!tasksResponse.ok) throw new Error('Erreur lors du chargement des tâches')
        const tasksData = await tasksResponse.json()
        
        // Récupérer les événements
        const eventsResponse = await fetch('/api/calendar')
        if (!eventsResponse.ok) throw new Error('Erreur lors du chargement des événements')
        const eventsData = await eventsResponse.json()
        
        // Transformer les données pour correspondre aux interfaces
        const formattedTasks = tasksData.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description || '',
          color: task.color,
          priority: task.priority,
          tags: task.tags || [],
          executionPeriod: task.executionPeriod,
          isScheduled: task.isScheduled,
          x: task.x || 0,
          y: task.y || 0,
        }))
        
        const formattedEvents = eventsData.map((event: any) => ({
          id: event._id,
          userId: event.userId,
          title: event.title,
          description: event.description || '',
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          mindMapNodeId: event.mindMapNodeId,
          isFromMindMap: event.isFromMindMap,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }))
        
        setTasks(formattedTasks)
        setEvents(formattedEvents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
        console.error('Erreur lors du chargement des données:', err)
      } finally {
        setLoading(false)
      }
    }
  }, [session?.user?.email])
  
  // Charger les données au montage du composant
  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-zinc-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <Brain size={48} className="mx-auto text-blue-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">MindMap Calendar</h1>
            <p className="text-gray-600 mt-2">
              Transformez vos idées en tâches planifiées
            </p>
          </div>
          <button
            onClick={() => signIn('google')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <User size={20} className="mr-2" />
            Se connecter avec Google
          </button>
        </div>
      </div>
    )
  }

  const handleDragStart = (event: DragStartEvent) => {
    const taskData = event.active.data.current as NodeData
    setDraggedTask(taskData)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedTask(null)
    
    if (event.over && event.over.id === 'calendar-drop-zone') {
      const taskData = event.active.data.current as NodeData
      if (taskData && !taskData.isScheduled) {
        scheduleTask(taskData.id, new Date())
      }
    }
  }

  const scheduleTask = async (taskId: string, date: Date) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    
    try {
      // Créer l'événement dans la base de données
      const eventData = {
        title: task.title,
        description: task.description,
        startDate: date,
        endDate: new Date(date.getTime() + 2 * 60 * 60 * 1000),
        mindMapNodeId: task.id,
        isFromMindMap: true,
      }
      
      const eventResponse = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })
      
      if (!eventResponse.ok) throw new Error('Erreur lors de la création de l\'événement')
      const newEvent = await eventResponse.json()
      
      // Mettre à jour la tâche comme planifiée
      const taskResponse = await fetch('/api/mindmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, isScheduled: true }),
      })
      
      if (!taskResponse.ok) throw new Error('Erreur lors de la mise à jour de la tâche')
      
      // Mettre à jour l'état local
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, isScheduled: true } : t
      ))
      
      setEvents(prev => [...prev, {
        id: newEvent._id,
        userId: newEvent.userId,
        title: newEvent.title,
        description: newEvent.description || '',
        startDate: new Date(newEvent.startDate),
        endDate: new Date(newEvent.endDate),
        mindMapNodeId: newEvent.mindMapNodeId,
        isFromMindMap: newEvent.isFromMindMap,
        createdAt: new Date(newEvent.createdAt),
        updatedAt: new Date(newEvent.updatedAt),
      }])
      
    } catch (err) {
      console.error('Erreur lors de la planification:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la planification')
    }
  }

  const createTestTask = async () => {
    if (!session?.user?.email) return
    
    try {
      const testTask = {
        title: `Tâche test ${Date.now()}`,
        description: 'Tâche créée pour tester la sauvegarde MongoDB',
        x: Math.random() * 500,
        y: Math.random() * 500,
        color: '#3b82f6',
        priority: 'medium',
        tags: ['test'],
        isScheduled: false,
        connections: []
      }
      
      console.log('Création d\'une tâche de test:', testTask)
      
      const response = await fetch('/api/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testTask)
      })
      
      if (response.ok) {
        const newTask = await response.json()
        console.log('Tâche créée avec succès:', newTask)
        
        // Ajouter à l'état local
        setTasks(prev => [...prev, {
          id: newTask._id,
          title: newTask.title,
          description: newTask.description || '',
          color: newTask.color,
          priority: newTask.priority,
          tags: newTask.tags || [],
          isScheduled: newTask.isScheduled,
        }])
        
        setError(null)
      } else {
        const errorData = await response.json()
        console.error('Erreur lors de la création:', errorData)
        setError(`Erreur: ${errorData.error}`)
      }
    } catch (err) {
      console.error('Erreur réseau:', err)
      setError('Erreur de connexion')
    }
  }

  const handleGoogleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/google-sync?action=import')
      const result = await response.json()
      
      if (response.ok) {
        console.log('Synchronisation réussie:', result.message)
      } else {
        console.error('Erreur de synchronisation:', result.error)
      }
    } catch (error) {
      console.error('Erreur réseau:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-zinc-100 flex">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 ease-out flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Brain size={18} className="text-white" />
                  </div>
                  <h1 className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    MindCalendar
                  </h1>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeView === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Home size={18} className={sidebarCollapsed ? '' : 'mr-3'} />
                {!sidebarCollapsed && 'Dashboard'}
              </button>
              <button
                onClick={() => setActiveView('mindmap')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeView === 'mindmap'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Brain size={18} className={sidebarCollapsed ? '' : 'mr-3'} />
                {!sidebarCollapsed && 'Mind Map'}
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeView === 'calendar'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Calendar size={18} className={sidebarCollapsed ? '' : 'mr-3'} />
                {!sidebarCollapsed && 'Calendrier'}
              </button>
            </div>
          </div>

          {/* Tasks Section */}
          {!sidebarCollapsed && (activeView === 'mindmap' || activeView === 'calendar') && (
            <div className="flex-1 px-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Tâches & Idées</h3>
                <button 
                  onClick={createTestTask}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Ajouter une tâche de test"
                >
                  <Plus size={14} className="text-slate-500" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasks.filter(task => !task.isScheduled).length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    <Brain size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune tâche en attente</p>
                  </div>
                ) : (
                  tasks.filter(task => !task.isScheduled).map((task) => (
                  <div
                    key={task.id}
                    className="group p-3 bg-white rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', JSON.stringify(task))
                      setDraggedTask(task)
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: task.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-800 truncate">{task.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* User Profile */}
          <div className="p-4 border-t border-slate-200/60">
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={session.user?.image || ''}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{session.user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleGoogleSync}
                    disabled={isSyncing}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Synchroniser avec Google"
                  >
                    <RotateCw size={14} className={`text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Se déconnecter"
                  >
                    <LogOut size={14} className="text-slate-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={session.user?.image || ''}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <button
                  onClick={() => signOut()}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut size={14} className="text-slate-500" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Top Bar */}
          <div className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {activeView === 'dashboard' ? 'Tableau de bord' : 
                 activeView === 'mindmap' ? 'Mind Map' : 'Calendrier'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={createTestTask}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                Test MongoDB
              </button>
              {isSyncing && (
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <RotateCw size={16} className="animate-spin" />
                  <span>Synchronisation...</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-medium">!</span>
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <ChevronRight size={16} className="rotate-45" />
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeView === 'dashboard' && (
              <div className="h-full overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Tâches totales</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{tasks.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Brain size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Événements</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">{events.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                          <Calendar size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Planifiées</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{tasks.filter(t => t.isScheduled).length}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                          <RotateCw size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">En attente</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">{tasks.filter(t => !t.isScheduled).length}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center">
                          <Plus size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settings Section */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/60">
                    <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                      <Settings className="mr-3" size={24} />
                      Réglages et préférences
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-slate-50/80 rounded-xl p-6 border border-slate-200/40">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-2">Synchronisation Google Calendar</h4>
                            <p className="text-sm text-slate-600">Synchroniser automatiquement avec Google Calendar</p>
                          </div>
                          <button
                            onClick={handleGoogleSync}
                            disabled={isSyncing}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-blue-500/25"
                          >
                            <RotateCw size={16} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Sync...' : 'Synchroniser'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50/80 rounded-xl p-6 border border-slate-200/40">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-2">Notifications</h4>
                            <p className="text-sm text-slate-600">Recevoir des notifications pour les tâches</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeView === 'mindmap' && (
              <div className="h-full">
                <MindMapComponent 
                  tasks={tasks}
                  onTaskUpdate={(updatedTasks) => {
                    setTasks(updatedTasks)
                    // Rafraîchir les données depuis la base
                    fetchData()
                  }}
                />
              </div>
            )}
            
            {activeView === 'calendar' && (
              <div id="calendar-drop-zone" className="h-full">
                <CalendarComponent
                  events={events}
                  onSelectEvent={(event) => console.log('Event selected:', event)}
                  onSelectSlot={(slot) => console.log('Slot selected:', slot)}
                />
              </div>
            )}
          </div>
        </div>

        <DragOverlay>
          {draggedTask ? (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-lg opacity-90">
              <h4 className="font-medium text-sm">{draggedTask.title}</h4>
              <p className="text-xs text-gray-600">{draggedTask.description}</p>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}