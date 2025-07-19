"use client";

import MindMapView from "@/components/Dashboard/MindMapView";
import Sidebar from "@/components/Dashboard/Sidebar";
import { CalendarEvent, NodeData } from "@/lib/types";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { Brain, ChevronRight, User } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export default function MindMapPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<NodeData[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<NodeData | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fonction pour charger les données depuis MongoDB
  const fetchData = useCallback(async () => {
    if (session?.user?.email) {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les tâches
        const tasksResponse = await fetch("/api/mindmap");
        if (!tasksResponse.ok)
          throw new Error("Erreur lors du chargement des tâches");
        const tasksData = await tasksResponse.json();

        // Récupérer les événements
        const eventsResponse = await fetch("/api/calendar");
        if (!eventsResponse.ok)
          throw new Error("Erreur lors du chargement des événements");
        const eventsData = await eventsResponse.json();

        // Transformer les données pour correspondre aux interfaces
        const formattedTasks = tasksData.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description || "",
          color: task.color,
          priority: task.priority,
          tags: task.tags || [],
          executionPeriod: task.executionPeriod,
          isScheduled: task.isScheduled,
          x: task.x || 0,
          y: task.y || 0,
        }));

        const formattedEvents = eventsData.map((event: any) => ({
          id: event._id,
          userId: event.userId,
          title: event.title,
          description: event.description || "",
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          mindMapNodeId: event.mindMapNodeId,
          isFromMindMap: event.isFromMindMap,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }));

        setTasks(formattedTasks);
        setEvents(formattedEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        console.error("Erreur lors du chargement des données:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [session?.user?.email]);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-500">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
          <p className="text-white font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-500">
        <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              MindMap Calendar
            </h1>
            <p className="text-gray-600 mt-2">
              Transformez vos idées en tâches planifiées
            </p>
          </div>
          <button
            onClick={() => signIn("google")}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <User size={20} className="mr-2" />
            Se connecter avec Google
          </button>
        </div>
      </div>
    );
  }

  const createTestTask = async () => {
    if (!session?.user?.email) return;

    try {
      const testTask = {
        title: `Tâche test ${Date.now()}`,
        description: "Tâche créée pour tester la sauvegarde MongoDB",
        x: Math.random() * 500,
        y: Math.random() * 500,
        color: "#15a990",
        priority: "medium",
        tags: ["test"],
        isScheduled: false,
        connections: [],
      };

      const response = await fetch("/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testTask),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks((prev) => [
          ...prev,
          {
            id: newTask._id,
            title: newTask.title,
            description: newTask.description || "",
            color: newTask.color,
            priority: newTask.priority,
            tags: newTask.tags || [],
            isScheduled: newTask.isScheduled,
            x: newTask.x,
            y: newTask.y,
          },
        ]);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Erreur: ${errorData.error}`);
      }
    } catch (err) {
      setError("Erreur de connexion");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskData = event.active.data.current as NodeData;
    setDraggedTask(taskData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedTask(null);
    // Logique de drag & drop si nécessaire
  };

  const handleTaskUpdate = (updatedTasks: NodeData[]) => {
    setTasks(updatedTasks);
    fetchData();
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className="min-h-screen bg-teal-500 p-1"
        style={{
          background:
            "linear-gradient(135deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)",
        }}
      >
        {/* Main Container */}
        <main className="bg-teal-500 border-4 border-teal-500 rounded-2xl overflow-hidden h-[calc(100vh-10px)] shadow-inset-custom">
          <div className="flex h-full">
            {/* Sidebar Component */}
            <Sidebar
              activeView="mindmap"
              setActiveView={(view) => {
                if (view === "dashboard") window.location.href = "/dashboard";
                if (view === "calendar") window.location.href = "/calendar";
              }}
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
                      <span className="text-red-600 text-xs font-medium">
                        !
                      </span>
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

              {/* MindMap Content */}
              <div className="flex-1 overflow-hidden h-full">
                <MindMapView tasks={tasks} onTaskUpdate={handleTaskUpdate} />
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
  );
}
