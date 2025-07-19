'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { CalendarEvent, NodeData } from '@/lib/types'
import { Brain, Calendar, Home, LogOut, User, ChevronRight } from 'lucide-react'

// Import des composants routes séparées
import DashboardView from '@/components/Dashboard/DashboardView'
import MindMapView from '@/components/Dashboard/MindMapView'
import CalendarView from '@/components/Dashboard/CalendarView'
import Sidebar from '@/components/Dashboard/Sidebar'

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
      <div className="min-h-screen flex items-center justify-center bg-teal-500">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
          <p className="text-white font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-500">
        <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">MindMap Calendar</h1>
            <p className="text-gray-600 mt-2">
              Transformez vos idées en tâches planifiées
            </p>
          </div>
          <button
            onClick={() => signIn('google')}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <User size={20} className="mr-2" />
            Se connecter avec Google
          </button>
        </div>
      </div>
    )
  }

  const createTestTask = async () => {
    if (!session?.user?.email) return
    
    try {
      const testTask = {
        title: `Tâche test ${Date.now()}`,
        description: 'Tâche créée pour tester la sauvegarde MongoDB',
        x: Math.random() * 500,
        y: Math.random() * 500,
        color: '#15a990',
        priority: 'medium',
        tags: ['test'],
        isScheduled: false,
        connections: []
      }
      
      const response = await fetch('/api/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testTask)
      })
      
      if (response.ok) {
        const newTask = await response.json()
        setTasks(prev => [...prev, {
          id: newTask._id,
          title: newTask.title,
          description: newTask.description || '',
          color: newTask.color,
          priority: newTask.priority,
          tags: newTask.tags || [],
          isScheduled: newTask.isScheduled,
          x: newTask.x,
          y: newTask.y,
        }])
        setError(null)
      } else {
        const errorData = await response.json()
        setError(`Erreur: ${errorData.error}`)
      }
    } catch (err) {
      setError('Erreur de connexion')
    }
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
      
      const taskResponse = await fetch('/api/mindmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, isScheduled: true }),
      })
      
      if (!taskResponse.ok) throw new Error('Erreur lors de la mise à jour de la tâche')
      
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

  const handleTaskUpdate = (updatedTasks: NodeData[]) => {
    setTasks(updatedTasks)
    fetchData()
  }

  // Fonction pour rendre le contenu selon la vue active
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            tasks={tasks}
            events={events}
            isSyncing={isSyncing}
            onGoogleSync={handleGoogleSync}
          />
        )
      case 'mindmap':
        return (
          <MindMapView
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
          />
        )
      case 'calendar':
        return (
          <CalendarView
            events={events}
            onSelectEvent={(event) => console.log('Event selected:', event)}
            onSelectSlot={(slot) => console.log('Slot selected:', slot)}
          />
        )
      default:
        return null
    }
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-teal-500 p-1" style={{
        background: 'linear-gradient(135deg, rgb(21, 169, 144) 0%, rgb(17, 94, 89) 100%)'
      }}>
        {/* Main Container - Sans header comme demandé */}
        <main className="bg-teal-500 border-4 border-teal-500 rounded-2xl overflow-hidden h-[calc(100vh-10px)] shadow-inset-custom">
          <div className="flex h-full">
            {/* Sidebar Component */}
            <Sidebar
              activeView={activeView}
              setActiveView={setActiveView}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              tasks={tasks}
              onCreateTestTask={createTestTask}
              setDraggedTask={setDraggedTask}
            />

            {/* Main Content */}
            <div className="flex-1 bg-white">
              {/* Error Message */}
              {error && (
                <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-xs font-medium">!</span>
                    </div>
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <ChevronRight size={14} className="rotate-45" />
                  </button>
                </div>
              )}

              {/* Content Area - Routes */}
              <div className="flex-1 overflow-hidden h-full">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>

        <DragOverlay>
          {draggedTask ? (
            <div className="bg-white border-2 border-teal-500 rounded-lg p-3 shadow-lg opacity-90">
              <h4 className="font-medium text-sm">{draggedTask.title}</h4>
              <p className="text-xs text-gray-600">{draggedTask.description}</p>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}